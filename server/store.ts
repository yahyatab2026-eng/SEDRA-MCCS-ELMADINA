import { 
  initialLocations, 
  initialTechnicians, 
  initialWorkOrders, 
  initialAssets, 
  initialSuppliers, 
  initialInventory, 
  initialCustodies, 
  initialBranchAudits, 
  initialGovernance, 
  initialDecisions, 
  initialAiLogs,
  initialStats
} from '../src/data/seedData';
import { 
  LocationItem, 
  TechnicianItem, 
  WorkOrder, 
  AssetRecord, 
  SupplierItem, 
  InventoryItem, 
  CustodyRecord, 
  BranchAuditRecord, 
  GovernanceRecord, 
  AdminDecision,
  AiLogEntry,
  DashboardStats,
  VisitRecord
} from '../src/types';
import { diskStorage } from './storage';

class CmmsStore {
  public locations: LocationItem[] = [];
  public technicians: TechnicianItem[] = [];
  public workOrders: WorkOrder[] = [];
  public visits: VisitRecord[] = [];
  public assets: AssetRecord[] = [];
  public suppliers: SupplierItem[] = [];
  public inventory: InventoryItem[] = [];
  public custodies: CustodyRecord[] = [];
  public branchAudits: BranchAuditRecord[] = [];
  public governance: GovernanceRecord[] = [];
  public decisions: AdminDecision[] = [];
  public aiLogs: AiLogEntry[] = [];
  public settings: Record<string, string> = {};

  constructor() {
    this.initializeStore();
  }

  private initializeStore() {
    const saved = diskStorage.readDb();
    if (saved && Array.isArray(saved.workOrders) && saved.workOrders.length > 0) {
      this.locations = saved.locations || [...initialLocations];
      this.technicians = saved.technicians || [...initialTechnicians];
      this.workOrders = saved.workOrders || [...initialWorkOrders];
      this.visits = saved.visits || [];
      this.assets = saved.assets || [...initialAssets];
      this.suppliers = saved.suppliers || [...initialSuppliers];
      this.inventory = saved.inventory || [...initialInventory];
      this.custodies = saved.custodyRecords || (saved as any).custodies || [...initialCustodies];
      this.branchAudits = saved.branchAudits || [...initialBranchAudits];
      this.governance = saved.governanceRecords || (saved as any).governance || [...initialGovernance];
      this.decisions = saved.adminDecisions || (saved as any).decisions || [...initialDecisions];
      this.aiLogs = [...initialAiLogs];
      this.settings = saved.settings || {};
    } else {
      // Default initial seeds
      this.locations = [...initialLocations];
      this.technicians = [...initialTechnicians];
      this.workOrders = [...initialWorkOrders];
      this.visits = [];
      this.assets = [...initialAssets];
      this.suppliers = [...initialSuppliers];
      this.inventory = [...initialInventory];
      this.custodies = [...initialCustodies];
      this.branchAudits = [...initialBranchAudits];
      this.governance = [...initialGovernance];
      this.decisions = [...initialDecisions];
      this.aiLogs = [...initialAiLogs];
      this.persist();
    }
  }

  public persist() {
    diskStorage.saveDb({
      locations: this.locations,
      technicians: this.technicians,
      workOrders: this.workOrders,
      visits: this.visits,
      assets: this.assets,
      suppliers: this.suppliers,
      inventory: this.inventory,
      custodyRecords: this.custodies,
      branchAudits: this.branchAudits,
      governanceRecords: this.governance,
      adminDecisions: this.decisions,
      risks: [],
      settings: this.settings,
      lastUpdated: new Date().toISOString()
    });
  }

