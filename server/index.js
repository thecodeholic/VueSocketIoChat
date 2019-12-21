var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser')
var cors = require('cors')
const UserService = require('./user');

const SOCKET_TOKEN_MAP = new Map();
const USER_INFO = {};

app.use(cors())
app.options('*', cors());
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.post('/register', async function (req, res) {
  try {
    const user = await UserService.register(req.body);
    res.send(JSON.stringify(user));
  } catch (err) {
    res.status(500);
    res.send(JSON.stringify({message: err}));
  }
});
app.post('/login', async function (req, res) {
  const userData = req.body;

  try {
    const {success, user, message} = await UserService.login(userData);
    if (success) {
      res.send(JSON.stringify(user));
    } else {
      res.send(JSON.stringify({message}));
    }
  } catch (e) {
    console.error(e);
    res.status(500);
    res.send(JSON.stringify({message: e}));
  }
});

io.on('connection', async (socket) => {

  let token = socket.handshake.query && socket.handshake.query.token;
  console.log("Connection made. TOKEN: " + token);
  if (token) {
    try {
      const user = await UserService.verifyToken(token);
      if (user) {
        delete user.password;
        delete user.access_token;
        USER_INFO[token] = user;
        SOCKET_TOKEN_MAP.set(socket, token);
        // socket.broadcast.emit('USER_CONNECTED', user);
        console.log(getUserArray(token));
        io.emit('USER_LIST', getUserArray(''));
        console.log(`User "${user.name}" logged in`);
        console.log(JSON.stringify(USER_INFO, undefined, 2));
        console.log(`Emitting event "USER_CONNECTED" to other users that "${user.name}" connected`);
        console.log(`Emitting event "USER_LIST" to current user`);
        console.log("=======================================");
      }
    } catch (e) {
      console.error(e);
    }
  }

  socket.on('USER_LOGGED_IN', async ({token}) => {
    // let token = socket.handshake.query.token;
    console.log("USER_LOGGED_IN ", token);
    try {
      const user = await UserService.verifyToken(token);
      if (user) {
        delete user.password;
        delete user.access_token;
        USER_INFO[token] = user;
        SOCKET_TOKEN_MAP.set(socket, token);
        // socket.broadcast.emit('USER_CONNECTED', USER_INFO[token]);
        io.emit('USER_LIST', getUserArray(''));
        console.log(`User "${user.name}" logged in`);
        console.log(JSON.stringify(USER_INFO, undefined, 2));
        console.log(`Emitting event "USER_CONNECTED" to other users that "${user.name}" connected`);
        console.log(`Emitting event "USER_LIST" to all connected users`);
        console.log("=======================================");
      }
    } catch (e) {
      console.error(e);
    }
  });

  socket.on('disconnect', function () {
    let token = SOCKET_TOKEN_MAP.get(socket);

    if (token) {
      const user = USER_INFO[token];
      if (user) {
        console.log(`User "${user.name}" disconnected`);
        console.log(JSON.stringify(USER_INFO, undefined, 2));
        console.log("=======================================");
      }
      delete USER_INFO[token];
      SOCKET_TOKEN_MAP.remove(socket);
    }
    io.emit('USER_LIST', getUserArray(''));
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});

function getUserArray(token) {
  const USERARRAY = [];
  for (let access_token in USER_INFO){
    if (access_token !== token){
      USERARRAY.push(USER_INFO[access_token]);
    }
  }
  return USERARRAY;
}
