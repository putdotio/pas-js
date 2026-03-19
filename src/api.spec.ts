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
});
