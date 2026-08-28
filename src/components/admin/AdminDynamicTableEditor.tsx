import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Save, 
  FileSpreadsheet, 
  Layers, 
  Building2, 
  Users, 
  Cpu, 
  Package, 
  Truck, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Table as TableIcon,
  Wallet,
  ClipboardCheck,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { 
  LocationItem, 
  TechnicianItem, 
  AssetRecord, 
  SupplierItem, 
  InventoryItem, 
  CustodyRecord, 
  BranchAuditRecord, 
  GovernanceRecord, 
  AdminDecision 
} from '../../types';

export type TableEntityKey = 
  | 'locations' 
  | 'technicians' 
  | 'assets' 
  | 'suppliers' 
  | 'inventory' 
  | 'custodies' 
  | 'audits' 
  | 'governance' 
  | 'decisions';

interface ColumnDef<T> {
  key: keyof T | string;
  labelAr: string;
  labelEn: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'color';
  options?: { value: string; labelAr: string; labelEn: string }[];
  readOnly?: boolean;
  required?: boolean;
  width?: string;
  render?: (row: T, isAr: boolean) => React.ReactNode;
}

interface AdminDynamicTableEditorProps {
  isAr: boolean;
  locations: LocationItem[];
  technicians: TechnicianItem[];
  assets: AssetRecord[];
  suppliers: SupplierItem[];
  inventory: InventoryItem[];
  custodies: CustodyRecord[];
  audits: BranchAuditRecord[];
  governance: GovernanceRecord[];
  decisions: AdminDecision[];
  onUpdateLocations: (locs: LocationItem[]) => void;
  onUpdateTechnicians: (techs: TechnicianItem[]) => void;
  onUpdateAssets: (assets: AssetRecord[]) => void;
  onUpdateSuppliers: (supps: SupplierItem[]) => void;
  onUpdateInventory: (inv: InventoryItem[]) => void;
  onUpdateCustodies: (custodies: CustodyRecord[]) => void;
  onUpdateAudits: (audits: BranchAuditRecord[]) => void;
  onUpdateGovernance: (gov: GovernanceRecord[]) => void;
  onUpdateDecisions: (decs: AdminDecision[]) => void;
}