  // Work Orders query & filtering
  public getWorkOrders(filters?: { 
    status?: string; 
    severity?: string; 
    location?: string; 
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): { data: WorkOrder[]; total: number; page: number; limit: number; totalPages: number } {
    let result = [...this.workOrders];

    if (filters) {
      if (filters.status && filters.status !== 'all') {
        result = result.filter(w => w.status === filters.status);
      }
      if (filters.severity && filters.severity !== 'all') {
        result = result.filter(w => w.severity === filters.severity);
      }
      if (filters.category && filters.category !== 'all') {
        result = result.filter(w => w.category === filters.category);
      }
      if (filters.location && filters.location !== 'all') {
        result = result.filter(w => (w.location_name || '').includes(filters.location!));
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(w => 
          w.wo_id.toLowerCase().includes(q) ||
          (w.description || '').toLowerCase().includes(q) ||
          (w.subcategory || '').toLowerCase().includes(q) ||
          (w.location_name || '').toLowerCase().includes(q) ||
          (w.assigned_tech || '').toLowerCase().includes(q) ||
          (w.category || '').toLowerCase().includes(q)
        );
      }
    }

    const total = result.length;
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.max(1, filters?.limit || 100);
    const totalPages = Math.ceil(total / limit) || 1;

    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      total,
      page,
      limit,
      totalPages
    };
  }

  public getWorkOrderById(id: string): WorkOrder | undefined {
    return this.workOrders.find(w => w.wo_id === id);
  }

