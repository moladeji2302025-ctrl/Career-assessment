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
 * timestamp.  Invalid characters (\ / ? * [ ] :) are stripped; the name part is
 * truncated to 40 chars before appending a human-readable date suffix; collisions
 * are resolved by appending a numeric counter.
 *
 * Example output: "John Doe — 15 Jan 2024 14-30"
 *
 * @param {string} respondentName
 * @param {Date}   timestamp
 * @returns {string}
 */
function makeSafeSheetName(respondentName, timestamp) {
  // Colons are forbidden in Google Sheets tab names, so use hyphens for HH-mm.
  var dateSuffix = Utilities.formatDate(
    timestamp,
    Session.getScriptTimeZone(),
    'dd MMM yyyy HH-mm'
  );
  // Strip characters that Google Sheets forbids in tab names
  var safeName = (respondentName || 'Unknown')
    .replace(/[:\\\/\?\*\[\]]/g, '')
    .trim()
    .substring(0, 40);
  // \u2014 = em dash — gives a readable "Name — Date" format
  var candidate = safeName + ' \u2014 ' + dateSuffix;

  // Resolve collisions (extremely rare, but safe to handle)
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var base = candidate;
  var counter = 2;
  while (ss.getSheetByName(candidate) !== null) {
    candidate = base + ' (' + counter + ')';
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
 *   Row  5 : Sub-header (Field | Value)
 *   Rows 6–8  : Name · Group · Org/Dept
 *   Row  9 : (blank)
 *   Row 10 : Section — PROGRAM-SPECIFIC INFORMATION
 *   Row 11 : Sub-header (Field | Value)
 *   Rows 12–16 : IT Student / NYSC fields
 *   Row 17 : (blank)
 *   Row 18 : Section — CORE ASSESSMENT
 *   Row 19 : Sub-header (Field | Value)
 *   Rows 20–26 : Career interests → long-term goal
 *   Row 27 : (blank)
 *   Row 28 : Section — SCENARIO RESPONSES
 *   Row 29 : Sub-header (Question ID | Response)
 *   Rows 30–49 : one row per scenario key (alternating background)
 *   Row 50 : (blank)
 *   Row 51 : Section — SUBMISSION SUMMARY
 *   Row 52 : Sub-header (Metric | Value)
 *   Rows 53–55 : total / answered / completeness %
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
  var completeness = SCENARIO_KEYS.length > 0
    ? Math.round((answeredCount / SCENARIO_KEYS.length) * 100) + '%'
    : 'N/A';

  // ── Build the full data grid (55 rows × 2 columns) ───────────────────────
  // Each entry is [columnA, columnB].  Empty rows act as visual separators.
  var grid = [
    /* 1  */ ['CAREER ASSESSMENT RESPONSE', ''],
    /* 2  */ ['Submitted: ' + tsString, ''],
    /* 3  */ ['', ''],
    /* 4  */ ['RESPONDENT INFORMATION', ''],
    /* 5  */ ['Field', 'Value'],
    /* 6  */ ['Name', String(data.respondentName)],
    /* 7  */ ['Group', String(data.respondentGroup)],
    /* 8  */ ['Organization / Department', String(data.organizationDepartment)],
    /* 9  */ ['', ''],
    /* 10 */ ['PROGRAM-SPECIFIC INFORMATION', ''],
    /* 11 */ ['Field', 'Value'],
    /* 12 */ ['School Program (IT Student)', data.schoolProgram ? String(data.schoolProgram) : '—'],
    /* 13 */ ['Expected Completion Date (IT)', data.expectedCompletionDate ? String(data.expectedCompletionDate) : '—'],
    /* 14 */ ['Program Studied (NYSC)', data.programStudied ? String(data.programStudied) : '—'],
    /* 15 */ ['Degree Required (NYSC)', data.degreeRequired ? String(data.degreeRequired) : '—'],
    /* 16 */ ['Service End Date (NYSC)', data.serviceEndDate ? String(data.serviceEndDate) : '—'],
    /* 17 */ ['', ''],
    /* 18 */ ['CORE ASSESSMENT', ''],
    /* 19 */ ['Field', 'Value'],
    /* 20 */ ['Career Interests', careerInterests],
    /* 21 */ ['Enjoyed Skills', enjoyedSkills],
    /* 22 */ ['Work Environment', String(data.workEnvironment)],
    /* 23 */ ['Primary Motivation', String(data.primaryMotivation)],
    /* 24 */ ['Biggest Strength', String(data.biggestStrength)],
    /* 25 */ ['Short-term Goal (1–2 yrs)', String(data.shortTermGoal)],
    /* 26 */ ['Long-term Goal (5+ yrs)', String(data.longTermGoal)],
    /* 27 */ ['', ''],
    /* 28 */ ['SCENARIO RESPONSES', ''],
    /* 29 */ ['Question ID', 'Response'],
  ];

  // Rows 30–49: one row per scenario key
  SCENARIO_KEYS.forEach(function (k) {
    grid.push([k, scenarioResponses[k] ? String(scenarioResponses[k]) : '—']);
  });

  // Rows 50–55: separator + summary
  grid.push(
    /* 50 */ ['', ''],
    /* 51 */ ['SUBMISSION SUMMARY', ''],
    /* 52 */ ['Metric', 'Value'],
    /* 53 */ ['Total Scenario Questions', SCENARIO_KEYS.length],
    /* 54 */ ['Scenarios Answered', answeredCount],
    /* 55 */ ['Completeness', completeness]
  );

  // Write all data in a single batch call for efficiency
  sheet.getRange(1, 1, grid.length, 2).setValues(grid);

  // ── Column widths & row heights ──────────────────────────────────────────
  sheet.setColumnWidth(1, 240);
  sheet.setColumnWidth(2, 420);
  sheet.setRowHeight(1, 48); // Taller than the default (~21 px) to give the banner visual weight

  // Enable text wrapping for all cells so long answers display properly
  sheet.getRange(1, 1, grid.length, 2).setWrap(true);

  // ── Merge A:B for title, subtitle, and all section headers ───────────────
  [1, 2, 4, 10, 18, 28, 51].forEach(function (r) {
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
  [4, 10, 18, 28, 51].forEach(function (r) {
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

  // ── Sub-header rows — "Field | Value" style for all sections ─────────────
  [5, 11, 19, 29, 52].forEach(function (r) {
    var subHdrRange = sheet.getRange(r, 1, 1, 2);
    subHdrRange.setBackground('#D2E3FC');
    subHdrRange.setFontWeight('bold');
    subHdrRange.setFontColor('#1A73E8');
    subHdrRange.setBorder(
      true, true, true, true, true, false,
      '#1A73E8', SpreadsheetApp.BorderStyle.SOLID
    );
  });

  // ── Label cells (column A) — bold + light-gray background ────────────────
  // Respondent, Program, Core, and Summary data rows
  [
    sheet.getRange(6, 1, 3, 1),   // Respondent rows 6–8
    sheet.getRange(12, 1, 5, 1),  // Program rows 12–16
    sheet.getRange(20, 1, 7, 1),  // Core rows 20–26
    sheet.getRange(53, 1, 3, 1),  // Summary rows 53–55
  ].forEach(function (r) {
    r.setFontWeight('bold');
    r.setBackground('#F8F9FA');
  });

  // ── Alternating row colors for the 20 scenario rows (30–49) ──────────────
  for (var i = 0; i < SCENARIO_KEYS.length; i++) {
    var rowNum = 30 + i;
    sheet.getRange(rowNum, 1, 1, 2).setBackground(i % 2 === 0 ? '#FFFFFF' : '#F1F3F4');
  }

  // ── Bordered tables: outer box (medium blue) + inner grid (light gray) ────
  var outerColor = '#1A73E8';
  var innerColor = '#DADCE0';
  var solidMedium = SpreadsheetApp.BorderStyle.SOLID_MEDIUM;
  var solid = SpreadsheetApp.BorderStyle.SOLID;

  /**
   * Applies a fully-bordered table style to a two-column block of rows:
   *   • Outer box: medium-weight blue line on all four sides.
   *   • Inner horizontal lines: light-gray SOLID between every row.
   *   • Inner vertical line: light-gray SOLID between columns A and B.
   * @param {number} startRow  First row of the section (1-based).
   * @param {number} numRows   Total number of rows in the section.
   */
  function setBorderedTable(startRow, numRows) {
    var range = sheet.getRange(startRow, 1, numRows, 2);
    // Outer box — medium blue
    range.setBorder(true, true, true, true, false, false, outerColor, solidMedium);
    // Inner horizontal lines between rows
    range.setBorder(false, false, false, false, false, true, innerColor, solid);
    // Inner vertical line between columns
    range.setBorder(false, false, false, false, true, false, innerColor, solid);
  }

  // Respondent section: header row 4 + sub-header row 5 + 3 data rows 6–8
  setBorderedTable(4, 5);
  // Program section: header row 10 + sub-header row 11 + 5 data rows 12–16
  setBorderedTable(10, 7);
  // Core section: header row 18 + sub-header row 19 + 7 data rows 20–26
  setBorderedTable(18, 9);
  // Scenario section: header row 28 + sub-header row 29 + 20 data rows 30–49
  setBorderedTable(28, 22);
  // Summary section: header row 51 + sub-header row 52 + 3 data rows 53–55
  setBorderedTable(51, 5);

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
