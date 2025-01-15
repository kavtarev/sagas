const { randomUUID } = require('crypto');
const { request, createServer } = require('http');

const { 2: amount, 3: level } = process.argv;
if (!amount || !level) {
  console.error('amount and level required')
  process.exit(9)
}
console.log(`amount: ${amount}\nlevel: ${level}`);

const ids = new Array(amount).fill(0).map(() => randomUUID());

createServer((req, res) => {
  const data = [];
  req.on('data', chunk => { data.push(chunk); });
  req.on('end', () => {
    const j = data.join('').toString()
    res.end('end');
  });
}).listen(3001, () => {
  console.log('Server listening on port 3001');
});


function makeRequest() {
  return new Promise((resolve, reject) => {
    const backReq = request(
      { host: '127.0.0.1', port: 3001, method: 'POST', path: '/' },
      res => {
        const data = [];
        res.on('data', chunk => { data.push(chunk); });
        res.on('end', () => {
          const response = Buffer.concat(data).toString()
          resolve();
        });
        res.on('error', reject);
      }
    );

    backReq.write('start');
    backReq.end();
  });
}

async function runSequentialRequests() {
  console.time('start')
  for (let i = 0; i < amount; i++) {
    await makeRequest();
  }
  console.timeEnd('start')
};

runSequentialRequests()