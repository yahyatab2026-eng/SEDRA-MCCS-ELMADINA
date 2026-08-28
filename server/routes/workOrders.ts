import { Router, Request, Response } from 'express';
import { cmmsStore } from '../store';

const router = Router();

// GET /api/work-orders - List work orders with optional filtering & pagination
router.get('/', (req: Request, res: Response) => {
  try {
    const { status, severity, category, location, search, page, limit } = req.query;
    const result = cmmsStore.getWorkOrders({
      status: status ? String(status) : undefined,
      severity: severity ? String(severity) : undefined,
      category: category ? String(category) : undefined,
      location: location ? String(location) : undefined,
      search: search ? String(search) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 200
    });

    res.json({
      success: true,
      count: result.data.length,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      data: result.data
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch work orders' });
  }
});

// GET /api/work-orders/visits/:woId - Get field visits for a work order
router.get('/visits/:woId', (req: Request, res: Response) => {
  try {
    const visits = cmmsStore.getVisitsByWorkOrder(req.params.woId);
    res.json({ success: true, count: visits.length, data: visits });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/work-orders/visits - Register new field visit
router.post('/visits', (req: Request, res: Response) => {
  try {
    const visit = cmmsStore.addVisit(req.body);
    res.status(201).json({ success: true, message: 'Visit registered successfully', data: visit });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/work-orders/inventory/deduct - Deduct spare part
router.post('/inventory/deduct', (req: Request, res: Response) => {
  try {
    const { itemId, quantity } = req.body;
    if (!itemId || !quantity) {
      return res.status(400).json({ success: false, error: 'itemId and quantity are required' });
    }
    const ok = cmmsStore.deductInventory(itemId, Number(quantity));
    if (!ok) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true, message: 'Inventory deducted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/work-orders/:id - Get single work order
router.get('/:id', (req: Request, res: Response) => {
  try {
    const item = cmmsStore.getWorkOrderById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Work order not found' });
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/work-orders - Create new work order
router.post('/', (req: Request, res: Response) => {
  try {
    const body = req.body;
    const created = cmmsStore.createWorkOrder(body);
    res.status(201).json({ success: true, message: 'Work order created successfully', data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH & PUT /api/work-orders/:id - Update work order
const updateHandler = (req: Request, res: Response) => {
  try {
    const updated = cmmsStore.updateWorkOrder(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Work order not found' });
    }
    res.json({ success: true, message: 'Work order updated', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
router.patch('/:id', updateHandler);
router.put('/:id', updateHandler);

// POST /api/work-orders/:id/status - Update work order status
router.post('/:id/status', (req: Request, res: Response) => {
  try {
    const { status, close_notes, cost_parts, cost_labor } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }
    const isClosed = status === 'مُنجز' || status === 'مُغلق';
    const updated = cmmsStore.updateWorkOrder(req.params.id, {
      status,
      action_taken: close_notes || undefined,
      closed_at: isClosed ? new Date().toISOString().replace('T', ' ').slice(0, 19) : undefined,
      cost_parts: cost_parts !== undefined ? Number(cost_parts) : undefined,
      cost_labor: cost_labor !== undefined ? Number(cost_labor) : undefined
    });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Work order not found' });
    }
    res.json({ success: true, message: `Status changed to ${status}`, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/work-orders/:id/assign - Assign technician
router.post('/:id/assign', (req: Request, res: Response) => {
  try {
    const { tech_name } = req.body;
    if (!tech_name) {
      return res.status(400).json({ success: false, error: 'Technician name is required' });
    }
    const updated = cmmsStore.updateWorkOrder(req.params.id, {
      assigned_tech: tech_name,
      assigned_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'قيد التنفيذ'
    });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Work order not found' });
    }
    res.json({ success: true, message: `Assigned to ${tech_name}`, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/work-orders/:id - Delete work order
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const ok = cmmsStore.deleteWorkOrder(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, error: 'Work order not found' });
    }
    res.json({ success: true, message: 'Work order deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
