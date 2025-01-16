const { randomUUID } = require('crypto');

const tiny = { id: randomUUID() }

const small = {
  id: randomUUID(),
  age: 2,
  interests: ['some', 'any'],
  flag: false
}

const small_numbers = {
  id: randomUUID(),
  age: 42,
  interests: Array.from({ length: 10000 }, (_, i) => i),
  flag: true
};

module.exports = { tiny, small, small_numbers }