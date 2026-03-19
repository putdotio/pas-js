import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import Cookies from "js-cookie";
import createCache from "./cache";

vi.mock("js-cookie", () => ({
  default: {
    getJSON: vi.fn(),
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
    expect(Cookies.set).toHaveBeenCalledWith(
      "key",
      { foo: "bar" },
      {
        ...options,
        sameSite: "lax",
      },
    );
  });

  it("calls Cookies.getJSON for reading data from cookies", () => {
    cache.get("key");
    expect(Cookies.getJSON).toHaveBeenCalledWith("key");
  });

  it("calls Cookies.remove to remove data from cookies", () => {
    cache.clear("key");
    expect(Cookies.remove).toHaveBeenCalledWith("key", { domain: options.domain });
  });
});
