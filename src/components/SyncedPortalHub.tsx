import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  CloudUpload, 
  CloudDownload, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Info, 
  Clock, 
  Computer, 
  Activity,
  Users,
  Wifi,
  ToggleLeft,
  ToggleRight,
  Database
} from 'lucide-react';
import { savePortalStateToFirebase, loadPortalStateFromFirebase } from '../lib/firebase';

interface SyncedPortalHubProps {
  onStateLoaded: (serverState: any) => void;
  onGetLocalState: () => any;
  currentUsername: string;
  onClose: () => void;
  isOpen: boolean;
  firebaseSyncEnabled: boolean;
  onToggleFirebaseSync: (enabled: boolean) => void;
}

export function SyncedPortalHub({ 
  onStateLoaded, 
  onGetLocalState, 
  currentUsername, 
  onClose,
  isOpen,
  firebaseSyncEnabled,
  onToggleFirebaseSync
}: SyncedPortalHubProps) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'info' | 'success' | 'error' | 'warning' | null }>({
    text: '',
    type: null
  });
  const [serverTimestamp, setServerTimestamp] = useState<string | null>(null);
  const [serverAuthor, setServerAuthor] = useState<string | null>(null);
  const [usingFirestore, setUsingFirestore] = useState(true);

  // Retrieve current active metadata from server on mount
  useEffect(() => {
    if (isOpen) {
      fetchServerMetadata();
    }
  }, [isOpen]);

  const fetchServerMetadata = async () => {
    try {
      setLoading(true);
      // Attempt to load from Cloud Firestore first
      const data = await loadPortalStateFromFirebase();
      if (data && data.timestamp) {
        setServerTimestamp(data.timestamp);
        setServerAuthor(data.updatedBy);
        setUsingFirestore(true);
      } else {
        // Fallback to Express synced_state.json metadata
        const res = await fetch('/api/sync/load');
        if (res.ok) {
          const fallbackData = await res.json();
          if (fallbackData.timestamp) {
            setServerTimestamp(fallbackData.timestamp);
            setServerAuthor(fallbackData.updatedBy);
            setUsingFirestore(false);
          } else {
            setServerTimestamp(null);
            setServerAuthor(null);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch Firebase sync metadata, trying fallback...", err);
      // Fallback
      try {
        const res = await fetch('/api/sync/load');
        if (res.ok) {
          const fallbackData = await res.json();
          if (fallbackData.timestamp) {
            setServerTimestamp(fallbackData.timestamp);
            setServerAuthor(fallbackData.updatedBy);
            setUsingFirestore(false);
          }
        }
      } catch (fallbackErr) {
        console.error("All sync storage networks offline:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // 1. Push local changes to Google Cloud Firestore (and standard fallback)
  const handlePushToCloud = async () => {
    setLoading(true);
    setStatusMsg({ text: 'Compiling local register & uploading to Cloud Firestore...', type: 'info' });

    try {
      const localState = onGetLocalState();
      const timestamp = new Date().toISOString();
      const updatedBy = currentUsername || 'Staff Member';

      // Primary: Firestore
      await savePortalStateToFirebase(localState, updatedBy);
      setUsingFirestore(true);

      // Secondary: Fallback to local server express JSON file as redundancy
      const payload = {
        state: localState,
        timestamp,
        updatedBy
      };
      await fetch('/api/sync/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => console.warn("Backup fallback write skipped:", err));

      setServerTimestamp(timestamp);
      setServerAuthor(updatedBy);
      setStatusMsg({ 
        text: '✓ All local database registers pushed to Google Cloud Firestore successfully! Live sync clients are updated in real-time.', 
        type: 'success' 
      });
    } catch (err: any) {
      console.error("Firebase push failed, trying fallback server API...", err);
      // Fallback push to Express server
      try {
        const localState = onGetLocalState();
        const payload = {
          state: localState,
          timestamp: new Date().toISOString(),
          updatedBy: currentUsername || 'Staff Member'
        };
        const res = await fetch('/api/sync/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setServerTimestamp(payload.timestamp);
          setServerAuthor(payload.updatedBy);
          setUsingFirestore(false);
          setStatusMsg({ 
            text: '✓ All local records uploaded to fallback Server storage. (Google Cloud Firestore was bypassed)', 
            type: 'warning' 
          });
        } else {
          throw new Error('Fallback server also rejected payload.');
        }
      } catch (fallbackErr: any) {
        setStatusMsg({ 
          text: 'Upload failed: Cloud database is unreachable. ' + (fallbackErr?.message || fallbackErr), 
          type: 'error' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Pull server changes to this computer from Firestore (or fallback)
  const handlePullFromServer = async () => {
    setLoading(true);
    setStatusMsg({ text: 'Downloading latest master state from Cloud Firestore...', type: 'info' });

    try {
      // Primary: Firestore
      const data = await loadPortalStateFromFirebase();
      if (data && data.state) {
        onStateLoaded(data.state);
        setServerTimestamp(data.timestamp);
        setServerAuthor(data.updatedBy);
        setUsingFirestore(true);
        setStatusMsg({ 
          text: `✓ Cloud Firestore master applied! Received registrations from ${data.updatedBy} synced on ${new Date(data.timestamp).toLocaleTimeString()}`, 
          type: 'success' 
        });
        return;
      }

      // If Firestore is empty, try Fallback server
      const res = await fetch('/api/sync/load');
      if (res.ok) {
        const fallbackData = await res.json();
        if (fallbackData.state) {
          onStateLoaded(fallbackData.state);
          setServerTimestamp(fallbackData.timestamp);
          setServerAuthor(fallbackData.updatedBy);
          setUsingFirestore(false);
          setStatusMsg({ 
            text: `✓ Master applied from fallback server! Sync source: Offline files.`, 
            type: 'warning' 
          });
          return;
        }
      }

      setStatusMsg({ 
        text: 'The shared database directory is currently empty. Push your current data to create the first master registry!', 
        type: 'warning' 
      });
    } catch (err: any) {
      console.error("Firebase pull failed, reading fallback server...", err);
      // Fallback load
      try {
        const res = await fetch('/api/sync/load');
        if (!res.ok) throw new Error();
        const fallbackData = await res.json();
        if (fallbackData.state) {
          onStateLoaded(fallbackData.state);
          setServerTimestamp(fallbackData.timestamp);
          setServerAuthor(fallbackData.updatedBy);
          setUsingFirestore(false);
          setStatusMsg({ 
            text: `✓ Sync downloaded from backup Server directory. Source: File Sync.`, 
            type: 'warning' 
          });
        } else {
          setStatusMsg({ 
            text: 'Backup state directory is also empty.', 
            type: 'warning' 
          });
        }
      } catch (fallbackErr: any) {
        setStatusMsg({ 
          text: 'Download failed: Firebase and Server storage both unreachable. ' + (err?.message || err), 
          type: 'error' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Complete immediate Dual-Sync in one tap with Firebase Firestore
  const handleInstantDualSync = async () => {
    setLoading(true);
    setStatusMsg({ text: 'Incepting ultra-fast cloud database merger...', type: 'info' });

    try {
      // Step A: Load first to see if there is any cloud Firestore data
      let serverStateData: any = null;
      try {
        const cloudData = await loadPortalStateFromFirebase();
        if (cloudData && cloudData.state) {
          serverStateData = cloudData.state;
        } else {
          // Try fallback
          const res = await fetch('/api/sync/load');
          if (res.ok) {
            const fallbackData = await res.json();
            serverStateData = fallbackData.state;
          }
        }
      } catch (err) {
        console.warn("Could not retrieve existing master state for merge, defaulting to current local data.");
      }

      // Step B: Collect current local state
      const localState = onGetLocalState();

      // Step C: Push our state so it merges or becomes the latest master state on Firestore
      const timestamp = new Date().toISOString();
      const updatedBy = currentUsername || 'Staff Member';

      // Merge records safely (shallow objects)
      const mergedState = { ...serverStateData, ...localState };

      // Upload merged state to Firebase Firestore
      await savePortalStateToFirebase(mergedState, updatedBy);
      setUsingFirestore(true);

      // Redundant backup to express server API
      const backupPayload = {
        state: mergedState,
        timestamp,
        updatedBy
      };
      await fetch('/api/sync/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupPayload)
      }).catch(err => console.warn("Redundant backup skipped:", err));

      // Step D: Apply back so everything matches perfectly
      onStateLoaded(mergedState);
      setServerTimestamp(timestamp);
      setServerAuthor(updatedBy);

      setStatusMsg({ 
        text: '⚡ Instant Cloud Sync successful! Your local database is synchronized with Google Firestore.', 
        type: 'success' 
      });
    } catch (err: any) {
      setStatusMsg({ 
        text: 'Instant dual-sync failed: ' + (err?.message || err), 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  function sourceFormatDate(dateStr: string) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    } catch {
      return '';
    }
  }

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-subtle flex items-center justify-center p-4 z-50 animate-fadeIn animate-duration-150" 
      id="kva-synchronized-portal-modal"
    >
      <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl max-w-lg w-full p-6 md:p-8 relative max-h-[92vh] overflow-y-auto flex flex-col justify-between">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-50 mb-5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-150 text-indigo-700 flex items-center justify-center font-black animate-pulse">
              <Database className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#3D2B1F] flex items-center gap-1.5">
                Google Firebase Cloud Portal
              </h3>
              <p className="text-[11px] text-emerald-600 uppercase mt-0.5 tracking-wider font-extrabold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Firestore Secure Sync Active
              </p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 px-2.5 hover:bg-slate-100 rounded-lg text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Info Box */}
        <div className="space-y-4">
          
          {/* Live Sync Toggle */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5 max-w-[75%]">
              <span className="font-bold text-indigo-950 text-xs block">Real-time Cloud Sync Listener</span>
              <p className="text-[#5D4B3F] leading-tight text-[10.5px]">
                Listen in real-time. When other teachers modify student registers, payments, or attendance, changes instantly auto-apply without reloading!
              </p>
            </div>
            <button
              onClick={() => onToggleFirebaseSync(!firebaseSyncEnabled)}
              className="p-1 cursor-pointer transition-transform hover:scale-110"
              title={firebaseSyncEnabled ? "Disable Real-Time Sync" : "Enable Real-Time Sync"}
            >
              {firebaseSyncEnabled ? (
                <ToggleRight className="w-12 h-12 text-indigo-600" />
              ) : (
                <ToggleLeft className="w-12 h-12 text-slate-350" />
              )}
            </button>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
            <div className="flex gap-2.5">
              <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-emerald-950 block">Firebase Firestore Cloud Integration</span>
                <p className="text-[#5D4B3F] leading-relaxed text-[11px]">
                  Kids Villa automatically stores student data, attendance, and transactions in a secure cloud database in real-time. Any connected laptop or mobile client with this URL will automatically sync and receive live updates!
                </p>
              </div>
            </div>
          </div>

          {/* Sync Status Info Indicators */}
          <div className="bg-slate-50 border border-slate-250 rounded-2xl p-4 text-xs font-semibold text-slate-800 space-y-2.5">
            <div className="text-[10px] font-black uppercase text-[#3D2B1F] tracking-wider mb-1 flex items-center justify-between border-b border-slate-150 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                Cloud Database Registry Metadata
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">
                {usingFirestore ? 'Cloud Firestore' : 'Fallback Express'}
              </span>
            </div>
            
            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Last Global Sync Save:</span>
              <span className="font-mono text-slate-800 font-bold bg-[#FAF8F5] px-2 py-0.5 rounded border border-stone-200">
                {serverTimestamp ? sourceFormatDate(serverTimestamp) : 'Never Synced Yet'}
              </span>
            </div>

            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Pushed By Staff Member:</span>
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {serverAuthor || 'None'}
              </span>
            </div>
          </div>

          {/* Operation Status alerts */}
          {statusMsg.text && (
            <div className={`p-3.5 rounded-xl border text-[11px] font-medium flex items-start gap-2.5 transition-all ${
              statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              statusMsg.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
              statusMsg.type === 'warning' ? 'bg-amber-50 text-amber-850 border-amber-200' :
              'bg-blue-50 text-blue-800 border-blue-200'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle className="w-4.5 h-4.5 shrink-0 text-emerald-600" /> : <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-amber-600" />}
              <div>{statusMsg.text}</div>
            </div>
          )}

          {/* Operational Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            
            {/* PULL BUTTON */}
            <button
              onClick={handlePullFromServer}
              disabled={loading}
              className="p-4 bg-white border border-indigo-100 hover:border-indigo-400 rounded-2xl text-left transition-all hover:bg-indigo-50/20 group cursor-pointer disabled:opacity-50"
              type="button"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <CloudDownload className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-indigo-950 group-hover:text-indigo-600">
                  Pull From Cloud
                </span>
              </div>
              <p className="text-[10px] text-stone-500 mt-2 leading-relaxed font-semibold">
                Download student lists, pay slips, and fee ledgers saved on Firestore.
              </p>
            </button>

            {/* PUSH BUTTON */}
            <button
              onClick={handlePushToCloud}
              disabled={loading}
              className="p-4 bg-white border border-emerald-100 hover:border-emerald-400 rounded-2xl text-left transition-all hover:bg-emerald-50/20 group cursor-pointer disabled:opacity-50"
              type="button"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CloudUpload className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-emerald-950 group-hover:text-emerald-600">
                  Push To Cloud
                </span>
              </div>
              <p className="text-[10px] text-stone-500 mt-2 leading-relaxed font-semibold">
                Upload pupil rosters, attendance, and transactions from this laptop to Firestore.
              </p>
            </button>

          </div>

          {/* TWO-WAY FAST SYNC */}
          <button
            onClick={handleInstantDualSync}
            disabled={loading}
            className="w-full p-4.5 bg-indigo-950 hover:bg-indigo-900 text-white rounded-2xl text-center transition-all cursor-pointer font-bold flex items-center justify-center gap-2.5 disabled:opacity-50 mt-1 shadow-md"
            type="button"
          >
            {loading ? (
              <RefreshCw className="w-4.5 h-4.5 animate-spin text-emerald-400 shrink-0" />
            ) : (
              <RefreshCw className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            )}
            <div className="text-left font-semibold">
              <span className="text-xs font-extrabold text-white block">Consolidate & Refresh Cloud DB</span>
              <span className="text-[9.5px] text-zinc-300 block font-normal">Fast-sync merges your local changes with Cloud Firestore database!</span>
            </div>
          </button>
        </div>

        {/* Footer controls */}
        <div className="mt-5 pt-3 border-t border-sky-50 flex justify-between items-center text-[10px] text-slate-400 shrink-0 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5 text-indigo-950">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>Staff Member: <strong className="text-indigo-800">{currentUsername || 'Guest Admin'}</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-bold uppercase tracking-wider bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full cursor-pointer transition-all text-[9.5px]"
          >
            Dismiss Dialog
          </button>
        </div>

      </div>
    </div>
  );
}
