import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { OrderDetails } from '../types';

// Load Firebase configuration from environment variables with fallback to applet config
const firebaseProjectConfig = {
  apiKey:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) ||
    firebaseConfig.apiKey,
  authDomain:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) ||
    firebaseConfig.authDomain,
  projectId:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID) ||
    firebaseConfig.projectId,
  storageBucket:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) ||
    firebaseConfig.storageBucket,
  messagingSenderId:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
    firebaseConfig.messagingSenderId,
  appId:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID) ||
    firebaseConfig.appId,
};

// Ensure singleton Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseProjectConfig);
export const auth = getAuth(app);

// Google Workspace Scopes for Sheets & Drive integration
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
];

export const authProvider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => authProvider.addScope(scope));
authProvider.setCustomParameters({
  prompt: 'select_account',
});

export const SPREADSHEET_STORAGE_KEY = 'firey_treat_active_spreadsheet';
export const APPS_SCRIPT_URL_KEY = 'firey_treat_apps_script_url';

// Strictly in-memory OAuth access token cache (never persisted to localStorage/sessionStorage)
const TOKEN_TTL_MS = 50 * 60 * 1000;
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedTokenExpiresAt = 0;

export interface SpreadsheetInfo {
  id: string;
  name: string;
  url: string;
}

export const SPREADSHEET_NAME = 'Firey Treat Restaurant - Orders & Sales Log';

const ORDER_SHEET_HEADERS = [
  'Timestamp',
  'Order ID',
  'Customer Name',
  'Phone Number',
  'Order Type',
  'Address / Table',
  'Items Summary',
  'Subtotal (₹)',
  'Delivery Fee (₹)',
  'Grand Total (₹)',
  'Kitchen Instructions',
  'Status',
];

// ============================================================
// TOKEN & AUTH LIFECYCLE (IN-MEMORY ONLY)
// ============================================================

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken && Date.now() < cachedTokenExpiresAt) {
    return cachedAccessToken;
  }
  cachedAccessToken = null;
  cachedTokenExpiresAt = 0;
  return null;
};

export const clearCachedAccessToken = () => {
  cachedAccessToken = null;
  cachedTokenExpiresAt = 0;
};

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const token = await getAccessToken();
      if (token) {
        onAuthSuccess?.(user, token);
      } else if (!isSigningIn) {
        clearCachedAccessToken();
        onAuthFailure?.();
      }
    } else {
      clearCachedAccessToken();
      onAuthFailure?.();
    }
  });
};

export const googleSignIn = async (
  forceConsent = false
): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const provider = new GoogleAuthProvider();
    WORKSPACE_SCOPES.forEach((scope) => provider.addScope(scope));
    provider.setCustomParameters({
      prompt: forceConsent ? 'consent select_account' : 'select_account',
    });

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not obtain a Google Workspace access token. Please try signing in again.');
    }

    cachedAccessToken = credential.accessToken;
    cachedTokenExpiresAt = Date.now() + TOKEN_TTL_MS;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    const errMessage = error?.message || '';

    if (errMessage.includes('policy_enforced') || error?.code === 'auth/policy-enforced') {
      throw new Error(
        'Google Advanced Protection restricted direct Sheets access on this account. You can use the Google Apps Script Web App option below for automated 24/7 order logging.'
      );
    }
    if (error?.code === 'auth/unauthorized-domain') {
      const currentHost =
        typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      throw new Error(
        `Domain unauthorized: "${currentHost}" is not listed in Firebase Authorized Domains.`
      );
    }
    if (error?.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed before completion. Please try again.');
    }
    if (error?.code === 'auth/popup-blocked') {
      throw new Error(
        'Sign-in popup was blocked by your browser. Please allow popups for this site and retry.'
      );
    }
    if (error?.code === 'auth/cancelled-popup-request') {
      throw new Error('Another sign-in popup was opened. Please try again.');
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const requestDirectGoogleWorkspaceScopes = async (): Promise<string | null> => {
  const res = await googleSignIn(true);
  return res?.accessToken || null;
};

export const logout = async () => {
  await signOut(auth);
  clearCachedAccessToken();
};

// ============================================================
// SPREADSHEET STORAGE & HELPERS
// ============================================================

export function getActiveSavedSpreadsheet(): SpreadsheetInfo | null {
  try {
    const raw = localStorage.getItem(SPREADSHEET_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

export function setActiveSavedSpreadsheet(sheet: SpreadsheetInfo | null) {
  try {
    if (sheet) {
      localStorage.setItem(SPREADSHEET_STORAGE_KEY, JSON.stringify(sheet));
    } else {
      localStorage.removeItem(SPREADSHEET_STORAGE_KEY);
    }
  } catch {}
}

export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  return trimmed;
}

function quoteSheetTab(tabTitle: string): string {
  return `'${tabTitle.replace(/'/g, "''")}'`;
}

function parseGoogleApiError(status: number, rawBody: string): string {
  try {
    const parsed = JSON.parse(rawBody);
    const msg = parsed?.error?.message;
    if (status === 401) {
      clearCachedAccessToken();
      return 'Your Google session expired. Please click "Sign in with Google" to reconnect.';
    }
    if (status === 403) {
      return (
        msg ||
        'Permission denied by Google Sheets/Drive. Please reconnect and grant Sheets & Drive permissions.'
      );
    }
    if (msg) return msg;
  } catch {}
  return rawBody || `Google API request failed (HTTP ${status})`;
}

export async function fetchSpreadsheetDetails(
  token: string,
  spreadsheetId: string
): Promise<SpreadsheetInfo | null> {
  const id = extractSpreadsheetId(spreadsheetId);
  if (!id) return null;

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      id
    )}?fields=spreadsheetId,properties(title),spreadsheetUrl`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(parseGoogleApiError(res.status, errText));
  }

  const data = await res.json();
  return {
    id: data.spreadsheetId,
    name: data.properties?.title || 'Connected Spreadsheet',
    url:
      data.spreadsheetUrl ||
      `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
  };
}

