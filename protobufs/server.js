const { request, createServer } = require('http');
const json_s = require('./json_examples')

const { 2: level, 3: amount } = process.argv;
const jsonObject = json_s[level]

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

    backReq.write(JSON.stringify(jsonObject));
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