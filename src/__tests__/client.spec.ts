import { IPutioAnalyticsAPI } from '../api'
import { IPutioAnalyticsCache } from '../cache'
import { IPutioAnalyticsUser } from '../user'

import Client from '../client'

jest.mock('../cache', () => (): IPutioAnalyticsCache => {
  const cache = {}

  return {
    get: jest.fn(key => cache[key]),
    set: jest.fn((key, value) => (cache[key] = value)),
    clear: jest.fn(key => (cache[key] = undefined)),
  }
})

jest.mock('../api', () => (): IPutioAnalyticsAPI => ({
  alias: jest.fn(),
  identify: jest.fn(),
  track: jest.fn(),
}))

describe('Client', () => {
  afterEach(jest.clearAllMocks)

  it('initializes with given params', () => {
    const client = new Client({ apiURL: 'example.com' })
    // @ts-ignore
    expect(client.options).toMatchInlineSnapshot(`
      Object {
        "apiURL": "example.com",
        "cache": Object {
          "domain": ".put.io",
          "eventQueueKey": "pas_js_event_queue",
          "expires": 365,
          "userKey": "pas_js_user",
        },
        "loglevel": "WARN",
      }
    `)
  })

  describe('alias method', () => {
    it('calls api.alias with correct params', () => {
      const client = new Client()
      client.alias({ id: 7, hash: 'user_hash' })

      // @ts-ignore
      expect(client.api.alias).toBeCalledWith(
        expect.objectContaining({ id: '7', hash: 'user_hash' }),
      )
    })
  })

  describe('identify method', () => {
    it('calls api.identify with correct params', () => {
      const client = new Client()
      client.identify({ id: 7, hash: 'user_hash', properties: { foo: 'bar' } })

      // @ts-ignore
      expect(client.api.identify).toBeCalledWith(
        expect.objectContaining({
          id: '7',
          hash: 'user_hash',
          properties: { foo: 'bar' },
        }),
      )
    })
  })

  describe('track method', () => {
    it('calls api.track with correct params', () => {
      const client = new Client()
      client.alias({ id: 7, hash: 'user_hash' })
      client.track({ name: 'event_name' })

      // @ts-ignore
      expect(client.api.track).toBeCalledWith(
        expect.objectContaining({ id: '7', hash: 'user_hash' }),
        expect.objectContaining({ name: 'event_name' }),
      )
    })
  })

  describe('pageView method', () => {
    it('calls track with correct params', () => {
      const client = new Client()
      const trackSpy = jest.spyOn(client, 'track')

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

      expect(trackSpy).toBeCalledWith({
        name: 'page_viewed',
        properties: {
          domain: 'https://app.put.io',
          path: '/files',
          referrer: '',
          utm_campaign: 'UTM_CAMPAIGN',
          utm_medium: 'UTM_MEDIUM',
          utm_source: 'UTM_SOURCE',
        },
      })
    })
  })
})