// ============================================================
// FIND OR CREATE ORDERS SPREADSHEET
// ============================================================

export async function findOrCreateOrdersSpreadsheet(
  token: string,
  preferredId?: string
): Promise<SpreadsheetInfo> {
  // 1. Verify preferred or already saved spreadsheet first
  const targetId = preferredId
    ? extractSpreadsheetId(preferredId)
    : getActiveSavedSpreadsheet()?.id;

  if (targetId) {
    try {
      const details = await fetchSpreadsheetDetails(token, targetId);
      if (details) {
        setActiveSavedSpreadsheet(details);
        return details;
      }
    } catch (e) {
      console.warn('Saved spreadsheet could not be verified, searching Drive:', e);
    }
  }

  // 2. Search Google Drive for existing Firey Treat spreadsheet by name
  try {
    const escapedName = SPREADSHEET_NAME.replace(/'/g, "\\'");
    const params = new URLSearchParams({
      q: `name='${escapedName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: 'files(id,name,webViewLink)',
      pageSize: '5',
    });

    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        const existing = data.files[0];
        const info: SpreadsheetInfo = {
          id: existing.id,
          name: existing.name,
          url:
            existing.webViewLink ||
            `https://docs.google.com/spreadsheets/d/${existing.id}/edit`,
        };
        setActiveSavedSpreadsheet(info);
        return info;
      }
    } else if (searchRes.status === 401) {
      throw new Error(parseGoogleApiError(searchRes.status, await searchRes.text()));
    }
  } catch (driveErr: any) {
    if (driveErr?.message?.includes('session expired')) {
      throw driveErr;
    }
    console.warn('Drive search warning:', driveErr);
  }

  // 3. Create new Google Spreadsheet with structured Orders headers
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_NAME,
      },
      sheets: [
        {
          properties: {
            title: 'Orders',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: ORDER_SHEET_HEADERS.map((h) => ({
                    userEnteredValue: { stringValue: h },
                  })),
                },
              ],
            },
          ],
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(parseGoogleApiError(createRes.status, errText));
  }

  const createdData = await createRes.json();
  const info: SpreadsheetInfo = {
    id: createdData.spreadsheetId,
    name: SPREADSHEET_NAME,
    url:
      createdData.spreadsheetUrl ||
      `https://docs.google.com/spreadsheets/d/${createdData.spreadsheetId}/edit`,
  };
  setActiveSavedSpreadsheet(info);
  return info;
}

// ============================================================
// RESOLVE TARGET SHEET TAB & HEADER CHECK
// ============================================================

