import Cookies from 'js-cookie'

export interface IPutioAnalyticsCacheOptions {
  domain: string
  expires: number
}

export interface IPutioAnalyticsCache {
  set: (key: string, value: string | object) => string | object
  get: (key: string) => string | object
  clear: (key: string) => void
}

const createCache = (
  options: IPutioAnalyticsCacheOptions,
): IPutioAnalyticsCache => ({
  set: (key, value) => {
    Cookies.set(key, value, {
      expires: options.expires,
      domain: options.domain,
    })

    return value
  },

  get: key => Cookies.getJSON(key),

  clear: key => Cookies.remove(key, { domain: options.domain }),
})

export default createCache
