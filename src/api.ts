import { BehaviorSubject, Observable } from 'rxjs'
import { ajax, AjaxError, AjaxResponse } from 'rxjs/ajax'
import uuid from 'uuid/v4'
import { IPutioAnalyticsCache } from './cache'
export interface IPutioAnalyticsAPI {
  post: (path: string, body: object) => Observable<AjaxResponse>
}

export interface IPutioAnalyticsAPIRetryItem {
  id: string
  path: string
  body: object
}

const createAPI = (
  baseURL: string,
  cache: IPutioAnalyticsCache<IPutioAnalyticsAPIRetryItem[]>,
): IPutioAnalyticsAPI => {
  const CACHE_KEY = 'pas_js_retry_queue'
  const retryQueue = new BehaviorSubject<IPutioAnalyticsAPIRetryItem[]>(
    cache.get(CACHE_KEY) || [],
  )

  retryQueue.getValue().forEach(retryItem => {
    const next = retryQueue.getValue().filter(i => i.id !== retryItem.id)
    retryQueue.next(next)
    post(retryItem.path, retryItem.body)
  })

  retryQueue.subscribe({
    next: v => cache.set(CACHE_KEY, v),
  })

  function post(path: string, body: object) {
    const request = ajax({
      url: `${baseURL}${path}`,
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      timeout: 3000,
    })

    request.subscribe({
      error: e => {
        if (e instanceof AjaxError && (e.status >= 500 || e.status === 0)) {
          const retryItem = {
            id: uuid(),
            path,
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
