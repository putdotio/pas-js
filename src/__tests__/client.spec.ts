import { IPutioAnalyticsAPI } from '../api'
import { IPutioAnalyticsCache } from '../cache'
import createClient, { IPutioAnalyticsClient } from '../client'
import createUser from '../user'

const anonymousId = 'fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14'
jest.mock('uuid/v4', () => jest.fn(() => anonymousId))

const mockCacheGet = jest.fn()
const mockCacheSet = jest.fn()
const mockCacheClear = jest.fn()
const mockCacheFactory = (): IPutioAnalyticsCache<any> => {
  const cache = {}
  return {
    get: mockCacheGet.mockImplementation(key => cache[key]),
    set: mockCacheSet.mockImplementation((key, value) => (cache[key] = value)),
    clear: mockCacheClear.mockImplementation(key => delete cache[key]),
  }
}

const mockAPIPost = jest.fn()
const mockAPIFactory = (): IPutioAnalyticsAPI => {
  return {
    post: mockAPIPost,
  }
}

describe('Client', () => {
  let client: IPutioAnalyticsClient

  afterEach(jest.clearAllMocks)
  beforeEach(() => {
    client = createClient({
      config: {
        apiURL: 'https://pas.put.io/api',
        cache: {
          domain: '.put.io',
          expires: 365,
        },
      },
      factories: {
        createAPI: mockAPIFactory,
        createCache: mockCacheFactory,
        createUser,
      },
    })
  })

  it('initializes with default params', () => {
    expect(createClient()).toBeTruthy()
  })

  it('initializes with given params', () => {
    expect(mockCacheGet).toBeCalledWith('pas_js_user')
    expect(mockCacheSet).toBeCalledWith(
      'pas_js_user',
      expect.objectContaining({ anonymousId }),
    )
  })

  describe('alias method', () => {
    it('calls api.post with correct params', () => {
      client.alias({ id: 7, hash: 'user_hash' })
      expect(mockAPIPost).toBeCalledWith('/alias', {
        user_id: '7',
        user_hash: 'user_hash',
        previous_id: anonymousId,
      })
    })
  })

  describe('identify method', () => {
    it('calls api.post with correct params', () => {
      client.identify({ id: 7, hash: 'user_hash', properties: { foo: 'bar' } })

      expect(mockAPIPost).toBeCalledWith('/users', {
        users: [
          {
            id: '7',
            hash: 'user_hash',
            properties: { foo: 'bar' },
          },
        ],
      })
    })
  })

  describe('track method', () => {
    it('calls api.post with correct params', () => {
      client.track('event_name')
      expect(mockAPIPost).toHaveBeenCalledWith('/events', {
        events: [
          {
            name: 'event_name',
            user_id: anonymousId,
            user_hash: null,
            properties: {},
          },
        ],
      })
    })
  })

  describe('pageView method', () => {
    it('calls track with correct params', () => {
      window = Object.create(window)
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'https://app.put.io',
          pathname: '/files',
          search:
            '?utm_source=UTM_SOURCE&utm_medium=UTM_MEDIUM&utm_campaign=UTM_CAMPAIGN',
        },
        writable: true,
      })

      client.alias({ id: 7, hash: 'user_hash' })
      client.pageView()

      expect(mockAPIPost).toHaveBeenNthCalledWith(2, '/events', {
        events: [
          {
            user_id: '7',
            user_hash: 'user_hash',
            name: 'page_viewed',
            properties: {
              domain: 'https://app.put.io',
              path: '/files',
              referrer: '',
              utm_campaign: 'UTM_CAMPAIGN',
              utm_medium: 'UTM_MEDIUM',
              utm_source: 'UTM_SOURCE',
            },
          },
        ],
      })
    })
  })

  describe('clear method', () => {
    it('calls user.clear', () => {
      client.alias({ id: 7, hash: 'user_hash' })
      client.clear()
      expect(mockCacheSet).toBeCalledWith('pas_js_user', {
        anonymousId,
        id: null,
        hash: null,
      })
    })
  })
})
