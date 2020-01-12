import merge from 'deepmerge'
import Cookies from 'js-cookie'
import log from 'loglevel'
import pkg from '../package.json'

interface IPutioAnalyticsClientOptions {
  loglevel: log.LogLevelDesc
  cookies?: {
    domain: string
    expires: number
    userKey: string
    eventQueueKey: string
  }
}

class PutioAnalyticsClient {
  public static DEFAULT_OPTIONS: IPutioAnalyticsClientOptions = {
    loglevel: 'WARN',
    cookies: {
      domain: '.put.io',
      userKey: 'pas_js_user',
      eventQueueKey: 'pas_js_event_queue',
      expires: 365,
    },
  }

  public options: IPutioAnalyticsClientOptions
  public logger: log.Logger
  public version = pkg.version

  constructor(options?: IPutioAnalyticsClientOptions) {
    this.options = merge(options, {})

    this.logger = log.noConflict()
    this.logger.setLevel(this.options.loglevel)
  }
}

export default PutioAnalyticsClient
