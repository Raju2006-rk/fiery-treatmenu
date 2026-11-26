import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  findOrCreateOrdersSpreadsheet,
  appendOrderToGoogleSheet,
  appendOrdersBatchToGoogleSheet,
  listGoogleDriveSpreadsheets,
  fetchSpreadsheetDetails,
  getActiveSavedSpreadsheet,
  setActiveSavedSpreadsheet,
  extractSpreadsheetId,
  getAppsScriptUrl,
  setAppsScriptUrl,
  testAppsScriptConnection,
  sendOrderToAppsScript,
  exportOrdersToExcelCsv,
  APPS_SCRIPT_TEMPLATE_CODE,
  APPS_SCRIPT_MANIFEST_CODE,
  SpreadsheetInfo,
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
  ChevronDown,
  ChevronUp,
  Download,
  Clock,
  ShoppingBag,
} from 'lucide-react';

interface GoogleWorkspacePanelProps {
  orders?: OrderDetails[];
  onOrdersSynced?: (
    orderIds: string[],
    channel: 'sheets_api' | 'apps_script' | 'both'
  ) => void;
}

export const GoogleWorkspacePanel: React.FC<GoogleWorkspacePanelProps> = ({
  orders = [],
  onOrdersSynced,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeSheet, setActiveSheet] = useState<SpreadsheetInfo | null>(
    getActiveSavedSpreadsheet()
  );
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [driveFiles, setDriveFiles] = useState<
    Array<{ id: string; name: string; url: string; modifiedTime: string }>
  >([]);
  const [confirmAction, setConfirmAction] = useState<
    null | { mode: 'pending' | 'all' | 'test' }
  >(null);

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

  const pendingOrders = useMemo(
    () => orders.filter((o) => !o.syncedToSheet),
    [orders]
  );
  const syncedOrdersCount = orders.length - pendingOrders.length;

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
      try {
        const files = await listGoogleDriveSpreadsheets(authToken);
        setDriveFiles(files);
      } catch (driveErr: any) {
        console.warn('Drive list warning:', driveErr);
        setDriveFiles([]);
      }
    } catch (err: any) {
      console.error('Google Sheets/Drive connection error:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to connect to Google Sheets & Drive. Please reconnect your Google Account.'
      );
    } finally {
      setIsLoadingSheet(false);
    }
  };

  const handleSignIn = async (forceConsent = false) => {
    setIsSigningIn(true);
    setErrorMessage('');
    setSyncStatus('');
    try {
      const result = await googleSignIn(forceConsent);
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        await loadSpreadsheetAndDrive(result.accessToken);
      }
    } catch (err) {
      console.error('Sign in failed:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Google authentication failed'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setDriveFiles([]);
    setSyncStatus('');
    setErrorMessage('');
  };

  const handleSelectDriveFile = (file: { id: string; name: string; url: string }) => {
    const newSheet: SpreadsheetInfo = {
      id: file.id,
      name: file.name,
      url: file.url,
    };
    setActiveSheet(newSheet);
    setActiveSavedSpreadsheet(newSheet);
    setSyncStatus(`Active spreadsheet switched to: "${file.name}"`);
    setErrorMessage('');
  };

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
        const manualInfo: SpreadsheetInfo = {
          id: cleanId,
          name: 'Custom Linked Sheet',
          url: `https://docs.google.com/spreadsheets/d/${cleanId}/edit`,
        };
        setActiveSheet(manualInfo);
        setActiveSavedSpreadsheet(manualInfo);
        setCustomLinkStatus(
          'Saved spreadsheet ID! Sign in with Google above to authorize live syncing.'
        );
        setCustomSheetInput('');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to verify spreadsheet.');
    } finally {
      setIsLinkingCustom(false);
    }
  };

  const executeConfirmedAction = async () => {
    const action = confirmAction;
    setConfirmAction(null);
    if (!action) return;

    if (action.mode === 'test') {
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
              name: 'Chicken Dum Biryani (Sync Test)',
              category: 'biryani',
              price: 120,
              description: 'Test dish for sync verification',
              image: '',
              isVeg: false,
              inStock: true,
              isBestseller: true,
              tags: ['test', 'biryani'],
            },
            quantity: 1,
          },
        ],
        orderType: 'takeaway',
        customerName: user?.displayName || 'Test Order',
        customerPhone: '9876543210',
        address: 'Pachikapalem Verification Counter',
        subtotal: 120,
        deliveryFee: 0,
        grandTotal: 120,
        instructions: 'Google Sheet Sync verification row',
        timestamp: Date.now(),
        status: 'new',
      };

      try {
        const result = await appendOrderToGoogleSheet(token, activeSheet.id, testOrder);
        if (result.success) {
          setSyncStatus(
            `Verification test row appended to "${activeSheet.name}"! Open the sheet to confirm.`
          );
        } else {
          setErrorMessage(result.error || 'Failed to append test row.');
          setSyncStatus('');
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Error communicating with Google Sheets API.');
        setSyncStatus('');
      } finally {
        setIsSendingTest(false);
      }
      return;
    }

    // Sync pending or all orders
    const targetOrders = action.mode === 'pending' ? pendingOrders : orders;
    if (targetOrders.length === 0) {
      setSyncStatus('All orders are already synced!');
      return;
    }

    const scriptUrl = getAppsScriptUrl();
    if (!token && !scriptUrl) {
      setErrorMessage(
        'Please sign in with Google or configure a Google Apps Script URL before syncing.'
      );
      return;
    }

    setIsSyncing(true);
    setSyncStatus(`Syncing ${targetOrders.length} order(s) to your connected sheet...`);
    setErrorMessage('');

    try {
      let syncedIds: string[] = [];
      let skippedCount = 0;
      let usedSheetsApi = false;
      let usedAppsScript = false;

      if (token && activeSheet?.id) {
        const batchRes = await appendOrdersBatchToGoogleSheet(
          token,
          activeSheet.id,
          targetOrders
        );
        if (!batchRes.success) {
          throw new Error(batchRes.error || 'Google Sheets sync failed.');
        }
        usedSheetsApi = true;
        syncedIds = batchRes.appendedIds;
        skippedCount = batchRes.skippedCount;
      } else if (scriptUrl) {
        for (const order of targetOrders) {
          const ok = await sendOrderToAppsScript(scriptUrl, order);
          if (ok) syncedIds.push(order.id);
        }
        usedAppsScript = syncedIds.length > 0;
      }

      const channel: 'sheets_api' | 'apps_script' | 'both' =
        usedSheetsApi && usedAppsScript
          ? 'both'
          : usedSheetsApi
          ? 'sheets_api'
          : 'apps_script';

      const idsToMark =
        action.mode === 'all' || skippedCount > 0
          ? targetOrders.map((o) => o.id)
          : syncedIds;

      if (idsToMark.length > 0) {
        onOrdersSynced?.(idsToMark, channel);
      }

      if (syncedIds.length > 0 && skippedCount > 0) {
        setSyncStatus(
          `Synced ${syncedIds.length} new order(s) to "${activeSheet?.name || 'Google Sheet'}" (${skippedCount} already in sheet were skipped to prevent duplicates).`
        );
      } else if (syncedIds.length > 0) {
        setSyncStatus(
          `Successfully synced ${syncedIds.length} order(s) to "${activeSheet?.name || 'Google Sheet'}"!`
        );
      } else if (skippedCount > 0) {
        setSyncStatus(
          `All ${skippedCount} order(s) are already recorded in "${activeSheet?.name || 'Google Sheet'}" (no duplicates added).`
        );
      }
    } catch (err: any) {
      console.error('Sync failed:', err);
      setErrorMessage(
        err?.message || 'Failed to sync orders. Please reconnect your Google Account and retry.'
      );
      setSyncStatus('');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveAppsScriptUrl = () => {
    setAppsScriptUrl(appsScriptInput);
    setScriptStatus('Apps Script Webhook URL saved! All new customer orders will auto-push 24/7.');
  };

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

  const canDirectSync = Boolean(token && activeSheet?.id);
  const hasAppsScript = Boolean(getAppsScriptUrl());

  return (
    <div className="space-y-5">
      {/* Top Banner / Auth Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                Google Sheets &amp; Drive Sync
              </h3>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  canDirectSync || hasAppsScript
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                {canDirectSync
                  ? 'Google Connected'
                  : hasAppsScript
                  ? '24/7 Webhook Active'
                  : 'Connect to Sync'}
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Automatically log every customer order into your connected Google Sheet or export to Excel (.csv).
            </p>
          </div>
        </div>

        {/* User Auth Info or Sign In button */}
        <div className="shrink-0 flex items-center gap-2">
          {user && token ? (
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
                type="button"
                onClick={handleSignOut}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Sign out of Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <GoogleSignInButton
              onClick={() => handleSignIn(false)}
              isLoading={isSigningIn}
              label="Sign in with Google"
            />
          )}
        </div>
      </div>

      {/* SECTION 1: ACTIVE CONNECTED SPREADSHEET */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white">
              Active Connected Spreadsheet
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => exportOrdersToExcelCsv(orders)}
              disabled={orders.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Download orders as Excel-compatible CSV file"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Excel (.csv)</span>
            </button>

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
        </div>

        {isLoadingSheet ? (
          <div className="py-6 flex items-center justify-center gap-2 text-neutral-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Connecting to Google Drive &amp; Sheets...</span>
          </div>
        ) : activeSheet ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between flex-wrap gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-white">{activeSheet.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 border ${
                      canDirectSync
                        ? 'bg-emerald-950 border-emerald-700/60 text-emerald-300'
                        : 'bg-amber-950 border-amber-700/60 text-amber-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {canDirectSync ? 'Live Sync Ready' : 'Sign in to Sync'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Spreadsheet ID:{' '}
                  <span className="font-mono text-neutral-300 select-all">
                    {activeSheet.id}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {canDirectSync && (
                  <button
                    type="button"
                    onClick={() => setConfirmAction({ mode: 'test' })}
                    disabled={isSendingTest}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs flex items-center gap-1.5 border border-neutral-700 transition-all cursor-pointer disabled:opacity-50"
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
                  onClick={() =>
                    setConfirmAction({
                      mode: pendingOrders.length > 0 ? 'pending' : 'all',
                    })
                  }
                  disabled={isSyncing || (!canDirectSync && !hasAppsScript) || orders.length === 0}
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
                      <span>
                        {pendingOrders.length > 0
                          ? `Sync Pending Orders (${pendingOrders.length})`
                          : `Sync All Orders (${orders.length})`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                12 columns logged: Timestamp, Order ID, Customer, Phone, Type, Address/Table, Items, Subtotal, Delivery Fee, Grand Total, Instructions, Status.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-center space-y-2">
            <p className="text-xs text-neutral-400">
              Sign in with Google above to automatically connect or create your Firey Treat Orders spreadsheet in Google Drive, or paste an existing sheet link below.
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
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => handleSignIn(true)}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] cursor-pointer shrink-0"
            >
              Reconnect Google
            </button>
          </div>
        )}

        {/* Link Custom Sheet URL / ID */}
        <form
          onSubmit={handleLinkCustomSheet}
          className="pt-2 border-t border-neutral-800/80 space-y-2"
        >
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

      {/* SECTION 2: LIVE CUSTOMER ORDERS LOG & SYNC STATUS */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">
              Customer Orders &amp; Sheet Sync Queue ({orders.length})
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
              Synced: {syncedOrdersCount}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-300 font-bold">
              Pending: {pendingOrders.length}
            </span>
          </div>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-neutral-500 py-2">
            No customer orders recorded yet. Orders placed via the Cart will appear here and sync automatically to your connected Google Sheet.
          </p>
        ) : (
          <div className="max-h-56 overflow-y-auto divide-y divide-neutral-900 border border-neutral-800 rounded-xl">
            {orders.slice(0, 15).map((order) => (
              <div
                key={order.id}
                className="p-3 bg-neutral-900/50 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-amber-400">
                      {order.id}
                    </span>
                    <span className="font-semibold text-white truncate">
                      {order.customerName}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      ₹{order.grandTotal}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                    {order.items
                      .map((i) => `${i.menuItem.name} ×${i.quantity}`)
                      .join(', ')}
                  </p>
                </div>

                <div className="shrink-0">
                  {order.syncedToSheet ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      Synced
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950 border border-amber-700/60 text-amber-300 text-[10px] font-bold">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: GOOGLE APPS SCRIPT WEB APP (24/7 AUTOMATED SYNC FOR CUSTOMERS) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">
                24/7 Customer Order Webhook (Google Apps Script)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                Works on Any Customer Device
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Recommended so customer orders placed from any phone automatically appear in your Google Sheet even when you are not signed in.
            </p>
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
            <div className="flex gap-2 shrink-0">
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
            </div>
          </div>

          {scriptStatus && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                scriptStatus.includes('sent') ||
                scriptStatus.includes('saved') ||
                scriptStatus.includes('appeared')
                  ? 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-800/80 text-rose-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{scriptStatus}</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-neutral-800/80">
          <button
            type="button"
            onClick={() => setShowScriptCode(!showScriptCode)}
            className="w-full flex items-center justify-between text-xs text-neutral-300 hover:text-white p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">
                View Apps Script Code &amp; 3-Step Setup Guide
              </span>
            </div>
            {showScriptCode ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showScriptCode && (
            <div className="mt-3 p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-4 text-xs text-neutral-300">
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
                    Code.gs
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
                    appsscript.json
                  </button>
                </div>

                {scriptViewMode === 'code' ? (
                  <button
                    type="button"
                    onClick={handleCopyScriptCode}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {hasCopiedCode ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{hasCopiedCode ? 'Copied Code!' : 'Copy Code.gs'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCopyManifest}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {hasCopiedManifest ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {hasCopiedManifest ? 'Copied Manifest!' : 'Copy Manifest'}
                    </span>
                  </button>
                )}
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 overflow-x-auto max-h-52 text-[11px] font-mono text-neutral-300 select-all">
                <pre>
                  {scriptViewMode === 'code'
                    ? APPS_SCRIPT_TEMPLATE_CODE
                    : APPS_SCRIPT_MANIFEST_CODE}
                </pre>
              </div>

              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-neutral-300 leading-relaxed">
                <li>
                  Open your Google Sheet and click{' '}
                  <strong className="text-white">Extensions &gt; Apps Script</strong>.
                </li>
                <li>
                  Paste <strong className="text-white">Code.gs</strong> above, click Save, then click{' '}
                  <strong className="text-white">Deploy &gt; New deployment &gt; Web app</strong>.
                </li>
                <li>
                  Set <strong className="text-white">Execute as: Me</strong> and{' '}
                  <strong className="text-emerald-400">Who has access: Anyone</strong>, authorize, and paste the <code className="text-amber-300">/exec</code> URL above.
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: SPREADSHEETS IN GOOGLE DRIVE */}
      {user && token && (
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-white">
                Spreadsheets in Your Google Drive
              </span>
            </div>
            <button
              type="button"
              onClick={() => loadSpreadsheetAndDrive(token)}
              className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {driveFiles.length > 0 ? (
            <div className="divide-y divide-neutral-900 border border-neutral-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
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
                          <span className="font-semibold text-neutral-200 truncate">
                            {file.name}
                          </span>
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
              No spreadsheets found in Drive yet. Click Refresh or create a sheet above.
            </p>
          )}
        </div>
      )}

      {/* Explicit Confirmation Modal for Mutating Google Sheets Operations */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">
                  {confirmAction.mode === 'test'
                    ? 'Confirm Test Row Write'
                    : 'Confirm Google Sheets Sync'}
                </h4>
                <p className="text-xs text-neutral-400">
                  {confirmAction.mode === 'test'
                    ? `Append 1 verification row to "${activeSheet?.name}"?`
                    : `Append ${
                        confirmAction.mode === 'pending'
                          ? pendingOrders.length
                          : orders.length
                      } order(s) to "${activeSheet?.name || 'Connected Google Sheet'}"?`}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              {confirmAction.mode === 'test'
                ? 'This will write a single sample verification order row into your connected Google Spreadsheet so you can confirm live write access.'
                : 'This will append customer order details (names, phone numbers, items, fees, and totals) to your Google Spreadsheet while automatically skipping Order IDs already recorded in the sheet.'}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmedAction}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
              >
                {confirmAction.mode === 'test'
                  ? 'Confirm & Send Test Row'
                  : 'Confirm & Sync to Sheet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
