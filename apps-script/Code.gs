/**
 * Career Assessment — Google Apps Script Web App
 *
 * Receives POST requests from the Vercel /api/assessments serverless function
 * and does two things per submission:
 *   1. Appends a compact summary row to the master "Responses" tab.
 *   2. Creates a beautifully formatted per-entry tab named after the respondent
 *      and the submission timestamp.
 *
 * ── SETUP ────────────────────────────────────────────────────────────────────
 *
 * 1. Create a new Google Sheet (any name you like, e.g. "Career Responses").
 * 2. In the sheet, open Extensions → Apps Script and paste this entire file.
 * 3. Save (Ctrl + S), then click Deploy → New deployment:
 *      • Type:             Web app
 *      • Execute as:       Me  (your Google account)
 *      • Who has access:   Anyone
 *    Click Deploy and copy the Web App URL.
 * 4. Set the Vercel environment variable:
 *      GOOGLE_SHEETS_WEBHOOK_URL = <your Web App URL>
 * 5. (Recommended) Set a shared secret for lightweight auth:
 *    a. In Apps Script: Project Settings → Script Properties
 *       → Add property SHARED_SECRET = <choose a random string>
 *    b. In Vercel: add env var GOOGLE_SHEETS_SECRET = <same random string>
 * 6. Re-deploy Apps Script after any code changes
 *    (Deploy → Manage deployments → pencil icon → "New version" → Deploy).
 *
 * ── PAYLOAD SHAPE ────────────────────────────────────────────────────────────
 *
 * The script expects the AIAnalysisPayload defined in src/types/assessment.ts:
 * {
 *   respondentName, respondentGroup, organizationDepartment,
 *   schoolProgram?, expectedCompletionDate?,          // IT Student only
 *   programStudied?, degreeRequired?, serviceEndDate?, // NYSC only
 *   careerInterests[], enjoyedSkills[],
 *   workEnvironment, primaryMotivation, biggestStrength,
 *   shortTermGoal, longTermGoal,
 *   scenarioResponses: { [questionId]: selectedValue }
 * }
 * Plus an optional _secret field used for shared-secret validation.
 */

// ─── Configuration ────────────────────────────────────────────────────────────

/** Name of the master sheet tab that receives one summary row per submission. */
var SHEET_NAME = 'Responses';

/**
 * All 20 scenario question IDs in a stable order.
 * Must stay in sync with src/data/scenarioQuestions.ts.
 */
var SCENARIO_KEYS = [
  'sq_problem_solving',
  'sq_team_role',
  'sq_free_saturday',
  'sq_ideal_workday',
  'sq_pride_moment',
  'sq_social_impact',
  'sq_complexity',
  'sq_feedback',
  'sq_communication',
  'sq_risk_tolerance',
  'sq_learning_style',
  'sq_long_term_identity',
  'sq_tools_enjoy',
  'sq_decision_making',
  'sq_energy_drain',
  'sq_side_project',
  'sq_achievement_type',
  'sq_conflict_resolution',
  'sq_new_skill',
  'sq_work_rhythm',
];

/**
 * Column headers for the master Responses tab.
 * Order must match the row-building logic in doPost().
 * "Entry Sheet" is appended last so that existing rows remain aligned.
 */
var HEADER = [
  'Timestamp',
  'Respondent Name',
  'Group',
  'Organization / Department',
  'School Program (IT Student)',
  'Expected Completion Date (IT Student)',
  'Program Studied (NYSC)',
  'Degree Required (NYSC)',
  'Service End Date (NYSC)',
  'Career Interests',
  'Enjoyed Skills',
  'Work Environment',
  'Primary Motivation',
  'Biggest Strength',
  'Short-term Goal (1–2 yrs)',
  'Long-term Goal (5+ yrs)',
].concat(
  SCENARIO_KEYS.map(function (k) {
    return 'Scenario: ' + k;
  })
).concat(['Entry Sheet']);

