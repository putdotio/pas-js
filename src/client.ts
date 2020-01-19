import queryString from 'query-string'
import pkg from '../package.json'
import createAPI from './api'
import createCache from './cache'
import createUser from './user'
export interface IPutioAnalyticsClient {
  version: string
  alias: (params: { id: any; hash: string }) => void
  identify: (params: { id: any; hash: string; properties: any }) => void
  track: (eventName: string, eventProperties?: object) => void
  pageView: () => void
  clear: () => void
}

const createClient = ({
  config = {
    apiURL: 'https://pas.put.io/api',
    cache: {
      domain: '.put.io',
      expires: 365,
    },
  },
  factories = {
    createAPI,
    createCache,
    createUser,
  },
} = {}): IPutioAnalyticsClient => {
  const cache = factories.createCache(config.cache)
  const user = factories.createUser(cache)
  const api = factories.createAPI(config.apiURL, cache)

  const alias = (params: { id: any; hash: string }) => {
    const attributes = user.alias(params)
    api.post('/alias', {
      previous_id: attributes.anonymousId,
      id: attributes.id,
      hash: attributes.hash,
    })
  }

  const identify = (params: { id: any; hash: string; properties: any }) => {
    const attributes = user.identify(params)
    api.post('/users', {
      users: [
        {
          id: attributes.id,
          hash: attributes.hash,
          properties: attributes.properties,
        },
      ],
    })
  }

  const track = (name: string, properties: object = {}) => {
    const attributes = user.attributes.getValue()
    api.post('/events', {
      events: [
        {
          user_id: attributes.id || attributes.anonymousId,
          user_hash: attributes.hash,
          name,
          properties,
        },
      ],
    })
  }

  const pageView = () => {
    const { search, origin, pathname } = window.location
    const { utm_source, utm_medium, utm_campaign } = queryString.parse(search)

    return track('page_viewed', {
      domain: origin,
      path: pathname,
      referrer: document.referrer,
      utm_source,
      utm_medium,
      utm_campaign,
    })
  }

  const clear = () => user.clear()

  return {
    version: pkg.version,
    alias,
    identify,
    track,
    pageView,
    clear,
  }
}

export default createClient
