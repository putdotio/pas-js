import queryString from 'query-string'
import createAPI from './api'
import createCache from './cache'
import createUser from './user'

const defaultConfig = {
  apiURL: 'https://pas.put.io/api',
  cache: {
    domain: '.put.io',
    expires: 365,
  },
}

export const createClientFactoryWithDependencies = (
  cacheFactory: typeof createCache,
  userFactory: typeof createUser,
  apiFactory: typeof createAPI,
) => (config = defaultConfig) => {
  {
    const cache = cacheFactory(config.cache)
    const user = userFactory(cache)
    const api = apiFactory(config.apiURL, cache)

    const alias = (params: { id: any; hash: string }) => {
      const attributes = user.alias(params)
      api.post('/alias', {
        previous_id: attributes.anonymousId,
        user_id: attributes.id,
        user_hash: attributes.hash,
      })
    }

    const identify = (params: { id: any; hash: string; properties: any }) => {
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

    const track = (name: string, properties: object = {}) => {
      const attributes = user.attributes.getValue()
      api.post('/events', {
        events: [
          {
            user_id: attributes.id || attributes.anonymousId,
            user_hash: attributes.hash,
            name,
            properties,
          },
        ],
      })
    }

    const pageView = () => {
      const { search, origin, pathname } = window.location
      const { utm_source, utm_medium, utm_campaign } = queryString.parse(search)

      return track('page_viewed', {
        domain: origin,
        path: pathname,
        referrer: document.referrer,
        utm_source,
        utm_medium,
        utm_campaign,
      })
    }

    const clear = () => user.clear()

    return {
      alias,
      identify,
      track,
      pageView,
      clear,
    }
  }
}

export const createClientFactory = () => {
  return createClientFactoryWithDependencies(createCache, createUser, createAPI)
}

export type PutioAnalyticsClient = ReturnType<
  ReturnType<typeof createClientFactory>
>
