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
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly'
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

// In-memory token cache (never stored in localStorage/sessionStorage per security guidelines)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
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
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface SpreadsheetInfo {
  id: string;
  name: string;
  url: string;
}

const SPREADSHEET_NAME = 'Firey Treat Restaurant - Orders & Sales Log';

/**
 * Finds or creates the default Google Sheet for storing restaurant orders in the user's Drive.
 */
export async function findOrCreateOrdersSpreadsheet(token: string): Promise<SpreadsheetInfo> {
  // 1. Search Google Drive for existing sheet
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
      return {
        id: existing.id,
        name: existing.name,
        url: existing.webViewLink || `https://docs.google.com/spreadsheets/d/${existing.id}/edit`
      };
    }
  }

  // 2. If not found, create new Google Spreadsheet with structured headers
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
  return {
    id: createdData.spreadsheetId,
    name: SPREADSHEET_NAME,
    url: createdData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${createdData.spreadsheetId}/edit`
  };
}

/**
 * Appends a new restaurant order row to the Google Spreadsheet.
 */
export async function appendOrderToGoogleSheet(
  token: string,
  spreadsheetId: string,
  order: OrderDetails
): Promise<boolean> {
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
    order.status.toUpperCase()
  ];

  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Orders!A:L:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [rowValues]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Error appending order to Google Sheet:', errText);
    return false;
  }

  return true;
}

/**
 * Lists Google Spreadsheets from user's Google Drive.
 */
export async function listGoogleDriveSpreadsheets(
  token: string
): Promise<Array<{ id: string; name: string; url: string; modifiedTime: string }>> {
  const url = `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&orderBy=modifiedTime desc&pageSize=10&fields=files(id,name,webViewLink,modifiedTime)`;

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
