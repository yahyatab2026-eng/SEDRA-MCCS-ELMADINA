import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Settings, 
  FileSpreadsheet, 
  Cpu, 
  Download, 
  Plus, 
  Edit, 
  Check, 
  AlertCircle,
  Clock,
  Sparkles,
  Database,
  Globe,
  Sliders,
  Shield,
  Layers,
  Save,
  Trash2,
  ExternalLink,
  Mic,
  MapPin,
  Camera,
  Video,
  FileText,
  Key,
  Link2,
  RefreshCw,
  RotateCcw,
  Phone
} from 'lucide-react';
import { 
  initialLocations, 
  initialTechnicians, 
  initialAiLogs, 
  initialAssets, 
  initialSuppliers, 
  initialInventory 
} from '../data/seedData';
import { LocationItem, TechnicianItem, AiLogEntry, AssetRecord, SupplierItem, InventoryItem } from '../types';
import { useSystemSettings } from '../context/SystemSettingsContext';

interface AdminViewProps {
  lang: 'ar' | 'en';
}

export const AdminView: React.FC<AdminViewProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const {
    settings,
    updateFeatures,
    updateSla,
    updateGeneral,
    updateIntegrations,
    resetToDefaults
  } = useSystemSettings();

  const [activeTab, setActiveTab] = useState<
    'locations' | 'techs' | 'assets_db' | 'suppliers_db' | 'google_integrations' | 'ui_controls' | 'settings' | 'export' | 'ailogs'
  >('ui_controls');

  // Database Collections State (Managed locally with seed data + export/CRUD capabilities)
  const [locations, setLocations] = useState<LocationItem[]>(initialLocations);
  const [technicians, setTechnicians] = useState<TechnicianItem[]>(initialTechnicians);
  const [assets, setAssets] = useState<AssetRecord[]>(initialAssets);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(initialSuppliers);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [aiLogs, setAiLogs] = useState<AiLogEntry[]>(initialAiLogs);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // New Item Modals State (CRUD)
  const [newLocationModal, setNewLocationModal] = useState(false);
  const [newLocationForm, setNewLocationForm] = useState({
    id: `LOC-${locations.length + 1}`,
    name: '',
    type: 'فرع',
    region: 'القاهرة',
    lat: 30.0444,
    lng: 31.2357,
    address: ''
  });

  const [newTechModal, setNewTechModal] = useState(false);
  const [newTechForm, setNewTechForm] = useState({
    id: `TECH-${technicians.length + 1}`,
    name: '',
    phone: '',
    specialty: 'تبريد وتكييف',
    active: true
  });

  const handleTriggerSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetSettings = () => {
    if (window.confirm(isAr ? 'هل تريد استعادة جميع إعدادات النظام والواجهة إلى القيم الافتراضية المصنعية؟' : 'Reset all settings to default values?')) {
      resetToDefaults();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    }
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationForm.name) return;
    const item: LocationItem = {
      id: newLocationForm.id,
      name: newLocationForm.name,
      type: newLocationForm.type as any,
      region: newLocationForm.region,
      lat: Number(newLocationForm.lat),
      lng: Number(newLocationForm.lng),
      address: newLocationForm.address,
      org: 'Sidera Confectionery (سيدرا)',
      active: true
    };
    setLocations([item, ...locations]);
    setNewLocationModal(false);
    setNewLocationForm({
      id: `LOC-${locations.length + 2}`,
      name: '',
      type: 'فرع',
      region: 'القاهرة',
      lat: 30.0444,
      lng: 31.2357,
      address: ''
    });
  };

  const handleDeleteLocation = (id: string) => {
    if (confirm(isAr ? 'هل أنت متأكد من حذف هذا الموقع من قاعدة البيانات؟' : 'Delete this location?')) {
      setLocations(locations.filter(l => l.id !== id));
    }
  };

  const handleAddTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechForm.name) return;
    const item: TechnicianItem = {
      id: newTechForm.id,
      name: newTechForm.name,
      phone: newTechForm.phone,
      specialty: newTechForm.specialty,
      location: 'المركز الرئيسي',
      color: '#0d9488',
      active: newTechForm.active
    };
    setTechnicians([item, ...technicians]);
    setNewTechModal(false);
    setNewTechForm({
      id: `TECH-${technicians.length + 2}`,
      name: '',
      phone: '',
      specialty: 'تبريد وتكييف',
      active: true
    });
  };

  const handleDeleteTech = (id: string) => {
    if (confirm(isAr ? 'هل أنت متأكد من حذف هذا الفني؟' : 'Delete technician?')) {
      setTechnicians(technicians.filter(t => t.id !== id));
    }
  };

  const handleDownloadMockCsv = (sheetName: string) => {
    let rows: any[] = [];
    if (sheetName === 'Locations') rows = locations;
    else if (sheetName === 'Technicians') rows = technicians;
    else if (sheetName === 'Assets') rows = assets;
    else if (sheetName === 'Suppliers') rows = suppliers;
    else if (sheetName === 'AI_Log') rows = aiLogs;
    else rows = [{ id: 'WO-2026-000101', status: 'قيد التنفيذ', cost: 1200 }];

    const headers = Object.keys(rows[0] || {}).join(',');
    const csvContent = [
      headers,
      ...rows.map(r => Object.values(r).map(v => typeof v === 'object' ? JSON.stringify(v).replace(/"/g, '""') : `"${v}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sidrah_${sheetName}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner Header */}
      <div className="bg-white border-geometric p-4 sm:p-5 rounded-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-teal-700" />
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              {isAr ? 'لوحة الإدارة الشاملة والتحكم في قاعدة البيانات والربط السحابي' : 'Central Admin & Database Master Control'}
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {isAr 
              ? 'تحكم كامل وبدون برمجة في خصائص واجهات المستخدم، جداول قاعدة البيانات، وتكاملات Google Workspace السحابية مع الحفظ الفوري.'
              : 'Full no-code governance over UI components, databases, and Google Cloud endpoints.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {saveSuccess && (
            <div className="bg-emerald-100 text-emerald-800 border border-emerald-400 px-3 py-1.5 rounded-xs text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'تم حفظ ومزامنة كافة التغييرات بنجاح!' : 'Settings synced successfully!'}</span>
            </div>
          )}

          {resetSuccess && (
            <div className="bg-amber-100 text-amber-800 border border-amber-400 px-3 py-1.5 rounded-xs text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4 text-amber-600" />
              <span>{isAr ? 'تمت استعادة الإعدادات الافتراضية بنجاح!' : 'Defaults restored!'}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleResetSettings}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xs flex items-center gap-1.5 transition border border-slate-300"
            title={isAr ? 'استعادة إعدادات المصنع الافتراضية' : 'Restore Factory Defaults'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'استعادة الافتراضيات' : 'Reset Defaults'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTriggerSave()}
            className="px-4 py-2 accent-teal text-white text-xs font-bold rounded-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isAr ? 'تأكيد الحفظ والمزامنة' : 'Save & Sync'}</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-1 space-x-reverse text-xs sm:text-sm font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('ui_controls')}
          className={`px-3.5 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ui_controls'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{isAr ? '🎛️ تحكم واجهات المستخدم والخصائص' : 'UI Feature Controls'}</span>
        </button>

        <button
          onClick={() => setActiveTab('google_integrations')}
          className={`px-3.5 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'google_integrations'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>{isAr ? '🔗 ربط خدمات Google والـ API' : 'Google Integrations'}</span>
        </button>

        <button
          onClick={() => setActiveTab('locations')}
          className={`px-3.5 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'locations'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{isAr ? `🏢 المواقع والفروع (${locations.length})` : 'Locations'}</span>
        </button>

        <button
          onClick={() => setActiveTab('techs')}
          className={`px-3.5 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'techs'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isAr ? `👨‍🔧 الفنيون (${technicians.length})` : 'Technicians'}</span>
        </button>

        <button
          onClick={() => setActiveTab('assets_db')}
          className={`px-3.5 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'assets_db'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>{isAr ? `⚙️ قاعدة الماكينات (${assets.length})` : 'Assets DB'}</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{isAr ? '⚙️ إعدادات الـ SLA والنظام' : 'SLA & Org'}</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`px-3.5 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'export'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{isAr ? '📥 تصدير CSV' : 'Export'}</span>
        </button>

        <button
          onClick={() => setActiveTab('ailogs')}
          className={`px-3.5 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ailogs'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isAr ? '🤖 سجلات Gemini AI' : 'AI Logs'}</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 0: UI & FEATURE MASTER CONTROLS */}
      {/* ==================================================================== */}
      {activeTab === 'ui_controls' && (
        <section className="space-y-5 animate-in fade-in duration-150">
          <div className="bg-white border-geometric rounded-xs p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  {isAr ? 'التحكم الفوري في خصائص واجهة إبلاغ الأعطال والنظام (No-Code Feature Flags)' : 'UI Feature Toggles'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تفعيل أو تعطيل أي ميزة برمجية مباشرة بضغطة زر دون تعديل الكود المصدري، وتنعكس فورياً على شاشات البلاغ والنظام.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleTriggerSave()}
                className="px-4 py-2 accent-teal text-white text-xs font-bold rounded-xs flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isAr ? 'حفظ تفضيلات الواجهة' : 'Save Preferences'}</span>
              </button>
            </div>

            {/* Feature Toggle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              
              {/* Feature 1: GPS */}
              <div className="p-3.5 bg-slate-50 border-geometric rounded-xs flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span>تسجيل موقع الـ GPS تلقائياً</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    التقاط إحداثيات خط العرض والطول للمُبلّغ بدقة عند فتح البلاغ وربطها بالخريطة.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.features.enableGpsTracking}
                  onChange={e => updateFeatures({ enableGpsTracking: e.target.checked })}
                  className="w-4 h-4 accent-teal cursor-pointer mt-1"
                />
              </div>

              {/* Feature 2: Timestamp */}
              <div className="p-3.5 bg-slate-50 border-geometric rounded-xs flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Clock className="w-4 h-4 text-teal-700" />
                    <span>التوثيق الزمني والتاريخ التلقائي</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    ختم وقت الإبلاغ بالثانية لحساب اتفاقيات الـ SLA بدقة متناهية.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.features.enableAutoTimestamp}
                  onChange={e => updateFeatures({ enableAutoTimestamp: e.target.checked })}
                  className="w-4 h-4 accent-teal cursor-pointer mt-1"
                />
              </div>

              {/* Feature 3: Voice Note */}
              <div className="p-3.5 bg-slate-50 border-geometric rounded-xs flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Mic className="w-4 h-4 text-indigo-600" />
                    <span>تسجيل الرسائل الصوتية (Voice Notes)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    السماح للشيفات والمهندسين بتسجيل شرح صوتي مباشر للعطل وسماعه من قبل الفني.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.features.enableVoiceRecording}
                  onChange={e => updateFeatures({ enableVoiceRecording: e.target.checked })}
                  className="w-4 h-4 accent-teal cursor-pointer mt-1"
                />
              </div>

              {/* Feature 4: Video Upload */}
              <div className="p-3.5 bg-slate-50 border-geometric rounded-xs flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Video className="w-4 h-4 text-purple-600" />
                    <span>رفع فيديو قصير لوصف العطل</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    توثيق صوت الماكينة أو التسريب أو الشرز الكهربائي بمقطع فيديو مباشر.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.features.enableVideoUpload}
                  onChange={e => updateFeatures({ enableVideoUpload: e.target.checked })}
                  className="w-4 h-4 accent-teal cursor-pointer mt-1"
                />
              </div>

              {/* Feature 5: Document Upload */}
              <div className="p-3.5 bg-slate-50 border-geometric rounded-xs flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>إرفاق مستندات وكتالوجات (PDF/Docs)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    إرفاق تقارير الجودة ومستندات الفحص الفني والمانيوال مع البلاغ.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.features.enableDocumentUpload}
                  onChange={e => updateFeatures({ enableDocumentUpload: e.target.checked })}
                  className="w-4 h-4 accent-teal cursor-pointer mt-1"
                />
              </div>

              {/* Feature 6: Gemini AI */}
              <div className="p-3.5 bg-slate-50 border-geometric rounded-xs flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>التشخيص الذكي الفوري (Gemini AI)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    توليد السبب الجذري وإجراءات السلامة وقطع الغيار المقترحة تلقائياً.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.features.enableGeminiDiagnosis}
                  onChange={e => updateFeatures({ enableGeminiDiagnosis: e.target.checked })}
                  className="w-4 h-4 accent-teal cursor-pointer mt-1"
                />
              </div>

              {/* Feature 7: QR Scanner */}
              <div className="p-3.5 bg-slate-50 border-geometric rounded-xs flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Cpu className="w-4 h-4 text-slate-800" />
                    <span>قارئ QR Code للماكينات</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    مسح كود الماكينة بالهاتف لجلب مواصفاتها وخط الإنتاج فوراً.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.features.enableQrScanning}
                  onChange={e => updateFeatures({ enableQrScanning: e.target.checked })}
                  className="w-4 h-4 accent-teal cursor-pointer mt-1"
                />
              </div>

              {/* Feature 8: WhatsApp Direct */}
              <div className="p-3.5 bg-slate-50 border-geometric rounded-xs flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>إرسال وتوجيه WhatsApp فوري</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    توليد رابط واتساب منسق بالصوت والموقع لإرساله لجروب طوارئ الصيانة.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.features.enableWhatsAppDirectDispatch}
                  onChange={e => updateFeatures({ enableWhatsAppDirectDispatch: e.target.checked })}
                  className="w-4 h-4 accent-teal cursor-pointer mt-1"
                />
              </div>

              {/* Feature 9: Cost Tracking */}
              <div className="p-3.5 bg-slate-50 border-geometric rounded-xs flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Database className="w-4 h-4 text-amber-600" />
                    <span>حساب التكاليف وقطع الغيار</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    إلزام الفني بإدخال فواتير قطع الغيار وساعات العمل لحساب التكلفة.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.features.enableCostTracking}
                  onChange={e => updateFeatures({ enableCostTracking: e.target.checked })}
                  className="w-4 h-4 accent-teal cursor-pointer mt-1"
                />
              </div>

              {/* Feature 10: Require Photo Policy */}
              <div className="p-3.5 bg-slate-50 border-geometric rounded-xs flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Camera className="w-4 h-4 text-teal-600" />
                    <span>إلزامية التقاط صورة للعطل</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    منع إرسال البلاغ ما لم يقم المبلّغ برفع صورة واضحة لحالة الماكينة.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.features.requirePhotoBeforeSubmit}
                  onChange={e => updateFeatures({ requirePhotoBeforeSubmit: e.target.checked })}
                  className="w-4 h-4 accent-teal cursor-pointer mt-1"
                />
              </div>

              {/* Feature 11: Require Voice Policy */}
              <div className="p-3.5 bg-slate-50 border-geometric rounded-xs flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Mic className="w-4 h-4 text-indigo-600" />
                    <span>إلزامية التسجيل الصوتي</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    اشتراط تسجيل صوتي يشرح العطل قبل السماح بتقديم البلاغ.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.features.requireVoiceBeforeSubmit}
                  onChange={e => updateFeatures({ requireVoiceBeforeSubmit: e.target.checked })}
                  className="w-4 h-4 accent-teal cursor-pointer mt-1"
                />
              </div>

              {/* Feature 12: SLA Alerts */}
              <div className="p-3.5 bg-slate-50 border-geometric rounded-xs flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>تنبيهات تجاوز الـ SLA</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    إطلاق تنبيهات حمراء وتصعيد البلاغات المتأخرة عن مهلة الاستجابة.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.features.enableSlaAlerts}
                  onChange={e => updateFeatures({ enableSlaAlerts: e.target.checked })}
                  className="w-4 h-4 accent-teal cursor-pointer mt-1"
                />
              </div>

            </div>

            {/* Media Upload Limits */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h4 className="font-bold text-xs text-slate-900">قيود وحدود رفع الوسائط (Media Upload Limits):</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">أقصى حجم للفيديو المرفوع (ميجابايت MB):</label>
                  <input 
                    type="number" 
                    min={5}
                    max={100}
                    value={settings.features.maxVideoSizeMb}
                    onChange={e => updateFeatures({ maxVideoSizeMb: Number(e.target.value) || 25 })}
                    className="w-full px-3 py-2 border-geometric rounded-xs bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">أقصى مدة للرسالة الصوتية (بالثواني):</label>
                  <input 
                    type="number" 
                    min={15}
                    max={300}
                    value={settings.features.maxVoiceDurationSec}
                    onChange={e => updateFeatures({ maxVoiceDurationSec: Number(e.target.value) || 120 })}
                    className="w-full px-3 py-2 border-geometric rounded-xs bg-slate-50 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Application Branding & Text Customization */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h4 className="font-bold text-xs text-slate-900">تخصيص نصوص وترويسة النظام والخط الساخن للطوارئ:</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم النظام بالعربية:</label>
                  <input 
                    type="text" 
                    value={settings.features.appNameAr}
                    onChange={e => updateFeatures({ appNameAr: e.target.value })}
                    className="w-full px-3 py-2 border-geometric rounded-xs bg-slate-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم النظام بالإنجليزية:</label>
                  <input 
                    type="text" 
                    value={settings.features.appNameEn}
                    onChange={e => updateFeatures({ appNameEn: e.target.value })}
                    className="w-full px-3 py-2 border-geometric rounded-xs bg-slate-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم خط طوارئ الصيانة السريع:</label>
                  <input 
                    type="text" 
                    value={settings.features.supportEmergencyHotline}
                    onChange={e => updateFeatures({ supportEmergencyHotline: e.target.value })}
                    className="w-full px-3 py-2 border-geometric rounded-xs bg-slate-50 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* TAB 1: GOOGLE INTEGRATIONS & CLOUD ENDPOINTS */}
      {/* ==================================================================== */}
      {activeTab === 'google_integrations' && (
        <section className="space-y-5 animate-in fade-in duration-150">
          <div className="bg-white border-geometric rounded-xs p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  {isAr ? '🔗 مركز ربط وإدارة خدمات Google Workspace & Cloud API' : 'Google Ecosystem Integration Hub'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  إدارة عناوين الـ Endpoints والـ Webhook وقواعد بيانات Google Sheets و Google Maps دون الحاجة لكتابة كود.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleTriggerSave()}
                className="px-4 py-2 accent-teal text-white text-xs font-bold rounded-xs flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isAr ? 'حفظ وتحديث نقاط الربط' : 'Save Integrations'}</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* 1. Google Sheets Master Database ID */}
              <div className="p-4 bg-slate-50 border-geometric rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-slate-900">قاعدة بيانات Google Sheets الرئيسية (Database Spreadsheet ID):</span>
                  </div>
                  <a 
                    href={settings.integrations.spreadsheetUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-teal-700 hover:underline flex items-center gap-1 font-bold text-[11px]"
                  >
                    <span>فتح الشيت مباشرة في نافذة جديدة</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input 
                  type="text" 
                  value={settings.integrations.spreadsheetId}
                  onChange={e => updateIntegrations({ 
                    spreadsheetId: e.target.value,
                    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${e.target.value}/edit`
                  })}
                  className="w-full px-3 py-2 border-geometric rounded-xs bg-white font-mono text-slate-800"
                />
                <p className="text-[11px] text-slate-500">
                  يتضمن 7 أوراق رئيسية: (WoHeaders, Visits, Locations, Technicians, Inventory, Custodies, AI_Log).
                </p>
              </div>

              {/* 2. Google Apps Script Web App Endpoint */}
              <div className="p-4 bg-slate-50 border-geometric rounded-xs space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-700" />
                  <span className="font-bold text-slate-900">رابط تطبيق Google Apps Script Web App (Webhook Endpoint):</span>
                </div>
                <input 
                  type="url" 
                  value={settings.integrations.appsScriptWebappUrl}
                  onChange={e => updateIntegrations({ appsScriptWebappUrl: e.target.value })}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3 py-2 border-geometric rounded-xs bg-white font-mono text-slate-800"
                />
                <p className="text-[11px] text-slate-500">
                  نقطة النهاية REST API المستلمة للبلاغات، وتوليد إشعارات التكليف، ومزامنة أوامر الشغل ثنائية الاتجاه.
                </p>
              </div>

              {/* 3. Google Gemini Model Configuration */}
              <div className="p-4 bg-slate-50 border-geometric rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span className="font-bold text-slate-900">نموذج الذكاء الاصطناعي (Gemini Vision AI Model):</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-xs">
                    {settings.integrations.geminiApiKeyStatus}
                  </span>
                </div>
                <select
                  value={settings.integrations.geminiModel}
                  onChange={e => updateIntegrations({ geminiModel: e.target.value })}
                  className="w-full px-3 py-2 border-geometric rounded-xs bg-white font-mono font-bold"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (فائق السرعة واقتصادي - الافتراضي والموصى به)</option>
                  <option value="gemini-3-flash">gemini-3-flash (أحدث جيل فلاش)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (استدلال متعمق للأعطال الهيدروليكية المعقدة)</option>
                </select>
              </div>

              {/* 4. Google Maps Platform & Drive Vault */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-slate-50 border-geometric rounded-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span>مفتاح خرائط Google Maps Platform API:</span>
                  </div>
                  <input 
                    type="text" 
                    value={settings.integrations.googleMapsApiKey}
                    onChange={e => updateIntegrations({ googleMapsApiKey: e.target.value })}
                    className="w-full px-3 py-2 border-geometric rounded-xs bg-white font-mono"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 border-geometric rounded-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Database className="w-4 h-4 text-teal-700" />
                    <span>معرف مجلد وسائط Google Drive Vault:</span>
                  </div>
                  <input 
                    type="text" 
                    value={settings.integrations.googleDriveFolderId}
                    onChange={e => updateIntegrations({ googleDriveFolderId: e.target.value })}
                    className="w-full px-3 py-2 border-geometric rounded-xs bg-white font-mono"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: LOCATIONS DATABASE */}
      {/* ==================================================================== */}
      {activeTab === 'locations' && (
        <section className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">سجل المواقع والفروع والمصانع (Locations DB)</h3>
              <p className="text-xs text-slate-500">إدارة {locations.length} موقعاً معتمداً مع الإحداثيات الجغرافية الكاملة</p>
            </div>
            <button 
              onClick={() => setNewLocationModal(true)}
              className="px-3.5 py-1.5 accent-teal text-white rounded-xs text-xs font-bold transition shadow-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة موقع / فرع جديد</span>
            </button>
          </div>

          {/* Add Location Modal */}
          {newLocationModal && (
            <div className="bg-slate-50 border-2 border-teal-600 p-4 rounded-xs space-y-3 animate-in fade-in">
              <h4 className="font-black text-xs text-slate-900">إدخال موقع أو فرع جديد لقاعدة البيانات:</h4>
              <form onSubmit={handleAddLocation} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">كود الموقع:</label>
                  <input 
                    type="text" 
                    value={newLocationForm.id} 
                    onChange={e => setNewLocationForm({ ...newLocationForm, id: e.target.value })} 
                    className="w-full p-2 border-geometric rounded-xs bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الموقع:</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="مثال: فرع الزمالك - حسن صبري" 
                    value={newLocationForm.name} 
                    onChange={e => setNewLocationForm({ ...newLocationForm, name: e.target.value })} 
                    className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع الموقع:</label>
                  <select 
                    value={newLocationForm.type} 
                    onChange={e => setNewLocationForm({ ...newLocationForm, type: e.target.value })} 
                    className="w-full p-2 border-geometric rounded-xs bg-white"
                  >
                    <option value="فرع">فرع بيع وتوزيع</option>
                    <option value="مصنع">مصنع مركزي</option>
                    <option value="مستودع">مستودع إقليمي</option>
                    <option value="مبنى إداري">مبنى إداري</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المنطقة:</label>
                  <input 
                    type="text" 
                    value={newLocationForm.region} 
                    onChange={e => setNewLocationForm({ ...newLocationForm, region: e.target.value })} 
                    className="w-full p-2 border-geometric rounded-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">خط العرض (Lat):</label>
                  <input 
                    type="number" 
                    step="0.0001" 
                    value={newLocationForm.lat} 
                    onChange={e => setNewLocationForm({ ...newLocationForm, lat: Number(e.target.value) })} 
                    className="w-full p-2 border-geometric rounded-xs bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">خط الطول (Lng):</label>
                  <input 
                    type="number" 
                    step="0.0001" 
                    value={newLocationForm.lng} 
                    onChange={e => setNewLocationForm({ ...newLocationForm, lng: Number(e.target.value) })} 
                    className="w-full p-2 border-geometric rounded-xs bg-white font-mono"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setNewLocationModal(false)} 
                    className="px-3 py-1.5 border-geometric text-slate-700 rounded-xs text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-1.5 accent-teal text-white rounded-xs text-xs font-bold"
                  >
                    حفظ الموقع
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white border-geometric rounded-xs shadow-xs overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">الكود</th>
                  <th className="px-4 py-3">اسم الموقع</th>
                  <th className="px-4 py-3">النوع</th>
                  <th className="px-4 py-3">المنطقة</th>
                  <th className="px-4 py-3">الإحداثيات الجغرافية</th>
                  <th className="px-4 py-3">العنوان بالتفصيل</th>
                  <th className="px-4 py-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {locations.map(loc => (
                  <tr key={loc.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-900">{loc.id}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{loc.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                        {loc.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">{loc.region}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-slate-600">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</td>
                    <td className="px-4 py-2.5 text-slate-600 max-w-[220px] truncate" title={loc.address}>{loc.address}</td>
                    <td className="px-4 py-2.5 text-center">
                      <button 
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        title="حذف الموقع"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: TECHNICIANS DATABASE */}
      {/* ==================================================================== */}
      {activeTab === 'techs' && (
        <section className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">سجل الفنيين والمهندسين (Technicians DB)</h3>
              <p className="text-xs text-slate-500">إدارة فريق الصيانة الميدانية والتخصصات الهندسية</p>
            </div>
            <button 
              onClick={() => setNewTechModal(true)}
              className="px-3.5 py-1.5 accent-teal text-white rounded-xs text-xs font-bold transition shadow-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة فني جديد</span>
            </button>
          </div>

          {/* Add Tech Modal */}
          {newTechModal && (
            <div className="bg-slate-50 border-2 border-teal-600 p-4 rounded-xs space-y-3 animate-in fade-in">
              <h4 className="font-black text-xs text-slate-900">إضافة فني جديد لفريق الصيانة:</h4>
              <form onSubmit={handleAddTech} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">كود الفني:</label>
                  <input 
                    type="text" 
                    value={newTechForm.id} 
                    onChange={e => setNewTechForm({ ...newTechForm, id: e.target.value })} 
                    className="w-full p-2 border-geometric rounded-xs bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الفني:</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="مثال: م. ياسر الديب" 
                    value={newTechForm.name} 
                    onChange={e => setNewTechForm({ ...newTechForm, name: e.target.value })} 
                    className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف:</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="010..." 
                    value={newTechForm.phone} 
                    onChange={e => setNewTechForm({ ...newTechForm, phone: e.target.value })} 
                    className="w-full p-2 border-geometric rounded-xs bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التخصص:</label>
                  <select 
                    value={newTechForm.specialty} 
                    onChange={e => setNewTechForm({ ...newTechForm, specialty: e.target.value })} 
                    className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                  >
                    <option value="تبريد وتكييف">تبريد وتكييف</option>
                    <option value="كهرباء ولوحات">كهرباء ولوحات تحكم</option>
                    <option value="أفران ومخابز">أفران ومخابز</option>
                    <option value="بسترة ومجنسات">بسترة ومجنسات ألبان</option>
                    <option value="غلايات وبخار">غلايات وبخار</option>
                  </select>
                </div>
                <div className="sm:col-span-4 flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setNewTechModal(false)} 
                    className="px-3 py-1.5 border-geometric text-slate-700 rounded-xs text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-1.5 accent-teal text-white rounded-xs text-xs font-bold"
                  >
                    حفظ الفني
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white border-geometric rounded-xs shadow-xs overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">الكود</th>
                  <th className="px-4 py-3">اسم الفني</th>
                  <th className="px-4 py-3">رقم الهاتف</th>
                  <th className="px-4 py-3">التخصص الرئيسي</th>
                  <th className="px-4 py-3">الحالة الميدانية</th>
                  <th className="px-4 py-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {technicians.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-900">{t.id}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{t.name}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">{t.phone}</td>
                    <td className="px-4 py-2.5 text-slate-800 font-medium">{t.specialty}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        متاح ونشط
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button 
                        onClick={() => handleDeleteTech(t.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        title="حذف الفني"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: ASSETS & MACHINES DATABASE */}
      {/* ==================================================================== */}
      {activeTab === 'assets_db' && (
        <section className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">سجل المعدات والماكينات (Assets Master DB)</h3>
              <p className="text-xs text-slate-500">إدارة {assets.length} ماكينة وخط إنتاج مسجل بأكواد QR Code</p>
            </div>
            <button 
              onClick={() => alert('إضافة ماكينة جديدة')}
              className="px-3.5 py-1.5 accent-teal text-white rounded-xs text-xs font-bold transition shadow-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة ماكينة جديدة</span>
            </button>
          </div>

          <div className="bg-white border-geometric rounded-xs shadow-xs overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">الكود</th>
                  <th className="px-4 py-3">اسم الماكينة / المعدة</th>
                  <th className="px-4 py-3">الموقع / الفرع</th>
                  <th className="px-4 py-3">التصنيف</th>
                  <th className="px-4 py-3">الموديل والشركة</th>
                  <th className="px-4 py-3">الحالة التشغيلية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {assets.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-900">{a.id}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{a.name}</td>
                    <td className="px-4 py-2.5 text-slate-700">{a.location_name || a.location_id}</td>
                    <td className="px-4 py-2.5 text-slate-800">{a.category}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">{a.model || a.manufacturer || 'قياسي'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold border ${
                        a.status.includes('تعمل') ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: SYSTEM & SLA SETTINGS */}
      {/* ==================================================================== */}
      {activeTab === 'settings' && (
        <section className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white border-geometric rounded-xs p-6 space-y-5 max-w-3xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  {isAr ? 'إعدادات المؤسسة وحوكمة اتفاقيات مستوى الخدمة (SLA Policies)' : 'Organization & SLA Governance'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAr ? 'تعديل فترات الاستجابة القصوى لكل درجة خطورة وبيانات التواصل الإداري مع الحفظ التلقائي.' : 'Configure SLA thresholds and contact details.'}
                </p>
              </div>

              <button 
                type="button" 
                onClick={() => handleTriggerSave()}
                className="px-4 py-2 accent-teal text-white font-bold rounded-xs text-xs transition shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isAr ? 'حفظ ومزامنة السياسات' : 'Save Policies'}</span>
              </button>
            </div>

            <div className="space-y-5 text-xs">
              {/* Organization Profile */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-teal-700" />
                  <span>معلومات المؤسسة والقطاع:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اسم المؤسسة (Organization Name):</label>
                    <input 
                      type="text" 
                      value={settings.general.orgName} 
                      onChange={e => updateGeneral({ orgName: e.target.value })} 
                      className="w-full px-3 py-2 border-geometric rounded-xs font-bold bg-slate-50 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">المنطقة الزمنية (Timezone):</label>
                    <input 
                      type="text" 
                      value={settings.general.timezone} 
                      onChange={e => updateGeneral({ timezone: e.target.value })} 
                      className="w-full px-3 py-2 border-geometric rounded-xs font-mono bg-slate-50 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Management Contacts */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-indigo-700" />
                  <span>قنوات الإخطار الإداري وطوارئ الصيانة المركزية:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">بريد مدير الصيانة للإشعارات والتقارير:</label>
                    <input 
                      type="email" 
                      value={settings.general.managerEmail} 
                      onChange={e => updateGeneral({ managerEmail: e.target.value })} 
                      className="w-full px-3 py-2 border-geometric rounded-xs font-mono bg-slate-50 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">هاتف المدير لإشعارات وتنبيهات WhatsApp:</label>
                    <input 
                      type="text" 
                      value={settings.general.managerPhone} 
                      onChange={e => updateGeneral({ managerPhone: e.target.value })} 
                      className="w-full px-3 py-2 border-geometric rounded-xs font-mono bg-slate-50 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* SLA Hours per Priority */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-700" />
                  <span>فترات الـ SLA القصوى للاستجابة حسب درجة الأولوية (بالساعات):</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xs space-y-1">
                    <span className="block font-bold text-rose-900 text-[11px]">🔴 عطل حرج (توقف إنتاج):</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        min={1}
                        max={48}
                        value={settings.sla.urgentHours} 
                        onChange={e => updateSla({ urgentHours: Number(e.target.value) || 2 })} 
                        className="w-full px-2 py-1.5 border border-rose-300 rounded-xs font-mono font-bold bg-white text-rose-900 text-center"
                      />
                      <span className="text-[10px] text-rose-700 font-bold">ساعة</span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xs space-y-1">
                    <span className="block font-bold text-amber-900 text-[11px]">🟠 أولوية عالية:</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        min={1}
                        max={72}
                        value={settings.sla.highHours} 
                        onChange={e => updateSla({ highHours: Number(e.target.value) || 6 })} 
                        className="w-full px-2 py-1.5 border border-amber-300 rounded-xs font-mono font-bold bg-white text-amber-900 text-center"
                      />
                      <span className="text-[10px] text-amber-700 font-bold">ساعة</span>
                    </div>
                  </div>

                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xs space-y-1">
                    <span className="block font-bold text-sky-900 text-[11px]">🔵 أولوية متوسطة:</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        min={1}
                        max={120}
                        value={settings.sla.mediumHours} 
                        onChange={e => updateSla({ mediumHours: Number(e.target.value) || 12 })} 
                        className="w-full px-2 py-1.5 border border-sky-300 rounded-xs font-mono font-bold bg-white text-sky-900 text-center"
                      />
                      <span className="text-[10px] text-sky-700 font-bold">ساعة</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs space-y-1">
                    <span className="block font-bold text-slate-900 text-[11px]">⚪ أولوية عادية / منخفضة:</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        min={1}
                        max={240}
                        value={settings.sla.normalHours} 
                        onChange={e => updateSla({ normalHours: Number(e.target.value) || 24 })} 
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-xs font-mono font-bold bg-white text-slate-900 text-center"
                      />
                      <span className="text-[10px] text-slate-700 font-bold">ساعة</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between p-3 bg-slate-50 border-geometric rounded-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 text-xs">التصعيد التلقائي للبلاغات المتأخرة (Auto-Escalation):</span>
                    <p className="text-[11px] text-slate-500">إرسال إشعار فوري لمدير الصيانة في حال تجاوز 75% من وقت الـ SLA المحدد للبلاغ.</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={settings.sla.autoEscalate}
                    onChange={e => updateSla({ autoEscalate: e.target.checked })}
                    className="w-4 h-4 accent-teal cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="button" 
                  onClick={() => handleTriggerSave()}
                  className="px-6 py-2.5 accent-teal text-white font-bold rounded-xs text-xs transition shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التغييرات ومزامنة السياسات</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: CSV EXPORT */}
      {/* ==================================================================== */}
      {activeTab === 'export' && (
        <section className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white border-geometric rounded-xs p-6 space-y-4 max-w-xl">
            <h3 className="font-bold text-base text-slate-900">تصدير جداول البيانات (Export to CSV)</h3>
            <p className="text-xs text-slate-500">تحميل أي جدول من جداول قاعدة البيانات كملف CSV نظيف للتقارير الإدارية والتحليل الإحصائي.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => handleDownloadMockCsv('WoHeaders')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border-geometric rounded-xs text-right transition flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-xs block text-slate-900">سجل البلاغات (WoHeaders)</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">شاملاً الـ GPS والصوت والتشخيص</span>
                </div>
                <Download className="w-4 h-4 text-slate-600" />
              </button>

              <button 
                onClick={() => handleDownloadMockCsv('Visits')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border-geometric rounded-xs text-right transition flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-xs block text-slate-900">سجل الزيارات (Visits)</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">إحداثيات GPS وساعات العمل والقطع</span>
                </div>
                <Download className="w-4 h-4 text-slate-600" />
              </button>

              <button 
                onClick={() => handleDownloadMockCsv('Locations')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border-geometric rounded-xs text-right transition flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-xs block text-slate-900">المواقع والفروع (Locations)</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">قائمة المواقع والإحداثيات</span>
                </div>
                <Download className="w-4 h-4 text-slate-600" />
              </button>

              <button 
                onClick={() => handleDownloadMockCsv('AI_Log')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border-geometric rounded-xs text-right transition flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-xs block text-slate-900">سجلات الذكاء الاصطناعي (AI_Log)</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">أزمنة الاستجابة ومعدلات النجاح</span>
                </div>
                <Download className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* TAB 7: AI LOGS */}
      {/* ==================================================================== */}
      {activeTab === 'ailogs' && (
        <section className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">سجل استدعاءات الذكاء الاصطناعي (AI_Log)</h3>
              <p className="text-xs text-slate-500">توثيق شفاف لجميع استدعاءات Gemini REST API ومدة المعالجة بالميلي ثانية</p>
            </div>
          </div>

          <div className="bg-white border-geometric rounded-xs shadow-xs overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">الوقت والتاريخ</th>
                  <th className="px-4 py-3">رقم البلاغ</th>
                  <th className="px-4 py-3">الإجراء المنفذ</th>
                  <th className="px-4 py-3">النموذج</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3">المدة (ms)</th>
                  <th className="px-4 py-3">الملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-mono">
                {aiLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 text-[11px]">
                    <td className="px-4 py-2.5 text-slate-500">{log.ts}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{log.wo_id}</td>
                    <td className="px-4 py-2.5 text-teal-800 font-sans font-bold">{log.action}</td>
                    <td className="px-4 py-2.5 text-slate-600">{log.model}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-100 text-emerald-800 font-sans border border-emerald-300">
                        OK (200)
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-800">{log.ms} ms</td>
                    <td className="px-4 py-2.5 text-slate-600 font-sans max-w-[280px] truncate" title={log.note}>{log.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

    </div>
  );
};
