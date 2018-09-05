import Cookies from 'js-cookie'
import uuidv4 from 'uuid/v4'
import Api from './api'
import config from './config'

class PutioAnalyticsClient {
  constructor() {
    this.setupUser(JSON.parse(Cookies.get(config.USER_COOKIE_NAME) || '{}'))
    this.isSetup = false
  }

  setup(options = {}) {
    this.options = Object.assign({}, PutioAnalyticsClient.DEFAULT_OPTIONS, options)
    this.api = new Api({ url: this.options.apiURL })
    this.isSetup = true
  }

  setupUser(user = {}) {
    user.id = user.id || uuidv4()
    user.hash = user.hash || ''
    Cookies.set(config.USER_COOKIE_NAME, user, config.USER_COOKIE_CONFIG)
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
    this.api.sendEvent({ name, properties }, this.user)
  }

  alias({ id, hash }) {
    this.checkSetup()

    const previousId = this.user.id
    this.log('ALIAS', { previousId, id, hash })

    this.user = { id, hash }
    this.api.alias(previousId, id, this.user)
  }

  identify({ id, hash, properties }) {
    this.checkSetup()
    this.log('IDENTIFY', { id, hash, properties })

    Cookies.set(config.USER_COOKIE_NAME, { id, hash }, config.USER_COOKIE_CONFIG)

    this.user = { id, hash, properties }
    this.api.identify(this.user)
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
}

module.exports = new PutioAnalyticsClient()

