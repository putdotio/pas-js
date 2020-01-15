import http from './http'
import { IPutioAnalyticsUserAttributes } from './user'

interface IPutioAnalyticsAPIOptions {
  baseURL: string
}

export interface IPutioAnalyticsAPIEvent {
  name: string
  properties?: any
}

export interface IPutioAnalyticsAPI {
  alias: (attributes: IPutioAnalyticsUserAttributes) => Promise<any>
  identify: (attributes: IPutioAnalyticsUserAttributes) => Promise<any>
  track: (
    attributes: IPutioAnalyticsUserAttributes,
    event: IPutioAnalyticsAPIEvent,
  ) => Promise<any>
}

const createAPI = (options: IPutioAnalyticsAPIOptions): IPutioAnalyticsAPI => {
  const alias = (attributes: IPutioAnalyticsUserAttributes) =>
    http(`${options.baseURL}/api/alias`, {
      previous_id: attributes.anonymousId,
      id: attributes.id,
      hash: attributes.hash,
    })

  const identify = (attributes: IPutioAnalyticsUserAttributes) =>
    http(`${options.baseURL}/api/users`, {
      users: [
        {
          id: attributes.id,
          hash: attributes.hash,
          properties: attributes.properties,
        },
      ],
    })

  const track = (
    attributes: IPutioAnalyticsUserAttributes,
    event: IPutioAnalyticsAPIEvent,
  ) =>
    http(`${options.baseURL}/api/events`, {
      events: [
        {
          user_id: attributes.id,
          user_hash: attributes.hash,
          name: event.name,
          properties: event.properties,
        },
      ],
    })

  return {
    alias,
    identify,
    track,
  }
}

export default createAPI
