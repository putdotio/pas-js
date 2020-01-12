import merge from 'deepmerge'
import log from 'loglevel'

interface IPutioAnalyticsClientOptions {
  loglevel: log.LogLevelDesc
}

class PutioAnalyticsClient {
  public static DEFAULT_OPTIONS: IPutioAnalyticsClientOptions = {
    loglevel: 'WARN',
  }

  public options: IPutioAnalyticsClientOptions
  public logger: log.Logger

  constructor(options: IPutioAnalyticsClientOptions) {
    this.options = merge(options, {})
    this.logger = log.noConflict()
    this.logger.setLevel(this.options.loglevel)
  }
}

export default PutioAnalyticsClient
