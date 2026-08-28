/**
 * ============================================================================
 * CMMS SIDRAH - AUTOMATION & SCHEDULERS (Scheduler.gs)
 * Handles Google Form submissions, triggers, time-driven schedulers, and weekly digests
 * ============================================================================
 */

/**
 * Triggered automatically when a user submits a Google Form linked to this spreadsheet
 * @param {Object} e Google Apps Script form submit event object
 */
function onFormSubmit(e) {
  try {
    Logger.log('Processing new Form Submission event...');
    
    // Ensure database structure is up to date
    SheetsDB.initDatabase();

    // Event object parsing
    let responses = e ? e.namedValues : null;
    let range = e ? e.range : null;
    let formResponseUrl = '';

    // If running test or manual trigger without event object
    if (!responses && range) {
      const sheet = range.getSheet();
      const rowValues = sheet.getRange(range.getRow(), 1, 1, sheet.getLastColumn()).getValues()[0];
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      responses = {};
      for (let i = 0; i < headers.length; i++) {
        responses[headers[i]] = [rowValues[i]];
      }
    }

    if (!responses) {
      Logger.log('No form response data found in event.');
      return;
    }

    // Extract exact Arabic question values
    const reporter = (responses['اسم المبلغ']?.[0] || responses['اسم المُبلّغ']?.[0] || 'مُبلّغ غير مسجل').trim();
    const reporterPhone = (responses['الهاتف']?.[0] || responses['رقم الهاتف']?.[0] || '').trim();
    const locationName = (responses['اللوكيشن']?.[0] || responses['الموقع']?.[0] || responses['الفرع']?.[0] || '').trim();
    const category = (responses['القسم/نوع العطل']?.[0] || responses['نوع العطل']?.[0] || responses['القسم']?.[0] || 'صيانة عامة').trim();
    const description = (responses['تفاصيل العطل']?.[0] || responses['وصف العطل']?.[0] || '').trim();
    const rawBeforePhoto = (responses['صور قبل الإصلاح']?.[0] || responses['صورة العطل']?.[0] || '').trim();
    const videoUrl = (responses['فيديو']?.[0] || responses['فيديو (اختياري)']?.[0] || '').trim();
    const severityInput = (responses['درجة الخطورة']?.[0] || responses['الخطورة']?.[0] || 'متوسط').trim();

    // Find location ID from location name
    const locations = SheetsDB.getLocations();
    let locationId = 'LOC-00';
    for (let i = 0; i < locations.length; i++) {
      if (locations[i].name === locationName || locationName.includes(locations[i].name) || locations[i].name.includes(locationName)) {
        locationId = locations[i].id;
        break;
      }
    }

    // Auto-generate Work Order ID
    const woId = SheetsDB.generateNextWoId ? SheetsDB.generateNextWoId() : `WO-${new Date().getFullYear()}-${String(new Date().getTime()).slice(-6)}`;

    // Move uploaded files from default Form folder to CMMS/Reports/<WO_ID>/
    let driveBeforePhotoUrl = '';
    if (rawBeforePhoto) {
      driveBeforePhotoUrl = DriveStore.moveFormUploadedFile(woId, rawBeforePhoto, 'before');
    }

    // 1. Initial insert of Work Order into WoHeaders
    const insertRes = SheetsDB.insertWorkOrder({
      wo_id: woId,
      location_id: locationId,
      location_name: locationName,
      reporter: reporter,
      reporter_phone: reporterPhone,
      category: category,
      subcategory: '',
      description: description,
      severity: severityInput === 'عاجل' ? CONFIG.SEVERITIES.URGENT : (severityInput === 'منخفض' ? CONFIG.SEVERITIES.LOW : CONFIG.SEVERITIES.MEDIUM),
      status: CONFIG.STATUSES.REPORTED,
      before_photo: driveBeforePhotoUrl,
      after_photo: '',
      video_url: videoUrl,
      source: 'Google Form',
      form_response_url: formResponseUrl
    });

    Logger.log(`Inserted initial WO record: ${woId}`);

    // 2. Perform Gemini AI Diagnostic Analysis (Text + Photo)
    try {
      const diagResult = Gemini.diagnose(description, driveBeforePhotoUrl, woId);
      
      const updates = {
        gemini_summary: diagResult.summary,
        gemini_json: diagResult.data
      };

      if (diagResult.data.category && diagResult.data.category !== 'صيانة عامة') {
        updates.category = diagResult.data.category;
      }
      if (diagResult.data.subcategory) {
        updates.subcategory = diagResult.data.subcategory;
      }
      if (diagResult.data.severity) {
        updates.severity = diagResult.data.severity;
      }

      SheetsDB.updateWorkOrder(woId, updates);
      Logger.log(`Gemini diagnosis applied to WO ${woId}`);

      // 3. If Severity is URGENT (عاجل), trigger immediate notifications
      const finalWo = SheetsDB.getWorkOrderById(woId);
      if (finalWo && finalWo.severity === CONFIG.SEVERITIES.URGENT) {
        Notify.sendUrgentAlert(finalWo);
      }

    } catch (aiErr) {
      Logger.log(`AI Diagnosis skipped or failed for ${woId}: ${aiErr.message}`);
      // Fallback update to keep state clean
      SheetsDB.updateWorkOrder(woId, {
        gemini_summary: 'التحليل الآلي غير متوفر (فحص فني مطلوب)',
        gemini_json: { status: 'failed', error: aiErr.message }
      });
    }

  } catch (err) {
    Logger.log('Fatal error in onFormSubmit: ' + err.message);
  }
}

