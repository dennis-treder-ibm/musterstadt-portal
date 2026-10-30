/**
 * Request/response DTOs of the REST backend (contract of the Quarkus API, see README).
 */
import type { ApplicationStatus, ApplicationType } from './domain'

/** Entry of the dashboard "Letzte Vorgänge" table. */
export interface RecentActivity {
  id: number
  type: ApplicationType
  typeDisplay: string
  status: ApplicationStatus
  statusDisplay: string
  createdDate: string
  lastUpdated?: string
  notes?: string
}

/** Response of `GET /api/dashboard/summary`. */
export interface DashboardSummary {
  parkingPermitCount: number
  dogRegistrationCount: number
  openApplicationCount: number
  totalApplicationCount: number
  approvedCount: number
  rejectedCount: number
  parkingApplicationCount: number
  addressApplicationCount: number
  recentActivity: RecentActivity[]
}

/** `POST /api/parking/applications` */
export interface ParkingApplicationRequest {
  vehicleRegistration: string
  zone: string
  proofDocumentPath?: string
}

/** `POST /api/address/change` */
export interface AddressChangeRequest {
  street: string
  houseNumber?: string
  postcode: string
  city: string
}

/** `POST /api/dogs` */
export interface DogRegistrationRequest {
  dogName: string
  breed?: string
  chipNumber?: string
}

/** `PUT /api/dogs/{id}` */
export interface DogUpdateRequest {
  dogName: string
  breed?: string
}

/** Stub response of `GET /api/citizens/registry`. */
export interface RegistryLookupResult {
  [key: string]: unknown
}
