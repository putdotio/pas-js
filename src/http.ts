import ExtendableError from 'es6-error'

export class HttpError extends ExtendableError {}
export class NetworkError extends ExtendableError {}

const checkStatus = (response: Response) => {
  if (response.status >= 200 && response.status < 300) {
    return response
  }

  return Promise.reject(new HttpError(response.statusText))
}

const parseJSON = (response: Response) => response.json()

const handleError = (error: any) => {
  throw new NetworkError(error.message)
}

const http = (url: string, body: object) =>
  fetch(url, {
    method: 'post',
    body: JSON.stringify(body),
  })
    .catch(handleError)
    .then(checkStatus)
    .then(parseJSON)

export default http
