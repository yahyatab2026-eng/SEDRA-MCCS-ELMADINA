import React, { useState } from 'react';
import { BranchAuditRecord } from '../../types';
import { 
  ClipboardCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Check, 
  X, 
  Building2, 
  Download, 
  AlertTriangle,
  FileText,
  ListPlus,
  MinusCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface AdminBranchAuditsManagerProps {
  audits: BranchAuditRecord[];
  onUpdateAudits: (newAudits: BranchAuditRecord[]) => void;
  isAr: boolean;
}

export const AdminBranchAuditsManager: React.FC<AdminBranchAuditsManagerProps> = ({
  audits,
  onUpdateAudits,
  isAr
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editingAudit, setEditingAudit] = useState<BranchAuditRecord | null>(null);

  const [formData, setFormData] = useState<Partial<BranchAuditRecord>>({
    id: `AUD-${audits.length + 101}`,
    branchName: '',
    org: 'El Madina El Monawara (المدينة المنورة)',
    reportedBy: 'مدير الفرع',
    status: 'In Progress',
    itemsCount: 1,
    deficiencies: [''],
    summary: ''
  });

  const [deficiencyInput, setDeficiencyInput] = useState('');

  const filteredAudits = audits.filter(a => {
    const branch = (a.branchName || '').toLowerCase();
    const reported = (a.reportedBy || '').toLowerCase();
    const summary = (a.summary || '').toLowerCase();
    const defs = (a.deficiencies || []).join(' ').toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch = branch.includes(query) || reported.includes(query) || summary.includes(query) || defs.includes(query) || (a.id || '').toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalDeficienciesCount = audits.reduce((sum, a) => sum + (a.deficiencies?.length || a.itemsCount || 0), 0);

  const handleOpenAdd = () => {
    setFormData({
      id: `AUD-${audits.length + 101}`,
      branchName: '',
      org: 'El Madina El Monawara (المدينة المنورة)',
      reportedBy: 'مدير الفرع',
      status: 'In Progress',
      itemsCount: 1,
      deficiencies: [''],
      summary: ''
    });
    setNewModalOpen(true);
  };

  const handleOpenEdit = (a: BranchAuditRecord) => {
    setEditingAudit(a);
    setFormData({
      ...a,
      deficiencies: a.deficiencies && a.deficiencies.length > 0 ? [...a.deficiencies] : ['']
    });
  };

  const handleAddDeficiencyItem = () => {
    if (!deficiencyInput.trim()) return;
    const current = formData.deficiencies || [];
    setFormData({
      ...formData,
      deficiencies: [...current.filter(Boolean), deficiencyInput.trim()]
    });
    setDeficiencyInput('');
  };

  const handleRemoveDeficiencyItem = (index: number) => {
    const current = [...(formData.deficiencies || [])];
    current.splice(index, 1);
    setFormData({ ...formData, deficiencies: current });
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.branchName) return;
    const defs = (formData.deficiencies || []).filter(d => d.trim().length > 0);
    if (deficiencyInput.trim()) {
      defs.push(deficiencyInput.trim());
    }

    const newRecord: BranchAuditRecord = {
      id: formData.id || `AUD-${Date.now().toString().slice(-4)}`,
      branchName: formData.branchName,
      org: formData.org || 'El Madina El Monawara (المدينة المنورة)',
      reportedBy: formData.reportedBy || 'مدير الفرع',
      status: (formData.status as any) || 'In Progress',
      itemsCount: defs.length,
      deficiencies: defs,
      summary: formData.summary || `${defs.length} بنود فحص ومتابعة بالفرع`
    };

    onUpdateAudits([newRecord, ...audits]);
    setNewModalOpen(false);
    setDeficiencyInput('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAudit || !formData.branchName) return;
    const defs = (formData.deficiencies || []).filter(d => d.trim().length > 0);
    if (deficiencyInput.trim()) {
      defs.push(deficiencyInput.trim());
    }

    const updated = audits.map(a => {
      if (a.id === editingAudit.id) {
        return {
          ...a,
          branchName: formData.branchName || a.branchName,
          org: formData.org || a.org,
          reportedBy: formData.reportedBy || a.reportedBy,
          status: (formData.status as any) || a.status,
          itemsCount: defs.length,
          deficiencies: defs,
          summary: formData.summary || a.summary
        };
      }
      return a;
    });

    onUpdateAudits(updated);
    setEditingAudit(null);
    setDeficiencyInput('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف تقرير ملاحظات الفرع هذا؟' : 'Are you sure you want to delete this branch audit report?')) {
      onUpdateAudits(audits.filter(a => a.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = audits.map(a => {
      if (a.id === id) {
        const nextStatus: BranchAuditRecord['status'] = 
          a.status === 'In Progress' ? 'Action Plan Generated' :
          a.status === 'Action Plan Generated' ? 'Active' : 'In Progress';
        return { ...a, status: nextStatus };
      }
      return a;
    });
    onUpdateAudits(updated);
  };

  const handleExportCSV = () => {
    const headers = ['Audit ID', 'Branch Name', 'Organization', 'Reported By', 'Status', 'Deficiencies Count', 'Deficiencies', 'Summary'];
    const rows = audits.map(a => [
      a.id,
      `"${a.branchName || ''}"`,
      `"${a.org || ''}"`,
      `"${a.reportedBy || ''}"`,
      a.status,
      a.deficiencies?.length || a.itemsCount || 0,
      `"${(a.deficiencies || []).join(' | ').replace(/"/g, '""')}"`,
      `"${(a.summary || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `branch_audits_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header & KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">{isAr ? 'إجمالي تقارير الفحص' : 'Total Audits'}</div>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{audits.length}</div>
            <div className="text-[10px] text-slate-500 font-bold mt-0.5">{isAr ? 'فرع ومنشأة مرصودة' : 'Monitored Branches'}</div>
          </div>
          <div className="p-2.5 bg-teal-50 text-teal-800 rounded-xs">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-rose-700 uppercase">{isAr ? 'مجموع الملاحظات والأعطال' : 'Deficiencies Logged'}</div>
            <div className="text-2xl font-black text-rose-700 mt-1 font-mono">{totalDeficienciesCount}</div>
            <div className="text-[10px] text-rose-600 font-bold mt-0.5">{isAr ? 'عطل / بند بحاجة لمعالجة' : 'Deficiency items'}</div>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-teal-700 uppercase">{isAr ? 'حالات خطة العمل' : 'Action Plans'}</div>
            <div className="text-2xl font-black text-teal-900 mt-1 font-mono">
              {audits.filter(a => a.status === 'Action Plan Generated' || a.status === 'In Progress').length}
            </div>
            <div className="text-[10px] text-teal-700 font-bold mt-0.5">{isAr ? 'تقارير في مسار المعالجة' : 'Active tracking'}</div>
          </div>
          <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xs">
            <ClipboardCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xs border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isAr ? 'بحث باسم الفرع، البنود، مسؤول البلاغ...' : 'Search by branch, items, reporter...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-3 pr-9 py-2 text-xs border border-slate-300 rounded-xs bg-slate-50 focus:bg-white focus:border-teal-700 outline-none font-bold"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xs bg-slate-50 font-bold outline-none"
          >
            <option value="ALL">{isAr ? 'كافة الحالات' : 'All Statuses'}</option>
            <option value="In Progress">In Progress (قيد المتابعة)</option>
            <option value="Action Plan Generated">Action Plan Generated (تمت الخطة)</option>
            <option value="Active">Active (نشط)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 border border-slate-300 rounded-xs text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xs text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة تقرير فحص وملاحظات فرع' : 'New Branch Audit'}</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAudits.map(audit => {
          const count = audit.deficiencies?.length || audit.itemsCount || 0;
          return (
            <div 
              key={audit.id}
              className="bg-white border border-slate-200 rounded-xs p-4 flex flex-col justify-between hover:border-teal-400 transition shadow-xs"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-xs">
                    {audit.id}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(audit.id)}
                    className="px-2 py-0.5 rounded-xs text-[10px] font-bold border bg-teal-50 text-teal-800 border-teal-300 hover:bg-teal-100 transition"
                  >
                    {audit.status}
                  </button>
                </div>

                {/* Branch Name */}
                <div className="mt-2.5">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>{audit.branchName}</span>
                  </h3>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {isAr ? 'مسؤول البلاغ:' : 'Reported by:'} {audit.reportedBy || 'مدير الفرع'}
                  </div>
                </div>

                {/* Deficiencies Box */}
                <div className="mt-3 bg-rose-50/80 p-2.5 rounded-xs border border-rose-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-rose-950 mb-1.5">
                    <span>{isAr ? `الملاحظات والأعطال المرصودة (${count} بنود):` : `Deficiencies (${count}):`}</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-900 max-h-44 overflow-y-auto pr-1">
                    {audit.deficiencies?.map((def, idx) => (
                      <li key={idx} className="leading-snug">{def}</li>
                    ))}
                  </ul>
                </div>

                {/* Summary / Action Plan Box */}
                {audit.summary && (
                  <div className="mt-2.5 bg-emerald-50/70 p-2.5 rounded-xs border border-emerald-300 text-xs text-emerald-950">
                    <span className="font-bold block mb-0.5 text-[11px]">{isAr ? 'الملخص وخطة العمل:' : 'Action Plan:'}</span>
                    <p className="leading-relaxed text-[11px]">{audit.summary}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 truncate max-w-[170px]">{audit.org}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(audit)}
                    className="p-1.5 text-slate-600 hover:text-teal-800 hover:bg-slate-100 rounded-xs"
                    title={isAr ? 'تعديل' : 'Edit'}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(audit.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-xs"
                    title={isAr ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD / EDIT AUDIT */}
      {(newModalOpen || editingAudit) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
          <div className="bg-white rounded-xs border border-slate-300 max-w-xl w-full p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-teal-800" />
                <span>{editingAudit ? (isAr ? 'تعديل فحص وملاحظات الفرع' : 'Edit Branch Audit') : (isAr ? 'إضافة تقرير ملاحظات وأعطال فرع جديد' : 'New Branch Audit')}</span>
              </h3>
              <button
                onClick={() => { setNewModalOpen(false); setEditingAudit(null); }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingAudit ? handleSaveEdit : handleSaveNew} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'كود الفحص' : 'Audit ID'}</label>
                  <input
                    type="text"
                    value={formData.id || ''}
                    onChange={e => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs font-mono font-bold bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'حالة المتابعة' : 'Status'}</label>
                  <select
                    value={formData.status || 'In Progress'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs font-bold"
                  >
                    <option value="In Progress">In Progress (قيد المتابعة)</option>
                    <option value="Action Plan Generated">Action Plan Generated (تمت الخطة)</option>
                    <option value="Active">Active (نشط)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'اسم الفرع / المنشأة' : 'Branch Name'} *</label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: فرع مدينتي — المدينة المنورة' : 'e.g. Madinaty Branch'}
                  value={formData.branchName || ''}
                  onChange={e => setFormData({ ...formData, branchName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'مسؤول البلاغ / الفاحص' : 'Reported By'}</label>
                  <input
                    type="text"
                    value={formData.reportedBy || ''}
                    onChange={e => setFormData({ ...formData, reportedBy: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs"
                    placeholder="مدير الفرع / م. أحمد الصعيدي"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'الشركة / الكيان' : 'Organization'}</label>
                  <input
                    type="text"
                    value={formData.org || ''}
                    onChange={e => setFormData({ ...formData, org: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs"
                  />
                </div>
              </div>

              {/* Deficiencies Multi-Item Input */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-[11px] font-bold text-slate-900 mb-1">
                  {isAr ? 'قائمة الأعطال والملاحظات المرصودة بالفرع' : 'Deficiencies List'}
                </label>
                
                {/* Current Items */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto mb-2 pr-1">
                  {(formData.deficiencies || []).map((def, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-1.5 border border-slate-200 rounded-xs">
                      <span className="font-mono text-[10px] text-slate-500 font-bold w-5 text-center">{idx + 1}.</span>
                      <input
                        type="text"
                        value={def}
                        onChange={e => {
                          const updated = [...(formData.deficiencies || [])];
                          updated[idx] = e.target.value;
                          setFormData({ ...formData, deficiencies: updated });
                        }}
                        className="flex-1 px-2 py-1 text-xs bg-white border border-slate-200 rounded-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDeficiencyItem(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title={isAr ? 'حذف البند' : 'Remove item'}
                      >
                        <MinusCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new item input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={isAr ? 'اكتب ملاحظة / عطل جديد واضغط إضافة...' : 'Add a new deficiency item...'}
                    value={deficiencyInput}
                    onChange={e => setDeficiencyInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddDeficiencyItem(); }}}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddDeficiencyItem}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xs text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة بند' : 'Add'}</span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'الملخص وخطة المعالجة' : 'Action Plan / Summary'}</label>
                <textarea
                  rows={3}
                  value={formData.summary || ''}
                  onChange={e => setFormData({ ...formData, summary: e.target.value })}
                  placeholder={isAr ? 'خطة عمل وتوصيات الصيانة...' : 'Plan of action and maintenance recommendations...'}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setNewModalOpen(false); setEditingAudit(null); }}
                  className="px-4 py-2 border border-slate-300 rounded-xs text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xs text-xs font-bold shadow-xs"
                >
                  {isAr ? 'حفظ التقرير' : 'Save Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
