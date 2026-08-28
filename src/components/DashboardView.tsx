import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  DollarSign, 
  Users, 
  Sparkles, 
  MapPin, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  RefreshCw, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  AlertCircle
} from 'lucide-react';
import { LocationItem, TechnicianItem, WorkOrder, DashboardStats } from '../types';
import { initialLocations, initialTechnicians, initialWorkOrders, initialStats } from '../data/seedData';

interface DashboardViewProps {
  lang: 'ar' | 'en';
  onNavigateToVisit: (woId?: string) => void;
  onNavigateToReport?: () => void;
  workOrdersList?: WorkOrder[];
  onUpdateWorkOrders?: (wos: WorkOrder[]) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  lang, 
  onNavigateToVisit,
  onNavigateToReport,
  workOrdersList,
  onUpdateWorkOrders
}) => {
  const isAr = lang === 'ar';

  // State
  const [locations] = useState<LocationItem[]>(initialLocations);
  const [technicians] = useState<TechnicianItem[]>(initialTechnicians);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => workOrdersList || initialWorkOrders);
  const [stats, setStats] = useState<DashboardStats>(initialStats);

  useEffect(() => {
    if (workOrdersList) {
      setWorkOrders(workOrdersList);
    }
  }, [workOrdersList]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTech, setSelectedTech] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // Selected Modal WO
  const [activeModalWo, setActiveModalWo] = useState<WorkOrder | null>(null);
  const [assignedTechInput, setAssignedTechInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Map references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [showSitesLayer, setShowSitesLayer] = useState(true);
  const [showWosLayer, setShowWosLayer] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [30.0500, 31.2500], // Cairo center
        zoom: 11,
        zoomControl: true,
      });

      // Free OpenStreetMap Raster Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // cleanup handled if unmounted
    };
  }, []);

  // Update Map Markers on filter / layer toggle
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    const siteColors: Record<string, string> = {
      'منفذ بيع': '#16a34a',
      'مصنع': '#dc2626',
      'مقر إداري': '#2563eb',
      'مخزن': '#ea580c',
      'أخرى': '#64748b'
    };

    // 1. Plot Sites (40 locations)
    if (showSitesLayer) {
      locations.forEach(loc => {
        if (!loc.lat || !loc.lng) return;
        const color = siteColors[loc.type] || '#16a34a';

        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.4);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });
        marker.bindPopup(`
          <div dir="rtl" style="font-family: 'Cairo', sans-serif; min-width: 190px;">
            <div style="font-weight: 800; font-size: 13px; color: #0f172a;">${loc.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              النوع: <strong style="color: ${color};">${loc.type}</strong> | المنطقة: ${loc.region}
            </div>
            <div style="font-size: 11px; color: #334155; margin-top: 4px;">${loc.address}</div>
          </div>
        `);
        layer.addLayer(marker);
      });
    }

    // 2. Plot Active Work Orders
    if (showWosLayer) {
      workOrders.forEach(wo => {
        const loc = locations.find(l => l.id === wo.location_id || l.name === wo.location_name);
        if (!loc || !loc.lat || !loc.lng) return;

        const isUrgent = wo.severity === 'عاجل';
        const pinColor = isUrgent ? '#e11d48' : '#f59e0b';

        const woIcon = L.divIcon({
          className: 'custom-wo-marker',
          html: `<div style="background-color: ${pinColor}; color: white; font-weight: 800; font-size: 10px; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">${isUrgent ? '!' : 'W'}</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        // Small offset so it doesn't overlap the site marker perfectly
        const offsetLat = loc.lat + 0.0012;
        const offsetLng = loc.lng + 0.0012;

        const marker = L.marker([offsetLat, offsetLng], { icon: woIcon });
        marker.bindPopup(`
          <div dir="rtl" style="font-family: 'Cairo', sans-serif; min-width: 210px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 800; color: #0f172a;">${wo.wo_id}</span>
              <span style="background: ${isUrgent ? '#fee2e2' : '#fef3c7'}; color: ${isUrgent ? '#dc2626' : '#d97706'}; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${wo.severity}</span>
            </div>
            <div style="font-size: 12px; font-weight: 700; color: #334155; margin-top: 4px;">${wo.location_name}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${wo.category} - ${wo.description.substring(0, 50)}...</div>
            <div style="margin-top: 8px;">
              <button id="wo-popup-${wo.wo_id}" style="background: #2563eb; color: white; border: none; padding: 5px 10px; font-size: 11px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%;">عرض وتكليف الفني 🔍</button>
            </div>
          </div>
        `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`wo-popup-${wo.wo_id}`);
          if (btn) {
            btn.onclick = () => {
              openModal(wo);
              marker.closePopup();
            };
          }
        });

        layer.addLayer(marker);
      });
    }
  }, [locations, workOrders, showSitesLayer, showWosLayer]);

  // Filter Logic
  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = searchTerm === '' || 
      wo.wo_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || wo.status === selectedStatus;
    const matchesSeverity = !selectedSeverity || wo.severity === selectedSeverity;
    const matchesLocation = !selectedLocation || wo.location_id === selectedLocation;
    const matchesTech = !selectedTech || wo.assigned_tech.includes(selectedTech);

    return matchesSearch && matchesStatus && matchesSeverity && matchesLocation && matchesTech;
  });

  const totalPages = Math.ceil(filteredWorkOrders.length / itemsPerPage) || 1;
  const paginatedWorkOrders = filteredWorkOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const openModal = (wo: WorkOrder) => {
    setActiveModalWo(wo);
    setAssignedTechInput(wo.assigned_tech || '');
  };

  const closeModal = () => {
    setActiveModalWo(null);
  };

  // Re-run Gemini Diagnosis in Preview
  const handleRerunGemini = () => {
    if (!activeModalWo) return;
    setIsAiLoading(true);
    setTimeout(() => {
      const updated: WorkOrder = {
        ...activeModalWo,
        gemini_summary: 'تم التحليل بواسطة Gemini 2.5 Flash: عطل في الثرموستات وانسداد تدفق الهواء. إجراء فوري موصى به لتفادي تلف المخزون الغذائي.',
        gemini_json: {
          rootCause: 'عطل إلكتروني في حساس الثرموستات مع تراكم الأتربة على زعانف المبخر',
          suggestedActions: [
            'فصل التيار الكهربائي عن الوحدة وفحص فيوز الحماية',
            'استبدال حساس الحرارة NTC 10k',
            'تنظيف مكثف الهواء باستخدام مضخة الضغط الخفيف',
            'اختبار دورة التبريد والتأكد من ثبات درجة الحرارة عند -18 مئوية'
          ],
          safetyRisk: 'متوسط - يرجى ارتداء القفازات العازلة عند فحص لوحة الكهرباء',
          confidence: 0.96
        }
      };
      setWorkOrders(prev => prev.map(w => w.wo_id === updated.wo_id ? updated : w));
      setActiveModalWo(updated);
      setIsAiLoading(false);
    }, 900);
  };

  // Update Status
  const handleUpdateStatus = (newStatus: string) => {
    if (!activeModalWo) return;
    const updated: WorkOrder = {
      ...activeModalWo,
      status: newStatus,
      closed_at: newStatus === 'مُنجز' || newStatus === 'مُغلق' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : activeModalWo.closed_at
    };
    setWorkOrders(prev => prev.map(w => w.wo_id === updated.wo_id ? updated : w));
    setActiveModalWo(updated);
    
    // update stats
    setStats(prev => ({
      ...prev,
      openCount: workOrders.filter(w => w.status !== 'مُنجز' && w.status !== 'مُغلق').length
    }));
  };

  // Assign Tech
  const handleAssignTech = () => {
    if (!activeModalWo || !assignedTechInput) return;
    const updated: WorkOrder = {
      ...activeModalWo,
      assigned_tech: assignedTechInput,
      status: activeModalWo.status === 'مُبلَّغ عنه' ? 'مُحدَّد' : activeModalWo.status
    };
    setWorkOrders(prev => prev.map(w => w.wo_id === updated.wo_id ? updated : w));
    setActiveModalWo(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* 0. DISPATCH & REPORTING ACTION BAR */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-xs border-geometric flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-600 rounded-xs flex items-center justify-center text-white font-bold shrink-0 border border-rose-400">
            <AlertCircle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>{isAr ? 'غرفة طوارئ وإدارة الصيانة المركزية (40 موقعاً)' : 'Central Maintenance Operations Room (40 Sites)'}</span>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-xs border border-teal-500/30 font-mono">LIVE SYNC</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {isAr ? 'متابعة حية لبلاغات مدراء الفروع ومهندسي المصانع وتوجيه فنيي الطوارئ' : 'Real-time incident stream from branch managers and plant engineers with instant dispatching'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToReport && (
            <button
              onClick={onNavigateToReport}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-black rounded-xs border border-rose-400 shadow-xs transition flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{isAr ? '+ تسجيل بلاغ عطل فوري (فروع ومصانع)' : '+ Report Incident Now'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. KPI METRIC CARDS (8 GEOMETRIC CARDS) */}
      <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        
        {/* Weekly WOs */}
        <div className="bg-white border-geometric p-3.5 rounded-xs flex flex-col justify-between hover:bg-slate-50/80 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{isAr ? 'بلاغات الأسبوع' : 'Weekly WOs'}</span>
            <Activity className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-slate-900">{stats.weeklyCount}</span>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-300 px-1.5 py-0.5 rounded-xs font-mono">NEW</span>
          </div>
          <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-600 w-3/4"></div>
          </div>
        </div>

        {/* Open Now */}
        <div className="bg-white border-geometric p-3.5 rounded-xs flex flex-col justify-between hover:bg-slate-50/80 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{isAr ? 'مفتوحة الآن' : 'Open Now'}</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-amber-600">{stats.openCount}</span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded-xs font-mono">ACTIVE</span>
          </div>
          <div className="mt-2 text-[10px] text-teal-700 font-bold">{isAr ? '-12% عن الأسبوع الماضي' : '-12% vs last wk'}</div>
        </div>

        {/* Overdue SLA (Geometric Alert Card) */}
        <div className="bg-rose-50 border-geometric border-rose-900 p-3.5 rounded-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-900 text-xs font-bold">
            <span>{isAr ? 'متأخرة عن SLA' : 'Overdue SLA'}</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-rose-700">{stats.overdueCount}</span>
            <span className="text-[10px] font-bold text-rose-900 bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded-xs font-mono animate-pulse">
              URGENT
            </span>
          </div>
          <div className="mt-2 text-[10px] text-rose-900 font-bold">{isAr ? 'يتطلب تدخل فوري' : 'Requires escalation'}</div>
        </div>

        {/* Completion Rate 30d */}
        <div className="bg-white border-geometric p-3.5 rounded-xs flex flex-col justify-between hover:bg-slate-50/80 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{isAr ? 'نسبة الإنجاز' : 'Completion'}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-emerald-600">{stats.completionRate30d}%</span>
            <span className="text-[10px] font-mono text-slate-500 font-bold">30 DAYS</span>
          </div>
          <div className="mt-2 flex gap-1">
            <div className="h-1.5 w-1.5 rounded-xs bg-emerald-600"></div>
            <div className="h-1.5 w-1.5 rounded-xs bg-emerald-600"></div>
            <div className="h-1.5 w-1.5 rounded-xs bg-emerald-200"></div>
          </div>
        </div>

        {/* MTTR (Hours) */}
        <div className="bg-white border-geometric p-3.5 rounded-xs flex flex-col justify-between hover:bg-slate-50/80 transition" title="Mean Time to Repair">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{isAr ? 'MTTR (ساعات)' : 'MTTR (Hours)'}</span>
            <Wrench className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-slate-900">{stats.mttrHours}</span>
            <span className="text-[10px] font-mono text-slate-500">HRS/WO</span>
          </div>
          <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-600 w-1/2"></div>
          </div>
        </div>

        {/* MTBF (Days) */}
        <div className="bg-white border-geometric p-3.5 rounded-xs flex flex-col justify-between hover:bg-slate-50/80 transition" title="Mean Time Between Failures">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{isAr ? 'MTBF (أيام)' : 'MTBF (Days)'}</span>
            <TrendingUp className="w-3.5 h-3.5 text-slate-800" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-slate-900">{stats.mtbfDays}</span>
            <span className="text-[10px] font-mono text-slate-500">DAYS</span>
          </div>
          <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-900 w-4/5"></div>
          </div>
        </div>

        {/* Month Cost */}
        <div className="bg-white border-geometric p-3.5 rounded-xs flex flex-col justify-between hover:bg-slate-50/80 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{isAr ? 'تكلفة الشهر' : 'Month Cost'}</span>
            <DollarSign className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">{(stats?.monthCost ?? 0).toLocaleString()}</span>
            <span className="text-[10px] font-mono text-teal-800 font-bold">EGP</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 font-bold">{isAr ? 'المصنعية وقطع الغيار' : 'Parts & Labor'}</div>
        </div>

        {/* Active Techs */}
        <div className="bg-white border-geometric p-3.5 rounded-xs flex flex-col justify-between hover:bg-slate-50/80 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{isAr ? 'فنيون بالميدان' : 'Field Techs'}</span>
            <Users className="w-3.5 h-3.5 text-slate-900" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-slate-900">{stats.activeTechs}</span>
            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-300 px-1.5 py-0.5 rounded-xs font-mono">100%</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 font-bold">{isAr ? 'القاهرة الكبرى' : 'Cairo Coverage'}</div>
        </div>

      </section>

      {/* 2. MAP & GEMINI AI INSIGHTS & BREAKDOWN SPLIT */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Cairo Interactive Leaflet Map (7 Columns) */}
        <div className="lg:col-span-7 bg-white border-geometric rounded-xs overflow-hidden flex flex-col relative">
          <div className="p-3 bg-slate-100 border-b border-slate-900 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-700" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                {isAr ? 'توزيع البلاغات الجغرافي - القاهرة الكبرى' : 'Incident & Facility Geographic Distribution'}
              </h3>
              <span className="px-2 py-0.5 bg-white border border-slate-300 text-[10px] font-mono font-bold text-slate-800 rounded-xs">
                30.04°N, 31.23°E
              </span>
            </div>

            {/* Map Toggles */}
            <div className="flex items-center gap-2 text-xs">
              <label className="inline-flex items-center cursor-pointer bg-white px-2 py-1 rounded-xs border border-slate-300 text-[11px] font-bold">
                <input 
                  type="checkbox" 
                  checked={showSitesLayer} 
                  onChange={e => setShowSitesLayer(e.target.checked)} 
                  className="rounded-xs text-teal-700 focus:ring-0 ml-1.5"
                />
                <span>{isAr ? 'المواقع (40)' : 'Sites (40)'}</span>
              </label>
              <label className="inline-flex items-center cursor-pointer bg-white px-2 py-1 rounded-xs border border-slate-300 text-[11px] font-bold">
                <input 
                  type="checkbox" 
                  checked={showWosLayer} 
                  onChange={e => setShowWosLayer(e.target.checked)} 
                  className="rounded-xs text-rose-700 focus:ring-0 ml-1.5"
                />
                <span>{isAr ? 'البلاغات' : 'WOs'}</span>
              </label>
              <button 
                onClick={() => mapInstanceRef.current?.setView([30.0500, 31.2500], 11)} 
                className="px-2.5 py-1 rounded-xs border border-slate-300 bg-white hover:bg-slate-100 text-slate-900 font-mono text-[11px] font-bold transition"
              >
                🎯 {isAr ? 'إعادة ضبط' : 'Reset'}
              </button>
            </div>
          </div>

          <div ref={mapContainerRef} className="w-full h-[360px] z-0"></div>
        </div>

        {/* Breakdown & Gemini AI (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Category Breakdown (Geometric Balance Style) */}
          <div className="bg-white border-geometric p-4 rounded-xs flex-1">
            <h3 className="text-xs font-bold mb-3 border-b pb-2 border-slate-900 flex items-center justify-between">
              <span>{isAr ? 'البلاغات حسب القسم والتخصص' : 'Incidents by Department'}</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">RATIO %</span>
            </h3>
            
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex justify-between items-end text-xs mb-1">
                  <span className="font-bold text-slate-800">{isAr ? 'تبريد وتجميد (غرف وثلاجات)' : 'Refrigeration & Cooling'}</span>
                  <span className="font-mono font-bold text-teal-800">42%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 border border-slate-300">
                  <div className="h-full accent-teal w-[42%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end text-xs mb-1">
                  <span className="font-bold text-slate-800">{isAr ? 'أفران ومعدات مخابز' : 'Bakery Ovens & Mixers'}</span>
                  <span className="font-mono font-bold text-slate-900">28%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 border border-slate-300">
                  <div className="h-full bg-slate-900 w-[28%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end text-xs mb-1">
                  <span className="font-bold text-slate-800">{isAr ? 'كهرباء ولوحات تحكم' : 'Electrical & Panels'}</span>
                  <span className="font-mono font-bold text-slate-600">18%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 border border-slate-300">
                  <div className="h-full bg-slate-500 w-[18%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end text-xs mb-1">
                  <span className="font-bold text-slate-800">{isAr ? 'سباكة ومضخات مياه' : 'Plumbing & Pumps'}</span>
                  <span className="font-mono font-bold text-slate-600">12%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 border border-slate-300">
                  <div className="h-full bg-slate-400 w-[12%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Gemini AI Intelligence Box */}
          <div className="bg-slate-900 text-white border-geometric p-4 rounded-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <h3 className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>{isAr ? 'رؤى الذكاء الاصطناعي (Gemini 2.5 REST)' : 'Gemini AI Intelligence Insights'}</span>
                </h3>
                <span className="text-[10px] font-mono text-teal-300 bg-slate-800 px-2 py-0.5 border border-slate-700 rounded-xs">
                  CONNECTED
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isAr 
                  ? 'تم رصد زيادة متكررة في أعطال ثلاجات العرض بفرع المعادي (LO-104) ومصنع العاشر 1. يوصى بإجراء صيانة وقائية استباقية لجميع المبردات في المنطقة قبل دخول موسم الصيف لتجنب تكاليف الصيانة الطارئة وتلف المخزون.'
                  : 'Recurring refrigeration anomalies detected across Maadi branch (LO-104) and 10th of Ramadan plant. Preventive coil washing recommended before summer peak.'
                }
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">AUTO-SCHEDULED • GAS TRIGGER</span>
              <button 
                onClick={() => alert(isAr ? 'تم تحديث التحليل الذكي من Gemini REST API بنجاح.' : 'Analysis refreshed successfully.')}
                className="text-[10px] font-bold text-teal-400 hover:text-teal-300 uppercase tracking-wider transition"
              >
                {isAr ? 'تحديث التحليل ↗' : 'Update Analysis ↗'}
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* 3. WORK ORDERS TABLE & FILTERS */}
      <section className="bg-white border-geometric rounded-xs overflow-hidden">
        
        {/* Table Filter Header */}
        <div className="p-4 border-b border-slate-900 bg-slate-50 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">
                {isAr ? 'سجل أوامر وبلاغات الصيانة (Work Orders)' : 'Work Orders Registry'}
              </h3>
              <span className="px-2 py-0.5 border-geometric bg-white text-[10px] font-mono font-bold text-slate-900 rounded-xs">
                {filteredWorkOrders.length} {isAr ? 'بلاغ' : 'WOs'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => onNavigateToVisit()}
                className="px-3.5 py-1.5 border-geometric accent-teal hover:opacity-90 text-white text-xs font-bold rounded-xs transition shadow-xs flex items-center gap-1.5"
              >
                <span>+ {isAr ? 'تسجيل زيارة ميدانية جديدة' : 'New Field Visit'}</span>
              </button>
            </div>
          </div>

          {/* Filter Bar with Geometric Borders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
            
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }} 
                placeholder={isAr ? 'بحث بالرقم أو الفرع أو العطل...' : 'Search WO, branch, issue...'} 
                className="w-full pl-3 pr-8 py-1.5 text-xs rounded-xs border-geometric bg-white outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Status */}
            <div>
              <select 
                value={selectedStatus} 
                onChange={e => { setSelectedStatus(e.target.value); setPage(1); }} 
                className="w-full px-2.5 py-1.5 text-xs rounded-xs border-geometric bg-white outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              >
                <option value="">{isAr ? 'كل الحالات (All)' : 'All Statuses'}</option>
                <option value="مُبلَّغ عنه">مُبلَّغ عنه (Reported)</option>
                <option value="مُحدَّد">مُحدَّد (Assigned)</option>
                <option value="قيد التنفيذ">قيد التنفيذ (In Progress)</option>
                <option value="مُنجز">مُنجز (Completed)</option>
                <option value="مُغلق">مُغلق (Closed)</option>
              </select>
            </div>

            {/* Severity */}
            <div>
              <select 
                value={selectedSeverity} 
                onChange={e => { setSelectedSeverity(e.target.value); setPage(1); }} 
                className="w-full px-2.5 py-1.5 text-xs rounded-xs border-geometric bg-white outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              >
                <option value="">{isAr ? 'كل درجات الخطورة' : 'All Severities'}</option>
                <option value="عاجل">عاجل (Urgent - 4h SLA)</option>
                <option value="متوسط">متوسط (Medium)</option>
                <option value="منخفض">منخفض (Low)</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <select 
                value={selectedLocation} 
                onChange={e => { setSelectedLocation(e.target.value); setPage(1); }} 
                className="w-full px-2.5 py-1.5 text-xs rounded-xs border-geometric bg-white outline-none focus:ring-1 focus:ring-slate-900 font-medium truncate"
              >
                <option value="">{isAr ? 'كل المواقع والمصانع (40)' : 'All Locations (40)'}</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.type})</option>
                ))}
              </select>
            </div>

            {/* Tech */}
            <div>
              <select 
                value={selectedTech} 
                onChange={e => { setSelectedTech(e.target.value); setPage(1); }} 
                className="w-full px-2.5 py-1.5 text-xs rounded-xs border-geometric bg-white outline-none focus:ring-1 focus:ring-slate-900 font-medium truncate"
              >
                <option value="">{isAr ? 'كل الفنيين (16)' : 'All Technicians (16)'}</option>
                {technicians.map(t => (
                  <option key={t.id} value={t.name}>{t.name} ({t.specialty})</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Table Body with Geometric Borders & Urgent Pulse */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="p-3">{isAr ? 'رقم البلاغ' : 'WO ID'}</th>
                <th className="p-3">{isAr ? 'الموقع / الفرع' : 'Location'}</th>
                <th className="p-3">{isAr ? 'القسم' : 'Category'}</th>
                <th className="p-3">{isAr ? 'الخطورة' : 'Severity'}</th>
                <th className="p-3">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="p-3">{isAr ? 'الفني' : 'Technician'}</th>
                <th className="p-3">{isAr ? 'الموعد الأقصى' : 'Deadline'}</th>
                <th className="p-3">{isAr ? 'تشخيص Gemini' : 'AI Diagnosis'}</th>
                <th className="p-3 text-center">{isAr ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {paginatedWorkOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400 font-bold">
                    {isAr ? 'لا توجد بلاغات تطابق شروط البحث.' : 'No work orders match the filter criteria.'}
                  </td>
                </tr>
              ) : (
                paginatedWorkOrders.map(wo => {
                  const isUrgent = wo.severity === 'عاجل';
                  const isCompleted = wo.status === 'مُنجز' || wo.status === 'مُغلق';

                  return (
                    <tr 
                      key={wo.wo_id} 
                      onClick={() => openModal(wo)}
                      className={`hover:bg-slate-50 transition cursor-pointer ${
                        isUrgent ? (isAr ? 'urgent-pulse bg-rose-50/30' : 'urgent-pulse-ltr bg-rose-50/30') : ''
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-slate-900">{wo.wo_id}</td>
                      <td className="p-3 font-bold text-slate-900">{wo.location_name}</td>
                      <td className="p-3 text-slate-600">{wo.category}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold border ${
                          isUrgent ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {wo.severity}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold border ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : wo.status === 'قيد التنفيذ'
                            ? 'bg-teal-100 text-teal-800 border-teal-300'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}>
                          {wo.status}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-800">
                        {wo.assigned_tech || <span className="text-slate-400 italic">غير محدد</span>}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        <span className={isUrgent ? 'text-rose-700 font-bold' : 'text-slate-600'}>{wo.sla_deadline}</span>
                      </td>
                      <td className="p-3 text-slate-500 truncate max-w-[160px]" title={wo.gemini_summary}>
                        {wo.gemini_summary || 'قيد التحليل الآلي'}
                      </td>
                      <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => openModal(wo)}
                          className="px-2.5 py-1 text-[11px] font-bold border border-slate-300 hover:bg-slate-100 rounded-xs transition"
                        >
                          {isAr ? 'عرض 🔍' : 'Inspect'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer with Geometric Balance styling */}
        <div className="p-3 bg-slate-50 border-t border-slate-900 flex items-center justify-between text-xs text-slate-600">
          <span className="font-mono text-[11px]">
            {isAr 
              ? `عرض ${(page - 1) * itemsPerPage + 1} إلى ${Math.min(page * itemsPerPage, filteredWorkOrders.length)} من ${filteredWorkOrders.length} بلاغ`
              : `Showing ${(page - 1) * itemsPerPage + 1} - ${Math.min(page * itemsPerPage, filteredWorkOrders.length)} of ${filteredWorkOrders.length}`
            }
          </span>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="px-3 py-1 rounded-xs border-geometric bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 font-bold transition text-xs"
            >
              {isAr ? 'السابق' : 'Prev'}
            </button>
            <span className="px-2.5 py-1 font-mono font-bold text-slate-900 border border-slate-300 bg-white rounded-xs">
              {page} / {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages}
              className="px-3 py-1 rounded-xs border-geometric bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 font-bold transition text-xs"
            >
              {isAr ? 'التالي' : 'Next'}
            </button>
          </div>
        </div>

      </section>

      {/* 4. MODAL: WORK ORDER DETAIL & DISPATCH */}
      {activeModalWo && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-geometric rounded-xs shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 border-b-2 border-slate-900 flex items-center justify-between bg-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg text-slate-900 font-mono">{activeModalWo.wo_id}</h3>
                  <span className={`px-2 py-0.5 rounded-xs text-xs font-bold border ${
                    activeModalWo.severity === 'عاجل' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {activeModalWo.severity}
                  </span>
                  <span className="px-2 py-0.5 rounded-xs text-xs font-bold bg-white border border-slate-300 text-slate-800">
                    {activeModalWo.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-semibold">
                  {activeModalWo.location_name} | {activeModalWo.category}
                </p>
              </div>

              <button 
                onClick={closeModal}
                className="w-8 h-8 rounded-xs border-geometric bg-white hover:bg-slate-200 text-slate-900 flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed flex-1">
              
              {/* Meta Info */}
              <div className="bg-slate-50 p-3.5 rounded-xs border-geometric space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-slate-600 border-b border-slate-300 pb-2">
                  <div>المُبلّغ: <strong className="text-slate-900 font-bold">{activeModalWo.reporter}</strong></div>
                  <div>تاريخ البلاغ: <strong className="text-slate-900 font-mono">{activeModalWo.created_at}</strong></div>
                  <div>الموعد الأقصى (SLA): <strong className="text-rose-700 font-mono font-bold">{activeModalWo.sla_deadline}</strong></div>
                  <div>موقع GPS المُبلِّغ: <strong className="text-teal-800 font-mono font-bold">{activeModalWo.reporter_lat ? `${activeModalWo.reporter_lat}, ${activeModalWo.reporter_lng}` : 'مسجل'}</strong></div>
                </div>

                {/* Voice Note & Document Attachments Preview */}
                {(activeModalWo.voice_note_url || activeModalWo.video_url || activeModalWo.doc_url) && (
                  <div className="bg-teal-50/70 p-2.5 rounded-xs border border-teal-200 flex flex-wrap items-center gap-3">
                    {activeModalWo.voice_note_url && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-teal-900">🎙️ التسجيل الصوتي المرفق:</span>
                        <audio src={activeModalWo.voice_note_url} controls className="h-7 max-w-[200px]" />
                      </div>
                    )}
                    {activeModalWo.video_url && (
                      <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-xs border border-indigo-200">
                        🎥 يوجد فيديو توضيحي للعطل
                      </span>
                    )}
                    {activeModalWo.doc_url && (
                      <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-300">
                        📄 مستند / فحص فني مرفق
                      </span>
                    )}
                  </div>
                )}

                <div>
                  <span className="font-bold text-slate-900 block mb-1">وصف العطل المُبلّغ عنه:</span>
                  <p className="text-slate-800 bg-white p-3 rounded-xs border border-slate-300">
                    {activeModalWo.description}
                  </p>
                </div>
              </div>

              {/* Gemini AI Diagnosis Card */}
              <div className="bg-slate-900 text-white border-geometric rounded-xs p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-teal-400 text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>تشخيص وتحليل الذكاء الاصطناعي (Gemini 2.5 Flash REST API)</span>
                  </div>
                  <button 
                    onClick={handleRerunGemini}
                    disabled={isAiLoading}
                    className="text-[11px] accent-teal hover:opacity-90 text-white px-3 py-1 rounded-xs font-bold transition flex items-center gap-1 border border-teal-500"
                  >
                    <RefreshCw className={`w-3 h-3 ${isAiLoading ? 'animate-spin' : ''}`} />
                    <span>{isAiLoading ? 'جاري التحليل...' : 'إعادة التحليل الآلي ⚡'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-slate-100">
                    {activeModalWo.gemini_summary}
                  </p>
                  
                  {activeModalWo.gemini_json && (
                    <div className="bg-slate-800 p-3 rounded-xs border border-slate-700 space-y-2 text-slate-300">
                      <div>
                        <span className="font-bold text-teal-300 block mb-1">الإجراءات الفنية المقترحة:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-200">
                          {activeModalWo.gemini_json.suggestedActions?.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </div>
                      {activeModalWo.gemini_json.safetyRisk && (
                        <div className="pt-2 border-t border-slate-700 text-rose-300 font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>تحذير السلامة المهنية: {activeModalWo.gemini_json.safetyRisk}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Photos Comparison */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2 uppercase tracking-wide">توثيق الصور الميدانية (Google Drive Storage)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Before */}
                  <div className="border-geometric rounded-xs p-3 bg-slate-50 text-center">
                    <span className="font-bold text-slate-900 block mb-2 text-xs">صورة العطل (قبل الإصلاح)</span>
                    <div className="h-44 bg-slate-200 rounded-xs overflow-hidden flex items-center justify-center border border-slate-300">
                      {activeModalWo.before_photo ? (
                        <img src={activeModalWo.before_photo} alt="Before" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">NO PHOTO RECORDED</span>
                      )}
                    </div>
                  </div>

                  {/* After */}
                  <div className="border-geometric rounded-xs p-3 bg-slate-50 text-center">
                    <span className="font-bold text-teal-800 block mb-2 text-xs">صورة بعد الإصلاح (الفني الميداني)</span>
                    <div className="h-44 bg-slate-200 rounded-xs overflow-hidden flex items-center justify-center border border-slate-300">
                      {activeModalWo.after_photo ? (
                        <img src={activeModalWo.after_photo} alt="After" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">AWAITING VISIT COMPLETION</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment & Status Controls */}
              <div className="bg-slate-100 p-4 rounded-xs border-geometric flex flex-wrap items-center justify-between gap-4">
                
                {/* Assign Tech */}
                <div className="flex-1 min-w-[220px]">
                  <label className="block font-bold text-slate-900 mb-1">تعيين الفني المسؤول:</label>
                  <div className="flex gap-2">
                    <select 
                      value={assignedTechInput} 
                      onChange={e => setAssignedTechInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xs border-geometric bg-white outline-none text-xs font-medium"
                    >
                      <option value="">اختر الفني من القائمة...</option>
                      {technicians.map(t => (
                        <option key={t.id} value={`${t.name} (${t.specialty})`}>
                          {t.name} - {t.specialty}
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={handleAssignTech}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xs transition text-xs border-geometric"
                    >
                      تأكيد التعيين
                    </button>
                  </div>
                </div>

                {/* Status Quick Buttons */}
                <div>
                  <label className="block font-bold text-slate-900 mb-1">تحديث حالة أمر الشغل:</label>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleUpdateStatus('قيد التنفيذ')}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xs transition text-xs border border-slate-900"
                    >
                      بدء التنفيذ
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus('مُنجز')}
                      className="px-3 py-2 accent-teal hover:opacity-90 text-white font-bold rounded-xs transition text-xs border border-slate-900"
                    >
                      إنجاز ✅
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus('مُغلق')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xs transition text-xs border border-slate-900"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
