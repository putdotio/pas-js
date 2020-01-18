import xhrMock from 'xhr-mock'
import createAPI, { IPutioAnalyticsAPIRetryItem } from '../api'

const mockUUID = 'fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14'
jest.mock('uuid/v4', () => jest.fn(() => mockUUID))

const mockCache = {
  get: jest.fn((key: string): IPutioAnalyticsAPIRetryItem[] => []),
  set: jest.fn((key: string, items: IPutioAnalyticsAPIRetryItem[]) => items),
  clear: jest.fn(),
}

describe('api utility', () => {
  const CACHE_KEY = 'pas_js_retry_queue'
  const BASE_URL = '/api'
  const REQUEST_PATH = '/alias'
  const REQUEST_BODY = { foo: 'bar' }
  const XHR_MOCK_URL = `${BASE_URL}${REQUEST_PATH}`
  const RETRY_ITEM = { id: mockUUID, url: XHR_MOCK_URL, body: REQUEST_BODY }

  let api = createAPI(BASE_URL, mockCache)
  const createRequest = () => api.post(REQUEST_PATH, REQUEST_BODY)

  beforeEach(() => {
    api = createAPI(BASE_URL, mockCache)
    jest.clearAllMocks()
    xhrMock.setup()
  })

  afterEach(() => {
    xhrMock.teardown()
  })

  it('writes failed request to retry queue when status code is >= 500', done => {
    xhrMock.post(XHR_MOCK_URL, { status: 500 })

    createRequest().subscribe({
      error: () => {
        expect(mockCache.set).toHaveBeenCalledTimes(1)
        expect(mockCache.set).toHaveBeenCalledWith(CACHE_KEY, [RETRY_ITEM])
        done()
      },
    })
  })

  it('writes failed requests due to runtime exceptions to retry queue', done => {
    console.error = jest.fn() // tslint:disable-line
    xhrMock.post(XHR_MOCK_URL, () => Promise.reject(new Error()))

    createRequest().subscribe({
      error: () => {
        expect(mockCache.set).toHaveBeenCalledTimes(1)
        expect(mockCache.set).toHaveBeenCalledWith(CACHE_KEY, [RETRY_ITEM])
        done()
      },
    })
  })

  it('writes consequent failures to retry queue', done => {
    xhrMock.post(XHR_MOCK_URL, { status: 500 })

    createRequest()
    createRequest().subscribe({
      error: () => {
        expect(mockCache.set).toHaveBeenCalledTimes(2)
        expect(mockCache.set).toHaveBeenNthCalledWith(1, CACHE_KEY, [
          RETRY_ITEM,
        ])
        expect(mockCache.set).toHaveBeenNthCalledWith(2, CACHE_KEY, [
          RETRY_ITEM,
          RETRY_ITEM,
        ])
        done()
      },
    })
  })

  it('does not write failed request to retry queue when status code is < 500', done => {
    xhrMock.post(XHR_MOCK_URL, { status: 400 })

    createRequest().subscribe({
      error: () => {
        expect(mockCache.set).not.toHaveBeenCalled()
        done()
      },
    })
  })
})
