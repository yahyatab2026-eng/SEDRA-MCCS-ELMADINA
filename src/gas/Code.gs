/**
 * ============================================================================
 * CMMS SIDRAH - MAIN CONTROLLER & ROUTER (Code.gs)
 * Single-Page Web App Controller & JSON REST API Router on Google Apps Script
 * ============================================================================
 */

/**
 * Handles all HTTP GET requests:
 * 1. Web App HTML delivery (?page=dashboard | ?page=visit | ?page=admin)
 * 2. JSON API endpoints (action=listWos | getWo | listLocations | listTechnicians | stats | visitsByTech | aiWeekly)
 */
function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = params.action;
    const page = (params.page || 'dashboard').toLowerCase();

    // ------------------------------------------------------------------------
    // A. JSON REST API DISPATCHER
    // ------------------------------------------------------------------------
    if (action) {
      return handleApiGetAction(action, params);
    }

    // ------------------------------------------------------------------------
    // B. HTML WEB APP PAGES DISPATCHER
    // ------------------------------------------------------------------------
    let templateName = 'Dashboard';
    let pageTitle = 'لوحة تحكم الصيانة | شركة سيدره';

    if (page === 'visit' || page === 'technician') {
      templateName = 'VisitForm';
      pageTitle = 'نموذج زيارة الفني | شركة سيدره';
    } else if (page === 'admin' || page === 'settings') {
      templateName = 'Admin';
      pageTitle = 'إدارة النظام | شركة سيدره';
    }

    const template = HtmlService.createTemplateFromFile(templateName);
    // Pass query parameters to the HTML template for direct deep-linking
    template.params = params;
    template.orgName = getAppSetting('ORG_NAME') || CONFIG.DEFAULTS.ORG_NAME;

    return template.evaluate()
      .setTitle(pageTitle)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  } catch (err) {
    return HtmlService.createHtmlOutput(`
      <div dir="rtl" style="font-family: sans-serif; padding: 24px; color: #b91c1c;">
        <h2>حدث خطأ أثناء تحميل الصفحة</h2>
        <p>${err.message}</p>
      </div>
    `);
  }
}

/**
 * Handles all HTTP POST requests:
 * Protected with shared security token (TOKEN property)
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const token = payload.token || (e ? e.parameter.token : null);
    const expectedToken = getApiToken();

    // Validate security token
    if (token !== expectedToken) {
      return createJsonResponse({ error: 'Unauthorized: Invalid or missing security token.' }, 401);
    }

    const action = payload.action || (e ? e.parameter.action : null);
    return handleApiPostAction(action, payload);

  } catch (err) {
    return createJsonResponse({ error: 'POST request failed: ' + err.message }, 500);
  }
}

/**
 * Dispatches GET API requests
 */
function handleApiGetAction(action, params) {
  let result = null;

  switch (action) {
    case 'listWos':
      result = SheetsDB.getWorkOrders({
        status: params.status,
        severity: params.severity,
        location: params.location,
        tech: params.tech,
        since: params.since,
        search: params.search,
        start: params.start || 0,
        limit: params.limit || CONFIG.DEFAULTS.ITEMS_PER_PAGE
      });
      break;

    case 'getWo':
      result = SheetsDB.getWorkOrderById(params.id);
      if (!result) {
        return createJsonResponse({ error: 'Work Order not found' }, 404);
      }
      break;

    case 'listLocations':
      result = SheetsDB.getLocations();
      break;

    case 'listTechnicians':
      result = SheetsDB.getTechnicians();
      break;

    case 'stats':
      result = SheetsDB.getStats();
      break;

    case 'visitsByTech':
      result = SheetsDB.getVisitsByTech(params.techId);
      break;

    case 'aiWeekly':
      const stats = SheetsDB.getStats();
      const wos = SheetsDB.getWorkOrders({ limit: 40 });
      result = Gemini.generateWeeklyDigest(wos.data, stats);
      break;

    case 'aiLogs':
      result = SheetsDB.getAILogs(params.limit ? parseInt(params.limit, 10) : 50);
      break;

    default:
      return createJsonResponse({ error: `Unknown GET action: ${action}` }, 400);
  }

  return createJsonResponse({ success: true, data: result });
}

/**
 * Dispatches POST API requests
 */
