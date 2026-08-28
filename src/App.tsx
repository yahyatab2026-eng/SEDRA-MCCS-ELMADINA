import React, { useState, useEffect } from 'react';
import { Navbar, AppTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ReportIncidentView } from './components/ReportIncidentView';
import { VisitWizardView } from './components/VisitWizardView';
import { AssetsRisksView } from './components/AssetsRisksView';
import { SuppliersView } from './components/SuppliersView';
import { InventoryGovernanceView } from './components/InventoryGovernanceView';
import { AdminView } from './components/AdminView';
import { GasExportModal } from './components/GasExportModal';
import { initialWorkOrders } from './data/seedData';
import { WorkOrder } from './types';
import { SystemSettingsProvider, useSystemSettings } from './context/SystemSettingsContext';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [selectedWoForVisit, setSelectedWoForVisit] = useState<string>('');
  const { settings } = useSystemSettings();

  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    return (localStorage.getItem('cmms_lang') as 'ar' | 'en') || 'ar';
  });

  // Global Work Orders State with LocalStorage Persistence
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    const cached = localStorage.getItem('cmms_work_orders');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing stored work orders', e);
      }
    }
    return initialWorkOrders;
  });

  useEffect(() => {
    localStorage.setItem('cmms_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const handleWorkOrderCreated = (newWo: WorkOrder) => {
    setWorkOrders(prev => {
      const updated = [newWo, ...prev];
      localStorage.setItem('cmms_work_orders', JSON.stringify(updated));
      return updated;
    });
  };

  const handleNavigateToVisit = (woId?: string) => {
    if (woId) setSelectedWoForVisit(woId);
    setActiveTab('visit');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Cairo',sans-serif] relative selection:bg-teal-200">
      {/* Geometric Grid Overlay Background */}
      <div className="fixed inset-0 grid-overlay pointer-events-none z-0"></div>

      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        lang={lang} 
        setLang={setLang} 
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 relative z-10">
        {activeTab === 'dashboard' && (
          <DashboardView 
            lang={lang} 
            workOrdersList={workOrders}
            onUpdateWorkOrders={(wos) => {
              setWorkOrders(wos);
              localStorage.setItem('cmms_work_orders', JSON.stringify(wos));
            }}
            onNavigateToVisit={handleNavigateToVisit}
            onNavigateToReport={() => setActiveTab('report')}
          />
        )}

        {activeTab === 'report' && (
          <ReportIncidentView
            lang={lang}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            onNavigateToVisit={(woId) => {
              setSelectedWoForVisit(woId);
              setActiveTab('visit');
            }}
            onWorkOrderCreated={handleWorkOrderCreated}
          />
        )}

        {activeTab === 'visit' && (
          <VisitWizardView 
            lang={lang} 
            onCompleted={() => setActiveTab('dashboard')} 
          />
        )}

        {activeTab === 'assets_risks' && (
          <AssetsRisksView 
            lang={lang} 
          />
        )}

        {activeTab === 'suppliers' && (
          <SuppliersView 
            lang={lang} 
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryGovernanceView 
            lang={lang} 
          />
        )}

        {activeTab === 'admin' && (
          <AdminView 
            lang={lang} 
          />
        )}

        {activeTab === 'gas_hub' && (
          <GasExportModal 
            lang={lang} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 text-xs py-4 border-t-2 border-slate-900 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-teal-400 rounded-xs border border-white"></span>
            <span className="font-bold text-white">
              {lang === 'ar' ? settings.general.appNameAr : settings.general.appNameEn}
            </span>
          </div>
          <div className="font-mono text-[11px] text-slate-400 flex items-center gap-3">
            <span className="text-teal-400 font-bold">100% Free Google Stack</span>
            <span>Sheets DB • Drive Storage • Gemini 2.5 REST • Leaflet Map</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <SystemSettingsProvider>
      <MainAppContent />
    </SystemSettingsProvider>
  );
}