export const AdminDynamicTableEditor: React.FC<AdminDynamicTableEditorProps> = ({
  isAr,
  locations,
  technicians,
  assets,
  suppliers,
  inventory,
  custodies,
  audits,
  governance,
  decisions,
  onUpdateLocations,
  onUpdateTechnicians,
  onUpdateAssets,
  onUpdateSuppliers,
  onUpdateInventory,
  onUpdateCustodies,
  onUpdateAudits,
  onUpdateGovernance,
  onUpdateDecisions
}) => {
  const [selectedEntity, setSelectedEntity] = useState<TableEntityKey>('locations');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRowData, setEditingRowData] = useState<Record<string, any>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // -------------------------------------------------------------
  // COLUMN DEFINITIONS FOR EACH ENTITY
  // -------------------------------------------------------------
  const locationsColumns: ColumnDef<LocationItem>[] = [
    { key: 'id', labelAr: 'كود الموقع', labelEn: 'ID', type: 'text', readOnly: true, width: 'w-24' },
    { key: 'name', labelAr: 'اسم الموقع / الفرع', labelEn: 'Location Name', type: 'text', required: true },
    { 
      key: 'type', 
      labelAr: 'نوع الموقع', 
      labelEn: 'Type', 
      type: 'select',
      options: [
        { value: 'منفذ بيع', labelAr: 'منفذ بيع (Store)', labelEn: 'Retail Store' },
        { value: 'مصنع حلويات', labelAr: 'مصنع حلويات (Factory)', labelEn: 'Confectionery Factory' },
        { value: 'مستودع مركزي', labelAr: 'مستودع مركزي (Warehouse)', labelEn: 'Central Warehouse' },
        { value: 'مطبخ سحابي', labelAr: 'مطبخ سحابي (Cloud Kitchen)', labelEn: 'Cloud Kitchen' },
        { value: 'مبنى إداري', labelAr: 'مبنى إداري (Headquarters)', labelEn: 'HQ / Office' }
      ]
    },
    { 
      key: 'region', 
      labelAr: 'المنطقة الجغرافية', 
      labelEn: 'Region', 
      type: 'select',
      options: [
        { value: 'القاهرة', labelAr: 'القاهرة', labelEn: 'Cairo' },
        { value: 'الجيزة', labelAr: 'الجيزة', labelEn: 'Giza' },
        { value: 'الإسكندرية', labelAr: 'الإسكندرية', labelEn: 'Alexandria' },
        { value: 'الدلتا والوجه البحري', labelAr: 'الدلتا والوجه البحري', labelEn: 'Delta' },
        { value: 'الصعيد', labelAr: 'الصعيد', labelEn: 'Upper Egypt' }
      ]
    },
    { key: 'address', labelAr: 'العنوان التفصيلي', labelEn: 'Address', type: 'text' },
    { key: 'lat', labelAr: 'خط العرض (Lat)', labelEn: 'Lat', type: 'number', width: 'w-28' },
    { key: 'lng', labelAr: 'خط الطول (Lng)', labelEn: 'Lng', type: 'number', width: 'w-28' },
    { key: 'active', labelAr: 'الحالة التشغيلية', labelEn: 'Active', type: 'boolean', width: 'w-24' }
  ];

  const techniciansColumns: ColumnDef<TechnicianItem>[] = [
    { key: 'id', labelAr: 'كود الفني', labelEn: 'ID', type: 'text', readOnly: true, width: 'w-24' },
    { key: 'name', labelAr: 'اسم الفني', labelEn: 'Tech Name', type: 'text', required: true },
    { key: 'phone', labelAr: 'رقم الهاتف / WhatsApp', labelEn: 'Phone', type: 'text', required: true, width: 'w-36' },
    { 
      key: 'specialty', 
      labelAr: 'التخصص الفني', 
      labelEn: 'Specialty', 
      type: 'select',
      options: [
        { value: 'تبريد وتكييف', labelAr: 'تبريد وتكييف', labelEn: 'HVAC & Refrigeration' },
        { value: 'أفران ومعدات حرارية', labelAr: 'أفران ومعدات حرارية', labelEn: 'Ovens & Heating' },
        { value: 'ميكانيكا وخطوط إنتاج', labelAr: 'ميكانيكا وخطوط إنتاج', labelEn: 'Production Mechanics' },
        { value: 'كهرباء وتحكم آلي (PLC)', labelAr: 'كهرباء وتحكم آلي (PLC)', labelEn: 'Electrical & PLC' },
        { value: 'هيدروليك وضواغط هواء', labelAr: 'هيدروليك وضواغط هواء', labelEn: 'Hydraulics & Compressors' },
        { value: 'شبكات وسباكة صناعية', labelAr: 'شبكات وسباكة صناعية', labelEn: 'Plumbing & Gas' }
      ]
    },
    { key: 'location', labelAr: 'المقر / منطقة التغطية', labelEn: 'Base Base', type: 'text' },
    { 
      key: 'employmentType', 
      labelAr: 'نوع التعاقد', 
      labelEn: 'Employment Type', 
      type: 'select',
      options: [
        { value: 'ثابت', labelAr: 'موظف ثابت (Internal)', labelEn: 'Full-time' },
        { value: 'مقاول باطن', labelAr: 'مقاول باطن (Contractor)', labelEn: 'Contractor' }
      ],
      width: 'w-32'
    },
    { key: 'active', labelAr: 'الحالة', labelEn: 'Active', type: 'boolean', width: 'w-20' }
  ];

  const assetsColumns: ColumnDef<AssetRecord>[] = [
    { key: 'id', labelAr: 'كود الماكينة', labelEn: 'Asset Tag', type: 'text', readOnly: true, width: 'w-28' },
    { key: 'name', labelAr: 'اسم الأصل / المعدة', labelEn: 'Asset Name', type: 'text', required: true },
    { key: 'location_name', labelAr: 'الموقع / الفرع', labelEn: 'Location', type: 'text' },
    { 
      key: 'category', 
      labelAr: 'التصنيف الرئيسي', 
      labelEn: 'Category', 
      type: 'select',
      options: [
        { value: 'تبريد وتكييف', labelAr: 'تبريد وتكييف', labelEn: 'Refrigeration & HVAC' },
        { value: 'أفران ومعدات حرارية', labelAr: 'أفران ومعدات حرارية', labelEn: 'Ovens & Thermal' },
        { value: 'خطوط إنتاج وتعبئة', labelAr: 'خطوط إنتاج وتعبئة', labelEn: 'Production & Packaging' },
        { value: 'كهرباء ومولدات', labelAr: 'كهرباء ومولدات', labelEn: 'Generators & Power' },
        { value: 'مضخات ومياه وضواغط', labelAr: 'مضخات ومياه وضواغط', labelEn: 'Pumps & Compressors' }
      ]
    },
    { key: 'manufacturer', labelAr: 'الشركة المصنعة', labelEn: 'Manufacturer', type: 'text' },
    { key: 'model', labelAr: 'الموديل', labelEn: 'Model', type: 'text', width: 'w-32' },
    { key: 'serial', labelAr: 'الرقم التسلسلي (S/N)', labelEn: 'Serial No', type: 'text', width: 'w-32' },
    { 
      key: 'status', 
      labelAr: 'الحالة الفنية', 
      labelEn: 'Status', 
      type: 'select',
      options: [
        { value: 'تعمل بكفاءة', labelAr: 'تعمل بكفاءة (Operational)', labelEn: 'Operational' },
        { value: 'تحتاج صيانة دورية', labelAr: 'تحتاج صيانة دورية (Maintenance Needed)', labelEn: 'Maintenance Needed' },
        { value: 'متوقفة جزئياً', labelAr: 'متوقفة جزئياً (Degraded)', labelEn: 'Degraded' },
        { value: 'معطلة بالكامل', labelAr: 'معطلة بالكامل (Out of Order)', labelEn: 'Out of Order' }
      ]
    },
    { 
      key: 'risk_level', 
      labelAr: 'مستوى الخطورة', 
      labelEn: 'Risk Level', 
      type: 'select',
      options: [
        { value: 'Class A (Critical)', labelAr: 'Class A (حرجة جداً)', labelEn: 'Class A (Critical)' },
        { value: 'Class B (Medium)', labelAr: 'Class B (متوسطة)', labelEn: 'Class B (Medium)' },
        { value: 'Class C (Low)', labelAr: 'Class C (منخفضة)', labelEn: 'Class C (Low)' }
      ],
      width: 'w-36'
    }
  ];

  const suppliersColumns: ColumnDef<SupplierItem>[] = [
    { key: 'id', labelAr: 'كود المورد', labelEn: 'Supplier ID', type: 'text', readOnly: true, width: 'w-24' },
    { key: 'name', labelAr: 'اسم المورد / الشركة', labelEn: 'Supplier Name', type: 'text', required: true },
    { 
      key: 'category', 
      labelAr: 'النشاط والتخصص', 
      labelEn: 'Category', 
      type: 'select',
      options: [
        { value: 'تبريد وتكييف وتشيلرات وضواغط', labelAr: 'تبريد وتكييف وتشيلرات وضواغط', labelEn: 'HVAC & Chillers' },
        { value: 'ألبان وتصنيع ومجنسات وغلايات', labelAr: 'ألبان وتصنيع ومجنسات وغلايات', labelEn: 'Dairy & Boilers' },
        { value: 'حلواني، مخابز، وشوكولاتة', labelAr: 'حلواني، مخابز، وشوكولاتة', labelEn: 'Bakery & Pastry' },
        { value: 'كهرباء، مواتير ومولدات', labelAr: 'كهرباء، مواتير ومولدات', labelEn: 'Electrical & Generators' },
        { value: 'مصاعد، مدني، استانلس وخدمات عامة', labelAr: 'مصاعد، مدني، استانلس وخدمات عامة', labelEn: 'Civil & Elevators' }
      ]
    },
    { key: 'specialty', labelAr: 'مجال التوريد الدقيق', labelEn: 'Specialty', type: 'text' },
    { key: 'contactPerson', labelAr: 'مسؤول الاتصال', labelEn: 'Contact Person', type: 'text' },
    { key: 'phone', labelAr: 'الهاتف', labelEn: 'Phone', type: 'text', width: 'w-36' },
    { 
      key: 'status', 
      labelAr: 'الحالة', 
      labelEn: 'Status', 
      type: 'select',
      options: [
        { value: 'Active', labelAr: 'معتمد ونشط (Active)', labelEn: 'Active' },
        { value: 'Under Review', labelAr: 'تحت المراجعة (Under Review)', labelEn: 'Under Review' }
      ],
      width: 'w-32'
    },
    { key: 'rating', labelAr: 'التقييم (1-5)', labelEn: 'Rating', type: 'number', width: 'w-24' }
  ];

  const inventoryColumns: ColumnDef<InventoryItem>[] = [
    { key: 'id', labelAr: 'كود الصنف', labelEn: 'SKU', type: 'text', readOnly: true, width: 'w-28' },
    { key: 'name', labelAr: 'اسم قطعة الغيار / الصنف', labelEn: 'Item Name', type: 'text', required: true },
    { key: 'location', labelAr: 'مستودع التخزين', labelEn: 'Location', type: 'text' },
    { key: 'category', labelAr: 'التصنيف', labelEn: 'Category', type: 'text' },
    { key: 'balance', labelAr: 'الرصيد الحالي', labelEn: 'Current Stock', type: 'number', width: 'w-28' },
    { key: 'unit', labelAr: 'الوحدة', labelEn: 'Unit', type: 'text', width: 'w-24' },
    { key: 'reorderLevel', labelAr: 'حد الطلب', labelEn: 'Reorder Level', type: 'number', width: 'w-28' },
    { 
      key: 'status', 
      labelAr: 'حالة الرصيد', 
      labelEn: 'Status', 
      type: 'select',
      options: [
        { value: 'In Stock', labelAr: 'متوفر (In Stock)', labelEn: 'In Stock' },
        { value: 'Low Stock', labelAr: 'منخفض (Low Stock)', labelEn: 'Low Stock' },
        { value: 'Critical Shortage', labelAr: 'حرج / منتهي (Critical)', labelEn: 'Critical Shortage' }
      ],
      width: 'w-32'
    }
  ];

  const custodiesColumns: ColumnDef<CustodyRecord>[] = [
    { key: 'id', labelAr: 'كود العهدة', labelEn: 'Custody ID', type: 'text', readOnly: true, width: 'w-28' },
    { key: 'custodian', labelAr: 'المستلم / صاحب العهدة', labelEn: 'Custodian', type: 'text', required: true },
    { key: 'amount', labelAr: 'القيمة (EGP)', labelEn: 'Amount (EGP)', type: 'number', required: true, width: 'w-28' },
    { key: 'location', labelAr: 'الموقع / الفرع', labelEn: 'Location', type: 'text' },
    { key: 'org', labelAr: 'الجهة / الشركة', labelEn: 'Org', type: 'text' },
    { key: 'purpose', labelAr: 'الغرض وبيان الصرف', labelEn: 'Purpose', type: 'text' },
    { 
      key: 'status', 
      labelAr: 'حالة العهدة', 
      labelEn: 'Status', 
      type: 'select',
      options: [
        { value: 'In Progress', labelAr: 'قيد التنفيذ (In Progress)', labelEn: 'In Progress' },
        { value: 'Completed', labelAr: 'مكتملة ومسواة (Completed)', labelEn: 'Completed' },
        { value: 'Pending Settlement', labelAr: 'بانتظار التسوية (Pending)', labelEn: 'Pending Settlement' }
      ],
      width: 'w-36'
    },
    { key: 'date', labelAr: 'تاريخ الصرف', labelEn: 'Date', type: 'text', width: 'w-28' },
    { key: 'authorizedBy', labelAr: 'جهة الاعتماد', labelEn: 'Authorized By', type: 'text' }
  ];

  const auditsColumns: ColumnDef<BranchAuditRecord>[] = [
    { key: 'id', labelAr: 'كود الفحص', labelEn: 'Audit ID', type: 'text', readOnly: true, width: 'w-24' },
    { key: 'branchName', labelAr: 'اسم الفرع / المنشأة', labelEn: 'Branch Name', type: 'text', required: true },
    { key: 'org', labelAr: 'الجهة التابع لها', labelEn: 'Org', type: 'text' },
    { key: 'reportedBy', labelAr: 'مسؤول البلاغ', labelEn: 'Reported By', type: 'text' },
    { 
      key: 'status', 
      labelAr: 'حالة المتابعة', 
      labelEn: 'Status', 
      type: 'select',
      options: [
        { value: 'In Progress', labelAr: 'قيد المتابعة (In Progress)', labelEn: 'In Progress' },
        { value: 'Action Plan Generated', labelAr: 'تمت الخطة (Plan Ready)', labelEn: 'Action Plan Generated' },
        { value: 'Active', labelAr: 'نشط (Active)', labelEn: 'Active' }
      ],
      width: 'w-36'
    },
    { key: 'itemsCount', labelAr: 'عدد البنود', labelEn: 'Items Count', type: 'number', width: 'w-24' },
    { key: 'summary', labelAr: 'الملخص وخطة العمل', labelEn: 'Action Plan / Summary', type: 'text' }
  ];

  const governanceColumns: ColumnDef<GovernanceRecord>[] = [
    { key: 'id', labelAr: 'كود السجل', labelEn: 'ID', type: 'text', readOnly: true, width: 'w-24' },
    { key: 'name', labelAr: 'الاسم الكامل / الصفة', labelEn: 'Name', type: 'text', required: true },
    { key: 'role', labelAr: 'المسمى / المنصب', labelEn: 'Role', type: 'text', required: true },
    { key: 'ownership', labelAr: 'نطاق الملكية / الإشراف', labelEn: 'Ownership', type: 'text' },
    { key: 'scope', labelAr: 'المسؤوليات ونطاق الحوكمة', labelEn: 'Scope & Responsibilities', type: 'text' },
    { 
      key: 'status', 
      labelAr: 'الحالة', 
      labelEn: 'Status', 
      type: 'select',
      options: [
        { value: 'Active', labelAr: 'نشط (Active)', labelEn: 'Active' },
        { value: 'Advisory', labelAr: 'استشاري (Advisory)', labelEn: 'Advisory' },
        { value: 'Inactive', labelAr: 'غير نشط (Inactive)', labelEn: 'Inactive' }
      ],
      width: 'w-28'
    }
  ];

  const decisionsColumns: ColumnDef<AdminDecision>[] = [
    { key: 'id', labelAr: 'رقم القرار', labelEn: 'Decision ID', type: 'text', readOnly: true, width: 'w-28' },
    { key: 'title', labelAr: 'عنوان القرار الإداري', labelEn: 'Decision Title', type: 'text', required: true },
    { key: 'author', labelAr: 'الجهة المصدرة', labelEn: 'Issued By', type: 'text' },
    { key: 'date', labelAr: 'تاريخ الإصدار', labelEn: 'Date', type: 'text', width: 'w-28' },
    { key: 'effectiveDate', labelAr: 'تاريخ السريان', labelEn: 'Effective Date', type: 'text', width: 'w-28' },
    { key: 'scope', labelAr: 'منطوق ونطاق القرار', labelEn: 'Scope / Directive', type: 'text' },
    { 
      key: 'status', 
      labelAr: 'الحالة', 
      labelEn: 'Status', 
      type: 'select',
      options: [
        { value: 'Active', labelAr: 'ساري ومُلزم (Active)', labelEn: 'Active' },
        { value: 'Under Review', labelAr: 'قيد المراجعة (Review)', labelEn: 'Under Review' },
        { value: 'Archived', labelAr: 'مؤرشف (Archived)', labelEn: 'Archived' }
      ],
      width: 'w-28'
    }
  ];

  // -------------------------------------------------------------
  // CURRENT ACTIVE DATA AND SCHEMA
  // -------------------------------------------------------------
  const { currentData, currentColumns, entityLabel, icon } = useMemo(() => {
    switch (selectedEntity) {
      case 'locations':
        return {
          currentData: locations,
          currentColumns: locationsColumns as ColumnDef<any>[],
          entityLabel: isAr ? 'المواقع والفروع' : 'Locations & Branches',
          icon: <Building2 className="w-4 h-4 text-teal-700" />
        };
      case 'technicians':
        return {
          currentData: technicians,
          currentColumns: techniciansColumns as ColumnDef<any>[],
          entityLabel: isAr ? 'الفنيون وفرق الطوارئ' : 'Technicians & Response Teams',
          icon: <Users className="w-4 h-4 text-indigo-700" />
        };
      case 'assets':
        return {
          currentData: assets,
          currentColumns: assetsColumns as ColumnDef<any>[],
          entityLabel: isAr ? 'الماكينات وخطوط الإنتاج' : 'Assets & Equipment',
          icon: <Cpu className="w-4 h-4 text-amber-700" />
        };
      case 'suppliers':
        return {
          currentData: suppliers,
          currentColumns: suppliersColumns as ColumnDef<any>[],
          entityLabel: isAr ? 'الموردون ومقاولو الصيانة' : 'Suppliers & Vendors',
          icon: <Truck className="w-4 h-4 text-purple-700" />
        };
      case 'inventory':
        return {
          currentData: inventory,
          currentColumns: inventoryColumns as ColumnDef<any>[],
          entityLabel: isAr ? 'المخزون وقطع الغيار' : 'Inventory & Spare Parts',
          icon: <Package className="w-4 h-4 text-emerald-700" />
        };
      case 'custodies':
        return {
          currentData: custodies,
          currentColumns: custodiesColumns as ColumnDef<any>[],
          entityLabel: isAr ? 'العهد المالية والفنية' : 'Custodies & Cash Advances',
          icon: <Wallet className="w-4 h-4 text-teal-700" />
        };
      case 'audits':
        return {
          currentData: audits,
          currentColumns: auditsColumns as ColumnDef<any>[],
          entityLabel: isAr ? 'ملاحظات وأعطال الفروع' : 'Branch Deficiencies & Audits',
          icon: <ClipboardCheck className="w-4 h-4 text-rose-700" />
        };
      case 'governance':
        return {
          currentData: governance,
          currentColumns: governanceColumns as ColumnDef<any>[],
          entityLabel: isAr ? 'الهيكل الإداري ولجنة الحوكمة' : 'Governance Structure',
          icon: <ShieldCheck className="w-4 h-4 text-blue-700" />
        };
      case 'decisions':
        return {
          currentData: decisions,
          currentColumns: decisionsColumns as ColumnDef<any>[],
          entityLabel: isAr ? 'سجل القرارات الإدارية والتنظيمية' : 'Administrative Decisions',
          icon: <FileText className="w-4 h-4 text-amber-700" />
        };
      default:
        return {
          currentData: [],
          currentColumns: [],
          entityLabel: '',
          icon: null
        };
    }
  }, [
    selectedEntity, 
    locations, 
    technicians, 
    assets, 
    suppliers, 
    inventory, 
    custodies, 
    audits, 
    governance, 
    decisions, 
    isAr
  ]);

  // -------------------------------------------------------------
  // FILTERED DATA
  // -------------------------------------------------------------
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return currentData;
    const q = searchQuery.toLowerCase();

    return currentData.filter((row: any) => {
      return Object.values(row).some(val => {
        if (val === null || val === undefined) return false;
        if (Array.isArray(val)) return val.join(' ').toLowerCase().includes(q);
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [currentData, searchQuery]);

  // -------------------------------------------------------------
  // INLINE EDITING HANDLERS
  // -------------------------------------------------------------
  const handleStartEdit = (row: any) => {
    setEditingRowId(row.id);
    setEditingRowData({ ...row });
    setIsAddingNew(false);
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingRowData({});
  };

  const handleSaveEdit = () => {
    if (!editingRowId) return;

    if (selectedEntity === 'locations') {
      const updated = locations.map(item => item.id === editingRowId ? { ...item, ...editingRowData } : item);
      onUpdateLocations(updated);
    } else if (selectedEntity === 'technicians') {
      const updated = technicians.map(item => item.id === editingRowId ? { ...item, ...editingRowData } : item);
      onUpdateTechnicians(updated);
    } else if (selectedEntity === 'assets') {
      const updated = assets.map(item => item.id === editingRowId ? { ...item, ...editingRowData } : item);
      onUpdateAssets(updated);
    } else if (selectedEntity === 'suppliers') {
      const updated = suppliers.map(item => item.id === editingRowId ? { ...item, ...editingRowData } : item);
      onUpdateSuppliers(updated);
    } else if (selectedEntity === 'inventory') {
      const updated = inventory.map(item => item.id === editingRowId ? { ...item, ...editingRowData } : item);
      onUpdateInventory(updated);
    } else if (selectedEntity === 'custodies') {
      const updated = custodies.map(item => item.id === editingRowId ? { ...item, ...editingRowData, amount: Number(editingRowData.amount) || 0 } : item);
      onUpdateCustodies(updated);
    } else if (selectedEntity === 'audits') {
      const updated = audits.map(item => item.id === editingRowId ? { ...item, ...editingRowData } : item);
      onUpdateAudits(updated);
    } else if (selectedEntity === 'governance') {
      const updated = governance.map(item => item.id === editingRowId ? { ...item, ...editingRowData } : item);
      onUpdateGovernance(updated);
    } else if (selectedEntity === 'decisions') {
      const updated = decisions.map(item => item.id === editingRowId ? { ...item, ...editingRowData } : item);
      onUpdateDecisions(updated);
    }

    showFeedback('success', isAr ? 'تم حفظ وتحديث الصف مباشرة بنجاح!' : 'Row updated successfully!');
    setEditingRowId(null);
    setEditingRowData({});
  };

  // -------------------------------------------------------------
  // INLINE ADDING HANDLERS
  // -------------------------------------------------------------
  const handleStartAdd = () => {
    let generatedId = '';
    const initialObj: Record<string, any> = {};

    currentColumns.forEach(col => {
      if (col.type === 'boolean') initialObj[col.key as string] = true;
      else if (col.type === 'number') initialObj[col.key as string] = 0;
      else if (col.options && col.options.length > 0) initialObj[col.key as string] = col.options[0].value;
      else initialObj[col.key as string] = '';
    });

    if (selectedEntity === 'locations') {
      generatedId = `LOC-${locations.length + 101}`;
      initialObj.name = '';
      initialObj.type = 'منفذ بيع';
      initialObj.region = 'القاهرة';
      initialObj.lat = 30.0444;
      initialObj.lng = 31.2357;
      initialObj.active = true;
    } else if (selectedEntity === 'technicians') {
      generatedId = `TECH-${technicians.length + 101}`;
      initialObj.specialty = 'تبريد وتكييف';
      initialObj.employmentType = 'ثابت';
      initialObj.active = true;
    } else if (selectedEntity === 'assets') {
      generatedId = `EQ-${assets.length + 101}`;
      initialObj.category = 'تبريد وتكييف';
      initialObj.status = 'تعمل بكفاءة';
      initialObj.risk_level = 'Class B (Medium)';
      initialObj.location_name = locations[0]?.name || 'المصنع الرئيسي';
    } else if (selectedEntity === 'suppliers') {
      generatedId = `SUP-${suppliers.length + 101}`;
      initialObj.rating = 5;
    } else if (selectedEntity === 'inventory') {
      generatedId = `PART-${inventory.length + 101}`;
      initialObj.balance = 10;
      initialObj.reorderLevel = 3;
      initialObj.unit = 'قطعة';
      initialObj.status = 'In Stock';
    } else if (selectedEntity === 'custodies') {
      generatedId = `CUSTODY-2026-00${custodies.length + 1}`;
      initialObj.amount = 1500;
      initialObj.status = 'In Progress';
      initialObj.org = 'Sidera Confectionery (سيدرا)';
      initialObj.location = locations[0]?.name || 'مصنع التجمع';
      initialObj.date = new Date().toISOString().slice(0, 10);
      initialObj.authorizedBy = 'الإدارة الهندسية';
    } else if (selectedEntity === 'audits') {
      generatedId = `AUD-${audits.length + 101}`;
      initialObj.org = 'El Madina El Monawara (المدينة المنورة)';
      initialObj.reportedBy = 'مدير الفرع';
      initialObj.status = 'In Progress';
      initialObj.itemsCount = 1;
      initialObj.deficiencies = ['ملاحظة فحص أولي'];
    } else if (selectedEntity === 'governance') {
      generatedId = `GOV-00${governance.length + 1}`;
      initialObj.status = 'Active';
      initialObj.ownership = 'إشراف هندسي';
    } else if (selectedEntity === 'decisions') {
      generatedId = `DEC-2026-00${decisions.length + 1}`;
      initialObj.status = 'Active';
      initialObj.date = new Date().toISOString().slice(0, 10);
      initialObj.effectiveDate = new Date().toISOString().slice(0, 10);
      initialObj.author = 'Eng. Yahia Tarek Farag (Director of Engineering)';
    }

    initialObj.id = generatedId;
    setNewRowData(initialObj);
    setIsAddingNew(true);
    setEditingRowId(null);
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    setNewRowData({});
  };

  const handleSaveAdd = () => {
    const mainField = 
      selectedEntity === 'custodies' ? newRowData.custodian :
      selectedEntity === 'audits' ? newRowData.branchName :
      selectedEntity === 'decisions' ? newRowData.title :
      newRowData.name;

    if (!mainField || String(mainField).trim() === '') {
      showFeedback('error', isAr ? 'يرجى إدخال الحقل الإلزامي الرئيسي قبل الحفظ.' : 'Please provide the required main field before adding.');
      return;
    }

    if (selectedEntity === 'locations') {
      const newLoc: LocationItem = {
        id: newRowData.id || `LOC-${Date.now().toString().slice(-4)}`,
        name: newRowData.name,
        type: newRowData.type || 'منفذ بيع',
        region: newRowData.region || 'القاهرة',
        lat: Number(newRowData.lat) || 30.0444,
        lng: Number(newRowData.lng) || 31.2357,
        address: newRowData.address || '',
        org: 'Sidera Confectionery (سيدرا)',
        active: newRowData.active !== false
      };
      onUpdateLocations([newLoc, ...locations]);
    } else if (selectedEntity === 'technicians') {
      const newTech: TechnicianItem = {
        id: newRowData.id || `TECH-${Date.now().toString().slice(-4)}`,
        name: newRowData.name,
        phone: newRowData.phone || '',
        specialty: newRowData.specialty || 'تبريد وتكييف',
        location: newRowData.location || 'المركز الرئيسي',
        active: newRowData.active !== false,
        color: '#0d9488',
        employmentType: newRowData.employmentType || 'ثابت'
      };
      onUpdateTechnicians([newTech, ...technicians]);
    } else if (selectedEntity === 'assets') {
      const newAsset: AssetRecord = {
        id: newRowData.id || `EQ-${Date.now().toString().slice(-4)}`,
        name: newRowData.name,
        location_id: locations.find(l => l.name === newRowData.location_name)?.id || 'LOC-1',
        location_name: newRowData.location_name || locations[0]?.name || 'المصنع الرئيسي',
        category: newRowData.category || 'تبريد وتكييف',
        manufacturer: newRowData.manufacturer || 'General',
        model: newRowData.model || 'STD-2026',
        serial: newRowData.serial || `SN-${Date.now().toString().slice(-5)}`,
        installed_at: new Date().toISOString().slice(0, 10),
        status: newRowData.status || 'تعمل بكفاءة',
        risk_level: newRowData.risk_level || 'Class B (Medium)',
        notes: newRowData.notes || ''
      };
      onUpdateAssets([newAsset, ...assets]);
    } else if (selectedEntity === 'suppliers') {
      const newSup: SupplierItem = {
        id: newRowData.id || `SUP-${Date.now().toString().slice(-4)}`,
        name: newRowData.name,
        category: newRowData.category || 'تبريد وتكييف وتشيلرات وضواغط',
        specialty: newRowData.specialty || 'معدات صناعية',
        contactPerson: newRowData.contactPerson || 'مهندس الصيانة',
        phone: newRowData.phone || '01000000000',
        status: newRowData.status || 'Active',
        rating: Number(newRowData.rating) || 5
      };
      onUpdateSuppliers([newSup, ...suppliers]);
    } else if (selectedEntity === 'inventory') {
      const newInv: InventoryItem = {
        id: newRowData.id || `PART-${Date.now().toString().slice(-4)}`,
        name: newRowData.name,
        org: 'Sidera Confectionery (سيدرا)',
        location: newRowData.location || locations[0]?.name || 'المصنع الرئيسي',
        category: newRowData.category || 'عام',
        balance: Number(newRowData.balance) || 1,
        unit: newRowData.unit || 'قطعة',
        reorderLevel: Number(newRowData.reorderLevel) || 1,
        status: newRowData.status || 'In Stock'
      };
      onUpdateInventory([newInv, ...inventory]);
    } else if (selectedEntity === 'custodies') {
      const newCustody: CustodyRecord = {
        id: newRowData.id || `CUSTODY-2026-00${Date.now().toString().slice(-3)}`,
        title: `عهدة ${newRowData.custodian}`,
        custodian: newRowData.custodian,
        amount: Number(newRowData.amount) || 0,
        location: newRowData.location || 'المصنع',
        org: newRowData.org || 'Sidera Confectionery (سيدرا)',
        purpose: newRowData.purpose || 'شراء خامات وقطع غيار',
        status: newRowData.status || 'In Progress',
        date: newRowData.date || new Date().toISOString().slice(0, 10),
        authorizedBy: newRowData.authorizedBy || 'الإدارة الهندسية'
      };
      onUpdateCustodies([newCustody, ...custodies]);
    } else if (selectedEntity === 'audits') {
      const newAudit: BranchAuditRecord = {
        id: newRowData.id || `AUD-${Date.now().toString().slice(-4)}`,
        branchName: newRowData.branchName,
        org: newRowData.org || 'El Madina El Monawara (المدينة المنورة)',
        reportedBy: newRowData.reportedBy || 'مدير الفرع',
        status: newRowData.status || 'In Progress',
        itemsCount: Number(newRowData.itemsCount) || 1,
        deficiencies: [newRowData.summary || 'فحص ومعاينة فنية'],
        summary: newRowData.summary || 'تقرير فحص دوري'
      };
      onUpdateAudits([newAudit, ...audits]);
    } else if (selectedEntity === 'governance') {
      const newGov: GovernanceRecord = {
        id: newRowData.id || `GOV-00${Date.now().toString().slice(-3)}`,
        name: newRowData.name,
        role: newRowData.role || 'عضو لجنة الحوكمة',
        ownership: newRowData.ownership || 'نطاق إشرافي',
        scope: newRowData.scope || 'حوكمة ومتابعة العمليات',
        status: newRowData.status || 'Active'
      };
      onUpdateGovernance([newGov, ...governance]);
    } else if (selectedEntity === 'decisions') {
      const newDec: AdminDecision = {
        id: newRowData.id || `DEC-2026-00${Date.now().toString().slice(-3)}`,
        title: newRowData.title,
        author: newRowData.author || 'Director of Engineering',
        org: 'Group Enterprise',
        date: newRowData.date || new Date().toISOString().slice(0, 10),
        effectiveDate: newRowData.effectiveDate || new Date().toISOString().slice(0, 10),
        scope: newRowData.scope || 'توجيه تنظيمي ملزم',
        status: newRowData.status || 'Active'
      };
      onUpdateDecisions([newDec, ...decisions]);
    }

    showFeedback('success', isAr ? 'تمت إضافة السجل الجديد بنجاح!' : 'New row added successfully!');
    setIsAddingNew(false);
    setNewRowData({});
  };

  // -------------------------------------------------------------
  // DELETION HANDLER
  // -------------------------------------------------------------
  const handleDeleteRow = (id: string) => {
    if (selectedEntity === 'locations') {
      onUpdateLocations(locations.filter(i => i.id !== id));
    } else if (selectedEntity === 'technicians') {
      onUpdateTechnicians(technicians.filter(i => i.id !== id));
    } else if (selectedEntity === 'assets') {
      onUpdateAssets(assets.filter(i => i.id !== id));
    } else if (selectedEntity === 'suppliers') {
      onUpdateSuppliers(suppliers.filter(i => i.id !== id));
    } else if (selectedEntity === 'inventory') {
      onUpdateInventory(inventory.filter(i => i.id !== id));
    } else if (selectedEntity === 'custodies') {
      onUpdateCustodies(custodies.filter(i => i.id !== id));
    } else if (selectedEntity === 'audits') {
      onUpdateAudits(audits.filter(i => i.id !== id));
    } else if (selectedEntity === 'governance') {
      onUpdateGovernance(governance.filter(i => i.id !== id));
    } else if (selectedEntity === 'decisions') {
      onUpdateDecisions(decisions.filter(i => i.id !== id));
    }

    setDeleteConfirmId(null);
    showFeedback('success', isAr ? 'تم حذف السجل بنجاح!' : 'Row deleted successfully!');
  };

  // -------------------------------------------------------------
  // CSV EXPORT
  // -------------------------------------------------------------
  const handleExportCsv = () => {
    if (!currentData.length) return;
    const headers = currentColumns.map(c => isAr ? c.labelAr : c.labelEn);
    const rows = currentData.map((row: any) => 
      currentColumns.map(c => {
        const val = row[c.key as string];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
        if (Array.isArray(val)) return `"${val.join(' | ').replace(/"/g, '""')}"`;
        return `"${val}"`;
      }).join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cmms_${selectedEntity}_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      
      {/* ------------------------------------------------------------- */}
      {/* ENTITY SELECTOR CHIPS */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border-geometric rounded-xs p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-teal-700" />
            <div>
              <h3 className="font-black text-sm text-slate-900">
                {isAr ? 'محرر الجداول وقواعد البيانات الديناميكي (Live Dynamic Table Grid)' : 'Dynamic Data Grid & Row Editor'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isAr 
                  ? 'عرض وتعديل فوري لكافة الجداول والعهد والأعطال والحوكمة مع الحفظ التلقائي في النظام.'
                  : 'Live inline editing, adding, and deleting table rows with direct state sync.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border-geometric rounded-xs text-xs font-bold flex items-center gap-1.5 transition"
              title={isAr ? 'تصدير الجدول الحالي' : 'Export Table'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تصدير CSV' : 'Export'}</span>
            </button>

            <button
              onClick={handleStartAdd}
              disabled={isAddingNew}
              className="px-3.5 py-1.5 accent-teal text-white rounded-xs text-xs font-bold flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة صف جديد' : 'Add Row'}</span>
            </button>
          </div>
        </div>

        {/* Entity Selector Tabs (9 Tables) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-3">
          {[
            { id: 'locations', labelAr: `المواقع (${locations.length})`, labelEn: `Locations (${locations.length})`, icon: <Building2 className="w-3.5 h-3.5" /> },
            { id: 'technicians', labelAr: `الفنيون (${technicians.length})`, labelEn: `Technicians (${technicians.length})`, icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'assets', labelAr: `الماكينات (${assets.length})`, labelEn: `Assets (${assets.length})`, icon: <Cpu className="w-3.5 h-3.5" /> },
            { id: 'suppliers', labelAr: `الموردون (${suppliers.length})`, labelEn: `Suppliers (${suppliers.length})`, icon: <Truck className="w-3.5 h-3.5" /> },
            { id: 'inventory', labelAr: `المخزون (${inventory.length})`, labelEn: `Inventory (${inventory.length})`, icon: <Package className="w-3.5 h-3.5" /> },
            { id: 'custodies', labelAr: `العهد المالية (${custodies.length})`, labelEn: `Custodies (${custodies.length})`, icon: <Wallet className="w-3.5 h-3.5 text-teal-600" /> },
            { id: 'audits', labelAr: `أعطال الفروع (${audits.length})`, labelEn: `Audits (${audits.length})`, icon: <ClipboardCheck className="w-3.5 h-3.5 text-rose-600" /> },
            { id: 'governance', labelAr: `الهيكل والحوكمة (${governance.length})`, labelEn: `Governance (${governance.length})`, icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> },
            { id: 'decisions', labelAr: `القرارات الإدارية (${decisions.length})`, labelEn: `Decisions (${decisions.length})`, icon: <FileText className="w-3.5 h-3.5 text-amber-600" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedEntity(tab.id as TableEntityKey);
                setEditingRowId(null);
                setIsAddingNew(false);
              }}
              className={`p-2.5 border-geometric rounded-xs text-xs font-bold flex items-center justify-between transition ${
                selectedEntity === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {tab.icon}
                <span className="truncate">{isAr ? tab.labelAr : tab.labelEn}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className={`p-3 border-geometric rounded-xs text-xs font-bold flex items-center justify-between ${
          feedbackMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-600' : 'bg-rose-50 text-rose-900 border-rose-600'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <AlertTriangle className="w-4 h-4 text-rose-700" />}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-500 hover:text-slate-900 font-mono">✕</button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SEARCH AND KPI BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border-geometric rounded-xs p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isAr ? `البحث في جدول ${entityLabel}...` : `Search ${entityLabel}...`}
              className="w-full pl-3 pr-9 py-1.5 text-xs bg-slate-50 border-geometric rounded-xs font-bold outline-none focus:bg-white"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-2 py-1.5 text-xs bg-slate-100 border-geometric rounded-xs text-slate-600 font-mono hover:bg-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-500">
            {isAr ? 'عدد السجلات المعروضة:' : 'Rows:'} <strong className="text-slate-900">{filteredRows.length}</strong> / {currentData.length}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">
            {isAr ? 'الأعمدة:' : 'Columns:'} <strong className="text-slate-900">{currentColumns.length}</strong>
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DYNAMIC DATA TABLE */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border-geometric rounded-xs shadow-xs overflow-x-auto">
        <table className="w-full border-collapse text-right text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-mono text-[11px] select-none">
              <th className="p-3 w-10 text-center">#</th>
              {currentColumns.map(col => (
                <th key={col.key as string} className={`p-3 font-bold border-l border-slate-700 ${col.width || ''}`}>
                  {isAr ? col.labelAr : col.labelEn}
                  {col.required && <span className="text-rose-400 mr-1">*</span>}
                </th>
              ))}
              <th className="p-3 w-24 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            
            {/* INLINE NEW ROW CREATION */}
            {isAddingNew && (
              <tr className="bg-teal-50/70 border-2 border-teal-600 animate-in fade-in duration-100">
                <td className="px-3 py-2 text-center font-mono font-bold text-teal-800 bg-teal-100 border-l border-teal-300">
                  NEW
                </td>

                {currentColumns.map(col => {
                  const key = col.key as string;
                  const val = newRowData[key];

                  if (col.readOnly) {
                    return (
                      <td key={key} className="px-3 py-2 font-mono text-[11px] text-slate-500 border-l border-teal-200">
                        <span className="px-1.5 py-0.5 bg-white border border-teal-300 rounded-xs text-teal-900 font-bold">{val}</span>
                      </td>
                    );
                  }

                  if (col.type === 'select' && col.options) {
                    return (
                      <td key={key} className="px-2 py-1.5 border-l border-teal-200">
                        <select
                          value={val || ''}
                          onChange={e => setNewRowData(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-full px-2 py-1 bg-white border border-teal-400 rounded-xs text-xs font-bold text-slate-900"
                        >
                          {col.options.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {isAr ? opt.labelAr : opt.labelEn}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  }

                  if (col.type === 'boolean') {
                    return (
                      <td key={key} className="px-3 py-2 text-center border-l border-teal-200">
                        <input
                          type="checkbox"
                          checked={!!val}
                          onChange={e => setNewRowData(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="w-4 h-4 accent-teal-700 cursor-pointer"
                        />
                      </td>
                    );
                  }

                  return (
                    <td key={key} className="px-2 py-1.5 border-l border-teal-200">
                      <input
                        type={col.type === 'number' ? 'number' : 'text'}
                        value={val || ''}
                        onChange={e => setNewRowData(prev => ({ ...prev, [key]: col.type === 'number' ? Number(e.target.value) : e.target.value }))}
                        placeholder={isAr ? `أدخل ${col.labelAr}...` : `Enter ${col.labelEn}...`}
                        className="w-full px-2 py-1 bg-white border border-teal-400 rounded-xs text-xs font-bold text-slate-900 focus:outline-teal-600"
                      />
                    </td>
                  );
                })}

                {/* Actions Column for New Row */}
                <td className="px-2 py-2 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={handleSaveAdd}
                      className="p-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xs shadow-xs"
                      title={isAr ? 'حفظ السجل الجديد' : 'Save'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleCancelAdd}
                      className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xs"
                      title={isAr ? 'إلغاء' : 'Cancel'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* EMPTY STATE */}
            {filteredRows.length === 0 && !isAddingNew && (
              <tr>
                <td colSpan={currentColumns.length + 2} className="px-4 py-8 text-center text-slate-500 text-xs">
                  {isAr ? 'لا توجد بيانات مطابقة لبحثك في هذا الجدول.' : 'No matching rows found in this table.'}
                </td>
              </tr>
            )}

            {/* EXISTING ROWS */}
            {filteredRows.map((row: any, idx: number) => {
              const isEditing = editingRowId === row.id;

              if (isEditing) {
                return (
                  <tr key={row.id} className="bg-amber-50/60 border-2 border-amber-500">
                    <td className="px-3 py-2 text-center font-mono font-bold text-amber-900 bg-amber-100 border-l border-amber-200">
                      {idx + 1}
                    </td>

                    {currentColumns.map(col => {
                      const key = col.key as string;
                      const val = editingRowData[key];

                      if (col.readOnly) {
                        return (
                          <td key={key} className="px-3 py-2 font-mono text-[11px] text-slate-500 border-l border-amber-200">
                            <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded-xs">{val || row[key]}</span>
                          </td>
                        );
                      }

                      if (col.type === 'select' && col.options) {
                        return (
                          <td key={key} className="px-2 py-1.5 border-l border-amber-200">
                            <select
                              value={val !== undefined ? val : row[key]}
                              onChange={e => setEditingRowData(prev => ({ ...prev, [key]: e.target.value }))}
                              className="w-full px-2 py-1 bg-white border border-amber-400 rounded-xs text-xs font-bold text-slate-900"
                            >
                              {col.options.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                  {isAr ? opt.labelAr : opt.labelEn}
                                </option>
                              ))}
                            </select>
                          </td>
                        );
                      }

                      if (col.type === 'boolean') {
                        return (
                          <td key={key} className="px-3 py-2 text-center border-l border-amber-200">
                            <input
                              type="checkbox"
                              checked={val !== undefined ? val : row[key]}
                              onChange={e => setEditingRowData(prev => ({ ...prev, [key]: e.target.checked }))}
                              className="w-4 h-4 accent-amber-600 cursor-pointer"
                            />
                          </td>
                        );
                      }

                      return (
                        <td key={key} className="px-2 py-1.5 border-l border-amber-200">
                          <input
                            type={col.type === 'number' ? 'number' : 'text'}
                            value={val !== undefined ? val : row[key] || ''}
                            onChange={e => setEditingRowData(prev => ({ ...prev, [key]: col.type === 'number' ? Number(e.target.value) : e.target.value }))}
                            className="w-full px-2 py-1 bg-white border border-amber-400 rounded-xs text-xs font-bold text-slate-900 focus:outline-amber-600"
                          />
                        </td>
                      );
                    })}

                    <td className="px-2 py-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={handleSaveEdit}
                          className="p-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xs shadow-xs"
                          title={isAr ? 'حفظ التعديل' : 'Save'}
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xs"
                          title={isAr ? 'إلغاء' : 'Cancel'}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              // Standard View Row
              return (
                <tr key={row.id} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2 text-center font-mono text-[11px] text-slate-400 border-l border-slate-200">
                    {idx + 1}
                  </td>

                  {currentColumns.map(col => {
                    const key = col.key as string;
                    const val = row[key];

                    return (
                      <td key={key} className="px-3 py-2 border-l border-slate-200">
                        {col.type === 'boolean' ? (
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-xs ${
                            val ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {val ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Inactive')}
                          </span>
                        ) : col.key === 'id' ? (
                          <span className="font-mono text-[11px] font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded-xs border border-slate-200">
                            {val}
                          </span>
                        ) : col.key === 'status' ? (
                          <span className={`inline-flex px-2 py-0.5 text-[11px] font-bold rounded-xs ${
                            String(val).includes('كفاءة') || String(val).includes('متوفر') || String(val).includes('نشط') || String(val) === 'Active' || String(val) === 'Completed' || String(val) === 'In Stock' ? 'bg-emerald-100 text-emerald-800' :
                            String(val).includes('دورية') || String(val).includes('منخفض') || String(val) === 'In Progress' || String(val) === 'Action Plan Generated' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {val}
                          </span>
                        ) : col.key === 'amount' ? (
                          <span className="font-mono font-bold text-slate-900">{(Number(val) || 0).toLocaleString()} EGP</span>
                        ) : (
                          <span className="text-slate-800 font-medium">{val !== null && val !== undefined ? String(val) : '—'}</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Actions Column */}
                  <td className="px-2 py-2 text-center whitespace-nowrap">
                    {deleteConfirmId === row.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="px-2 py-1 bg-rose-600 text-white rounded-xs text-[10px] font-bold hover:bg-rose-700"
                        >
                          {isAr ? 'تأكيد الحذف' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-1 bg-slate-200 text-slate-700 rounded-xs text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(row)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-xs transition"
                          title={isAr ? 'تعديل هذا الصف' : 'Edit Row'}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(row.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xs transition"
                          title={isAr ? 'حذف هذا الصف' : 'Delete Row'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
