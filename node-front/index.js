const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      sticky = require('sticky-session'),
      http = require('http'),
      socket = require('socket.io'),
      path = require('path'),
      mongoose = require('mongoose'),
      redis = require('socket.io-redis'),
      cluster = require('cluster'),
      router = express.Router(),
      server = http.createServer(app),
      io = socket(server, { path: '/front/socket.io' });

const keys = { rooma: 'roomb', roomb: 'rooma' };
const Message = mongoose.model('Message', { 
  room: String, 
  message: String
});

io.adapter(redis({ host: 'redis', port: '6379' }));
io.on('connection', (socket) => {
  socket.on('room', (room) => {
    socket.join(room);
  });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.use((req, res, next) => {
  const host = req.headers.host;
  const worker = cluster.worker.id;
  console.log(`(front) Request on: worker=${worker}, path=${req.path}`);
  next();
});

router.get([ '/rooma', '/roomb' ], (req, res) => {
  return res.sendFile(path.join(__dirname, 'public/index.html'));
});

router.post('/message', (req, res) => {
  const { room, message } = req.body;
  const document = { room, message };
  (new Message(document))
    .save((err) => {
      io.to(keys[room]).emit('message', JSON.stringify(document));
      res.sendStatus(201);
    });
});

router.get('/messages', (req, res) => {
  Message.find({})
    .exec((err, documents) => {
      res.status(200)
        .send(documents);
    });
});

router.get('/status', (req, res) => {
  res.sendStatus(200);
});

app.use('/front', router);

if (!sticky.listen(server, 3000)) {
  server.once('listening', () => {
    console.log(`Server listen on: http://localhost:3000`);
  });
} else {
  const mongo = 'mongodb://mongo:27017/db';
  mongoose.connect(mongo, { useMongoClient: true });
  const db = mongoose.connection;
  db.once('open', function() {
    console.log(`Mongo listen on: ${mongo}`);
  });
}