function handleApiPostAction(action, payload) {
  let result = null;

  switch (action) {
    case 'createWo':
      // 1. Handle base64 photo if provided
      let photoUrl = payload.before_photo || '';
      if (photoUrl && photoUrl.startsWith('data:')) {
        const tempWoId = SheetsDB.generateNextWoId();
        photoUrl = DriveStore.saveBase64File(tempWoId, photoUrl, 'before_photo.jpg');
        payload.wo_id = tempWoId;
      }

      // 2. Insert record
      payload.before_photo = photoUrl;
      const insertRes = SheetsDB.insertWorkOrder(payload);
      
      // 3. Trigger Gemini Analysis asynchronously
      try {
        const diag = Gemini.diagnose(payload.description, photoUrl, insertRes.wo_id);
        SheetsDB.updateWorkOrder(insertRes.wo_id, {
          gemini_summary: diag.summary,
          gemini_json: diag.data
        });
      } catch (e) {
        Logger.log('AI diagnose error on createWo: ' + e.message);
      }

      result = SheetsDB.getWorkOrderById(insertRes.wo_id);
      break;

    case 'startVisit':
      result = SheetsDB.insertVisit({
        wo_id: payload.wo_id,
        tech_id: payload.tech_id,
        tech_name: payload.tech_name,
        arrived_at: payload.arrived_at,
        arrive_lat: payload.arrive_lat,
        arrive_lng: payload.arrive_lng,
        work_done: 'بدء الزيارة الميدانية'
      });
      SheetsDB.updateWorkOrder(payload.wo_id, { status: CONFIG.STATUSES.IN_PROGRESS });
      break;

    case 'submitVisit':
      result = submitVisitReport(payload);
      break;

    case 'assignTech':
      result = assignWorkOrder(payload.wo_id, payload.assigned_tech);
      break;

    case 'updateStatus':
      result = SheetsDB.updateWorkOrder(payload.wo_id, {
        status: payload.status,
        closed_at: (payload.status === CONFIG.STATUSES.COMPLETED || payload.status === CONFIG.STATUSES.CLOSED) ? SheetsDB.formatDate(new Date()) : ''
      });
      break;

    case 'analyzeWo':
      result = analyzeWorkOrderWithGemini(payload.wo_id);
      break;

    case 'analyzeAllPending':
      const pendingWos = SheetsDB.getWorkOrders({ limit: 100 }).data.filter(w => !w.gemini_summary || w.gemini_summary.includes('غير متوفر'));
      const analyzed = [];
      pendingWos.forEach(w => {
        try {
          const res = analyzeWorkOrderWithGemini(w.wo_id);
          analyzed.push({ wo_id: w.wo_id, success: res.success });
        } catch (e) {
          analyzed.push({ wo_id: w.wo_id, success: false, error: e.message });
        }
      });
      result = { analyzed_count: analyzed.length, items: analyzed };
      break;

    default:
      return createJsonResponse({ error: `Unknown POST action: ${action}` }, 400);
  }

  return createJsonResponse({ success: true, data: result });
}

/**
 * Creates formatted JSON HTTP response using ContentService
 */
