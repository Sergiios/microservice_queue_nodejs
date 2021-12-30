const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

let runningProcs = [];
const maxParalelProcs = 2;

async function runBigProcessInQueue() {
  if (runningProcs.length >= maxParalelProcs) {
    console.log('Fila cheia, aguarde!');
    await runningProcs[0];
    return runBigProcessInQueue();
  }
  console.log('Executando proc...');
  const promise = runBigProcess();
  runningProcs.push(promise);

  function removePromise() {
    console.log('Proc finalizado, removendo...');
    runningProcs = runningProcs.filter((p) => p !== promise);
  }

  let result;

  try {
    result = await promise;
    removePromise();
  } catch (ex) {
    removePromise();
    throw ex;
  }

  return result;
}

async function runBigProcess() {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [path.resolve(__dirname, 'sub-process.js')]);

    const stderr = [];

    proc.stdout.on('data', (chunk) => {
      //console.log(chunk.toString());
    });

    proc.stderr.on('data', (chunk) => {
      stderr.push(chunk);
    });

    proc.on('error', reject);
    proc.on('close', () => {
      if (stderr.length) return reject(stderr.join(''));
      resolve();
    });
  });
}

http
  .createServer(async (req, res) => {
    if (req.url === '/nuke') {
      const started = new Date();
      await runBigProcessInQueue();
      //await runBigProcess();
      console.log(`This process took: ${new Date() - started}ms`);
      return res.end('nuked');
    }
    res.end('ok');
  })
  .listen(2022);
