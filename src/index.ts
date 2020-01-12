import merge from 'deepmerge'
import log from 'loglevel'
import pkg from '../package.json'
import createCache, { IPutioAnalyticsCache } from './cache'
import createUser, { IPutioAnalyticsUser } from './user'

interface IPutioAnalyticsClientOptions {
  loglevel: log.LogLevelDesc
  cache?: {
    domain: string
    expires: number
    userKey: string
    eventQueueKey: string
  }
}

class PutioAnalyticsClient {
  public static DEFAULT_OPTIONS: IPutioAnalyticsClientOptions = {
    loglevel: 'WARN',
    cache: {
      domain: '.put.io',
      userKey: 'pas_js_user',
      eventQueueKey: 'pas_js_event_queue',
      expires: 365,
    },
  }

  public options: IPutioAnalyticsClientOptions
  public version = pkg.version

  private logger: log.Logger
  private cache: IPutioAnalyticsCache
  private user: IPutioAnalyticsUser

  constructor(options?: IPutioAnalyticsClientOptions) {
    this.options = merge(options, {})
    this.logger = log.noConflict()
    this.logger.setLevel(this.options.loglevel)

    this.cache = createCache({
      expires: this.options.cache.expires,
      domain: this.options.cache.domain,
    })

    this.user = createUser(this.cache, this.options.cache.userKey)
  }

  public alias(params: { id: string; hash: string }) {
    this.logger.debug(`alias`, { params })
    const attributes = this.user.alias(params)
    // this.api.alias(attributes)
  }

  public identify(params: { id: string; hash: string; properties: any }) {
    this.logger.debug(`identify`, { params })
    const attributes = this.user.identify(params)
    // this.api.identify(this.user)
  }

  public track() {
    // this.api.track(this.user)
  }

  public pageView() {
    // this.api.track(this.user)
  }
}

export default PutioAnalyticsClient
