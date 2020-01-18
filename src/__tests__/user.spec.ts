import createUser from '../user'

jest.mock('uuid/v4', () =>
  jest.fn(() => 'fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14'),
)

describe('user utility', () => {
  const cacheKey = 'pas_js_user'
  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
  }

  beforeEach(jest.clearAllMocks)

  it('initializes with anonymous attributes when the cache is empty', () => {
    const user = createUser(mockCache)
    expect(user.attributes.getValue()).toMatchInlineSnapshot(`
      Object {
        "anonymousId": "fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14",
        "hash": null,
        "id": null,
        "properties": Object {},
      }
    `)

    expect(mockCache.set).toHaveBeenCalledWith(cacheKey, {
      anonymousId: 'fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14',
      hash: null,
      id: null,
    })
  })

  it('initializes with persisted attributes when the cache is not empty', () => {
    mockCache.get.mockImplementation(() => ({
      id: '77',
      hash: 'cached_user_hash',
    }))

    const user = createUser(mockCache)

    expect(user.attributes.getValue()).toMatchInlineSnapshot(`
      Object {
        "anonymousId": "fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14",
        "hash": "cached_user_hash",
        "id": "77",
        "properties": Object {},
      }
    `)

    expect(mockCache.set).toHaveBeenCalledWith(cacheKey, {
      anonymousId: 'fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14',
      hash: 'cached_user_hash',
      id: '77',
    })
  })

  it('sets user id and hash when calling the alias method', () => {
    const user = createUser(mockCache)
    const attributes = user.alias({ id: 7, hash: 'user_hash' })

    expect(attributes).toMatchInlineSnapshot(`
      Object {
        "anonymousId": "fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14",
        "hash": "user_hash",
        "id": "7",
        "properties": Object {},
      }
    `)

    expect(mockCache.set).toHaveBeenCalledWith(cacheKey, {
      id: attributes.id,
      hash: attributes.hash,
      anonymousId: attributes.anonymousId,
    })
  })

  it('sets user id, hash and properties when calling the identify method', () => {
    const user = createUser(mockCache)
    const attributes = user.identify({
      id: 7,
      hash: 'user_hash',
      properties: { name: 'putio_user', email: 'user@put.io' },
    })

    expect(attributes).toMatchInlineSnapshot(`
      Object {
        "anonymousId": "fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14",
        "hash": "user_hash",
        "id": "7",
        "properties": Object {
          "email": "user@put.io",
          "name": "putio_user",
        },
      }
    `)

    expect(mockCache.set).toHaveBeenCalledWith(cacheKey, {
      id: attributes.id,
      hash: attributes.hash,
      anonymousId: attributes.anonymousId,
    })
  })

  it('resets attributes when calling the clear method', () => {
    const user = createUser(mockCache)
    user.alias({ id: 7, hash: 'user_hash' })
    const attributes = user.clear()

    expect(attributes).toMatchInlineSnapshot(`
      Object {
        "anonymousId": "fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14",
        "hash": null,
        "id": null,
        "properties": Object {},
      }
    `)

    expect(mockCache.set).toHaveBeenCalledWith(cacheKey, {
      anonymousId: 'fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14',
      hash: null,
      id: null,
    })
  })
})
