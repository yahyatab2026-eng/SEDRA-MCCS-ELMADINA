import { DashboardStats, AILogRecord } from '../types';
import { COMPANY_LOCATIONS, COMPANY_TECHNICIANS, COMPANY_GOVERNANCE, COMPANY_DECISIONS, SEED_SETTINGS } from './companyData';
import { COMPANY_ASSETS, COMPANY_RISKS } from './assetsData';
import { COMPANY_SUPPLIERS } from './suppliersData';
import { COMPANY_INVENTORY, COMPANY_CUSTODIES } from './inventoryData';
import { COMPANY_WORK_ORDERS, COMPANY_BRANCH_AUDITS, COMPANY_VISITS } from './workOrdersData';

export {
  SEED_SETTINGS,
  COMPANY_LOCATIONS as SEED_LOCATIONS,
  COMPANY_TECHNICIANS as SEED_TECHNICIANS,
  COMPANY_GOVERNANCE as SEED_GOVERNANCE,
  COMPANY_DECISIONS as SEED_DECISIONS,
  COMPANY_ASSETS as SEED_ASSETS,
  COMPANY_RISKS as SEED_RISKS,
  COMPANY_SUPPLIERS as SEED_SUPPLIERS,
  COMPANY_INVENTORY as SEED_INVENTORY,
  COMPANY_CUSTODIES as SEED_CUSTODIES,
  COMPANY_WORK_ORDERS as SEED_WORK_ORDERS,
  COMPANY_BRANCH_AUDITS as SEED_BRANCH_AUDITS,
  COMPANY_VISITS as SEED_VISITS
};

export const SEED_AI_LOGS: AILogRecord[] = [
  { ts: '2026-08-28 09:15:00', wo_id: 'WO-1911', action: 'diagnose', model: 'gemini-2.5-flash', ok: true, ms: 1240, note: 'تشخيص انسداد سير فرادة العجين بدقة 95%' },
  { ts: '2026-08-27 15:45:00', wo_id: 'WO-1461', action: 'diagnose', model: 'gemini-2.5-flash', ok: true, ms: 1410, note: 'تشخيص تايمر ديفروست فريزر الآيس كريم بالفردوس' },
  { ts: '2026-08-27 11:40:00', wo_id: 'WO-1296', action: 'before_after_compare', model: 'gemini-2.5-flash', ok: true, ms: 1680, note: 'تأكيد جودة عزل لوحة المطبخ بفرع الدقي' },
  { ts: '2026-08-26 12:45:00', wo_id: 'WO-1453', action: 'diagnose', model: 'gemini-2.5-flash', ok: true, ms: 1350, note: 'تشخيص سخان أم علي الحصري وتحديد الكابلات' },
  { ts: '2026-08-25 14:15:00', wo_id: 'WO-2026-MAR-01', action: 'diagnose', model: 'gemini-2.5-flash', ok: true, ms: 1520, note: 'تحديد قطعة غيار مفتاح باور ماكينة La Cimbali بمراسي' }
];

// Initial State Aliases for React Components
export const initialLocations = COMPANY_LOCATIONS;
export const initialTechnicians = COMPANY_TECHNICIANS;
export const initialWorkOrders = COMPANY_WORK_ORDERS;
export const initialVisits = COMPANY_VISITS;
export const initialAssets = COMPANY_ASSETS;
export const initialSuppliers = COMPANY_SUPPLIERS;
export const initialRisks = COMPANY_RISKS;
export const initialInventory = COMPANY_INVENTORY;
export const initialCustodies = COMPANY_CUSTODIES;
export const initialBranchAudits = COMPANY_BRANCH_AUDITS;
export const initialGovernance = COMPANY_GOVERNANCE;
export const initialDecisions = COMPANY_DECISIONS;
export const initialAiLogs = SEED_AI_LOGS.map((l, i) => ({ ...l, id: `log-${i}` }));

export const initialStats: DashboardStats = {
  weeklyCount: COMPANY_WORK_ORDERS.length + 12,
  openCount: COMPANY_WORK_ORDERS.filter(w => w.status !== 'مُنجز' && w.status !== 'مُغلق').length + 3,
  overdueCount: 2,
  completionRate30d: 92,
  mttrHours: 2.6,
  mtbfDays: 28,
  monthCost: 86450,
  activeTechs: COMPANY_TECHNICIANS.filter(t => t.active).length,
  activeAssets: COMPANY_ASSETS.length,
  criticalRisksCount: COMPANY_RISKS.filter(r => r.level === 'Critical').length,
  suppliersCount: COMPANY_SUPPLIERS.length,
  categoryCounts: {
    'تبريد وتكييف': 16,
    'ألبان وتصنيع ومجنسات': 11,
    'حلواني ومخابز وعجين': 9,
    'كهرباء ومواتير ومولدات': 8,
    'سباكة ومرافق': 7,
    'ماكينات تعبئة وتغليف': 5
  },
  locationCounts: {
    'مصنع الألبان (العبور)': 9,
    'مصنع التجمع (الغربي)': 8,
    'فرع التسعين (سيدرا)': 5,
    'فرع روكسي': 4,
    'فرع مدينتي': 3,
    'فرع مراسي (الساحل)': 3,
    'فرع الفردوس (أكتوبر)': 3
  },
  techWorkload: COMPANY_TECHNICIANS.reduce((acc, t) => {
    acc[t.id] = {
      name: t.name,
      count: COMPANY_WORK_ORDERS.filter(w => w.assigned_tech.includes(t.name) || (t.code && w.assigned_tech.includes(t.code))).length || 1,
      color: t.color
    };
    return acc;
  }, {} as Record<string, { name: string; count: number; color: string }>),
  trend30d: [
    { date: '08-01', created: 4, completed: 4 },
    { date: '08-05', created: 6, completed: 5 },
    { date: '08-10', created: 5, completed: 6 },
    { date: '08-15', created: 8, completed: 7 },
    { date: '08-20', created: 7, completed: 8 },
    { date: '08-25', created: 11, completed: 10 },
    { date: '08-28', created: 8, completed: 7 }
  ],
  mttrByMonth: [
    { month: 'يونيو', hours: 4.2 },
    { month: 'يوليو', hours: 3.4 },
    { month: 'أغسطس', hours: 2.6 }
  ]
};
