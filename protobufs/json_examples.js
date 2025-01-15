const { randomUUID } = require('crypto');

const tiny = { id: randomUUID() }

const small = {
  id: randomUUID(),
  age: 2,
  interests: ['some', 'any'],
  flag: false
}

module.exports = { tiny, small }