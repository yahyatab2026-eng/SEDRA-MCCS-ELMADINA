import React, { useState } from 'react';
import { CustodyRecord } from '../../types';
import { 
  Wallet, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Check, 
  X, 
  UserCheck, 
  Building2, 
  Download, 
  Calendar,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface AdminCustodiesManagerProps {
  custodies: CustodyRecord[];
  onUpdateCustodies: (newCustodies: CustodyRecord[]) => void;
  isAr: boolean;
}

export const AdminCustodiesManager: React.FC<AdminCustodiesManagerProps> = ({
  custodies,
  onUpdateCustodies,
  isAr
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editingCustody, setEditingCustody] = useState<CustodyRecord | null>(null);

  const [formData, setFormData] = useState<Partial<CustodyRecord>>({
    id: `CUSTODY-2026-00${custodies.length + 1}`,
    title: '',
    custodian: '',
    org: 'Sidera Confectionery (سيدرا)',
    location: '',
    amount: 1000,
    status: 'In Progress',
    purpose: '',
    date: '2026-08-28',
    authorizedBy: 'المهندس يحيى طارق فرج (مدير الإدارة الهندسية)'
  });

  const filteredCustodies = custodies.filter(c => {
    const matchesSearch = 
      (c.custodian || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.purpose || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.org || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = custodies.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const completedAmount = custodies.filter(c => c.status === 'Completed').reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const inProgressAmount = custodies.filter(c => c.status === 'In Progress').reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  const handleOpenAdd = () => {
    setFormData({
      id: `CUSTODY-2026-00${custodies.length + 1}`,
      title: '',
      custodian: '',
      org: 'Sidera Confectionery (سيدرا)',
      location: 'مصنع التجمع',
      amount: 1500,
      status: 'In Progress',
      purpose: '',
      date: new Date().toISOString().slice(0, 10),
      authorizedBy: 'المهندس يحيى طارق فرج (مدير الإدارة الهندسية)'
    });
    setNewModalOpen(true);
  };

  const handleOpenEdit = (c: CustodyRecord) => {
    setEditingCustody(c);
    setFormData({ ...c });
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.custodian || !formData.purpose) return;
    const newRecord: CustodyRecord = {
      id: formData.id || `CUSTODY-2026-00${Date.now().toString().slice(-3)}`,
      title: formData.title || `عهدة ${formData.custodian}`,
      custodian: formData.custodian || '',
      org: formData.org || 'Sidera Confectionery (سيدرا)',
      location: formData.location || 'المصنع الرئيسي',
      amount: Number(formData.amount) || 0,
      status: (formData.status as any) || 'In Progress',
      purpose: formData.purpose || '',
      date: formData.date || new Date().toISOString().slice(0, 10),
      authorizedBy: formData.authorizedBy || 'الإدارة الهندسية',
      findings: formData.findings || ''
    };
    onUpdateCustodies([newRecord, ...custodies]);
    setNewModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustody || !formData.custodian) return;
    const updated = custodies.map(c => {
      if (c.id === editingCustody.id) {
        return {
          ...c,
          title: formData.title || c.title,
          custodian: formData.custodian || c.custodian,
          org: formData.org || c.org,
          location: formData.location || c.location,
          amount: Number(formData.amount) || 0,
          status: (formData.status as any) || c.status,
          purpose: formData.purpose || c.purpose,
          date: formData.date || c.date,
          authorizedBy: formData.authorizedBy || c.authorizedBy,
          findings: formData.findings || c.findings
        };
      }
      return c;
    });
    onUpdateCustodies(updated);
    setEditingCustody(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف سجل هذه العهدة؟' : 'Are you sure you want to delete this custody record?')) {
      onUpdateCustodies(custodies.filter(c => c.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = custodies.map(c => {
      if (c.id === id) {
        const nextStatus: CustodyRecord['status'] = 
          c.status === 'In Progress' ? 'Completed' : 
          c.status === 'Completed' ? 'Pending Settlement' : 'In Progress';
        return { ...c, status: nextStatus };
      }
      return c;
    });
    onUpdateCustodies(updated);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Custodian', 'Org', 'Location', 'Amount (EGP)', 'Status', 'Date', 'Purpose', 'AuthorizedBy'];
    const rows = custodies.map(c => [
      c.id,
      `"${c.custodian || ''}"`,
      `"${c.org || ''}"`,
      `"${c.location || ''}"`,
      c.amount || 0,
      c.status,
      c.date || '',
      `"${(c.purpose || '').replace(/"/g, '""')}"`,
      `"${c.authorizedBy || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `custodies_export_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <div className="text-[11px] font-bold text-slate-500 uppercase">{isAr ? 'إجمالي قيمة العهد' : 'Total Custodies'}</div>
            <div className="text-xl font-black text-slate-900 mt-1 font-mono">{totalAmount.toLocaleString()} <span className="text-xs font-normal">EGP</span></div>
            <div className="text-[10px] text-slate-500 font-bold mt-0.5">{custodies.length} {isAr ? 'سجل عهدة مسجل' : 'Records'}</div>
          </div>
          <div className="p-2.5 bg-teal-50 text-teal-800 rounded-xs">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-700 uppercase">{isAr ? 'العهد المعتمدة والمنتهية' : 'Completed / Settled'}</div>
            <div className="text-xl font-black text-emerald-800 mt-1 font-mono">{completedAmount.toLocaleString()} <span className="text-xs font-normal">EGP</span></div>
            <div className="text-[10px] text-emerald-700 font-bold mt-0.5">{custodies.filter(c => c.status === 'Completed').length} {isAr ? 'عهدة مسواة محاسبياً' : 'Settled'}</div>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-700 uppercase">{isAr ? 'العهد الجارية قيد التنفيذ' : 'In Progress'}</div>
            <div className="text-xl font-black text-amber-800 mt-1 font-mono">{inProgressAmount.toLocaleString()} <span className="text-xs font-normal">EGP</span></div>
            <div className="text-[10px] text-amber-700 font-bold mt-0.5">{custodies.filter(c => c.status === 'In Progress').length} {isAr ? 'عهدة مفتوحة' : 'Open'}</div>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xs">
            <Clock className="w-5 h-5" />
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
              placeholder={isAr ? 'بحث بالاسم، المسؤول، الفرع، الغرض...' : 'Search by name, custodian, branch...'}
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
            <option value="ALL">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="In Progress">{isAr ? 'قيد التنفيذ (In Progress)' : 'In Progress'}</option>
            <option value="Completed">{isAr ? 'مكتملة ومسواة (Completed)' : 'Completed'}</option>
            <option value="Pending Settlement">{isAr ? 'بانتظار التسوية (Pending)' : 'Pending Settlement'}</option>
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
            <span>{isAr ? 'إصدار عهدة جديدة' : 'Issue New Custody'}</span>
          </button>
        </div>
      </div>

      {/* Custodies Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustodies.map(custody => {
          const isCompleted = custody.status === 'Completed';
          return (
            <div 
              key={custody.id}
              className="bg-white border border-slate-200 rounded-xs p-4 flex flex-col justify-between hover:border-teal-400 transition shadow-xs relative"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-xs">
                    {custody.id}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(custody.id)}
                    title={isAr ? 'اضغط لتغيير حالة العهدة' : 'Click to toggle status'}
                    className={`px-2 py-0.5 rounded-xs text-[10px] font-bold border transition ${
                      isCompleted 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                        : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    {custody.status}
                  </button>
                </div>

                {/* Custodian Info */}
                <div className="mt-2.5">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>{custody.custodian}</span>
                  </h3>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>{custody.location || 'المصنع'}</span>
                  </div>
                </div>

                {/* Financial Details Box */}
                <div className="mt-3 bg-slate-50 p-2.5 rounded-xs border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between items-baseline font-mono">
                    <span className="text-slate-500 font-sans">{isAr ? 'قيمة العهدة:' : 'Amount:'}</span>
                    <span className="font-black text-slate-900 text-sm">{(custody.amount ?? 0).toLocaleString()} EGP</span>
                  </div>
                  <div className="flex justify-between items-baseline text-[11px]">
                    <span className="text-slate-500">{isAr ? 'الجهة / الشركة:' : 'Org:'}</span>
                    <span className="font-bold text-slate-700 truncate max-w-[170px]">{custody.org}</span>
                  </div>
                </div>

                {/* Purpose */}
                <div className="mt-2.5 text-xs text-slate-700 bg-white p-2 border border-slate-100 rounded-xs">
                  <span className="font-bold text-slate-900 block mb-0.5">{isAr ? 'الغرض وبيان الصرف:' : 'Purpose:'}</span>
                  <p className="leading-relaxed text-[11px] line-clamp-3">{custody.purpose}</p>
                </div>

                {custody.authorizedBy && (
                  <div className="mt-2 text-[10px] text-slate-500">
                    <span>{isAr ? 'جهة الاعتماد:' : 'Authorized by:'} </span>
                    <strong className="text-slate-700">{custody.authorizedBy}</strong>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{custody.date || '2026-08-28'}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(custody)}
                    className="p-1.5 text-slate-600 hover:text-teal-800 hover:bg-slate-100 rounded-xs"
                    title={isAr ? 'تعديل بيانات العهدة' : 'Edit'}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(custody.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-xs"
                    title={isAr ? 'حذف العهدة' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD / EDIT CUSTODY */}
      {(newModalOpen || editingCustody) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
          <div className="bg-white rounded-xs border border-slate-300 max-w-lg w-full p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4 text-teal-800" />
                <span>{editingCustody ? (isAr ? 'تعديل بيانات العهدة' : 'Edit Custody') : (isAr ? 'إصدار عهدة مالية / فنية جديدة' : 'Issue New Custody')}</span>
              </h3>
              <button
                onClick={() => { setNewModalOpen(false); setEditingCustody(null); }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingCustody ? handleSaveEdit : handleSaveNew} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'كود العهدة' : 'ID'}</label>
                  <input
                    type="text"
                    value={formData.id || ''}
                    onChange={e => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs font-mono font-bold bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'قيمة العهدة (ج.م)' : 'Amount (EGP)'} *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount ?? 1000}
                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'اسم المستلم / صاحب العهدة' : 'Custodian Name'} *</label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: هاني محمود شندي (حداد)' : 'e.g. Mahmoud Ahmed'}
                  value={formData.custodian || ''}
                  onChange={e => setFormData({ ...formData, custodian: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'الفرع / الموقع' : 'Location'}</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs"
                    placeholder="مصنع الشرقية / فرع التسعين"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'الشركة / الجهة' : 'Organization'}</label>
                  <input
                    type="text"
                    value={formData.org || ''}
                    onChange={e => setFormData({ ...formData, org: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'حالة العهدة' : 'Status'}</label>
                  <select
                    value={formData.status || 'In Progress'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs font-bold"
                  >
                    <option value="In Progress">In Progress (قيد التنفيذ)</option>
                    <option value="Completed">Completed (مكتملة ومسواة)</option>
                    <option value="Pending Settlement">Pending Settlement (بانتظار التسوية)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'تاريخ الصرف' : 'Date'}</label>
                  <input
                    type="date"
                    value={formData.date || '2026-08-28'}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'بيان الغرض وأوجه الصرف' : 'Purpose & Expenditure Details'} *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.purpose || ''}
                  onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder={isAr ? 'تفاصيل المشتريات وخامات الصيانة المستهدفة...' : 'Details of parts and materials to purchase...'}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAr ? 'جهة الاعتماد' : 'Authorized By'}</label>
                <input
                  type="text"
                  value={formData.authorizedBy || ''}
                  onChange={e => setFormData({ ...formData, authorizedBy: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setNewModalOpen(false); setEditingCustody(null); }}
                  className="px-4 py-2 border border-slate-300 rounded-xs text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xs text-xs font-bold shadow-xs"
                >
                  {isAr ? 'حفظ البيانات' : 'Save Custody'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
