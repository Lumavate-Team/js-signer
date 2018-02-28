import crypto from 'crypto'
import randomNumber from 'random-number-csprng'
import { URL } from 'url'

async function _hashBody(body) {
  const hash = crypto.createHash('md5')

  hash.write(JSON.stringify(body))

  return hash.digest('hex')
}

async function _generateSignature(key) {
  const hmac = crypto.createHmac('sha256', process.env.PRIVATE_KEY)

  hmac.write(key)

  return hmac.digest('base64')
}

export async function signUrl({ method, url, body='' }) {
  if (!method) {
    throw 'HTTP Method cannot be null for signing'
  }

  if (!url) {
    throw 'URL cannot be null for signing'
  }

  const currentTime = Date.now()
  const rootUrl = url.split('?')[0]
  const urlToSign = new URL(url)
  const nonce = await randomNumber(1000000000, currentTime)
  const hashedBody = await _hashBody(body)

  urlToSign.searchParams.append('s-key', process.env.PUBLIC_KEY)
  urlToSign.searchParams.append('s-time', currentTime)
  urlToSign.searchParams.append('s-hash', hashedBody)
  urlToSign.searchParams.append('s-nonce', nonce)

  // sort the querystring parameters before generating the signature
  // for consistent generation
  urlToSign.searchParams.sort()

  const key = `${method}\n${rootUrl}\n${urlToSign.search}\n${nonce}`
  const signature = await _generateSignature(key)

  urlToSign.searchParams.append('s-signature', signature)

  return urlToSign.toString()
}

/*
process.env.PUBLIC_KEY = 'abc'
process.env.PRIVATE_KEY = 'xyz'

const req = {
  body: {
    prop1: 1,
    prop2: 2,
    prop3: '3',
    prop4: true
  },
  method: 'GET',
  url: 'https://3d008420c590__test.toyota.sean.lbnxs.com/ic/wrk-page/instances/14/data?sort=name+test'
}

signUrl(req)
  .then(value => console.log(value))
  .catch(err => console.log(err))
  */
