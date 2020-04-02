import { mock } from 'jest-mock-extended'
import xhrMock from 'xhr-mock'
import createAPI from './api'
import { PutioAnalyticsCache } from './cache'

const mockUUID = 'fcdfa284-6ce1-47b4-b2d4-1d5186fc6f14'
jest.mock('uuid/v4', () => jest.fn(() => mockUUID))

const mockCache = mock<PutioAnalyticsCache>()

describe('api utility', () => {
  const CACHE_KEY = 'pas_js_retry_queue'
  const BASE_URL = '/api'
  const REQUEST_PATH = '/alias'
  const REQUEST_BODY = { foo: 'bar' }
  const XHR_MOCK_URL = `${BASE_URL}${REQUEST_PATH}`
  const RETRY_ITEM = { id: mockUUID, path: REQUEST_PATH, body: REQUEST_BODY }

  let api = createAPI(BASE_URL, mockCache)
  const createRequest = () => api.post(REQUEST_PATH, REQUEST_BODY)

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => null)
  })

  afterAll(() => {
    const consoleError = console.error as jest.Mock // tslint:disable-line
    consoleError.mockRestore()
  })

  beforeEach(() => {
    xhrMock.setup()
    api = createAPI(BASE_URL, mockCache)
    jest.clearAllMocks()
  })

  afterEach(() => {
    xhrMock.teardown()
  })

  it('writes failed request to retry queue when status code is > 500', done => {
    xhrMock.post(XHR_MOCK_URL, { status: 502 })

    createRequest().subscribe({
      error: () => {
        expect(mockCache.set).toHaveBeenCalledTimes(1)
        expect(mockCache.set).toHaveBeenCalledWith(CACHE_KEY, [RETRY_ITEM])
        done()
      },
    })
  })

  it('writes failed requests due to runtime exceptions to retry queue', done => {
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
    xhrMock.post(XHR_MOCK_URL, { status: 502 })

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

  it('retries queued request on boot', () => {
    xhrMock.post(XHR_MOCK_URL, { status: 200 })

    const items = [
      { path: REQUEST_PATH, id: '0', body: { id: '0' } },
      { path: REQUEST_PATH, id: '1', body: { id: '1' } },
      { path: REQUEST_PATH, id: '2', body: { id: '2' } },
      { path: REQUEST_PATH, id: '3', body: { id: '3' } },
      { path: REQUEST_PATH, id: '4', body: { id: '4' } },
      { path: REQUEST_PATH, id: '5', body: { id: '5' } },
      { path: REQUEST_PATH, id: '6', body: { id: '6' } },
    ]

    mockCache.get.mockImplementation(() => items)
    api = createAPI(BASE_URL, mockCache)

    expect(mockCache.set).toBeCalled()
    expect(mockCache.set).toHaveBeenCalledWith(CACHE_KEY, [])
  })
})
