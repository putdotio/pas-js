import { BehaviorSubject, Observable } from 'rxjs'
import { ajax, AjaxError, AjaxResponse } from 'rxjs/ajax'
import uuid from 'uuid/v4'
import { IPutioAnalyticsCache } from './cache'
export interface IPutioAnalyticsAPI {
  post: (path: string, body: object) => Observable<AjaxResponse>
}

export interface IPutioAnalyticsAPIRetryItem {
  id: string
  url: string
  body: object
}

const createAPI = (
  baseURL: string,
  cache: IPutioAnalyticsCache<IPutioAnalyticsAPIRetryItem[]>,
): IPutioAnalyticsAPI => {
  const CACHE_KEY = 'pas_js_retry_queue'
  const retryQueue = new BehaviorSubject<IPutioAnalyticsAPIRetryItem[]>(
    cache.get(CACHE_KEY),
  )

  retryQueue.subscribe({
    next: v => cache.set(CACHE_KEY, v),
  })

  const post = (path: string, body: object) => {
    const url = `${baseURL}${path}`

    const request = ajax({
      method: 'POST',
      url,
      body,
      headers: { 'Content-Type': 'application/json' },
      timeout: 3000,
    })

    request.subscribe({
      error: e => {
        if (e instanceof AjaxError && (e.status >= 500 || e.status === 0)) {
          const retryItem = {
            id: uuid(),
            url,
            body,
          }

          retryQueue.next([...retryQueue.getValue(), retryItem])
        }
      },
    })

    return request
  }

  return {
    post,
  }
}

export default createAPI
