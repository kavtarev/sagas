const protobuf = require('protobufjs');
const { small } = require('./json_examples')

async function benchmarkSerialization() {
  const root = await protobuf.load('example.proto');
  const buffer = root.lookupType('small');

  const jsonData = JSON.stringify(small);
  const protoData = buffer.encode(small).finish();

  console.time('JSON Serialize');
  for (let i = 0; i < 10000; i++) {
    JSON.stringify(small);
  }
  console.timeEnd('JSON Serialize');

  console.time('Protobuf Serialize');
  for (let i = 0; i < 10000; i++) {
    buffer.encode(small).finish();
  }
  console.timeEnd('Protobuf Serialize');

  console.time('JSON Parse');
  for (let i = 0; i < 10000; i++) {
    JSON.parse(jsonData);
  }
  console.timeEnd('JSON Parse');

  console.time('Protobuf Parse');
  for (let i = 0; i < 10000; i++) {
    buffer.decode(protoData);
  }
  console.timeEnd('Protobuf Parse');
}

benchmarkSerialization();
