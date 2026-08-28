import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, 
  FileSpreadsheet, 
  FileText, 
  FormInput, 
  Presentation, 
  HardDrive, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Search, 
  Sparkles, 
  Upload, 
  Download, 
  FileCode, 
  FolderPlus,
  ShieldCheck,
  User as UserIcon,
  HelpCircle,
  Copy,
  ChevronRight,
  Database
} from 'lucide-react';
import { initAuth, googleSignIn, logout, getAccessToken } from '../services/googleAuth';
import { 
  googleDriveService, 
  googleSheetsService, 
  googleDocsService, 
  googleFormsService, 
  googleSlidesService,
  DriveFileItem
} from '../services/googleWorkspace';
import { WorkOrder } from '../types';
import { useSystemSettings } from '../context/SystemSettingsContext';
import { initialLocations, initialTechnicians, initialAssets, initialInventory } from '../data/seedData';
import { User } from 'firebase/auth';

interface GoogleWorkspaceHubProps {
  lang: 'ar' | 'en';
  workOrdersList: WorkOrder[];
  onWorkOrdersUpdated?: (wos: WorkOrder[]) => void;
}

type WorkspaceTab = 'drive' | 'sheets' | 'docs' | 'forms' | 'slides';

export const GoogleWorkspaceHub: React.FC<GoogleWorkspaceHubProps> = ({
  lang,
  workOrdersList,
  onWorkOrdersUpdated
}) => {
  const isAr = lang === 'ar';
  const { settings, updateIntegrations } = useSystemSettings();

  // Auth States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('drive');

  // Operation Feedback
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Destructive Action Modal
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; fileId: string; fileName: string } | null>(null);

  // Drive State
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [driveSearch, setDriveSearch] = useState('');
  const [driveFilter, setDriveFilter] = useState('');
  const [isRefreshingDrive, setIsRefreshingDrive] = useState(false);

  // Sheets State
  const [createdSheetInfo, setCreatedSheetInfo] = useState<{ id: string; url: string } | null>(() => {
    if (settings.integrations.spreadsheetId) {
      return {
        id: settings.integrations.spreadsheetId,
        url: settings.integrations.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${settings.integrations.spreadsheetId}/edit`
      };
    }
    return null;
  });
  const [sheetInspectRange, setSheetInspectRange] = useState('WoHeaders!A1:N5');
  const [sheetInspectData, setSheetInspectData] = useState<any[][] | null>(null);
  const [isInspectingSheet, setIsInspectingSheet] = useState(false);

  // Docs State
  const [selectedWoForDoc, setSelectedWoForDoc] = useState<string>(workOrdersList[0]?.wo_id || '');
  const [createdDocInfo, setCreatedDocInfo] = useState<{ id: string; url: string; title: string } | null>(null);

  // Forms State
  const [createdFormInfo, setCreatedFormInfo] = useState<{ id: string; responderUri: string; editUri: string } | null>(null);
  const [formResponses, setFormResponses] = useState<any[]>([]);

  // Slides State
  const [createdSlideInfo, setCreatedSlideInfo] = useState<{ id: string; url: string } | null>(null);

  // Initialize Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setHasToken(!!token);
      },
      () => {
        setCurrentUser(null);
        setHasToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch initial drive files when authenticated
  useEffect(() => {
    if (hasToken) {
      loadDriveFiles();
    }
  }, [hasToken, driveFilter]);

  const showStatus = (type: 'success' | 'error' | 'info', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 6000);
  };

  const handleLogin = async () => {
    setIsAuthenticating(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setHasToken(true);
        showStatus('success', isAr ? 'تم تسجيل الدخول وربط خدمات Google Workspace بنجاح!' : 'Successfully signed in and connected Google Workspace!');
      }
    } catch (err: any) {
      console.error(err);
      showStatus('error', isAr ? `فشل تسجيل الدخول: ${err.message || err}` : `Sign-in failed: ${err.message || err}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setHasToken(false);
      setDriveFiles([]);
      showStatus('info', isAr ? 'تم تسجيل الخروج بنجاح.' : 'Signed out successfully.');
    } catch (err: any) {
      console.error(err);
    }
  };

  // --------------------------------------------------------------------------
  // DRIVE OPERATIONS
  // --------------------------------------------------------------------------
  const loadDriveFiles = async () => {
    if (!hasToken) return;
    setIsRefreshingDrive(true);
    try {
      const files = await googleDriveService.listFiles(driveSearch, driveFilter);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Failed to load drive files:', err);
      showStatus('error', isAr ? `تعذر تحميل ملفات Google Drive: ${err.message}` : `Failed to load Drive files: ${err.message}`);
    } finally {
      setIsRefreshingDrive(false);
    }
  };

  const handleCreateDriveFolder = async () => {
    const folderName = prompt(isAr ? 'أدخل اسم المجلد الجديد في Google Drive:' : 'Enter new folder name in Google Drive:', 'Sidrah CMMS Vault 2026');
    if (!folderName) return;

    setIsLoading(true);
    try {
      const newFolder = await googleDriveService.createFolder(folderName);
      showStatus('success', isAr ? `تم إنشاء المجلد "${newFolder.name}" بنجاح في Google Drive!` : `Folder "${newFolder.name}" created successfully!`);
      loadDriveFiles();
    } catch (err: any) {
      showStatus('error', isAr ? `خطأ في إنشاء المجلد: ${err.message}` : `Error creating folder: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupToDrive = async () => {
    setIsLoading(true);
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        org: settings.general.orgName,
        totalWorkOrders: workOrdersList.length,
        workOrders: workOrdersList,
        locations: initialLocations,
        technicians: initialTechnicians,
        assets: initialAssets,
        inventory: initialInventory,
      };

      const fileName = `Sidrah_CMMS_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      const uploaded = await googleDriveService.uploadFile(fileName, JSON.stringify(backupData, null, 2), 'application/json');
      showStatus('success', isAr ? `تم حفظ نسخة احتياطية كاملة في Google Drive: ${uploaded.name}` : `Full backup uploaded to Drive: ${uploaded.name}`);
      loadDriveFiles();
    } catch (err: any) {
      showStatus('error', isAr ? `خطأ في رفع النسخة الاحتياطية: ${err.message}` : `Backup upload error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteFile = async () => {
    if (!deleteConfirmModal) return;
    const { fileId, fileName } = deleteConfirmModal;
    setDeleteConfirmModal(null);
    setIsLoading(true);
    try {
      await googleDriveService.deleteFile(fileId);
      showStatus('success', isAr ? `تم حذف الملف "${fileName}" من Google Drive بنجاح.` : `File "${fileName}" deleted from Drive.`);
      loadDriveFiles();
    } catch (err: any) {
      showStatus('error', isAr ? `تعذر حذف الملف: ${err.message}` : `Failed to delete file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // SHEETS OPERATIONS
  // --------------------------------------------------------------------------
  const handleCreateMasterSheet = async () => {
    setIsLoading(true);
    try {
      const title = `سيدره CMMS - قاعدة البيانات المركزية (${new Date().toLocaleDateString('ar-EG')})`;
      const result = await googleSheetsService.createMasterSpreadsheet(title, {
        workOrders: workOrdersList,
        locations: initialLocations,
        technicians: initialTechnicians,
        assets: initialAssets,
        inventory: initialInventory,
      });

      setCreatedSheetInfo({ id: result.spreadsheetId, url: result.spreadsheetUrl });
      updateIntegrations({
        spreadsheetId: result.spreadsheetId,
        spreadsheetUrl: result.spreadsheetUrl,
      });

      showStatus('success', isAr ? 'تم إنشاء شيت Google Sheets المركزي وتنسيق 7 جداول وحفظه في حسابك بنجاح!' : 'Created Master Google Spreadsheet with 7 tabs in your Drive!');
      loadDriveFiles();
    } catch (err: any) {
      console.error(err);
      showStatus('error', isAr ? `خطأ في إنشاء الشيت: ${err.message}` : `Error creating spreadsheet: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInspectSheet = async () => {
    const spreadsheetId = createdSheetInfo?.id || settings.integrations.spreadsheetId;
    if (!spreadsheetId) {
      showStatus('error', isAr ? 'يرجى إدخال معرف الشيت أولاً' : 'Please provide a Spreadsheet ID first');
      return;
    }

    setIsInspectingSheet(true);
    try {
      const data = await googleSheetsService.readRange(spreadsheetId, sheetInspectRange);
      setSheetInspectData(data);
      showStatus('success', isAr ? `تم قراءة ${data.length} صفاً من الشيت بنجاح.` : `Successfully read ${data.length} rows from sheet.`);
    } catch (err: any) {
      console.error(err);
      showStatus('error', isAr ? `تعذر قراءة بيانات الشيت: ${err.message}` : `Failed to read sheet: ${err.message}`);
    } finally {
      setIsInspectingSheet(false);
    }
  };

  // --------------------------------------------------------------------------
  // DOCS OPERATIONS
  // --------------------------------------------------------------------------
  const handleGenerateReportDoc = async () => {
    const targetWo = workOrdersList.find(w => w.wo_id === selectedWoForDoc) || workOrdersList[0];
    if (!targetWo) {
      showStatus('error', isAr ? 'لا يوجد بلاغ محدد لإنشاء التقرير' : 'No work order selected');
      return;
    }

    setIsLoading(true);
    try {
      const res = await googleDocsService.createMaintenanceReportDoc(
        targetWo,
        'تم الفحص الشامل للمنظومة واستبدال الأجزاء التالفة وإجراء المعايرة لضغط التشغيل واختبار العزل الحراري والأمان بنجاح.',
        settings.general.orgName
      );

      setCreatedDocInfo({
        id: res.documentId,
        url: res.documentUrl,
        title: `تقرير صيانة معتمد - ${targetWo.wo_id}`,
      });

      showStatus('success', isAr ? `تم توليد مستند Google Docs المعتمد وحفظه في Drive: ${res.documentId}` : `Generated Google Doc report in Drive!`);
      loadDriveFiles();
    } catch (err: any) {
      console.error(err);
      showStatus('error', isAr ? `تعذر إنشاء مستند Google Docs: ${err.message}` : `Failed to generate doc: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // FORMS OPERATIONS
  // --------------------------------------------------------------------------
  const handleCreateIncidentForm = async () => {
    setIsLoading(true);
    try {
      const formTitle = `سيدره - نموذج إبلاغ الفروع الميداني عن الأعطال (${new Date().getFullYear()})`;
      const locNames = initialLocations.map(l => l.name);
      const res = await googleFormsService.createIncidentReportingForm(formTitle, locNames);

      setCreatedFormInfo(res);
      showStatus('success', isAr ? 'تم نشر وتوليد نموذج Google Forms للإبلاغ عن الأعطال بنجاح!' : 'Created Google Form for incident reporting!');
      loadDriveFiles();
    } catch (err: any) {
      console.error(err);
      showStatus('error', isAr ? `تعذر إنشاء نموذج Google Forms: ${err.message}` : `Failed to create form: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchFormResponses = async () => {
    if (!createdFormInfo?.id) {
      showStatus('error', isAr ? 'يرجى إنشاء النموذج أولاً' : 'Please deploy form first');
      return;
    }
    setIsLoading(true);
    try {
      const responses = await googleFormsService.getFormResponses(createdFormInfo.id);
      setFormResponses(responses);
      showStatus('info', isAr ? `تم جلب ${responses.length} استجابة مسجلة من Google Forms.` : `Fetched ${responses.length} responses from Google Forms.`);
    } catch (err: any) {
      showStatus('error', isAr ? `تعذر جلب الاستجابات: ${err.message}` : `Error fetching responses: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // SLIDES OPERATIONS
  // --------------------------------------------------------------------------
  const handleGenerateKPISlides = async () => {
    setIsLoading(true);
    try {
      const completed = workOrdersList.filter(w => w.status === 'مُنجز' || w.status === 'مُغلق').length;
      const totalCost = workOrdersList.reduce((acc, w) => acc + (w.cost_parts || 0) + (w.cost_labor || 0), 0);

      const res = await googleSlidesService.createExecutiveKPIDeck(
        `سيدره CMMS - العرض التقديمي الشهري لمؤشرات الأداء (${new Date().toLocaleDateString('ar-EG')})`,
        {
          totalWos: workOrdersList.length,
          completedWos: completed,
          pendingWos: workOrdersList.length - completed,
          totalCostEgp: totalCost,
          mttrHours: 2.8,
          uptimePercent: 98.4,
          orgName: settings.general.orgName,
        }
      );

      setCreatedSlideInfo({
        id: res.presentationId,
        url: res.presentationUrl,
      });

      showStatus('success', isAr ? 'تم توليد وتنسيق العرض التقديمي التنفيذي في Google Slides بنجاح!' : 'Generated Executive KPI Deck in Google Slides!');
      loadDriveFiles();
    } catch (err: any) {
      console.error(err);
      showStatus('error', isAr ? `تعذر توليد العرض التقديمي: ${err.message}` : `Failed to create presentation: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* -------------------------------------------------------------------- */}
      {/* HEADER & GOOGLE ACCOUNT BAR */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-white border-geometric rounded-xs p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-teal-600 rounded-xs"></span>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              {isAr ? 'مركز تكامل وتطبيقات Google Workspace' : 'Google Workspace Integration Hub'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAr 
              ? 'الربط المباشر مع Google Drive, Sheets, Docs, Forms, Slides لتبادل البيانات وتوليد التقارير والأرشفة السحابية.' 
              : 'Direct integration with Google Drive, Sheets, Docs, Forms & Slides for data sync and report generation.'}
          </p>
        </div>

        {/* User Auth Control */}
        <div className="flex items-center gap-3">
          {hasToken && currentUser ? (
            <div className="flex items-center gap-3 bg-slate-50 border-geometric rounded-xs px-3 py-1.5">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || 'Google User'} 
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full border border-slate-300"
                />
              ) : (
                <div className="w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                  {currentUser.displayName?.[0] || 'U'}
                </div>
              )}
              <div className="text-right">
                <div className="text-xs font-black text-slate-900 leading-tight">
                  {currentUser.displayName || 'مستخدم Google'}
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  {currentUser.email}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-500 hover:text-rose-600 transition"
                title={isAr ? 'تسجيل الخروج' : 'Sign out'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              disabled={isAuthenticating}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-900 rounded-xs font-bold text-xs flex items-center gap-2 shadow-xs transition active:translate-y-0.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isAuthenticating ? (isAr ? 'جاري الاتصال...' : 'Connecting...') : (isAr ? 'تسجيل الدخول بـ Google' : 'Sign in with Google')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div className={`p-3.5 border-geometric rounded-xs text-xs font-bold flex items-center justify-between gap-3 ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-600' :
          statusMessage.type === 'error' ? 'bg-rose-50 text-rose-900 border-rose-600' :
          'bg-indigo-50 text-indigo-900 border-indigo-600'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
             statusMessage.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> :
             <Sparkles className="w-4 h-4 text-indigo-600" />}
            <span>{statusMessage.text}</span>
          </div>
          <button 
            onClick={() => setStatusMessage(null)} 
            className="text-slate-400 hover:text-slate-700 text-sm font-mono font-normal"
          >
            ✕
          </button>
        </div>
      )}

      {/* Services Active Badge Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        {[
          { id: 'drive', label: 'Google Drive', desc: isAr ? 'الأرشفة والملفات' : 'Files & Storage', icon: <HardDrive className="w-4 h-4 text-amber-600" /> },
          { id: 'sheets', label: 'Google Sheets', desc: isAr ? 'الجداول والقواعد' : 'Databases & Sync', icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> },
          { id: 'docs', label: 'Google Docs', desc: isAr ? 'التقارير والمحاضر' : 'Official Reports', icon: <FileText className="w-4 h-4 text-indigo-600" /> },
          { id: 'forms', label: 'Google Forms', desc: isAr ? 'بلاغات الفروع' : 'Incident Forms', icon: <FormInput className="w-4 h-4 text-purple-600" /> },
          { id: 'slides', label: 'Google Slides', desc: isAr ? 'العروض التنفيذية' : 'KPI Presentations', icon: <Presentation className="w-4 h-4 text-orange-600" /> },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as WorkspaceTab)}
            className={`p-3 border-geometric rounded-xs text-right transition flex flex-col justify-between ${
              activeTab === item.id 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'bg-white hover:bg-slate-50 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              {item.icon}
              <span className={`w-2 h-2 rounded-full ${hasToken ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            </div>
            <div className="mt-2">
              <div className="font-black text-xs">{item.label}</div>
              <div className={`text-[10px] ${activeTab === item.id ? 'text-slate-300' : 'text-slate-500'}`}>{item.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* TAB 1: GOOGLE DRIVE VIEW */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === 'drive' && (
        <section className="bg-white border-geometric rounded-xs p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-600" />
                <span>{isAr ? 'مستعرض ومستودع Google Drive السحابي' : 'Google Drive Cloud Explorer'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr ? 'تصفح وإدارة ملفات ومجلدات النظام والنسخ الاحتياطية مباشرة على حساب Google Drive الخاص بك.' : 'Browse and manage your cloud CMMS backups and documents directly on Drive.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBackupToDrive}
                disabled={!hasToken || isLoading}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 border-geometric rounded-xs text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5 text-teal-600" />
                <span>{isAr ? 'حفظ نسخة كاملة للـ CMMS' : 'Upload Full Backup'}</span>
              </button>
              <button
                onClick={handleCreateDriveFolder}
                disabled={!hasToken || isLoading}
                className="px-3.5 py-1.5 accent-teal text-white rounded-xs text-xs font-bold flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إنشاء مجلد جديد' : 'New Folder'}</span>
              </button>
            </div>
          </div>

          {/* Drive Search & Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex-1 min-w-[200px] relative">
              <input 
                type="text"
                placeholder={isAr ? 'بحث في ملفات Google Drive...' : 'Search Google Drive files...'}
                value={driveSearch}
                onChange={e => setDriveSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadDriveFiles()}
                className="w-full px-3 py-1.5 pr-8 border-geometric rounded-xs text-xs bg-slate-50 focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <select
              value={driveFilter}
              onChange={e => setDriveFilter(e.target.value)}
              className="px-3 py-1.5 border-geometric rounded-xs text-xs bg-slate-50 font-bold text-slate-700"
            >
              <option value="">{isAr ? 'كافة أنواع الملفات' : 'All File Types'}</option>
              <option value="application/vnd.google-apps.spreadsheet">Google Sheets (جداول)</option>
              <option value="application/vnd.google-apps.document">Google Docs (مستندات)</option>
              <option value="application/vnd.google-apps.form">Google Forms (نماذج)</option>
              <option value="application/vnd.google-apps.presentation">Google Slides (عروض)</option>
              <option value="application/vnd.google-apps.folder">Google Folders (مجلدات)</option>
              <option value="application/json">JSON (نسخ احتياطية)</option>
            </select>

            <button
              onClick={loadDriveFiles}
              disabled={!hasToken || isRefreshingDrive}
              className="px-3 py-1.5 border-geometric bg-white hover:bg-slate-100 rounded-xs text-xs font-bold text-slate-800 flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingDrive ? 'animate-spin' : ''}`} />
              <span>{isAr ? 'تحديث' : 'Refresh'}</span>
            </button>
          </div>

          {/* Files List Table */}
          {!hasToken ? (
            <div className="p-8 text-center bg-slate-50 border-geometric rounded-xs space-y-3">
              <HardDrive className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">
                {isAr ? 'يرجى تسجيل الدخول بحساب Google لعرض ملفات Google Drive' : 'Please sign in with Google to view your Drive files'}
              </div>
              <button
                onClick={handleLogin}
                className="px-4 py-2 accent-teal text-white text-xs font-bold rounded-xs shadow-xs"
              >
                {isAr ? 'تسجيل الدخول الآن' : 'Sign in Now'}
              </button>
            </div>
          ) : driveFiles.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border-geometric rounded-xs text-slate-500 text-xs">
              {isRefreshingDrive ? (isAr ? 'جاري فحص وتحديث قائمة الملفات...' : 'Loading files...') : (isAr ? 'لم يتم العثور على ملفات تطابق البحث.' : 'No files found.')}
            </div>
          ) : (
            <div className="border-geometric rounded-xs overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">{isAr ? 'اسم الملف' : 'File Name'}</th>
                    <th className="px-4 py-2.5">{isAr ? 'النوع' : 'Type'}</th>
                    <th className="px-4 py-2.5">{isAr ? 'تاريخ التعديل' : 'Modified'}</th>
                    <th className="px-4 py-2.5 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {driveFiles.map(file => {
                    const isSheet = file.mimeType?.includes('spreadsheet');
                    const isDoc = file.mimeType?.includes('document');
                    const isForm = file.mimeType?.includes('form');
                    const isSlide = file.mimeType?.includes('presentation');
                    const isFolder = file.mimeType?.includes('folder');

                    return (
                      <tr key={file.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-bold text-slate-900 flex items-center gap-2">
                          {isSheet ? <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" /> :
                           isDoc ? <FileText className="w-4 h-4 text-indigo-600 shrink-0" /> :
                           isForm ? <FormInput className="w-4 h-4 text-purple-600 shrink-0" /> :
                           isSlide ? <Presentation className="w-4 h-4 text-orange-600 shrink-0" /> :
                           isFolder ? <FolderGit2 className="w-4 h-4 text-amber-600 shrink-0" /> :
                           <FileCode className="w-4 h-4 text-slate-600 shrink-0" />}
                          <span className="truncate max-w-[280px]" title={file.name}>{file.name}</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">
                          {isSheet ? 'Google Sheets' :
                           isDoc ? 'Google Docs' :
                           isForm ? 'Google Forms' :
                           isSlide ? 'Google Slides' :
                           isFolder ? 'مجلد Folder' : 'ملف عادي'}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-600 text-[11px]">
                          {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('ar-EG') : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-center flex items-center justify-center gap-2">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xs text-[11px] flex items-center gap-1"
                              title={isAr ? 'فتح في نافذة جديدة' : 'Open in new tab'}
                            >
                              <span>فتح</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            onClick={() => setDeleteConfirmModal({ isOpen: true, fileId: file.id, fileName: file.name })}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title={isAr ? 'حذف من Drive' : 'Delete file'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* TAB 2: GOOGLE SHEETS VIEW */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === 'sheets' && (
        <section className="bg-white border-geometric rounded-xs p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'مركز تكامل Google Sheets API وقاعدة البيانات المركزية' : 'Google Sheets API Integration'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr ? 'إنشاء، مزامنة، واستعلام شيت البيانات ذو الـ 7 أوراق رئيسية مباشرة من حسابك في Google.' : 'Create, sync, and inspect the master 7-tab CMMS spreadsheet on Google Sheets.'}
              </p>
            </div>

            <button
              onClick={handleCreateMasterSheet}
              disabled={!hasToken || isLoading}
              className="px-4 py-2 accent-teal text-white text-xs font-bold rounded-xs flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'إنشاء قاعدة بيانات Sheets جديدة في حسابي' : 'Create Master Sheet in My Drive'}</span>
            </button>
          </div>

          {/* Current Connected Sheet Status */}
          <div className="p-4 bg-slate-50 border-geometric rounded-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">معرف الشيت النشط (Active Spreadsheet ID):</span>
              {createdSheetInfo?.url && (
                <a
                  href={createdSheetInfo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-700 hover:underline text-xs font-bold flex items-center gap-1"
                >
                  <span>{isAr ? 'فتح الشيت في Google Sheets' : 'Open in Google Sheets'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <input 
                type="text"
                value={createdSheetInfo?.id || settings.integrations.spreadsheetId}
                onChange={e => {
                  setCreatedSheetInfo({
                    id: e.target.value,
                    url: `https://docs.google.com/spreadsheets/d/${e.target.value}/edit`
                  });
                  updateIntegrations({
                    spreadsheetId: e.target.value,
                    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${e.target.value}/edit`
                  });
                }}
                className="flex-1 px-3 py-2 border-geometric rounded-xs text-xs font-mono bg-white text-slate-900"
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              الأوراق المدعومة: <span className="font-mono font-bold text-slate-700">WoHeaders, Visits, Locations, Technicians, Assets, Inventory, AI_Log</span>
            </p>
          </div>

          {/* Live Range Inspector */}
          <div className="p-4 bg-slate-50 border-geometric rounded-xs space-y-3">
            <h4 className="font-black text-xs text-slate-900 flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-teal-700" />
              <span>{isAr ? 'فاحص النطاق المباشر (Google Sheets Range Inspector)' : 'Live Sheet Range Inspector'}</span>
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <input 
                type="text"
                value={sheetInspectRange}
                onChange={e => setSheetInspectRange(e.target.value)}
                placeholder="WoHeaders!A1:N5"
                className="flex-1 min-w-[180px] px-3 py-1.5 border-geometric rounded-xs text-xs font-mono bg-white"
              />
              <button
                onClick={handleInspectSheet}
                disabled={!hasToken || isInspectingSheet}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-xs text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isInspectingSheet ? 'animate-spin' : ''}`} />
                <span>{isAr ? 'استعلام مباشر' : 'Query Range'}</span>
              </button>
            </div>

            {sheetInspectData && (
              <div className="border-geometric rounded-xs bg-white overflow-x-auto max-h-60 mt-3">
                <table className="w-full text-right text-xs">
                  <tbody className="divide-y divide-slate-200">
                    {sheetInspectData.map((row, i) => (
                      <tr key={i} className={i === 0 ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'}>
                        {row.map((cell: any, j: number) => (
                          <td key={j} className="px-3 py-1.5 border-r border-slate-200 font-mono text-[11px] whitespace-nowrap">
                            {String(cell || '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* TAB 3: GOOGLE DOCS VIEW */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === 'docs' && (
        <section className="bg-white border-geometric rounded-xs p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? 'توليد التقارير والمحاضر المعتمدة عبر Google Docs API' : 'Google Docs Report Generator'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr ? 'إنشاء مستندات Google Docs رسمية لأوامر الشغل وتقارير المعاينة الفنية بضغطة زر واحدة.' : 'Generate official styled inspection documents in Google Docs directly from work orders.'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-geometric rounded-xs space-y-4">
            <h4 className="font-black text-xs text-slate-900">
              {isAr ? 'اختر أمر الشغل لتوليد التقرير الفني المعتمد:' : 'Select Work Order to Generate Report:'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <select
                  value={selectedWoForDoc}
                  onChange={e => setSelectedWoForDoc(e.target.value)}
                  className="w-full px-3 py-2 border-geometric rounded-xs text-xs font-bold bg-white"
                >
                  {workOrdersList.map(wo => (
                    <option key={wo.wo_id} value={wo.wo_id}>
                      {wo.wo_id} - {wo.location_name} ({wo.category}) - {wo.severity}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerateReportDoc}
                disabled={!hasToken || isLoading}
                className="px-4 py-2 accent-teal text-white rounded-xs text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                <span>{isAr ? 'توليد مستند Google Doc' : 'Generate Google Doc'}</span>
              </button>
            </div>

            {createdDocInfo && (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-600 rounded-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-xs text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>تم إنشاء المستند بنجاح: {createdDocInfo.title}</span>
                  </div>
                  <a
                    href={createdDocInfo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xs flex items-center gap-1 shadow-xs"
                  >
                    <span>فتح المستند في Google Docs</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="text-[11px] font-mono text-emerald-800">
                  Document ID: {createdDocInfo.id}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* TAB 4: GOOGLE FORMS VIEW */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === 'forms' && (
        <section className="bg-white border-geometric rounded-xs p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <FormInput className="w-4 h-4 text-purple-600" />
                <span>{isAr ? 'نماذج الإبلاغ الميداني عبر Google Forms API' : 'Google Forms Field Incident Integration'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr ? 'نشر استبيانات ونماذج إبلاغ فورية لمديري الفروع والمشغلين مع إمكانية استيراد الاستجابات آلياً.' : 'Deploy Google Forms for branch staff to report issues and pull responses directly into CMMS.'}
              </p>
            </div>

            <button
              onClick={handleCreateIncidentForm}
              disabled={!hasToken || isLoading}
              className="px-4 py-2 accent-teal text-white text-xs font-bold rounded-xs flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'نشر وتوليد نموذج بلاغات جديد' : 'Deploy New Google Form'}</span>
            </button>
          </div>

          {createdFormInfo ? (
            <div className="p-4 bg-purple-50 border-2 border-purple-600 rounded-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-black text-xs text-purple-900">
                  {isAr ? 'النموذج جاهز ومفعل لاستقبال بلاغات الفروع:' : 'Form is live and ready for branch submissions:'}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={createdFormInfo.responderUri}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xs flex items-center gap-1"
                  >
                    <span>رابط التعبئة (للفروع)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={createdFormInfo.editUri}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white border-geometric text-purple-900 font-bold text-xs rounded-xs flex items-center gap-1"
                  >
                    <span>تعديل الأسئلة</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-purple-200">
                <button
                  onClick={handleFetchFormResponses}
                  disabled={!hasToken || isLoading}
                  className="px-3.5 py-1.5 bg-purple-900 text-white rounded-xs text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'فحص واستيراد الردود الجديدة' : 'Fetch Responses'}</span>
                </button>
                <span className="text-xs text-purple-800">
                  {formResponses.length} {isAr ? 'استجابة مستلمة' : 'responses received'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-slate-50 border-geometric rounded-xs text-slate-600 text-xs space-y-2">
              <div>{isAr ? 'انقر على "نشر وتوليد نموذج بلاغات جديد" لإنشاء نموذج Google Forms مرتبط بقائمة فروع ومعدات سيدره.' : 'Click "Deploy New Google Form" to generate a live incident form.'}</div>
            </div>
          )}
        </section>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* TAB 5: GOOGLE SLIDES VIEW */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === 'slides' && (
        <section className="bg-white border-geometric rounded-xs p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Presentation className="w-4 h-4 text-orange-600" />
                <span>{isAr ? 'العروض التقديمية والتقارير التنفيذية عبر Google Slides API' : 'Executive Google Slides Presentations'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr ? 'توليد عروض تقديمية آلية لمجلس الإدارة ومؤشرات الأداء التشغيلي (KPIs) وجاهزية الماكينات.' : 'Generate executive monthly maintenance presentation slide decks directly in Google Slides.'}
              </p>
            </div>

            <button
              onClick={handleGenerateKPISlides}
              disabled={!hasToken || isLoading}
              className="px-4 py-2 accent-teal text-white text-xs font-bold rounded-xs flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>{isAr ? 'توليد العرض التنفيذي الشهري' : 'Generate Monthly KPI Deck'}</span>
            </button>
          </div>

          {createdSlideInfo ? (
            <div className="p-4 bg-orange-50 border-2 border-orange-600 rounded-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-black text-xs text-orange-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  <span>تم توليد العرض التقديمي في حسابك بنجاح!</span>
                </div>
                <a
                  href={createdSlideInfo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs rounded-xs flex items-center gap-1 shadow-xs"
                >
                  <span>فتح العرض في Google Slides</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="text-[11px] font-mono text-orange-800">
                Presentation ID: {createdSlideInfo.id}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-slate-50 border-geometric rounded-xs text-slate-600 text-xs">
              {isAr ? 'اضغط على زر "توليد العرض التنفيذي الشهري" لإنشاء شرائح Google Slides بمؤشرات الـ MTTR ومعدلات الإنجاز وتكاليف الصيانة.' : 'Click "Generate Monthly KPI Deck" to create executive slides with current maintenance performance statistics.'}
            </div>
          )}
        </section>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* DESTRUCTIVE CONFIRMATION MODAL (MANDATORY REQUIREMENT) */}
      {/* -------------------------------------------------------------------- */}
      {deleteConfirmModal?.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border-2 border-rose-600 rounded-xs p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-rose-700 font-black text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>{isAr ? 'تأكيد حذف الملف من Google Drive' : 'Confirm File Deletion'}</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {isAr 
                ? `هل أنت متأكد من رغبتك في حذف الملف "${deleteConfirmModal.fileName}" نهائياً من حساب Google Drive الخاص بك؟ هذا الإجراء لا يمكن التراجع عنه.`
                : `Are you sure you want to permanently delete "${deleteConfirmModal.fileName}" from your Google Drive? This action cannot be undone.`}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className="px-3.5 py-1.5 border-geometric rounded-xs text-xs font-bold text-slate-700 bg-white hover:bg-slate-100"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={confirmDeleteFile}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xs text-xs font-bold shadow-xs"
              >
                {isAr ? 'تأكيد الحذف' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
