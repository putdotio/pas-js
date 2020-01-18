import Cookies from 'js-cookie'

export interface IPutioAnalyticsCacheOptions {
  domain: string
  expires: number
}

export interface IPutioAnalyticsCache<T> {
  get: (key: string) => T
  set: (key: string, value: T) => T
  clear: (key: string) => void
}

const createCache = (
  options: IPutioAnalyticsCacheOptions,
): IPutioAnalyticsCache<any> => ({
  set: (key, value) => {
    Cookies.set(key, JSON.stringify(value), {
      expires: options.expires,
      domain: options.domain,
    })

    return value
  },

  get: key => Cookies.getJSON(key),

  clear: key => Cookies.remove(key, { domain: options.domain }),
})

export default createCache
