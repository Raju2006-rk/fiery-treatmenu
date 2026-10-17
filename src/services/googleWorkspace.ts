import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { OrderDetails } from '../types';

// Ensure singleton Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google Workspace Scopes configured for Google Sheets & Google Drive
export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly'
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account'
});

const TOKEN_KEY = 'ft_google_access_token';
const TOKEN_TIME_KEY = 'ft_google_token_time';
const TOKEN_TTL_MS = 50 * 60 * 1000; // 50 minutes (Google tokens expire in 60m)
export const SPREADSHEET_STORAGE_KEY = 'firey_treat_active_spreadsheet';
export const APPS_SCRIPT_URL_KEY = 'firey_treat_apps_script_url';

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export interface SpreadsheetInfo {
  id: string;
  name: string;
  url: string;
}

export const SPREADSHEET_NAME = 'Firey Treat Restaurant - Orders & Sales Log';

// ============================================================
// TOKEN & AUTH LIFECYCLE
// ============================================================

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;

  try {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    const storedTime = sessionStorage.getItem(TOKEN_TIME_KEY);
    if (stored && storedTime) {
      const elapsed = Date.now() - parseInt(storedTime, 10);
      if (elapsed < TOKEN_TTL_MS) {
        cachedAccessToken = stored;
        return cachedAccessToken;
      } else {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_TIME_KEY);
      }
    }
  } catch (err) {
    console.warn('SessionStorage read issue:', err);
  }
  return null;
};

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const token = await getAccessToken();
      if (token) {
        if (onAuthSuccess) onAuthSuccess(user, token);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      try {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_TIME_KEY);
      } catch {}
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    try {
      sessionStorage.setItem(TOKEN_KEY, credential.accessToken);
      sessionStorage.setItem(TOKEN_TIME_KEY, Date.now().toString());
    } catch (e) {
      console.warn('Could not cache access token:', e);
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    if (error?.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed before completion. Please try signing in again.');
    }
    if (error?.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site and retry.');
    }
    if (error?.code === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in was cancelled due to another popup attempt. Please try again.');
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_TIME_KEY);
  } catch {}
};

// ============================================================
// SPREADSHEET STORAGE & EXTRACTION
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
  // Match https://docs.google.com/spreadsheets/d/{id}/...
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  // Otherwise if already pure ID
  return trimmed;
}

export async function fetchSpreadsheetDetails(
  token: string,
  spreadsheetId: string
): Promise<SpreadsheetInfo | null> {
  const id = extractSpreadsheetId(spreadsheetId);
  if (!id) return null;

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}?fields=spreadsheetId,properties(title),spreadsheetUrl`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Failed to fetch spreadsheet details:', errText);
    throw new Error(`Cannot access spreadsheet with ID "${id}". Make sure your Google Account has permission.`);
  }

  const data = await res.json();
  return {
    id: data.spreadsheetId,
    name: data.properties?.title || 'Connected Spreadsheet',
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`
  };
}

// ============================================================
// FIND OR CREATE ORDERS SPREADSHEET
// ============================================================

