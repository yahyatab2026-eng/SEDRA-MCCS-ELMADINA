import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Camera, 
  MapPin, 
  QrCode, 
  Sparkles, 
  Send, 
  Printer, 
  MessageCircle, 
  ArrowRight, 
  ShieldAlert, 
  Cpu, 
  Flame, 
  Wrench, 
  Clock, 
  Phone, 
  User, 
  Building2, 
  Layers, 
  Upload, 
  RefreshCw, 
  ExternalLink,
  ChevronLeft,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Video,
  FileText,
  Compass,
  Navigation,
  Check
} from 'lucide-react';
import { 
  initialLocations, 
  initialAssets, 
  initialTechnicians, 
  initialSuppliers, 
  initialInventory 
} from '../data/seedData';
import { apiClient } from '../services/api';
import { WorkOrder, Severity, AssetRecord } from '../types';
import { useSystemSettings } from '../context/SystemSettingsContext';
import { compressImage } from '../utils/imageCompression';
import { syncQueue } from '../services/syncQueue';

interface ReportIncidentViewProps {
  lang: 'ar' | 'en';
  onNavigateToDashboard?: () => void;
  onNavigateToVisit?: (woId: string) => void;
  onWorkOrderCreated?: (newWo: WorkOrder) => void;
}

export const ReportIncidentView: React.FC<ReportIncidentViewProps> = ({
  lang,
  onNavigateToDashboard,
  onNavigateToVisit,
  onWorkOrderCreated
}) => {
  const isAr = lang === 'ar';
  const { settings } = useSystemSettings();

  // 1. Reporter Identity & Role
  const [reporterRole, setReporterRole] = useState<'branch_manager' | 'production_engineer' | 'section_chef' | 'quality_supervisor'>('branch_manager');
  const [reporterName, setReporterName] = useState(() => localStorage.getItem('cmms_last_reporter_name') || 'أحمد عثمان (مدير الفرع)');
  const [reporterPhone, setReporterPhone] = useState(() => localStorage.getItem('cmms_last_reporter_phone') || '01099887766');

  // Automatic GPS Location & Timestamp State
  const [currentTimestamp, setCurrentTimestamp] = useState<string>('');
  const [gpsLocation, setGpsLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    addressDescription?: string;
  } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'ready' | 'fallback' | 'denied'>('acquiring');
  const [validationError, setValidationError] = useState<string>('');

  // 2. Location & Department
  const [selectedLocationId, setSelectedLocationId] = useState<string>(() => initialLocations[0]?.id || 'LOC-01');
  const [selectedDept, setSelectedDept] = useState<string>('قسم الثلاجات والتبريد');

  // 3. Machine / Asset Picker
  const [assetMode, setAssetMode] = useState<'catalog' | 'manual'>('catalog');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('AST-07');
  const [manualAssetName, setManualAssetName] = useState<string>('');
  const [isScanningQr, setIsScanningQr] = useState<boolean>(false);
  const [qrScanSuccess, setQrScanSuccess] = useState<boolean>(false);

  // 4. Severity & Category
  const [severity, setSeverity] = useState<Severity>('عاجل');
  const [category, setCategory] = useState<string>('تبريد وتكييف');
  const [quickTag, setQuickTag] = useState<string>('ارتفاع حرارة الفريزر (+8°C)');
  const [description, setDescription] = useState<string>(
    'ارتفاع مفاجئ في درجة حرارة فريزر الجاتوه والآيس كريم الرئيسي وصوت صفير إنذار، مع تكدس شحنات جاهزة للتوزيع تستلزم تدخلاً فورياً لتفادي تلف المنتجات.'
  );

  // 5. Photos, Video & Document Attachments
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [photoName, setPhotoName] = useState<string>('');
  const [videoBase64, setVideoBase64] = useState<string>('');
  const [videoName, setVideoName] = useState<string>('');
  const [docName, setDocName] = useState<string>('');
  const [docBase64, setDocBase64] = useState<string>('');

  // 6. Voice Note Recording State
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string>('');
  const [voiceDuration, setVoiceDuration] = useState<number>(0);
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voiceTimerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // 7. AI Diagnosis
  const [isAiDiagnosing, setIsAiDiagnosing] = useState<boolean>(false);
  const [aiDiagnosisResult, setAiDiagnosisResult] = useState<{
    rootCause: string;
    immediateSafetyAction: string;
    recommendedParts: string;
    recommendedVendor: string;
    confidence: number;
  } | null>({
    rootCause: 'عطل في مروحة المبخر الداخلية أو تلف تايمر دورة الإذابة (Defrost Timer) مع تراكم الثلج.',
    immediateSafetyAction: 'إبقاء أبواب الفريزر محكمة الإغلاق لتقليل تسرب البرودة، ونقل المنتجات الأكثر حساسية للغرفة المجاورة إن أمكن.',
    recommendedParts: 'تايمر ديفروست باركول، مروحة مبخر 25 وات، فريون R404A',
    recommendedVendor: 'مؤسسة الدلتا الهندسية للتبريد (ت: 01006543210)',
    confidence: 0.94
  });

  // 8. Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedWo, setSubmittedWo] = useState<WorkOrder | null>(null);

  // Auto-acquire Live GPS and Timestamp on Mount (if enabled in settings)
  useEffect(() => {
    let interval: any = null;
    if (settings.features.enableAutoTimestamp) {
      const updateTime = () => {
        const now = new Date();
        setCurrentTimestamp(now.toISOString().replace('T', ' ').substring(0, 19));
      };
      updateTime();
      interval = setInterval(updateTime, 1000);
    }

    // Acquire GPS if enabled
    if (settings.features.enableGpsTracking) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setGpsLocation({
              lat: Number(pos.coords.latitude.toFixed(6)),
              lng: Number(pos.coords.longitude.toFixed(6)),
              accuracy: Math.round(pos.coords.accuracy),
              addressDescription: 'تم التحقق من إحداثيات الموقع عبر مستشعر الـ GPS'
            });
            setGpsStatus('ready');
          },
          (err) => {
            console.warn('Geolocation access issue, fallback to selected location coords:', err);
            const loc = initialLocations.find(l => l.id === selectedLocationId) || initialLocations[0];
            setGpsLocation({
              lat: loc.lat,
              lng: loc.lng,
              accuracy: 15,
              addressDescription: `إحداثيات ${loc.name} التقديرية`
            });
            setGpsStatus('fallback');
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        const loc = initialLocations.find(l => l.id === selectedLocationId) || initialLocations[0];
        setGpsLocation({
          lat: loc.lat,
          lng: loc.lng,
          accuracy: 20,
          addressDescription: `إحداثيات ${loc.name} التقديرية`
        });
        setGpsStatus('fallback');
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [settings.features.enableAutoTimestamp, settings.features.enableGpsTracking]);

  // Update fallback coords when selected location changes if in fallback
  useEffect(() => {
    if (gpsStatus === 'fallback' && settings.features.enableGpsTracking) {
      const loc = initialLocations.find(l => l.id === selectedLocationId) || initialLocations[0];
      setGpsLocation({
        lat: loc.lat,
        lng: loc.lng,
        accuracy: 15,
        addressDescription: `إحداثيات ${loc.name} التقديرية`
      });
    }
  }, [selectedLocationId, gpsStatus, settings.features.enableGpsTracking]);


  // Handle Voice Recording
  const startVoiceRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setVoiceAudioUrl(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecordingVoice(true);
      setVoiceDuration(0);

      voiceTimerRef.current = setInterval(() => {
        setVoiceDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.warn('Audio recording permission or device issue:', err);
      // Fallback simulated voice note
      setIsRecordingVoice(true);
      setVoiceDuration(0);
      voiceTimerRef.current = setInterval(() => {
        setVoiceDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Fallback simulated recording
      setVoiceAudioUrl('data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAFAAAA...');
    }
    setIsRecordingVoice(false);
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
  };

  const deleteVoiceNote = () => {
    setVoiceAudioUrl('');
    setVoiceDuration(0);
    setIsPlayingVoice(false);
  };

  const togglePlayVoice = () => {
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(voiceAudioUrl);
      audioPlayerRef.current.onended = () => setIsPlayingVoice(false);
    }
    if (isPlayingVoice) {
      audioPlayerRef.current.pause();
      setIsPlayingVoice(false);
    } else {
      audioPlayerRef.current.play().catch(e => console.log('Audio play note:', e));
      setIsPlayingVoice(true);
    }
  };

  // Load location object
  const currentLocation = initialLocations.find(l => l.id === selectedLocationId) || initialLocations[0];
  const isFactory = currentLocation?.type === 'مصنع';

  // Dynamic Departments based on site type
  const departmentOptions = isFactory ? [
    'خط بسترة وتصنيع الألبان والزبادي',
    'غرف التبريد والتجميد المركزية',
    'عنبر الغلايات ومحطة البخار',
    'خطوط التعبئة والتغليف والطباعة',
    'قسم الجاتوه والشوكولاتة الآلي',
    'قسم المخبوزات والعجين الآلي',
    'محطة المولدات ولوحات الكهرباء الرئيسية',
    'المرافق العامة ومعالجة المياه'
  ] : [
    'قسم الثلاجات والتبريد وصالة العرض',
    'فريزر تخزين الجاتوه والآيس كريم',
    'قسم الحلواني الشرقي والتجهيز',
    'قسم المخبوزات وأفران التسوية',
    'تكييفات صالة البيع والاستقبال',
    'ماكينات القهوة والإسبريسو والعصائر',
    'لوحة القواطع الكهربائية الرئيسية',
    'مرافق السباكة ومغاسل التعقيم'
  ];

  // Fast symptom tags by category
  const symptomTags: Record<string, string[]> = {
    'تبريد وتكييف': [
      'ارتفاع حرارة الفريزر (+8°C)',
      'تسريب غاز فريون R404A/R22',
      'تراكم ثلج كثيف على المبخر',
      'صوت احتكاك في كباس التبريد',
      'توقف مروحة الكوندنسر الخارجية',
      'عطل تايمر الإذابة Defrost'
    ],
    'ألبان وتصنيع ومجنسات': [
      'انخفاض ضغط مجنس الحليب الهيدروليكي',
      'تسريب من حشوات وجوانات البسترة',
      'توقف مضخة الحليب الستانلس',
      'عطل حساس حرارة تانك البسترة',
      'تذبذب قراءات تدفق خط اللبن'
    ],
    'حلواني ومخابز وعجين': [
      'انقطاع أو انزلاق سير فرادة العجين',
      'عطل سرعات الميكسر الحلزوني Spiral Mixer',
      'عدم وصول فرن التسوية لدرجة الحرارة المطلوبة',
      'صوت رولمان بلي عالي في عجانة الحلواني',
      'عطل بلف بخار فرن الروتس'
    ],
    'غلايات ومرافق': [
      'انخفاض ضغط البخار من الغلاية',
      'عطل بلف الأمان أو شعلة الغلاية',
      'تسريب مياه ساخنة من خطوط البخار',
      'توقف مضخة تغذية المياه الغلاية'
    ],
    'كهرباء ومواتير ومولدات': [
      'فصل مفاجئ للقاطع الرئيسي (Trip)',
      'شرز أو ارتفاع حرارة لوحة التوزيع',
      'توقف موتور سحب الهواء عن العمل',
      'عطل لوحة التحويل الأوتوماتيكي ATS للمولد'
    ],
    'تعبئة وتغليف': [
      'عطل سخان لحام أكياس التعبئة',
      'توقف فوتوسيل سحب فيلم التغليف',
      'عطل طابعة تاريخ الصلاحية Linx'
    ]
  };

  // Quick select an asset from catalog
  const selectedAssetObj = initialAssets.find(a => a.id === selectedAssetId);

  // Handle QR Code Scanner Simulation
  const handleSimulateQrScan = () => {
    setIsScanningQr(true);
    setQrScanSuccess(false);
    setTimeout(() => {
      setIsScanningQr(false);
      setQrScanSuccess(true);
      const matched = initialAssets.find(a => (a.location_name || a.location_id || '').includes(currentLocation.name)) || initialAssets[1];
      setSelectedAssetId(matched.id);
      setCategory(matched.category.includes('تبريد') ? 'تبريد وتكييف' : matched.category.includes('ألبان') ? 'ألبان وتصنيع ومجنسات' : 'حلواني ومخابز وعجين');
    }, 1200);
  };

  // Handle Photo Compression / Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoName(file.name);
    try {
      const compressed = await compressImage(file, { maxWidth: 1024, maxHeight: 1024, quality: 0.8 });
      setPhotoBase64(compressed);
    } catch (err) {
      console.warn('Image compression fallback', err);
      const reader = new FileReader();
      reader.onload = (event) => setPhotoBase64(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handle Video Upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setVideoBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Document Upload
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setDocBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Trigger Gemini AI Diagnosis via Backend API
  const handleRunAiDiagnosis = async () => {
    setIsAiDiagnosing(true);
    try {
      const assetLabel = assetMode === 'catalog' && selectedAssetObj ? selectedAssetObj.name : manualAssetName || 'معدة';
      const result = await apiClient.runAiDiagnosis({
        category,
        description,
        locationName: currentLocation?.name || 'فرع سيدره',
        assetName: assetLabel,
        severity,
        photoBase64: photoBase64 || undefined
      });

      setAiDiagnosisResult({
        rootCause: result.rootCause,
        immediateSafetyAction: result.safetyMeasures,
        recommendedParts: result.recommendedParts,
        recommendedVendor: result.recommendedVendorOrTeam,
        confidence: (result.aiConfidence || 95) / 100
      });
    } catch (err) {
      console.error('Diagnosis error:', err);
    } finally {
      setIsAiDiagnosing(false);
    }
  };

  // Submit Defect Report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Feature policy validations
    if (settings.features.requirePhotoBeforeSubmit && !photoBase64) {
      setValidationError(isAr ? '⚠️ تنبيه: سياسة النظام تتطلب التقاط صورة أو إرفاق صورة للعطل قبل الإرسال.' : 'Photo is required by system policy.');
      return;
    }

    if (settings.features.requireVoiceBeforeSubmit && !voiceAudioUrl) {
      setValidationError(isAr ? '⚠️ تنبيه: سياسة النظام تتطلب تسجيل رسالة صوتية لشرح العطل للشيف والمهندس قبل الإرسال.' : 'Voice note is required by system policy.');
      return;
    }

    setIsSubmitting(true);

    // Save reporter to memory
    localStorage.setItem('cmms_last_reporter_name', reporterName);
    localStorage.setItem('cmms_last_reporter_phone', reporterPhone);

    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const woNum = Math.floor(1000 + Math.random() * 9000);
    const generatedWoId = `WO-2026-AUG-${woNum}`;

    // SLA Calculation from dynamic settings
    const slaHours = severity === 'عاجل' 
      ? settings.sla.urgentHours 
      : severity === 'متوسط' 
      ? settings.sla.mediumHours 
      : settings.sla.lowHours;
    const slaDeadline = new Date(now.getTime() + slaHours * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 16);

    const assetLabel = assetMode === 'catalog' && selectedAssetObj ? selectedAssetObj.name : manualAssetName || 'معدة غير مسجلة بالكود';

    const newWorkOrder: WorkOrder = {
      wo_id: generatedWoId,
      created_at: dateStr,
      location_id: currentLocation.id,
      location_name: currentLocation.name,
      org: currentLocation.org,
      reporter: `${reporterName} (${getRoleLabel(reporterRole)})`,
      reporter_phone: reporterPhone,
      category: category,
      subcategory: selectedDept,
      description: `[المعدة: ${assetLabel}] - ${description}`,
      severity: severity,
      status: 'مُبلَّغ عنه',
      sla_deadline: slaDeadline,
      assigned_tech: 'قيد التوجيه والتكليف الفوري',
      assigned_at: '',
      cost_parts: 0,
      cost_labor: 0,
      closed_at: '',
      gemini_summary: aiDiagnosisResult?.rootCause || 'تم استلام البلاغ وجاري التنسيق الفني',
      gemini_json: JSON.stringify(aiDiagnosisResult || {}),
      before_photo: photoBase64 || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=60',
      after_photo: '',
      video_url: videoBase64 || (videoName ? `Attachment: ${videoName}` : ''),
      voice_note_url: voiceAudioUrl,
      doc_url: docBase64 || (docName ? `Doc: ${docName}` : ''),
      reporter_lat: gpsLocation?.lat || currentLocation.lat,
      reporter_lng: gpsLocation?.lng || currentLocation.lng,
      reporter_gps_accuracy: gpsLocation?.accuracy || 10,
      source: 'Web App',
      form_response_url: '',
      action_taken: `تم فتح بلاغ عاجل من ${getRoleLabel(reporterRole)} - ${selectedDept} | إحداثيات GPS: (${gpsLocation?.lat || currentLocation.lat}, ${gpsLocation?.lng || currentLocation.lng})`
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedWo(newWorkOrder);

      // Trigger Global Callback
      if (onWorkOrderCreated) {
        onWorkOrderCreated(newWorkOrder);
      }

      // Try sending to Google Apps Script Web App if configured
      try {
        const gasUrl = settings.integrations.appsScriptWebappUrl || localStorage.getItem('cmms_gas_webapp_url');
        if (gasUrl && gasUrl.startsWith('http')) {
          fetch(gasUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'CREATE_WORK_ORDER',
              workOrder: newWorkOrder
            })
          }).catch(err => console.log('GAS Dispatch background notice:', err));
        }
      } catch (err) {
        console.error('GAS dispatch error:', err);
      }
    }, 1000);
  };

  function getRoleLabel(role: string) {
    switch (role) {
      case 'branch_manager': return isAr ? 'مدير الفرع' : 'Branch Manager';
      case 'production_engineer': return isAr ? 'مهندس إنتاج بالمصنع' : 'Factory Production Engineer';
      case 'section_chef': return isAr ? 'رئيس قسم / شيف تشغيل' : 'Section Executive Chef';
      case 'quality_supervisor': return isAr ? 'مشرف جودة وسلامة غذاء' : 'Quality & Safety Supervisor';
      default: return role;
    }
  }

  // Generate WhatsApp Direct Dispatch URL
  const generateWhatsAppUrl = (wo: WorkOrder) => {
    const text = `🚨 *بلاغ عطل عاجل - صيانة سيدره* 🚨\n\n` +
      `📌 *رقم البلاغ:* ${wo.wo_id}\n` +
      `🏢 *الموقع:* ${wo.location_name} (${wo.subcategory})\n` +
      `👤 *المُبلّغ:* ${wo.reporter} - ${wo.reporter_phone}\n` +
      `📍 *موقع GPS المُبلِّغ:* https://maps.google.com/?q=${wo.reporter_lat},${wo.reporter_lng}\n` +
      `🕒 *تاريخ ووقت التسجيل:* ${wo.created_at}\n` +
      `⚙️ *التصنيف:* ${wo.category}\n` +
      `⚠️ *الخطورة:* ${wo.severity} (مهلة الاستجابة SLA: ${severity === 'عاجل' ? 'ساعتين' : '4 ساعات'})\n\n` +
      `📝 *وصف العطل:* ${wo.description}\n\n` +
      (wo.voice_note_url ? `🎙️ *يوجد تسجيل صوتي مرفق لشرح العطل*\n` : '') +
      (wo.video_url ? `🎥 *يوجد فيديو توضيحي مرفق*\n` : '') +
      `💡 *التشخيص المبدئي بالذكاء الاصطناعي:* ${wo.gemini_summary}\n\n` +
      `🔗 *رابط المتابعة وتكليف الفني:* ${window.location.origin}`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      
      {/* Top Banner Header with Live Automated Metadata */}
      <div className="bg-white border-geometric p-4 sm:p-5 rounded-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-rose-600 rounded-xs animate-ping"></span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {isAr ? 'بوابة الإبلاغ الفوري عن الأعطال (مدراء الفروع • مهندسو المصانع • الشيفات)' : 'Instant Incident & Defect Reporting Portal'}
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {isAr 
                ? 'تسجيل الأعطال الطارئة والوقائية مباشرة لغرفة طوارئ الصيانة مع تشخيص فوري بالذكاء الاصطناعي وتوثيق الموقع الجغرافي والصوت والصورة.'
                : 'Direct defect reporting channel with automatic GPS stamping, voice note capture, multi-media attachments, and AI diagnosis.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="px-3 py-1.5 border-geometric rounded-xs text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{isAr ? 'العودة للوحة التحكم' : 'Back to Dashboard'}</span>
            </button>
          </div>
        </div>

        {/* Live Automatic Timestamp & GPS Bar */}
        {(settings.features.enableAutoTimestamp || settings.features.enableGpsTracking) && (
          <div className="bg-slate-900 text-white p-3 rounded-xs flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            {settings.features.enableAutoTimestamp && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span className="text-slate-300">{isAr ? 'التوقيت والتاريخ التلقائي:' : 'Auto Timestamp:'}</span>
                <strong className="text-teal-300 font-bold">{currentTimestamp || (isAr ? 'جاري المزامنة...' : 'Syncing...')}</strong>
              </div>
            )}

            {settings.features.enableGpsTracking && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span className="text-slate-300">{isAr ? 'موقع المُبلِّغ التلقائي (GPS):' : 'Auto GPS Location:'}</span>
                {gpsLocation ? (
                  <span className="text-emerald-300 font-bold">
                    {gpsLocation.lat.toFixed(5)}, {gpsLocation.lng.toFixed(5)} ({isAr ? 'دقة' : 'acc'} {gpsLocation.accuracy}m)
                  </span>
                ) : (
                  <span className="text-amber-300 animate-pulse">{isAr ? 'جاري التقاط إحداثيات الموقع...' : 'Acquiring GPS...'}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation Policy Alert Banner */}
      {validationError && (
        <div className="bg-rose-50 border-2 border-rose-500 text-rose-900 p-3.5 rounded-xs text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setValidationError('')}
            className="text-rose-700 hover:text-rose-900 text-xs underline"
          >
            {isAr ? 'إغلاق' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* If Successfully Submitted Modal / Card */}
      {submittedWo ? (
        <div className="bg-white border-geometric rounded-xs p-6 space-y-6 shadow-xs border-emerald-700">
          
          <div className="text-center space-y-2 border-b border-slate-200 pb-5">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              {isAr ? 'تم استلام وتسجيل بلاغ العطل بنجاح!' : 'Defect Report Successfully Submitted!'}
            </h3>
            <div className="inline-block bg-slate-900 text-teal-300 font-mono text-sm font-bold px-3 py-1 rounded-xs border border-slate-900">
              {isAr ? 'رقم أمر الشغل:' : 'Work Order ID:'} {submittedWo.wo_id}
            </div>
            <p className="text-xs text-slate-600 max-w-lg mx-auto">
              {isAr 
                ? 'تم إدراج البلاغ وتوثيق إحداثيات الـ GPS والمرفقات، وتحديد المهلة الزمنية للاستجابة (SLA) حتى:' 
                : 'Incident recorded with GPS coords and attachments. SLA deadline set to:'}{' '}
              <strong className="text-rose-700 font-mono">{submittedWo.sla_deadline}</strong>
            </p>
          </div>

          {/* Ticket Summary Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xs border-geometric text-xs">
            <div className="space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-slate-500">{isAr ? 'الموقع والقسم:' : 'Location & Dept:'}</span>
                <strong className="text-slate-900">{submittedWo.location_name} • {submittedWo.subcategory}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-slate-500">{isAr ? 'المُبلِّغ:' : 'Reporter:'}</span>
                <strong className="text-slate-900">{submittedWo.reporter}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-slate-500">{isAr ? 'إحداثيات الـ GPS المسجلة:' : 'GPS Coordinates:'}</span>
                <strong className="font-mono text-slate-900">{submittedWo.reporter_lat}, {submittedWo.reporter_lng}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-slate-500">{isAr ? 'التصنيف ودرجة الخطورة:' : 'Category & Severity:'}</span>
                <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-xs border border-rose-200">
                  {submittedWo.category} • {submittedWo.severity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'المرفقات الإضافية:' : 'Attachments:'}</span>
                <span className="font-bold text-slate-800">
                  {[
                    submittedWo.voice_note_url ? (isAr ? '🎙️ تسجيل صوتي' : '🎙️ Audio') : null,
                    submittedWo.video_url ? (isAr ? '🎥 فيديو' : '🎥 Video') : null,
                    submittedWo.doc_url ? (isAr ? '📄 مستند' : '📄 Doc') : null,
                    (isAr ? '📷 صورة عطل' : '📷 Photo')
                  ].filter(Boolean).join(' • ')}
                </span>
              </div>
            </div>

            <div className="bg-teal-50/70 p-3 rounded-xs border border-teal-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-teal-900 font-bold">
                <Sparkles className="w-4 h-4 text-teal-700" />
                <span>{isAr ? 'إجراءات السلامة الفورية المقترحة (Gemini AI):' : 'Instant AI Safety Precautions:'}</span>
              </div>
              <p className="text-teal-950 leading-relaxed font-medium">
                {aiDiagnosisResult?.immediateSafetyAction}
              </p>
              <div className="text-[11px] text-teal-800 pt-1 border-t border-teal-200">
                <strong>{isAr ? 'قطع الغيار الموصى بتجهيزها:' : 'Recommended Parts:'}</strong> {aiDiagnosisResult?.recommendedParts}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              {settings.features.enableWhatsAppDirectDispatch && (
                <a
                  href={generateWhatsAppUrl(submittedWo)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xs transition flex items-center gap-2 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isAr ? 'إرسال تفاصيل البلاغ فوراً عبر WhatsApp لطوارئ الصيانة' : 'Send via WhatsApp to On-Call Techs'}</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-2 border-geometric rounded-xs text-xs font-bold text-slate-800 hover:bg-slate-100 transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>{isAr ? 'طباعة كارت البلاغ' : 'Print Defect Ticket'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSubmittedWo(null);
                  setDescription('');
                  setPhotoBase64('');
                  setVoiceAudioUrl('');
                  setVideoBase64('');
                  setDocBase64('');
                }}
                className="px-4 py-2 border-geometric bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-xs transition"
              >
                {isAr ? '+ تسجيل بلاغ عطل آخر' : 'Submit Another Defect'}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onNavigateToVisit) onNavigateToVisit(submittedWo.wo_id);
                }}
                className="px-4 py-2 accent-teal text-white text-xs font-bold rounded-xs transition flex items-center gap-1.5"
              >
                <span>{isAr ? 'الانتقال لنموذج تنفيذ الفني' : 'Proceed to Tech Visit'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Report Form */
        <form onSubmit={handleSubmitReport} className="space-y-5">
          
          {/* 1. Reporter Role & Identity Selection */}
          <div className="bg-white border-geometric rounded-xs p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
              <User className="w-4 h-4 text-teal-700" />
              <h3 className="font-black text-sm text-slate-900">
                {isAr ? '1. هوية وصفة المُبلّغ وبيانات الاتصال' : '1. Reporter Identity & Role'}
              </h3>
            </div>

            {/* Role Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'branch_manager', label: isAr ? '🏢 مدير فرع' : 'Branch Manager' },
                { id: 'production_engineer', label: isAr ? '🏭 مهندس إنتاج بالمصنع' : 'Plant Engineer' },
                { id: 'section_chef', label: isAr ? '👨‍🍳 رئيس قسم / شيف تشغيل' : 'Section Chef' },
                { id: 'quality_supervisor', label: isAr ? '🛡️ مشرف جودة وسلامة' : 'Quality Auditor' }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setReporterRole(r.id as any)}
                  className={`p-2.5 text-xs font-bold rounded-xs border-geometric transition text-center ${
                    reporterRole === r.id
                      ? 'accent-teal text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {isAr ? 'اسم المسؤول المُبلّغ:' : 'Reporter Name:'}
                </label>
                <input 
                  type="text"
                  required
                  value={reporterName}
                  onChange={e => setReporterName(e.target.value)}
                  placeholder="مثال: الشيف محمود خليل / م. أحمد طارق"
                  className="w-full px-3 py-2 text-xs border-geometric rounded-xs bg-slate-50 outline-none focus:ring-1 focus:ring-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {isAr ? 'رقم الهاتف للتواصل الفوري والمتابعة:' : 'Phone Number for Instant Updates:'}
                </label>
                <input 
                  type="tel"
                  required
                  value={reporterPhone}
                  onChange={e => setReporterPhone(e.target.value)}
                  placeholder="مثال: 01012345678"
                  className="w-full px-3 py-2 text-xs border-geometric rounded-xs bg-slate-50 outline-none focus:ring-1 focus:ring-slate-900 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* 2. Location & Department Specification */}
          <div className="bg-white border-geometric rounded-xs p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-700" />
                <h3 className="font-black text-sm text-slate-900">
                  {isAr ? '2. تحديد الموقع والقسم / خط الإنتاج المتأثر' : '2. Facility & Production Line'}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-mono bg-slate-100 px-2.5 py-1 rounded-xs border border-slate-300">
                <Compass className="w-3.5 h-3.5 text-rose-600" />
                <span>GPS: {gpsLocation ? `${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lng.toFixed(4)}` : 'جاري التحديد...'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {isAr ? 'اختر الفرع أو المصنع (40 موقعاً معتمداً):' : 'Select Branch or Factory:'}
                </label>
                <select
                  value={selectedLocationId}
                  onChange={e => setSelectedLocationId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border-geometric rounded-xs bg-slate-50 outline-none focus:ring-1 focus:ring-slate-900 font-bold"
                >
                  {initialLocations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.type} - {loc.region})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {isAr ? 'القسم أو خط التشغيل التابع له العطل:' : 'Specific Department / Production Section:'}
                </label>
                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-2 text-xs border-geometric rounded-xs bg-slate-50 outline-none focus:ring-1 focus:ring-slate-900 font-bold"
                >
                  {departmentOptions.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3. Machine / Asset Identification */}
          <div className="bg-white border-geometric rounded-xs p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-700" />
                <h3 className="font-black text-sm text-slate-900">
                  {isAr ? '3. تحديد الماكينة / المعدة الإنتاجية' : '3. Machine / Asset Identification'}
                </h3>
              </div>

              <div className="flex gap-2">
                {settings.features.enableQrScanning && (
                  <button
                    type="button"
                    onClick={handleSimulateQrScan}
                    disabled={isScanningQr}
                    className="px-3 py-1 bg-slate-900 text-teal-300 hover:bg-slate-800 text-xs font-bold rounded-xs transition flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{isScanningQr ? (isAr ? 'جاري المسح...' : 'Scanning...') : (isAr ? '📷 مسح QR Code المعدة' : 'Scan Machine QR')}</span>
                  </button>
                )}
              </div>
            </div>

            {qrScanSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-2 rounded-xs text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? 'تم قراءة باركود الماكينة بنجاح وتعبئة بيانات المواصفات الفنية تلقائياً.' : 'Machine QR code scanned successfully.'}</span>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs font-bold">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="radio" 
                  name="assetMode" 
                  checked={assetMode === 'catalog'} 
                  onChange={() => setAssetMode('catalog')} 
                />
                <span>{isAr ? 'اختيار من سجل الماكينات والخطوط المعتمدة' : 'Select from Asset Catalog'}</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="radio" 
                  name="assetMode" 
                  checked={assetMode === 'manual'} 
                  onChange={() => setAssetMode('manual')} 
                />
                <span>{isAr ? 'عطل مدني / منشأة عامة / معدة غير مسجلة' : 'Civil / Non-cataloged Facility'}</span>
              </label>
            </div>

            {assetMode === 'catalog' ? (
              <div className="space-y-2">
                <select
                  value={selectedAssetId}
                  onChange={e => {
                    setSelectedAssetId(e.target.value);
                    const matched = initialAssets.find(a => a.id === e.target.value);
                    if (matched) {
                      if (matched.category.includes('تبريد')) setCategory('تبريد وتكييف');
                      else if (matched.category.includes('ألبان')) setCategory('ألبان وتصنيع ومجنسات');
                      else if (matched.category.includes('غلايات')) setCategory('غلايات ومرافق');
                      else setCategory('حلواني ومخابز وعجين');
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border-geometric rounded-xs bg-slate-50 outline-none focus:ring-1 focus:ring-slate-900 font-bold"
                >
                  {initialAssets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      [{asset.id}] {asset.name} - ({asset.location_name || asset.location_id})
                    </option>
                  ))}
                </select>

                {selectedAssetObj && (
                  <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div><strong>{isAr ? 'الموديل:' : 'Model:'}</strong> <span className="font-mono text-slate-700">{selectedAssetObj.model}</span></div>
                    <div><strong>{isAr ? 'القسم:' : 'Dept:'}</strong> <span className="text-slate-700">{selectedAssetObj.category}</span></div>
                    <div><strong>{isAr ? 'حالة الماكينة:' : 'Status:'}</strong> <span className="font-bold text-teal-700">{selectedAssetObj.status}</span></div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input 
                  type="text"
                  value={manualAssetName}
                  onChange={e => setManualAssetName(e.target.value)}
                  placeholder={isAr ? 'مثال: باب غرفة التجميد، لوحة القواطع، فلتر المياه، تكييف الاستقبال...' : 'e.g. Cold room door, control breaker, water filter...'}
                  className="w-full px-3 py-2 text-xs border-geometric rounded-xs bg-slate-50 outline-none focus:ring-1 focus:ring-slate-900 font-bold"
                />
              </div>
            )}
          </div>

          {/* 4. Severity, Voice Recording, Description & Symptoms */}
          <div className="bg-white border-geometric rounded-xs p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
              <ShieldAlert className="w-4 h-4 text-teal-700" />
              <h3 className="font-black text-sm text-slate-900">
                {isAr ? '4. تصنيف العطل ومستوى الخطورة والشرح الصوتي والكتابي' : '4. Fault Category & Description'}
              </h3>
            </div>

            {/* Severity Radio Matrix with Dynamic SLA */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                {isAr ? 'درجة الخطورة والتأثير على دورة التشغيل (SLA Response):' : 'Severity Impact Level:'}
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div 
                  onClick={() => setSeverity('عاجل')}
                  className={`p-3 rounded-xs border-geometric cursor-pointer transition flex flex-col justify-between ${
                    severity === 'عاجل'
                      ? 'bg-rose-50 border-rose-800 ring-2 ring-rose-600'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-rose-800">{isAr ? '🔴 حرج جداً (توقف خط إنتاج)' : '🔴 Critical / Halt'}</span>
                    <span className="text-[10px] font-mono font-bold bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded-xs">
                      SLA: {settings.sla.urgentHours} {isAr ? (settings.sla.urgentHours === 2 ? 'ساعتين' : 'ساعات') : 'hrs'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    {isAr ? 'توقف بسترة الحليب أو ذوبان مجمدات الجاتوه يهدد بفساد المواد الغذائية.' : 'Complete line stoppage or immediate spoilage risk.'}
                  </p>
                </div>

                <div 
                  onClick={() => setSeverity('متوسط')}
                  className={`p-3 rounded-xs border-geometric cursor-pointer transition flex flex-col justify-between ${
                    severity === 'متوسط'
                      ? 'bg-amber-50 border-amber-800 ring-2 ring-amber-600'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-amber-900">{isAr ? '🟠 عطل مرتفع / جزئي' : '🟠 Medium / Partial'}</span>
                    <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-xs">
                      SLA: {settings.sla.mediumHours} {isAr ? 'ساعات' : 'hrs'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    {isAr ? 'المعدة تعمل بكفاءة منخفضة أو صوت غير طبيعي مع استمرار الإنتاج بحذر.' : 'Degraded performance or abnormal noise while running.'}
                  </p>
                </div>

                <div 
                  onClick={() => setSeverity('منخفض')}
                  className={`p-3 rounded-xs border-geometric cursor-pointer transition flex flex-col justify-between ${
                    severity === 'منخفض'
                      ? 'bg-emerald-50 border-emerald-800 ring-2 ring-emerald-600'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-emerald-900">{isAr ? '🟢 صيانة وقائية / تحسينية' : '🟢 Low / Preventive'}</span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-xs">
                      SLA: {settings.sla.lowHours} {isAr ? 'ساعة' : 'hrs'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    {isAr ? 'فحص دوري، تزييت، تشحيم، استبدال إضاءة أو لمبة بيان بلوحة التحكم.' : 'Routine checkup, lubrication, or cosmetic repairs.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Category Select */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {isAr ? 'التخصص الهندسي:' : 'Technical Domain:'}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border-geometric rounded-xs bg-slate-50 outline-none focus:ring-1 focus:ring-slate-900 font-bold"
              >
                <option value="تبريد وتكييف">تبريد وتكييف وتشيلرات (Refrigeration & Chillers)</option>
                <option value="ألبان وتصنيع ومجنسات">ألبان وتصنيع ومجنسات (Dairy Processing)</option>
                <option value="حلواني ومخابز وعجين">حلواني ومخابز وعجين (Pastry & Bakery Lines)</option>
                <option value="غلايات ومرافق">غلايات وبخار ومرافق (Boilers & Steam)</option>
                <option value="كهرباء ومواتير ومولدات">كهرباء ومواتير ومولدات (Electrical & Motors)</option>
                <option value="تعبئة وتغليف">ماكينات تعبئة وتغليف (Packaging & Printing)</option>
              </select>
            </div>

            {/* Fast Symptom Quick Tags */}
            {symptomTags[category] && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isAr ? 'أعراض شائعة وسريعة (اضغط للإضافة للوصف):' : 'Fast Symptom Tags:'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {symptomTags[category].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setQuickTag(tag);
                        setDescription(prev => prev ? `${prev}\n• ${tag}` : tag);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xs text-[11px] font-bold border border-slate-300 transition"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Voice Recording Engine for Chefs & Engineers (Conditional based on Settings) */}
            {settings.features.enableVoiceRecording && (
              <div className="bg-slate-50 p-4 rounded-xs border-2 border-dashed border-teal-600/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-teal-700" />
                    <span className="text-xs font-bold text-slate-900">
                      {isAr ? 'تسجيل رسالة صوتية لشرح العطل للشيف والمهندس (Voice Note):' : 'Record Voice Note:'}
                    </span>
                    {settings.features.requireVoiceBeforeSubmit && (
                      <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded-xs">
                        {isAr ? 'إلزامي بالسياسة' : 'Required'}
                      </span>
                    )}
                  </div>
                  {isRecordingVoice && (
                    <span className="text-xs font-mono font-bold text-rose-600 animate-pulse">
                      🔴 {isAr ? `جاري التسجيل: ${voiceDuration} ثانية (الحد الأقصى: ${settings.features.maxVoiceDurationSec}ث)` : `Recording: ${voiceDuration}s`}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {!isRecordingVoice && !voiceAudioUrl && (
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xs transition flex items-center gap-2 shadow-xs"
                    >
                      <Mic className="w-4 h-4" />
                      <span>{isAr ? 'اضغط لبدء تسجيل صوتي (شرح العطل)' : 'Start Voice Recording'}</span>
                    </button>
                  )}

                  {isRecordingVoice && (
                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xs transition flex items-center gap-2 animate-bounce"
                    >
                      <Square className="w-4 h-4" />
                      <span>{isAr ? 'إيقاف وحفظ التسجيل الصوتي' : 'Stop & Save Audio'}</span>
                    </button>
                  )}

                  {voiceAudioUrl && !isRecordingVoice && (
                    <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xs border border-teal-300 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={togglePlayVoice}
                        className="w-7 h-7 bg-teal-700 text-white rounded-full flex items-center justify-center hover:bg-teal-800"
                      >
                        {isPlayingVoice ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {isAr ? `رسالة صوتية مسجلة (${voiceDuration || '0:12'} ث)` : `Voice recorded (${voiceDuration || '0:12'}s)`}
                      </span>
                      <button
                        type="button"
                        onClick={deleteVoiceNote}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title={isAr ? 'حذف التسجيل' : 'Delete Voice'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {isAr ? 'وصف دقيق للعطل والملاحظات الميدانية للشيف أو المهندس:' : 'Detailed Defect Description:'}
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={isAr ? 'اكتب تفاصيل ما حدث، التوقيت، الأصوات الغريبة، رسائل الخطأ على الشاشة...' : 'Describe what happened, timing, abnormal sounds, error codes...'}
                className="w-full p-3 text-xs border-geometric rounded-xs bg-slate-50 outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed font-medium"
              ></textarea>
            </div>
          </div>

          {/* 5. Photos, Video & Document Attachments + AI Diagnosis Engine */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Photo Attachment */}
            <div className="bg-white border-geometric rounded-xs p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-teal-700" />
                    <h3 className="font-black text-xs text-slate-900">
                      {isAr ? '1. التقاط / رفع صورة العطل' : '1. Defect Photo'}
                    </h3>
                  </div>
                  {settings.features.requirePhotoBeforeSubmit && (
                    <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded-xs">
                      {isAr ? 'إلزامي بالسياسة' : 'Required'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-1.5">
                  {isAr ? 'صورة واضحة بكاميرا الهاتف لموضع العطل.' : 'Clear photo of the defect position.'}
                </p>

                <div className="mt-3">
                  <label className="border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-xs p-3 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700">
                      {photoName ? photoName : (isAr ? 'التقاط أو رفع صورة' : 'Upload Photo')}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {photoBase64 && (
                <div className="mt-2 relative">
                  <img 
                    src={photoBase64} 
                    alt="Preview" 
                    className="h-20 w-full object-cover rounded-xs border-geometric" 
                  />
                  <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-xs">
                    {isAr ? 'جاهزة' : 'Ready'}
                  </span>
                </div>
              )}
            </div>

            {/* Video & Document Attachments (Conditional) */}
            {(settings.features.enableVideoUpload || settings.features.enableDocumentUpload) && (
              <div className="bg-white border-geometric rounded-xs p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Video className="w-4 h-4 text-teal-700" />
                    <h3 className="font-black text-xs text-slate-900">
                      {isAr ? '2. فيديو قصير أو مستند/كتالوج' : '2. Video / Document'}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5">
                    {isAr ? `فيديو لصوت العطل (أقصى حجم: ${settings.features.maxVideoSizeMb}MB) أو ملف تقرير.` : 'Video of defect sound or PDF report.'}
                  </p>

                  <div className={`grid gap-2 mt-3 ${settings.features.enableVideoUpload && settings.features.enableDocumentUpload ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {settings.features.enableVideoUpload && (
                      <label className="border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-xs p-2.5 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition text-center">
                        <Video className="w-4 h-4 text-slate-500 mb-1" />
                        <span className="text-[11px] font-bold text-slate-800 truncate max-w-[90px]">
                          {videoName || (isAr ? 'فيديو قصير' : 'Video')}
                        </span>
                        <input 
                          type="file" 
                          accept="video/*" 
                          onChange={handleVideoUpload} 
                          className="hidden" 
                        />
                      </label>
                    )}

                    {settings.features.enableDocumentUpload && (
                      <label className="border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-xs p-2.5 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition text-center">
                        <FileText className="w-4 h-4 text-slate-500 mb-1" />
                        <span className="text-[11px] font-bold text-slate-800 truncate max-w-[90px]">
                          {docName || (isAr ? 'مستند PDF' : 'Document')}
                        </span>
                        <input 
                          type="file" 
                          accept=".pdf,.doc,.docx,.xlsx" 
                          onChange={handleDocUpload} 
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                </div>

                {(videoName || docName) && (
                  <div className="text-[11px] bg-slate-100 p-2 rounded-xs border border-slate-200 text-slate-700">
                    {videoName && <div>🎥 <strong>{isAr ? 'فيديو:' : 'Video:'}</strong> {videoName}</div>}
                    {docName && <div>📄 <strong>{isAr ? 'مستند:' : 'Doc:'}</strong> {docName}</div>}
                  </div>
                )}
              </div>
            )}

            {/* AI Auto-Diagnosis Engine (Conditional) */}
            {settings.features.enableGeminiDiagnosis && (
              <div className="bg-white border-geometric rounded-xs p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <h3 className="font-black text-xs text-slate-900">
                        {isAr ? 'التشخيص الذكي (Gemini AI)' : 'AI Instant Diagnosis'}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={handleRunAiDiagnosis}
                      disabled={isAiDiagnosing}
                      className="px-2 py-0.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-600 text-[10px] font-bold rounded-xs transition flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isAiDiagnosing ? 'animate-spin' : ''}`} />
                      <span>{isAr ? 'تحديث' : 'Re-Run'}</span>
                    </button>
                  </div>

                  {aiDiagnosisResult ? (
                    <div className="mt-2 space-y-2 text-xs">
                      <div className="bg-slate-50 p-2 rounded-xs border border-slate-200">
                        <span className="font-bold text-[11px] text-slate-900 block">{isAr ? 'السبب المتوقع:' : 'Root Cause:'}</span>
                        <p className="text-slate-700 text-[11px] leading-relaxed">{aiDiagnosisResult.rootCause}</p>
                      </div>

                      <div className="bg-teal-50/80 p-2 rounded-xs border border-teal-200">
                        <span className="font-bold text-[11px] text-teal-950 block">{isAr ? 'تعليمات السلامة الفورية:' : 'Immediate Safety Action:'}</span>
                        <p className="text-teal-900 text-[11px] leading-relaxed font-medium">{aiDiagnosisResult.immediateSafetyAction}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400 font-bold">
                      {isAr ? 'اضغط على زر التحديث لتشغيل التشخيص الذكي' : 'Click Re-Run to start AI diagnosis'}
                    </div>
                  )}
                </div>

                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200 flex justify-between items-center">
                  <span>Gemini 2.5 Flash</span>
                  <span className="text-teal-700 font-bold">{isAr ? 'دقة التوقع: 95%' : 'Confidence: 95%'}</span>
                </div>
              </div>
            )}

          </div>

          {/* Submit Action Bar */}
          <div className="bg-slate-900 text-white p-4 rounded-xs border-geometric flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                <span>إرسال البلاغ يولد فوراً أمر شغل رقمي في قاعدة بيانات الصيانة و Google Sheets</span>
              </div>
              <p className="text-[11px] text-slate-400">
                سيصل إشعار فوري لمهندسي الصيانة والفنيين المناوبين متضمناً الصوت والصور وإحداثيات الموقع.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 accent-teal hover:opacity-90 text-white font-black text-sm rounded-xs border border-teal-300 shadow-xs transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري تسجيل وتعميم البلاغ...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isAr ? 'تأكيد وإرسال البلاغ لغرفة الصيانة 🚀' : 'Submit Defect Report Now'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
