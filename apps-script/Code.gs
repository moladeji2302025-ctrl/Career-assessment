/**
 * Career Assessment — Google Apps Script Web App
 *
 * Receives POST requests from the Vercel /api/assessments serverless function
 * and appends each submission as a new row in a Google Sheet.
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

/** Name of the sheet tab that receives new rows. Created automatically if absent. */
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

/** Column headers — order must match the row-building logic in doPost(). */
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
);

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
 * Ensures the header row is written on the first run (idempotent).
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 */
function ensureHeader(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADER);
    sheet.getRange(1, 1, 1, HEADER.length).setFontWeight('bold');
  }
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

  // ── Build sheet row ───────────────────────────────────────────────────────
  var scenarioResponses = typeof data.scenarioResponses === 'object' && data.scenarioResponses !== null
    ? data.scenarioResponses
    : {};

  var row = [
    new Date(),
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

  // ── Append row to sheet ───────────────────────────────────────────────────
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    ensureHeader(sheet);
    sheet.appendRow(row);
  } catch (err) {
    return jsonResponse({ ok: false, error: 'Failed to write to sheet: ' + err.message });
  }

  return jsonResponse({ ok: true });
}

/**
 * GET handler — simple health-check / smoke-test.
 * Visit the Web App URL in a browser to confirm the script is deployed.
 */
function doGet() {
  return jsonResponse({ ok: true, message: 'Career Assessment Apps Script is running.' });
}
