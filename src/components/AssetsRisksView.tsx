import React, { useState } from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Cpu, 
  MapPin, 
  Calendar, 
  Search, 
  Filter, 
  Gauge, 
  Zap, 
  Activity,
  Flame,
  QrCode,
  Printer
} from 'lucide-react';
import { initialAssets, initialRisks } from '../data/seedData';
import { AssetRecord, RiskRecord } from '../types';
import { AssetQrCodeModal } from './AssetQrCodeModal';

interface AssetsRisksViewProps {
  lang: 'ar' | 'en';
  onReportIncident?: (asset?: AssetRecord) => void;
}

export const AssetsRisksView: React.FC<AssetsRisksViewProps> = ({ lang, onReportIncident }) => {
  const isAr = lang === 'ar';
  const [subTab, setSubTab] = useState<'assets' | 'risks'>('assets');
  const [assets] = useState<AssetRecord[]>(initialAssets);
  const [risks] = useState<RiskRecord[]>(initialRisks);
  const [selectedAssetForQr, setSelectedAssetForQr] = useState<AssetRecord | null>(null);
  
  const [assetSearch, setAssetSearch] = useState('');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');

  const filteredAssets = assets.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
      a.id.toLowerCase().includes(assetSearch.toLowerCase()) ||
      ((a.location_name || a.location_id || (a as any).location || '').toLowerCase().includes(assetSearch.toLowerCase())) ||
      ((a.model || '').toLowerCase().includes(assetSearch.toLowerCase()));

    const matchesCategory = assetCategoryFilter === 'all' || a.category === assetCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredRisks = risks.filter(r => {
    return riskLevelFilter === 'all' || r.level === riskLevelFilter;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      
      {/* Sub Tabs Navigation */}
      <div className="bg-white border-geometric p-2 rounded-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('assets')}
            className={`px-4 py-2 border-geometric rounded-xs text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              subTab === 'assets'
                ? 'accent-teal text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>{isAr ? `سجل الماكينات والخطوط الإنتاجية (${assets.length})` : `Industrial Assets (${assets.length})`}</span>
          </button>

          <button
            onClick={() => setSubTab('risks')}
            className={`px-4 py-2 border-geometric rounded-xs text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              subTab === 'risks'
                ? 'bg-rose-700 text-white shadow-xs border-rose-900'
                : 'bg-white hover:bg-slate-100 text-rose-900 border-rose-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-300" />
            <span>{isAr ? `مصفوفة المخاطر الهندسية والحرجة (${risks.length})` : `Engineering Risks Matrix (${risks.length})`}</span>
          </button>
        </div>

        <div className="text-xs font-mono font-bold text-slate-500 hidden sm:block">
          Sidera Engineering Master Assets 2026
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. ASSETS TAB */}
      {/* ==================================================================== */}
      {subTab === 'assets' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white border-geometric p-3.5 rounded-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <input 
                type="text"
                value={assetSearch}
                onChange={e => setAssetSearch(e.target.value)}
                placeholder={isAr ? 'بحث بالماكينة، الموديل، الكود (مثل: بسترة، مجنس، شيلر، غلاية، فريزر)...' : 'Search machine, model, ID (e.g. Pasteurizer, Homogenizer, Chiller)...'}
                className="w-full pl-3 pr-9 py-2 text-xs border-geometric rounded-xs bg-slate-50 outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              />
            </div>

            <div>
              <select
                value={assetCategoryFilter}
                onChange={e => setAssetCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border-geometric rounded-xs bg-slate-50 outline-none focus:ring-1 focus:ring-slate-900 font-bold"
              >
                <option value="all">{isAr ? 'كافة الأقسام والمعدات' : 'All Asset Categories'}</option>
                <option value="ألبان وتصنيع ومجنسات">ألبان وتصنيع ومجنسات (Dairy & Homogenizers)</option>
                <option value="تبريد وتكييف وتشيلرات">تبريد وتكييف وتشيلرات (Refrigeration & Chillers)</option>
                <option value="مرافق وطاقة وغلايات">مرافق وطاقة وغلايات (Boilers & Steam)</option>
                <option value="حلواني ومخابز وعجين">حلواني ومخابز وعجين (Bakery Lines)</option>
                <option value="تعبئة وتغليف">تعبئة وتغليف (Packaging & Wrapping)</option>
                <option value="طاقة وتوليد">طاقة ومولدات ديزل (Generators)</option>
              </select>
            </div>
          </div>

          {/* Assets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredAssets.map(asset => {
              const isOperational = asset.status === 'يعمل بحالة ممتازة' || asset.status === 'يعمل بحالة جيدة' || asset.status === 'يعمل بحالة مقبولة';
              const isMaintenance = asset.status.includes('صيانة') || asset.status.includes('عمرة');

              return (
                <div 
                  key={asset.id}
                  className="bg-white border-geometric rounded-xs p-4 flex flex-col justify-between hover:border-teal-700 transition space-y-3"
                >
                  <div>
                    {/* Top Tag & Status */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
                      <span className="text-[10px] font-mono font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-xs">
                        {asset.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-xs border ${
                        isOperational 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                          : isMaintenance 
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}>
                        {asset.status}
                      </span>
                    </div>

                    {/* Machine Name & Model */}
                    <h3 className="font-bold text-sm text-slate-900 mt-2">
                      {asset.name}
                    </h3>
                    <div className="text-[11px] font-mono text-teal-800 font-bold mt-0.5">
                      {asset.model || 'Standard Industrial Unit'}
                    </div>

                    {/* Category & Location */}
                    <div className="mt-2.5 space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-900">{asset.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{asset.category}</span>
                      </div>
                    </div>

                    {/* Specs / Critical Notes */}
                    {asset.specs && (
                      <div className="mt-3 bg-slate-50 p-2.5 rounded-xs border border-slate-200 text-[11px] font-mono text-slate-800 space-y-1">
                        {asset.specs.capacity && <div>• السعة: <span className="font-bold text-slate-900">{asset.specs.capacity}</span></div>}
                        {asset.specs.power && <div>• القدرة: <span className="font-bold text-slate-900">{asset.specs.power}</span></div>}
                        {asset.specs.pressure && <div>• الضغط: <span className="font-bold text-slate-900">{asset.specs.pressure}</span></div>}
                        {asset.specs.gasType && <div>• نوع الفريون: <span className="font-bold text-teal-700">{asset.specs.gasType}</span></div>}
                      </div>
                    )}

                    {asset.criticalNotes && (
                      <div className="mt-2 text-[11px] text-rose-900 font-semibold bg-rose-50/70 p-2 rounded-xs border border-rose-200 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>{asset.criticalNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Maintenance Dates & QR Action */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>آخر فحص: {asset.lastService || '2026-08-10'}</span>
                    <button
                      onClick={() => setSelectedAssetForQr(asset)}
                      className="px-2 py-1 bg-slate-100 hover:bg-teal-50 text-teal-800 hover:text-teal-900 border border-slate-200 rounded font-bold flex items-center gap-1 transition-colors"
                      title="عرض وطباعة باركود الأصل"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QR & ملصق</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. ENGINEERING RISKS MATRIX TAB */}
      {/* ==================================================================== */}
      {subTab === 'risks' && (
        <div className="space-y-4">
          
          {/* Risk Level Filter */}
          <div className="bg-white border-geometric p-3.5 rounded-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">{isAr ? 'فلترة حسب مستوى الخطورة:' : 'Filter by Severity Level:'}</span>
              <div className="flex gap-1.5">
                {['all', 'Critical', 'High', 'Medium'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setRiskLevelFilter(lvl)}
                    className={`px-3 py-1 text-xs font-bold rounded-xs border-geometric transition ${
                      riskLevelFilter === lvl
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {lvl === 'all' ? (isAr ? 'الكل (9)' : 'All (9)') : lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-rose-900 font-bold bg-rose-50 px-3 py-1 border border-rose-300 rounded-xs flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-600" />
              <span>مخاطر استباقية تستلزم إجراءات تصحيحية وقائية عاجلة</span>
            </div>
          </div>

          {/* Risks Cards Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRisks.map(risk => {
              const isCrit = risk.level === 'Critical';
              const isHigh = risk.level === 'High';

              return (
                <div 
                  key={risk.id}
                  className={`bg-white border-geometric rounded-xs p-4 flex flex-col justify-between transition ${
                    isCrit ? 'border-rose-900 shadow-xs ring-1 ring-rose-200' : isHigh ? 'border-amber-800' : 'border-slate-400'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
                      <span className="font-mono text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-xs">
                        {risk.id}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-xs border uppercase tracking-wider ${
                        isCrit 
                          ? 'bg-rose-700 text-white border-rose-900 animate-pulse' 
                          : isHigh 
                          ? 'bg-amber-600 text-white border-amber-800' 
                          : 'bg-slate-200 text-slate-800 border-slate-300'
                      }`}>
                        {risk.level}
                      </span>
                    </div>

                    {/* Area & System */}
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{risk.area}</h3>
                      <div className="text-xs font-mono font-bold text-teal-800 mt-0.5">{risk.system}</div>
                    </div>

                    {/* Hazard Description */}
                    <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200">
                      <span className="font-bold text-[11px] text-slate-900 block mb-1">وصف الخطر والتبعات التشغيلية:</span>
                      <p className="text-xs text-slate-700 leading-relaxed">{risk.hazard}</p>
                    </div>

                    {/* Mitigation Action */}
                    <div className="bg-emerald-50/70 p-2.5 rounded-xs border border-emerald-300">
                      <span className="font-bold text-[11px] text-emerald-950 block mb-1">خطة الإجراء التصحيحي والوقائي:</span>
                      <p className="text-xs text-emerald-900 leading-relaxed font-medium">{risk.mitigation}</p>
                    </div>
                  </div>

                  {/* Footer Responsible */}
                  <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">المسؤول الهندسي:</span>
                    <span className="font-bold text-slate-900 font-mono">{risk.responsible}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Asset QR Code Modal */}
      {selectedAssetForQr && (
        <AssetQrCodeModal
          asset={selectedAssetForQr}
          onClose={() => setSelectedAssetForQr(null)}
          onReportIncident={(asset) => {
            if (onReportIncident) onReportIncident(asset);
          }}
        />
      )}

    </div>
  );
};
