import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken, 
  findOrCreateOrdersSpreadsheet, 
  appendOrderToGoogleSheet, 
  listGoogleDriveSpreadsheets,
  SpreadsheetInfo
} from '../services/googleWorkspace';
import { GoogleSignInButton } from './GoogleSignInButton';
import { OrderDetails } from '../types';
import { 
  FileSpreadsheet, 
  HardDrive, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  ShieldCheck, 
  Sparkles,
  Loader2,
  TableProperties
} from 'lucide-react';

interface GoogleWorkspacePanelProps {
  orders?: OrderDetails[];
}

export const GoogleWorkspacePanel: React.FC<GoogleWorkspacePanelProps> = ({ orders = [] }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeSheet, setActiveSheet] = useState<SpreadsheetInfo | null>(null);
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [driveFiles, setDriveFiles] = useState<Array<{ id: string; name: string; url: string; modifiedTime: string }>>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, authToken) => {
        setUser(authUser);
        setToken(authToken);
        loadSpreadsheetAndDrive(authToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setActiveSheet(null);
        setDriveFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadSpreadsheetAndDrive = async (authToken: string) => {
    setIsLoadingSheet(true);
    setErrorMessage('');
    try {
      const sheet = await findOrCreateOrdersSpreadsheet(authToken);
      setActiveSheet(sheet);
      const files = await listGoogleDriveSpreadsheets(authToken);
      setDriveFiles(files);
    } catch (err) {
      console.error('Failed to load Google Sheet/Drive:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to connect to Google Sheets');
    } finally {
      setIsLoadingSheet(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage('');
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        await loadSpreadsheetAndDrive(result.accessToken);
      }
    } catch (err) {
      console.error('Sign in failed:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Google authentication failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setActiveSheet(null);
    setDriveFiles([]);
    setSyncStatus('');
  };

  const triggerSyncWithConfirmation = () => {
    if (!orders || orders.length === 0) {
      setSyncStatus('No active orders to sync currently.');
      return;
    }
    setShowConfirmModal(true);
  };

  const executeSync = async () => {
    setShowConfirmModal(false);
    if (!token || !activeSheet) return;

    setIsSyncing(true);
    setSyncStatus('Syncing orders to Google Sheet...');
    setErrorMessage('');

    try {
      let successCount = 0;
      for (const order of orders) {
        const ok = await appendOrderToGoogleSheet(token, activeSheet.id, order);
        if (ok) successCount++;
      }
      setSyncStatus(`Successfully synced ${successCount} order(s) to "${activeSheet.name}"!`);
    } catch (err) {
      console.error('Sync failed:', err);
      setErrorMessage('Failed to sync orders. Please check network connection.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Auth Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                Google Sheets & Drive Integration
              </h3>
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
                Live Cloud Sync
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Sync customer orders, daily sales logs & takeaway records directly into your Google Sheets and Drive.
            </p>
          </div>
        </div>

        {/* User Auth Info or Sign In button */}
        <div className="shrink-0 flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 p-1.5 pl-3 rounded-xl">
              <div className="text-right">
                <span className="text-xs font-bold text-white block leading-tight">
                  {user.displayName || 'Google Account'}
                </span>
                <span className="text-[10px] text-neutral-400 block leading-tight truncate max-w-[150px]">
                  {user.email}
                </span>
              </div>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-lg object-cover border border-neutral-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 font-bold flex items-center justify-center text-xs">
                  {user.email ? user.email[0].toUpperCase() : 'G'}
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                title="Sign out of Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <GoogleSignInButton
              onClick={handleSignIn}
              isLoading={isSigningIn}
              label="Sign in with Google"
            />
          )}
        </div>
      </div>

      {/* Main Connected Section */}
      {user ? (
        <div className="space-y-5">
          {/* Active Sheet Card */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <TableProperties className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-white">
                  Active Orders Spreadsheet
                </span>
              </div>

              {activeSheet && (
                <a
                  href={activeSheet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Google Sheets</span>
                </a>
              )}
            </div>

            {isLoadingSheet ? (
              <div className="py-6 flex items-center justify-center gap-2 text-neutral-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Checking Google Drive & Sheets...</span>
              </div>
            ) : activeSheet ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{activeSheet.name}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      ID: <span className="font-mono text-neutral-500">{activeSheet.id}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={triggerSyncWithConfirmation}
                      disabled={isSyncing}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSyncing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Syncing...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Sync Current Orders</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-400 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    Columns tracked: Timestamp, Order ID, Customer, Phone, Type, Address/Table, Items, Delivery Fee, Total, Notes, Status.
                  </span>
                </div>
              </div>
            ) : null}

            {syncStatus && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{syncStatus}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Drive Spreadsheets List */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold text-white">
                  Spreadsheets in Your Google Drive
                </span>
              </div>
              <button
                type="button"
                onClick={() => token && loadSpreadsheetAndDrive(token)}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {driveFiles.length > 0 ? (
              <div className="divide-y divide-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                {driveFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 bg-neutral-900/60 hover:bg-neutral-900 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-semibold text-neutral-200 block">{file.name}</span>
                        {file.modifiedTime && (
                          <span className="text-[10px] text-neutral-500 block">
                            Last modified: {file.modifiedTime}
                          </span>
                        )}
                      </div>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 italic py-2">
                No recent spreadsheets found in Drive.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h4 className="font-display font-bold text-base text-white">
              Connect Google Workspace (Excel & Drive)
            </h4>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <span>Owner Account:</span>
              <span className="font-mono text-white">lbreddy8143@gmail.com</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Sign in with <strong className="text-neutral-200">lbreddy8143@gmail.com</strong> to enable live order logging to Google Sheets (Excel) and automated sales backup in Google Drive.
            </p>
          </div>
          <GoogleSignInButton
            onClick={handleSignIn}
            isLoading={isSigningIn}
            label="Sign in as lbreddy8143@gmail.com"
            className="mx-auto"
          />
        </div>
      )}

      {/* Confirmation Modal for Mutating/Destructive Operation (MANDATORY per workspace-integration skill) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">
                  Confirm Google Sheets Sync
                </h4>
                <p className="text-xs text-neutral-400">
                  Update &quot;{activeSheet?.name}&quot; with {orders.length} order(s)?
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              This will append {orders.length} order record(s) including customer names, phone numbers, items, delivery distance fees, and grand totals directly into your Google Spreadsheet.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSync}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Confirm & Sync to Google Sheets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
