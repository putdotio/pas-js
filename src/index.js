import Cookies from 'js-cookie'
import uuidv4 from 'uuid/v4'
import { fromJS } from 'immutable'
import Api from './api'
import config from './config'

class PutioAnalyticsClient {
  constructor() {
    this.api = new Api({ url: '' })
    this.setupUser(Cookies.get(config.USER_COOKIE_NAME))
  }

  setupUser(userId = null) {
    userId = userId || uuidv4()

    Cookies.set(config.USER_COOKIE_NAME, userId, config.USER_COOKIE_CONFIG)

    this.user = fromJS({
      id: userId,
    })
  }

  sendEvent(name, payload) {
    console.log(name, payload)
    this.api.sendEvent()
  }

  alias(userId) {
    const currentId = this.user.get('id')
    this.user = this.user.set('id', userId)
    this.api.alias(currentId, userId)
  }

  identify(user) {
    Cookies.set(config.USER_COOKIE_NAME, user.id, config.USER_COOKIE_CONFIG)
    this.user = this.user.merge(user)
    this.api.identify(this.user.toJS())
  }

  reset() {
    this.setupUser()
  }
}

module.exports = new PutioAnalyticsClient()

