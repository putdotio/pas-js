import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import Cookies from "js-cookie";
import createCache from "./cache";

vi.mock("js-cookie", () => ({
  default: {
    get: vi.fn(),
    remove: vi.fn(),
    set: vi.fn(),
  },
}));

describe("cache utility", () => {
  const options = { domain: ".put.io", expires: 365 };
  const cache = createCache(options);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls Cookies.set for saving data to cookies", () => {
    cache.set("key", { foo: "bar" });
    expect(Cookies.set).toHaveBeenCalledWith("key", JSON.stringify({ foo: "bar" }), {
      ...options,
      sameSite: "lax",
    });
  });

  it("reads and parses cookie data", () => {
    vi.mocked(Cookies.get).mockReturnValue(JSON.stringify({ foo: "bar" }));
    expect(cache.get("key")).toEqual({ foo: "bar" });
    expect(Cookies.get).toHaveBeenCalledWith("key");
  });

  it("returns undefined when cookie data is absent or invalid", () => {
    vi.mocked(Cookies.get).mockReturnValue(undefined);
    expect(cache.get("key")).toBeUndefined();

    vi.mocked(Cookies.get).mockReturnValue("not json");
    expect(cache.get("key")).toBeUndefined();
  });

  it("calls Cookies.remove to remove data from cookies", () => {
    cache.clear("key");
    expect(Cookies.remove).toHaveBeenCalledWith("key", { domain: options.domain });
  });
});
