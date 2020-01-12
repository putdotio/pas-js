import fetchMock from 'fetch-mock'
import http, { HttpError, NetworkError } from '../http'

describe('http utility', () => {
  const URL = 'https://pas.put.io/api'

  afterEach(fetchMock.restore)

  it('handles succesful responses', async () => {
    fetchMock.post(URL, { status: 200, body: { success: true } })
    const response = await http(URL, { foo: 'bar ' })
    expect(response).toEqual({ success: true })
  })

  it('handles API errors', async () => {
    fetchMock.post(URL, 400)

    try {
      await http(URL, { foo: 'bar ' })
    } catch (e) {
      expect(e).toBeInstanceOf(HttpError)
    }
  })

  it('handles network errors', async () => {
    fetchMock.post(URL, {
      throws: new TypeError('Failed to fetch'),
    })

    try {
      await http(URL, { foo: 'bar ' })
    } catch (e) {
      expect(e).toBeInstanceOf(NetworkError)
    }
  })
})
