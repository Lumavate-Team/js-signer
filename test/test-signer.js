process.env.PUBLIC_KEY = 'abc'
process.env.PRIVATE_KEY = 'xyz'

const req = {
  body: {
    phone: '5555555555',
    message: 'Testing'
  },
  method: 'GET',
  path: '/path/to/route'
}

signUrl(req)
  .then(value => console.log(value))
  .catch(err => console.log(err))