export async function findOrCreateOrdersSpreadsheet(
  token: string,
  preferredId?: string
): Promise<SpreadsheetInfo> {
  // 1. If preferred or active sheet is already saved and accessible, return it
  const targetId = preferredId ? extractSpreadsheetId(preferredId) : getActiveSavedSpreadsheet()?.id;
  if (targetId) {
    try {
      const details = await fetchSpreadsheetDetails(token, targetId);
      if (details) {
        setActiveSavedSpreadsheet(details);
        return details;
      }
    } catch (e) {
      console.warn('Saved spreadsheet could not be verified, continuing discovery:', e);
    }
  }

  // 2. Search Google Drive for existing sheet by name
  try {
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(
      SPREADSHEET_NAME
    )}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id,name,webViewLink)`;

    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        const existing = data.files[0];
        const info: SpreadsheetInfo = {
          id: existing.id,
          name: existing.name,
          url: existing.webViewLink || `https://docs.google.com/spreadsheets/d/${existing.id}/edit`
        };
        setActiveSavedSpreadsheet(info);
        return info;
      }
    }
  } catch (driveErr) {
    console.warn('Drive search not available or failed:', driveErr);
  }

  // 3. Create new Google Spreadsheet with structured headers
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_NAME
      },
      sheets: [
        {
          properties: {
            title: 'Orders',
            gridProperties: {
              frozenRowCount: 1
            }
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: 'Timestamp' } },
                    { userEnteredValue: { stringValue: 'Order ID' } },
                    { userEnteredValue: { stringValue: 'Customer Name' } },
                    { userEnteredValue: { stringValue: 'Phone Number' } },
                    { userEnteredValue: { stringValue: 'Order Type' } },
                    { userEnteredValue: { stringValue: 'Address / Table' } },
                    { userEnteredValue: { stringValue: 'Items Summary' } },
                    { userEnteredValue: { stringValue: 'Subtotal (₹)' } },
                    { userEnteredValue: { stringValue: 'Delivery Fee (₹)' } },
                    { userEnteredValue: { stringValue: 'Grand Total (₹)' } },
                    { userEnteredValue: { stringValue: 'Kitchen Instructions' } },
                    { userEnteredValue: { stringValue: 'Status' } }
                  ]
                }
              ]
            }
          ]
        }
      ]
    })
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Spreadsheet: ${errText}`);
  }

  const createdData = await createRes.json();
  const info: SpreadsheetInfo = {
    id: createdData.spreadsheetId,
    name: SPREADSHEET_NAME,
    url: createdData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${createdData.spreadsheetId}/edit`
  };
  setActiveSavedSpreadsheet(info);
  return info;
}

// ============================================================
// SMART ROW APPENDING TO GOOGLE SHEET
// ============================================================

export async function appendOrderToGoogleSheet(
  token: string,
  spreadsheetId: string,
  order: OrderDetails
): Promise<{ success: boolean; error?: string }> {
  const itemsSummary = order.items
    .map((item) => `${item.menuItem.name} x${item.quantity}`)
    .join(', ');

  const dateStr = new Date(order.timestamp).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const rowValues = [
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
    (order.status || 'NEW').toUpperCase()
  ];

  const headers = [
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
    'Status'
  ];

  // 1. Determine sheet tab title dynamically (supports 'Orders', 'Sheet1', or user-created tabs)
  let targetSheetTitle = 'Orders';
  let sheetNeedsHeader = false;

  try {
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title,gridProperties))`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (metaRes.ok) {
      const meta = await metaRes.json();
      const existingSheets = meta.sheets || [];
      const ordersSheet = existingSheets.find(
        (s: any) => s.properties?.title?.toLowerCase() === 'orders'
      );

      if (ordersSheet) {
        targetSheetTitle = ordersSheet.properties.title;
        if ((ordersSheet.properties?.gridProperties?.rowCount ?? 0) <= 1) {
          sheetNeedsHeader = true;
        }
      } else if (existingSheets.length > 0) {
        // Fallback to first tab in spreadsheet
        targetSheetTitle = existingSheets[0].properties.title;
        if ((existingSheets[0].properties?.gridProperties?.rowCount ?? 0) <= 1) {
          sheetNeedsHeader = true;
        }
      }
    }
  } catch (metaErr) {
    console.warn('Metadata inspection warning, defaulting to Orders:', metaErr);
  }

  // 2. Add header row if the sheet is newly created or empty
  if (sheetNeedsHeader) {
    try {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
          targetSheetTitle
        )}!A1:L1?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values: [headers] })
        }
      );
    } catch {}
  }

  // 3. Append order row
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    targetSheetTitle
  )}!A:L:append?valueInputOption=USER_ENTERED`;

  let response = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [rowValues]
    })
  });

  // Fallback without sheet prefix if range parsing error occurred
  if (!response.ok) {
    const genericAppendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:L:append?valueInputOption=USER_ENTERED`;
    response = await fetch(genericAppendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [rowValues]
      })
    });
  }

  if (!response.ok) {
    const errText = await response.text();
    console.error('Error appending order to Google Sheet:', errText);
    return { success: false, error: errText };
  }

  return { success: true };
}

// ============================================================
// GOOGLE DRIVE SPREADSHEETS LIST
// ============================================================

export async function listGoogleDriveSpreadsheets(
  token: string
): Promise<Array<{ id: string; name: string; url: string; modifiedTime: string }>> {
  const url = `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&orderBy=modifiedTime desc&pageSize=15&fields=files(id,name,webViewLink,modifiedTime)`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return (data.files || []).map((f: { id: string; name: string; webViewLink?: string; modifiedTime?: string }) => ({
    id: f.id,
    name: f.name,
    url: f.webViewLink || `https://docs.google.com/spreadsheets/d/${f.id}/edit`,
    modifiedTime: f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString() : ''
  }));
}

