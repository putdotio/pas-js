import xhrMock from 'xhr-mock'
import createAPI from '../api'

describe('api utility', () => {
  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
  }

  const cacheKey = 'pas_js_retry_queue'
  const baseURL = '/api'
  const api = createAPI(baseURL, mockCache)

  beforeEach(() => {
    jest.clearAllMocks()
    xhrMock.setup()
  })

  afterEach(() => {
    xhrMock.teardown()
  })

  it('writes failed request to retry queue if status code is >= 500', done => {
    xhrMock.post(`${baseURL}/alias`, {
      status: 500,
    })

    const request = api.post('/alias', { id: 1 })

    request.subscribe({
      error: () => {
        expect(mockCache.set).toHaveBeenCalledTimes(1)
        done()
      },
    })
  })

  it('does not write failed request to retry queue if status code is < 500', done => {
    xhrMock.post(`${baseURL}/alias`, {
      status: 400,
    })

    const request = api.post('/alias', { id: 1 })

    request.subscribe({
      error: () => {
        expect(mockCache.set).not.toHaveBeenCalled()
        done()
      },
    })
  })

  it('writes runtime errors to retry queue', done => {
    xhrMock.post(`${baseURL}/alias`, () => Promise.reject(new Error()))

    const request = api.post('/alias', { id: 1 })

    request.subscribe({
      error: () => {
        expect(mockCache.set).toHaveBeenCalledTimes(1)
        done()
      },
    })
  })
})
