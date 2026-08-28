import { getAccessToken } from './googleAuth';
import { WorkOrder, LocationItem, TechnicianItem, AssetRecord, InventoryItem } from '../types';

/**
 * Helper to execute authorized Google Workspace REST requests
 */
async function authorizedFetch(url: string, options: RequestInit = {}) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Workspace Authentication Required. Please sign in with Google first.');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = '';
    try {
      const errJson = await res.json();
      errorDetail = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await res.text();
    }
    throw new Error(`Google API Error (${res.status}): ${errorDetail}`);
  }

  return res.json();
}

// ============================================================================
// 1. GOOGLE DRIVE API (drive.googleapis.com)
// ============================================================================

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  size?: string;
  owners?: { displayName: string; emailAddress: string }[];
}

export const googleDriveService = {
  /**
   * List files in user's Google Drive with optional filters
   */
  async listFiles(query = '', mimeTypeFilter = ''): Promise<DriveFileItem[]> {
    let q = 'trashed = false';
    if (mimeTypeFilter) {
      q += ` and mimeType = '${mimeTypeFilter}'`;
    }
    if (query) {
      q += ` and name contains '${query}'`;
    }

    const params = new URLSearchParams({
      q,
      fields: 'files(id, name, mimeType, modifiedTime, webViewLink, iconLink, size, owners)',
      orderBy: 'modifiedTime desc',
      pageSize: '30',
    });

    const data = await authorizedFetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`);
    return data.files || [];
  },

  /**
   * Create a new folder in Google Drive
   */
  async createFolder(name: string, parentFolderId?: string): Promise<DriveFileItem> {
    const metadata: any = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    return await authorizedFetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      body: JSON.stringify(metadata),
    });
  },

  /**
   * Upload / Create a text file or JSON backup in Google Drive
   */
  async uploadFile(fileName: string, content: string, mimeType = 'application/json', parentFolderId?: string): Promise<DriveFileItem> {
    const metadata: any = {
      name: fileName,
      mimeType,
    };
    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', new Blob([content], { type: mimeType }));

    const token = await getAccessToken();
    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Drive Upload Failed: ${err}`);
    }

    return res.json();
  },

  /**
   * Delete a file or folder in Google Drive (Destructive operation)
   */
  async deleteFile(fileId: string): Promise<void> {
    const token = await getAccessToken();
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete file from Drive: ${await res.text()}`);
    }
  },

  /**
   * Get Drive user about metadata
   */
  async getAbout(): Promise<any> {
    return await authorizedFetch('https://www.googleapis.com/drive/v3/about?fields=user,storageQuota');
  }
};

// ============================================================================
// 2. GOOGLE SHEETS API (sheets.googleapis.com)
// ============================================================================

export interface GoogleSheetTab {
  sheetId: number;
  title: string;
  rowCount: number;
  columnCount: number;
}

export const googleSheetsService = {
  /**
   * Create a complete CMMS Master Google Spreadsheet with 7 pre-formatted tabs
   */
  async createMasterSpreadsheet(
    title: string,
    initialData: {
      workOrders: WorkOrder[];
      locations: LocationItem[];
      technicians: TechnicianItem[];
      assets: AssetRecord[];
      inventory: InventoryItem[];
    }
  ): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    // 1. Create Spreadsheet with tabs
    const createPayload = {
      properties: {
        title,
      },
      sheets: [
        { properties: { title: 'WoHeaders' } },
        { properties: { title: 'Visits' } },
        { properties: { title: 'Locations' } },
        { properties: { title: 'Technicians' } },
        { properties: { title: 'Assets' } },
        { properties: { title: 'Inventory' } },
        { properties: { title: 'AI_Log' } },
      ],
    };

    const created = await authorizedFetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      body: JSON.stringify(createPayload),
    });

    const spreadsheetId = created.spreadsheetId;

    // 2. Populate Header rows and initial seed rows in batch
    const valueUpdates = [
      {
        range: 'WoHeaders!A1:N1',
        values: [[
          'WO_ID', 'Location_ID', 'Location_Name', 'Location_Type', 'Asset_Category', 
          'Equipment_Name', 'Issue_Description', 'Priority', 'Status', 'Technician_ID', 
          'Technician_Name', 'Target_Date', 'Created_At', 'Total_Cost_EGP'
        ]],
      },
      {
        range: 'Visits!A1:K1',
        values: [[
          'Visit_ID', 'WO_ID', 'Technician_ID', 'Visit_Date', 'Duration_Min', 
          'Root_Cause_Diagnosis', 'Actions_Taken', 'Parts_Used_Count', 'Parts_Cost_EGP', 
          'Work_Confirmed_By', 'Status_After_Visit'
        ]],
      },
      {
        range: 'Locations!A1:F1',
        values: [['Location_ID', 'Location_Name', 'Type', 'Region', 'Latitude', 'Longitude']],
      },
      {
        range: 'Technicians!A1:F1',
        values: [['Technician_ID', 'Name', 'Phone', 'Specialty', 'Status', 'Hourly_Rate_EGP']],
      },
      {
        range: 'Assets!A1:G1',
        values: [['Asset_ID', 'Name', 'Location_Name', 'Category', 'Manufacturer', 'Model', 'Status']],
      },
      {
        range: 'Inventory!A1:F1',
        values: [['Item_ID', 'Name', 'Category', 'Stock_Qty', 'Min_Limit', 'Status']],
      },
      {
        range: 'AI_Log!A1:E1',
        values: [['Timestamp', 'WO_ID', 'Gemini_Model', 'Confidence_Score', 'AI_Triage_Recommendation']],
      },
    ];

    // Seed current work orders if available
    if (initialData.workOrders.length > 0) {
      const woRows = initialData.workOrders.map(wo => [
        String(wo.wo_id || ''),
        String(wo.location_id || ''),
        String(wo.location_name || ''),
        String(wo.org || ''),
        String(wo.category || ''),
        String(wo.subcategory || ''),
        String(wo.description || ''),
        String(wo.severity || ''),
        String(wo.status || ''),
        String(wo.assigned_tech || ''),
        String(wo.sla_deadline || ''),
        String(wo.created_at || ''),
        String((wo.cost_parts || 0) + (wo.cost_labor || 0)),
        String(wo.gemini_summary || '')
      ]);
      valueUpdates.push({
        range: `WoHeaders!A2:N${woRows.length + 1}`,
        values: woRows,
      });
    }

    // Seed locations
    if (initialData.locations.length > 0) {
      const locRows = initialData.locations.map(l => [
        String(l.id), String(l.name), String(l.type), String(l.region), String(l.lat), String(l.lng)
      ]);
      valueUpdates.push({
        range: `Locations!A2:F${locRows.length + 1}`,
        values: locRows,
      });
    }

    // Seed technicians
    if (initialData.technicians.length > 0) {
      const techRows = initialData.technicians.map(t => [
        String(t.id), String(t.name), String(t.phone), String(t.specialty), t.active ? 'نشط' : 'غير نشط', String(t.employmentType || 'ثابت')
      ]);
      valueUpdates.push({
        range: `Technicians!A2:F${techRows.length + 1}`,
        values: techRows,
      });
    }

    // Seed inventory
    if (initialData.inventory.length > 0) {
      const invRows = initialData.inventory.map(inv => [
        String(inv.id), String(inv.name), String(inv.category), String(inv.balance), String(inv.reorderLevel || 5), String(inv.status)
      ]);
      valueUpdates.push({
        range: `Inventory!A2:F${invRows.length + 1}`,
        values: invRows,
      });
    }

    await authorizedFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: valueUpdates,
      }),
    });

    return {
      spreadsheetId,
      spreadsheetUrl: created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    };
  },

  /**
   * Read values from a specific Sheet range
   */
  async readRange(spreadsheetId: string, range: string): Promise<any[][]> {
    const res = await authorizedFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`);
    return res.values || [];
  },

  /**
   * Append a row to a sheet tab (e.g. new work order)
   */
  async appendRow(spreadsheetId: string, sheetName: string, rowValues: any[]): Promise<any> {
    return await authorizedFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        body: JSON.stringify({
          values: [rowValues],
        }),
      }
    );
  },

  /**
   * Get spreadsheet tabs and title metadata
   */
  async getSpreadsheetMeta(spreadsheetId: string): Promise<{ title: string; tabs: GoogleSheetTab[] }> {
    const data = await authorizedFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets(properties(sheetId,title,gridProperties))`);
    const tabs = (data.sheets || []).map((s: any) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
      rowCount: s.properties.gridProperties?.rowCount || 0,
      columnCount: s.properties.gridProperties?.columnCount || 0,
    }));
    return {
      title: data.properties?.title || 'Google Spreadsheet',
      tabs,
    };
  }
};

// ============================================================================
// 3. GOOGLE DOCS API (docs.googleapis.com)
// ============================================================================

export const googleDocsService = {
  /**
   * Create an official, beautifully formatted Maintenance Incident Report in Google Docs
   */
  async createMaintenanceReportDoc(
    workOrder: WorkOrder,
    diagnostics?: string,
    orgName = 'شركة سيدره للصناعات الغذائية'
  ): Promise<{ documentId: string; documentUrl: string }> {
    // 1. Create a blank Google Document
    const title = `تقرير صيانة معتمد - ${workOrder.wo_id} - ${workOrder.location_name}`;
    const doc = await authorizedFetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });

    const documentId = doc.documentId;

    // 2. Build structured text payload
    const content = [
      `نظام إدارة الصيانة المحوسب CMMS | ${orgName}\n`,
      `================================================================================\n`,
      `تقرير فحص وتدخل صيانة فني معتمد (Work Order Inspection Protocol)\n\n`,
      `معلومات أمر الشغل:\n`,
      `• رقم أمر الشغل (WO ID): ${workOrder.wo_id}\n`,
      `• الفرع / الموقع: ${workOrder.location_name} (${workOrder.org || 'مجموعة سيدره'})\n`,
      `• القسم والمنظومة: ${workOrder.category} [${workOrder.subcategory}]\n`,
      `• درجة الأهمية والأولوية: ${workOrder.severity}\n`,
      `• تاريخ البلاغ: ${workOrder.created_at}\n`,
      `• الموعد النهائي المستهدف (SLA): ${workOrder.sla_deadline}\n`,
      `• الفني المكلف بالمعاينة: ${workOrder.assigned_tech || 'فريق الطوارئ المركزي'}\n`,
      `• الحالة الفنية الحالية: ${workOrder.status}\n\n`,
      `وصف العطل المبلغ عنه:\n`,
      `"${workOrder.description}"\n\n`,
      `ملخص التشخيص الذكي بالـ AI:\n`,
      `${workOrder.gemini_summary || 'تمت المعاينة الميدانية وفحص الدوائر وضبط الحساسات وقياس ضغط التشغيل.'}\n\n`,
      `التقرير الفني والتشخيص الهندسي:\n`,
      `${diagnostics || 'تم فحص المكونات واستبدال القطع التالفة واختبار التشغيل بنجاح.'}\n\n`,
      `اعتماد وإخلاء طرف الإدارة الميدانية:\n`,
      `• توقيع الفني المنفذ: ___________________________\n`,
      `• توقيع مدير الفرع / المصنع: ___________________________\n`,
      `• التاريخ والختم الرسمي: ${new Date().toLocaleDateString('ar-EG')}\n`,
    ].join('');

    // 3. Insert content using batchUpdate
    await authorizedFetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: content,
            },
          },
        ],
      }),
    });

    return {
      documentId,
      documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
    };
  }
};

// ============================================================================
// 4. GOOGLE FORMS API (forms.googleapis.com)
// ============================================================================

export const googleFormsService = {
  /**
   * Create an automated Branch Defect Reporting Form in Google Forms
   */
  async createIncidentReportingForm(
    formTitle: string,
    locationsList: string[] = []
  ): Promise<{ formId: string; responderUri: string; editUri: string }> {
    // 1. Create blank form
    const createdForm = await authorizedFetch('https://forms.googleapis.com/v1/forms', {
      method: 'POST',
      body: JSON.stringify({
        info: {
          title: formTitle,
          documentTitle: formTitle,
          description: 'نموذج الإبلاغ الميداني المباشر عن الأعطال لشبكة فروع ومصانع سيدره - متزامن مع نظام CMMS',
        },
      }),
    });

    const formId = createdForm.formId;

    const sampleLocations = locationsList.length > 0 ? locationsList.slice(0, 10) : [
      'فرع مصر الجديدة - روكسي',
      'فرع الزمالك - حسن صبري',
      'فرع التجمع الخامس - التسعين',
      'مصنع العبور المركزي',
      'مستودع العاشر من رمضان'
    ];

    // 2. Add Questions via batchUpdate
    const requests = [
      {
        createItem: {
          item: {
            title: 'اسم الفرع أو المصنع:',
            description: 'اختر موقع العطل من القائمة المعتمدة',
            questionItem: {
              question: {
                required: true,
                choiceQuestion: {
                  type: 'DROP_DOWN',
                  options: sampleLocations.map(loc => ({ value: loc })),
                },
              },
            },
          },
          location: { index: 0 },
        },
      },
      {
        createItem: {
          item: {
            title: 'المعدة أو الماكينة المعطلة:',
            description: 'مثال: ثلاجة عرض الحلويات، فرن روتاري، مفرمة اللحوم',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false },
              },
            },
          },
          location: { index: 1 },
        },
      },
      {
        createItem: {
          item: {
            title: 'درجة الخطورة والتأثير على التشغيل:',
            questionItem: {
              question: {
                required: true,
                choiceQuestion: {
                  type: 'RADIO',
                  options: [
                    { value: 'طوارئ P1 (توقف خط الإنتاج أو خطر سلامة)' },
                    { value: 'عالي P2 (تعطل معدة رئيسية مع وجود بديل)' },
                    { value: 'متوسط P3 (انخفاض كفاءة أو صوت غير طبيعي)' },
                    { value: 'منخفض P4 (صيانة تجميلية أو وقائية)' },
                  ],
                },
              },
            },
          },
          location: { index: 2 },
        },
      },
      {
        createItem: {
          item: {
            title: 'وصف تفصيلي للعطل أو المشكلة:',
            description: 'يرجى كتابة ما يلاحظه المشغل أو روائح تسريب أو أصوات غريبة',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: true },
              },
            },
          },
          location: { index: 3 },
        },
      },
      {
        createItem: {
          item: {
            title: 'رقم هاتف مسؤول الفرع للتواصل:',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false },
              },
            },
          },
          location: { index: 4 },
        },
      },
    ];

    await authorizedFetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({ requests }),
    });

    return {
      formId,
      responderUri: createdForm.responderUri || `https://docs.google.com/forms/d/e/${formId}/viewform`,
      editUri: `https://docs.google.com/forms/d/${formId}/edit`,
    };
  },

  /**
   * Get form responses submitted by branch users
   */
  async getFormResponses(formId: string): Promise<any[]> {
    const data = await authorizedFetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`);
    return data.responses || [];
  },

  /**
   * Get Form definition and questions
   */
  async getForm(formId: string): Promise<any> {
    return await authorizedFetch(`https://forms.googleapis.com/v1/forms/${formId}`);
  }
};

