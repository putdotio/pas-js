import { mock } from 'jest-mock-extended'
import { IPutioAnalyticsAPI } from './api'
import { IPutioAnalyticsCache } from './cache'
import {
  createClientFactory,
  createClientFactoryWithDependencies,
  PutioAnalyticsClient,
} from './client'
import createUser from './user'

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

const mockAPI = mock<IPutioAnalyticsAPI>()
const mockAPIFactory = jest.fn(() => mockAPI)

describe('Client', () => {
  const createClient = createClientFactoryWithDependencies(
    mockCacheFactory,
    createUser,
    mockAPIFactory,
  )

  let client: PutioAnalyticsClient

  afterEach(jest.clearAllMocks)
  beforeEach(() => {
    client = createClient({
      apiURL: 'https://dev.put.io:8000/api',
      cache: {
        domain: '.put.io',
        expires: 365,
      },
    })
  })

  it('initializes with default params', () => {
    expect(createClientFactory()()).toBeTruthy()
    expect(createClient()).toBeTruthy()
  })

  it('initializes with given params', () => {
    expect(mockAPIFactory).toBeCalledWith(
      'https://dev.put.io:8000/api',
      mockCacheFactory(),
    )

    expect(mockCacheGet).toBeCalledWith('pas_js_user')
    expect(mockCacheSet).toBeCalledWith(
      'pas_js_user',
      expect.objectContaining({ anonymousId }),
    )
  })

  describe('alias method', () => {
    it('calls api.post with correct params', () => {
      client.alias({ id: 7, hash: 'user_hash' })
      expect(mockAPI.post).toBeCalledWith('/alias', {
        user_id: '7',
        user_hash: 'user_hash',
        previous_id: anonymousId,
      })
    })
  })

  describe('identify method', () => {
    it('calls api.post with correct params', () => {
      client.identify({ id: 7, hash: 'user_hash', properties: { foo: 'bar' } })

      expect(mockAPI.post).toBeCalledWith('/users', {
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
      expect(mockAPI.post).toHaveBeenCalledWith('/events', {
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

      expect(mockAPI.post).toHaveBeenNthCalledWith(2, '/events', {
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
