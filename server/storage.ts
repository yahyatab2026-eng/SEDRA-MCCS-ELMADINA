/**
 * CMMS SIDRAH - Persistent File-Based Storage Engine
 * Keeps CMMS state persisted in server/data/cmms_db.json
 */

import fs from 'fs';
import path from 'path';
import {
  WorkOrder,
  LocationItem,
  TechnicianItem,
  AssetRecord,
  SupplierItem,
  RiskRecord,
  InventoryItem,
  AdminDecision,
  CustodyRecord,
  BranchAuditRecord,
  GovernanceRecord,
  VisitRecord
} from '../src/types';

export interface CmmsDbSchema {
  workOrders: WorkOrder[];
  visits: VisitRecord[];
  locations: LocationItem[];
  technicians: TechnicianItem[];
  assets: AssetRecord[];
  suppliers: SupplierItem[];
  risks: RiskRecord[];
  inventory: InventoryItem[];
  adminDecisions: AdminDecision[];
  custodyRecords: CustodyRecord[];
  branchAudits: BranchAuditRecord[];
  governanceRecords: GovernanceRecord[];
  settings: Record<string, string>;
  lastUpdated: string;
}

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'cmms_db.json');

export class DiskStorage {
  private isWriting = false;

  constructor() {
    this.ensureDirectory();
  }

  private ensureDirectory() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (e) {
      console.error('Failed to create server data directory', e);
    }
  }

  public readDb(): CmmsDbSchema | null {
    try {
      if (!fs.existsSync(DB_FILE)) {
        return null;
      }
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read cmms_db.json, will use default seeding', e);
      return null;
    }
  }

  public saveDb(data: CmmsDbSchema): void {
    if (this.isWriting) return;
    this.isWriting = true;

    try {
      this.ensureDirectory();
      const payload = JSON.stringify(
        {
          ...data,
          lastUpdated: new Date().toISOString()
        },
        null,
        2
      );
      fs.writeFileSync(DB_FILE, payload, 'utf-8');
    } catch (e) {
      console.error('Failed to write cmms_db.json to disk', e);
    } finally {
      this.isWriting = false;
    }
  }
}

export const diskStorage = new DiskStorage();
