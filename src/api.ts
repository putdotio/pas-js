import { BehaviorSubject } from "rxjs";
import { ajax, AjaxError } from "rxjs/ajax/index.js";
import { v4 as uuid } from "uuid";
import type { PutioAnalyticsCache } from "./cache";

export interface IPutioAnalyticsAPIRetryItem {
  id: string;
  path: string;
  body: object;
}

const createAPI = (baseURL: string, cache: PutioAnalyticsCache) => {
  const CACHE_KEY = "pas_js_retry_queue";

  const retryQueue = new BehaviorSubject<IPutioAnalyticsAPIRetryItem[]>(
    (cache.get(CACHE_KEY) || []) as IPutioAnalyticsAPIRetryItem[],
  );

  retryQueue.getValue().forEach((retryItem) => {
    const next = retryQueue.getValue().filter((item) => item.id !== retryItem.id);
    retryQueue.next(next);
    post(retryItem.path, retryItem.body);
  });

  retryQueue.subscribe({
    next: (value) => cache.set(CACHE_KEY, value),
  });

  function post(path: string, body: object) {
    const request = ajax({
      url: `${baseURL}${path}`,
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      timeout: 3000,
    });

    request.subscribe({
      error: (error) => {
        if (error instanceof AjaxError && (error.status > 500 || error.status === 0)) {
          const retryItem = {
            id: uuid(),
            path,
            body,
          };

          retryQueue.next([...retryQueue.getValue(), retryItem]);
        }
      },
    });

    return request;
  }

  return {
    post,
  };
};

export type PutioAnalyticsAPI = ReturnType<typeof createAPI>;

export default createAPI;
