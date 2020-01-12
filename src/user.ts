import uuidv4 from 'uuid/v4'
import { IPutioAnalyticsCache } from './cache'

interface IPutioAnalyticsUserAttributes {
  anonymousId: string
  id?: number
  hash?: string
  properties: any
}

const createAttributes = (
  cachedAttributes = {},
): IPutioAnalyticsUserAttributes => ({
  anonymousId: uuidv4(),
  id: null,
  hash: null,
  properties: {},
  ...cachedAttributes,
})

export interface IPutioAnalyticsUser {
  attributes: IPutioAnalyticsUserAttributes
  alias: (params: { id: string; hash: string }) => IPutioAnalyticsUserAttributes
  identify: (params: {
    id: string
    hash: string
    properties: any
  }) => IPutioAnalyticsUserAttributes
  clear: () => IPutioAnalyticsUserAttributes
}

const createUser = (
  cache: IPutioAnalyticsCache,
  cacheKey: string,
): IPutioAnalyticsUser => {
  let attributes = createAttributes(cache.get(cacheKey))

  const alias = ({ id, hash }) => {
    attributes.id = id
    attributes.hash = hash
    cache.set(cacheKey, { id, hash })
    return attributes
  }

  const identify = ({ id, hash, properties }) => {
    attributes.id = id
    attributes.hash = hash
    attributes.properties = properties
    cache.set(cacheKey, { id, hash })
    return attributes
  }

  const clear = () => {
    attributes = createAttributes()
    cache.clear(cacheKey)
    return attributes
  }

  return {
    attributes,
    alias,
    identify,
    clear,
  }
}

export default createUser
