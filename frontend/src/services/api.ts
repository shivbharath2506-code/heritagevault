import {
  User,
  Artifact,
  ConservationRecord,
  Exhibition,
  RestorationRecord,
  VisitorRecord,
  AnalyticsSummary,
} from '../types';
import { mockService } from './mockService';

const API_BASE_URL = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('hv_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';

  // If server responded with HTML (e.g. Vercel SPA index.html fallback for missing API route)
  if (contentType.includes('text/html')) {
    throw new Error('API_ROUTE_NOT_FOUND_HTML');
  }

  if (response.status === 401) {
    // Only dispatch logout if we are not on login/public view
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/public')) {
      window.dispatchEvent(new Event('auth:logout'));
    }
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error('API_INVALID_JSON');
  }

  if (!response.ok) {
    const errorMsg = data?.error || `HTTP error ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Public Showcase
  async getPublicShowcase(): Promise<{
    museum: any;
    featuredArtifacts: Artifact[];
    publicExhibitions: Exhibition[];
    stats: { total_artifacts: number; total_exhibitions: number; total_visitors: number };
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/public/showcase`);
      return await handleResponse(res);
    } catch {
      return mockService.getPublicShowcase();
    }
  },

  // Auth
  async login(credentials: { email: string; password: string }): Promise<{ user: User; token: string; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const result = await handleResponse<{ user: User; token: string; message: string }>(res);
      // Ensure role is normalized
      if (result?.user) {
        result.user.role = result.user.role.toLowerCase() as any;
      }
      return result;
    } catch {
      // Fallback to client mockService
      const result = await mockService.login(credentials);
      return result;
    }
  },

  async getMe(): Promise<{ user: User }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });
      const result = await handleResponse<{ user: User }>(res);
      if (result?.user) {
        result.user.role = result.user.role.toLowerCase() as any;
      }
      return result;
    } catch {
      return mockService.getMe();
    }
  },

  // Artifacts
  async getArtifacts(params?: { search?: string; category?: string; condition?: string }): Promise<{ artifacts: Artifact[] }> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.category) query.append('category', params.category);
      if (params?.condition) query.append('condition', params.condition);

      const res = await fetch(`${API_BASE_URL}/artifacts?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return mockService.getArtifacts(params);
    }
  },

  async getArtifactById(id: number): Promise<{
    artifact: Artifact;
    conservationRecords: ConservationRecord[];
    restorationRecords: RestorationRecord[];
    exhibitions: Exhibition[];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/artifacts/${id}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return mockService.getArtifactById(id);
    }
  },

  async createArtifact(artifact: Partial<Artifact>): Promise<{ message: string; artifact: Artifact }> {
    try {
      const res = await fetch(`${API_BASE_URL}/artifacts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(artifact),
      });
      return await handleResponse(res);
    } catch {
      return mockService.createArtifact(artifact);
    }
  },

  async updateArtifact(id: number, artifact: Partial<Artifact>): Promise<{ message: string; artifact: Artifact }> {
    try {
      const res = await fetch(`${API_BASE_URL}/artifacts/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(artifact),
      });
      return await handleResponse(res);
    } catch {
      return mockService.updateArtifact(id, artifact);
    }
  },

  async deleteArtifact(id: number): Promise<{ message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/artifacts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return mockService.deleteArtifact(id);
    }
  },

  // Conservation
  async getConservationRecords(params?: { artifact_id?: string; date?: string; condition?: string }): Promise<{ conservationRecords: ConservationRecord[] }> {
    try {
      const query = new URLSearchParams();
      if (params?.artifact_id) query.append('artifact_id', params.artifact_id);
      if (params?.date) query.append('date', params.date);
      if (params?.condition) query.append('condition', params.condition);

      const res = await fetch(`${API_BASE_URL}/conservation?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return mockService.getConservationRecords(params);
    }
  },

  async createConservationRecord(record: Partial<ConservationRecord>): Promise<{ message: string; conservationRecord: ConservationRecord }> {
    try {
      const res = await fetch(`${API_BASE_URL}/conservation`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(record),
      });
      return await handleResponse(res);
    } catch {
      return mockService.createConservationRecord(record);
    }
  },

  async updateConservationRecord(id: number, record: Partial<ConservationRecord>): Promise<{ message: string; conservationRecord: ConservationRecord }> {
    try {
      const res = await fetch(`${API_BASE_URL}/conservation/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(record),
      });
      return await handleResponse(res);
    } catch {
      return mockService.updateConservationRecord(id, record);
    }
  },

  async deleteConservationRecord(id: number): Promise<{ message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/conservation/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return mockService.deleteConservationRecord(id);
    }
  },

  // Exhibitions
  async getExhibitions(params?: { status?: string; search?: string }): Promise<{ exhibitions: Exhibition[] }> {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${API_BASE_URL}/exhibitions?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return mockService.getExhibitions(params);
    }
  },

  async getExhibitionById(id: number): Promise<{
    exhibition: Exhibition;
    artifacts: Artifact[];
    visitorRecords: VisitorRecord[];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/exhibitions/${id}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return mockService.getExhibitionById(id);
    }
  },

  async createExhibition(exhibition: Partial<Exhibition> & { artifact_ids?: number[] }): Promise<{ message: string; exhibition: Exhibition }> {
    try {
      const res = await fetch(`${API_BASE_URL}/exhibitions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(exhibition),
      });
      return await handleResponse(res);
    } catch {
      return mockService.createExhibition(exhibition);
    }
  },

  async updateExhibition(id: number, exhibition: Partial<Exhibition> & { artifact_ids?: number[] }): Promise<{ message: string; exhibition: Exhibition }> {
    try {
      const res = await fetch(`${API_BASE_URL}/exhibitions/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(exhibition),
      });
      return await handleResponse(res);
    } catch {
      return mockService.updateExhibition(id, exhibition);
    }
  },

  async deleteExhibition(id: number): Promise<{ message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/exhibitions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return mockService.deleteExhibition(id);
    }
  },

  // Restoration
  async getRestorationRecords(params?: { status?: string; artifact_id?: string }): Promise<{ restorationRecords: RestorationRecord[] }> {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.artifact_id) query.append('artifact_id', params.artifact_id);

      const res = await fetch(`${API_BASE_URL}/restoration?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return mockService.getRestorationRecords(params);
    }
  },

  async createRestorationRecord(record: Partial<RestorationRecord>): Promise<{ message: string; restorationRecord: RestorationRecord }> {
    try {
      const res = await fetch(`${API_BASE_URL}/restoration`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(record),
      });
      return await handleResponse(res);
    } catch {
      return mockService.createRestorationRecord(record);
    }
  },

  async updateRestorationRecord(id: number, record: Partial<RestorationRecord>): Promise<{ message: string; restorationRecord: RestorationRecord }> {
    try {
      const res = await fetch(`${API_BASE_URL}/restoration/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(record),
      });
      return await handleResponse(res);
    } catch {
      return mockService.updateRestorationRecord(id, record);
    }
  },

  async deleteRestorationRecord(id: number): Promise<{ message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/restoration/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return mockService.deleteRestorationRecord(id);
    }
  },

  // Visitors
  async getVisitorRecords(params?: { start_date?: string; end_date?: string; exhibition_id?: string }): Promise<{
    visitorRecords: VisitorRecord[];
    summary: { totalVisitors: number; averageDaily: number; recordCount: number };
  }> {
    try {
      const query = new URLSearchParams();
      if (params?.start_date) query.append('start_date', params.start_date);
      if (params?.end_date) query.append('end_date', params.end_date);
      if (params?.exhibition_id) query.append('exhibition_id', params.exhibition_id);

      const res = await fetch(`${API_BASE_URL}/visitors?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return mockService.getVisitorRecords(params);
    }
  },

  async createVisitorRecord(record: { visit_date: string; visitor_count: number; exhibition_id?: number | null }): Promise<{ message: string; visitorRecord: VisitorRecord }> {
    try {
      const res = await fetch(`${API_BASE_URL}/visitors`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(record),
      });
      return await handleResponse(res);
    } catch {
      return mockService.createVisitorRecord(record);
    }
  },

  async updateVisitorRecord(id: number, record: { visit_date: string; visitor_count: number; exhibition_id?: number | null }): Promise<{ message: string; visitorRecord: VisitorRecord }> {
    try {
      const res = await fetch(`${API_BASE_URL}/visitors/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(record),
      });
      return await handleResponse(res);
    } catch {
      return mockService.updateVisitorRecord(id, record);
    }
  },

  async deleteVisitorRecord(id: number): Promise<{ message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/visitors/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return mockService.deleteVisitorRecord(id);
    }
  },

  // Analytics
  async getAnalyticsSummary(): Promise<{ summary: AnalyticsSummary }> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/summary`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return mockService.getAnalyticsSummary();
    }
  },

  async getVisitorAnalytics(): Promise<{
    dailyTrend: { visit_date: string; count: number }[];
    byExhibition: { exhibition_name: string; total_visitors: number }[];
    weekdayAverages: { day: string; average: number; total: number }[];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/visitors`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return mockService.getVisitorAnalytics();
    }
  },

  async getArtifactAnalytics(): Promise<{
    byCategory: { category: string; count: number }[];
    byCondition: { condition: string; count: number }[];
    byLocation: { location: string; count: number }[];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/artifacts`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return mockService.getArtifactAnalytics();
    }
  },

  async getConservationAnalytics(): Promise<{
    conditionBefore: { condition_before: string; count: number }[];
    conditionAfter: { condition_after: string; count: number }[];
    conservatorWorkload: { conservator: string; count: number }[];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/conservation`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return mockService.getConservationAnalytics();
    }
  },

  async getRestorationAnalytics(): Promise<{
    byStatus: { status: string; count: number; total_cost: number }[];
    byType: { restoration_type: string; count: number; total_cost: number }[];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/restoration`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return mockService.getRestorationAnalytics();
    }
  },

  // Reports
  async getReport(reportType: string, startDate?: string, endDate?: string): Promise<{ report: any }> {
    try {
      const query = new URLSearchParams({ reportType });
      if (startDate) query.append('startDate', startDate);
      if (endDate) query.append('endDate', endDate);

      const res = await fetch(`${API_BASE_URL}/reports?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return mockService.getReport(reportType, startDate, endDate);
    }
  },

  getReportDownloadUrl(reportType: string, startDate?: string, endDate?: string): string {
    const token = localStorage.getItem('hv_token');
    const query = new URLSearchParams({ reportType, format: 'csv' });
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);
    if (token) query.append('token', token);
    return `${API_BASE_URL}/reports?${query.toString()}`;
  },
};
