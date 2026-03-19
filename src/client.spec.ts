import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import type { PutioAnalyticsAPI } from "./api";
import {
  createClientFactory,
  createClientFactoryWithDependencies,
  type PutioAnalyticsClient,
} from "./client";
import createUser from "./user";

const anonymousId = "fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14";

vi.mock("uuid", () => ({ v4: vi.fn(() => anonymousId) }));

const mockCacheGet = vi.fn();
const mockCacheSet = vi.fn();
const mockCacheClear = vi.fn();

const mockCacheFactory = () => {
  const cache: Record<string, unknown> = {};

  return {
    clear: mockCacheClear.mockImplementation((key: string) => delete cache[key]),
    get: mockCacheGet.mockImplementation((key: string) => cache[key]),
    set: mockCacheSet.mockImplementation((key: string, value: unknown) => (cache[key] = value)),
  };
};

const mockAPI: PutioAnalyticsAPI = {
  post: vi.fn(),
};
const mockAPIFactory = vi.fn(() => mockAPI);

describe("Client", () => {
  const createClient = createClientFactoryWithDependencies(
    mockCacheFactory as never,
    createUser,
    mockAPIFactory,
  );

  let client: PutioAnalyticsClient;

  beforeEach(() => {
    window.history.replaceState(
      {},
      "",
      "/files?utm_source=UTM_SOURCE&utm_medium=UTM_MEDIUM&utm_campaign=UTM_CAMPAIGN",
    );

    client = createClient({
      apiURL: "https://dev.put.io:8000/api",
      cache: {
        domain: ".put.io",
        expires: 365,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/");
  });

  it("initializes with default params", () => {
    expect(createClientFactory()()).toBeTruthy();
    expect(createClient()).toBeTruthy();
  });

  it("initializes with given params", () => {
    expect(mockAPIFactory).toHaveBeenCalledWith(
      "https://dev.put.io:8000/api",
      expect.objectContaining({
        clear: expect.any(Function),
        get: expect.any(Function),
        set: expect.any(Function),
      }),
    );

    expect(mockCacheGet).toHaveBeenCalledWith("pas_js_user");
    expect(mockCacheSet).toHaveBeenCalledWith(
      "pas_js_user",
      expect.objectContaining({ anonymousId }),
    );
  });

  it("calls api.post with correct params for alias", () => {
    client.alias({ id: 7, hash: "user_hash" });
    expect(mockAPI.post).toHaveBeenCalledWith("/alias", {
      previous_id: anonymousId,
      user_hash: "user_hash",
      user_id: "7",
    });
  });

  it("calls api.post with correct params for identify", () => {
    client.identify({ id: 7, hash: "user_hash", properties: { foo: "bar" } });

    expect(mockAPI.post).toHaveBeenCalledWith("/users", {
      users: [
        {
          hash: "user_hash",
          id: "7",
          properties: { foo: "bar" },
        },
      ],
    });
  });

  it("calls api.post with correct params for track", () => {
    client.track("event_name");
    expect(mockAPI.post).toHaveBeenCalledWith("/events", {
      events: [
        {
          name: "event_name",
          properties: {},
          user_hash: undefined,
          user_id: anonymousId,
        },
      ],
    });
  });

  it("calls track with correct params for pageView", () => {
    client.alias({ id: 7, hash: "user_hash" });
    client.pageView();

    expect(mockAPI.post).toHaveBeenNthCalledWith(2, "/events", {
      events: [
        {
          name: "page_viewed",
          properties: {
            domain: "https://app.put.io",
            path: "/files",
            referrer: "",
            utm_campaign: "UTM_CAMPAIGN",
            utm_medium: "UTM_MEDIUM",
            utm_source: "UTM_SOURCE",
          },
          user_hash: "user_hash",
          user_id: "7",
        },
      ],
    });
  });

  it("clears cached user state", () => {
    client.alias({ id: 7, hash: "user_hash" });
    client.clear();
    expect(mockCacheSet).toHaveBeenCalledWith("pas_js_user", {
      anonymousId,
      hash: undefined,
      id: undefined,
    });
  });
});
