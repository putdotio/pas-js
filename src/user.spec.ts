import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import type { PutioAnalyticsCache } from "./cache";
import createUser from "./user";

const anonymousId = "fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14";

vi.mock("uuid", () => ({ v4: vi.fn(() => anonymousId) }));

const mockCache: PutioAnalyticsCache = {
  clear: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
};

describe("user utility", () => {
  const CACHE_KEY = "pas_js_user";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with anonymous attributes when the cache is empty", () => {
    const user = createUser(mockCache);
    expect(user.attributes.getValue()).toMatchInlineSnapshot(`
      {
        "anonymousId": "fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14",
        "hash": undefined,
        "id": undefined,
        "properties": {},
      }
    `);

    expect(mockCache.set).toHaveBeenCalledWith(CACHE_KEY, {
      anonymousId,
      hash: undefined,
      id: undefined,
    });
  });

  it("initializes with persisted attributes when the cache is not empty", () => {
    vi.mocked(mockCache.get).mockReturnValue({
      hash: "cached_user_hash",
      id: "77",
    });

    const user = createUser(mockCache);

    expect(user.attributes.getValue()).toMatchInlineSnapshot(`
      {
        "anonymousId": "fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14",
        "hash": "cached_user_hash",
        "id": "77",
        "properties": {},
      }
    `);

    expect(mockCache.set).toHaveBeenCalledWith(CACHE_KEY, {
      anonymousId,
      hash: "cached_user_hash",
      id: "77",
    });
  });

  it("sets user id and hash when calling the alias method", () => {
    const user = createUser(mockCache);
    const attributes = user.alias({ id: 7, hash: "user_hash" });

    expect(attributes).toMatchInlineSnapshot(`
      {
        "anonymousId": "fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14",
        "hash": "user_hash",
        "id": "7",
        "properties": {},
      }
    `);

    expect(mockCache.set).toHaveBeenCalledWith(CACHE_KEY, {
      anonymousId: attributes.anonymousId,
      hash: attributes.hash,
      id: attributes.id,
    });
  });

  it("sets user id, hash, and properties when calling the identify method", () => {
    const user = createUser(mockCache);
    const attributes = user.identify({
      id: 7,
      hash: "user_hash",
      properties: { email: "user@example.com", name: "example_user" },
    });

    expect(attributes).toMatchInlineSnapshot(`
      {
        "anonymousId": "fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14",
        "hash": "user_hash",
        "id": "7",
        "properties": {
          "email": "user@example.com",
          "name": "example_user",
        },
      }
    `);

    expect(mockCache.set).toHaveBeenCalledWith(CACHE_KEY, {
      anonymousId: attributes.anonymousId,
      hash: attributes.hash,
      id: attributes.id,
    });
  });

  it("resets attributes when calling the clear method", () => {
    const user = createUser(mockCache);
    user.alias({ id: 7, hash: "user_hash" });
    const attributes = user.clear();

    expect(attributes).toMatchInlineSnapshot(`
      {
        "anonymousId": "fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14",
        "hash": undefined,
        "id": undefined,
        "properties": {},
      }
    `);

    expect(mockCache.set).toHaveBeenCalledWith(CACHE_KEY, {
      anonymousId,
      hash: undefined,
      id: undefined,
    });
  });
});
