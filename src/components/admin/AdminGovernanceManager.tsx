import React, { useState } from 'react';
import { GovernanceRecord, AdminDecision } from '../../types';
import { 
  ShieldCheck, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Check, 
  X, 
  Users, 
  Building2, 
  Download, 
  Calendar, 
  Award,
  Layers,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

interface AdminGovernanceManagerProps {
  governance: GovernanceRecord[];
  decisions: AdminDecision[];
  onUpdateGovernance: (newGov: GovernanceRecord[]) => void;
  onUpdateDecisions: (newDecs: AdminDecision[]) => void;
  isAr: boolean;
}

export const AdminGovernanceManager: React.FC<AdminGovernanceManagerProps> = ({
  governance,
  decisions,
  onUpdateGovernance,
  onUpdateDecisions,
  isAr
}) => {
  const [subTab, setSubTab] = useState<'governance' | 'decisions'>('governance');
  const [search, setSearch] = useState('');
  
  // Governance modal states
  const [govModalOpen, setGovModalOpen] = useState(false);
  const [editingGov, setEditingGov] = useState<GovernanceRecord | null>(null);
  const [govFormData, setGovFormData] = useState<Partial<GovernanceRecord>>({
    id: `GOV-00${governance.length + 1}`,
    name: '',
    role: 'عضو لجنة الحوكمة',
    ownership: 'إشراف هندسي',
    scope: '',
    status: 'Active'
  });

  // Decision modal states
  const [decModalOpen, setDecModalOpen] = useState(false);
  const [editingDec, setEditingDec] = useState<AdminDecision | null>(null);
  const [decFormData, setDecFormData] = useState<Partial<AdminDecision>>({
    id: `DEC-2026-00${decisions.length + 1}`,
    title: '',
    author: 'Eng. Yahia Tarek Farag (Director of Engineering)',
    org: 'Group Enterprise',
    date: '2026-08-28',
    effectiveDate: '2026-08-28',
    scope: '',
    status: 'Active',
    details: ''
  });

  // Filters
  const filteredGov = governance.filter(g => {
    const q = search.toLowerCase();
    return (g.name || '').toLowerCase().includes(q) ||
      (g.role || '').toLowerCase().includes(q) ||
      (g.scope || '').toLowerCase().includes(q) ||
      (g.ownership || '').toLowerCase().includes(q);
  });

  const filteredDec = decisions.filter(d => {
    const q = search.toLowerCase();
    return (d.title || '').toLowerCase().includes(q) ||
      (d.author || '').toLowerCase().includes(q) ||
      (d.scope || '').toLowerCase().includes(q) ||
      (d.id || '').toLowerCase().includes(q);
  });

  // Handlers for Governance
  const handleOpenAddGov = () => {
    setGovFormData({
      id: `GOV-00${governance.length + 1}`,
      name: '',
      role: 'عضو لجنة الحوكمة',
      ownership: 'إشراف هندسي',
      scope: '',
      status: 'Active'
    });
    setGovModalOpen(true);
  };

  const handleOpenEditGov = (g: GovernanceRecord) => {
    setEditingGov(g);
    setGovFormData({ ...g });
  };

  const handleSaveNewGov = (e: React.FormEvent) => {
    e.preventDefault();
    if (!govFormData.name || !govFormData.role) return;
    const newRecord: GovernanceRecord = {
      id: govFormData.id || `GOV-00${Date.now().toString().slice(-3)}`,
      name: govFormData.name,
      role: govFormData.role,
      ownership: govFormData.ownership || 'نطاق إشرافي',
      scope: govFormData.scope || 'حوكمة ومتابعة العمليات',
      status: govFormData.status || 'Active'
    };
    onUpdateGovernance([newRecord, ...governance]);
    setGovModalOpen(false);
  };

  const handleSaveEditGov = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGov || !govFormData.name) return;
    const updated = governance.map(g => {
      if (g.id === editingGov.id) {
        return {
          ...g,
          name: govFormData.name || g.name,
          role: govFormData.role || g.role,
          ownership: govFormData.ownership || g.ownership,
          scope: govFormData.scope || g.scope,
          status: govFormData.status || g.status
        };
      }
      return g;
    });
    onUpdateGovernance(updated);
    setEditingGov(null);
  };

  const handleDeleteGov = (id: string) => {
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذا السجل من الهيكل الإداري ولجنة الحوكمة؟' : 'Delete this governance record?')) {
      onUpdateGovernance(governance.filter(g => g.id !== id));
    }
  };

  // Handlers for Decisions
  const handleOpenAddDec = () => {
    setDecFormData({
      id: `DEC-2026-00${decisions.length + 1}`,
      title: '',
      author: 'Eng. Yahia Tarek Farag (Director of Engineering)',
      org: 'Group Enterprise',
      date: new Date().toISOString().slice(0, 10),
      effectiveDate: new Date().toISOString().slice(0, 10),
      scope: '',
      status: 'Active',
      details: ''
    });
    setDecModalOpen(true);
  };

  const handleOpenEditDec = (d: AdminDecision) => {
    setEditingDec(d);
    setDecFormData({ ...d });
  };

  const handleSaveNewDec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decFormData.title || !decFormData.scope) return;
    const newRecord: AdminDecision = {
      id: decFormData.id || `DEC-2026-00${Date.now().toString().slice(-3)}`,
      title: decFormData.title,
      author: decFormData.author || 'Director of Engineering',
      org: decFormData.org || 'Group Enterprise',
      date: decFormData.date || new Date().toISOString().slice(0, 10),
      effectiveDate: decFormData.effectiveDate || new Date().toISOString().slice(0, 10),
      scope: decFormData.scope,
      status: decFormData.status || 'Active',
      details: decFormData.details || ''
    };
    onUpdateDecisions([newRecord, ...decisions]);
    setDecModalOpen(false);
  };

  const handleSaveEditDec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDec || !decFormData.title) return;
    const updated = decisions.map(d => {
      if (d.id === editingDec.id) {
        return {
          ...d,
          title: decFormData.title || d.title,
          author: decFormData.author || d.author,
          org: decFormData.org || d.org,
          date: decFormData.date || d.date,
          effectiveDate: decFormData.effectiveDate || d.effectiveDate,
          scope: decFormData.scope || d.scope,
          status: decFormData.status || d.status,
          details: decFormData.details || d.details
        };
      }
      return d;
    });
    onUpdateDecisions(updated);
    setEditingDec(null);
  };

  const handleDeleteDec = (id: string) => {
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذا القرار الإداري؟' : 'Delete this administrative decision?')) {
      onUpdateDecisions(decisions.filter(d => d.id !== id));
    }
  };

  // Export
  const handleExportCSV = () => {
    if (subTab === 'governance') {
      const headers = ['ID', 'Name', 'Role', 'Ownership Scope', 'Responsibilities', 'Status'];
      const rows = governance.map(g => [
        g.id,
        `"${g.name || ''}"`,
        `"${g.role || ''}"`,
        `"${g.ownership || ''}"`,
        `"${(g.scope || '').replace(/"/g, '""')}"`,
        g.status
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const link = document.createElement('a');
      link.href = encodeURI(csvContent);
      link.download = `governance_team_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
    } else {
      const headers = ['Decision ID', 'Title', 'Author', 'Issue Date', 'Effective Date', 'Scope', 'Status'];
      const rows = decisions.map(d => [
        d.id,
        `"${d.title || ''}"`,
        `"${d.author || ''}"`,
        d.date,
        d.effectiveDate,
        `"${(d.scope || '').replace(/"/g, '""')}"`,
        d.status
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const link = document.createElement('a');
      link.href = encodeURI(csvContent);
      link.download = `admin_decisions_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Sub Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('governance')}
            className={`px-4 py-2 rounded-xs text-xs font-bold transition flex items-center gap-2 ${
              subTab === 'governance'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? `الهيكل الإداري ولجنة الحوكمة (${governance.length})` : `Governance Team (${governance.length})`}</span>
          </button>

          <button
            onClick={() => setSubTab('decisions')}
            className={`px-4 py-2 rounded-xs text-xs font-bold transition flex items-center gap-2 ${
              subTab === 'decisions'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isAr ? `سجل القرارات الإدارية والتنظيمية (${decisions.length})` : `Admin Decisions (${decisions.length})`}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 border border-slate-300 rounded-xs text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>

          {subTab === 'governance' ? (
            <button
              onClick={handleOpenAddGov}
              className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xs text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة عضو / جهة إشراف' : 'Add Member'}</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddDec}
              className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xs text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إصدار قرار إداري جديد' : 'Issue New Decision'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xs border border-slate-200">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={subTab === 'governance' ? (isAr ? 'بحث بالاسم، المنصب، النطاق الإشرافي...' : 'Search members...') : (isAr ? 'بحث برقم القرار، العنوان، الجهة...' : 'Search decisions...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-xs border border-slate-300 rounded-xs bg-slate-50 focus:bg-white focus:border-teal-700 outline-none font-bold"
          />
        </div>
      </div>

      {/* VIEW: GOVERNANCE TEAM */}
      {subTab === 'governance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGov.map(gov => (
            <div 
              key={gov.id}
              className="bg-white border border-slate-200 rounded-xs p-4 flex flex-col justify-between hover:border-teal-400 transition shadow-xs relative"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-xs">{gov.id}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-xs bg-teal-50 text-teal-800 border border-teal-300">
                    {gov.role}
                  </span>
                </div>

                <div className="mt-2.5">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>{gov.name}</span>
                  </h3>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {isAr ? 'نطاق الملكية / الإشراف:' : 'Ownership/Scope:'} <strong className="text-slate-700">{gov.ownership}</strong>
                  </div>
                </div>

                <div className="mt-3 bg-slate-50 p-2.5 rounded-xs border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-0.5 text-[11px]">{isAr ? 'المسؤوليات ونطاق الحوكمة:' : 'Responsibilities:'}</span>
                  <p className="text-[11px]">{gov.scope}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                  {gov.status || 'Active'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditGov(gov)}
                    className="p-1.5 text-slate-600 hover:text-teal-800 hover:bg-slate-100 rounded-xs"
                    title={isAr ? 'تعديل' : 'Edit'}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteGov(gov.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-xs"
                    title={isAr ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: ADMIN DECISIONS */}
      {subTab === 'decisions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDec.map(dec => (
            <div 
              key={dec.id}
              className="bg-white border border-slate-200 rounded-xs p-4 flex flex-col justify-between hover:border-teal-400 transition shadow-xs relative"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-xs">{dec.id}</span>
                  <span className="text-[10px] font-mono text-slate-500 font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{dec.date}</span>
                  </span>
                </div>

                <div className="mt-2.5">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>{dec.title}</span>
                  </h3>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {isAr ? 'الجهة المصدرة:' : 'Issued by:'} <strong className="text-slate-700">{dec.author}</strong>
                  </div>
                </div>

                <div className="mt-3 bg-slate-50 p-2.5 rounded-xs border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-0.5 text-[11px]">{isAr ? 'نص القرار والضوابط التنظيمية:' : 'Decision Scope:'}</span>
                  <p className="text-[11px]">{dec.scope}</p>
                </div>

                {dec.details && (
                  <div className="mt-2 text-[10px] text-slate-600 bg-white p-2 border border-slate-200 rounded-xs">
                    {dec.details}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold text-emerald-700">ساري ومُلزم لجميع الفروع</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditDec(dec)}
                    className="p-1.5 text-slate-600 hover:text-teal-800 hover:bg-slate-100 rounded-xs"
                    title={isAr ? 'تعديل' : 'Edit'}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteDec(dec.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-xs"
                    title={isAr ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD / EDIT GOVERNANCE */}
      {(govModalOpen || editingGov) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
          <div className="bg-white rounded-xs border border-slate-300 max-w-md w-full p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-800" />
                <span>{editingGov ? (isAr ? 'تعديل بيانات الحوكمة' : 'Edit Member') : (isAr ? 'إضافة عضو / جهة إشراف جديدة' : 'Add New Member')}</span>
              </h3>
              <button onClick={() => { setGovModalOpen(false); setEditingGov(null); }} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingGov ? handleSaveEditGov : handleSaveNewGov} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'الاسم الكامل / الصفة' : 'Name'} *</label>
                <input
                  type="text"
                  required
                  value={govFormData.name || ''}
                  onChange={e => setGovFormData({ ...govFormData, name: e.target.value })}
                  placeholder="مثال: د. عمرو دياب / م. يحيى طارق فرج"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'المسمى / المنصب' : 'Role'} *</label>
                  <input
                    type="text"
                    required
                    value={govFormData.role || ''}
                    onChange={e => setGovFormData({ ...govFormData, role: e.target.value })}
                    placeholder="Director of Engineering"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'نطاق الإشراف / الملكية' : 'Ownership'}</label>
                  <input
                    type="text"
                    value={govFormData.ownership || ''}
                    onChange={e => setGovFormData({ ...govFormData, ownership: e.target.value })}
                    placeholder="33.33% / إدارة هندسية"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'المسؤوليات ونطاق الحوكمة' : 'Responsibilities'}</label>
                <textarea
                  rows={3}
                  value={govFormData.scope || ''}
                  onChange={e => setGovFormData({ ...govFormData, scope: e.target.value })}
                  placeholder="نطاق حوكمة الصيانة، المشتريات، سلامة الغذاء..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setGovModalOpen(false); setEditingGov(null); }}
                  className="px-4 py-2 border border-slate-300 rounded-xs text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xs text-xs font-bold shadow-xs"
                >
                  {isAr ? 'حفظ' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT DECISION */}
      {(decModalOpen || editingDec) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
          <div className="bg-white rounded-xs border border-slate-300 max-w-lg w-full p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-800" />
                <span>{editingDec ? (isAr ? 'تعديل القرار الإداري' : 'Edit Decision') : (isAr ? 'إصدار قرار إداري وتنظيمي جديد' : 'New Decision')}</span>
              </h3>
              <button onClick={() => { setDecModalOpen(false); setEditingDec(null); }} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingDec ? handleSaveEditDec : handleSaveNewDec} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'رقم / كود القرار' : 'ID'}</label>
                  <input
                    type="text"
                    value={decFormData.id || ''}
                    onChange={e => setDecFormData({ ...decFormData, id: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs font-mono font-bold bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'تاريخ الإصدار' : 'Date'}</label>
                  <input
                    type="date"
                    value={decFormData.date || '2026-08-28'}
                    onChange={e => setDecFormData({ ...decFormData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'عنوان القرار الإداري' : 'Title'} *</label>
                <input
                  type="text"
                  required
                  value={decFormData.title || ''}
                  onChange={e => setDecFormData({ ...decFormData, title: e.target.value })}
                  placeholder="مثال: تعديل مواعيد وردية فني التبريد بمصنع ألبان العبور"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'الجهة المصدرة' : 'Issued By'}</label>
                  <input
                    type="text"
                    value={decFormData.author || ''}
                    onChange={e => setDecFormData({ ...decFormData, author: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'تاريخ السريان' : 'Effective Date'}</label>
                  <input
                    type="date"
                    value={decFormData.effectiveDate || '2026-08-28'}
                    onChange={e => setDecFormData({ ...decFormData, effectiveDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'نص ومنطوق القرار' : 'Scope / Decision Body'} *</label>
                <textarea
                  rows={3}
                  required
                  value={decFormData.scope || ''}
                  onChange={e => setDecFormData({ ...decFormData, scope: e.target.value })}
                  placeholder="تفاصيل التوجيه الإداري والفني الملزم..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setDecModalOpen(false); setEditingDec(null); }}
                  className="px-4 py-2 border border-slate-300 rounded-xs text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xs text-xs font-bold shadow-xs"
                >
                  {isAr ? 'حفظ القرار' : 'Save Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
