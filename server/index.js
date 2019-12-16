var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
const USERS = {};

io.on('connection', function (socket) {
  console.log('a user connected', socket.id);

  socket.emit("USER_LIST", USERS);

  USERS[socket.id] = {socketId: socket.id};

  socket.broadcast.emit('USER_CONNECTED', {socketId: socket.id});

  socket.on('disconnect', function () {
    delete USERS[socket.id];
    socket.broadcast.emit('USER_DISCONNECTED', socket.id);
    console.log('user disconnected');
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
