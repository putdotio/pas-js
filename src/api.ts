import { BehaviorSubject } from "rxjs";
import { ajax, AjaxError } from "rxjs/ajax";
import { v4 as uuid } from "uuid";
import type { PutioAnalyticsCache } from "./cache";

export interface IPutioAnalyticsAPIRetryItem {
  id: string;
  path: string;
  body: object;
}

const readRetryQueue = (value: unknown): IPutioAnalyticsAPIRetryItem[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item: unknown): item is IPutioAnalyticsAPIRetryItem =>
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      typeof item.id === "string" &&
      item.id.length > 0 &&
      "path" in item &&
      typeof item.path === "string" &&
      item.path.length > 0 &&
      "body" in item &&
      typeof item.body === "object" &&
      item.body !== null,
  );
};

const createAPI = (baseURL: string, cache: PutioAnalyticsCache) => {
  const CACHE_KEY = "pas_js_retry_queue";

  const retryQueue = new BehaviorSubject<IPutioAnalyticsAPIRetryItem[]>(
    readRetryQueue(cache.get(CACHE_KEY)),
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
