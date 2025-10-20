// API Request/Response Types

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string;
  };
}

export interface CreateItemRequest {
  name: string;
  category: ItemCategory;
  description?: string;
  image?: string;
  customFields?: Record<string, unknown>;
}

export interface UpdateItemRequest {
  name?: string;
  category?: ItemCategory;
  description?: string;
  image?: string;
  customFields?: Record<string, unknown>;
  status?: ItemStatus;
}

export interface CreateScanRequest {
  qrCode: string;
  scannerName?: string;
  scannerEmail?: string;
  scannerPhone?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  message?: string;
}

// Enums
export type ItemCategory =
  | 'electronics'
  | 'accessories'
  | 'documents'
  | 'keys'
  | 'bags'
  | 'jewelry'
  | 'other';

export type ItemStatus = 'active' | 'lost' | 'found' | 'inactive';

// Frontend Types
export interface ItemWithQR {
  id: string;
  name: string;
  category: ItemCategory;
  description?: string;
  image?: string;
  status: ItemStatus;
  qrCode: string;
  qrCodeDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScanLog {
  id: string;
  itemId: string;
  scannerName?: string;
  scannerEmail?: string;
  scannerPhone?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  message?: string;
  scannedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: string;
}
