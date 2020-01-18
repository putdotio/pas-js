import { BehaviorSubject } from 'rxjs'
import uuidv4 from 'uuid/v4'
import { IPutioAnalyticsCache } from './cache'

export interface IPutioAnalyticsUserAttributes {
  anonymousId: string
  id?: string
  hash?: string
  properties?: any
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
  attributes: BehaviorSubject<IPutioAnalyticsUserAttributes>
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

const createUser = (cache: IPutioAnalyticsCache): IPutioAnalyticsUser => {
  const cacheKey = 'pas_js_user'
  const attributes = new BehaviorSubject(createAttributes(cache.get(cacheKey)))

  attributes.subscribe({
    next: nextAttributes =>
      cache.set(cacheKey, {
        id: nextAttributes.id,
        anonymousId: nextAttributes.anonymousId,
        hash: nextAttributes.hash,
      }),
  })

  const alias = ({ id, hash }) => {
    attributes.next({ ...attributes.getValue(), id: String(id), hash })
    return attributes.getValue()
  }

  const identify = ({ id, hash, properties }) => {
    attributes.next({
      ...attributes.getValue(),
      id: String(id),
      hash,
      properties,
    })

    return attributes.getValue()
  }

  const clear = () => {
    attributes.next(createAttributes())
    return attributes.getValue()
  }

  return {
    attributes,
    alias,
    identify,
    clear,
  }
}

export default createUser