function createJsonResponse(data, statusCode = 200) {
  const output = JSON.stringify(data);
  return ContentService.createTextOutput(output)
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// SERVER-SIDE FUNCTIONS CALLED BY google.script.run FROM FRONTEND
// ============================================================================

/**
 * Fast initial data payload for Dashboard.html
 */
function getInitialDashboardData() {
  SheetsDB.initDatabase();
  return {
    locations: SheetsDB.getLocations(),
    technicians: SheetsDB.getTechnicians(),
    stats: SheetsDB.getStats(),
    initialWorkOrders: SheetsDB.getWorkOrders({ limit: 25 }),
    orgName: getAppSetting('ORG_NAME') || CONFIG.DEFAULTS.ORG_NAME
  };
}

/**
 * Fast initial data payload for VisitForm.html
 */
function getInitialVisitData() {
  SheetsDB.initDatabase();
  return {
    locations: SheetsDB.getLocations(),
    technicians: SheetsDB.getTechnicians(),
    activeWorkOrders: SheetsDB.getWorkOrders({ limit: 50 }).data.filter(w => 
      w.status === CONFIG.STATUSES.ASSIGNED || w.status === CONFIG.STATUSES.IN_PROGRESS || w.status === CONFIG.STATUSES.REPORTED
    ),
    orgName: getAppSetting('ORG_NAME') || CONFIG.DEFAULTS.ORG_NAME
  };
}

/**
 * Fast initial data payload for Admin.html
 */
function getInitialAdminData() {
  SheetsDB.initDatabase();
  return {
    locations: SheetsDB.getLocations(),
    technicians: SheetsDB.getTechnicians(),
    settings: [
      { key: 'ORG_NAME', value: getAppSetting('ORG_NAME'), description: 'اسم المؤسسة' },
      { key: 'SLA_HOURS', value: getAppSetting('SLA_HOURS'), description: 'زمن الاستجابة القياسي بالساعات' },
      { key: 'SLA_URGENT_HOURS', value: getAppSetting('SLA_URGENT_HOURS'), description: 'زمن الاستجابة للأعطال العاجلة' },
      { key: 'DEFAULT_MODEL', value: getAppSetting('DEFAULT_MODEL'), description: 'نموذج Gemini AI' },
      { key: 'MANAGER_EMAIL', value: getAppSetting('MANAGER_EMAIL'), description: 'بريد مدير الصيانة' },
      { key: 'MANAGER_PHONE', value: getAppSetting('MANAGER_PHONE'), description: 'هاتف مدير الصيانة' }
    ],
    aiLogs: SheetsDB.getAILogs(30)
  };
}

/**
 * Assigns a technician to a work order
 */
function assignWorkOrder(woId, techNameOrId) {
  const res = SheetsDB.updateWorkOrder(woId, {
    assigned_tech: techNameOrId,
    status: CONFIG.STATUSES.ASSIGNED
  });
  return { success: true, wo: SheetsDB.getWorkOrderById(woId) };
}

/**
 * Handles full submission of technician visit report from VisitForm.html
 */
function submitVisitReport(payload) {
  const woId = payload.wo_id;
  const wo = SheetsDB.getWorkOrderById(woId);
  if (!wo) throw new Error(`Work order ${woId} not found.`);

  // 1. Process and save base64 photos to Drive
  let beforePhotoUrl = wo.before_photo || '';
  if (payload.before_photo && payload.before_photo.startsWith('data:')) {
    beforePhotoUrl = DriveStore.saveBase64File(woId, payload.before_photo, 'visit_before.jpg');
  }

  let afterPhotoUrl = '';
  if (payload.after_photo && payload.after_photo.startsWith('data:')) {
    afterPhotoUrl = DriveStore.saveBase64File(woId, payload.after_photo, 'visit_after.jpg');
  }

  // 2. Insert Visit Record
  const visitRes = SheetsDB.insertVisit({
    wo_id: woId,
    tech_id: payload.tech_id || '',
    tech_name: payload.tech_name || '',
    scheduled_at: payload.scheduled_at || '',
    arrived_at: payload.arrived_at || '',
    departed_at: payload.departed_at || SheetsDB.formatDate(new Date()),
    arrive_lat: payload.arrive_lat || 0,
    arrive_lng: payload.arrive_lng || 0,
    depart_lat: payload.depart_lat || 0,
    depart_lng: payload.depart_lng || 0,
    work_done: payload.work_done || '',
    parts_used: payload.parts_used || '',
    notes: payload.notes || '',
    before_photo: beforePhotoUrl,
    after_photo: afterPhotoUrl,
    video_url: payload.video_url || ''
  });

  // 3. Update Work Order status to COMPLETED (مُنجز) and record costs
  const updatePayload = {
    status: CONFIG.STATUSES.COMPLETED,
    before_photo: beforePhotoUrl,
    after_photo: afterPhotoUrl,
    video_url: payload.video_url || wo.video_url,
    cost_parts: Number(payload.cost_parts) || 0,
    cost_labor: Number(payload.cost_labor) || 0,
    closed_at: SheetsDB.formatDate(new Date())
  };

  SheetsDB.updateWorkOrder(woId, updatePayload);

  // 4. Run Gemini Before/After Inspection Compare
  let compareResult = null;
  if (beforePhotoUrl && afterPhotoUrl) {
    try {
      compareResult = Gemini.beforeAfterCompare(beforePhotoUrl, afterPhotoUrl, payload.notes || payload.work_done, woId);
    } catch (e) {
      Logger.log('AI compare skipped: ' + e.message);
    }
  }

  return {
    success: true,
    visit_id: visitRes.visit_id,
    wo_id: woId,
    compare: compareResult ? compareResult.data : null
  };
}

/**
 * Re-runs Gemini AI analysis on demand for any Work Order
 */
function analyzeWorkOrderWithGemini(woId) {
  const wo = SheetsDB.getWorkOrderById(woId);
  if (!wo) throw new Error('Work order not found');

  const diag = Gemini.diagnose(wo.description, wo.before_photo, woId);
  
  SheetsDB.updateWorkOrder(woId, {
    gemini_summary: diag.summary,
    gemini_json: diag.data
  });

  return { success: true, data: diag.data, summary: diag.summary };
}

/**
 * Exports any Sheet tab to downloadable CSV string
 */
function exportSheetToCsv(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet ${sheetName} not found.`);

  const data = sheet.getDataRange().getValues();
  let csv = '';
  data.forEach(row => {
    const line = row.map(val => {
      let str = String(val === null || val === undefined ? '' : val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }).join(',');
    csv += line + '\r\n';
  });

  return csv;
}
