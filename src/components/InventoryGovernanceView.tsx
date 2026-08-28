import React, { useState } from 'react';
import { 
  Package, 
  Wallet, 
  ClipboardCheck, 
  FileText, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  TrendingDown,
  Building,
  UserCheck,
  DollarSign
} from 'lucide-react';
import { 
  initialInventory, 
  initialCustodies, 
  initialBranchAudits, 
  initialGovernance, 
  initialDecisions 
} from '../data/seedData';
import { 
  InventoryItem, 
  CustodyRecord, 
  BranchAuditRecord, 
  GovernanceRecord, 
  AdminDecision 
} from '../types';

interface InventoryGovernanceViewProps {
  lang: 'ar' | 'en';
}

export const InventoryGovernanceView: React.FC<InventoryGovernanceViewProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'inventory' | 'custodies' | 'audits' | 'governance'>('inventory');

  const [inventory] = useState<InventoryItem[]>(initialInventory);
  const [custodies] = useState<CustodyRecord[]>(initialCustodies);
  const [audits] = useState<BranchAuditRecord[]>(initialBranchAudits);
  const [governance] = useState<GovernanceRecord[]>(initialGovernance);
  const [decisions] = useState<AdminDecision[]>(initialDecisions);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');

  const filteredInventory = inventory.filter(item => 
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.itemCode || item.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAudits = audits.filter(a => {
    const branchName = a.branchName || '';
    const matchesBranch = selectedBranch === 'all' || branchName === selectedBranch;
    const defsJoined = Array.isArray(a.deficiencies) ? a.deficiencies.join(' ') : '';
    const matchesSearch = searchTerm === '' || 
      branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defsJoined.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.summary || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  const uniqueBranches = Array.from(new Set(audits.map(a => a.branchName).filter(Boolean)));

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      
      {/* Sub Tabs Bar */}
      <div className="bg-white border-geometric p-2 rounded-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 sm:px-4 py-2 border-geometric rounded-xs text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'accent-teal text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{isAr ? `المخزون وقطع الغيار (${inventory.length})` : `Spare Parts (${inventory.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('custodies')}
            className={`px-3 sm:px-4 py-2 border-geometric rounded-xs text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
              activeTab === 'custodies'
                ? 'accent-teal text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>{isAr ? `العهد المالية والفنية (${custodies.length})` : `Petty Cash (${custodies.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('audits')}
            className={`px-3 sm:px-4 py-2 border-geometric rounded-xs text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
              activeTab === 'audits'
                ? 'accent-teal text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-900'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>{isAr ? `ملاحظات وأعطال الفروع (${audits.length})` : `Branch Audits (${audits.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            className={`px-3 sm:px-4 py-2 border-geometric rounded-xs text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
              activeTab === 'governance'
                ? 'accent-teal text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isAr ? 'الحوكمة والقرارات الإدارية' : 'Governance & Policies'}</span>
          </button>
        </div>

        <div className="text-xs font-mono font-bold text-slate-500 hidden lg:block">
          Enterprise ERP & Maintenance Sync
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. SPARE PARTS INVENTORY */}
      {/* ==================================================================== */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-white border-geometric p-3.5 rounded-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <input 
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={isAr ? 'بحث في قطع الغيار، فريون، سيور، زيوت، كباسات، فلاتر، محابس...' : 'Search spare parts, oil, freon, belts...'}
                className="w-full pl-3 pr-9 py-2 text-xs border-geometric rounded-xs bg-slate-50 outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              />
            </div>
            <div className="text-xs font-bold text-rose-900 bg-rose-50 border border-rose-300 px-3 py-1.5 rounded-xs flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span>يتم التنبيه تلقائياً عند انخفاض الرصيد عن حد الطلب الأدنى</span>
            </div>
          </div>

          <div className="bg-white border-geometric rounded-xs overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-3">الكود</th>
                  <th className="p-3">اسم الصنف ومواصفاته</th>
                  <th className="p-3">التصنيف</th>
                  <th className="p-3">الموقع التخزيني</th>
                  <th className="p-3 text-center">الرصيد الفعلي</th>
                  <th className="p-3 text-center">حد إعادة الطلب</th>
                  <th className="p-3">الأولوية</th>
                  <th className="p-3">حالة الرصيد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {filteredInventory.map(item => {
                  const isCritical = item.status === 'Critical Shortage' || (item.balance <= 0);
                  const isLow = item.status === 'Low Stock' || (item.reorderLevel !== undefined && item.balance <= item.reorderLevel);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{item.itemCode || item.id}</td>
                      <td className="p-3 font-bold text-slate-900">
                        <div>{item.name}</div>
                        {item.notes && <div className="text-[11px] text-slate-500 font-normal">{item.notes}</div>}
                      </td>
                      <td className="p-3 text-slate-600">{item.category}</td>
                      <td className="p-3 font-medium text-slate-800">{item.location}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-900">
                        {item.balance ?? 0} {item.unit || 'قطعة'}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-500">
                        {item.reorderLevel ?? 1} {item.unit || 'قطعة'}
                      </td>
                      <td className="p-3 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded-xs text-[10px] ${
                          item.priority === 'High' ? 'bg-rose-50 text-rose-800 font-black' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.priority || 'Normal'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold border ${
                          isCritical
                            ? 'bg-rose-100 text-rose-900 border-rose-400 animate-pulse font-black'
                            : isLow 
                            ? 'bg-amber-100 text-amber-900 border-amber-300' 
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {isCritical ? 'نقص حرج / شراء عاجل ⚠️' : isLow ? 'رصيد منخفض ⚠️' : 'متوفر بالمخزن ✓'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. PETTY CASH & CUSTODIES */}
      {/* ==================================================================== */}
      {activeTab === 'custodies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {custodies.map(c => (
              <div key={c.id} className="bg-white border-geometric rounded-xs p-4 flex flex-col justify-between hover:border-teal-700 transition">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-xs">{c.id}</span>
                    <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-300 px-2 py-0.5 rounded-xs">
                      {c.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-2.5 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-teal-600" />
                    <span>{c.custodian}</span>
                  </h3>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">{c.location}</div>

                  <div className="mt-3 bg-slate-50 p-2.5 rounded-xs border border-slate-200 space-y-1 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">قيمة العهدة:</span>
                      <span className="font-bold text-slate-900">{(c.amount ?? 0).toLocaleString()} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">الجهة / الشركة:</span>
                      <span className="font-bold text-slate-700 text-[11px] truncate max-w-[140px]">{c.org}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-2 bg-slate-50 p-2 rounded-xs border border-slate-200 leading-relaxed">
                    {c.purpose}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-200 text-[10px] text-slate-500 font-mono flex justify-between">
                  <span>التاريخ: {c.date || '—'}</span>
                  <span className="font-bold text-teal-700">معتمدة محاسبياً</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. BRANCH DEFICIENCIES AUDITS */}
      {/* ==================================================================== */}
      {activeTab === 'audits' && (
        <div className="space-y-4">
          
          <div className="bg-white border-geometric p-3.5 rounded-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-800">تصفية حسب الفرع:</span>
              <select
                value={selectedBranch}
                onChange={e => setSelectedBranch(e.target.value)}
                className="px-3 py-1.5 text-xs border-geometric rounded-xs bg-slate-50 font-bold outline-none"
              >
                <option value="all">كافة الفروع والمنشآت</option>
                {uniqueBranches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xs border border-slate-300">
              {filteredAudits.length} فحص وملاحظة مسجلة
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredAudits.map(audit => (
              <div key={audit.id} className="bg-white border-geometric rounded-xs p-4 flex flex-col justify-between space-y-3 hover:border-teal-700 transition">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-xs">{audit.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-xs bg-teal-50 text-teal-800 border border-teal-300">{audit.status}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-2 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-teal-600" />
                    <span>{audit.branchName}</span>
                  </h3>
                  <div className="text-[11px] text-slate-500 font-mono font-medium">مسؤول البلاغ: {audit.reportedBy || 'مدير الفرع'}</div>

                  <div className="mt-2.5 bg-rose-50/70 p-2.5 rounded-xs border border-rose-200 text-xs text-rose-950">
                    <span className="font-bold block mb-1">الملاحظات والأعطال المرصودة ({audit.itemsCount || audit.deficiencies?.length || 0} بنود):</span>
                    <ul className="list-disc list-inside space-y-0.5 leading-relaxed text-[11px]">
                      {audit.deficiencies?.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-2 bg-emerald-50/70 p-2.5 rounded-xs border border-emerald-300 text-xs text-emerald-950">
                    <span className="font-bold block mb-1">الملخص وخطة العمل:</span>
                    <p className="leading-relaxed text-[11px]">{audit.summary}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-mono">الجهة: {audit.org}</span>
                  <span className="px-2 py-0.5 rounded-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
                    {audit.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. GOVERNANCE & POLICIES */}
      {/* ==================================================================== */}
      {activeTab === 'governance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Governance Roles Card */}
          <div className="bg-white border-geometric rounded-xs p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <ShieldCheck className="w-5 h-5 text-teal-700" />
              <h3 className="font-black text-sm text-slate-900">الهيكل الإداري ولجنة حوكمة الصيانة والتشغيل</h3>
            </div>

            <div className="space-y-3">
              {governance.map((gov, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xs border-geometric space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{gov.name}</span>
                    <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-300 px-2 py-0.5 rounded-xs">{gov.role}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed pt-1">{gov.scope}</p>
                  {gov.ownership && <div className="text-[10px] text-slate-500 font-mono pt-1">نطاق الملكية / الإشراف: {gov.ownership}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Administrative Decisions Card */}
          <div className="bg-white border-geometric rounded-xs p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <FileText className="w-5 h-5 text-teal-700" />
              <h3 className="font-black text-sm text-slate-900">سجل القرارات الإدارية والتنظيمية الصادرة</h3>
            </div>

            <div className="space-y-3">
              {decisions.map(dec => (
                <div key={dec.id} className="bg-slate-50 p-3.5 rounded-xs border-geometric space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="font-mono font-bold text-slate-700 text-[11px]">{dec.id}</span>
                    <span className="font-mono text-slate-500 text-[10px]">{dec.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-900">{dec.title}</h4>
                  <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded-xs border border-slate-200">
                    {dec.scope}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                    <span>الجهة المصدرة: <strong className="text-slate-800">{dec.author}</strong></span>
                    <span className="font-bold text-emerald-700">ساري ومُلزم لجميع الفروع</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
