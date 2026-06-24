import Cookies from "js-cookie";

export interface IPutioAnalyticsCacheOptions {
  domain: string;
  expires: number;
}

const parseCookieValue = <T extends object>(value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
};

const createCache = <T extends object>(options: IPutioAnalyticsCacheOptions) => ({
  set: (key: string, value: T) => {
    Cookies.set(key, JSON.stringify(value), {
      expires: options.expires,
      domain: options.domain,
      sameSite: "lax",
    });

    return value;
  },

  get: (key: string) => parseCookieValue<T>(Cookies.get(key)),

  clear: (key: string) => Cookies.remove(key, { domain: options.domain }),
});

export type PutioAnalyticsCache = ReturnType<typeof createCache>;

export default createCache;
