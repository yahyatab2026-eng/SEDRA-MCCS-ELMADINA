import React, { useState } from 'react';
import { LocationItem } from '../../types';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Search, 
  ExternalLink, 
  Check, 
  X, 
  Store, 
  Factory, 
  Warehouse,
  RotateCcw
} from 'lucide-react';

interface AdminLocationsManagerProps {
  locations: LocationItem[];
  onUpdateLocations: (newLocations: LocationItem[]) => void;
  isAr: boolean;
}

export const AdminLocationsManager: React.FC<AdminLocationsManagerProps> = ({
  locations,
  onUpdateLocations,
  isAr
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<LocationItem | null>(null);

  const [formData, setFormData] = useState<Partial<LocationItem>>({
    id: `LOC-${locations.length + 1}`,
    name: '',
    type: 'منفذ بيع',
    region: 'القاهرة',
    lat: 30.0444,
    lng: 31.2357,
    address: '',
    org: 'Sidera Confectionery (سيدرا)',
    active: true
  });

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = 
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      loc.id.toLowerCase().includes(search.toLowerCase()) ||
      loc.region.toLowerCase().includes(search.toLowerCase()) ||
      loc.address.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || loc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenAdd = () => {
    setFormData({
      id: `LOC-${locations.length + 101}`,
      name: '',
      type: 'منفذ بيع',
      region: 'القاهرة',
      lat: 30.0444,
      lng: 31.2357,
      address: '',
      org: 'Sidera Confectionery (سيدرا)',
      active: true
    });
    setNewModalOpen(true);
  };

  const handleOpenEdit = (loc: LocationItem) => {
    setEditingLoc(loc);
    setFormData({ ...loc });
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    const newLoc: LocationItem = {
      id: formData.id || `LOC-${Date.now().toString().slice(-4)}`,
      name: formData.name || '',
      type: (formData.type as any) || 'منفذ بيع',
      region: formData.region || 'القاهرة',
      lat: Number(formData.lat) || 30.0444,
      lng: Number(formData.lng) || 31.2357,
      address: formData.address || '',
      org: formData.org as any || 'Sidera Confectionery (سيدرا)',
      active: formData.active !== false
    };
    const updated = [newLoc, ...locations];
    onUpdateLocations(updated);
    setNewModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoc || !formData.name) return;
    const updated = locations.map(l => {
      if (l.id === editingLoc.id) {
        return {
          ...l,
          name: formData.name || l.name,
          type: (formData.type as any) || l.type,
          region: formData.region || l.region,
          lat: Number(formData.lat) || l.lat,
          lng: Number(formData.lng) || l.lng,
          address: formData.address || l.address,
          org: (formData.org as any) || l.org,
          active: formData.active !== undefined ? formData.active : l.active
        };
      }
      return l;
    });
    onUpdateLocations(updated);
    setEditingLoc(null);
  };

  const handleDelete = (id: string) => {
    if (confirm(isAr ? `هل أنت متأكد من حذف الموقع (${id}) من قاعدة البيانات؟` : `Delete location ${id}?`)) {
      onUpdateLocations(locations.filter(l => l.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = locations.map(l => l.id === id ? { ...l, active: !l.active } : l);
    onUpdateLocations(updated);
  };

  return (
    <section className="space-y-4 animate-in fade-in duration-150">
      
      {/* Header & Metric Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xs border-geometric">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-700" />
            <h3 className="font-black text-base text-slate-900">
              {isAr ? 'إدارة قاعدة بيانات المواقع والفروع (Locations DB)' : 'Locations & Branches Master DB'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAr 
              ? `إجمالي (${locations.length}) موقع مسجل: فروع بيع، مصانع إنتاج، ومستودعات مع إمكانية التعديل والإضافة المباشرة.` 
              : `Total of ${locations.length} registered locations with live CRUD dynamic editing.`}
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2 accent-teal text-white rounded-xs text-xs font-bold transition shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة موقع / فرع جديد' : 'Add New Location'}</span>
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
              placeholder={isAr ? 'البحث بالاسم، الكود، المنطقة، أو العنوان...' : 'Search by name, code, region...'}
              className="w-full pl-3 pr-8 py-1.5 bg-white border-geometric rounded-xs text-xs"
            />
          </div>
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="text-slate-400 hover:text-slate-700 text-xs px-1.5 py-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-600">{isAr ? 'نوع المنشأة:' : 'Type:'}</span>
          <select 
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="p-1.5 bg-white border-geometric rounded-xs font-bold text-xs"
          >
            <option value="ALL">{isAr ? 'كل الأنواع (الكل)' : 'All Types'}</option>
            <option value="منفذ بيع">{isAr ? 'متاجر وفروع بيع' : 'Retail Stores'}</option>
            <option value="مصنع">{isAr ? 'مصانع مركزية' : 'Factories'}</option>
            <option value="مقر إداري">{isAr ? 'مقرات إدارية' : 'Admin HQ'}</option>
            <option value="مخزن">{isAr ? 'مستودعات وتخزين' : 'Warehouses'}</option>
          </select>
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-white border-geometric rounded-xs shadow-xs overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">كود الموقع</th>
              <th className="px-4 py-3">اسم المنشأة / الفرع</th>
              <th className="px-4 py-3">النوع</th>
              <th className="px-4 py-3">المنطقة</th>
              <th className="px-4 py-3">الإحداثيات الجغرافية</th>
              <th className="px-4 py-3">العنوان بالتفصيل</th>
              <th className="px-4 py-3 text-center">الحالة</th>
              <th className="px-4 py-3 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {filteredLocations.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-500 font-bold">
                  {isAr ? 'لا توجد مواقع مطابقة لمعايير البحث' : 'No locations found'}
                </td>
              </tr>
            ) : (
              filteredLocations.map(loc => (
                <tr key={loc.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-2.5 font-mono font-bold text-slate-900">{loc.id}</td>
                  <td className="px-4 py-2.5 font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      {loc.type === 'مصنع' ? (
                        <Factory className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      ) : loc.type === 'مخزن' ? (
                        <Warehouse className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      ) : (
                        <Store className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      )}
                      <span>{loc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                      {loc.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-medium">{loc.region}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-slate-600">
                    <a 
                      href={`https://maps.google.com/?q=${loc.lat},${loc.lng}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="text-teal-700 hover:underline flex items-center gap-1 font-mono"
                      title="فتح على خرائط Google"
                    >
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>{Number(loc.lat).toFixed(4)}, {Number(loc.lng).toFixed(4)}</span>
                    </a>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 max-w-[200px] truncate" title={loc.address}>
                    {loc.address || '—'}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => handleToggleActive(loc.id)}
                      className={`px-2 py-0.5 rounded-xs text-[10px] font-bold border transition ${
                        loc.active !== false
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {loc.active !== false ? (isAr ? 'نشط ومعتمد' : 'Active') : (isAr ? 'معطل' : 'Inactive')}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => handleOpenEdit(loc)}
                        className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xs transition"
                        title={isAr ? 'تعديل بيانات الموقع' : 'Edit Location'}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(loc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xs transition"
                        title={isAr ? 'حذف الموقع' : 'Delete Location'}
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

      {/* Add New Location Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs border-geometric max-w-xl w-full p-5 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-700" />
                <span>{isAr ? 'إضافة فرع أو مصنع جديد لقاعدة البيانات' : 'Add New Location'}</span>
              </h4>
              <button onClick={() => setNewModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">كود الموقع (Location ID):</label>
                <input 
                  type="text" 
                  required
                  value={formData.id} 
                  onChange={e => setFormData({ ...formData, id: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-slate-50 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الفرع / المنشأة:</label>
                <input 
                  type="text" 
                  required 
                  placeholder="مثال: فرع التجمع - شارع التسعين" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع المنشأة:</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                >
                  <option value="منفذ بيع">منفذ بيع وتوزيع</option>
                  <option value="مصنع">مصنع مركزي</option>
                  <option value="مخزن">مستودع إقليمي</option>
                  <option value="مقر إداري">مبنى إداري</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المنطقة / المحافظة:</label>
                <input 
                  type="text" 
                  value={formData.region} 
                  onChange={e => setFormData({ ...formData, region: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">خط العرض (Latitude):</label>
                <input 
                  type="number" 
                  step="0.0001" 
                  value={formData.lat} 
                  onChange={e => setFormData({ ...formData, lat: Number(e.target.value) })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">خط الطول (Longitude):</label>
                <input 
                  type="number" 
                  step="0.0001" 
                  value={formData.lng} 
                  onChange={e => setFormData({ ...formData, lng: Number(e.target.value) })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">العنوان التفصيلي:</label>
                <input 
                  type="text" 
                  value={formData.address} 
                  onChange={e => setFormData({ ...formData, address: e.target.value })} 
                  placeholder="مثال: قطعة 45، المنطقة الصناعية، العبور، القليوبية"
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
                  {isAr ? 'إضافة الموقع' : 'Add Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      {editingLoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs border-geometric max-w-xl w-full p-5 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-teal-700" />
                <span>{isAr ? `تعديل بيانات الموقع (${editingLoc.id})` : `Edit Location ${editingLoc.id}`}</span>
              </h4>
              <button onClick={() => setEditingLoc(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">كود الموقع (ثابت):</label>
                <input 
                  type="text" 
                  disabled
                  value={formData.id} 
                  className="w-full p-2 border-geometric rounded-xs bg-slate-100 font-mono font-bold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المنشأة / الفرع:</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع المنشأة:</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                >
                  <option value="منفذ بيع">منفذ بيع وتوزيع</option>
                  <option value="مصنع">مصنع مركزي</option>
                  <option value="مخزن">مستودع إقليمي</option>
                  <option value="مقر إداري">مبنى إداري</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المنطقة / المحافظة:</label>
                <input 
                  type="text" 
                  value={formData.region} 
                  onChange={e => setFormData({ ...formData, region: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">خط العرض (Latitude):</label>
                <input 
                  type="number" 
                  step="0.0001" 
                  value={formData.lat} 
                  onChange={e => setFormData({ ...formData, lat: Number(e.target.value) })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">خط الطول (Longitude):</label>
                <input 
                  type="number" 
                  step="0.0001" 
                  value={formData.lng} 
                  onChange={e => setFormData({ ...formData, lng: Number(e.target.value) })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">العنوان التفصيلي:</label>
                <input 
                  type="text" 
                  value={formData.address} 
                  onChange={e => setFormData({ ...formData, address: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2 p-2 bg-slate-50 border-geometric rounded-xs">
                <input 
                  type="checkbox"
                  id="locActive"
                  checked={formData.active !== false}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 accent-teal cursor-pointer"
                />
                <label htmlFor="locActive" className="font-bold text-slate-800 cursor-pointer">
                  {isAr ? 'موقع نشط ومتاح في قائمة البلاغات والتكليفات' : 'Active location in operational lists'}
                </label>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setEditingLoc(null)} 
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

    </section>
  );
};
