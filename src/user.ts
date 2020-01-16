import uuidv4 from 'uuid/v4'
import { IPutioAnalyticsCache } from './cache'

export interface IPutioAnalyticsUserAttributes {
  anonymousId: string
  id?: string
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
  alias: (params: {
    id: string | number
    hash: string
  }) => IPutioAnalyticsUserAttributes
  identify: (params: {
    id: string | number
    hash: string
    properties: any
  }) => IPutioAnalyticsUserAttributes
  clear: () => IPutioAnalyticsUserAttributes
}

const createUser = (
  cache: IPutioAnalyticsCache,
  cacheKey: string,
): IPutioAnalyticsUser => {
  const persist = (params: {
    id?: string
    hash?: string
    anonymousId: string
  }) =>
    cache.set(cacheKey, {
      id: params.id,
      hash: params.hash,
      anonymousId: params.anonymousId,
    })

  let attributes = createAttributes(cache.get(cacheKey))
  persist(attributes)

  const alias = ({ id, hash }) => {
    attributes.id = String(id)
    attributes.hash = hash
    persist(attributes)
    return attributes
  }

  const identify = ({ id, hash, properties }) => {
    attributes.id = String(id)
    attributes.hash = hash
    attributes.properties = properties
    persist(attributes)
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
