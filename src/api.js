import axios from 'axios'

class ApiClient {
  constructor({ url }) {
    this.baseURL = url
  }

  sendEvent(event, user) {
    return axios({
      method: 'POST',
      url: `${this.baseURL}/api/events`,
      data: {
        events: [{
          user_id: user.id,
          user_hash: user.hash,
          name: event.name,
          properties: event.properties,
        }]
      },
    })
  }

  alias(previousId, user) {
    return axios({
      method: 'POST',
      url: `${this.baseURL}/api/alias`,
      data: {
        previous_id: previousId,
        user_id: user.id,
        user_hash: user.hash,
      }
    })
  }

  identify(user) {
    return axios({
      method: 'POST',
      url: `${this.baseURL}/api/users`,
      data: {
        users: [{
          id: user.id,
          hash: user.hash,
          properties: user.properties,
        }]
      },
    })
  }
}

export default ApiClient

