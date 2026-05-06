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
 * Creates a styled per-submission sheet tab that matches a card-like report
 * layout and returns its name.
 *
 * Sections (all in columns A–B):
 *   Banner rows  : Title + submitted timestamp
 *   Card 1       : PERSONAL — full name
 *   Card 2       : GROUP — selected group
 *   Card 3       : ORGANISATION PLACEMENT — department
 *   Card 4       : NYSC CORP MEMBER DETAILS *or* IT STUDENT DETAILS
 *                  (omitted when neither group type is detected)
 *   Card 5       : INTERESTS & SKILLS — 7 assessment fields
 *   Card 6       : SCENARIO RESPONSES — one row per scenario key
 *   Card 7       : SUBMISSION SUMMARY — totals & completeness
 *
 * Section headers use a dark-navy background with white bold text; data rows
 * use a light label background (col A) and white value background (col B),
 * with muted-blue label text and dark-navy value text — matching the
 * card-report screenshot.
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

  // ── Determine programme section based on group ───────────────────────────
  var groupLower = String(data.respondentGroup || '').toLowerCase();
  var isNYSC = groupLower.indexOf('nysc') !== -1;
  var isITStudent = !isNYSC && (
    groupLower.indexOf('it student') !== -1 ||
    groupLower.indexOf('it intern') !== -1 ||
    groupLower.indexOf('student') !== -1
  );

  // ── Build dynamic grid ───────────────────────────────────────────────────
  // Each element is [colA, colB]. Row numbers are tracked as we push.
  var grid = [];

  // Structural metadata collected while building the grid
  var mergeRowList = [];       // rows where A:B should be fully merged
  var sectionHdrRowList = [];  // rows that receive dark-navy section header style
  var personalDataRow, groupDataRow, orgDataRow;
  var progHdrRow, progDataRows = [];
  var interestsHdrRow, interestsDataStart, interestsDataEnd;
  var scenHdrRow, scenSubHdrRow, scenDataStart;
  var summaryHdrRow, summaryDataStart;

  /** Push one [colA, colB] row and return its 1-based row number. */
  function push(a, b) {
    grid.push([a !== undefined ? a : '', b !== undefined ? b : '']);
    return grid.length;
  }

  // ── Banner ───────────────────────────────────────────────────────────────
  push('CAREER ASSESSMENT', '');                // row 1 — title
  mergeRowList.push(1);
  push('Submitted: ' + tsString, '');           // row 2 — timestamp
  mergeRowList.push(2);
  push('', '');                                 // row 3 — blank gap
  mergeRowList.push(3);

  // ── PERSONAL card ────────────────────────────────────────────────────────
  push('PERSONAL', '');
  sectionHdrRowList.push(grid.length); mergeRowList.push(grid.length);
  personalDataRow = push('Full name', String(data.respondentName));
  push('', ''); mergeRowList.push(grid.length);

  // ── GROUP card ───────────────────────────────────────────────────────────
  push('GROUP', '');
  sectionHdrRowList.push(grid.length); mergeRowList.push(grid.length);
  groupDataRow = push('Selected group', String(data.respondentGroup));
  push('', ''); mergeRowList.push(grid.length);

  // ── ORGANISATION PLACEMENT card ──────────────────────────────────────────
  push('ORGANISATION PLACEMENT', '');
  sectionHdrRowList.push(grid.length); mergeRowList.push(grid.length);
  orgDataRow = push('Department posted to', String(data.organizationDepartment));
  push('', ''); mergeRowList.push(grid.length);

  // ── Programme card (shown only for known group types) ────────────────────
  if (isNYSC) {
    push('NYSC CORP MEMBER DETAILS', '');
    progHdrRow = grid.length; sectionHdrRowList.push(progHdrRow); mergeRowList.push(progHdrRow);
    progDataRows.push(push('Programme studied', data.programStudied ? String(data.programStudied) : '\u2014'));
    progDataRows.push(push('Degree required',   data.degreeRequired ? String(data.degreeRequired) : '\u2014'));
    progDataRows.push(push('Service end date',  data.serviceEndDate ? String(data.serviceEndDate) : '\u2014'));
    push('', ''); mergeRowList.push(grid.length);
  } else if (isITStudent) {
    push('IT STUDENT DETAILS', '');
    progHdrRow = grid.length; sectionHdrRowList.push(progHdrRow); mergeRowList.push(progHdrRow);
    progDataRows.push(push('School programme',          data.schoolProgram ? String(data.schoolProgram) : '\u2014'));
    progDataRows.push(push('Expected completion date',  data.expectedCompletionDate ? String(data.expectedCompletionDate) : '\u2014'));
    push('', ''); mergeRowList.push(grid.length);
  }

  // ── INTERESTS & SKILLS card ──────────────────────────────────────────────
  push('INTERESTS & SKILLS', '');
  interestsHdrRow = grid.length; sectionHdrRowList.push(interestsHdrRow); mergeRowList.push(interestsHdrRow);
  interestsDataStart = grid.length + 1;
  push('Career interests',            careerInterests);
  push('Enjoyed skills',              enjoyedSkills);
  push('Work environment preference', String(data.workEnvironment));
  push('Primary motivation',          String(data.primaryMotivation));
  push('Biggest strength',            String(data.biggestStrength));
  push('Short-term goal (1\u20132 yrs)', String(data.shortTermGoal));
  interestsDataEnd = push('Long-term goal (5+ yrs)', String(data.longTermGoal));
  push('', ''); mergeRowList.push(grid.length);

  // ── SCENARIO RESPONSES card ──────────────────────────────────────────────
  push('SCENARIO RESPONSES', '');
  scenHdrRow = grid.length; sectionHdrRowList.push(scenHdrRow); mergeRowList.push(scenHdrRow);
  scenSubHdrRow = push('Scenario', 'Response');
  scenDataStart = grid.length + 1;
  SCENARIO_KEYS.forEach(function (k) {
    push(k, scenarioResponses[k] ? String(scenarioResponses[k]) : '\u2014');
  });
  push('', ''); mergeRowList.push(grid.length);

  // ── SUBMISSION SUMMARY card ──────────────────────────────────────────────
  push('SUBMISSION SUMMARY', '');
  summaryHdrRow = grid.length; sectionHdrRowList.push(summaryHdrRow); mergeRowList.push(summaryHdrRow);
  summaryDataStart = grid.length + 1;
  push('Total Scenario Questions', SCENARIO_KEYS.length);
  push('Scenarios Answered',       answeredCount);
  push('Completeness',             completeness);

  var totalRows = grid.length;

  // ── Write all data in one batch ───────────────────────────────────────────
  sheet.getRange(1, 1, totalRows, 2).setValues(grid);

  // ── Column widths ─────────────────────────────────────────────────────────
  sheet.setColumnWidth(1, 260);
  sheet.setColumnWidth(2, 420);

  // ── Wrap all cells ────────────────────────────────────────────────────────
  sheet.getRange(1, 1, totalRows, 2).setWrap(true);

  // ── Merge designated rows (A:B) ───────────────────────────────────────────
  mergeRowList.forEach(function (r) {
    sheet.getRange(r, 1, 1, 2).merge();
  });

  // ── Colour palette ────────────────────────────────────────────────────────
  var darkNavy    = '#1E3A5F';   // section header background
  var navyDark2   = '#162D4A';   // title banner background (slightly darker)
  var navyDark3   = '#243B55';   // timestamp row background
  var white       = '#FFFFFF';
  var labelBg     = '#F7F9FC';   // light off-white for label cells
  var labelColor  = '#546E8A';   // muted blue-gray for label text
  var valueColor  = '#1E3A5F';   // dark navy for value text
  var subHdrBg    = '#D2E3FC';   // light-blue sub-header for scenario column labels
  var subHdrColor = '#1558B0';
  var borderGray  = '#DADCE0';   // inner grid lines
  var solid       = SpreadsheetApp.BorderStyle.SOLID;
  var solidMedium = SpreadsheetApp.BorderStyle.SOLID_MEDIUM;

  // ── Title banner (row 1) ──────────────────────────────────────────────────
  var titleCell = sheet.getRange(1, 1);
  titleCell.setBackground(navyDark2);
  titleCell.setFontColor(white);
  titleCell.setFontSize(16);
  titleCell.setFontWeight('bold');
  titleCell.setHorizontalAlignment('center');
  titleCell.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 52);

  // ── Timestamp row (row 2) ─────────────────────────────────────────────────
  var tsCell = sheet.getRange(2, 1);
  tsCell.setBackground(navyDark3);
  tsCell.setFontColor('#A8C7FA');
  tsCell.setFontStyle('italic');
  tsCell.setFontSize(10);
  tsCell.setHorizontalAlignment('center');
  tsCell.setVerticalAlignment('middle');
  sheet.setRowHeight(2, 26);

  // ── Section header rows (dark-navy with white bold text) ──────────────────
  sectionHdrRowList.forEach(function (r) {
    var hdrCell = sheet.getRange(r, 1);
    hdrCell.setBackground(darkNavy);
    hdrCell.setFontColor(white);
    hdrCell.setFontWeight('bold');
    hdrCell.setFontSize(10);
    hdrCell.setHorizontalAlignment('left');
    hdrCell.setVerticalAlignment('middle');
    sheet.setRowHeight(r, 30);
  });

  // ── Scenario sub-header (Scenario | Response column labels) ───────────────
  var scenSubRange = sheet.getRange(scenSubHdrRow, 1, 1, 2);
  scenSubRange.setBackground(subHdrBg);
  scenSubRange.setFontColor(subHdrColor);
  scenSubRange.setFontWeight('bold');

  // ── Helper: apply label/value styling to a single data row ────────────────
  function styleDataRow(r) {
    sheet.getRange(r, 1).setBackground(labelBg).setFontColor(labelColor);
    sheet.getRange(r, 2).setBackground(white).setFontColor(valueColor);
  }

  // Single-row cards: Personal, Group, Organisation
  [personalDataRow, groupDataRow, orgDataRow].forEach(styleDataRow);

  // Programme section data rows
  progDataRows.forEach(styleDataRow);

  // Interests & Skills data rows
  for (var i = interestsDataStart; i <= interestsDataEnd; i++) {
    styleDataRow(i);
  }

  // Scenario data rows (alternating row shading)
  for (var j = 0; j < SCENARIO_KEYS.length; j++) {
    var scRow = scenDataStart + j;
    var scBg = j % 2 === 0 ? white : '#F8F9FA';
    sheet.getRange(scRow, 1).setBackground(scBg).setFontColor(labelColor);
    sheet.getRange(scRow, 2).setBackground(scBg).setFontColor(valueColor);
  }

  // Submission Summary data rows
  for (var k = summaryDataStart; k < summaryDataStart + 3; k++) {
    styleDataRow(k);
  }

  // ── Borders: each card gets a solid dark-navy outer box + inner grid ───────
  /**
   * Applies a card-style border to a block of rows:
   *   • Outer box  : dark-navy medium border on all four sides.
   *   • Inner rows : light-gray SOLID horizontal lines between rows.
   *   • Inner col  : light-gray SOLID vertical line between A and B.
   * @param {number} startRow  First row (1-based).
   * @param {number} numRows   Number of rows in the block.
   */
  function setBorderedCard(startRow, numRows) {
    var range = sheet.getRange(startRow, 1, numRows, 2);
    range.setBorder(true, true, true, true, false, false, darkNavy, solidMedium);
    range.setBorder(false, false, false, false, false, true, borderGray, solid);
    range.setBorder(false, false, false, false, true, false, borderGray, solid);
  }

  // PERSONAL card  : section header + 1 data row
  setBorderedCard(sectionHdrRowList[0], 2);
  // GROUP card     : section header + 1 data row
  setBorderedCard(sectionHdrRowList[1], 2);
  // ORGANISATION card : section header + 1 data row
  setBorderedCard(sectionHdrRowList[2], 2);

  // Programme card (dynamic height) and subsequent section indices
  var sIdx = 3;
  if (progHdrRow) {
    setBorderedCard(progHdrRow, 1 + progDataRows.length);
    sIdx = 4;
  }

  // INTERESTS & SKILLS card: header row + all data rows
  var interestsNumRows = interestsDataEnd - interestsDataStart + 2;
  setBorderedCard(sectionHdrRowList[sIdx], interestsNumRows);

  // SCENARIO RESPONSES card: header + sub-header row + 20 data rows
  setBorderedCard(sectionHdrRowList[sIdx + 1], 2 + SCENARIO_KEYS.length);

  // SUBMISSION SUMMARY card: header + 3 data rows
  setBorderedCard(sectionHdrRowList[sIdx + 2], 4);

  // ── Freeze the title row ──────────────────────────────────────────────────
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
