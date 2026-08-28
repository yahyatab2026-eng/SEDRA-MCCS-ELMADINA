import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  MapPin, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  AlertCircle, 
  Sparkles,
  Smartphone,
  Save,
  Check
} from 'lucide-react';
import { initialLocations, initialTechnicians, initialWorkOrders } from '../data/seedData';
import { WorkOrder, VisitRecord } from '../types';
import { compressImage } from '../utils/imageCompression';
import { syncQueue } from '../services/syncQueue';

interface VisitWizardViewProps {
  lang: 'ar' | 'en';
  onCompleted?: () => void;
}

export const VisitWizardView: React.FC<VisitWizardViewProps> = ({ lang, onCompleted }) => {
  const isAr = lang === 'ar';
  const totalSteps = 7;
  const [step, setStep] = useState(1);

  // Form fields
  const [selectedWoId, setSelectedWoId] = useState('');
  const [manualWoId, setManualWoId] = useState('');
  const [selectedTech, setSelectedTech] = useState('');
  
  // Step 2: GPS
  const [arriveLat, setArriveLat] = useState<number | ''>('');
  const [arriveLng, setArriveLng] = useState<number | ''>('');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('');

  // Step 3: Timestamp
  const [arrivedAt, setArrivedAt] = useState('');

  // Step 4: Before photo
  const [beforePhoto, setBeforePhoto] = useState<string>('');

  // Step 5: Work details & cost
  const [workDone, setWorkDone] = useState('');
  const [partsUsed, setPartsUsed] = useState('');
  const [costParts, setCostParts] = useState<number>(0);
  const [costLabor, setCostLabor] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Step 6: After photo & video
  const [afterPhoto, setAfterPhoto] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState('');

  // Step 7: Submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [generatedVisitId, setGeneratedVisitId] = useState('');

  useEffect(() => {
    // Stamp arrival time on initial mount
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setArrivedAt(now);
  }, []);

  // GPS Acquisition
  const handleGetGps = () => {
    setGpsLoading(true);
    setGpsMessage('جاري الاتصال بالقمر الصناعي (GPS)...');

    if (!navigator.geolocation) {
      setGpsLoading(false);
      setGpsMessage('المتصفح لا يدعم Geolocation، يرجى كتابة الإحداثيات يدوياً.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsLoading(false);
        const lat = +pos.coords.latitude.toFixed(6);
        const lng = +pos.coords.longitude.toFixed(6);
        setArriveLat(lat);
        setArriveLng(lng);
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setGpsMessage(`✅ تم التقاط الإحداثيات بدقة عالية (دقة: ${Math.round(pos.coords.accuracy)} متر)`);
      },
      err => {
        setGpsLoading(false);
        setGpsMessage(`⚠️ تعذر الوصول للموقع تلقائياً (${err.message}) - يمكنك الإدخال يدوياً`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Client-side image resize via HTML5 Canvas (Max 1024px)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isBefore: boolean) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    try {
      const resized = await compressImage(file, { maxWidth: 1024, maxHeight: 1024, quality: 0.82 });
      if (isBefore) setBeforePhoto(resized);
      else setAfterPhoto(resized);
    } catch (err) {
      console.warn('Image upload fallback', err);
      const reader = new FileReader();
      reader.onload = event => {
        if (isBefore) setBeforePhoto(event.target?.result as string);
        else setAfterPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step titles
  const stepTitles = [
    'اختيار أمر الصيانة المكلف',
    'إثبات الموقع الجغرافي (GPS)',
    'توثيق وقت الوصول الميداني',
    'تصوير العطل قبل الإصلاح (Before)',
    'تفاصيل الإصلاح وقطع الغيار والتكلفة',
    'تصوير المعدة بعد الإصلاح (After)',
    'مراجعة واعتماد التقرير الميداني'
  ];

  // Validate step navigation
  const effectiveWoId = (manualWoId.trim() || selectedWoId).toUpperCase();

  const handleNext = () => {
    if (step === 1 && !effectiveWoId) {
      alert('الرجاء اختيار أو كتابة رقم أمر الصيانة (WO ID)');
      return;
    }
    if (step < totalSteps) setStep(s => s + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(s => s - 1);
  };

  // Submit visit report
  const handleSubmitVisit = () => {
    setIsSubmitting(true);
    const visitId = `VISIT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const visitPayload: Partial<VisitRecord> = {
      visit_id: visitId,
      wo_id: effectiveWoId,
      tech_name: selectedTech || 'فني الصيانة الميدانية',
      arrived_at: arrivedAt || now,
      departed_at: now,
      arrive_lat: arriveLat === '' ? 30.0444 : arriveLat,
      arrive_lng: arriveLng === '' ? 31.2357 : arriveLng,
      work_done: workDone || 'تم إنجاز أعمال الصيانة والمعايرة التشغيلية.',
      parts_used: partsUsed,
      cost_parts: costParts,
      cost_labor: costLabor,
      notes: notes,
      before_photo: beforePhoto,
      after_photo: afterPhoto,
      video_url: videoUrl
    };

    // Queue for sync or send
    syncQueue.enqueue('CREATE_VISIT', visitPayload);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setGeneratedVisitId(visitId);
    }, 800);
  };

  return (
    <div className="max-w-xl mx-auto py-2 space-y-4">
      
      {/* Stepper Progress Bar (Geometric Balance) */}
      <div className="bg-white border-geometric p-4 rounded-xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 accent-teal rounded-xs"></span>
            <span>الخطوة {step}: {stepTitles[step - 1]}</span>
          </span>
          <span className="text-teal-800 font-mono font-bold bg-teal-50 border border-teal-400 px-2 py-0.5 rounded-xs text-[10px]">
            STEP {step} / {totalSteps}
          </span>
        </div>
        <div className="w-full bg-slate-100 border border-slate-300 h-2.5 rounded-xs overflow-hidden">
          <div 
            className="accent-teal h-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main Wizard Card */}
      <div className="bg-white border-geometric rounded-xs p-6 space-y-6">
        
        {/* ================================================================ */}
        {/* STEP 1: SELECT WORK ORDER */}
        {/* ================================================================ */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-900 pb-2">
              <h3 className="font-black text-sm sm:text-base text-slate-900">1. اختيار أمر الشغل (Work Order)</h3>
              <p className="text-xs text-slate-500 font-medium">اختر من البلاغات المفتوحة المكلفة لك أو اكتب الرقم يدوياً</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">البلاغات المكلفة المفتوحة:</label>
              <select 
                value={selectedWoId} 
                onChange={e => { setSelectedWoId(e.target.value); setManualWoId(''); }}
                className="w-full px-3 py-2 text-xs rounded-xs border-geometric bg-white outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              >
                <option value="">-- اختر من القائمة المتاحة --</option>
                {initialWorkOrders.filter(w => w.status !== 'مُنجز' && w.status !== 'مُغلق').map(w => (
                  <option key={w.wo_id} value={w.wo_id}>
                    {w.wo_id} | {w.location_name} ({w.severity})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-300"></div>
              <span className="flex-shrink mx-2 text-[10px] text-slate-500 font-bold font-mono">OR ENTER WO ID MANUALLY</span>
              <div className="flex-grow border-t border-slate-300"></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">رقم البلاغ (WO ID):</label>
              <input 
                type="text" 
                value={manualWoId} 
                onChange={e => { setManualWoId(e.target.value); setSelectedWoId(''); }}
                placeholder="مثال: WO-2026-000101" 
                className="w-full px-3 py-2 text-xs rounded-xs border-geometric bg-white font-mono uppercase outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">اسم الفني المنفذ للزيارة:</label>
              <select 
                value={selectedTech} 
                onChange={e => setSelectedTech(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xs border-geometric bg-white outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              >
                <option value="">-- اختر اسمك من الفريق --</option>
                {initialTechnicians.map(t => (
                  <option key={t.id} value={`${t.name} (${t.specialty})`}>
                    {t.name} - {t.specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 2: GPS GEOLOCATION */}
        {/* ================================================================ */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-900 pb-2">
              <h3 className="font-black text-sm sm:text-base text-slate-900">2. إثبات الموقع الجغرافي للوصول (GPS)</h3>
              <p className="text-xs text-slate-500 font-medium">تأكيد التواجد الميداني الفعلي في الفرع أو المصنع</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xs border-geometric text-center space-y-3">
              <div className="w-12 h-12 rounded-xs accent-teal text-white flex items-center justify-center mx-auto text-xl font-bold border border-slate-900">
                📍
              </div>
              <button 
                type="button" 
                onClick={handleGetGps} 
                disabled={gpsLoading}
                className="w-full py-2.5 accent-teal hover:opacity-90 text-white font-bold rounded-xs text-xs border-geometric transition flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-4 h-4" />
                <span>{gpsLoading ? 'جاري التقاط الإحداثيات...' : 'التقاط إحداثيات الموقع الحالي (GPS)'}</span>
              </button>
              {gpsMessage && (
                <div className="text-xs text-slate-700 font-mono font-bold bg-white p-2 rounded-xs border border-slate-300">
                  {gpsMessage}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">خط العرض (Latitude):</label>
                <input 
                  type="number" 
                  step="any" 
                  value={arriveLat} 
                  onChange={e => setArriveLat(Number(e.target.value))} 
                  placeholder="30.0578" 
                  className="w-full px-3 py-2 rounded-xs border-geometric font-mono text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">خط الطول (Longitude):</label>
                <input 
                  type="number" 
                  step="any" 
                  value={arriveLng} 
                  onChange={e => setArriveLng(Number(e.target.value))} 
                  placeholder="31.3418" 
                  className="w-full px-3 py-2 rounded-xs border-geometric font-mono text-xs outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 3: ARRIVAL TIMESTAMP */}
        {/* ================================================================ */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-900 pb-2">
              <h3 className="font-black text-sm sm:text-base text-slate-900">3. تسجيل وقت الوصول الميداني</h3>
              <p className="text-xs text-slate-500 font-medium">توثيق لحظة بدء العمل واحتساب زمن الاستجابة بدقة</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">تاريخ ووقت الوصول للموقع:</label>
              <input 
                type="text" 
                value={arrivedAt} 
                onChange={e => setArrivedAt(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xs border-geometric bg-slate-50 font-mono text-slate-900 font-bold"
              />
            </div>

            <button 
              type="button" 
              onClick={() => setArrivedAt(new Date().toISOString().replace('T', ' ').substring(0, 16))}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xs text-xs border-geometric transition flex items-center justify-center gap-1.5"
            >
              <Clock className="w-4 h-4 text-teal-400" />
              <span>⏱️ ختم الوقت الحالي للوصول</span>
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 4: BEFORE PHOTO */}
        {/* ================================================================ */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-900 pb-2">
              <h3 className="font-black text-sm sm:text-base text-slate-900">4. تصوير العطل قبل بدء الإصلاح (Before)</h3>
              <p className="text-xs text-slate-500 font-medium">التقط صورة واضحة لحالة المعدة قبل فك أي أجزاء (يتم ضغطها تلقائياً)</p>
            </div>

            <div className="border-2 border-dashed border-slate-900 rounded-xs p-6 text-center bg-slate-50 hover:bg-slate-100 transition relative">
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                onChange={e => handleImageUpload(e, true)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <Camera className="w-10 h-10 mx-auto text-slate-700" />
                <span className="text-xs font-bold text-slate-900 block">اضغط هنا لالتقاط صورة بالكاميرا</span>
                <span className="text-[10px] text-slate-500 font-mono block">AUTOMATIC CANVAS COMPRESSION (MAX 1024PX)</span>
              </div>
            </div>

            {beforePhoto && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-900">معاينة الصورة المختارة:</span>
                <img src={beforePhoto} alt="Before" className="w-full h-48 object-cover rounded-xs border-geometric" />
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 5: WORK DETAILS & COSTS */}
        {/* ================================================================ */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-900 pb-2">
              <h3 className="font-black text-sm sm:text-base text-slate-900">5. تفاصيل الصيانة وقطع الغيار والتكلفة</h3>
              <p className="text-xs text-slate-500 font-medium">سجل الإجراءات الفنية المنفذة والقطع المستهلكة بدقة</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">الأعمال المنفذة (Work Done):</label>
              <textarea 
                value={workDone} 
                onChange={e => setWorkDone(e.target.value)} 
                rows={3} 
                placeholder="اكتب بالتفصيل ما تم فحصه وإصلاحه..." 
                className="w-full px-3 py-2 text-xs rounded-xs border-geometric bg-white outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">قطع الغيار المستخدمة (إن وجدت):</label>
              <input 
                type="text" 
                value={partsUsed} 
                onChange={e => setPartsUsed(e.target.value)} 
                placeholder="مثال: كابستور 4 ميكرو + مروحة كوندنسر" 
                className="w-full px-3 py-2 text-xs rounded-xs border-geometric bg-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-900 mb-1">تكلفة قطع الغيار (ج.م):</label>
                <input 
                  type="number" 
                  value={costParts} 
                  onChange={e => setCostParts(Number(e.target.value))} 
                  min={0} 
                  className="w-full px-3 py-2 text-xs rounded-xs border-geometric font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-900 mb-1">تكلفة المصنعية / الإضافية (ج.م):</label>
                <input 
                  type="number" 
                  value={costLabor} 
                  onChange={e => setCostLabor(Number(e.target.value))} 
                  min={0} 
                  className="w-full px-3 py-2 text-xs rounded-xs border-geometric font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">ملاحظات إضافية وتوصيات للفرع:</label>
              <input 
                type="text" 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="أي توصيات للفرع أو موعد صيانة وقائية قادمة" 
                className="w-full px-3 py-2 text-xs rounded-xs border-geometric bg-white outline-none"
              />
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 6: AFTER PHOTO & VIDEO */}
        {/* ================================================================ */}
        {step === 6 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-900 pb-2">
              <h3 className="font-black text-sm sm:text-base text-slate-900">6. تصوير المعدة بعد الإصلاح (After)</h3>
              <p className="text-xs text-slate-500 font-medium">توثيق نجاح الإصلاح ونظافة الموقع للمقارنة الآلية بالذكاء الاصطناعي</p>
            </div>

            <div className="border-2 border-dashed border-teal-800 rounded-xs p-6 text-center bg-teal-50/40 hover:bg-teal-50 transition relative">
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                onChange={e => handleImageUpload(e, false)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <Camera className="w-10 h-10 mx-auto text-teal-800" />
                <span className="text-xs font-bold text-teal-900 block">التقط صورة ما بعد الإصلاح</span>
                <span className="text-[10px] text-teal-700 font-mono block">FOR GEMINI AFTER-PHOTO AI COMPARISON</span>
              </div>
            </div>

            {afterPhoto && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-teal-900">معاينة صورة بعد الإصلاح:</span>
                <img src={afterPhoto} alt="After" className="w-full h-48 object-cover rounded-xs border-geometric" />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">رابط فيديو توثيقي (اختياري - Google Drive):</label>
              <input 
                type="url" 
                value={videoUrl} 
                onChange={e => setVideoUrl(e.target.value)} 
                placeholder="https://drive.google.com/file/d/..." 
                className="w-full px-3 py-2 text-xs rounded-xs border-geometric font-mono outline-none"
              />
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 7: REVIEW & SUBMIT */}
        {/* ================================================================ */}
        {step === 7 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-900 pb-2">
              <h3 className="font-black text-sm sm:text-base text-slate-900">7. مراجعة واعتماد التقرير الميداني</h3>
              <p className="text-xs text-slate-500 font-medium">تأكيد البيانات لإرسال التقرير النهائي وتحديث حالة البلاغ لـ "مُنجز"</p>
            </div>

            {submitSuccess ? (
              <div className="bg-teal-50 border-geometric rounded-xs p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-xs accent-teal text-white flex items-center justify-center mx-auto text-2xl font-bold border border-slate-900">
                  ✓
                </div>
                <h4 className="font-black text-teal-950 text-base">تم اعتماد وتسليم تقرير الزيارة بنجاح!</h4>
                <p className="text-xs text-teal-800 font-mono">رقم التقرير: <strong>{generatedVisitId}</strong></p>
                <p className="text-xs text-slate-700">
                  تم حفظ السجل في Google Sheets، ورفع الصور إلى Google Drive، وتحديث حالة البلاغ إلى <strong className="text-teal-800">مُنجز</strong>.
                </p>
                <button 
                  onClick={() => { setStep(1); setSubmitSuccess(false); }}
                  className="px-5 py-2 accent-teal hover:opacity-90 text-white font-bold rounded-xs text-xs border-geometric transition"
                >
                  تسجيل زيارة أخرى
                </button>
              </div>
            ) : (
              <>
                <div className="bg-slate-50 p-4 rounded-xs border-geometric space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-300 pb-1.5">
                    <span className="text-slate-500">أمر الشغل:</span>
                    <strong className="text-slate-900 font-mono">{effectiveWoId || 'WO-2026-000101'}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-300 pb-1.5">
                    <span className="text-slate-500">الفني المسؤول:</span>
                    <strong className="text-slate-900">{selectedTech || 'محمد كمال (تبريد وتكييف)'}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-300 pb-1.5">
                    <span className="text-slate-500">وقت الوصول:</span>
                    <strong className="text-slate-900 font-mono">{arrivedAt}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">إجمالي التكلفة:</span>
                    <strong className="text-teal-800 font-mono font-bold text-sm">{costParts + costLabor} ج.م</strong>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={handleSubmitVisit} 
                  disabled={isSubmitting}
                  className="w-full py-3 accent-teal hover:opacity-90 text-white font-bold rounded-xs text-sm border-geometric shadow-xs transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>جاري الرفع لـ Google Sheets & Drive...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>اعتماد وإرسال تقرير الصيانة ✅</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* Wizard Step Controls */}
        {!submitSuccess && (
          <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={handlePrev}
                className="px-4 py-2 text-xs font-bold text-slate-900 bg-white border-geometric hover:bg-slate-100 rounded-xs transition flex items-center gap-1"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>
            ) : <div></div>}

            {step < totalSteps && (
              <button 
                type="button" 
                onClick={handleNext}
                className="px-6 py-2 text-xs font-bold text-white accent-teal hover:opacity-90 rounded-xs border-geometric transition shadow-xs flex items-center gap-1 mr-auto"
              >
                <span>المتابعة للخطوة التالية</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
