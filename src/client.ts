import merge from 'deepmerge'
import queryString from 'query-string'
import pkg from '../package.json'
import createAPI, { IPutioAnalyticsAPI } from './api'
import createCache, {
  IPutioAnalyticsCache,
  IPutioAnalyticsCacheOptions,
} from './cache'
import createUser, { IPutioAnalyticsUser } from './user'

interface IPutioAnalyticsClientConfig {
  apiURL?: string
  cache?: {
    domain: string
    expires: number
    userKey: string
    eventQueueKey: string
  }
}

interface IPutioAnalyticsClientFactories {
  createCache: (options: IPutioAnalyticsCacheOptions) => IPutioAnalyticsCache
  createAPI: (
    baseURL: string,
    cache: IPutioAnalyticsCache,
  ) => IPutioAnalyticsAPI
  createUser: (cache: IPutioAnalyticsCache) => IPutioAnalyticsUser
}

export interface IPutioAnalyticsClient {
  version: string
  alias: (params: { id: any; hash: string }) => void
  identify: (params: { id: any; hash: string; properties: any }) => void
  track: (event: IPutioAnalyticsEvent) => void
  pageView: () => void
  clear: () => void
}

interface IPutioAnalyticsEvent {
  name: string
  properties?: any
}

const createClient = (
  baseConfig: IPutioAnalyticsClientConfig = {},
  factories: IPutioAnalyticsClientFactories = {
    createAPI,
    createCache,
    createUser,
  },
): IPutioAnalyticsClient => {
  const config = merge(
    {
      apiURL: 'https://pas.put.io/api',
      cache: {
        domain: '.put.io',
        expires: 365,
      },
    },
    baseConfig,
  )

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

  const identify = async (params: {
    id: any
    hash: string
    properties: any
  }) => {
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

  const track = async (event: IPutioAnalyticsEvent) => {
    const attributes = user.attributes.getValue()
    api.post('/events', {
      events: [
        {
          user_id: attributes.id || attributes.anonymousId,
          user_hash: attributes.hash,
          name: event.name,
          properties: event.properties,
        },
      ],
    })
  }

  const pageView = () => {
    const { search, origin, pathname } = window.location
    const { utm_source, utm_medium, utm_campaign } = queryString.parse(search)

    return track({
      name: 'page_viewed',
      properties: {
        domain: origin,
        path: pathname,
        referrer: document.referrer,
        utm_source,
        utm_medium,
        utm_campaign,
      },
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
