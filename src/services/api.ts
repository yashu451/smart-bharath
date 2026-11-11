import { getAuthToken } from './storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  token?: string;
  user?: any;
  stats?: any;
  recentActivities?: any[];
  activity?: any;
  [key: string]: any;
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.message || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error: any) {
    // If backend is not running or unreachable, provide clear error message
    if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
      throw new Error('Cannot connect to backend server at ' + API_BASE_URL + '. Please ensure the backend is running.');
    }
    throw error;
  }
}

export const authApi = {
  login: async (identifier: string, credential: string) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, pin: credential, password: credential }),
    });
  },

  register: async (userData: { name: string; email: string; mobile: string; password: string; pin?: string; aadhaar?: string }) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getMe: async () => {
    return request('/auth/me', {
      method: 'GET',
    });
  },
};

export const dashboardApi = {
  getDashboard: async () => {
    return request('/dashboard', {
      method: 'GET',
    });
  },

  getActivities: async (type?: string) => {
    const query = type && type !== 'all' ? `?type=${encodeURIComponent(type)}` : '';
    return request(`/dashboard/activities${query}`, {
      method: 'GET',
    });
  },

  createActivity: async (activityData: {
    type: 'appointment' | 'grievance' | 'scheme' | 'document' | 'assistant' | 'service' | 'other';
    title: string;
    subtitle?: string;
    token?: string;
    status?: string;
    statusColor?: string;
    statusBg?: string;
    icon?: string;
    route?: string;
    metadata?: any;
  }) => {
    return request('/dashboard/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  },

  cancelActivity: async (id: string) => {
    return request(`/dashboard/activities/${id}/cancel`, {
      method: 'PATCH',
    });
  },

  updateActivity: async (
    id: string,
    updates: {
      status?: string;
      statusColor?: string;
      statusBg?: string;
      subtitle?: string;
      metadata?: any;
    }
  ) => {
    return request(`/dashboard/activities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  migrateHistory: async (history: any[]) => {
    return request<{ success: boolean; migratedCount: number }>('/dashboard/migrate-history', {
      method: 'POST',
      body: JSON.stringify({ history }),
    });
  },
};

export interface UploadDocumentPayload {
  name: string;
  category: string;
  originalFilename: string;
  mimeType: string;
  base64Data: string;
  description?: string;
}

export const documentApi = {
  getDocuments: async () => {
    return request('/documents', {
      method: 'GET',
    });
  },

  getDocument: async (id: string) => {
    return request(`/documents/${id}`, {
      method: 'GET',
    });
  },

  uploadDocument: async (payload: UploadDocumentPayload) => {
    return request('/documents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getDocumentFileBase64: async (id: string) => {
    return request(`/documents/${id}/file?base64=true`, {
      method: 'GET',
    });
  },

  deleteDocument: async (id: string) => {
    return request(`/documents/${id}`, {
      method: 'DELETE',
    });
  },
};

export const chatApi = {
  getHistory: async () => {
    return request('/chat', {
      method: 'GET',
    });
  },

  saveMessage: async (payload: {
    sender: 'user' | 'ai';
    text: string;
    suggestedAction?: string | null;
    timestamp?: string;
  }) => {
    return request('/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  clearHistory: async () => {
    return request('/chat', {
      method: 'DELETE',
    });
  },
};

export interface GrievanceGuidance {
  authorityName: string;
  portalName: string;
  portalUrl: string;
  trackingUrl: string;
  helpline: string;
  expectedTimelineDays: number;
  officialTimelineNotice: string;
  whyAppropriate: string;
  filingInstructions: string[];
  requiredDocuments: string[];
  isDistrictSpecific?: boolean;
  jurisdictionLevel?: 'District Authority' | 'State Alternative' | 'Central Authority';
  alternative?: {
    authorityName: string;
    portalName: string;
    portalUrl: string;
    trackingUrl?: string;
    helpline: string;
    expectedTimelineDays: number;
    whyAppropriate: string;
  };
}

export interface GrievanceRecord {
  _id: string;
  title: string;
  category: string;
  state: string;
  district?: string;
  city?: string;
  exactLocation?: string;
  description: string;
  authorityName: string;
  portalName: string;
  portalUrl: string;
  trackingUrl: string;
  referenceNumber: string;
  submissionDate: string;
  expectedTimelineDays: number;
  officialTimelineNotice: string;
  citizenStatus: 'Awaiting Updates' | 'In Review' | 'Action Taken' | 'Resolved by Dept' | 'Closed';
  daysElapsed: number;
  isOverdue: boolean;
  daysOverdue: number;
  daysRemaining: number;
  notes?: Array<{ text: string; createdAt: string }>;
  reminders?: Array<{ date: string; note: string; isDone: boolean }>;
  citizenFeedback?: { rating: number; experienceNotes: string; recordedAt?: string };
  createdAt: string;
}

export interface GrievanceInsightsData {
  hasData: boolean;
  stats: {
    total: number;
    awaitingUpdates: number;
    markedResolved: number;
    averageWaitingDays: number;
    overdueCount: number;
    longestWaitingDays: number;
  };
  longestWaiting: {
    id: string;
    title: string;
    referenceNumber: string;
    portalName: string;
    category: string;
    daysElapsed: number;
    expectedTimelineDays: number;
    status: string;
  } | null;
  byCategory: Array<{ name: string; count: number; color: string; percentage: number }>;
  byMonth: Array<{ month: string; count: number }>;
  waitingBuckets: { under15: number; days15to30: number; over30: number };
  aiRecommendations: Array<{
    id: string;
    title: string;
    referenceNumber: string;
    portalName: string;
    daysElapsed: number;
    daysOverdue: number;
    expectedTimelineDays: number;
    recommendation: string;
    actionUrl: string;
  }>;
}

export const grievanceApi = {
  getGuidance: async (payload: {
    state: string;
    district?: string;
    city?: string;
    category: string;
    description: string;
    exactLocation?: string;
  }) => {
    return request<{ guidance: GrievanceGuidance }>('/grievances/guide', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getGrievances: async () => {
    return request<{ count: number; grievances: GrievanceRecord[] }>('/grievances', {
      method: 'GET',
    });
  },

  getInsights: async () => {
    return request<GrievanceInsightsData>('/grievances/insights', {
      method: 'GET',
    });
  },

  createGrievance: async (payload: {
    title: string;
    category: string;
    state: string;
    district?: string;
    city?: string;
    exactLocation?: string;
    description: string;
    authorityName?: string;
    portalName: string;
    portalUrl: string;
    trackingUrl?: string;
    referenceNumber: string;
    submissionDate?: string;
    expectedTimelineDays?: number;
    officialTimelineNotice?: string;
    citizenStatus?: string;
    initialNote?: string;
  }) => {
    return request<{ grievance: GrievanceRecord }>('/grievances', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateGrievance: async (
    id: string,
    payload: {
      title?: string;
      category?: string;
      referenceNumber?: string;
      description?: string;
      exactLocation?: string;
      citizenStatus?: string;
      newNote?: string;
      newReminder?: { date: string; note?: string };
      citizenFeedback?: { rating: number; experienceNotes?: string };
    }
  ) => {
    return request<{ grievance: GrievanceRecord }>(`/grievances/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteGrievance: async (id: string) => {
    return request(`/grievances/${id}`, {
      method: 'DELETE',
    });
  },
};

export interface SavedSchemeItem {
  _id: string;
  schemeId: string;
  name: string;
  category: string;
  description?: string;
  applicationUrl?: string;
  officialWebsite?: string;
  benefits?: string;
  eligibility?: string;
  hasOnlineApplication?: boolean;
  savedAt: string;
}

export const schemeApi = {
  getSavedSchemes: async () => {
    return request<{ count: number; schemes: SavedSchemeItem[] }>('/schemes/saved', {
      method: 'GET',
    });
  },

  checkIsSaved: async (schemeId: string) => {
    return request<{ success: boolean; isSaved: boolean; schemeId: string }>(`/schemes/check/${encodeURIComponent(schemeId)}`, {
      method: 'GET',
    });
  },

  saveScheme: async (payload: {
    schemeId: string;
    name: string;
    category: string;
    description?: string;
    applicationUrl?: string;
    officialWebsite?: string;
    benefits?: string;
    eligibility?: string;
    hasOnlineApplication?: boolean;
  }) => {
    return request<{ scheme: SavedSchemeItem }>('/schemes/save', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  removeSavedScheme: async (schemeId: string) => {
    return request(`/schemes/save/${encodeURIComponent(schemeId)}`, {
      method: 'DELETE',
    });
  },

  recordApplication: async (payload: {
    schemeId: string;
    name: string;
    category?: string;
    applicationUrl?: string;
  }) => {
    return request('/schemes/apply', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};