async function resolveOrdersSheetTab(token: string, spreadsheetId: string): Promise<string> {
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}?fields=sheets(properties(sheetId,title))`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!metaRes.ok) {
    const errText = await metaRes.text();
    throw new Error(parseGoogleApiError(metaRes.status, errText));
  }

  const meta = await metaRes.json();
  const existingSheets = meta.sheets || [];
  const ordersSheet = existingSheets.find(
    (s: any) => s.properties?.title?.toLowerCase() === 'orders'
  );

  if (ordersSheet?.properties?.title) {
    return ordersSheet.properties.title;
  }
  if (existingSheets.length > 0 && existingSheets[0]?.properties?.title) {
    return existingSheets[0].properties.title;
  }
  return 'Orders';
}

async function ensureSheetHeaders(
  token: string,
  spreadsheetId: string,
  tabTitle: string
): Promise<void> {
  const checkRange = `${quoteSheetTab(tabTitle)}!A1:B1`;
  const checkRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(checkRange)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  let needsHeaders = false;
  if (checkRes.ok) {
    const data = await checkRes.json();
    if (!data.values || data.values.length === 0 || !data.values[0]?.[0]) {
      needsHeaders = true;
    }
  }

  if (needsHeaders) {
    const headerRange = `${quoteSheetTab(tabTitle)}!A1:L1`;
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        spreadsheetId
      )}/values/${encodeURIComponent(headerRange)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [ORDER_SHEET_HEADERS] }),
      }
    );
  }
}

export async function readExistingOrderIdsFromSheet(
  token: string,
  spreadsheetId: string
): Promise<Set<string>> {
  const existingIds = new Set<string>();
  try {
    const tabTitle = await resolveOrdersSheetTab(token, spreadsheetId);
    const range = `${quoteSheetTab(tabTitle)}!B2:B2000`;
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        spreadsheetId
      )}/values/${encodeURIComponent(range)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.ok) {
      const data = await res.json();
      (data.values || []).forEach((row: string[]) => {
        if (row?.[0]) {
          existingIds.add(String(row[0]).trim());
        }
      });
    }
  } catch (err) {
    console.warn('Could not read existing order IDs from sheet:', err);
  }
  return existingIds;
}

// ============================================================
// FORMAT & APPEND ORDER ROW TO GOOGLE SHEET
// ============================================================

function formatOrderRowValues(order: OrderDetails): Array<string | number> {
  const itemsSummary =
    order.items && order.items.length > 0
      ? order.items.map((item) => `${item.menuItem.name} x${item.quantity}`).join(', ')
      : 'Order Verification Test';

  const dateStr = new Date(order.timestamp).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return [
    dateStr,
    order.id,
    order.customerName || 'Guest Customer',
    order.customerPhone || 'N/A',
    order.orderType === 'delivery'
      ? 'Home Delivery'
      : order.orderType === 'dine_in'
      ? 'Dine-In'
      : 'Takeaway / Parcel',
    order.address || order.tableNumber || 'Counter / Pachikapalem Hub',
    itemsSummary,
    order.subtotal,
    order.deliveryFee,
    order.grandTotal,
    order.instructions || '',
    (order.status || 'NEW').toUpperCase(),
  ];
}

export async function appendOrderToGoogleSheet(
  token: string,
  spreadsheetId: string,
  order: OrderDetails
): Promise<{ success: boolean; error?: string }> {
  try {
    const targetSheetTitle = await resolveOrdersSheetTab(token, spreadsheetId);
    await ensureSheetHeaders(token, spreadsheetId, targetSheetTitle);

    const rowValues = formatOrderRowValues(order);
    const appendRange = `${quoteSheetTab(targetSheetTitle)}!A:L`;
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(
      appendRange
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const response = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowValues],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: parseGoogleApiError(response.status, errText) };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to append order to Google Sheet.',
    };
  }
}

export async function appendOrdersBatchToGoogleSheet(
  token: string,
  spreadsheetId: string,
  ordersToSync: OrderDetails[]
): Promise<{
  success: boolean;
  appendedIds: string[];
  skippedCount: number;
  error?: string;
}> {
  if (!ordersToSync.length) {
    return { success: true, appendedIds: [], skippedCount: 0 };
  }

  try {
    const targetSheetTitle = await resolveOrdersSheetTab(token, spreadsheetId);
    await ensureSheetHeaders(token, spreadsheetId, targetSheetTitle);

    const existingIds = await readExistingOrderIdsFromSheet(token, spreadsheetId);
    const newOrders = ordersToSync.filter((o) => !existingIds.has(o.id.trim()));
    const skippedCount = ordersToSync.length - newOrders.length;

    if (newOrders.length === 0) {
      return {
        success: true,
        appendedIds: [],
        skippedCount,
      };
    }

    // Oldest first so spreadsheet reads chronologically top-to-bottom
    const chronological = [...newOrders].sort((a, b) => a.timestamp - b.timestamp);
    const rows = chronological.map(formatOrderRowValues);

    const appendRange = `${quoteSheetTab(targetSheetTitle)}!A:L`;
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(
      appendRange
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const response = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: rows }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        appendedIds: [],
        skippedCount,
        error: parseGoogleApiError(response.status, errText),
      };
    }

    return {
      success: true,
      appendedIds: chronological.map((o) => o.id),
      skippedCount,
    };
  } catch (err: any) {
    return {
      success: false,
      appendedIds: [],
      skippedCount: 0,
      error: err?.message || 'Failed to sync orders batch to Google Sheet.',
    };
  }
}

// ============================================================
// GOOGLE DRIVE SPREADSHEETS LIST
// ============================================================

export async function listGoogleDriveSpreadsheets(
  token: string
): Promise<Array<{ id: string; name: string; url: string; modifiedTime: string }>> {
  const params = new URLSearchParams({
    q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
    orderBy: 'modifiedTime desc',
    pageSize: '20',
    fields: 'files(id,name,webViewLink,modifiedTime)',
  });

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(parseGoogleApiError(res.status, errText));
  }

  const data = await res.json();
  return (data.files || []).map(
    (f: { id: string; name: string; webViewLink?: string; modifiedTime?: string }) => ({
      id: f.id,
      name: f.name,
      url: f.webViewLink || `https://docs.google.com/spreadsheets/d/${f.id}/edit`,
      modifiedTime: f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString() : '',
    })
  );
}

