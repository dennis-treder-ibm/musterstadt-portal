import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { httpClient } from './httpClient'

/**
 * Thin typed wrapper over the HTTP client returning `data` directly.
 * Concrete resource services (parking, address, dog, ...) extend or compose it
 * in the components phase, e.g. `new BaseService('/parking-permits')`.
 */
export class BaseService {
  protected readonly basePath: string
  private readonly client: AxiosInstance

  constructor(basePath: string, client: AxiosInstance = httpClient) {
    this.basePath = basePath
    this.client = client
  }

  protected async get<T>(path = '', config?: AxiosRequestConfig): Promise<T> {
    return (await this.client.get<T>(this.basePath + path, config)).data
  }

  protected async post<T, B = unknown>(path = '', body?: B, config?: AxiosRequestConfig): Promise<T> {
    return (await this.client.post<T>(this.basePath + path, body, config)).data
  }

  protected async put<T, B = unknown>(path = '', body?: B, config?: AxiosRequestConfig): Promise<T> {
    return (await this.client.put<T>(this.basePath + path, body, config)).data
  }

  protected async patch<T, B = unknown>(path = '', body?: B, config?: AxiosRequestConfig): Promise<T> {
    return (await this.client.patch<T>(this.basePath + path, body, config)).data
  }

  protected async delete<T = void>(path = '', config?: AxiosRequestConfig): Promise<T> {
    return (await this.client.delete<T>(this.basePath + path, config)).data
  }
}