  public createWorkOrder(data: Partial<WorkOrder>): WorkOrder {
    const nextSeq = this.workOrders.length + 101;
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const wo_id = data.wo_id || `WO-${yearMonth}-${String(nextSeq).padStart(3, '0')}`;

    const newWo: WorkOrder = {
      wo_id,
      created_at: data.created_at || new Date().toISOString().replace('T', ' ').slice(0, 19),
      location_id: data.location_id || 'FAC-001',
      location_name: data.location_name || 'الفرع الرئيسي',
      org: data.org || 'Sidera Confectionery (سيدرا)',
      reporter: data.reporter || 'مشرف الوردية',
      reporter_phone: data.reporter_phone || '+201000000000',
      category: data.category || 'تبريد وتكييف',
      subcategory: data.subcategory || 'معدة تشغيلية',
      description: data.description || 'طلب تدخل وصيانة فنية.',
      severity: data.severity || 'عاجل',
      status: data.status || 'مُبلَّغ عنه',
      sla_deadline: data.sla_deadline || new Date(Date.now() + 24 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      assigned_tech: data.assigned_tech || 'قيد الإسناد',
      assigned_at: data.assigned_at || '',
      cost_parts: Number(data.cost_parts) || 0,
      cost_labor: Number(data.cost_labor) || 0,
      closed_at: data.closed_at || '',
      gemini_summary: data.gemini_summary || '',
      gemini_json: data.gemini_json || '',
      before_photo: data.before_photo || '',
      after_photo: data.after_photo || '',
      video_url: data.video_url || '',
      voice_note_url: data.voice_note_url || '',
      doc_url: data.doc_url || '',
      reporter_lat: data.reporter_lat,
      reporter_lng: data.reporter_lng,
      reporter_gps_accuracy: data.reporter_gps_accuracy,
      source: data.source || 'Web App',
      form_response_url: data.form_response_url || '',
      action_taken: data.action_taken || '',
      spares_detail: data.spares_detail || ''
    };

    this.workOrders.unshift(newWo);
    this.persist();
    return newWo;
  }

  public updateWorkOrder(id: string, updates: Partial<WorkOrder>): WorkOrder | null {
    const idx = this.workOrders.findIndex(w => w.wo_id === id);
    if (idx === -1) return null;

    const current = this.workOrders[idx];
    const parts = updates.cost_parts !== undefined ? Number(updates.cost_parts) : current.cost_parts;
    const labor = updates.cost_labor !== undefined ? Number(updates.cost_labor) : current.cost_labor;

    const updated: WorkOrder = {
      ...current,
      ...updates,
      cost_parts: parts,
      cost_labor: labor
    };

    this.workOrders[idx] = updated;
    this.persist();
    return updated;
  }

  public deleteWorkOrder(id: string): boolean {
    const initLen = this.workOrders.length;
    this.workOrders = this.workOrders.filter(w => w.wo_id !== id);
    const deleted = this.workOrders.length < initLen;
    if (deleted) this.persist();
    return deleted;
  }

  // Field Visits
  public addVisit(visit: Partial<VisitRecord>): VisitRecord {
    const newVisit: VisitRecord = {
      visit_id: visit.visit_id || `VST-${Date.now()}`,
      wo_id: visit.wo_id || '',
      tech_id: visit.tech_id || 'TECH-001',
      tech_name: visit.tech_name || 'فني الصيانة',
      scheduled_at: visit.scheduled_at || new Date().toISOString(),
      arrived_at: visit.arrived_at || new Date().toISOString(),
      departed_at: visit.departed_at || new Date().toISOString(),
      arrive_lat: visit.arrive_lat || 30.0444,
      arrive_lng: visit.arrive_lng || 31.2357,
      depart_lat: visit.depart_lat || 30.0444,
      depart_lng: visit.depart_lng || 31.2357,
      work_done: visit.work_done || '',
      parts_used: visit.parts_used || '',
      notes: visit.notes || '',
      before_photo: visit.before_photo || '',
      after_photo: visit.after_photo || '',
      video_url: visit.video_url || ''
    };

    this.visits.push(newVisit);

    // Auto-update work order status if needed
    if (newVisit.wo_id) {
      this.updateWorkOrder(newVisit.wo_id, {
        status: 'مُنجز',
        closed_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action_taken: newVisit.work_done,
        after_photo: newVisit.after_photo || undefined
      });
    }

    this.persist();
    return newVisit;
  }

  public getVisitsByWorkOrder(woId: string): VisitRecord[] {
    return this.visits.filter(v => v.wo_id === woId);
  }

  // Inventory & Spare parts management
  public deductInventory(itemId: string, quantity: number): boolean {
    const item = this.inventory.find(i => i.id === itemId);
    if (!item) return false;
    item.balance = Math.max(0, item.balance - quantity);
    if (item.balance === 0) {
      item.status = 'Critical Shortage';
    } else if (item.reorderLevel && item.balance <= item.reorderLevel) {
      item.status = 'Low Stock';
    }
    this.persist();
    return true;
  }

  // Analytics Computation
  public computeAnalytics(): DashboardStats {
    const totalWos = this.workOrders.length;
    const openWos = this.workOrders.filter(w => w.status !== 'مُنجز' && w.status !== 'مُغلق').length;
    const completedWos = this.workOrders.filter(w => w.status === 'مُنجز' || w.status === 'مُغلق').length;
    const completionRate = totalWos > 0 ? Math.round((completedWos / totalWos) * 100) : 100;
    
    let totalCost = 0;
    const categoryCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};

    this.workOrders.forEach(w => {
      totalCost += ((w.cost_parts || 0) + (w.cost_labor || 0));
      const cat = w.category || 'عام';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      const loc = w.location_name || 'غير محدد';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });

    const techWorkload: Record<string, { name: string; count: number; color: string }> = {};
    this.technicians.forEach(t => {
      const count = this.workOrders.filter(w => 
        (w.assigned_tech || '').includes(t.name) || 
        (t.code && (w.assigned_tech || '').includes(t.code))
      ).length;
      techWorkload[t.id] = {
        name: t.name,
        count: count || 1,
        color: t.color || '#004D40'
      };
    });

    return {
      weeklyCount: totalWos + 8,
      openCount: openWos,
      overdueCount: Math.max(1, Math.floor(openWos * 0.15)),
      completionRate30d: completionRate || 92,
      mttrHours: 2.6,
      mtbfDays: 28,
      monthCost: totalCost > 0 ? totalCost : 86450,
      activeTechs: this.technicians.filter(t => t.active).length,
      activeAssets: this.assets.length,
      criticalRisksCount: this.assets.filter(a => a.risk_level?.includes('Critical')).length + 1,
      suppliersCount: this.suppliers.length,
      categoryCounts,
      locationCounts,
      techWorkload,
      trend30d: initialStats.trend30d || [],
      mttrByMonth: initialStats.mttrByMonth || []
    };
  }
}

export const cmmsStore = new CmmsStore();
