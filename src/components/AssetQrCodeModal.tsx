import React, { useState } from 'react';
import { QrCode, Printer, X, Wrench, Building, Check, Copy } from 'lucide-react';
import { AssetRecord } from '../types';

interface AssetQrCodeModalProps {
  asset: AssetRecord | null;
  onClose: () => void;
  onReportIncident?: (asset: AssetRecord) => void;
}

export const AssetQrCodeModal: React.FC<AssetQrCodeModalProps> = ({
  asset,
  onClose,
  onReportIncident
}) => {
  const [copied, setCopied] = useState(false);

  if (!asset) return null;

  // Generate QR Code via standard SVG URL
  const qrData = JSON.stringify({
    asset_id: asset.id,
    serial: asset.serial,
    location: asset.location_name || asset.location_id,
    category: asset.category,
    name: asset.name
  });

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    qrData
  )}&bgcolor=ffffff&color=004D40&margin=10`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`CMMS_ASSET_${asset.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="asset-qr-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div 
        id="asset-qr-modal-content"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">ملصق وباركود الأصل الذكي</h3>
            <QrCode className="w-5 h-5 text-teal-800" />
          </div>
        </div>

        {/* Printable Sticker Card */}
        <div className="p-6">
          <div 
            id="printable-asset-sticker" 
            className="border-2 border-dashed border-teal-800/30 rounded-xl p-5 bg-teal-50/20 flex flex-col items-center text-center"
          >
            {/* Header in card */}
            <div className="text-xs font-bold text-teal-900 tracking-wide uppercase mb-1">
              مجموعة سيدرا والمدينة المنورة - إدارة الصيانة
            </div>
            <div className="text-sm font-black text-slate-900 mb-3">
              {asset.name}
            </div>

            {/* QR Code Container */}
            <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200 mb-3">
              <img
                src={qrImageUrl}
                alt={`QR Code for ${asset.name}`}
                className="w-44 h-44 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Info details */}
            <div className="w-full bg-white rounded-lg p-3 border border-slate-100 text-xs space-y-1.5 mb-2">
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-semibold text-slate-900 font-mono">{asset.id}</span>
                <span>كود الأصل:</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-mono text-slate-800">{asset.serial}</span>
                <span>الرقم التسلسلي:</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="text-teal-900 font-medium">{asset.location_name || asset.location_id}</span>
                <span>الموقع:</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="text-slate-800">{asset.category}</span>
                <span>التصنيف:</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              امسح الرمز بكاميرا الجوال للإبلاغ الفوري عن عطل أو مراجعة سجل الزيارات
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          {onReportIncident && (
            <button
              onClick={() => {
                onReportIncident(asset);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <Wrench className="w-4 h-4" />
              <span>إبلاغ عن عطل</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>طباعة الملصق</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="p-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"
            title="نسخ كود الأصل"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
