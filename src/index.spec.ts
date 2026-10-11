import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import Cookies from "js-cookie";
import xhrMock from "xhr-mock";
import createClient from ".";

const removeCookies = () => {
  Cookies.remove("pas_js_user", { domain: ".put.io" });
  Cookies.remove("pas_js_retry_queue", { domain: ".put.io" });
};

const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

describe("Initialized client", () => {
  beforeEach(() => xhrMock.setup());

  afterEach(() => {
    xhrMock.teardown();
    removeCookies();
  });

  it("does not explode", () => {
    expect(createClient()).toBeTruthy();
  });

  it("drops requests in flight on dispose, so their failures queue no retry", async () => {
    const fail = Promise.withResolvers<void>();
    xhrMock.post("https://pas.put.io/api/events", async (_request, response) => {
      await fail.promise;
      return response.status(503);
    });

    const pas = createClient();
    pas.track("opted_out");
    removeCookies();
    pas.dispose();
    fail.resolve();
    await settle();

    expect(Cookies.get()).toEqual({});
  });

  it("sends nothing and writes no cookie once disposed", async () => {
    const requested = vi.fn();
    xhrMock.post(/.*/, (_request, response) => {
      requested();
      return response.status(200);
    });

    const pas = createClient();
    pas.dispose();
    removeCookies();
    pas.alias({ id: 7, hash: "hash" });
    pas.identify({ id: 7, hash: "hash", properties: {} });
    pas.pageView();
    pas.clear();
    await settle();

    expect(requested).not.toHaveBeenCalled();
    expect(Cookies.get()).toEqual({});
  });
});
