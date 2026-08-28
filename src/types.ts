export type Severity = 'عاجل' | 'متوسط' | 'منخفض';
export type Status = 'مُبلَّغ عنه' | 'مُحدَّد' | 'قيد التنفيذ' | 'مُنجز' | 'مُغلق';
export type LocationType = 'منفذ بيع' | 'مصنع' | 'مقر إداري' | 'مخزن' | 'أخرى';

export interface LocationItem {
  id: string;
  name: string;
  type: LocationType;
  org: 'El Madina El Monawara (المدينة المنورة)' | 'Sidera Confectionery (سيدرا)' | 'Group (مشترك)';
  region: string;
  scope?: string;
  lat: number;
  lng: number;
  address: string;
  active: boolean;
}

export interface TechnicianItem {
  id: string;
  code?: string;
  name: string;
  phone: string;
  specialty: string;
  location: string;
  joinDate?: string;
  active: boolean;
  color: string;
  employmentType?: 'ثابت' | 'موسمي' | 'إدارة هندسية';
}

export interface SupplierItem {
  id: string;
  name: string;
  category: 'ألبان وتصنيع ومجنسات وغلايات' | 'تبريد وتكييف وتشيلرات وضواغط' | 'حلواني، مخابز، وشوكولاتة' | 'كهرباء، مواتير ومولدات' | 'مصاعد، مدني، استانلس وخدمات عامة';
  phone: string;
  specialty: string;
  contactPerson?: string;
  status: 'Active' | 'Under Review';
  rating?: number;
  notes?: string;
}

export interface RiskRecord {
  id: string;
  org: string;
  facility: string;
  title: string;
  description: string;
  level: 'Critical' | 'High' | 'Medium';
  status: 'Active' | 'Mitigated' | 'In Progress';
  mitigationPlan?: string;
  costImpact?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  org: string;
  location: string;
  category: string;
  itemCode?: string;
  balance: number;
  status: 'In Stock' | 'Critical Shortage' | 'Low Stock';
  priority?: 'High' | 'Medium' | 'Normal';
  unit?: string;
  reorderLevel?: number;
  notes?: string;
}

export interface AdminDecision {
  id: string;
  title: string;
  org: string;
  facility?: string;
  author: string;
  date: string;
  status: string;
  effectiveDate: string;
  scope: string;
  details?: string;
}

export interface CustodyRecord {
  id: string;
  title: string;
  org: string;
  location: string;
  amount: number;
  custodian: string;
  date?: string;
  status: 'In Progress' | 'Completed' | 'Pending Settlement';
  purpose: string;
  authorizedBy?: string;
  findings?: string;
}

export interface BranchAuditRecord {
  id: string;
  branchName: string;
  org: string;
  reportedBy?: string;
  status: 'Active' | 'In Progress' | 'Action Plan Generated';
  itemsCount: number;
  deficiencies: string[];
  summary: string;
}

export interface GovernanceRecord {
  id: string;
  role: string;
  name: string;
  ownership: string;
  scope: string;
  status: string;
}

export interface GeminiDiagnosis {
  category: string;
  subcategory: string;
  severity: Severity;
  rootCause: string;
  suggestedActions: string[];
  confidence: number;
  canOperateSafely: boolean;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
}

export interface GeminiCompare {
  repairEffective: boolean;
  remainingIssues: string;
  replacedParts: string[];
  notes: string;
  qualityRating?: number;
}

export interface WorkOrder {
  wo_id: string;
  created_at: string;
  location_id: string;
  location_name: string;
  org?: string;
  reporter: string;
  reporter_phone: string;
  category: string;
  subcategory: string;
  description: string;
  severity: Severity;
  status: Status;
  sla_deadline: string;
  assigned_tech: string;
  assigned_at: string;
  cost_parts: number;
  cost_labor: number;
  closed_at: string;
  gemini_summary: string;
  gemini_json: string; // Serialized GeminiDiagnosis
  before_photo: string;
  after_photo: string;
  video_url: string;
  voice_note_url?: string;
  doc_url?: string;
  reporter_lat?: number;
  reporter_lng?: number;
  reporter_gps_accuracy?: number;
  source: 'Google Form' | 'Web App' | 'Direct Admin' | 'WhatsApp' | 'Field Report';
  form_response_url: string;
  action_taken?: string;
  spares_detail?: string;
}

export interface VisitRecord {
  visit_id: string;
  wo_id: string;
  tech_id: string;
  tech_name: string;
  scheduled_at: string;
  arrived_at: string;
  departed_at: string;
  arrive_lat: number;
  arrive_lng: number;
  depart_lat: number;
  depart_lng: number;
  work_done: string;
  parts_used: string;
  cost_parts?: number;
  cost_labor?: number;
  notes: string;
  before_photo: string;
  after_photo: string;
  video_url: string;
}

export interface AssetRecord {
  id: string;
  name: string;
  location_id: string;
  location_name?: string;
  org?: string;
  serial: string;
  category: string;
  manufacturer?: string;
  model?: string;
  components?: string;
  installed_at: string;
  status: string;
  risk_level?: 'Class A (Critical / Maximum Risk)' | 'Class A (High)' | 'Class B (Medium)' | 'Class C (Normal)';
  action_plan?: string;
  notes?: string;
  specs?: Record<string, string>;
}

