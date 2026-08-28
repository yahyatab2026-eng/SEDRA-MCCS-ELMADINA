/**
 * ============================================================================
 * CMMS SIDRAH - GEMINI AI INTEGRATION LAYER (Gemini.gs)
 * Communicates with Google Gemini REST API via UrlFetchApp with retry & backoff
 * 
 * MODEL SELECTION NOTE:
 * - Default model is "gemini-2.5-flash" (read from Settings tab / ScriptProperties).
 * - To switch to "gemini-3-flash" or newer, simply update the 'DEFAULT_MODEL' key
 *   in the 'Settings' sheet tab or set ScriptProperties GEMINI_MODEL="gemini-3-flash".
 * ============================================================================
 */

const Gemini = (function() {
  
  /**
   * Executes a generateContent request against the Gemini REST API with exponential backoff
   * @param {Array} parts Array of content parts (text and/or inline_data)
   * @param {string} systemInstruction Optional system prompt
   * @param {string} responseMimeType Default "application/json"
   * @return {string} Text response or JSON string
   */
  function callGeminiAPI(parts, systemInstruction = '', responseMimeType = 'application/json') {
    const apiKey = getGeminiApiKey();
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('GEMINI_API_KEY is not configured in ScriptProperties or Settings.');
    }

    const model = getAppSetting('DEFAULT_MODEL') || CONFIG.DEFAULTS.DEFAULT_MODEL;
    const url = `${CONFIG.GEMINI_BASE_URL}${model}:generateContent?key=${apiKey}`;

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

    // Retry loop with exponential backoff for 429 / 5xx errors
    const maxRetries = 3;
    let delayMs = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const startTime = new Date().getTime();
      const response = UrlFetchApp.fetch(url, options);
      const code = response.getResponseCode();
      const durationMs = new Date().getTime() - startTime;

      if (code >= 200 && code < 300) {
        const json = JSON.parse(response.getContentText());
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return { text: text, durationMs: durationMs, model: model };
      }

      // Handle Rate Limit (429) or Server Error (5xx)
      if ((code === 429 || code >= 500) && attempt < maxRetries) {
        Logger.log(`Gemini API returned ${code}. Retrying in ${delayMs}ms (Attempt ${attempt}/${maxRetries})...`);
        Utilities.sleep(delayMs);
        delayMs *= 2;
        continue;
      }

      // Fatal error
      const errText = response.getContentText();
      throw new Error(`Gemini API Error (HTTP ${code}): ${errText}`);
    }

    throw new Error('Gemini API call exceeded maximum retry attempts.');
  }

  /**
   * (a) DIAGNOSE WORK ORDER:
   * Classifies problem, identifies root cause, suggests action plan, checks safety
   */
  function diagnose(description, beforePhotoUrlOrBase64, woId = 'WO-NEW') {
    const startTime = new Date().getTime();
    const model = getAppSetting('DEFAULT_MODEL') || CONFIG.DEFAULTS.DEFAULT_MODEL;

    try {
      const parts = [];

      // If photo provided, encode as inline_data
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
        } else {
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
أنت خبير هندسي وصيانة صناعية وتجارية لشركة "سيدره" (شبكة أفران، مصانع، منافذ بيع حلويات ومأكولات).
قم بتحليل البلاغ والصورة المرفقة لتشخيص العطل بدقة متناهية.

وصف العطل المبلغ عنه:
"${description}"

يجب أن تكون مخرجاتك بتنسيق JSON صارم وبالمفاتيح التالية باللغة العربية للقيم والمصطلحات:
{
  "category": "تصنيف العطل الرئيسي (مثل: تبريد وتجميد، أفران ومخابز، كهرباء، سباكة، معدات مطابخ، موازين)",
  "subcategory": "التصنيف الفرعي للمعدة (مثل: ثلاجة عرض، محرك مروحة، فرن دوار، طلمبة غاطس)",
  "severity": "درجة الخطورة: اختر بدقة إحدى القيم ('عاجل' أو 'متوسط' أو 'منخفض')",
  "rootCause": "السبب الجذري المتوقع للعطل باللغة العربية الفصحى الفنية",
  "suggestedActions": ["خطوة 1 فورية للأمان", "خطوة 2 للإصلاح الفني", "خطوة 3 للاختبار والتشغيل"],
  "confidence": 0.95,
  "canOperateSafely": false,
  "estimatedCostMin": 300,
  "estimatedCostMax": 1000
}
`.trim();

      parts.push({ text: promptText });

      const res = callGeminiAPI(parts, 'أنت مستشار صيانة ذكي لشركة سيدره. أجب دائما بصيغة JSON نظيفة فقط بدون أي نصوص تمهيدية.');
      const parsed = JSON.parse(res.text);

      const durationMs = new Date().getTime() - startTime;
      SheetsDB.logAI(woId, 'diagnose', res.model, true, durationMs, `نجاح التشخيص: ${parsed.category} / ${parsed.severity}`);

      return {
        success: true,
        data: parsed,
        summary: `${parsed.rootCause || parsed.category} (إجراء مقترح: ${parsed.suggestedActions?.[0] || 'فحص شامل'})`
      };

    } catch (e) {
      const durationMs = new Date().getTime() - startTime;
      SheetsDB.logAI(woId, 'diagnose', model, false, durationMs, e.message);
      Logger.log(`Gemini diagnose failed for ${woId}: ${e.message}`);
      
      // Fallback object so the CMMS never breaks
      return {
        success: false,
        data: {
          category: 'صيانة عامة',
          subcategory: 'عام',
          severity: 'متوسط',
          rootCause: 'التحليل الآلي غير متوفر حالياً',
          suggestedActions: ['إجراء فحص ميداني من قبل الفني المختص'],
          confidence: 0.5,
          canOperateSafely: true,
          estimatedCostMin: 0,
          estimatedCostMax: 0
        },
        summary: 'التحليل الآلي غير متوفر (فحص فني مطلوب)'
      };
    }
  }

  /**
   * (b) BEFORE & AFTER REPAIR VERIFICATION:
   * Compares the before and after photos/notes to confirm the repair quality
   */
  function beforeAfterCompare(beforePhotoUrl, afterPhotoUrl, notes = '', woId = 'WO-COMPARE') {
    const startTime = new Date().getTime();
    const model = getAppSetting('DEFAULT_MODEL') || CONFIG.DEFAULTS.DEFAULT_MODEL;

    try {
      const parts = [];

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

      const prompt = `
قارن بين صورتي العطل (قبل وبعد الإصلاح) واقرأ ملاحظات الفني التالية:
"${notes}"

أخرج تقييم الجودة بتنسيق JSON صارم:
{
  "repairEffective": true,
  "remainingIssues": "أي ملاحظات متبقية أو عدم نظافة أو توصيلات غير معزولة، أو 'لا يوجد'",
  "replacedParts": ["قائمة بالقطع المستبدلة الظاهرة أو المذكورة"],
  "notes": "تقييم موجز باللغة العربية لجودة عمل الفني وسلامة الموقع",
  "qualityRating": 5
}
`.trim();

      parts.push({ text: prompt });

      const res = callGeminiAPI(parts, 'أنت مهندس ضبط جودة صيانة لشركة سيدره.');
      const parsed = JSON.parse(res.text);

      const durationMs = new Date().getTime() - startTime;
      SheetsDB.logAI(woId, 'before_after_compare', res.model, true, durationMs, `تقييم الإصلاح: فعال=${parsed.repairEffective}`);

      return { success: true, data: parsed };

    } catch (e) {
      const durationMs = new Date().getTime() - startTime;
      SheetsDB.logAI(woId, 'before_after_compare', model, false, durationMs, e.message);
      Logger.log(`Gemini compare failed for ${woId}: ${e.message}`);
      
      return {
        success: false,
        data: {
          repairEffective: true,
          remainingIssues: 'غير محدد (لم يتم التحليل الآلي)',
          replacedParts: [],
          notes: 'تم استلام تقرير الفني دون تقييم ذكاء اصطناعي',
          qualityRating: 4
        }
      };
    }
  }

  /**
   * (c) WEEKLY DIGEST GENERATION:
   * Reads recent work orders and synthesizes an executive Arabic Markdown report
   */
  function generateWeeklyDigest(recentWorkOrders, stats) {
    const startTime = new Date().getTime();
    const model = getAppSetting('DEFAULT_MODEL') || CONFIG.DEFAULTS.DEFAULT_MODEL;

    try {
      const wosSummary = recentWorkOrders.slice(0, 30).map(w => 
        `- ${w.wo_id} | ${w.location_name} | ${w.category} | ${w.severity} | الحالة: ${w.status} | فني: ${w.assigned_tech} | تكلفة: ${w.cost_parts + w.cost_labor} ج.م`
      ).join('\n');

      const prompt = `
أنت رئيس قسم الصيانة والتشغيل لشركة "سيدره" للأغذية والحلويات.
قم بإعداد "التقرير التنفيذي الأسبوعي للصيانة" بتنسيق Markdown احترافي وبلغة عربية فصحى موجزة ومباشرة.

بيانات وإحصائيات الأسبوع:
- إجمالي البلاغات: ${stats.weeklyCount}
- البلاغات المفتوحة حاليا: ${stats.openCount}
- المتأخرة عن SLA: ${stats.overdueCount}
- نسبة الإنجاز: ${stats.completionRate30d}%
- متوسط وقت الإصلاح (MTTR): ${stats.mttrHours} ساعة
- إجمالي التكلفة: ${stats.monthCost} جنيه

عينة من أهم البلاغات:
${wosSummary}

المطلوب إخراج التقرير بالهيكل التالي:
1. ملخص تنفيذي لأداء الأسبوع (Executive Summary).
2. أهم الأعطال الحرجة التي تم التعامل معها وتأثيرها على العمليات.
3. تحليل الأنماط المتكررة والتوصيات الوقائية (Preventive Recommendations).
4. تقييم كفاءة الفريق الفني والالتزام باتفاقيات مستوى الخدمة (SLA).
`.trim();

      const res = callGeminiAPI([{ text: prompt }], 'أنت خبير صيانة يكتب تقارير دورية للإدارة العليا.', 'text/plain');
      const durationMs = new Date().getTime() - startTime;
      
      SheetsDB.logAI('WEEKLY_DIGEST', 'weekly_digest', res.model, true, durationMs, 'تم إنشاء التقرير الأسبوعي بنجاح');
      return { success: true, markdown: res.text };

    } catch (e) {
      const durationMs = new Date().getTime() - startTime;
      SheetsDB.logAI('WEEKLY_DIGEST', 'weekly_digest', model, false, durationMs, e.message);
      Logger.log('Weekly digest failed: ' + e.message);
      return {
        success: false,
        markdown: `### التقرير الأسبوعي للصيانة (سيدره)\n- إجمالي البلاغات: ${stats.weeklyCount}\n- نسبة الإنجاز: ${stats.completionRate30d}%\n- متوسط الإصلاح: ${stats.mttrHours} ساعة\n*(تعذر إنشاء التحليل المتقدم بالذكاء الاصطناعي)*`
      };
    }
  }

  return {
    diagnose: diagnose,
    beforeAfterCompare: beforeAfterCompare,
    generateWeeklyDigest: generateWeeklyDigest
  };
})();
