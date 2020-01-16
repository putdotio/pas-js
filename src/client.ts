import merge from 'deepmerge'
import log from 'loglevel'
import queryString from 'query-string'
import pkg from '../package.json'
import createAPI, {
  IPutioAnalyticsAPI,
  IPutioAnalyticsAPIEvent,
  IPutioAnalyticsAPIOptions,
} from './api'
import createCache, {
  IPutioAnalyticsCache,
  IPutioAnalyticsCacheOptions,
} from './cache'
import createUser, { IPutioAnalyticsUser } from './user'

interface IPutioAnalyticsClientConfig {
  apiURL?: string
  loglevel?: log.LogLevelDesc
  cache?: {
    domain: string
    expires: number
    userKey: string
    eventQueueKey: string
  }
}

interface IPutioAnalyticsClientFactories {
  createAPI: (options: IPutioAnalyticsAPIOptions) => IPutioAnalyticsAPI
  createCache: (options: IPutioAnalyticsCacheOptions) => IPutioAnalyticsCache
  createUser: (
    cache: IPutioAnalyticsCache,
    cacheKey: string,
  ) => IPutioAnalyticsUser
}

export interface IPutioAnalyticsClient {
  version: string
  alias: (params: { id: any; hash: string }) => Promise<any>
  identify: (params: { id: any; hash: string; properties: any }) => Promise<any>
  track: (event: IPutioAnalyticsAPIEvent) => Promise<any>
  pageView: () => Promise<any>
  clear: () => void
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
      apiURL: 'https://pas.put.io',
      loglevel: 'WARN',
      cache: {
        domain: '.put.io',
        userKey: 'pas_js_user',
        eventQueueKey: 'pas_js_event_queue',
        expires: 365,
      },
    },
    baseConfig,
  )

  const logger = log.noConflict()
  logger.setLevel(config.loglevel)

  const cache = factories.createCache(config.cache)
  const user = factories.createUser(cache, config.cache.userKey)
  const api = factories.createAPI({ baseURL: config.apiURL })

  const handleAPIError = (error: any) => {
    logger.warn(`api error`, { error })
  }

  const alias = async (params: { id: any; hash: string }) => {
    logger.debug(`alias`, { params })

    const attributes = user.alias(params)

    try {
      await api.alias(attributes)
    } catch (error) {
      handleAPIError(error)
    }
  }

  const identify = async (params: {
    id: any
    hash: string
    properties: any
  }) => {
    logger.debug(`identify`, { params })

    const attributes = user.identify(params)

    try {
      await api.identify(attributes)
    } catch (error) {
      handleAPIError(error)
    }
  }

  const track = async (event: IPutioAnalyticsAPIEvent) => {
    logger.debug(`track`)

    try {
      await api.track(user.attributes, event)
    } catch (error) {
      handleAPIError(error)
    }
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
