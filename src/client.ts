import merge from 'deepmerge'
import log from 'loglevel'
import queryString from 'query-string'
import pkg from '../package.json'
import createAPI, { IPutioAnalyticsAPI, IPutioAnalyticsAPIEvent } from './api'
import createCache, { IPutioAnalyticsCache } from './cache'
import createUser, { IPutioAnalyticsUser } from './user'

interface IPutioAnalyticsClientOptions {
  apiURL?: string
  loglevel?: log.LogLevelDesc
  cache?: {
    domain: string
    expires: number
    userKey: string
    eventQueueKey: string
  }
}

class PutioAnalyticsClient {
  public static DEFAULT_OPTIONS: IPutioAnalyticsClientOptions = {
    apiURL: 'https://pas.put.io',
    loglevel: 'WARN',
    cache: {
      domain: '.put.io',
      userKey: 'pas_js_user',
      eventQueueKey: 'pas_js_event_queue',
      expires: 365,
    },
  }

  public version = pkg.version
  private options: IPutioAnalyticsClientOptions
  private logger: log.Logger
  private cache: IPutioAnalyticsCache
  private user: IPutioAnalyticsUser
  private api: IPutioAnalyticsAPI

  constructor(options: IPutioAnalyticsClientOptions = {}) {
    this.options = merge(PutioAnalyticsClient.DEFAULT_OPTIONS, options)
    this.logger = log.noConflict()
    this.logger.setLevel(this.options.loglevel)
    this.cache = createCache({
      expires: this.options.cache.expires,
      domain: this.options.cache.domain,
    })
    this.user = createUser(this.cache, this.options.cache.userKey)
    this.api = createAPI({ baseURL: this.options.apiURL })
  }

  public async alias(params: { id: any; hash: string }) {
    this.logger.debug(`alias`, { params })

    const attributes = this.user.alias(params)

    try {
      await this.api.alias(attributes)
    } catch (error) {
      this.handleAPIError(error)
    }
  }

  public async identify(params: { id: any; hash: string; properties: any }) {
    this.logger.debug(`identify`, { params })

    const attributes = this.user.identify(params)

    try {
      await this.api.identify(attributes)
    } catch (error) {
      this.handleAPIError(error)
    }
  }

  public async track(event: IPutioAnalyticsAPIEvent) {
    this.logger.debug(`track`)

    try {
      await this.api.track(this.user.attributes, event)
    } catch (error) {
      this.handleAPIError(error)
    }
  }

  public pageView() {
    const { search, origin, pathname } = window.location
    const { utm_source, utm_medium, utm_campaign } = queryString.parse(search)

    return this.track({
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

  private handleAPIError(error: any) {
    this.logger.warn(`API Error`, { error })
  }
}

export default PutioAnalyticsClient