export interface SettingItem {
  key: string;
  value: string;
  description: string;
}

export interface AILogRecord {
  ts: string;
  wo_id: string;
  action: string;
  model: string;
  ok: boolean;
  ms: number;
  note: string;
}

export type AiLogEntry = AILogRecord & { id?: string };

export interface SystemFeaturesConfig {
  enableGpsTracking: boolean;
  enableAutoTimestamp: boolean;
  enableVoiceRecording: boolean;
  enableVideoUpload: boolean;
  enableDocumentUpload: boolean;
  enableGeminiDiagnosis: boolean;
  enableQrScanning: boolean;
  enableWhatsAppDirectDispatch: boolean;
  enableCostTracking: boolean;
  enableSlaAlerts: boolean;
  requirePhotoBeforeSubmit: boolean;
  requireVoiceBeforeSubmit: boolean;
  maxVideoSizeMb: number;
  maxVoiceDurationSec: number;
  appNameAr: string;
  appNameEn: string;
  supportEmergencyHotline: string;
}

export interface SystemSlaConfig {
  urgentHours: number;
  highHours: number;
  mediumHours: number;
  normalHours: number;
  lowHours: number;
  autoEscalate: boolean;
  enableBreachAutoEscalation: boolean;
  escalationEmail: string;
}

export interface SystemGeneralConfig {
  orgName: string;
  timezone: string;
  appNameAr: string;
  appNameEn: string;
  supportEmergencyHotline: string;
  managerEmail: string;
  managerPhone: string;
}

export interface SystemIntegrationsConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  appsScriptWebappUrl: string;
  googleMapsApiKey: string;
  geminiApiKeyStatus: string;
  geminiModel: string;
  googleDriveFolderId: string;
  googleFormUrl: string;
}

export interface SystemSettings {
  features: SystemFeaturesConfig;
  sla: SystemSlaConfig;
  general: SystemGeneralConfig;
  integrations: SystemIntegrationsConfig;
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  features: {
    enableGpsTracking: true,
    enableAutoTimestamp: true,
    enableVoiceRecording: true,
    enableVideoUpload: true,
    enableDocumentUpload: true,
    enableGeminiDiagnosis: true,
    enableQrScanning: true,
    enableWhatsAppDirectDispatch: true,
    enableCostTracking: true,
    enableSlaAlerts: true,
    requirePhotoBeforeSubmit: false,
    requireVoiceBeforeSubmit: false,
    maxVideoSizeMb: 25,
    maxVoiceDurationSec: 120,
    appNameAr: 'نظام إدارة الصيانة والتشغيل الهندسي (سيدره والمدينة)',
    appNameEn: 'Sedra & El Madina Integrated CMMS Suite',
    supportEmergencyHotline: '01006543210'
  },
  sla: {
    urgentHours: 2,
    highHours: 6,
    mediumHours: 12,
    normalHours: 24,
    lowHours: 24,
    autoEscalate: true,
    enableBreachAutoEscalation: true,
    escalationEmail: 'maintenance.escalation@sidrah.eg'
  },
  general: {
    orgName: 'مجموعة سيدرا والمدينة المنورة (Sedra & El Madina Group)',
    timezone: 'Africa/Cairo',
    appNameAr: 'نظام إدارة الصيانة والتشغيل الهندسي (سيدره والمدينة)',
    appNameEn: 'Sedra & El Madina Integrated CMMS Suite',
    supportEmergencyHotline: '01006543210',
    managerEmail: 'maintenance.manager@sidrah.eg',
    managerPhone: '+201001234567'
  },
  integrations: {
    spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
    appsScriptWebappUrl: 'https://script.google.com/macros/s/AKfycbz_SIDRAH_CMMS_PROD_DEPLOYMENT/exec',
    googleMapsApiKey: 'AIzaSyDemoKeyGoogleMapsSidrahEnterprisePlatform2026',
    geminiApiKeyStatus: 'متصل ومحمي بالسيرفر (Environment Variable Configured)',
    geminiModel: 'gemini-2.5-flash',
    googleDriveFolderId: '1_Sidrah_Defect_Media_Vault_2026',
    googleFormUrl: 'https://forms.google.com/sidrah-maintenance-incident'
  }
};

export type DashboardStats = CMMSStats | (Partial<CMMSStats> & Record<string, any>);

export interface CMMSStats {
  weeklyCount: number;
  openCount: number;
  overdueCount: number;
  completionRate30d: number;
  mttrHours: number;
  mtbfDays: number;
  monthCost: number;
  activeTechs: number;
  activeAssets: number;
  criticalRisksCount: number;
  suppliersCount: number;
  categoryCounts: Record<string, number>;
  locationCounts: Record<string, number>;
  techWorkload: Record<string, { name: string; count: number; color: string }>;
  trend30d: { date: string; created: number; completed: number }[];
  mttrByMonth: { month: string; hours: number }[];
}

