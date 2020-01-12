import merge from 'deepmerge'
import log from 'loglevel'
import pkg from '../package.json'

interface IPutioAnalyticsClientOptions {
  loglevel: log.LogLevelDesc
  domain: string
}

class PutioAnalyticsClient {
  public static DEFAULT_OPTIONS: IPutioAnalyticsClientOptions = {
    loglevel: 'WARN',
    domain: '.put.io',
  }

  public options: IPutioAnalyticsClientOptions
  public logger: log.Logger
  public version = pkg.version

  constructor(options: IPutioAnalyticsClientOptions) {
    this.options = merge(options, {})
    this.logger = log.noConflict()
    this.logger.setLevel(this.options.loglevel)
  }
}

export default PutioAnalyticsClient
