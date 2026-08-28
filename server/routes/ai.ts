import { Router, Request, Response } from 'express';
import { runGeminiDiagnosis, runGeminiTranscribe, runGeminiKpiAdvisor, getGeminiClient } from '../gemini';
import { cmmsStore } from '../store';

const router = Router();

// POST /api/ai/diagnose - Run technical CMMS diagnosis on maintenance incident
router.post('/diagnose', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { category, description, locationName, assetName, severity, photoBase64 } = req.body;

    if (!description && !category) {
      return res.status(400).json({ success: false, error: 'Category and description are required' });
    }

    const diagnosis = await runGeminiDiagnosis({
      category: category || 'صيانة عامة',
      description: description || '',
      locationName: locationName || 'الفرع الرئيسي',
      assetName,
      severity: severity || 'عاجل',
      photoBase64
    });

    const elapsed = Date.now() - startTime;

    // Record AI Log
    cmmsStore.aiLogs.unshift({
      id: `ai-log-${Date.now()}`,
      ts: new Date().toISOString().replace('T', ' ').slice(0, 19),
      wo_id: req.body.wo_id || 'PENDING',
      action: 'diagnose',
      model: diagnosis.modelUsed || 'gemini-3.7-flash',
      ok: true,
      ms: elapsed,
      note: `تشخيص ${category}: ${diagnosis.rootCause.slice(0, 50)}...`
    });

    res.json({
      success: true,
      data: diagnosis,
      executionMs: elapsed
    });
  } catch (error: any) {
    console.error('AI diagnose error:', error);
    res.status(500).json({ success: false, error: error.message || 'AI diagnosis failed' });
  }
});

// POST /api/ai/transcribe - Transcribe voice note & extract technical symptoms
router.post('/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ success: false, error: 'audioBase64 is required' });
    }

    const result = await runGeminiTranscribe(audioBase64, mimeType);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/ai/kpi-advisor - Executive analysis for management
router.post('/kpi-advisor', async (req: Request, res: Response) => {
  try {
    const stats = req.body.stats || cmmsStore.computeAnalytics();
    const advice = await runGeminiKpiAdvisor(stats);
    res.json({ success: true, data: advice });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/ai/chat - Interactive AI technical assistant for engineers and technicians
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        reply: `مرحباً بك في المساعد الفني لشركة سيدره! بخصوص "${message}": نوصي بالتحقق من مصدر التغذية الكهربائية، مراجعة ضغوط الفريون، والتأكد من نظافة الفلاتر أو السيور. يمكنك مراجعة كتالوج الماكينة في قاعدة الأصول.`
      });
    }

    const chat = ai.chats.create({
      model: 'gemini-3.7-flash',
      config: {
        systemInstruction: 'أنت مهندس الصيانة والتشغيل الخبير لمجموعة مصانع وفروع شركة سيدره (حلويات شرقية وغربية، ألبان، بسترة، تبريد وتجميد، أفران ومطابخ). أجب بإيجاز، خطوات واضحة، ونصائح سلامة دقيقة باللغة العربية.'
      }
    });

    const response = await chat.sendMessage({ message });
    res.json({ success: true, reply: response.text || 'لا توجد استجابة من المساعد' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
