import {
  User,
  BloodRequest,
  BloodInventoryItem,
  InventoryBatch,
  InventoryTransaction,
  Organization,
  AdminStats,
  AuditLog,
  DonorSearchResult,
  BloodGroup,
  RequestUrgency,
  RequestStatus,
} from '../types';

const BASE_URL = '/api/v1';

class ApiService {
  private getHeaders(contentType: boolean = true): HeadersInit {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (contentType) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(options.body !== undefined),
          ...options.headers,
        },
      });
    } catch (networkErr: any) {
      throw new Error('Cannot connect to the server (http://localhost:5050). Please make sure the backend is running.');
    }

    const text = await response.text();
    let json: any = null;
    if (text) {
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server returned non-JSON response (${response.status}): ${text.slice(0, 100)}`);
      }
    }

    if (!response.ok || (json && json.success === false)) {
      const msg = json?.message || `Request failed with status ${response.status}`;
      throw new Error(msg);
    }

    return json?.data;
  }

  // --- Auth Endpoints ---
  async login(credentials: { email: string; password: string }) {
    return this.request<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async registerOrganization(data: {
    orgType: 'HOSPITAL' | 'BLOOD_BANK';
    orgName: string;
    orgEmail: string;
    orgPhone: string;
    town: string;
    city: string;
    address: string;
    repName: string;
    repEmail: string;
    repPhone: string;
    password: string;
    licenseNo?: string;
    department?: string;
    position?: string;
    employeeId?: string;
  }) {
    return this.request<{
      message: string;
      organizationId: string;
      organizationName: string;
      status: string;
    }>('/auth/register-organization', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Requests Endpoints ---
  async getRequests(filters?: { bloodGroup?: string; city?: string; status?: string }) {
    const query = new URLSearchParams();
    if (filters?.bloodGroup) query.append('bloodGroup', filters.bloodGroup);
    if (filters?.city) query.append('city', filters.city);
    if (filters?.status && filters.status !== 'ALL') query.append('status', filters.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<BloodRequest[]>(`/requests${qs}`);
  }

  async createRequest(data: {
    bloodGroup: BloodGroup;
    unitsRequired: number;
    urgency: RequestUrgency;
    hospitalName: string;
    town: string;
    city: string;
    contactName: string;
    contactPhone: string;
    notes?: string;
    hospitalId?: string;
  }) {
    return this.request<BloodRequest>('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRequestStatus(requestId: string, status: RequestStatus) {
    return this.request<BloodRequest>(`/requests/${requestId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // --- Inventory Endpoints ---
  async getInventory(organizationId?: string) {
    const qs = organizationId ? `?organizationId=${organizationId}` : '';
    return this.request<BloodInventoryItem[]>(`/inventory${qs}`);
  }

  async getBatches(organizationId?: string) {
    const qs = organizationId ? `?organizationId=${organizationId}` : '';
    return this.request<InventoryBatch[]>(`/inventory/batches${qs}`);
  }

  async getTransactions(organizationId?: string) {
    const qs = organizationId ? `?organizationId=${organizationId}` : '';
    return this.request<InventoryTransaction[]>(`/inventory/transactions${qs}`);
  }

  async addReceipt(data: {
    organizationId: string;
    bloodGroup: BloodGroup;
    units: number;
    collectionDate: string;
    expiryDate: string;
    donorRef?: string;
  }) {
    return this.request<InventoryBatch>('/inventory/receipts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async issueStock(data: {
    organizationId: string;
    bloodGroup: BloodGroup;
    units: number;
    recipientHospitalId?: string;
    reason: string;
  }) {
    return this.request<InventoryTransaction>('/inventory/transactions/issue', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Donors Search ---
  async searchDonors(params?: { bloodGroup?: string; city?: string; town?: string }) {
    const query = new URLSearchParams();
    if (params?.bloodGroup) query.append('bloodGroup', params.bloodGroup);
    if (params?.city) query.append('city', params.city);
    if (params?.town) query.append('town', params.town);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<DonorSearchResult[]>(`/donors/search${qs}`);
  }

  // --- Admin Endpoints ---
  async getAdminStats() {
    return this.request<AdminStats>('/admin/stats');
  }

  async getPendingOrganizations() {
    return this.request<Organization[]>('/admin/organizations/pending');
  }

  async getAllOrganizations() {
    return this.request<Organization[]>('/admin/organizations');
  }

  async verifyOrganization(organizationId: string, isVerified: boolean) {
    return this.request<Organization>(`/admin/organizations/${organizationId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ isVerified }),
    });
  }

  async getUsers() {
    return this.request<User[]>('/admin/users');
  }

  async updateUserStatus(userId: string, status: string) {
    return this.request<User>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getAuditLogs() {
    return this.request<AuditLog[]>('/admin/audit-logs');
  }
}

export const api = new ApiService();
