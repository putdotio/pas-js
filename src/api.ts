import { BehaviorSubject } from 'rxjs'
import { ajax, AjaxError } from 'rxjs/ajax'
import { v4 as uuid } from 'uuid'
import { PutioAnalyticsCache } from './cache'

export interface IPutioAnalyticsAPIRetryItem {
  id: string
  path: string
  body: object
}

const createAPI = (baseURL: string, cache: PutioAnalyticsCache) => {
  const CACHE_KEY = 'pas_js_retry_queue'

  const retryQueue = new BehaviorSubject<IPutioAnalyticsAPIRetryItem[]>(
    (cache.get(CACHE_KEY) || []) as IPutioAnalyticsAPIRetryItem[],
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
        if (e instanceof AjaxError && (e.status > 500 || e.status === 0)) {
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

export type PutioAnalyticsAPI = ReturnType<typeof createAPI>

export default createAPI
