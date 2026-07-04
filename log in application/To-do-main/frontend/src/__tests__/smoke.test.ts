/**
 * Smoke tests — verify that core modules import without errors and
 * that key types/values are present. These run in jsdom via Vitest.
 */
import { describe, it, expect } from 'vitest'

describe('API types', () => {
  it('can be imported', async () => {
    const types = await import('../types/api')
    // interfaces are erased at runtime — just confirm the module resolves
    expect(types).toBeDefined()
  })
})

describe('useAuth hook', () => {
  it('module resolves', async () => {
    const mod = await import('../hooks/useAuth')
    expect(typeof mod.default).toBe('function')
  })
})

describe('API client', () => {
  it('module resolves and exports default', async () => {
    const mod = await import('../api/client')
    expect(mod.default).toBeDefined()
  })
})

describe('API auth functions', () => {
  it('exports registerUser, loginUser, getProtected', async () => {
    const mod = await import('../api/auth')
    expect(typeof mod.registerUser).toBe('function')
    expect(typeof mod.loginUser).toBe('function')
    expect(typeof mod.getProtected).toBe('function')
  })
})
