import React from 'react';
import { 
  LayoutDashboard, 
  Smartphone, 
  Settings, 
  Download, 
  Globe, 
  Cpu, 
  Building2, 
  Package, 
  AlertCircle,
  PhoneCall
} from 'lucide-react';
import { useSystemSettings } from '../context/SystemSettingsContext';

export type AppTab = 'dashboard' | 'report' | 'visit' | 'assets_risks' | 'suppliers' | 'inventory' | 'admin' | 'gas_hub';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, lang, setLang }) => {
  const isAr = lang === 'ar';
  const { settings } = useSystemSettings();

  const navItems: { id: AppTab; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'report', labelAr: 'إبلاغ عن عطل', labelEn: 'Report Defect', icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'visit', labelAr: 'نموذج الفني', labelEn: 'Tech Visit', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'assets_risks', labelAr: 'الماكينات والمخاطر', labelEn: 'Assets & Risks', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'suppliers', labelAr: 'دليل الموردين (53)', labelEn: 'Suppliers (53)', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'inventory', labelAr: 'المخزون والعهد', labelEn: 'Inventory & ERP', icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'admin', labelAr: 'الإدارة والإعدادات', labelEn: 'Admin', icon: <Settings className="w-3.5 h-3.5" /> },
    { id: 'gas_hub', labelAr: 'تصدير GAS', labelEn: 'GAS Code', icon: <Download className="w-3.5 h-3.5 text-teal-400" /> },
  ];

  return (
    <header className="h-16 flex items-center justify-between px-3 sm:px-6 bg-white border-b-2 border-slate-900 sticky top-0 z-40">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-2">
        
        {/* Brand Logo & Title */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer shrink-0" 
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-9 h-9 accent-teal rounded-xs flex items-center justify-center text-white font-bold text-lg border-geometric shadow-xs">
            س
          </div>
          <div>
            <div className="font-black text-xs sm:text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>{isAr ? settings.general.appNameAr : settings.general.appNameEn}</span>
              <span className="text-[9px] bg-teal-50 text-teal-800 px-1.5 py-0.2 rounded-xs font-mono font-bold border border-teal-600 hidden md:inline-block">
                GAS + Sheets
              </span>
            </div>
            <div className="text-teal-700 uppercase text-[10px] font-bold block leading-none mt-0.5 flex items-center gap-2">
              <span>{settings.general.orgName}</span>
              {settings.general.supportEmergencyHotline && (
                <span className="hidden lg:inline-flex items-center gap-1 text-slate-500 font-mono text-[10px]">
                  <PhoneCall className="w-2.5 h-2.5 text-rose-500" />
                  <span>طوارئ: {settings.general.supportEmergencyHotline}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold overflow-x-auto py-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            const isGasHub = item.id === 'gas_hub';

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-2.5 py-1.5 border-geometric rounded-xs transition flex items-center gap-1 shrink-0 ${
                  isActive
                    ? isGasHub
                      ? 'bg-slate-900 text-teal-300'
                      : 'accent-teal text-white shadow-xs'
                    : isGasHub
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : 'bg-white hover:bg-slate-100 text-slate-900'
                }`}
              >
                {item.icon}
                <span className="hidden xl:inline">{isAr ? item.labelAr : item.labelEn}</span>
                <span className="xl:hidden">
                  {item.id === 'dashboard' ? (isAr ? 'الرئيسية' : 'Dash') :
                   item.id === 'visit' ? (isAr ? 'الفني' : 'Visit') :
                   item.id === 'assets_risks' ? (isAr ? 'الماكينات' : 'Assets') :
                   item.id === 'suppliers' ? (isAr ? 'الموردين' : 'Suppliers') :
                   item.id === 'inventory' ? (isAr ? 'المخزون' : 'Stock') :
                   item.id === 'admin' ? (isAr ? 'الإدارة' : 'Admin') :
                   (isAr ? 'GAS' : 'GAS')}
                </span>
              </button>
            );
          })}

          <div className="h-5 w-[1.5px] bg-slate-300 mx-0.5 hidden sm:block shrink-0"></div>

          {/* Language Switch */}
          <button
            onClick={() => setLang(isAr ? 'en' : 'ar')}
            className="px-2 py-1.5 border-geometric bg-white hover:bg-slate-100 text-slate-900 rounded-xs transition flex items-center gap-1 text-[11px] font-mono font-bold shrink-0"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isAr ? 'EN' : 'عربي'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
