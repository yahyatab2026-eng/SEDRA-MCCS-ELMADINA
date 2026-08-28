import React, { useState } from 'react';
import { AssetRecord, LocationItem } from '../../types';
import { 
  Cpu, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Check, 
  X, 
  QrCode, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Factory, 
  Layers 
} from 'lucide-react';

interface AdminAssetsManagerProps {
  assets: AssetRecord[];
  locations: LocationItem[];
  onUpdateAssets: (newAssets: AssetRecord[]) => void;
  isAr: boolean;
}

export const AdminAssetsManager: React.FC<AdminAssetsManagerProps> = ({
  assets,
  locations,
  onUpdateAssets,
  isAr
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetRecord | null>(null);
  const [qrModalAsset, setQrModalAsset] = useState<AssetRecord | null>(null);

  const [formData, setFormData] = useState<Partial<AssetRecord>>({
    id: `EQ-${assets.length + 101}`,
    name: '',
    location_id: locations[0]?.id || 'LOC-1',
    location_name: locations[0]?.name || 'المصنع الرئيسي',
    category: 'تبريد وتكييف',
    manufacturer: '',
    model: '',
    serial: '',
    installed_at: '2024-01-15',
    status: 'تعمل بكفاءة',
    risk_level: 'Class B (Medium)',
    notes: ''
  });

  const filteredAssets = assets.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      (a.location_name && a.location_name.toLowerCase().includes(search.toLowerCase())) ||
      (a.manufacturer && a.manufacturer.toLowerCase().includes(search.toLowerCase())) ||
      (a.model && a.model.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = categoryFilter === 'ALL' || a.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status.includes(statusFilter);
    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormData({
      id: `EQ-${assets.length + 101}`,
      name: '',
      location_id: locations[0]?.id || 'LOC-1',
      location_name: locations[0]?.name || 'المصنع الرئيسي',
      category: 'تبريد وتكييف',
      manufacturer: '',
      model: '',
      serial: '',
      installed_at: new Date().toISOString().slice(0, 10),
      status: 'تعمل بكفاءة',
      risk_level: 'Class B (Medium)',
      notes: ''
    });
    setNewModalOpen(true);
  };

  const handleOpenEdit = (asset: AssetRecord) => {
    setEditingAsset(asset);
    setFormData({ ...asset });
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    const matchedLoc = locations.find(l => l.id === formData.location_id);
    const newAsset: AssetRecord = {
      id: formData.id || `EQ-${Date.now().toString().slice(-4)}`,
      name: formData.name || '',
      location_id: formData.location_id || locations[0]?.id || 'LOC-1',
      location_name: matchedLoc?.name || formData.location_name || 'الفرع الرئيسي',
      category: formData.category || 'تبريد وتكييف',
      manufacturer: formData.manufacturer || 'قياسي',
      model: formData.model || 'Standard',
      serial: formData.serial || `SN-${Date.now().toString().slice(-6)}`,
      installed_at: formData.installed_at || new Date().toISOString().slice(0, 10),
      status: formData.status || 'تعمل بكفاءة',
      risk_level: formData.risk_level as any || 'Class B (Medium)',
      notes: formData.notes || ''
    };
    onUpdateAssets([newAsset, ...assets]);
    setNewModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset || !formData.name) return;
    const matchedLoc = locations.find(l => l.id === formData.location_id);
    const updated = assets.map(a => {
      if (a.id === editingAsset.id) {
        return {
          ...a,
          name: formData.name || a.name,
          location_id: formData.location_id || a.location_id,
          location_name: matchedLoc?.name || formData.location_name || a.location_name,
          category: formData.category || a.category,
          manufacturer: formData.manufacturer || a.manufacturer,
          model: formData.model || a.model,
          serial: formData.serial || a.serial,
          installed_at: formData.installed_at || a.installed_at,
          status: formData.status || a.status,
          risk_level: (formData.risk_level as any) || a.risk_level,
          notes: formData.notes !== undefined ? formData.notes : a.notes
        };
      }
      return a;
    });
    onUpdateAssets(updated);
    setEditingAsset(null);
  };

  const handleDelete = (id: string) => {
    if (confirm(isAr ? `هل أنت متأكد من حذف الماكينة (${id})؟` : `Delete asset ${id}?`)) {
      onUpdateAssets(assets.filter(a => a.id !== id));
    }
  };

  const handleQuickStatusChange = (id: string, newStatus: string) => {
    const updated = assets.map(a => a.id === id ? { ...a, status: newStatus } : a);
    onUpdateAssets(updated);
  };

  return (
    <section className="space-y-4 animate-in fade-in duration-150">
      
      {/* Header & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xs border-geometric">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-teal-700" />
            <h3 className="font-black text-base text-slate-900">
              {isAr ? 'إدارة سجل المعدات والماكينات (Assets Master DB)' : 'Assets & Equipment Master DB'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAr 
              ? `إجمالي (${assets.length}) ماكينة وخط إنتاج مسجل مع متابعة الحالة التشغيلية وأكواد QR Code.` 
              : `Total of ${assets.length} production assets with dynamic status controls and QR code identifiers.`}
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2 accent-teal text-white rounded-xs text-xs font-bold transition shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة ماكينة / خط إنتاج جديد' : 'Add New Asset'}</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-50 p-3 rounded-xs border-geometric flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? 'البحث باسم الماكينة، الكود، الفرع، أو الموديل...' : 'Search by asset name, code, site...'}
              className="w-full pl-3 pr-8 py-1.5 bg-white border-geometric rounded-xs text-xs"
            />
          </div>
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-700 text-xs px-1.5 py-1">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-600">{isAr ? 'التصنيف:' : 'Category:'}</span>
            <select 
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="p-1.5 bg-white border-geometric rounded-xs font-bold text-xs"
            >
              <option value="ALL">{isAr ? 'جميع التصنيفات' : 'All Categories'}</option>
              <option value="تبريد وتكييف">{isAr ? 'تبريد وتكييف' : 'Refrigeration'}</option>
              <option value="ألبان وتصنيع ومجنسات">{isAr ? 'ألبان وتصنيع' : 'Dairy'}</option>
              <option value="حلواني ومخابز وعجين">{isAr ? 'حلواني ومخابز' : 'Bakery'}</option>
              <option value="كهرباء ومواتير ومولدات">{isAr ? 'كهرباء ومولدات' : 'Electrical'}</option>
              <option value="غلايات ومرافق">{isAr ? 'غلايات ومرافق' : 'Boilers'}</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-600">{isAr ? 'الحالة:' : 'Status:'}</span>
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="p-1.5 bg-white border-geometric rounded-xs font-bold text-xs"
            >
              <option value="ALL">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="تعمل">{isAr ? 'تعمل بكفاءة' : 'Operational'}</option>
              <option value="تحت الصيانة">{isAr ? 'تحت الصيانة' : 'Maintenance'}</option>
              <option value="متوقفة">{isAr ? 'متوقفة / عطل' : 'Down / Offline'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white border-geometric rounded-xs shadow-xs overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">كود الماكينة</th>
              <th className="px-4 py-3">اسم الماكينة / المعدة</th>
              <th className="px-4 py-3">الموقع / المنشأة</th>
              <th className="px-4 py-3">التصنيف الهندسي</th>
              <th className="px-4 py-3">الموديل والشركة</th>
              <th className="px-4 py-3">الحالة التشغيلية</th>
              <th className="px-4 py-3 text-center">QR Code</th>
              <th className="px-4 py-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-500 font-bold">
                  {isAr ? 'لا توجد معدات مطابقة للبحث' : 'No assets found'}
                </td>
              </tr>
            ) : (
              filteredAssets.map(asset => (
                <tr key={asset.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-2.5 font-mono font-bold text-slate-900">{asset.id}</td>
                  <td className="px-4 py-2.5 font-bold text-slate-900">{asset.name}</td>
                  <td className="px-4 py-2.5 text-slate-700">{asset.location_name || asset.location_id}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                      {asset.category}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-600">
                    {asset.manufacturer || asset.model ? `${asset.manufacturer || ''} ${asset.model || ''}` : 'قياسي'}
                  </td>
                  <td className="px-4 py-2.5">
                    <select
                      value={asset.status}
                      onChange={e => handleQuickStatusChange(asset.id, e.target.value)}
                      className={`px-2 py-1 rounded-xs text-[10px] font-bold border cursor-pointer font-sans ${
                        asset.status.includes('تعمل')
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : asset.status.includes('صيانة')
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <option value="تعمل بكفاءة">🟢 تعمل بكفاءة</option>
                      <option value="تحت الصيانة">🟡 تحت الصيانة</option>
                      <option value="متوقفة - عطل حرج">🔴 متوقفة - عطل حرج</option>
                      <option value="تحتاج فحص وتعمير">⚪ تحتاج فحص</option>
                    </select>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => setQrModalAsset(asset)}
                      className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-xs transition inline-flex items-center gap-1"
                      title={isAr ? 'عرض كود QR' : 'View QR Code'}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => handleOpenEdit(asset)}
                        className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xs transition"
                        title={isAr ? 'تعديل بيانات الماكينة' : 'Edit Asset'}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(asset.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xs transition"
                        title={isAr ? 'حذف الماكينة' : 'Delete Asset'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Asset Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs border-geometric max-w-xl w-full p-5 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-700" />
                <span>{isAr ? 'إضافة ماكينة أو معدة جديدة' : 'Add New Equipment'}</span>
              </h4>
              <button onClick={() => setNewModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">كود الماكينة (Asset ID):</label>
                <input 
                  type="text" 
                  required
                  value={formData.id} 
                  onChange={e => setFormData({ ...formData, id: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-slate-50 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الماكينة / المعدة:</label>
                <input 
                  type="text" 
                  required 
                  placeholder="مثال: عجّانة حلواني هيدروليك 120 لتر" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الموقع / المنشأة:</label>
                <select 
                  value={formData.location_id} 
                  onChange={e => {
                    const loc = locations.find(l => l.id === e.target.value);
                    setFormData({ ...formData, location_id: e.target.value, location_name: loc?.name });
                  }} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التصنيف الهندسي:</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({ ...formData, category: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                >
                  <option value="تبريد وتكييف">تبريد وتكييف وغرف تجميد</option>
                  <option value="ألبان وتصنيع ومجنسات">ألبان وتصنيع وبسترة ومجنسات</option>
                  <option value="حلواني ومخابز وعجين">حلواني ومخابز وعجان ومفارد</option>
                  <option value="كهرباء ومواتير ومولدات">كهرباء ومواتير ولوحات ومولدات</option>
                  <option value="غلايات ومرافق">غلايات وبخار ومرافق</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الشركة المصنعة والموديل:</label>
                <input 
                  type="text" 
                  placeholder="مثال: Polin Italy - Model RX200" 
                  value={formData.manufacturer} 
                  onChange={e => setFormData({ ...formData, manufacturer: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الرقم التسلسلي (Serial No):</label>
                <input 
                  type="text" 
                  placeholder="SN-..." 
                  value={formData.serial} 
                  onChange={e => setFormData({ ...formData, serial: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الحالة التشغيلية الأولية:</label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({ ...formData, status: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                >
                  <option value="تعمل بكفاءة">تعمل بكفاءة</option>
                  <option value="تحت الصيانة">تحت الصيانة</option>
                  <option value="متوقفة - عطل حرج">متوقفة - عطل حرج</option>
                  <option value="تحتاج فحص وتعمير">تحتاج فحص وتعمير</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">درجة الأهمية والخطورة:</label>
                <select 
                  value={formData.risk_level} 
                  onChange={e => setFormData({ ...formData, risk_level: e.target.value as any })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white"
                >
                  <option value="Class A (Critical / Maximum Risk)">حرجة جداً (توقف الإنتاج فوراً)</option>
                  <option value="Class A (High)">أهمية عالية</option>
                  <option value="Class B (Medium)">أهمية متوسطة</option>
                  <option value="Class C (Normal)">عادية</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">ملاحظات وكتالوج الصيانة:</label>
                <textarea 
                  rows={2}
                  value={formData.notes} 
                  onChange={e => setFormData({ ...formData, notes: e.target.value })} 
                  placeholder="ملاحظات جدول التشحيم، نوع الزيت، أو تعليمات السلامة..."
                  className="w-full p-2 border-geometric rounded-xs bg-white"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setNewModalOpen(false)} 
                  className="px-4 py-2 border-geometric text-slate-700 rounded-xs font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 accent-teal text-white rounded-xs font-bold shadow-xs"
                >
                  {isAr ? 'إضافة الماكينة' : 'Add Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs border-geometric max-w-xl w-full p-5 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-teal-700" />
                <span>{isAr ? `تعديل بيانات الماكينة (${editingAsset.id})` : `Edit Asset ${editingAsset.id}`}</span>
              </h4>
              <button onClick={() => setEditingAsset(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">كود الماكينة (ثابت):</label>
                <input 
                  type="text" 
                  disabled
                  value={formData.id} 
                  className="w-full p-2 border-geometric rounded-xs bg-slate-100 font-mono font-bold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الماكينة / المعدة:</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الموقع / المنشأة:</label>
                <select 
                  value={formData.location_id} 
                  onChange={e => {
                    const loc = locations.find(l => l.id === e.target.value);
                    setFormData({ ...formData, location_id: e.target.value, location_name: loc?.name });
                  }} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التصنيف الهندسي:</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({ ...formData, category: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                >
                  <option value="تبريد وتكييف">تبريد وتكييف وغرف تجميد</option>
                  <option value="ألبان وتصنيع ومجنسات">ألبان وتصنيع وبسترة ومجنسات</option>
                  <option value="حلواني ومخابز وعجين">حلواني ومخابز وعجان ومفارد</option>
                  <option value="كهرباء ومواتير ومولدات">كهرباء ومواتير ولوحات ومولدات</option>
                  <option value="غلايات ومرافق">غلايات وبخار ومرافق</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الشركة المصنعة والموديل:</label>
                <input 
                  type="text" 
                  value={formData.manufacturer} 
                  onChange={e => setFormData({ ...formData, manufacturer: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الرقم التسلسلي:</label>
                <input 
                  type="text" 
                  value={formData.serial} 
                  onChange={e => setFormData({ ...formData, serial: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الحالة التشغيلية:</label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({ ...formData, status: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                >
                  <option value="تعمل بكفاءة">تعمل بكفاءة</option>
                  <option value="تحت الصيانة">تحت الصيانة</option>
                  <option value="متوقفة - عطل حرج">متوقفة - عطل حرج</option>
                  <option value="تحتاج فحص وتعمير">تحتاج فحص وتعمير</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">درجة الأهمية:</label>
                <select 
                  value={formData.risk_level} 
                  onChange={e => setFormData({ ...formData, risk_level: e.target.value as any })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white"
                >
                  <option value="Class A (Critical / Maximum Risk)">حرجة جداً (توقف الإنتاج فوراً)</option>
                  <option value="Class A (High)">أهمية عالية</option>
                  <option value="Class B (Medium)">أهمية متوسطة</option>
                  <option value="Class C (Normal)">عادية</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">ملاحظات وكتالوج الصيانة:</label>
                <textarea 
                  rows={2}
                  value={formData.notes} 
                  onChange={e => setFormData({ ...formData, notes: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setEditingAsset(null)} 
                  className="px-4 py-2 border-geometric text-slate-700 rounded-xs font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 accent-teal text-white rounded-xs font-bold shadow-xs"
                >
                  {isAr ? 'حفظ التعديلات' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal Preview */}
      {qrModalAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs border-geometric max-w-sm w-full p-6 text-center space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-xs text-slate-700">{isAr ? 'معرف الماكينة السريع (QR Code)' : 'Equipment QR Code'}</span>
              <button onClick={() => setQrModalAsset(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xs flex flex-col items-center justify-center">
              <div className="w-36 h-36 bg-white p-2 border-2 border-teal-700 rounded-xs flex items-center justify-center shadow-xs">
                <QrCode className="w-28 h-28 text-slate-900" />
              </div>
              <span className="font-mono font-black text-sm text-slate-900 mt-2">{qrModalAsset.id}</span>
              <span className="font-bold text-xs text-slate-700 mt-0.5">{qrModalAsset.name}</span>
              <span className="text-[11px] text-slate-500">{qrModalAsset.location_name}</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              {isAr ? 'يمكن طباعة هذا الرمز ولصقه مباشرة على الماكينة لتمكين الفنيين من مسحه فحصاً وبلاغاً فورياً.' : 'Print and stick this QR code on the machine for instant scanning.'}
            </p>

            <button 
              type="button" 
              onClick={() => setQrModalAsset(null)} 
              className="w-full py-2 accent-teal text-white rounded-xs text-xs font-bold shadow-xs"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}

    </section>
  );
};
