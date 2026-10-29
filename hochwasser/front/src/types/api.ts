// ── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  citizenId: number;
  citizenName: string;
  message: string;
}

// ── Citizen ───────────────────────────────────────────────────────────────────

export interface Citizen {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  street?: string;
  houseNumber?: string;
  postcode?: string;
  city?: string;
  email?: string;
  phone?: string;
  registeredDate?: string;
}

// ── Application (shared) ──────────────────────────────────────────────────────

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ApplicationType = 'PARKING' | 'ADDRESS' | 'DOG';

export interface Application {
  id: number;
  citizenId: number;
  citizenName?: string;
  type: ApplicationType;
  typeDisplay?: string;
  status: ApplicationStatus;
  statusDisplay?: string;
  createdDate: string;
  lastUpdated?: string;
  notes?: string;
}

// ── Parking ────────────────────────────────────────────────────────────────────

export interface ParkingApplication extends Application {
  vehicleRegistration?: string;
  zone?: string;
  proofDocumentPath?: string;
}

export interface CreateParkingRequest {
  vehicleRegistration: string;
  zone: string;
  proofDocumentPath?: string;
}

// ── Address ────────────────────────────────────────────────────────────────────

export interface AddressChangeRequest {
  street: string;
  houseNumber?: string;
  postcode: string;
  city: string;
}

// ── Dog ────────────────────────────────────────────────────────────────────────

export interface DogRegistration {
  id: number;
  citizenId: number;
  dogName: string;
  breed?: string;
  registrationDate: string;
  chipNumber?: string;
}

export interface RegisterDogRequest {
  dogName: string;
  breed?: string;
  chipNumber?: string;
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

export interface DashboardData {
  citizenId: number;
  totalApplications: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  parkingPermitCount: number;
  addressChangeCount: number;
  dogRegistrationCount: number;
  recentApplications: Application[];
}

// ── API error ──────────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  status?: number;
}
