import { httpClient } from './http/httpClient'
import { addressService } from './address/addressService'
import { authService } from './auth/authService'
import { citizenService } from './citizen/citizenService'
import { dashboardService } from './dashboard/dashboardService'
import { dogService } from './dog/dogService'
import { parkingService } from './parking/parkingService'

const response = (data: unknown) => ({ data })

describe('resource services', () => {
  afterEach(() => vi.restoreAllMocks())

  it('parkingService maps to /parking endpoints', async () => {
    const get = vi.spyOn(httpClient, 'get').mockResolvedValue(response([]))
    const post = vi.spyOn(httpClient, 'post').mockResolvedValue(response({ id: 5 }))
    const patch = vi.spyOn(httpClient, 'patch').mockResolvedValue(response({ id: 5 }))

    await parkingService.listApplications()
    await parkingService.listZones()
    await parkingService.getPermit(5)
    await parkingService.submitApplication({ vehicleRegistration: 'M-AB 123', zone: 'Zone A' })
    await parkingService.updateStatus(5, 'APPROVED')

    expect(get.mock.calls.map((c) => c[0])).toEqual(['/parking/applications', '/parking/zones', '/parking/applications/5/permit'])
    expect(post).toHaveBeenCalledWith('/parking/applications', { vehicleRegistration: 'M-AB 123', zone: 'Zone A' }, undefined)
    expect(patch).toHaveBeenCalledWith('/parking/applications/5/status', undefined, { params: { status: 'APPROVED' } })
  })

  it('addressService maps to /address endpoints', async () => {
    const get = vi.spyOn(httpClient, 'get').mockResolvedValue(response([]))
    const post = vi.spyOn(httpClient, 'post').mockResolvedValue(response({ id: 1 }))
    const request = { street: 'Hauptstraße', postcode: '80331', city: 'Musterstadt' }

    await addressService.submitChange(request)
    await addressService.listApplications()

    expect(post).toHaveBeenCalledWith('/address/change', request, undefined)
    expect(get).toHaveBeenCalledWith('/address/applications', undefined)
  })

  it('dogService maps to /dogs endpoints and passes the search query', async () => {
    const get = vi.spyOn(httpClient, 'get').mockResolvedValue(response([]))
    const post = vi.spyOn(httpClient, 'post').mockResolvedValue(response({ id: 1 }))
    const put = vi.spyOn(httpClient, 'put').mockResolvedValue(response({ id: 1 }))

    await dogService.list()
    await dogService.search('Rex')
    await dogService.register({ dogName: 'Rex' })
    await dogService.update(3, { dogName: 'Rexi', breed: 'Dackel' })

    expect(get).toHaveBeenNthCalledWith(1, '/dogs', undefined)
    expect(get).toHaveBeenNthCalledWith(2, '/dogs/search', { params: { q: 'Rex' } })
    expect(post).toHaveBeenCalledWith('/dogs', { dogName: 'Rex' }, undefined)
    expect(put).toHaveBeenCalledWith('/dogs/3', { dogName: 'Rexi', breed: 'Dackel' }, undefined)
  })

  it('dashboardService and citizenService read their resources', async () => {
    const get = vi.spyOn(httpClient, 'get').mockResolvedValue(response({}))

    await dashboardService.getSummary()
    await citizenService.getById(1)

    expect(get.mock.calls.map((c) => c[0])).toEqual(['/dashboard/summary', '/citizens/1'])
  })

  it('authService posts credentials to /auth endpoints', async () => {
    const post = vi
      .spyOn(httpClient, 'post')
      .mockResolvedValue(response({ success: true, citizenId: 1, username: 'buerger', message: 'ok' }))

    const result = await authService.login({ username: 'buerger', password: 'demo-password' })
    await authService.logout()

    expect(result.citizenId).toBe(1)
    expect(post.mock.calls.map((c) => c[0])).toEqual(['/auth/login', '/auth/logout'])
  })
})
