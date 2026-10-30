import { sessionStore } from './sessionStorage'

describe('sessionStore', () => {
  beforeEach(() => sessionStore.clear())

  it('stores, reads and clears the session', () => {
    expect(sessionStore.get()).toBeNull()
    sessionStore.set({ citizenId: 1, username: 'buerger' })
    expect(sessionStore.get()).toEqual({ citizenId: 1, username: 'buerger' })
    expect(JSON.parse(window.sessionStorage.getItem('bp.session') ?? '{}')).toEqual({ citizenId: 1, username: 'buerger' })
    sessionStore.clear()
    expect(sessionStore.get()).toBeNull()
    expect(window.sessionStorage.getItem('bp.session')).toBeNull()
  })

  it('ignores malformed persisted data', () => {
    window.sessionStorage.setItem('bp.session', '{not json')
    expect(sessionStore.get()).toBeNull()
    window.sessionStorage.setItem('bp.session', JSON.stringify({ citizenId: 'x', username: 1 }))
    expect(sessionStore.get()).toBeNull()
  })
})