// ─── Required fields ──────────────────────────────────────────────────────────

var REQUIRED_FIELDS = [
  'respondentName',
  'respondentGroup',
  'organizationDepartment',
  'careerInterests',
  'enjoyedSkills',
  'workEnvironment',
  'primaryMotivation',
  'biggestStrength',
  'shortTermGoal',
  'longTermGoal',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns a JSON ContentService output.
 * @param {Object} obj
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/**
 * Ensures the master Responses header row exists and is up-to-date (idempotent).
 * - If the sheet is empty: writes the full HEADER row.
 * - If the sheet already has rows but fewer columns than HEADER: appends the
 *   missing column headings so old data rows remain correctly aligned.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 */
function ensureHeader(sheet) {
  if (sheet.getLastRow() === 0) {
    // Sheet is empty — write the full header
    var range = sheet.getRange(1, 1, 1, HEADER.length);
    range.setValues([HEADER]);
    range.setFontWeight('bold');
    range.setBackground('#F3F4F6');
  } else {
    // Sheet has rows — extend header if new columns were added (e.g. "Entry Sheet")
    var existingCols = sheet.getLastColumn();
    if (existingCols < HEADER.length) {
      var missingHeaders = HEADER.slice(existingCols);
      var newRange = sheet.getRange(1, existingCols + 1, 1, missingHeaders.length);
      newRange.setValues([missingHeaders]);
      newRange.setFontWeight('bold');
      newRange.setBackground('#F3F4F6');
    }
  }
}

/**
 * Builds a safe, unique Google Sheets tab name from a respondent name and
 * timestamp.  Invalid characters (\ / ? * [ ] :) are stripped; the result is
 * truncated to 50 chars before appending the date suffix; collisions are
 * resolved by appending a numeric counter.
 *
 * @param {string} respondentName
 * @param {Date}   timestamp
 * @returns {string}
 */
function makeSafeSheetName(respondentName, timestamp) {
  var dateSuffix = Utilities.formatDate(
    timestamp,
    Session.getScriptTimeZone(),
    'yyyyMMdd_HHmmss'
  );
  // Strip characters that Google Sheets forbids in tab names
  var safeName = (respondentName || 'Unknown')
    .replace(/[:\\\/\?\*\[\]]/g, '')
    .trim()
    .substring(0, 50);
  var candidate = safeName + '_' + dateSuffix;

  // Resolve collisions (extremely rare, but safe to handle)
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var base = candidate;
  var counter = 2;
  while (ss.getSheetByName(candidate) !== null) {
    candidate = base + '_' + counter;
    counter++;
  }
  return candidate;
}

/**
 * Creates a formatted per-submission sheet tab and returns its name.
 *
 * Layout (all in columns A–B):
 *   Row  1 : Title banner "CAREER ASSESSMENT RESPONSE"
 *   Row  2 : Submitted timestamp
 *   Row  3 : (blank separator)
 *   Row  4 : Section — RESPONDENT INFORMATION
 *   Rows 5–7  : Name · Group · Org/Dept
 *   Row  8 : (blank)
 *   Row  9 : Section — PROGRAM-SPECIFIC INFORMATION
 *   Rows 10–14 : IT Student / NYSC fields
 *   Row 15 : (blank)
 *   Row 16 : Section — CORE ASSESSMENT
 *   Rows 17–23 : Career interests → long-term goal
 *   Row 24 : (blank)
 *   Row 25 : Section — SCENARIO RESPONSES
 *   Row 26 : Sub-header (Question ID | Response)
 *   Rows 27–46 : one row per scenario key (alternating background)
 *   Row 47 : (blank)
 *   Row 48 : Section — SUBMISSION SUMMARY
 *   Rows 49–51 : total / answered / completeness %
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {Object} data              Parsed JSON payload
 * @param {Date}   timestamp         Shared timestamp (same as master row)
 * @param {Object} scenarioResponses Resolved scenario map
 * @returns {string} The name of the newly created sheet tab
 */
function createEntrySheet(ss, data, timestamp, scenarioResponses) {
  var sheetName = makeSafeSheetName(String(data.respondentName), timestamp);
  var sheet = ss.insertSheet(sheetName);

  // ── Pre-compute display values ───────────────────────────────────────────
  var careerInterests = Array.isArray(data.careerInterests)
    ? data.careerInterests.join(', ')
    : String(data.careerInterests || '');
  var enjoyedSkills = Array.isArray(data.enjoyedSkills)
    ? data.enjoyedSkills.join(', ')
    : String(data.enjoyedSkills || '');
  var tsString = Utilities.formatDate(
    timestamp,
    Session.getScriptTimeZone(),
    'MMMM d, yyyy  HH:mm:ss z'
  );
  var answeredCount = SCENARIO_KEYS.reduce(function (n, k) {
    return n + (scenarioResponses[k] ? 1 : 0);
  }, 0);
  var completeness = Math.round((answeredCount / SCENARIO_KEYS.length) * 100) + '%';

  // ── Build the full data grid (51 rows × 2 columns) ───────────────────────
  // Each entry is [columnA, columnB].  Empty rows act as visual separators.
  var grid = [
    /* 1  */ ['CAREER ASSESSMENT RESPONSE', ''],
    /* 2  */ ['Submitted: ' + tsString, ''],
    /* 3  */ ['', ''],
    /* 4  */ ['RESPONDENT INFORMATION', ''],
    /* 5  */ ['Name', String(data.respondentName)],
    /* 6  */ ['Group', String(data.respondentGroup)],
    /* 7  */ ['Organization / Department', String(data.organizationDepartment)],
    /* 8  */ ['', ''],
    /* 9  */ ['PROGRAM-SPECIFIC INFORMATION', ''],
    /* 10 */ ['School Program (IT Student)', data.schoolProgram ? String(data.schoolProgram) : '—'],
    /* 11 */ ['Expected Completion Date (IT)', data.expectedCompletionDate ? String(data.expectedCompletionDate) : '—'],
    /* 12 */ ['Program Studied (NYSC)', data.programStudied ? String(data.programStudied) : '—'],
    /* 13 */ ['Degree Required (NYSC)', data.degreeRequired ? String(data.degreeRequired) : '—'],
    /* 14 */ ['Service End Date (NYSC)', data.serviceEndDate ? String(data.serviceEndDate) : '—'],
    /* 15 */ ['', ''],
    /* 16 */ ['CORE ASSESSMENT', ''],
    /* 17 */ ['Career Interests', careerInterests],
    /* 18 */ ['Enjoyed Skills', enjoyedSkills],
    /* 19 */ ['Work Environment', String(data.workEnvironment)],
    /* 20 */ ['Primary Motivation', String(data.primaryMotivation)],
    /* 21 */ ['Biggest Strength', String(data.biggestStrength)],
    /* 22 */ ['Short-term Goal (1–2 yrs)', String(data.shortTermGoal)],
    /* 23 */ ['Long-term Goal (5+ yrs)', String(data.longTermGoal)],
    /* 24 */ ['', ''],
    /* 25 */ ['SCENARIO RESPONSES', ''],
    /* 26 */ ['Question ID', 'Response'],
  ];

  // Rows 27–46: one row per scenario key
  SCENARIO_KEYS.forEach(function (k) {
    grid.push([k, scenarioResponses[k] ? String(scenarioResponses[k]) : '—']);
  });

  // Rows 47–51: separator + summary
  grid.push(
    /* 47 */ ['', ''],
    /* 48 */ ['SUBMISSION SUMMARY', ''],
    /* 49 */ ['Total Scenario Questions', SCENARIO_KEYS.length],
    /* 50 */ ['Scenarios Answered', answeredCount],
    /* 51 */ ['Completeness', completeness]
  );

  // Write all data in a single batch call for efficiency
  sheet.getRange(1, 1, grid.length, 2).setValues(grid);

  // ── Column widths & row heights ──────────────────────────────────────────
  sheet.setColumnWidth(1, 230);
  sheet.setColumnWidth(2, 400);
  sheet.setRowHeight(1, 42); // Title row slightly taller

  // Enable text wrapping for all cells so long answers display properly
  sheet.getRange(1, 1, grid.length, 2).setWrap(true);

  // ── Merge A:B for title, subtitle, and all section headers ───────────────
  var mergeRows = [1, 2, 4, 9, 16, 25, 48];
  mergeRows.forEach(function (r) {
    sheet.getRange(r, 1, 1, 2).merge();
  });

  // ── Title banner (row 1) ─────────────────────────────────────────────────
  var titleRange = sheet.getRange(1, 1);
  titleRange.setBackground('#1A73E8');
  titleRange.setFontColor('#FFFFFF');
  titleRange.setFontSize(16);
  titleRange.setFontWeight('bold');
  titleRange.setHorizontalAlignment('center');
  titleRange.setVerticalAlignment('middle');

  // ── Subtitle / timestamp (row 2) ─────────────────────────────────────────
  var subtitleRange = sheet.getRange(2, 1);
  subtitleRange.setBackground('#4285F4');
  subtitleRange.setFontColor('#FFFFFF');
  subtitleRange.setFontStyle('italic');
  subtitleRange.setHorizontalAlignment('center');

  // ── Section header rows ───────────────────────────────────────────────────
  var sectionRows = [4, 9, 16, 25, 48];
  sectionRows.forEach(function (r) {
    var secRange = sheet.getRange(r, 1);
    secRange.setBackground('#E8F0FE');
    secRange.setFontColor('#1A73E8');
    secRange.setFontWeight('bold');
    secRange.setFontSize(11);
    secRange.setBorder(
      true, true, true, true, false, false,
      '#1A73E8', SpreadsheetApp.BorderStyle.SOLID_MEDIUM
    );
  });

  // ── Scenario sub-header (row 26) ─────────────────────────────────────────
  var subHdrRange = sheet.getRange(26, 1, 1, 2);
  subHdrRange.setBackground('#D2E3FC');
  subHdrRange.setFontWeight('bold');
  subHdrRange.setBorder(
    true, true, true, true, false, false,
    '#1A73E8', SpreadsheetApp.BorderStyle.SOLID
  );

  // ── Label cells (column A) — bold + light-gray background ────────────────
  // Respondent, Program, Core, and Summary data rows
  [
    sheet.getRange(5, 1, 3, 1),   // Respondent rows 5–7
    sheet.getRange(10, 1, 5, 1),  // Program rows 10–14
    sheet.getRange(17, 1, 7, 1),  // Core rows 17–23
    sheet.getRange(49, 1, 3, 1),  // Summary rows 49–51
  ].forEach(function (r) {
    r.setFontWeight('bold');
    r.setBackground('#F8F9FA');
  });

  // ── Alternating row colors for the 20 scenario rows (27–46) ──────────────
  for (var i = 0; i < SCENARIO_KEYS.length; i++) {
    var rowNum = 27 + i;
    sheet.getRange(rowNum, 1, 1, 2).setBackground(i % 2 === 0 ? '#FFFFFF' : '#F1F3F4');
  }

  // ── Borders around each section block ────────────────────────────────────
  var borderColor = '#DADCE0';
  var borderStyle = SpreadsheetApp.BorderStyle.SOLID;
  sheet.getRange(4, 1, 4, 2).setBorder(true, true, true, true, false, false, borderColor, borderStyle);
  sheet.getRange(9, 1, 6, 2).setBorder(true, true, true, true, false, false, borderColor, borderStyle);
  sheet.getRange(16, 1, 8, 2).setBorder(true, true, true, true, false, false, borderColor, borderStyle);
  sheet.getRange(25, 1, SCENARIO_KEYS.length + 2, 2).setBorder(true, true, true, true, false, false, borderColor, borderStyle);
  sheet.getRange(48, 1, 4, 2).setBorder(true, true, true, true, false, false, borderColor, borderStyle);

  // ── Freeze the title row so it stays visible while scrolling ─────────────
  sheet.setFrozenRows(1);

  return sheetName;
}

// ─── HTTP handlers ────────────────────────────────────────────────────────────

/**
 * POST handler — called by the Vercel serverless function.
 * @param {GoogleAppsScript.Events.DoPost} e
 */
function doPost(e) {
  // ── Parse JSON body ───────────────────────────────────────────────────────
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (_) {
    return jsonResponse({ ok: false, error: 'Invalid JSON body.' });
  }

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return jsonResponse({ ok: false, error: 'Payload must be a JSON object.' });
  }

  // ── Optional shared-secret check ──────────────────────────────────────────
  var expectedSecret = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
  if (expectedSecret) {
    var providedSecret = typeof data._secret === 'string' ? data._secret : '';
    if (providedSecret !== expectedSecret) {
      return jsonResponse({ ok: false, error: 'Unauthorized.' });
    }
  }

  // ── Validate required fields ──────────────────────────────────────────────
  for (var i = 0; i < REQUIRED_FIELDS.length; i++) {
    var field = REQUIRED_FIELDS[i];
    var value = data[field];
    if (value === undefined || value === null || value === '') {
      return jsonResponse({ ok: false, error: 'Missing required field: ' + field });
    }
  }

  // ── Single timestamp — shared by both master row and entry tab ───────────
  var now = new Date();

  var scenarioResponses =
    typeof data.scenarioResponses === 'object' && data.scenarioResponses !== null
      ? data.scenarioResponses
      : {};

  // ── Build master-sheet row (Entry Sheet name appended after scenario cols) ─
  var row = [
    now,
    String(data.respondentName),
    String(data.respondentGroup),
    String(data.organizationDepartment),
    data.schoolProgram           ? String(data.schoolProgram)           : '',
    data.expectedCompletionDate  ? String(data.expectedCompletionDate)  : '',
    data.programStudied          ? String(data.programStudied)          : '',
    data.degreeRequired          ? String(data.degreeRequired)          : '',
    data.serviceEndDate          ? String(data.serviceEndDate)          : '',
    Array.isArray(data.careerInterests) ? data.careerInterests.join(', ') : '',
    Array.isArray(data.enjoyedSkills)   ? data.enjoyedSkills.join(', ')   : '',
    String(data.workEnvironment),
    String(data.primaryMotivation),
    String(data.biggestStrength),
    String(data.shortTermGoal),
    String(data.longTermGoal),
  ].concat(
    SCENARIO_KEYS.map(function (k) {
      return scenarioResponses[k] ? String(scenarioResponses[k]) : '';
    })
  );

  // ── Write to spreadsheet ──────────────────────────────────────────────────
  var entrySheetName = '';
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Create the per-entry formatted tab (attempt; don't block on failure)
    try {
      entrySheetName = createEntrySheet(ss, data, now, scenarioResponses);
    } catch (entryErr) {
      console.error('Entry sheet creation failed: ' + entryErr.message);
    }

    // 2. Append to the master Responses tab
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    ensureHeader(sheet);
    row.push(entrySheetName); // Last column: reference to per-entry tab
    sheet.appendRow(row);

  } catch (err) {
    return jsonResponse({ ok: false, error: 'Failed to write to sheet: ' + err.message });
  }

  return jsonResponse({ ok: true, entrySheet: entrySheetName });
}

/**
 * GET handler — simple health-check / smoke-test.
 * Visit the Web App URL in a browser to confirm the script is deployed.
 */
function doGet() {
  return jsonResponse({ ok: true, message: 'Career Assessment Apps Script is running.' });
}
