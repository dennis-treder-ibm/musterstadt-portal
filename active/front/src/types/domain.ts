/**
 * Domain types mirroring the Quarkus REST DTOs and JPA entities in active/back.
 * Dates are serialised by Jackson as ISO-8601 strings.
 */

export type ApplicationType = 'PARKING' | 'ADDRESS' | 'DOG'
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Citizen {
  id: number
  firstName: string
  lastName: string
  fullName: string
  street: string | null
  houseNumber: string | null
  postcode: string | null
  city: string | null
  email: string | null
  phone: string | null
  registeredDate: string | null
}

export interface Application {
  id: number
  citizen?: Citizen
  type: ApplicationType
  status: ApplicationStatus
  typeDisplay: string
  statusDisplay: string
  createdDate: string
  lastUpdated: string | null
  notes: string | null
}

export interface ParkingPermit {
  id: number
  application?: Application
  vehicleRegistration: string
  zone: string | null
  proofDocumentPath: string | null
}

export interface DogRegistration {
  id: number
  citizen?: Citizen
  dogName: string
  breed: string | null
  registrationDate: string
  chipNumber: string | null
}

// --- Requests ---------------------------------------------------------------

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  citizenId: number | null
  username: string | null
}

export interface ParkingApplicationRequest {
  vehicleRegistration: string
  zone: string
  proofDocumentPath?: string
}

export interface AddressChangeRequest {
  street: string
  houseNumber?: string
  postcode: string
  city: string
}

export interface DogRegistrationRequest {
  dogName: string
  breed?: string
  chipNumber?: string
}

export interface DogUpdateRequest {
  dogName: string
  breed?: string
}

// --- Dashboard --------------------------------------------------------------

export interface RecentActivityItem {
  id: number
  type: ApplicationType | null
  typeDisplay: string | null
  status: ApplicationStatus | null
  statusDisplay: string | null
  createdDate: string | null
  lastUpdated: string | null
  notes: string | null
}

export interface DashboardSummary {
  parkingPermitCount: number
  dogRegistrationCount: number
  openApplicationCount: number
  totalApplicationCount: number
  approvedCount: number
  rejectedCount: number
  parkingApplicationCount: number
  addressApplicationCount: number
  recentActivity: RecentActivityItem[]
}
