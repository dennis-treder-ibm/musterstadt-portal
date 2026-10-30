/** Field-level validation problem reported by the backend. */
export interface FieldError {
  field: string
  message: string
}

/**
 * Error payload shapes accepted from the Quarkus backend. Both the custom
 * `{ message, code, errors }` contract and the Quarkus/Hibernate Validator
 * `{ title, detail, violations }` problem format are understood.
 */
export interface ApiErrorBody {
  message?: string
  title?: string
  detail?: string
  code?: string
  status?: number
  errors?: ReadonlyArray<Partial<FieldError>>
  violations?: ReadonlyArray<Partial<FieldError>>
}

/** Generic paginated result (backend DAOs currently lack pagination - see TECHNICAL_DEBT.md). */
export interface PageResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
}

export interface PageQuery {
  page?: number
  pageSize?: number
}
