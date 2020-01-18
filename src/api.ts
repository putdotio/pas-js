import { BehaviorSubject, Observable } from 'rxjs'
import { ajax, AjaxError, AjaxResponse } from 'rxjs/ajax'
import { IPutioAnalyticsCache } from './cache'
export interface IPutioAnalyticsAPI {
  post: (path: string, body: object) => Observable<AjaxResponse>
}

const createAPI = (
  baseURL: string,
  cache: IPutioAnalyticsCache,
): IPutioAnalyticsAPI => {
  const cacheKey = 'pas_js_retry_queue'
  const retryQueue = new BehaviorSubject([])

  retryQueue.subscribe({
    next: v => cache.set(cacheKey, v),
  })

  const post = (path: string, body: object) => {
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
          retryQueue.next([e.name])
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
