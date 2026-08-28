import React, { useState } from 'react';
import { Search, Phone, Star, ShieldCheck, Building2, Wrench, Filter, Tag, ExternalLink } from 'lucide-react';
import { initialSuppliers } from '../data/seedData';
import { SupplierItem } from '../types';

interface SuppliersViewProps {
  lang: 'ar' | 'en';
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [suppliers] = useState<SupplierItem[]>(initialSuppliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: isAr ? 'كافة الموردين (53)' : 'All Suppliers (53)' },
    { id: 'ألبان وتصنيع ومجنسات وغلايات', label: isAr ? 'ألبان وغلايات ومجنسات (9)' : 'Dairy & Boilers (9)' },
    { id: 'تبريد وتكييف وتشيلرات وضواغط', label: isAr ? 'تبريد وتكييف وتشيلرات (8)' : 'Cooling & Chillers (8)' },
    { id: 'حلواني، مخابز، وشوكولاتة', label: isAr ? 'حلواني ومخابز وشوكولاتة (7)' : 'Pastry & Bakery (7)' },
    { id: 'كهرباء، مواتير ومولدات', label: accentsClean('كهرباء ومواتير ومولدات (4)') },
    { id: 'مصاعد، مدني، استانلس وخدمات عامة', label: isAr ? 'مصاعد وتجهيزات ومدني (25)' : 'Elevators & Civil (25)' }
  ];

  function accentsClean(text: string) {
    return isAr ? text : 'Electrical & Motors (4)';
  }

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm) ||
      s.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      
      {/* Header Banner */}
      <div className="bg-white border-geometric p-4 sm:p-5 rounded-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-teal-600 rounded-xs"></span>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              {isAr ? 'دليل الموردين ومقاولي الصيانة المعتمدين (53 جهة معتمدة)' : 'Approved Engineering Suppliers & Contractors Directory (53)'}
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {isAr 
              ? 'دليل الشركات والمقاولين المعتمدين للخدمات الهندسية، عمرات التشيلرات، لف المواتير، قطع غيار كمنز، ماكينات التعبئة ومعدات الألبان والحلواني'
              : 'Enterprise approved vendor directory covering dairy lines, boiler overhaul, chiller repair, motor rewinding & bakery automation'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-teal-50 border border-teal-600 text-teal-900 font-mono text-xs font-bold rounded-xs">
            {filteredSuppliers.length} / 53 {isAr ? 'مورد معتمد' : 'Vendors'}
          </span>
        </div>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="bg-white border-geometric p-3.5 rounded-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={isAr ? 'ابحث باسم المورد، التخصص، رقم الهاتف، نوع المعدة (مثال: كمنز، غلاية، شيلر، مجنس، كباس، رخام)...' : 'Search by vendor, phone, specialty (e.g., Cummins, Chiller, Boiler)...'}
            className="w-full pl-3 pr-9 py-2 text-xs border-geometric rounded-xs bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-slate-900 font-medium"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xs border-geometric transition ${
                selectedCategory === cat.id
                  ? 'accent-teal text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredSuppliers.map((s, idx) => (
          <div 
            key={s.id}
            className="bg-white border-geometric rounded-xs p-4 flex flex-col justify-between hover:border-teal-700 hover:shadow-xs transition relative group"
          >
            <div>
              {/* Category & Status Bar */}
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200">
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-xs">
                  {s.id}
                </span>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-300 px-2 py-0.5 rounded-xs truncate max-w-[200px]">
                  {s.category}
                </span>
              </div>

              {/* Name & Contact */}
              <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                <span>{s.name}</span>
                {s.rating && (
                  <span className="flex items-center text-amber-500 text-xs font-mono">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline ml-0.5" />
                    {s.rating}.0
                  </span>
                )}
              </h3>

              {/* Specialty */}
              <p className="text-xs text-slate-700 font-medium mt-1.5 leading-relaxed bg-slate-50 p-2 rounded-xs border border-slate-200">
                {s.specialty}
              </p>

              {/* Notes if any */}
              {s.notes && (
                <p className="text-[11px] text-slate-500 mt-2 italic flex items-center gap-1">
                  <Tag className="w-3 h-3 text-slate-400" />
                  <span>{s.notes}</span>
                </p>
              )}
            </div>

            {/* Action Bottom Bar */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <a 
                href={`tel:${s.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold transition"
              >
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>{s.phone}</span>
              </a>

              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-xs flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>معتمد</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="bg-white border-geometric p-8 rounded-xs text-center text-slate-500 font-bold">
          {isAr ? 'لم يتم العثور على موردين يطابقون شروط البحث الحالية.' : 'No suppliers matched your search query.'}
        </div>
      )}

    </div>
  );
};
