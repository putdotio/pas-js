import Cookies from 'js-cookie'

export interface IPutioAnalyticsCacheOptions {
  domain: string
  expires: number
}

const createCache = <T extends object>(
  options: IPutioAnalyticsCacheOptions,
) => ({
  set: (key: string, value: T) => {
    Cookies.set(key, value, {
      expires: options.expires,
      domain: options.domain,
      sameSite: 'lax',
    })

    return value
  },

  get: (key: string) => Cookies.getJSON(key) as T,

  clear: (key: string) => Cookies.remove(key, { domain: options.domain }),
})

export type PutioAnalyticsCache = ReturnType<typeof createCache>

export default createCache
