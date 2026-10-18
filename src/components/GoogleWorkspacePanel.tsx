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
  fetchSpreadsheetDetails,
  getActiveSavedSpreadsheet,
  setActiveSavedSpreadsheet,
  extractSpreadsheetId,
  getAppsScriptUrl,
  setAppsScriptUrl,
  testAppsScriptConnection,
  sendOrderToAppsScript,
  DEFAULT_SPREADSHEET_ID,
  DEFAULT_SPREADSHEET_URL,
  DEFAULT_APPS_SCRIPT_URL,
  APPS_SCRIPT_TEMPLATE_CODE,
  APPS_SCRIPT_MANIFEST_CODE,
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
  TableProperties,
  Link,
  Code,
  Copy,
  Check,
  Send,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface GoogleWorkspacePanelProps {
  orders?: OrderDetails[];
}

export const GoogleWorkspacePanel: React.FC<GoogleWorkspacePanelProps> = ({ orders = [] }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeSheet, setActiveSheet] = useState<SpreadsheetInfo | null>(getActiveSavedSpreadsheet());
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [driveFiles, setDriveFiles] = useState<Array<{ id: string; name: string; url: string; modifiedTime: string }>>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Custom sheet linking state
  const [customSheetInput, setCustomSheetInput] = useState('');
  const [isLinkingCustom, setIsLinkingCustom] = useState(false);
  const [customLinkStatus, setCustomLinkStatus] = useState<string>('');

  // Google Apps Script state
  const [appsScriptInput, setAppsScriptInput] = useState<string>(getAppsScriptUrl());
  const [isTestingScript, setIsTestingScript] = useState(false);
  const [scriptStatus, setScriptStatus] = useState<string>('');
  const [showScriptCode, setShowScriptCode] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [scriptViewMode, setScriptViewMode] = useState<'code' | 'manifest'>('code');
  const [hasCopiedManifest, setHasCopiedManifest] = useState(false);
  const [isSyncingViaScript, setIsSyncingViaScript] = useState(false);

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
      }
    );
    return () => unsubscribe();
  }, []);

  const loadSpreadsheetAndDrive = async (authToken: string | null) => {
    if (!authToken) {
      setIsLoadingSheet(false);
      return;
    }
    setIsLoadingSheet(true);
    setErrorMessage('');
    try {
      const sheet = await findOrCreateOrdersSpreadsheet(authToken);
      setActiveSheet(sheet);
      const files = await listGoogleDriveSpreadsheets(authToken);
      setDriveFiles(files);
    } catch (err: any) {
      console.warn('Direct Google Sheet/Drive OAuth access unavailable:', err);
      const isPolicyOrForbidden = err?.message?.includes('policy') || err?.message?.includes('403') || err?.message?.includes('Insufficient');
      if (isPolicyOrForbidden) {
        setErrorMessage(
          'Google Advanced Protection is active: Direct Google Drive/Sheets OAuth access is protected by your Google Account security policy. Your basic account authentication succeeded! Please use the Google Apps Script Web App below for seamless 24/7 order synchronization without third-party permissions.'
        );
      } else {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to connect to Google Sheets');
      }
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
        if (result.accessToken) {
          await loadSpreadsheetAndDrive(result.accessToken);
        }
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
    setSyncStatus('');
  };

  // Switch active sheet to one of the user's Drive spreadsheets
  const handleSelectDriveFile = async (file: { id: string; name: string; url: string }) => {
    const newSheet: SpreadsheetInfo = {
      id: file.id,
      name: file.name,
      url: file.url
    };
    setActiveSheet(newSheet);
    setActiveSavedSpreadsheet(newSheet);
    setSyncStatus(`Active spreadsheet switched to: "${file.name}"`);
  };

  // Link custom spreadsheet by URL or ID
  const handleLinkCustomSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSheetInput.trim()) return;

    setIsLinkingCustom(true);
    setCustomLinkStatus('');
    setErrorMessage('');

    try {
      const cleanId = extractSpreadsheetId(customSheetInput);
      if (!cleanId) {
        throw new Error('Please enter a valid Google Sheet URL or ID.');
      }

      if (token) {
        const details = await fetchSpreadsheetDetails(token, cleanId);
        if (details) {
          setActiveSheet(details);
          setActiveSavedSpreadsheet(details);
          setCustomLinkStatus(`Connected successfully to "${details.name}"!`);
          setCustomSheetInput('');
        }
      } else {
        // If not signed in with OAuth, store it for reference
        const manualInfo: SpreadsheetInfo = {
          id: cleanId,
          name: 'Custom Linked Sheet',
          url: `https://docs.google.com/spreadsheets/d/${cleanId}/edit`
        };
        setActiveSheet(manualInfo);
        setActiveSavedSpreadsheet(manualInfo);
        setCustomLinkStatus('Saved spreadsheet ID! Sign in with your Google Account to authorize sync.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to verify spreadsheet.');
    } finally {
      setIsLinkingCustom(false);
    }
  };

  // Send a test order row directly to active sheet
  const handleSendTestRow = async () => {
    if (!token || !activeSheet) return;

    setIsSendingTest(true);
    setSyncStatus('Sending verification test row to Google Sheet...');
    setErrorMessage('');

    const testOrder: OrderDetails = {
      id: `TEST-${Date.now().toString().slice(-4)}`,
      items: [
        {
          menuItem: {
            id: 'test-dish',
            name: 'Chicken Dum Biryani (Test)',
            category: 'biryani',
            price: 180,
            description: 'Test dish for sync verification',
            image: '',
            isVeg: false,
            inStock: true,
            isBestseller: true,
            tags: ['test', 'biryani']
          },
          quantity: 1
        }
      ],
      orderType: 'takeaway',
      customerName: user?.displayName || 'Test Order',
      customerPhone: '9876543210',
      address: 'Pachikapalem Verification Counter',
      subtotal: 180,
      deliveryFee: 0,
      grandTotal: 180,
      instructions: 'Google Sheet Sync verification row',
      timestamp: Date.now(),
      status: 'new'
    };

    try {
      const result = await appendOrderToGoogleSheet(token, activeSheet.id, testOrder);
      if (result.success) {
        setSyncStatus(`Verification row sent successfully! Check "${activeSheet.name}" to view the test order.`);
      } else {
        setErrorMessage(result.error || 'Failed to append test row.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error communicating with Google Sheets API.');
    } finally {
      setIsSendingTest(false);
    }
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
        const res = await appendOrderToGoogleSheet(token, activeSheet.id, order);
        if (res.success) successCount++;
      }
      setSyncStatus(`Successfully pushed ${successCount} order(s) to "${activeSheet.name}"!`);
    } catch (err) {
      console.error('Sync failed:', err);
      setErrorMessage('Failed to sync orders. Please check your network connection.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Save Apps Script Web App URL
  const handleSaveAppsScriptUrl = () => {
    setAppsScriptUrl(appsScriptInput);
    setScriptStatus('Apps Script Webhook URL saved successfully!');
  };

  // Test Apps Script connection
  const handleTestAppsScript = async () => {
    if (!appsScriptInput.trim()) {
      setScriptStatus('Please enter an Apps Script URL first.');
      return;
    }
    setIsTestingScript(true);
    setScriptStatus('Sending test order to Google Apps Script...');
    try {
      const res = await testAppsScriptConnection(appsScriptInput);
      setScriptStatus(res.message);
      if (res.success) {
        setAppsScriptUrl(appsScriptInput);
      }
    } catch (e: any) {
      setScriptStatus(e?.message || 'Failed to connect to Google Apps Script.');
    } finally {
      setIsTestingScript(false);
    }
  };

  // Push all existing orders in memory to Apps Script without requiring any login
  const handleSyncAllOrdersViaAppsScript = async () => {
    if (!orders || orders.length === 0) {
      setScriptStatus('No orders currently saved in memory to sync.');
      return;
    }
    const targetUrl = (appsScriptInput || getAppsScriptUrl()).trim();
    if (!targetUrl) {
      setScriptStatus('Please enter a valid Google Apps Script Web App URL first.');
      return;
    }
    setIsSyncingViaScript(true);
    setScriptStatus(`Transmitting ${orders.length} order(s) to owner Google Sheet via Apps Script...`);
    try {
      let count = 0;
      for (const ord of orders) {
        await sendOrderToAppsScript(targetUrl, ord);
        count++;
      }
      setScriptStatus(`Successfully transmitted ${count} order(s) to Google Apps Script! Check your Google Sheet.`);
    } catch (err: any) {
      setScriptStatus(`Sync issue: ${err?.message || 'Check connection'}`);
    } finally {
      setIsSyncingViaScript(false);
    }
  };

  const handleCopyScriptCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE_CODE);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2500);
  };

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_MANIFEST_CODE);
    setHasCopiedManifest(true);
    setTimeout(() => setHasCopiedManifest(false), 2500);
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
                Google Sheets & Workspace Sync
              </h3>
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
                Live Cloud Sync
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Synchronize restaurant orders, customer details & delivery records directly into your Google Sheets.
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
                <span className="text-[10px] text-emerald-400 block leading-tight truncate max-w-[160px] font-mono">
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

      {/* Google Advanced Protection Notice */}
      <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex items-start gap-3 text-xs text-blue-200">
        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-white block">Google Advanced Protection Compatible</span>
          <p className="text-[11px] text-blue-200/90 leading-relaxed">
            Google Sign-In uses minimal identity permissions (profile &amp; email) to preserve strict account protection. For automated Google Sheets sync without granting third-party Drive permissions, configure the <strong>Google Apps Script Web App</strong> below.
          </p>
        </div>
      </div>

      {/* SECTION 1: ACTIVE GOOGLE SHEET & DIRECT OAUTH SYNC */}
      <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white">
              Active Connected Spreadsheet
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
            <span>Connecting to Google Drive & Sheets...</span>
          </div>
        ) : activeSheet ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between flex-wrap gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-white">{activeSheet.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready for Orders
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Spreadsheet ID: <span className="font-mono text-neutral-300 select-all">{activeSheet.id}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {user && (
                  <button
                    type="button"
                    onClick={handleSendTestRow}
                    disabled={isSendingTest}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs flex items-center gap-1.5 border border-neutral-700 transition-all cursor-pointer disabled:opacity-50"
                    title="Send a sample test row to verify sheet write permissions"
                  >
                    {isSendingTest ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>Send Test Row</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={triggerSyncWithConfirmation}
                  disabled={isSyncing || !user}
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
                      <span>Sync Current Orders ({orders.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                12 columns tracked: Timestamp, Order ID, Customer, Phone, Type, Address/Table, Items, Subtotal, Delivery Fee, Grand Total, Instructions, Status.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-center space-y-2">
            <p className="text-xs text-neutral-400">
              No active spreadsheet selected yet. Sign in with Google above to automatically find or create your orders spreadsheet, or paste your Google Sheet link below.
            </p>
          </div>
        )}

        {/* Status Alerts */}
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

        {/* Link Custom Sheet URL / ID */}
        <form onSubmit={handleLinkCustomSheet} className="pt-2 border-t border-neutral-800/80 space-y-2">
          <label className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5">
            <Link className="w-3.5 h-3.5 text-amber-400" />
            <span>Target a Specific Google Sheet (Paste URL or ID):</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customSheetInput}
              onChange={(e) => setCustomSheetInput(e.target.value)}
              placeholder="e.g. https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFM.../edit"
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 font-mono"
            />
            <button
              type="submit"
              disabled={isLinkingCustom || !customSheetInput.trim()}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLinkingCustom ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Set as Active</span>
            </button>
          </div>
          {customLinkStatus && (
            <p className="text-[11px] text-emerald-400">{customLinkStatus}</p>
          )}
        </form>
      </div>

      {/* SECTION 2: GOOGLE APPS SCRIPT WEB APP (24/7 AUTOMATED SYNC) */}
      <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Google Apps Script Web App (24/7 Automated Sync)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Pushes orders to your Google Sheet automatically in real time without requiring the owner to be logged in.
              </p>
            </div>
          </div>
        </div>

        {/* Connected Owner Google Sheet Status Badge */}
        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white">Live Owner Google Sheet Destination:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-[10px] font-bold">
                Auto-Sync Enabled
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Orders placed by any customer without logging in are sent directly to this sheet.
            </p>
            <p className="text-[11px] text-neutral-300 font-mono select-all">
              ID: {DEFAULT_SPREADSHEET_ID}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={DEFAULT_SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Google Sheet</span>
            </a>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] text-neutral-400 font-medium block">
            Google Apps Script Web App URL:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={appsScriptInput}
              onChange={(e) => setAppsScriptInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 font-mono"
            />
            <div className="flex gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleSaveAppsScriptUrl}
                disabled={!appsScriptInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs border border-neutral-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                Save URL
              </button>
              <button
                type="button"
                onClick={handleTestAppsScript}
                disabled={isTestingScript || !appsScriptInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTestingScript ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Test Connection</span>
              </button>
              <button
                type="button"
                onClick={handleSyncAllOrdersViaAppsScript}
                disabled={isSyncingViaScript || orders.length === 0}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Push all saved orders to the sheet right now via Apps Script"
              >
                {isSyncingViaScript ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>Sync Stored ({orders.length})</span>
              </button>
            </div>
          </div>

          {scriptStatus && (
            <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              scriptStatus.includes('success') || scriptStatus.includes('transmitted') || scriptStatus.includes('saved')
                ? 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-800/80 text-rose-300'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{scriptStatus}</span>
            </div>
          )}
        </div>

        {/* Collapsible Apps Script Code & Setup Guide */}
        <div className="pt-2 border-t border-neutral-800/80">
          <button
            type="button"
            onClick={() => setShowScriptCode(!showScriptCode)}
            className="w-full flex items-center justify-between text-xs text-neutral-300 hover:text-white p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">View Apps Script Code & 3-Step Setup Guide</span>
            </div>
            {showScriptCode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showScriptCode && (
            <div className="mt-3 p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-4 text-xs text-neutral-300 animate-in fade-in">
              {/* Tabs for Code.gs and appsscript.json */}
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-neutral-800 pb-2.5">
                <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setScriptViewMode('code')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      scriptViewMode === 'code'
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Code.gs (Main Script)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScriptViewMode('manifest')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      scriptViewMode === 'manifest'
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    appsscript.json (Manifest)
                  </button>
                </div>

                {scriptViewMode === 'code' ? (
                  <button
                    type="button"
                    onClick={handleCopyScriptCode}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {hasCopiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{hasCopiedCode ? 'Copied Code!' : 'Copy Code.gs'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCopyManifest}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {hasCopiedManifest ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{hasCopiedManifest ? 'Copied Manifest!' : 'Copy Manifest'}</span>
                  </button>
                )}
              </div>

              {/* Code Previews */}
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 overflow-x-auto max-h-52 text-[11px] font-mono text-neutral-300 select-all">
                <pre>{scriptViewMode === 'code' ? APPS_SCRIPT_TEMPLATE_CODE : APPS_SCRIPT_MANIFEST_CODE}</pre>
              </div>

              {/* Troubleshooting Warning */}
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Fixing Error 400 &quot;policy_enforced&quot; &amp; Deployment Failures</span>
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-200/90 leading-relaxed pl-1">
                  <li>
                    <strong className="text-white">DO NOT change the Google Cloud Platform (GCP) Project:</strong> In Apps Script Project Settings, leave the GCP Project on <em className="text-amber-300">Default</em>. Do not enter any project numbers!
                  </li>
                  <li>
                    <strong className="text-white">Line 1 has <code>/** @OnlyCurrentDoc */</code>:</strong> This restricts the script to this single spreadsheet so Google Advanced Protection approves it.
                  </li>
                  <li>
                    <strong className="text-white">Delete old deployments:</strong> If you saw an error on a previous attempt, click <strong className="text-white">Deploy &gt; Manage deployments</strong>, click the trash can icon to archive the old one, then click <strong className="text-emerald-400">Deploy &gt; New deployment</strong>.
                  </li>
                </ul>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-2 text-[11px] text-neutral-300">
                <p className="font-bold text-white text-xs">Step-by-step setup instructions:</p>
                <ol className="list-decimal list-inside space-y-2 pl-1 text-neutral-300 leading-relaxed">
                  <li>
                    Open your Google Sheet in Google Drive.
                  </li>
                  <li>
                    Click <strong className="text-white">Extensions &gt; Apps Script</strong>.
                  </li>
                  <li>
                    At the top-left, click on <strong className="text-white">&quot;Untitled project&quot;</strong> and rename it to <strong className="text-amber-300">&quot;Firey Treat Orders Sync&quot;</strong> (Advanced Protection blocks apps with the literal name &quot;Untitled project&quot;).
                  </li>
                  <li>
                    In the Editor (<code className="text-neutral-400">&lt;&gt;</code> icon), delete all default code in <strong className="text-white">Code.gs</strong>, paste the script code from above (making sure <code className="text-emerald-400">/** @OnlyCurrentDoc */</code> is on line 1), and click the <strong className="text-white">Save (💾)</strong> icon.
                  </li>
                  <li>
                    Click the blue <strong className="text-white">Deploy &gt; New deployment</strong> button (top-right).
                  </li>
                  <li>
                    Click the gear icon (⚙️) next to &quot;Select type&quot; and choose <strong className="text-white">Web app</strong>.
                  </li>
                  <li>
                    Set <strong className="text-white">Execute as: Me</strong> and <strong className="text-emerald-400">Who has access: Anyone</strong> (required so live customer orders can reach your sheet).
                  </li>
                  <li>
                    Click <strong className="text-white">Deploy</strong>, then click <strong className="text-white">Authorize access</strong>.
                  </li>
                  <li>
                    Choose your Google Account, click <strong className="text-amber-200">Advanced</strong>, click <strong className="text-amber-200">Go to Firey Treat Orders Sync (unsafe)</strong>, and click <strong className="text-emerald-400">Allow</strong>.
                  </li>
                  <li>
                    Copy the generated <strong className="text-white">Web App URL</strong> (starts with <code className="text-amber-400">https://script.google.com/macros/s/</code> and ends in <code className="text-amber-400">/exec</code>) and paste it into the box above, then click <strong className="text-white">Save URL</strong> and <strong className="text-white">Test Connection</strong>!
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: RECENT SPREADSHEETS IN GOOGLE DRIVE */}
      {user && (
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
              {driveFiles.map((file) => {
                const isCurrentActive = activeSheet?.id === file.id;
                return (
                  <div
                    key={file.id}
                    className="p-3 bg-neutral-900/60 hover:bg-neutral-900 flex items-center justify-between text-xs transition-colors gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-200 truncate">{file.name}</span>
                          {isCurrentActive && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-[9px] font-bold shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                        {file.modifiedTime && (
                          <span className="text-[10px] text-neutral-500 block">
                            Last modified: {file.modifiedTime}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isCurrentActive && (
                        <button
                          type="button"
                          onClick={() => handleSelectDriveFile(file)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 text-[11px] font-semibold cursor-pointer"
                        >
                          Set as Active
                        </button>
                      )}
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 flex items-center gap-1 text-[11px] font-semibold"
                        title="Open in Google Sheets"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 italic py-2">
              No recent spreadsheets found in Drive.
            </p>
          )}
        </div>
      )}

      {/* Confirmation Modal for Mutating/Destructive Operation */}
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
              This will append {orders.length} order record(s) including customer names, phone numbers, dishes, delivery fees, and totals directly into your Google Spreadsheet.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSync}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
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
