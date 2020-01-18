import { ajax } from 'rxjs/ajax'
import { IPutioAnalyticsCache } from './cache'
import { IPutioAnalyticsUserAttributes } from './user'

export interface IPutioAnalyticsAPIOptions {
  baseURL: string
}

export interface IPutioAnalyticsAPIEvent {
  name: string
  properties?: any
}

export interface IPutioAnalyticsAPI {
  alias: (attributes: IPutioAnalyticsUserAttributes) => void
  identify: (attributes: IPutioAnalyticsUserAttributes) => void
  track: (
    attributes: IPutioAnalyticsUserAttributes,
    event: IPutioAnalyticsAPIEvent,
  ) => void
}

const createAPI = (
  baseURL: string,
  cache: IPutioAnalyticsCache,
): IPutioAnalyticsAPI => {
  const alias = (attributes: IPutioAnalyticsUserAttributes) =>
    ajax({
      url: `${baseURL}/api/alias`,
      method: 'POST',
      body: {
        previous_id: attributes.anonymousId,
        id: attributes.id,
        hash: attributes.hash,
      },
    })

  const identify = (attributes: IPutioAnalyticsUserAttributes) =>
    ajax({
      url: `${baseURL}/api/users`,
      method: 'POST',
      body: {
        users: [
          {
            id: attributes.id,
            hash: attributes.hash,
            properties: attributes.properties,
          },
        ],
      },
    })

  const track = (
    attributes: IPutioAnalyticsUserAttributes,
    event: IPutioAnalyticsAPIEvent,
  ) =>
    ajax({
      url: `${baseURL}/api/events`,
      method: 'POST',
      body: {
        events: [
          {
            user_id: attributes.id,
            user_hash: attributes.hash,
            name: event.name,
            properties: event.properties,
          },
        ],
      },
    })

  return {
    alias,
    identify,
    track,
  }
}

export default createAPI
