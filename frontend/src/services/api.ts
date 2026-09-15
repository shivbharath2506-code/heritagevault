import {
  User,
  Artifact,
  ConservationRecord,
  Exhibition,
  RestorationRecord,
  VisitorRecord,
  AnalyticsSummary,
} from '../types';

const API_BASE_URL = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('hv_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    localStorage.removeItem('hv_token');
    localStorage.removeItem('hv_user');
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/public')) {
      window.dispatchEvent(new Event('auth:logout'));
    }
  }

  const data = await response.json().catch(() => ({ error: 'Invalid response from server' }));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP error ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Public
  async getPublicShowcase(): Promise<{
    museum: any;
    featuredArtifacts: Artifact[];
    publicExhibitions: Exhibition[];
    stats: { total_artifacts: number; total_exhibitions: number; total_visitors: number };
  }> {
    const res = await fetch(`${API_BASE_URL}/public/showcase`);
    return handleResponse(res);
  },

  // Auth
  async login(credentials: { email: string; password: string }): Promise<{ user: User; token: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Artifacts
  async getArtifacts(params?: { search?: string; category?: string; condition?: string }): Promise<{ artifacts: Artifact[] }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.condition) query.append('condition', params.condition);

    const res = await fetch(`${API_BASE_URL}/artifacts?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getArtifactById(id: number): Promise<{
    artifact: Artifact;
    conservationRecords: ConservationRecord[];
    restorationRecords: RestorationRecord[];
    exhibitions: Exhibition[];
  }> {
    const res = await fetch(`${API_BASE_URL}/artifacts/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createArtifact(artifact: Partial<Artifact>): Promise<{ message: string; artifact: Artifact }> {
    const res = await fetch(`${API_BASE_URL}/artifacts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(artifact),
    });
    return handleResponse(res);
  },

  async updateArtifact(id: number, artifact: Partial<Artifact>): Promise<{ message: string; artifact: Artifact }> {
    const res = await fetch(`${API_BASE_URL}/artifacts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(artifact),
    });
    return handleResponse(res);
  },

  async deleteArtifact(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/artifacts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Conservation
  async getConservationRecords(params?: { artifact_id?: string; date?: string; condition?: string }): Promise<{ conservationRecords: ConservationRecord[] }> {
    const query = new URLSearchParams();
    if (params?.artifact_id) query.append('artifact_id', params.artifact_id);
    if (params?.date) query.append('date', params.date);
    if (params?.condition) query.append('condition', params.condition);

    const res = await fetch(`${API_BASE_URL}/conservation?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createConservationRecord(record: Partial<ConservationRecord>): Promise<{ message: string; conservationRecord: ConservationRecord }> {
    const res = await fetch(`${API_BASE_URL}/conservation`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(record),
    });
    return handleResponse(res);
  },

  async updateConservationRecord(id: number, record: Partial<ConservationRecord>): Promise<{ message: string; conservationRecord: ConservationRecord }> {
    const res = await fetch(`${API_BASE_URL}/conservation/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(record),
    });
    return handleResponse(res);
  },

  async deleteConservationRecord(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/conservation/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Exhibitions
  async getExhibitions(params?: { status?: string; search?: string }): Promise<{ exhibitions: Exhibition[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE_URL}/exhibitions?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getExhibitionById(id: number): Promise<{
    exhibition: Exhibition;
    artifacts: Artifact[];
    visitorRecords: VisitorRecord[];
  }> {
    const res = await fetch(`${API_BASE_URL}/exhibitions/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createExhibition(exhibition: Partial<Exhibition> & { artifact_ids?: number[] }): Promise<{ message: string; exhibition: Exhibition }> {
    const res = await fetch(`${API_BASE_URL}/exhibitions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(exhibition),
    });
    return handleResponse(res);
  },

  async updateExhibition(id: number, exhibition: Partial<Exhibition> & { artifact_ids?: number[] }): Promise<{ message: string; exhibition: Exhibition }> {
    const res = await fetch(`${API_BASE_URL}/exhibitions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(exhibition),
    });
    return handleResponse(res);
  },

  async deleteExhibition(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/exhibitions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Restoration
  async getRestorationRecords(params?: { status?: string; artifact_id?: string }): Promise<{ restorationRecords: RestorationRecord[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.artifact_id) query.append('artifact_id', params.artifact_id);

    const res = await fetch(`${API_BASE_URL}/restoration?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createRestorationRecord(record: Partial<RestorationRecord>): Promise<{ message: string; restorationRecord: RestorationRecord }> {
    const res = await fetch(`${API_BASE_URL}/restoration`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(record),
    });
    return handleResponse(res);
  },

  async updateRestorationRecord(id: number, record: Partial<RestorationRecord>): Promise<{ message: string; restorationRecord: RestorationRecord }> {
    const res = await fetch(`${API_BASE_URL}/restoration/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(record),
    });
    return handleResponse(res);
  },

  async deleteRestorationRecord(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/restoration/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Visitors
  async getVisitorRecords(params?: { start_date?: string; end_date?: string; exhibition_id?: string }): Promise<{
    visitorRecords: VisitorRecord[];
    summary: { totalVisitors: number; averageDaily: number; recordCount: number };
  }> {
    const query = new URLSearchParams();
    if (params?.start_date) query.append('start_date', params.start_date);
    if (params?.end_date) query.append('end_date', params.end_date);
    if (params?.exhibition_id) query.append('exhibition_id', params.exhibition_id);

    const res = await fetch(`${API_BASE_URL}/visitors?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createVisitorRecord(record: { visit_date: string; visitor_count: number; exhibition_id?: number | null }): Promise<{ message: string; visitorRecord: VisitorRecord }> {
    const res = await fetch(`${API_BASE_URL}/visitors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(record),
    });
    return handleResponse(res);
  },

  async updateVisitorRecord(id: number, record: { visit_date: string; visitor_count: number; exhibition_id?: number | null }): Promise<{ message: string; visitorRecord: VisitorRecord }> {
    const res = await fetch(`${API_BASE_URL}/visitors/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(record),
    });
    return handleResponse(res);
  },

  async deleteVisitorRecord(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/visitors/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Analytics
  async getAnalyticsSummary(): Promise<{ summary: AnalyticsSummary }> {
    const res = await fetch(`${API_BASE_URL}/analytics/summary`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getVisitorAnalytics(): Promise<{
    dailyTrend: { visit_date: string; count: number }[];
    byExhibition: { exhibition_name: string; total_visitors: number }[];
    weekdayAverages: { day: string; average: number; total: number }[];
  }> {
    const res = await fetch(`${API_BASE_URL}/analytics/visitors`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getArtifactAnalytics(): Promise<{
    byCategory: { category: string; count: number }[];
    byCondition: { condition: string; count: number }[];
    byLocation: { location: string; count: number }[];
  }> {
    const res = await fetch(`${API_BASE_URL}/analytics/artifacts`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getConservationAnalytics(): Promise<{
    conditionBefore: { condition_before: string; count: number }[];
    conditionAfter: { condition_after: string; count: number }[];
    conservatorWorkload: { conservator: string; count: number }[];
  }> {
    const res = await fetch(`${API_BASE_URL}/analytics/conservation`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getRestorationAnalytics(): Promise<{
    byStatus: { status: string; count: number; total_cost: number }[];
    byType: { restoration_type: string; count: number; total_cost: number }[];
  }> {
    const res = await fetch(`${API_BASE_URL}/analytics/restoration`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Reports
  async getReport(reportType: string, startDate?: string, endDate?: string): Promise<{ report: any }> {
    const query = new URLSearchParams({ reportType });
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);

    const res = await fetch(`${API_BASE_URL}/reports?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
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
