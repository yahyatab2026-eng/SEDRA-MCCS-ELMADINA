/**
 * ============================================================================
 * CMMS SIDRAH - NOTIFICATIONS MODULE (Notify.gs)
 * Zero-cost alerts via native GmailApp & WhatsApp Deep Links (wa.me)
 * ============================================================================
 */

const Notify = (function() {

  /**
   * Generates a WhatsApp deep-link (wa.me) formatted text and URL
   * @param {string} phone International phone with country code (e.g. +201001234567)
   * @param {string} text Message text
   * @return {string} https://wa.me/ URL
   */
  function generateWhatsAppDeepLink(phone, text) {
    if (!phone) return '';
    // Clean phone number (strip spaces, dashes, plus signs)
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }

  /**
   * Sends an immediate Gmail alert to Maintenance Manager for URGENT (عاجل) work orders
   * Includes direct Web App links and WhatsApp dispatcher button
   */
  function sendUrgentAlert(wo) {
    try {
      const managerEmail = getAppSetting('MANAGER_EMAIL') || CONFIG.DEFAULTS.MANAGER_EMAIL;
      const managerPhone = getAppSetting('MANAGER_PHONE') || CONFIG.DEFAULTS.MANAGER_PHONE;
      const orgName = getAppSetting('ORG_NAME') || CONFIG.DEFAULTS.ORG_NAME;
      
      const scriptUrl = ScriptApp.getService().getUrl() || 'https://script.google.com';
      const dashboardWoLink = `${scriptUrl}?page=dashboard&wo_id=${wo.wo_id}`;

      // WhatsApp text payload for fast dispatching
      const waText = `*🚨 إنذار صيانة عاجل - ${orgName}*
*رقم البلاغ:* ${wo.wo_id}
*الموقع:* ${wo.location_name}
*العطل:* ${wo.category} - ${wo.subcategory}
*الوصف:* ${wo.description}
*المبلغ:* ${wo.reporter} (${wo.reporter_phone})
*الموعد الأقصى (SLA):* ${wo.sla_deadline}
*رابط المتابعة:* ${dashboardWoLink}`;

      const waLink = generateWhatsAppDeepLink(managerPhone, waText);

      // HTML Email Body
      const htmlBody = `
<div dir="rtl" style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <div style="background-color: #dc2626; color: #ffffff; padding: 18px 24px;">
      <h2 style="margin: 0; font-size: 20px;">🚨 بلاغ صيانة عاجل جديد - ${wo.wo_id}</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">${orgName} | إدارة الصيانة والتشغيل</p>
    </div>
    
    <div style="padding: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b; width: 35%;">الموقع / الفرع:</td>
          <td style="padding: 10px 0; font-weight: bold; color: #0f172a;">${wo.location_name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">التصنيف:</td>
          <td style="padding: 10px 0; font-weight: bold; color: #0f172a;">${wo.category} - ${wo.subcategory}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">درجة الخطورة:</td>
          <td style="padding: 10px 0;"><span style="background: #fee2e2; color: #dc2626; padding: 3px 10px; border-radius: 9999px; font-weight: bold;">عاجل (SLA: 4 ساعات)</span></td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">الموعد النهائي (Deadline):</td>
          <td style="padding: 10px 0; font-weight: bold; color: #b91c1c;">${wo.sla_deadline}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">المُبلّغ:</td>
          <td style="padding: 10px 0; color: #0f172a;">${wo.reporter} (${wo.reporter_phone})</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">تفاصيل العطل:</td>
          <td style="padding: 10px 0; color: #334155; line-height: 1.5;">${wo.description}</td>
        </tr>
        ${wo.gemini_summary ? `
        <tr style="background: #f0fdf4;">
          <td style="padding: 10px; color: #166534; font-weight: bold;">تشخيص الذكاء الاصطناعي (Gemini):</td>
          <td style="padding: 10px; color: #166534;">${wo.gemini_summary}</td>
        </tr>
        ` : ''}
      </table>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${dashboardWoLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-left: 8px;">
          فتح البلاغ في لوحة التحكم 💻
        </a>
        <a href="${waLink}" target="_blank" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold;">
          إرسال للفني عبر واتساب 💬
        </a>
      </div>
    </div>

    <div style="background-color: #f8fafc; padding: 14px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
      تم إنشاء هذا الإشعار تلقائياً بواسطة نظام CMMS سيدره - بنية تحتية سحابية مجانية
    </div>
  </div>
</div>
`;

      GmailApp.sendEmail(managerEmail, `🚨 [عاجل] بلاغ صيانة جديد: ${wo.wo_id} - ${wo.location_name}`, '', {
        htmlBody: htmlBody,
        name: 'نظام صيانة سيدره (CMMS)'
      });

      Logger.log(`Urgent alert sent to ${managerEmail} for WO ${wo.wo_id}`);
      return { success: true, waLink: waLink };

    } catch (e) {
      Logger.log(`Failed to send urgent alert: ${e.message}`);
      return { success: false, error: e.message };
    }
  }

  /**
   * Sends the Weekly Executive Digest email with Gemini markdown summary to Management
   */
  function sendWeeklyDigestEmail(markdownSummary, stats) {
    try {
      const managerEmail = getAppSetting('MANAGER_EMAIL') || CONFIG.DEFAULTS.MANAGER_EMAIL;
      const orgName = getAppSetting('ORG_NAME') || CONFIG.DEFAULTS.ORG_NAME;

      const subject = `📊 التقرير الأسبوعي للصيانة والتشغيل - ${orgName} (${Utilities.formatDate(new Date(), CONFIG.DEFAULTS.TIMEZONE, 'yyyy-MM-dd')})`;
      
      const htmlBody = `
<div dir="rtl" style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
  <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
    <div style="background: linear-gradient(135deg, #1e293b, #0f172a); color: #ffffff; padding: 24px;">
      <h2 style="margin: 0; font-size: 22px;">📊 التقرير الأسبوعي للصيانة والتشغيل</h2>
      <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.85;">${orgName} - الملخص الذكي المولد بواسطة Gemini AI</p>
    </div>
    
    <div style="padding: 24px;">
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
        <div style="background: #f1f5f9; padding: 14px; border-radius: 8px; text-align: center;">
          <div style="font-size: 12px; color: #64748b;">إجمالي بلاغات الأسبوع</div>
          <div style="font-size: 22px; font-weight: bold; color: #0f172a; margin-top: 4px;">${stats.weeklyCount}</div>
        </div>
        <div style="background: #ecfdf5; padding: 14px; border-radius: 8px; text-align: center;">
          <div style="font-size: 12px; color: #059669;">نسبة الإنجاز (30 يوم)</div>
          <div style="font-size: 22px; font-weight: bold; color: #059669; margin-top: 4px;">${stats.completionRate30d}%</div>
        </div>
        <div style="background: #eff6ff; padding: 14px; border-radius: 8px; text-align: center;">
          <div style="font-size: 12px; color: #2563eb;">متوسط وقت الإصلاح</div>
          <div style="font-size: 22px; font-weight: bold; color: #2563eb; margin-top: 4px;">${stats.mttrHours} ساعة</div>
        </div>
      </div>

      <div style="background: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; line-height: 1.7; white-space: pre-wrap; font-size: 14px; color: #334155;">
${markdownSummary}
      </div>
    </div>
  </div>
</div>
`;

      GmailApp.sendEmail(managerEmail, subject, '', {
        htmlBody: htmlBody,
        name: 'نظام صيانة سيدره (CMMS)'
      });

      Logger.log(`Weekly digest email successfully sent to ${managerEmail}`);
      return { success: true };
    } catch (e) {
      Logger.log(`Error sending weekly digest email: ${e.message}`);
      return { success: false, error: e.message };
    }
  }

  return {
    generateWhatsAppDeepLink: generateWhatsAppDeepLink,
    sendUrgentAlert: sendUrgentAlert,
    sendWeeklyDigestEmail: sendWeeklyDigestEmail
  };
})();