/**
 * Time-driven weekly trigger function:
 * 1. Computes recent 7-day stats
 * 2. Calls Gemini for Arabic Markdown executive report
 * 3. Writes row into 'WeeklyDigest' tab
 * 4. Emails report to Maintenance Manager
 */
function weeklyDigest() {
  try {
    Logger.log('Running scheduled Weekly Digest job...');
    
    const stats = SheetsDB.getStats();
    const wos = SheetsDB.getWorkOrders({ limit: 50 });
    
    const geminiRes = Gemini.generateWeeklyDigest(wos.data, stats);
    const markdown = geminiRes.markdown;

    // Append to WeeklyDigest sheet tab
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let digestSheet = ss.getSheetByName(CONFIG.SHEETS.WEEKLY_DIGEST);
    if (!digestSheet) {
      digestSheet = ss.insertSheet(CONFIG.SHEETS.WEEKLY_DIGEST);
      digestSheet.appendRow(['week_start', 'week_end', 'total_wos', 'closed_wos', 'total_cost', 'avg_mttr', 'markdown_summary', 'created_at']);
      digestSheet.setFrozenRows(1);
    }

    const now = new Date();
    const weekStart = new Date(now.getTime() - (7 * 24 * 3600 * 1000));
    
    const weekStartStr = Utilities.formatDate(weekStart, CONFIG.DEFAULTS.TIMEZONE, 'yyyy-MM-dd');
    const weekEndStr = Utilities.formatDate(now, CONFIG.DEFAULTS.TIMEZONE, 'yyyy-MM-dd');
    const createdAtStr = Utilities.formatDate(now, CONFIG.DEFAULTS.TIMEZONE, 'yyyy-MM-dd HH:mm');

    digestSheet.appendRow([
      weekStartStr,
      weekEndStr,
      stats.weeklyCount,
      Math.round(stats.weeklyCount * (stats.completionRate30d / 100)),
      stats.monthCost,
      stats.mttrHours,
      markdown,
      createdAtStr
    ]);

    // Send Email to Manager
    Notify.sendWeeklyDigestEmail(markdown, stats);
    Logger.log('Weekly digest executed and emailed successfully.');

    return { success: true, markdown: markdown };

  } catch (e) {
    Logger.log('Error in weeklyDigest: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Setup helper to automatically install the time-driven and form-submit triggers
 */
function installTriggers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Remove existing triggers to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => ScriptApp.deleteTrigger(t));

  // 2. Form Submit Trigger (From spreadsheet)
  if (ss) {
    ScriptApp.newTrigger('onFormSubmit')
      .forSpreadsheet(ss)
      .onFormSubmit()
      .create();
    Logger.log('Created onFormSubmit trigger for spreadsheet.');
  }

  // 3. Weekly Timer Trigger (Every Monday at 7:00 AM Cairo time)
  ScriptApp.newTrigger('weeklyDigest')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(7)
    .inTimezone(CONFIG.DEFAULTS.TIMEZONE)
    .create();

  Logger.log('Created weeklyDigest timer trigger.');
  return { success: true, message: 'All triggers installed successfully.' };
}
