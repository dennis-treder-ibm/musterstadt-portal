/**
 * Domain types derived from the data model in back/architecture.md (section 7).
 * Dates are ISO-8601 strings as delivered by the REST API.
 */

export const ApplicationType = {
  Parking: 'PARKING',
  Address: 'ADDRESS',
  Dog: 'DOG',
} as const
export type ApplicationType = (typeof ApplicationType)[keyof typeof ApplicationType]

export const ApplicationStatus = {
  Pending: 'PENDING',
  Approved: 'APPROVED',
  Rejected: 'REJECTED',
} as const
export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus]

export const Role = {
  Citizen: 'CITIZEN',
  Admin: 'ADMIN',
} as const
export type Role = (typeof Role)[keyof typeof Role]

export interface Citizen {
  id: number
  firstName: string
  lastName: string
  street?: string
  houseNumber?: string
  postcode?: string
  city?: string
  email?: string
  phone?: string
  registeredDate?: string
}

export interface Application {
  id: number
  citizenId: number
  type: ApplicationType
  status: ApplicationStatus
  createdDate: string
  lastUpdated?: string
  notes?: string
}

export interface ParkingPermit {
  id: number
  applicationId: number
  vehicleRegistration: string
  zone?: string
  proofDocumentPath?: string
}

export interface DogRegistration {
  id: number
  citizenId: number
  dogName: string
  breed?: string
  registrationDate: string
  chipNumber?: string
}
