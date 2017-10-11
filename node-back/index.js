const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      http = require('http'),
      socket = require('socket.io'),
      mongoose = require('mongoose'),
      redis = require('socket.io-redis'),
      cluster = require('cluster'),
      numCPUs = require('os').cpus().length,
      router = express.Router(),
      server = http.createServer(app),
      io = socket(server);

const keys = { rooma: 'roomb', roomb: 'rooma' };
const Message = mongoose.model('Message', {
  room: String,
  message: String
});

io.adapter(redis({ host: 'redis', port: '6379' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.use((req, res, next) => {
  const host = req.headers.host;
  const worker = cluster.worker.id;
  console.log(`(back) Request on: worker=${worker}, path=${req.path}`);
  next();
});

router.post('/message', (req, res) => {
  const { room, message } = req.body;
  const document = { room, message };
  (new Message(document))
    .save((err) => {
      const data = JSON.stringify(document);
      io.to(room).emit('message', data);
      io.to(keys[room]).emit('message', data);
      res.sendStatus(201);
    });
});

router.get('/status', (req, res) => {
  res.sendStatus(200);
});

app.use('/back', router);

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  server.listen(3000, () => {
    console.log(`Server listen on: http://localhost:3000`);
    const mongo = 'mongodb://mongo:27017/db';
    mongoose.connect(mongo, { useMongoClient: true });
    const db = mongoose.connection;
    db.once('open', function() {
      console.log(`Mongo listen on: ${mongo}`);
    });
  });
}