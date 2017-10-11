const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      http = require('http'),
      cluster = require('cluster'),
      numCPUs = require('os').cpus().length,
      router = express.Router(),
      server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.use((req, res, next) => {
  const host = req.headers.host;
  const worker = cluster.worker.id;
  console.log(`(other) Request on: worker=${worker}, path=${req.path}`);
  next();
});

router.get('/message', (req, res) => {
  res.sendStatus(200);
});

router.get('/status', (req, res) => {
  res.sendStatus(200);
});

app.use('/other', router);

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  server.listen(3000, () => {
    console.log(`Server listen on: http://localhost:3000`);
  });
}