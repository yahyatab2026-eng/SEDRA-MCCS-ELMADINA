/**
 * ============================================================================
 * CMMS SIDRAH - CONFIGURATION MODULE (Config.gs)
 * Company: شركة سيدره للصناعات الغذائية والحلويات
 * Target: Google Apps Script ES6 / Google Sheets / Google Drive / Gemini API
 * ============================================================================
 */

const CONFIG = {
  // Spreadsheet and folder configuration
  SPREADSHEET_NAME: 'CMMS',
  ROOT_DRIVE_FOLDER: 'CMMS',
  REPORTS_DRIVE_FOLDER: 'Reports',
  
  // Sheet tab names
  SHEETS: {
    SETTINGS: 'Settings',
    LOCATIONS: 'Locations',
    TECHNICIANS: 'Technicians',
    WO_HEADERS: 'WoHeaders',
    VISITS: 'Visits',
    ASSETS: 'Assets',
    AI_LOG: 'AI_Log',
    WEEKLY_DIGEST: 'WeeklyDigest'
  },
  
  // Default values
  DEFAULTS: {
    ORG_NAME: 'شركة سيدره للمواد الغذائية والحلويات',
    SLA_HOURS: 24,
    SLA_URGENT_HOURS: 4,
    DEFAULT_MODEL: 'gemini-2.5-flash', // Change to 'gemini-3-flash' or newer in Settings tab as models evolve
    FALLBACK_MODEL: 'gemini-2.5-flash',
    TIMEZONE: 'Africa/Cairo',
    CACHE_TTL_SECONDS: 300, // 5 minutes in CacheService
    ITEMS_PER_PAGE: 25,
    MANAGER_EMAIL: 'maintenance.mgr@sedra-eg.com',
    MANAGER_PHONE: '+201001234567'
  },
  
  // Cairo center coordinates for map centering
  CAIRO_MAP_CENTER: {
    LAT: 30.0444,
    LNG: 31.2357,
    ZOOM: 11
  },
  
  // Work order severities & statuses (Arabic)
  SEVERITIES: {
    URGENT: 'عاجل',
    MEDIUM: 'متوسط',
    LOW: 'منخفض'
  },
  
  STATUSES: {
    REPORTED: 'مُبلَّغ عنه',
    ASSIGNED: 'مُحدَّد',
    IN_PROGRESS: 'قيد التنفيذ',
    COMPLETED: 'مُنجز',
    CLOSED: 'مُغلق'
  },
  
  LOCATION_TYPES: {
    RETAIL: 'منفذ بيع',
    FACTORY: 'مصنع',
    HQ: 'مقر إداري',
    WAREHOUSE: 'مخزن',
    OTHER: 'أخرى'
  },

  // Gemini REST Endpoint
  GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/'
};

/**
 * Reads a setting from ScriptProperties first, then falls back to Settings tab, then CONFIG.DEFAULTS
 * @param {string} key Setting key
 * @return {string} Setting value
 */
function getAppSetting(key) {
  try {
    const props = PropertiesService.getScriptProperties();
    const propVal = props.getProperty(key);
    if (propVal !== null && propVal !== undefined && propVal !== '') {
      return propVal;
    }
  } catch (e) {
    Logger.log('Error reading ScriptProperties for ' + key + ': ' + e.message);
  }
  
  // Fallback to Settings Sheet tab
  try {
    const sheetVal = SheetsDB.getSetting(key);
    if (sheetVal !== null && sheetVal !== undefined && sheetVal !== '') {
      return sheetVal;
    }
  } catch (e) {
    // Sheet might not be initialized yet
  }
  
  return CONFIG.DEFAULTS[key] || '';
}

/**
 * Returns the secret Gemini API key
 */
function getGeminiApiKey() {
  const key = getAppSetting('GEMINI_API_KEY');
  return key || '';
}

/**
 * Returns the shared API security token for POST web hooks
 */
function getApiToken() {
  const token = getAppSetting('TOKEN');
  return token || 'SIDRAH_CMMS_SECURE_TOKEN_2026';
}
