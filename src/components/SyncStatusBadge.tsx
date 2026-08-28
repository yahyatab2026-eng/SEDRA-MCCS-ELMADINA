import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { syncQueue } from '../services/syncQueue';

export const SyncStatusBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = syncQueue.subscribe((count) => {
      setPendingCount(count);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    setLastSyncResult(null);

    try {
      const res = await syncQueue.syncPendingQueue();
      if (res.synced > 0) {
        setLastSyncResult(`تمت مزامنة ${res.synced} بنجاح`);
        setTimeout(() => setLastSyncResult(null), 4000);
      }
    } catch (e) {
      console.error('Manual sync failed', e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div id="cmms-sync-status-badge" className="flex items-center gap-2">
      {isOnline ? (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-full text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <Wifi className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">متصل بالسيرفر</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-800 border border-amber-500/30 rounded-full text-xs font-semibold">
          <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
          <span>وضع غير متصل (أوفلاين)</span>
        </div>
      )}

      {pendingCount > 0 && (
        <button
          onClick={handleManualSync}
          disabled={!isOnline || isSyncing}
          title="عناصر مخزنة محلياً في انتظار المزامنة"
          className="flex items-center gap-1.5 px-3 py-1 bg-teal-800 text-white rounded-full text-xs font-medium hover:bg-teal-900 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>مزامنة ({pendingCount})</span>
        </button>
      )}

      {lastSyncResult && (
        <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 animate-fade-in">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{lastSyncResult}</span>
        </div>
      )}
    </div>
  );
};