// ============================================================================
// 5. GOOGLE SLIDES API (slides.googleapis.com)
// ============================================================================

export const googleSlidesService = {
  /**
   * Create an Executive Monthly Maintenance Performance Review Deck in Google Slides
   */
  async createExecutiveKPIDeck(
    deckTitle: string,
    stats: {
      totalWos: number;
      completedWos: number;
      pendingWos: number;
      totalCostEgp: number;
      mttrHours: number;
      uptimePercent: number;
      orgName: string;
    }
  ): Promise<{ presentationId: string; presentationUrl: string }> {
    // 1. Create empty presentation
    const presentation = await authorizedFetch('https://slides.googleapis.com/v1/presentations', {
      method: 'POST',
      body: JSON.stringify({
        title: deckTitle,
      }),
    });

    const presentationId = presentation.presentationId;

    // 2. Add Slides with structured metrics
    const slide1Id = `slide_kpi_${Date.now()}`;
    const titleBoxId = `title_box_${Date.now()}`;
    const bodyBoxId = `body_box_${Date.now()}`;

    const requests = [
      // Create new slide
      {
        createSlide: {
          objectId: slide1Id,
          insertionIndex: 1,
          slideLayoutReference: {
            predefinedLayout: 'BLANK',
          },
        },
      },
      // Title Box
      {
        createShape: {
          objectId: titleBoxId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: slide1Id,
            size: {
              width: { magnitude: 650, unit: 'PT' },
              height: { magnitude: 60, unit: 'PT' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 35,
              translateY: 30,
              unit: 'PT',
            },
          },
        },
      },
      {
        insertText: {
          objectId: titleBoxId,
          text: `📊 التقرير التنفيذي لمؤشرات صيانة أصول ${stats.orgName}`,
        },
      },
      // Metrics Content Box
      {
        createShape: {
          objectId: bodyBoxId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: slide1Id,
            size: {
              width: { magnitude: 650, unit: 'PT' },
              height: { magnitude: 300, unit: 'PT' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 35,
              translateY: 100,
              unit: 'PT',
            },
          },
        },
      },
      {
        insertText: {
          objectId: bodyBoxId,
          text: [
            `• إجمالي بلاغات الصيانة المسجلة: ${stats.totalWos} بلاغ\n`,
            `• أوامر الشغل المكتملة بنجاح: ${stats.completedWos} بلاغ (${Math.round((stats.completedWos / (stats.totalWos || 1)) * 100)}% معدل إنجاز)\n`,
            `• أوامر الشغل الجارية والحرجة: ${stats.pendingWos} بلاغ\n`,
            `• إجمالي تكاليف قطع الغيار والعمالة: ${stats.totalCostEgp.toLocaleString()} ج.م\n`,
            `• متوسط زمن الإصلاح الفعلي (MTTR): ${stats.mttrHours} ساعة\n`,
            `• نسبة جاهزية الماكينات والخطوط (Equipment Uptime): ${stats.uptimePercent}%\n\n`,
            `تم توليد هذا العرض تلقائياً عبر نظام Sidrah CMMS المتكامل مع Google Slides API.`
          ].join(''),
        },
      },
    ];

    await authorizedFetch(`https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({ requests }),
    });

    return {
      presentationId,
      presentationUrl: `https://docs.google.com/presentation/d/${presentationId}/edit`,
    };
  },

  /**
   * Get presentation metadata
   */
  async getPresentation(presentationId: string): Promise<any> {
    return await authorizedFetch(`https://slides.googleapis.com/v1/presentations/${presentationId}`);
  }
};
