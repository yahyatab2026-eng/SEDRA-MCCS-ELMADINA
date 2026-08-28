import React, { useState } from 'react';
import { TechnicianItem } from '../../types';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Search, 
  Check, 
  X, 
  Send, 
  Wrench, 
  Shield, 
  UserCheck 
} from 'lucide-react';

interface AdminTechsManagerProps {
  technicians: TechnicianItem[];
  onUpdateTechnicians: (newTechnicians: TechnicianItem[]) => void;
  isAr: boolean;
}

export const AdminTechsManager: React.FC<AdminTechsManagerProps> = ({
  technicians,
  onUpdateTechnicians,
  isAr
}) => {
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<TechnicianItem | null>(null);

  const [formData, setFormData] = useState<Partial<TechnicianItem>>({
    id: `TECH-${technicians.length + 1}`,
    name: '',
    phone: '',
    specialty: 'تبريد وتكييف',
    location: 'المركز الرئيسي',
    active: true,
    color: '#0d9488',
    employmentType: 'ثابت'
  });

  const filteredTechs = technicians.filter(tech => {
    const matchesSearch = 
      tech.name.toLowerCase().includes(search.toLowerCase()) ||
      tech.id.toLowerCase().includes(search.toLowerCase()) ||
      tech.phone.includes(search) ||
      tech.specialty.toLowerCase().includes(search.toLowerCase());
    const matchesSpec = specialtyFilter === 'ALL' || tech.specialty.includes(specialtyFilter);
    return matchesSearch && matchesSpec;
  });

  const handleOpenAdd = () => {
    setFormData({
      id: `TECH-${technicians.length + 101}`,
      name: '',
      phone: '',
      specialty: 'تبريد وتكييف',
      location: 'المركز الرئيسي',
      active: true,
      color: '#0d9488',
      employmentType: 'ثابت'
    });
    setNewModalOpen(true);
  };

  const handleOpenEdit = (tech: TechnicianItem) => {
    setEditingTech(tech);
    setFormData({ ...tech });
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    const newTech: TechnicianItem = {
      id: formData.id || `TECH-${Date.now().toString().slice(-4)}`,
      name: formData.name || '',
      phone: formData.phone || '',
      specialty: formData.specialty || 'تبريد وتكييف',
      location: formData.location || 'المركز الرئيسي',
      active: formData.active !== false,
      color: formData.color || '#0d9488',
      employmentType: formData.employmentType || 'ثابت'
    };
    onUpdateTechnicians([newTech, ...technicians]);
    setNewModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTech || !formData.name || !formData.phone) return;
    const updated = technicians.map(t => {
      if (t.id === editingTech.id) {
        return {
          ...t,
          name: formData.name || t.name,
          phone: formData.phone || t.phone,
          specialty: formData.specialty || t.specialty,
          location: formData.location || t.location,
          active: formData.active !== undefined ? formData.active : t.active,
          color: formData.color || t.color,
          employmentType: formData.employmentType || t.employmentType
        };
      }
      return t;
    });
    onUpdateTechnicians(updated);
    setEditingTech(null);
  };

  const handleDelete = (id: string) => {
    if (confirm(isAr ? `هل أنت متأكد من حذف الفني (${id}) من السجل؟` : `Delete technician ${id}?`)) {
      onUpdateTechnicians(technicians.filter(t => t.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = technicians.map(t => t.id === id ? { ...t, active: !t.active } : t);
    onUpdateTechnicians(updated);
  };

  return (
    <section className="space-y-4 animate-in fade-in duration-150">
      
      {/* Header & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xs border-geometric">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-700" />
            <h3 className="font-black text-base text-slate-900">
              {isAr ? 'إدارة سجل الفنيين والمهندسين (Technicians DB)' : 'Engineering & Field Techs Master DB'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAr 
              ? `إجمالي (${technicians.length}) فني ومهندس صيانة مع إمكانية تعديل أرقام الهواتف والتخصصات والربط المباشر بـ WhatsApp.` 
              : `Total of ${technicians.length} certified technicians with WhatsApp integration and profile governance.`}
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2 accent-teal text-white rounded-xs text-xs font-bold transition shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة فني / مهندس جديد' : 'Add Technician'}</span>
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
              placeholder={isAr ? 'البحث باسم الفني، الكود، التخصص، أو الهاتف...' : 'Search by name, specialty, phone...'}
              className="w-full pl-3 pr-8 py-1.5 bg-white border-geometric rounded-xs text-xs"
            />
          </div>
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-700 text-xs px-1.5 py-1">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-600">{isAr ? 'التخصص الهندسي:' : 'Specialty:'}</span>
          <select 
            value={specialtyFilter}
            onChange={e => setSpecialtyFilter(e.target.value)}
            className="p-1.5 bg-white border-geometric rounded-xs font-bold text-xs"
          >
            <option value="ALL">{isAr ? 'جميع التخصصات' : 'All Specialties'}</option>
            <option value="تبريد وتكييف">{isAr ? 'تبريد وتكييف' : 'Refrigeration'}</option>
            <option value="كهرباء">{isAr ? 'كهرباء ولوحات تحكم' : 'Electrical'}</option>
            <option value="أفران">{isAr ? 'أفران ومخابز' : 'Bakery & Ovens'}</option>
            <option value="بسترة">{isAr ? 'بسترة ومجنسات ألبان' : 'Dairy & Pasteurization'}</option>
            <option value="غلايات">{isAr ? 'غلايات وبخار' : 'Boilers & Steam'}</option>
          </select>
        </div>
      </div>

      {/* Techs Table */}
      <div className="bg-white border-geometric rounded-xs shadow-xs overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">كود الفني</th>
              <th className="px-4 py-3">اسم المهندس / الفني</th>
              <th className="px-4 py-3">رقم الهاتف (WhatsApp)</th>
              <th className="px-4 py-3">التخصص الرئيسي</th>
              <th className="px-4 py-3">نوع التعيين</th>
              <th className="px-4 py-3 text-center">الحالة الميدانية</th>
              <th className="px-4 py-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {filteredTechs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-500 font-bold">
                  {isAr ? 'لا يوجد فنيون مطابقون للبحث' : 'No technicians found'}
                </td>
              </tr>
            ) : (
              filteredTechs.map(tech => (
                <tr key={tech.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-2.5 font-mono font-bold text-slate-900">{tech.id}</td>
                  <td className="px-4 py-2.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: tech.color || '#0d9488' }}
                      />
                      <span>{tech.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-800">
                    <div className="flex items-center gap-2">
                      <span>{tech.phone}</span>
                      <a 
                        href={`https://wa.me/${tech.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً، إشعار من نظام إدارة الصيانة المركزية (سيدرا والمدينة)')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xs border border-emerald-300"
                        title={isAr ? 'إرسال رسالة WhatsApp تجريبية' : 'Test WhatsApp'}
                      >
                        <Send className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">
                    <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                      {tech.specialty}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{tech.employmentType || 'ثابت'}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => handleToggleActive(tech.id)}
                      className={`px-2 py-0.5 rounded-xs text-[10px] font-bold border transition ${
                        tech.active !== false
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {tech.active !== false ? (isAr ? 'نشط ومتاح' : 'Active') : (isAr ? 'في إجازة' : 'On Leave')}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => handleOpenEdit(tech)}
                        className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xs transition"
                        title={isAr ? 'تعديل بيانات الفني' : 'Edit Technician'}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(tech.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xs transition"
                        title={isAr ? 'حذف الفني' : 'Delete Technician'}
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

      {/* Add New Technician Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs border-geometric max-w-xl w-full p-5 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-700" />
                <span>{isAr ? 'إضافة فني أو مهندس جديد للفريق' : 'Add New Technician'}</span>
              </h4>
              <button onClick={() => setNewModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">كود الفني (Tech ID):</label>
                <input 
                  type="text" 
                  required
                  value={formData.id} 
                  onChange={e => setFormData({ ...formData, id: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-slate-50 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم الكامل:</label>
                <input 
                  type="text" 
                  required 
                  placeholder="مثال: م. أحمد عبد العزيز" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الهاتف (WhatsApp):</label>
                <input 
                  type="text" 
                  required 
                  placeholder="+20100..." 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التخصص الرئيسي:</label>
                <select 
                  value={formData.specialty} 
                  onChange={e => setFormData({ ...formData, specialty: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                >
                  <option value="تبريد وتكييف">تبريد وتكييف وغرف تبريد</option>
                  <option value="كهرباء ولوحات">كهرباء ولوحات تحكم PLC</option>
                  <option value="أفران ومخابز">أفران خطوط الإنتاج والمخابز</option>
                  <option value="بسترة ومجنسات">بسترة ومجنسات ألبان</option>
                  <option value="غلايات وبخار">غلايات وشبكات بخار</option>
                  <option value="سباكة ومرافق">سباكة وشبكات مياه</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع التعيين:</label>
                <select 
                  value={formData.employmentType} 
                  onChange={e => setFormData({ ...formData, employmentType: e.target.value as any })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white"
                >
                  <option value="ثابت">فني ثابت (دوام كامل)</option>
                  <option value="إدارة هندسية">مهندس صيانة إشرافي</option>
                  <option value="موسمي">فني طوارئ / موسمي</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">لون التمييز في الجدول:</label>
                <input 
                  type="color" 
                  value={formData.color || '#0d9488'} 
                  onChange={e => setFormData({ ...formData, color: e.target.value })} 
                  className="w-full h-9 p-1 border-geometric rounded-xs bg-white cursor-pointer"
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
                  {isAr ? 'إضافة الفني' : 'Add Tech'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Technician Modal */}
      {editingTech && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs border-geometric max-w-xl w-full p-5 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-teal-700" />
                <span>{isAr ? `تعديل ملف الفني (${editingTech.id})` : `Edit Tech ${editingTech.id}`}</span>
              </h4>
              <button onClick={() => setEditingTech(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">كود الفني:</label>
                <input 
                  type="text" 
                  disabled
                  value={formData.id} 
                  className="w-full p-2 border-geometric rounded-xs bg-slate-100 font-mono font-bold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم الكامل:</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الهاتف (WhatsApp):</label>
                <input 
                  type="text" 
                  required 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التخصص الرئيسي:</label>
                <select 
                  value={formData.specialty} 
                  onChange={e => setFormData({ ...formData, specialty: e.target.value })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white font-bold"
                >
                  <option value="تبريد وتكييف">تبريد وتكييف وغرف تبريد</option>
                  <option value="كهرباء ولوحات">كهرباء ولوحات تحكم PLC</option>
                  <option value="أفران ومخابز">أفران خطوط الإنتاج والمخابز</option>
                  <option value="بسترة ومجنسات">بسترة ومجنسات ألبان</option>
                  <option value="غلايات وبخار">غلايات وشبكات بخار</option>
                  <option value="سباكة ومرافق">سباكة وشبكات مياه</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع التعيين:</label>
                <select 
                  value={formData.employmentType} 
                  onChange={e => setFormData({ ...formData, employmentType: e.target.value as any })} 
                  className="w-full p-2 border-geometric rounded-xs bg-white"
                >
                  <option value="ثابت">فني ثابت (دوام كامل)</option>
                  <option value="إدارة هندسية">مهندس صيانة إشرافي</option>
                  <option value="موسمي">فني طوارئ / موسمي</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">لون التمييز:</label>
                <input 
                  type="color" 
                  value={formData.color || '#0d9488'} 
                  onChange={e => setFormData({ ...formData, color: e.target.value })} 
                  className="w-full h-9 p-1 border-geometric rounded-xs bg-white cursor-pointer"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2 p-2 bg-slate-50 border-geometric rounded-xs">
                <input 
                  type="checkbox"
                  id="techActive"
                  checked={formData.active !== false}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 accent-teal cursor-pointer"
                />
                <label htmlFor="techActive" className="font-bold text-slate-800 cursor-pointer">
                  {isAr ? 'فني نشط ومتاح لاستلام تكليفات أوامر الشغل الميدانية' : 'Active and available for assignments'}
                </label>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setEditingTech(null)} 
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
