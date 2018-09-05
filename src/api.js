import axios from 'axios'

class ApiClient {
  constructor({ url }) {
    this.baseURL = url
  }

  sendEvent(event, user) {
    return axios.post(`${this.baseURL}/api/events`, {
      events: [{
        user_id: user.id,
        user_hash: user.hash,
        name: event.name,
        properties: event.properties,
      }]
    })
  }

  alias(previousId, user) {
    return axios.post(`${this.baseURL}/api/alias`, {
      previous_id: previousId,
      user_id: user.id,
      user_hash: user.hash,
    })
  }

  identify(user) {
    return axios.post(`${this.baseURL}/api/users`, {
      users: [{
        id: user.id,
        hash: user.hash,
        properties: user.properties,
      }]
    })
  }
}

export default ApiClient

