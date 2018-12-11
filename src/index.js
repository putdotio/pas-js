import Cookies from 'js-cookie'
import uuidv4 from 'uuid/v4'
import merge from 'deep-assign'
import Api from './api'
import pkg from '../package.json'

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
    this.failedEventQueue = Cookies.getJSON(this.options.cookies.event_queue) || {}
    this.setupUser(Cookies.getJSON(this.options.cookies.name))
    this.isSetup = false
  }

  setup(options = {}) {
    this.options = merge(this.options, options)
    this.api = new Api({ url: this.options.apiURL })
    this.isSetup = true
    this.retryFailedEvents()
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

  retryFailedEvents() {
    const eventIds = Object.keys(this.failedEventQueue)

    if (!eventIds.length) {
      return
    }

    eventIds.map((eventId) => {
      this.removeRetriedEventFromQueue(eventId)
      this.sendEvent(this.failedEventQueue[eventId])
    })
  }

  addFailedEventToQueue(event) {
    const eventId = uuidv4()
    this.log('ADD FAILED EVENT TO QUEUE', eventId, event)
    this.failedEventQueue[eventId] = event
    this.writeEventQueueToCookies()
  }

  removeRetriedEventFromQueue(eventId) {
    delete this.failedEventQueue[eventId]
    this.writeEventQueueToCookies()
  }

  writeEventQueueToCookies() {
    Cookies.set(this.options.cookies.event_queue, this.failedEventQueue, { expires: this.options.cookies.expires, domain: PutioAnalyticsClient.GetDomain() })
  }

  sendEvent(name, properties = {}) {
    this.checkSetup()
    const event = { name, properties }
    this.log('SEND EVENT', event)
    return new Promise((resolve, reject) => {
      this.api.sendEvent(event, this.user)
        .then(resolve)
        .catch((error) => {
          if (
            error &&
            error.message &&
            (error.message.includes('timeout') || error.message.includes('Network Error'))
          ) {
            this.addFailedEventToQueue(event)
            error.PAS_JS_WILL_RETRY = true
          }

          reject(error)
        })
    })
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
  apiURL: '',
  cookies: {
    name: 'pas_js_user',
    event_queue: 'pas_js_event_queue',
    expires: 365,
  },
}

export default new PutioAnalyticsClient()
