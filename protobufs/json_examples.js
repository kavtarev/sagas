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

const medium = {
  id: randomUUID(),
  name1: 'some',
  name2: 'some',
  name3: 'some',
  flag1: false,
  flag2: false,
  flag3: false,
  age1: 1,
  age2: 1,
  age3: 1,
  small1: small,
  small2: small,
  small3: small,
}

module.exports = { tiny, small, small_numbers, medium }