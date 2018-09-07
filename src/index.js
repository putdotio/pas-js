import Cookies from 'js-cookie'
import uuidv4 from 'uuid/v4'
import pkg from '../package.json'
import Api from './api'

class PutioAnalyticsClient {
  static GetDomain() {
    const hostname = window.location.hostname.split('.')
    return hostname.length >= 2 ?
      `.${hostname[hostname.length - 2]}.${hostname[hostname.length - 1]}` :
      window.location.hostname
  }

  get version() {
    return pkg.version
  }

  constructor() {
    this.options = PutioAnalyticsClient.DEFAULT_OPTIONS
    this.setupUser(Cookies.getJSON(this.options.cookies.name))
    this.isSetup = false
  }

  setup(options = {}) {
    this.options = Object.assign({}, this.options, options)
    this.api = new Api({ url: this.options.apiURL })
    this.isSetup = true
  }

  setupUser(user = {}) {
    user.id = user.id || uuidv4()
    user.hash = user.hash || null
    Cookies.set(this.options.cookies.name, user, { expires: this.options.cookies.expires, domain: PutioAnalyticsClient.GetDomain() })
    this.user = user
  }

  checkSetup() {
    if (!this.isSetup) {
      throw new Error(`
        You need to setup pas.js properly in order to use it.
        Please refer to our documentation: https://github.com/putdotio/pas-js
      `)
    }
  }

  sendEvent(name, properties = {}) {
    this.checkSetup()
    this.log('SEND EVENT', { name, properties })
    return this.api.sendEvent({ name, properties }, this.user)
  }

  alias({ id, hash }) {
    this.checkSetup()
    const previousId = this.user.id
    this.log('ALIAS', { previousId, id, hash })
    this.user = { id, hash }
    return this.api.alias(previousId, this.user)
  }

  identify({ id, hash, properties }) {
    this.checkSetup()
    this.log('IDENTIFY', { id, hash, properties })
    Cookies.set(this.options.cookies.name, { id, hash }, { expires: this.options.cookies.expires, domain: PutioAnalyticsClient.GetDomain() })
    this.user = { id, hash, properties }
    return this.api.identify(this.user)
  }

  clear() {
    Cookies.remove(this.options.cookies.name, { domain: PutioAnalyticsClient.GetDomain() })
  }

  reset() {
    this.checkSetup()
    this.setupUser()
  }

  log(message, payload = {}) {
    if (!this.options.debug) {
      return
    }

    console.log(`PAS.JS -> ${message}`, payload)
  }
}

PutioAnalyticsClient.DEFAULT_OPTIONS = {
  debug: false,
  apiURL: null,
  cookies: {
    name: 'pas_js_user',
    expires: 365,
  },
}

module.exports = new PutioAnalyticsClient()

