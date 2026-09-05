import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import xhrMock from "xhr-mock";
import createAPI from "./api";
import type { PutioAnalyticsCache } from "./cache";

const mockUUID = "fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14";

vi.mock("uuid", () => ({ v4: vi.fn(() => mockUUID) }));

const createMockCache = (): PutioAnalyticsCache => ({
  clear: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
});

describe("api utility", () => {
  const CACHE_KEY = "pas_js_retry_queue";
  const BASE_URL = "/api";
  const REQUEST_PATH = "/alias";
  const REQUEST_BODY = { foo: "bar" };
  const XHR_MOCK_URL = `${BASE_URL}${REQUEST_PATH}`;
  const RETRY_ITEM = { id: mockUUID, path: REQUEST_PATH, body: REQUEST_BODY };

  let mockCache: PutioAnalyticsCache;
  let api = createAPI(BASE_URL, createMockCache());
  const createRequest = () => api.post(REQUEST_PATH, REQUEST_BODY);
  const waitForRequestError = () =>
    new Promise<void>((resolve) => {
      createRequest().subscribe({
        error: () => resolve(),
      });
    });

  beforeAll(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    xhrMock.setup();
    mockCache = createMockCache();
    api = createAPI(BASE_URL, mockCache);
    vi.clearAllMocks();
  });

  afterEach(() => {
    xhrMock.teardown();
  });

  it("writes failed request to retry queue when status code is > 500", async () => {
    xhrMock.post(XHR_MOCK_URL, { status: 502 });

    await waitForRequestError();
    expect(mockCache.set).toHaveBeenCalledTimes(1);
    expect(mockCache.set).toHaveBeenCalledWith(CACHE_KEY, [RETRY_ITEM]);
  });

  it("writes failed requests due to runtime exceptions to retry queue", async () => {
    xhrMock.post(XHR_MOCK_URL, () => Promise.reject(new Error()));

    await waitForRequestError();
    expect(mockCache.set).toHaveBeenCalledTimes(1);
    expect(mockCache.set).toHaveBeenCalledWith(CACHE_KEY, [RETRY_ITEM]);
  });

  it("writes consequent failures to retry queue", async () => {
    xhrMock.post(XHR_MOCK_URL, { status: 502 });

    await waitForRequestError();
    await waitForRequestError();

    expect(mockCache.set).toHaveBeenCalledTimes(2);
    expect(mockCache.set).toHaveBeenNthCalledWith(1, CACHE_KEY, [RETRY_ITEM]);
    expect(mockCache.set).toHaveBeenNthCalledWith(2, CACHE_KEY, [RETRY_ITEM, RETRY_ITEM]);
  });

  it("does not write failed request to retry queue when status code is < 500", async () => {
    xhrMock.post(XHR_MOCK_URL, { status: 400 });

    await waitForRequestError();
    expect(mockCache.set).not.toHaveBeenCalled();
  });

  it("replays valid cached entries while discarding malformed siblings", async () => {
    const sent = Promise.withResolvers<void>();
    const requested = vi.fn();
    xhrMock.post(XHR_MOCK_URL, (_request, response) => {
      requested();
      sent.resolve();
      return response.status(200);
    });
    vi.mocked(mockCache.get).mockReturnValue([null, RETRY_ITEM, { id: "missing-path", body: {} }]);
    expect(() => createAPI(BASE_URL, mockCache)).not.toThrow();
    await sent.promise;
    expect(requested).toHaveBeenCalledTimes(1);
    expect(mockCache.set).toHaveBeenCalledWith(CACHE_KEY, []);
  });

  it("retries queued request on boot", () => {
    xhrMock.post(XHR_MOCK_URL, { status: 200 });

    const items = Array.from({ length: 7 }, (_, index) => ({
      path: REQUEST_PATH,
      id: String(index),
      body: { id: String(index) },
    }));

    vi.mocked(mockCache.get).mockReturnValue(items);
    api = createAPI(BASE_URL, mockCache);

    expect(api).toBeTruthy();
    expect(mockCache.set).toHaveBeenCalledWith(CACHE_KEY, []);
  });

  const postFailedRequest = async (path: string, body: object) => {
    const persisted = Promise.withResolvers<void>();
    vi.mocked(mockCache.set).mockImplementationOnce((_key, value) => {
      persisted.resolve();
      return value;
    });
    api.post(path, body);
    await persisted.promise;
  };

  it("keeps the newest 20 failed requests", async () => {
    xhrMock.post("/api/a", { status: 503 });
    for (let index = 0; index < 30; index++) await postFailedRequest("/a", { i: index });
    const queue = vi.mocked(mockCache.set).mock.lastCall?.[1];
    expect(queue).toEqual(
      Array.from({ length: 20 }, (_, index) => ({
        id: mockUUID,
        path: "/a",
        body: { i: index + 10 },
      })),
    );
  });

  it("bounds encoded cookie bytes and keeps recent requests after oversized failures", async () => {
    xhrMock.post(XHR_MOCK_URL, { status: 503 });
    for (let index = 0; index < 10; index++) {
      await postFailedRequest(REQUEST_PATH, { index, text: "雪".repeat(100) });
      const queue = vi.mocked(mockCache.set).mock.lastCall?.[1];
      expect(encodeURIComponent(JSON.stringify(queue)).length).toBeLessThanOrEqual(3000);
    }
    const beforeOversized = vi.mocked(mockCache.set).mock.lastCall?.[1];
    await postFailedRequest(REQUEST_PATH, { text: "雪".repeat(1000) });
    expect(vi.mocked(mockCache.set).mock.lastCall?.[1]).toEqual(beforeOversized);
    await postFailedRequest(REQUEST_PATH, { final: true });
    const queue = vi.mocked(mockCache.set).mock.lastCall?.[1];
    expect(queue).toEqual([
      { id: mockUUID, path: REQUEST_PATH, body: { index: 8, text: "雪".repeat(100) } },
      { id: mockUUID, path: REQUEST_PATH, body: { index: 9, text: "雪".repeat(100) } },
      { id: mockUUID, path: REQUEST_PATH, body: { final: true } },
    ]);
    expect(encodeURIComponent(JSON.stringify(queue)).length).toBeLessThanOrEqual(3000);
  });

  it("bounds hydrated requests before replay", async () => {
    const requested: unknown[] = [];
    const completed = Promise.withResolvers<void>();
    xhrMock.post(XHR_MOCK_URL, (request, response) => {
      requested.push(JSON.parse(request.body()));
      if (requested.length === 2) completed.resolve();
      return response.status(200);
    });
    vi.mocked(mockCache.get).mockReturnValue([
      ...Array.from({ length: 30 }, (_, index) => ({
        id: String(index),
        path: REQUEST_PATH,
        body: { index, text: "雪".repeat(100) },
      })),
      { id: "oversized", path: REQUEST_PATH, body: { text: "雪".repeat(1000) } },
    ]);
    createAPI(BASE_URL, mockCache);
    await completed.promise;
    expect(requested).toEqual([
      { index: 28, text: "雪".repeat(100) },
      { index: 29, text: "雪".repeat(100) },
    ]);
    expect(mockCache.set).toHaveBeenCalledWith(CACHE_KEY, []);
  });
});
