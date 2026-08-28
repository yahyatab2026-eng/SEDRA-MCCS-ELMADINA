import { Router, Request, Response } from 'express';
import { cmmsStore } from '../store';

const router = Router();

// GET /api/analytics - Get full CMMS Dashboard analytics and KPIs
router.get('/', (req: Request, res: Response) => {
  try {
    const stats = cmmsStore.computeAnalytics();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/analytics/ai-logs - Get Gemini AI diagnosis and action logs
router.get('/ai-logs', (req: Request, res: Response) => {
  try {
    res.json({ success: true, count: cmmsStore.aiLogs.length, data: cmmsStore.aiLogs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