// ============================================================
// EXCEL / CSV EXPORT HELPER
// ============================================================

export function exportOrdersToExcelCsv(orders: OrderDetails[]) {
  const escapeCsvCell = (value: string | number) => {
    const str = String(value ?? '');
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = [ORDER_SHEET_HEADERS, ...orders.map(formatOrderRowValues)];
  const csvContent =
    '\uFEFF' + rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `firey_treat_orders_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// ============================================================
// GOOGLE APPS SCRIPT WEB APP INTEGRATION (24/7 AUTOMATED SYNC)
// ============================================================

export const APPS_SCRIPT_MANIFEST_CODE = `{
  "timeZone": "Asia/Kolkata",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets.currentonly"
  ]
}`;

export const APPS_SCRIPT_TEMPLATE_CODE = `/** @OnlyCurrentDoc */
// FIREY TREAT RESTAURANT - GOOGLE APPS SCRIPT ORDERS SYNC WEB APP
// Deploy as Web App -> Execute as: Me -> Who has access: Anyone

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Orders") || ss.getActiveSheet();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Order ID",
        "Customer Name",
        "Phone Number",
        "Order Type",
        "Address / Table",
        "Items Summary",
        "Subtotal (₹)",
        "Delivery Fee (₹)",
        "Grand Total (₹)",
        "Kitchen Instructions",
        "Status"
      ]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#FDE68A");
    }

    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    sheet.appendRow([
      data.dateStr || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      data.id || "FT-" + Utilities.getUuid().substring(0, 6).toUpperCase(),
      data.customerName || "Guest",
      data.customerPhone || "N/A",
      data.orderType || "Order",
      data.address || "Pachikapalem Counter",
      data.itemsSummary || "Dishes",
      Number(data.subtotal) || 0,
      Number(data.deliveryFee) || 0,
      Number(data.grandTotal) || 0,
      data.instructions || "",
      (data.status || "NEW").toUpperCase()
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", orderId: data.id }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "ready",
      message: "Firey Treat Restaurant Orders Webhook is active."
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export function getAppsScriptUrl(): string {
  try {
    return localStorage.getItem(APPS_SCRIPT_URL_KEY) || '';
  } catch {
    return '';
  }
}

export function setAppsScriptUrl(url: string) {
  try {
    if (url && url.trim()) {
      localStorage.setItem(APPS_SCRIPT_URL_KEY, url.trim());
    } else {
      localStorage.removeItem(APPS_SCRIPT_URL_KEY);
    }
  } catch {}
}

export async function sendOrderToAppsScript(
  scriptUrl: string,
  order: OrderDetails
): Promise<boolean> {
  const url = (scriptUrl || getAppsScriptUrl()).trim();
  if (!url || !url.startsWith('http')) {
    return false;
  }

  const itemsSummary =
    order.items && order.items.length > 0
      ? order.items.map((item) => `${item.menuItem.name} x${item.quantity}`).join(', ')
      : 'Order Verification Test';

  const dateStr = new Date(order.timestamp).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const payload = {
    dateStr,
    id: order.id,
    customerName: order.customerName || 'Customer',
    customerPhone: order.customerPhone || 'N/A',
    orderType:
      order.orderType === 'delivery'
        ? 'Home Delivery'
        : order.orderType === 'dine_in'
        ? 'Dine-In'
        : 'Takeaway / Parcel',
    address: order.address || order.tableNumber || 'Counter / Pachikapalem Hub',
    itemsSummary,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    grandTotal: order.grandTotal,
    instructions: order.instructions || '',
    status: (order.status || 'NEW').toUpperCase(),
  };

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (err) {
    console.error('Failed to post order to Google Apps Script:', err);
    return false;
  }
}

export async function testAppsScriptConnection(
  scriptUrl: string
): Promise<{ success: boolean; message: string }> {
  const url = scriptUrl.trim();
  if (!url || !url.startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      message:
        'Please enter a valid Google Apps Script Web App URL starting with "https://script.google.com/macros/s/..." and ending with "/exec".',
    };
  }

  const testOrder: OrderDetails = {
    id: `TEST-${Date.now().toString().slice(-4)}`,
    items: [],
    orderType: 'takeaway',
    customerName: 'Owner Sync Verification',
    customerPhone: '9876543210',
    address: 'Pachikapalem Main Counter',
    subtotal: 100,
    deliveryFee: 0,
    grandTotal: 100,
    instructions: 'Google Apps Script connection verification test',
    timestamp: Date.now(),
    status: 'new',
  };

  try {
    const sent = await sendOrderToAppsScript(url, testOrder);
    if (!sent) {
      return {
        success: false,
        message: 'Could not reach the Apps Script URL. Verify the Web App is deployed with access set to "Anyone".',
      };
    }
    return {
      success: true,
      message:
        'Test order sent to Google Apps Script! Open your Google Sheet to confirm the new test row appeared.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to send test request to Google Apps Script.',
    };
  }
}

// ============================================================
// UNIFIED ORDER DISPATCHER (PUSHES TO ALL CONFIGURED CHANNELS)
// ============================================================

export async function pushOrderToAllGoogleChannels(
  order: OrderDetails,
  token?: string | null
): Promise<{
  appsScript: boolean;
  sheetsApi: boolean;
  synced: boolean;
  channel?: 'sheets_api' | 'apps_script' | 'both';
  error?: string;
}> {
  let appsScriptSuccess = false;
  let sheetsApiSuccess = false;
  let lastError: string | undefined;

  // 1. Direct Google Sheets API via in-memory OAuth token
  const effectiveToken = token || (await getAccessToken());
  if (effectiveToken) {
    try {
      let activeSheet = getActiveSavedSpreadsheet();
      if (!activeSheet?.id) {
        activeSheet = await findOrCreateOrdersSpreadsheet(effectiveToken);
      }
      if (activeSheet?.id) {
        const res = await appendOrderToGoogleSheet(effectiveToken, activeSheet.id, order);
        sheetsApiSuccess = res.success;
        if (!res.success && res.error) {
          lastError = res.error;
        }
      }
    } catch (e: any) {
      console.error('Direct Google Sheet API push error:', e);
      lastError = e?.message || 'Direct Google Sheets API error';
    }
  }

  // 2. Google Apps Script Web App (24/7 direct sheet push even when owner is signed out)
  const scriptUrl = getAppsScriptUrl();
  if (scriptUrl) {
    try {
      appsScriptSuccess = await sendOrderToAppsScript(scriptUrl, order);
    } catch (e: any) {
      console.error('Apps Script push error:', e);
      if (!lastError) lastError = e?.message;
    }
  }

  const synced = sheetsApiSuccess || appsScriptSuccess;
  const channel: 'sheets_api' | 'apps_script' | 'both' | undefined =
    sheetsApiSuccess && appsScriptSuccess
      ? 'both'
      : sheetsApiSuccess
      ? 'sheets_api'
      : appsScriptSuccess
      ? 'apps_script'
      : undefined;

  return {
    appsScript: appsScriptSuccess,
    sheetsApi: sheetsApiSuccess,
    synced,
    channel,
    error: synced ? undefined : lastError,
  };
}
