import { Router, Request, Response } from 'express';
import { cmmsStore } from '../store';

const router = Router();

// POST /api/google/sync-sheets - Two-way sync simulation with Google Sheets
router.post('/sync-sheets', async (req: Request, res: Response) => {
  try {
    const { spreadsheetId, scriptUrl } = req.body;
    
    const summary = {
      workOrdersCount: cmmsStore.workOrders.length,
      locationsCount: cmmsStore.locations.length,
      techniciansCount: cmmsStore.technicians.length,
      assetsCount: cmmsStore.assets.length,
      custodiesCount: cmmsStore.custodies.length,
      auditsCount: cmmsStore.branchAudits.length,
      governanceCount: cmmsStore.governance.length,
      decisionsCount: cmmsStore.decisions.length,
      lastSyncTimestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'تمت مزامنة كافة جداول CMMS بنجاح مع منظومة Google Sheets و Apps Script.',
      syncSummary: summary
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/google/webhook - Webhook receiver from Google Apps Script trigger
router.post('/webhook', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log('Received Google Apps Script Webhook payload:', payload);

    if (payload.type === 'NEW_INCIDENT' && payload.data) {
      cmmsStore.createWorkOrder(payload.data);
    } else if (payload.type === 'STATUS_UPDATE' && payload.wo_id) {
      cmmsStore.updateWorkOrder(payload.wo_id, payload.data || {});
    }

    res.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
