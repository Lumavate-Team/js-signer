import randomNumber from 'random-number-csprng'
import { URLSearchParams } from 'url'

async function _hashBody(body) {
  const hash = crypto.createHash('md5')
  let valueToHash = ''

  if (body) {
    valueToHash = JSON.stringify(body)
  }

  hash.write(valueToHash)

  return hash.digest('hex')
}

async function _generateSignature(key) {
  const hmac = crypto.createHmac('sha256', process.env.PRIVATE_KEY)

  hmac.write(key)

  return hmac.digest('base64')
}

export async function signUrl({ method, path, body='' }) {
  if (!method) {
    throw 'HTTP Method cannot be null for signing'
  }

  if (!path) {
    throw 'URL path cannot be null for signing'
  }

  let [ root, search ] = path.split('?')
  const searchParams = new URLSearchParams(search)
  const currentTime = Date.now()
  const nonce = await randomNumber(1000000000, currentTime)
  const hashedBody = await _hashBody(body)

  searchParams.append('s-key', process.env.PUBLIC_KEY)
  searchParams.append('s-time', Math.floor(currentTime / 1000))
  searchParams.append('s-hash', hashedBody)
  searchParams.append('s-nonce', nonce)

  // sort the querystring parameters before generating the signature
  // for consistent generation
  searchParams.sort()

  const key = `${method.toLowerCase()}\n${root}\n${searchParams.toString()}\n${nonce}`
  const signature = await _generateSignature(key)

  searchParams.append('s-signature', signature)

  return `${root}?${searchParams.toString()}`
}
