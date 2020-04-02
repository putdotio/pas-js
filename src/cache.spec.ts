import Cookies from 'js-cookie'
import createCache from './cache'

jest.mock('js-cookie', () => {
  return {
    set: jest.fn(),
    getJSON: jest.fn(),
    remove: jest.fn(),
  }
})

describe('cache utility', () => {
  const options = { domain: '.put.io', expires: 365 }
  const cache = createCache(options)

  it('calls Cookies.set for saving data to cookies', () => {
    cache.set('key', { foo: 'bar' })
    expect(Cookies.set).toBeCalledWith('key', { foo: 'bar' }, options)
  })

  it('calls Cookies.getJSON for reading data from cookies', () => {
    cache.get('key')
    expect(Cookies.getJSON).toBeCalledWith('key')
  })

  it('calls Cookes.remove to remove data from cookies', () => {
    cache.clear('key')
    expect(Cookies.remove).toBeCalledWith('key', { domain: options.domain })
  })
})