// ============================================================
// GOOGLE APPS SCRIPT WEB APP INTEGRATION (24/7 AUTOMATED SYNC)
// ============================================================

export const APPS_SCRIPT_TEMPLATE_CODE = `// ============================================================
// FIREY TREAT RESTAURANT - GOOGLE APPS SCRIPT ORDERS SYNC WEB APP
//
// HOW TO SET UP:
// 1. Open your Google Sheet in Google Drive.
// 2. In top menu, click Extensions > Apps Script.
// 3. Delete everything and paste this entire code.
// 4. Click the blue "Deploy" button (top right) -> "New deployment".
// 5. Select type "Web app".
// 6. Set Description: "Firey Treat Orders Webhook"
// 7. Set "Execute as": "Me"
// 8. Set "Who has access": "Anyone"  <-- CRITICAL!
// 9. Click "Deploy", authorize permissions when prompted.
// 10. Copy the Web App URL (starts with https://script.google.com/macros/s/...)
//     and paste it into Firey Treat Owner Settings!
// ============================================================

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Orders") || ss.getActiveSheet();
    
    // Auto-create header row if sheet is brand new
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
    
    // Parse JSON payload
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    // Append order record row
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

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: "ready", 
      message: "Firey Treat Restaurant Orders Webhook is active and listening for live orders." 
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

  const itemsSummary = order.items
    .map((item) => `${item.menuItem.name} x${item.quantity}`)
    .join(', ');

  const dateStr = new Date(order.timestamp).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
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
    status: (order.status || 'NEW').toUpperCase()
  };

  try {
    // Note: mode 'no-cors' prevents browser blocking from Google 302 redirect responses
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
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
      message: 'Please enter a valid Google Apps Script Web App URL starting with "https://script.google.com/macros/s/..."'
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
    status: 'new'
  };

  try {
    await sendOrderToAppsScript(url, testOrder);
    return {
      success: true,
      message: 'Test order transmitted to Google Apps Script! Check your Google Sheet to confirm the test row was appended.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to send test request to Google Apps Script.'
    };
  }
}

// ============================================================
// UNIFIED ORDER DISPATCHER (PUSHES TO ALL CONFIGURED CHANNELS)
// ============================================================

export async function pushOrderToAllGoogleChannels(
  order: OrderDetails,
  token?: string | null
): Promise<{ appsScript: boolean; sheetsApi: boolean }> {
  let appsScriptSuccess = false;
  let sheetsApiSuccess = false;

  // 1. Google Apps Script Web App (24/7 direct sheet push)
  const scriptUrl = getAppsScriptUrl();
  if (scriptUrl) {
    try {
      appsScriptSuccess = await sendOrderToAppsScript(scriptUrl, order);
    } catch (e) {
      console.error('Apps Script push error:', e);
    }
  }

  // 2. Direct Google Sheets API via OAuth token
  const effectiveToken = token || (await getAccessToken());
  const activeSheet = getActiveSavedSpreadsheet();
  if (effectiveToken && activeSheet?.id) {
    try {
      const res = await appendOrderToGoogleSheet(effectiveToken, activeSheet.id, order);
      sheetsApiSuccess = res.success;
    } catch (e) {
      console.error('Direct Google Sheet API push error:', e);
    }
  }

  return { appsScript: appsScriptSuccess, sheetsApi: sheetsApiSuccess };
}
