import { Router, Request, Response } from 'express';
import { cmmsStore } from '../store';

const router = Router();

// ==========================================
// Locations
// ==========================================
router.get('/locations', (req: Request, res: Response) => {
  res.json({ success: true, count: cmmsStore.locations.length, data: cmmsStore.locations });
});

router.post('/locations', (req: Request, res: Response) => {
  try {
    const newLoc = req.body;
    if (!newLoc.id) newLoc.id = `LOC-${String(cmmsStore.locations.length + 1).padStart(2, '0')}`;
    cmmsStore.locations.push(newLoc);
    res.status(201).json({ success: true, data: newLoc });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/locations', (req: Request, res: Response) => {
  try {
    if (Array.isArray(req.body)) {
      cmmsStore.locations = req.body;
      res.json({ success: true, message: 'Locations updated', data: cmmsStore.locations });
    } else {
      res.status(400).json({ success: false, error: 'Expected array of locations' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Technicians
// ==========================================
router.get('/technicians', (req: Request, res: Response) => {
  res.json({ success: true, count: cmmsStore.technicians.length, data: cmmsStore.technicians });
});

router.post('/technicians', (req: Request, res: Response) => {
  try {
    const newTech = req.body;
    if (!newTech.id) newTech.id = `TECH-${String(cmmsStore.technicians.length + 1).padStart(2, '0')}`;
    cmmsStore.technicians.push(newTech);
    res.status(201).json({ success: true, data: newTech });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/technicians', (req: Request, res: Response) => {
  try {
    if (Array.isArray(req.body)) {
      cmmsStore.technicians = req.body;
      res.json({ success: true, message: 'Technicians updated', data: cmmsStore.technicians });
    } else {
      res.status(400).json({ success: false, error: 'Expected array of technicians' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Assets
// ==========================================
router.get('/assets', (req: Request, res: Response) => {
  res.json({ success: true, count: cmmsStore.assets.length, data: cmmsStore.assets });
});

router.post('/assets', (req: Request, res: Response) => {
  try {
    const newAsset = req.body;
    if (!newAsset.id) newAsset.id = `AST-${String(cmmsStore.assets.length + 1).padStart(2, '0')}`;
    cmmsStore.assets.push(newAsset);
    res.status(201).json({ success: true, data: newAsset });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/assets', (req: Request, res: Response) => {
  try {
    if (Array.isArray(req.body)) {
      cmmsStore.assets = req.body;
      res.json({ success: true, message: 'Assets updated', data: cmmsStore.assets });
    } else {
      res.status(400).json({ success: false, error: 'Expected array of assets' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Suppliers
// ==========================================
router.get('/suppliers', (req: Request, res: Response) => {
  res.json({ success: true, count: cmmsStore.suppliers.length, data: cmmsStore.suppliers });
});

router.put('/suppliers', (req: Request, res: Response) => {
  try {
    if (Array.isArray(req.body)) {
      cmmsStore.suppliers = req.body;
      res.json({ success: true, message: 'Suppliers updated', data: cmmsStore.suppliers });
    } else {
      res.status(400).json({ success: false, error: 'Expected array of suppliers' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Inventory
// ==========================================
router.get('/inventory', (req: Request, res: Response) => {
  res.json({ success: true, count: cmmsStore.inventory.length, data: cmmsStore.inventory });
});

router.put('/inventory', (req: Request, res: Response) => {
  try {
    if (Array.isArray(req.body)) {
      cmmsStore.inventory = req.body;
      res.json({ success: true, message: 'Inventory updated', data: cmmsStore.inventory });
    } else {
      res.status(400).json({ success: false, error: 'Expected array of inventory' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Custodies (العهد المالية والفنية)
// ==========================================
router.get('/custodies', (req: Request, res: Response) => {
  res.json({ success: true, count: cmmsStore.custodies.length, data: cmmsStore.custodies });
});

router.post('/custodies', (req: Request, res: Response) => {
  try {
    const newCustody = req.body;
    if (!newCustody.id) newCustody.id = `CUST-${String(cmmsStore.custodies.length + 1).padStart(3, '0')}`;
    cmmsStore.custodies.unshift(newCustody);
    res.status(201).json({ success: true, data: newCustody });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/custodies', (req: Request, res: Response) => {
  try {
    if (Array.isArray(req.body)) {
      cmmsStore.custodies = req.body;
      res.json({ success: true, message: 'Custodies updated', data: cmmsStore.custodies });
    } else {
      res.status(400).json({ success: false, error: 'Expected array of custodies' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Branch Audits (ملاحظات وأعطال الفروع)
// ==========================================
router.get('/branch-audits', (req: Request, res: Response) => {
  res.json({ success: true, count: cmmsStore.branchAudits.length, data: cmmsStore.branchAudits });
});

router.post('/branch-audits', (req: Request, res: Response) => {
  try {
    const newAudit = req.body;
    if (!newAudit.id) newAudit.id = `AUDIT-${String(cmmsStore.branchAudits.length + 1).padStart(3, '0')}`;
    cmmsStore.branchAudits.unshift(newAudit);
    res.status(201).json({ success: true, data: newAudit });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/branch-audits', (req: Request, res: Response) => {
  try {
    if (Array.isArray(req.body)) {
      cmmsStore.branchAudits = req.body;
      res.json({ success: true, message: 'Branch audits updated', data: cmmsStore.branchAudits });
    } else {
      res.status(400).json({ success: false, error: 'Expected array of audits' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Governance & Decisions
// ==========================================
router.get('/governance', (req: Request, res: Response) => {
  res.json({ success: true, count: cmmsStore.governance.length, data: cmmsStore.governance });
});

router.put('/governance', (req: Request, res: Response) => {
  try {
    if (Array.isArray(req.body)) {
      cmmsStore.governance = req.body;
      res.json({ success: true, message: 'Governance updated', data: cmmsStore.governance });
    } else {
      res.status(400).json({ success: false, error: 'Expected array of governance' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/decisions', (req: Request, res: Response) => {
  res.json({ success: true, count: cmmsStore.decisions.length, data: cmmsStore.decisions });
});

router.put('/decisions', (req: Request, res: Response) => {
  try {
    if (Array.isArray(req.body)) {
      cmmsStore.decisions = req.body;
      res.json({ success: true, message: 'Decisions updated', data: cmmsStore.decisions });
    } else {
      res.status(400).json({ success: false, error: 'Expected array of decisions' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
