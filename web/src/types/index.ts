export type RoleName = 
  | 'DONOR'
  | 'REQUESTER'
  | 'HOSPITAL_STAFF'
  | 'BLOOD_BANK_OFFICER'
  | 'SYSTEM_ADMINISTRATOR';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export type BloodGroup = 
  | 'A_POSITIVE'
  | 'A_NEGATIVE'
  | 'B_POSITIVE'
  | 'B_NEGATIVE'
  | 'AB_POSITIVE'
  | 'AB_NEGATIVE'
  | 'O_POSITIVE'
  | 'O_NEGATIVE';

export type RequestUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RequestStatus = 
  | 'OPEN'
  | 'MATCHING'
  | 'RESPONSES_RECEIVED'
  | 'IN_PROGRESS'
  | 'FULFILLED'
  | 'CANCELLED'
  | 'EXPIRED';

export type OrganizationType = 'HOSPITAL' | 'BLOOD_BANK';

export interface UserOrganization {
  id: string;
  name: string;
  type: OrganizationType;
  city: string;
  town?: string;
  address?: string;
  isVerified: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  status: AccountStatus;
  roles: RoleName[];
  organization?: UserOrganization | null;
  createdAt?: string;
}

export interface DonorResponse {
  id: string;
  requestId: string;
  donorId: string;
  responseStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  respondedAt: string;
  donor: {
    fullName: string;
    phone: string;
  };
}

export interface BloodRequest {
  id: string;
  requesterId: string;
  hospitalId?: string | null;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  unitsFulfilled: number;
  urgency: RequestUrgency;
  status: RequestStatus;
  hospitalName: string;
  town: string;
  city: string;
  contactName: string;
  contactPhone: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  requester?: {
    fullName: string;
    phone: string;
    email: string;
  };
  hospital?: {
    id: string;
    name: string;
    city: string;
    phone: string;
  } | null;
  responses?: DonorResponse[];
}

export interface BloodInventoryItem {
  id: string;
  organizationId: string;
  bloodGroup: BloodGroup;
  unitsAvailable: number;
  updatedAt: string;
  organization?: {
    name: string;
    city: string;
    phone: string;
  };
}

export interface InventoryBatch {
  id: string;
  organizationId: string;
  bloodGroup: BloodGroup;
  units: number;
  collectionDate: string;
  expiryDate: string;
  donorRef?: string;
  batchStatus: 'AVAILABLE' | 'RESERVED' | 'EXPIRED' | 'DISCARDED';
  createdAt: string;
  organization?: {
    name: string;
    city: string;
  };
}

export interface InventoryTransaction {
  id: string;
  organizationId: string;
  batchId?: string;
  transactionType: 'RECEIPT' | 'ISSUE' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT' | 'EXPIRY_DISCARD';
  bloodGroup: BloodGroup;
  units: number;
  reason: string;
  performedByUserId: string;
  recipientHospitalId?: string;
  createdAt: string;
  organization?: { name: string };
  recipientHospital?: { name: string };
  performedByUser?: { fullName: string; email: string };
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  address: string;
  town: string;
  city: string;
  phone: string;
  email: string;
  isVerified: boolean;
  verifiedAt?: string | null;
  createdAt: string;
  hospitalProfiles?: Array<{
    id: string;
    department: string;
    position: string;
    employeeId: string;
    user: { fullName: string; email: string; phone: string };
  }>;
  bloodBankProfiles?: Array<{
    id: string;
    officerLicenseNo: string;
    user: { fullName: string; email: string; phone: string };
  }>;
  inventories?: Array<{
    bloodGroup: BloodGroup;
    unitsAvailable: number;
  }>;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  targetEntity: string;
  entityId?: string | null;
  details?: string | null;
  createdAt: string;
  user?: { fullName: string; email: string } | null;
}

export interface AdminStats {
  totalDonors: number;
  totalRequests: number;
  openRequests: number;
  totalHospitals: number;
  totalBloodBanks: number;
  pendingApprovals: number;
  totalStockUnits: number;
}

export interface DonorSearchResult {
  donorProfileId: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  bloodGroup: BloodGroup;
  town: string;
  city: string;
  isAvailable: boolean;
  lastDonationDate?: string | null;
}
