/**
 * ============================================================================
 * CMMS SIDRAH - GEMINI AI INTEGRATION LAYER (Gemini.gs)
 * Company: شركة سيدره للصناعات الغذائية والحلويات
 * 
 * Interacts with Google Gemini REST API (Gemini 2.5 Flash / Gemini 3 Flash):
 * - Direct REST API integration via UrlFetchApp with JSON payload & inline data
 * - Exponential backoff retry mechanism (handles 429 Too Many Requests and 5xx)
 * - Complete AI_Log persistence into Google Sheets (latency, status, model, notes)
 * - Technical diagnosis, before/after quality comparison, and executive digests
 * ============================================================================
 */

const Gemini = (function() {
  
  /**
   * Returns active model name from Settings / ScriptProperties with default fallback
   * @return {string}
   */
  function getActiveModel() {
    if (typeof getAppSetting === 'function') {
      const setting = getAppSetting('DEFAULT_MODEL');
      if (setting && setting.trim()) return setting.trim();
    }
    return (typeof CONFIG !== 'undefined' && CONFIG.DEFAULTS && CONFIG.DEFAULTS.DEFAULT_MODEL) 
      ? CONFIG.DEFAULTS.DEFAULT_MODEL 
      : 'gemini-2.5-flash';
  }

  /**
   * Executes a generateContent request against the Gemini REST API with exponential backoff
   * @param {Array} parts Array of content parts (text and/or inline_data)
   * @param {string} systemInstruction Optional system prompt
   * @param {string} responseMimeType Default "application/json"
   * @param {string} modelOverride Optional model name override
   * @return {{text: string, durationMs: number, model: string, usage: Object}}
   */
  function callGeminiAPI(parts, systemInstruction = '', responseMimeType = 'application/json', modelOverride = '') {
    const apiKey = (typeof getGeminiApiKey === 'function') ? getGeminiApiKey() : '';
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('GEMINI_API_KEY is not configured in ScriptProperties or Settings sheet.');
    }

    const model = modelOverride || getActiveModel();
    const baseUrl = (typeof CONFIG !== 'undefined' && CONFIG.GEMINI_BASE_URL) 
      ? CONFIG.GEMINI_BASE_URL 
      : 'https://generativelanguage.googleapis.com/v1beta/models/';
    
    const url = `${baseUrl}${model}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: parts
        }
      ],
      generationConfig: {
        response_mime_type: responseMimeType,
        temperature: 0.2
      }
    };

    if (systemInstruction) {
      payload.system_instruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    // Exponential backoff retry loop (handles HTTP 429 rate-limiting and 5xx transient server errors)
    const maxRetries = 3;
    let delayMs = 1000;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const startTime = new Date().getTime();
      let response = null;

      try {
        response = UrlFetchApp.fetch(url, options);
      } catch (networkErr) {
        lastError = networkErr;
        Logger.log(`Network error communicating with Gemini on attempt ${attempt}/${maxRetries}: ${networkErr.message}`);
        if (attempt < maxRetries) {
          Utilities.sleep(delayMs);
          delayMs *= 2;
          continue;
        }
        throw new Error(`Network failure calling Gemini API: ${networkErr.message}`);
      }

      const code = response.getResponseCode();
      const durationMs = new Date().getTime() - startTime;
      const responseText = response.getContentText();

      // Successful HTTP response
      if (code >= 200 && code < 300) {
        try {
          const json = JSON.parse(responseText);
          const candidate = json.candidates?.[0];
          const text = candidate?.content?.parts?.[0]?.text || '';
          const usage = json.usageMetadata || {};
          return {
            text: text,
            durationMs: durationMs,
            model: model,
            usage: usage
          };
        } catch (jsonParseErr) {
          throw new Error(`Failed to parse Gemini API JSON response: ${jsonParseErr.message}`);
        }
      }

      // Handle Rate Limit (429) or Temporary Google Server Error (500, 503, 504)
      if ((code === 429 || code >= 500) && attempt < maxRetries) {
        const jitter = Math.floor(Math.random() * 300);
        const sleepTime = delayMs + jitter;
        Logger.log(`Gemini API returned HTTP ${code}. Retrying in ${sleepTime}ms (Attempt ${attempt}/${maxRetries})... Response: ${responseText.substring(0, 150)}`);
        Utilities.sleep(sleepTime);
        delayMs *= 2;
        continue;
      }

      // Non-retryable error (e.g. 400 Bad Request, 403 Forbidden / Invalid API Key)
      lastError = new Error(`Gemini API Error (HTTP ${code}): ${responseText}`);
      break;
    }

    throw (lastError || new Error('Gemini API call failed after retries.'));
  }

  /**
   * (1) DIAGNOSE WORK ORDER:
   * Analyzes fault description and optional image. Classifies asset, root cause, safety measures, and parts.
   * Logs execution status into AI_Log sheet.
   * 
   * @param {string} description Fault description in Arabic
   * @param {string} beforePhotoUrlOrBase64 Image URL in Drive or raw Base64 string
   * @param {string} woId Work Order ID
   * @return {{success: boolean, data: Object, summary: string}}
   */
  function diagnose(description, beforePhotoUrlOrBase64, woId = 'WO-NEW') {
    const startTime = new Date().getTime();
    const model = getActiveModel();

    try {
      const parts = [];

      // Multimodal image processing
      if (beforePhotoUrlOrBase64) {
        let imgData = null;
        if (beforePhotoUrlOrBase64.startsWith('data:') || beforePhotoUrlOrBase64.length > 500) {
          // Direct base64 string
          let mime = 'image/jpeg';
          let raw = beforePhotoUrlOrBase64;
          if (beforePhotoUrlOrBase64.includes(';base64,')) {
            mime = beforePhotoUrlOrBase64.split(';base64,')[0].replace('data:', '');
            raw = beforePhotoUrlOrBase64.split(';base64,')[1];
          }
          imgData = { base64: raw, mimeType: mime };
        } else if (typeof DriveStore !== 'undefined') {
          // Google Drive link or ID
          imgData = DriveStore.getFileAsBase64(beforePhotoUrlOrBase64);
        }

        if (imgData && imgData.base64) {
          parts.push({
            inline_data: {
              mime_type: imgData.mimeType,
              data: imgData.base64
            }
          });
        }
      }

      const promptText = `
أنت مهندس صيانة صناعية وتجارية أول لشركة "سيدره" (شبكة مصانع ألبان وحلويات شرقية وغربية، أفران، ثلاجات مركزية، ومنافذ بيع).
قم بتحليل البلاغ الفني والصورة المرفقة لتشخيص العطل الهندسي بدقة.

وصف المشكلة المبلغ عنها:
"${description || 'فحص عطل فني في المعدة'}"

المطلوب إخراج النتيجة بتنسيق JSON نظيف وصارم بالمفاتيح التالية:
{
  "category": "التصنيف الرئيسي (تبريد وتكييف | حلواني ومخابز | خطوط ألبان وبسترة | كهرباء وقوى | سباكة ومضخات | معدات مطابخ)",
  "subcategory": "نوع المعدة بالتحديد (مثل: غرفة تبريد مركزية، مجنس ألبان، فرن دوار، عجانة حلواني، كباس فريون)",
  "severity": "درجة الخطورة: اختر بدقة واحدة من ('عاجل' أو 'متوسط' أو 'منخفض')",
  "rootCause": "السبب الجذري المتوقع للعطل باللغة العربية الفنية الدقيقة",
  "safetyMeasures": "إجراءات السلامة الفورية الواجب اتخاذها فوراً بالموقع (فصل التيار، إغلاق المحابس، تأمين التشغيل)",
  "suggestedActions": ["خطوة الفحص 1", "خطوة الإصلاح 2", "خطوة الاختبار والتشغيل 3"],
  "recommendedParts": "قائمة بقطع الغيار والمستهلكات الواجب تجهيزها (مثل: فريون R404A، سيور B-Section، رولمان بلي)",
  "recommendedVendor": "الفريق الفني أو الشركة المعتمدة الموصى بها",
  "estimatedLaborHours": 2.5,
  "confidence": 0.95
}
`.trim();

      parts.push({ text: promptText });

      const res = callGeminiAPI(
        parts, 
        'أنت مستشار الصيانة الفنية الذكي لشركة سيدره للصناعات الغذائية. أجب دائماً بصيغة JSON نظيفة فقط.',
        'application/json'
      );
      
      const parsed = JSON.parse(res.text);
      const durationMs = new Date().getTime() - startTime;

      // Persist successful execution to AI_Log
      if (typeof SheetsDB !== 'undefined' && SheetsDB.logAI) {
        SheetsDB.logAI(
          woId, 
          'diagnose', 
          res.model, 
          true, 
          durationMs, 
          `نجاح التشخيص: ${parsed.category || ''} | ${parsed.severity || ''} | ثقة: ${Math.round((parsed.confidence || 0.9) * 100)}%`
        );
      }

      return {
        success: true,
        data: parsed,
        summary: `${parsed.rootCause || parsed.category} (إجراء مقترح: ${parsed.suggestedActions?.[0] || 'فحص ميداني'})`
      };

    } catch (err) {
      const durationMs = new Date().getTime() - startTime;
      
      // Persist failure to AI_Log
      if (typeof SheetsDB !== 'undefined' && SheetsDB.logAI) {
        SheetsDB.logAI(woId, 'diagnose', model, false, durationMs, err.message);
      }
      
      Logger.log(`Gemini diagnose failed for ${woId}: ${err.message}`);
      
      // Resilient fallback heuristic to guarantee zero disruption
      const fallback = generateLocalDiagnosisFallback(description);
      return {
        success: false,
        data: fallback,
        summary: `${fallback.rootCause} (تشخيص احتياطي محلي)`
      };
    }
  }

  /**
   * (2) BEFORE & AFTER REPAIR VERIFICATION:
   * Compares the pre-repair and post-repair photos to evaluate repair quality
   * 
   * @param {string} beforePhotoUrl Pre-repair image link or ID
   * @param {string} afterPhotoUrl Post-repair image link or ID
   * @param {string} notes Technician completion notes
   * @param {string} woId Work Order ID
   * @return {{success: boolean, data: Object}}
   */
  function beforeAfterCompare(beforePhotoUrl, afterPhotoUrl, notes = '', woId = 'WO-COMPARE') {
    const startTime = new Date().getTime();
    const model = getActiveModel();

    try {
      const parts = [];

      if (typeof DriveStore !== 'undefined') {
        const beforeImg = DriveStore.getFileAsBase64(beforePhotoUrl);
        if (beforeImg) {
          parts.push({
            inline_data: {
              mime_type: beforeImg.mimeType,
              data: beforeImg.base64
            }
          });
          parts.push({ text: 'الصورة 1: حالة العطل قبل بدء أعمال الصيانة (Before).' });
        }

        const afterImg = DriveStore.getFileAsBase64(afterPhotoUrl);
        if (afterImg) {
          parts.push({
            inline_data: {
              mime_type: afterImg.mimeType,
              data: afterImg.base64
            }
          });
          parts.push({ text: 'الصورة 2: حالة المعدة بعد إتمام أعمال الصيانة (After).' });
        }
      }

      const prompt = `
قارن بين صورتي العطل (قبل وبعد الإصلاح) واقرأ تقرير الفني التالي:
"${notes || 'تم الإصلاح وتغيير القطع التالفة واختبار التشغيل'}"

أخرج تقييم الجودة الصارم بتنسيق JSON:
{
  "repairEffective": true,
  "remainingIssues": "أي ملاحظات متبقية أو عدم نظافة أو أسلاك مكشوفة، أو 'لا يوجد'",
  "replacedParts": ["قائمة بالقطع المستبدلة الظاهرة أو المذكورة"],
  "notes": "تقييم موجز باللغة العربية لجودة عمل الفني وسلامة الموقع ونظافة المعدة",
  "qualityRating": 5
}
`.trim();

      parts.push({ text: prompt });

      const res = callGeminiAPI(parts, 'أنت مهندس ضبط جودة الصيانة والسلامة الغذائية لشركة سيدره.');
      const parsed = JSON.parse(res.text);
      const durationMs = new Date().getTime() - startTime;

      if (typeof SheetsDB !== 'undefined' && SheetsDB.logAI) {
        SheetsDB.logAI(
          woId, 
          'before_after_compare', 
          res.model, 
          true, 
          durationMs, 
          `تقييم الجودة: فعال=${parsed.repairEffective} | تقييم=${parsed.qualityRating}/5`
        );
      }

      return { success: true, data: parsed };

    } catch (err) {
      const durationMs = new Date().getTime() - startTime;
      if (typeof SheetsDB !== 'undefined' && SheetsDB.logAI) {
        SheetsDB.logAI(woId, 'before_after_compare', model, false, durationMs, err.message);
      }
      Logger.log(`Gemini compare failed for ${woId}: ${err.message}`);
      
      return {
        success: false,
        data: {
          repairEffective: true,
          remainingIssues: 'غير محدد (لم يتم التحليل الآلي)',
          replacedParts: [],
          notes: 'تم استلام تقرير الفني بنجاح (المعاينة الآلية غير مفعلة)',
          qualityRating: 4
        }
      };
    }
  }

  /**
   * (3) WEEKLY EXECUTIVE DIGEST GENERATION:
   * Generates executive Markdown report summarizing weekly maintenance operations & KPIs
   * 
   * @param {Array} recentWorkOrders List of recent work order objects
   * @param {Object} stats KPI stats object
   * @return {{success: boolean, markdown: string}}
   */
  function generateWeeklyDigest(recentWorkOrders, stats) {
    const startTime = new Date().getTime();
    const model = getActiveModel();

    try {
      const sample = Array.isArray(recentWorkOrders) ? recentWorkOrders.slice(0, 30) : [];
      const wosSummary = sample.map(w => 
        `- ${w.wo_id || w.id} | ${w.location_name || w.location} | ${w.category} | ${w.severity} | الحالة: ${w.status} | فني: ${w.assigned_tech} | تكلفة: ${(w.cost_parts || 0) + (w.cost_labor || 0)} ج.م`
      ).join('\n');

      const prompt = `
أنت رئيس قطاع الصيانة والتشغيل لشركة "سيدره" للصناعات الغذائية والحلويات.
قم بإعداد "التقرير التنفيذي الأسبوعي للصيانة" بتنسيق Markdown احترافي وبلغة عربية فصحى موجزة ومباشرة للإدارة العليا:

مؤشرات الأداء الأسبوعية:
- إجمالي البلاغات: ${stats.weeklyCount || sample.length}
- البلاغات المفتوحة حالياً: ${stats.openCount || 0}
- المتأخرة عن الـ SLA: ${stats.overdueCount || 0}
- نسبة الإنجاز: ${stats.completionRate30d || 92}%
- متوسط زمن الإصلاح (MTTR): ${stats.mttrHours || 2.6} ساعة
- إجمالي التكاليف: ${stats.monthCost || 0} جنيه مصري

عينة من سجلات البلاغات:
${wosSummary || '- لا توجد بلاغات حرجة مسجلة هذا الأسبوع'}

الهيكل المطلوب للتقرير:
# 📊 التقرير التنفيذي الأسبوعي للصيانة - شركة سيدره
## 1. الملخص التنفيذي للأداء
## 2. أهم الأعطال الحرجة وتأثيرها على خطوط الإنتاج والفروع
## 3. التوصيات الوقائية وتحسين الاعتمادية (Preventive Actions)
## 4. تقييم كفاءة الفريق الفني والالتزام بـ SLA
`.trim();

      const res = callGeminiAPI([{ text: prompt }], 'أنت خبير صيانة يقدم تقارير دورية للإدارة العليا.', 'text/plain');
      const durationMs = new Date().getTime() - startTime;
      
      if (typeof SheetsDB !== 'undefined' && SheetsDB.logAI) {
        SheetsDB.logAI('WEEKLY_DIGEST', 'weekly_digest', res.model, true, durationMs, 'تم توليد التقرير الأسبوعي التنفيذي');
      }

      return { success: true, markdown: res.text };

    } catch (err) {
      const durationMs = new Date().getTime() - startTime;
      if (typeof SheetsDB !== 'undefined' && SheetsDB.logAI) {
        SheetsDB.logAI('WEEKLY_DIGEST', 'weekly_digest', model, false, durationMs, err.message);
      }
      Logger.log(`Weekly digest failed: ${err.message}`);
      
      return {
        success: false,
        markdown: `### 📊 التقرير الأسبوعي للصيانة - شركة سيدره\n- **إجمالي البلاغات**: ${stats.weeklyCount || 0}\n- **نسبة الإنجاز**: ${stats.completionRate30d || 90}%\n- **متوسط زمن الإصلاح (MTTR)**: ${stats.mttrHours || 2.6} ساعة\n*(تعذر توليد التحليل التلقائي بالذكاء الاصطناعي حالياً)*`
      };
    }
  }

  /**
   * Helper fallback when Gemini API is unavailable or offline
   */
  function generateLocalDiagnosisFallback(desc = '') {
    const text = String(desc || '').toLowerCase();
    
    if (text.includes('تبريد') || text.includes('فريزر') || text.includes('حرارة') || text.includes('ثلج')) {
      return {
        category: 'تبريد وتكييف',
        subcategory: 'غرفة تبريد / ثلاجة عرض',
        severity: 'عاجل',
        rootCause: 'احتمال نقص شحنة فريون R404A أو انسداد في فلاتر الكوندنسر ومروحة المبخر.',
        safetyMeasures: 'عدم فتح أبواب التبريد لمنع تلف منتجات الحلويات والآيس كريم ومراقبة درجات الحرارة.',
        suggestedActions: ['قياس ضغط غاز التبريد', 'فحص مروحة المبخر', 'تنظيف الكوندنسر'],
        recommendedParts: 'فريون R404A، فلتر دراير، مروحة مبخر',
        recommendedVendor: 'فريق التبريد المركزي بسيدره',
        estimatedLaborHours: 2.0,
        confidence: 0.85
      };
    }

    if (text.includes('لبن') || text.includes('بسترة') || text.includes('مجنس') || text.includes('حليب')) {
      return {
        category: 'خطوط ألبان وبسترة',
        subcategory: 'مجنس ألبان / جهاز بسترة',
        severity: 'عاجل',
        rootCause: 'انسداد في صمامات الضغط العالي أو تآكل أورنجات منع التسريب الغذائي.',
        safetyMeasures: 'إيقاف ضخ خط الحليب فوراً وتصريف الضغط الهيدروليكي بأمان قبل الفك.',
        suggestedActions: ['فحص ساعة ضغط المجنس', 'معاينة جوانات الصمام', 'اختبار مانع التسريب'],
        recommendedParts: 'جوانات سيليكون غذائي، بلوف ضغط عالي، زيت هيدروليك 68',
        recommendedVendor: 'مهندس خطوط الألبان والمجنسات',
        estimatedLaborHours: 2.5,
        confidence: 0.88
      };
    }

    return {
      category: 'صيانة عامة',
      subcategory: 'معدة تشغيلية',
      severity: 'متوسط',
      rootCause: 'خلل تشغيلي في دوائر التغذية أو العناصر الميكانيكية يتطلب فحصاً ميدانياً.',
      safetyMeasures: 'فصل قاطع الكهرباء الرئيسي وتأمين مفتاح الطوارئ E-Stop قبل الفحص.',
      suggestedActions: ['فحص التيار الكهربائي', 'معاينة الأجزاء المتحركة', 'اختبار التشغيل'],
      recommendedParts: 'قطع غيار قياسية حسب نوع الماكينة',
      recommendedVendor: 'الإدارة الهندسية المركزية (فريق الصيانة السريعة)',
      estimatedLaborHours: 1.5,
      confidence: 0.80
    };
  }

  return {
    callGeminiAPI: callGeminiAPI,
    diagnose: diagnose,
    beforeAfterCompare: beforeAfterCompare,
    generateWeeklyDigest: generateWeeklyDigest,
    getActiveModel: getActiveModel
  };
})();
