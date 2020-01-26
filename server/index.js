require('dotenv').config({path: '../.env'});

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser')
const bearerToken = require('express-bearer-token');
var cors = require('cors')
const UserService = require('./user');
const MessageService = require('./messages');

const SOCKET_TOKEN_MAP = new Map();
const USER_ID_SOCKET_MAP = new Map();
const ROOM_ID_SOCKET_MAP = new Map();
const USER_INFO = {};

app.use(cors())
app.options('*', cors());
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(bearerToken());

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

app.get('/users', async function (req, res) {
  const user = await checkUserAuthentication(req, res);
  if (!user) {
    return;
  }

  let users = await UserService.getUsers(user);
  users = users.map(u => {
    return {
      ...u,
      latestMessage: {
        message: u.latestMessage
      }
    }
  });

  res.send(JSON.stringify(users));
});
app.get('/rooms', async function (req, res) {
  const user = await checkUserAuthentication(req, res);
  if (!user) {
    return;
  }
  /**
   * {
   *   "roomId": {
   *     "latestMessage": "dasda",
   *     "users": []
   *   },
   *   "
   * }
   */

  let userIds = [];
  let rooms = await UserService.getRooms(user);
  rooms.forEach(room => {
    room.user_ids = room.user_ids.split(',').map(id => parseInt(id));
    userIds = userIds.concat(room.user_ids);
  });

  const users = await UserService.getByIds(userIds);
  const userObj = {};
  for (let user of users) {
    userObj[user.id] = user;
  }
  console.log(userIds, userObj);
  for (let room of rooms) {
    room.users = users.filter(u => room.user_ids.includes(u.id));
  }
  console.log(rooms);

  res.send(JSON.stringify(rooms));
});

app.get('/messages/:id', async function (req, res) {
  const user = await checkUserAuthentication(req, res);
  if (!user) {
    return;
  }

  const userId = req.params.id;
  console.log(userId);
  let messages = await MessageService.getMessages(user.id, userId);
  messages = messages.map(msg => {
    return {
      id: msg.id,
      sender: msg.sender_id === user.id ? 'me' : msg.sender_id,
      userId: userId,
      message: msg.message,
      time: msg.send_date
    }
  });

  res.send(JSON.stringify(messages));
});

app.get('/messages-by-room/:id', async function (req, res) {

  const user = await checkUserAuthentication(req, res);
  if (!user) {
    return;
  }

  const roomId = req.params.id;
  console.log(roomId);
  let messages = await MessageService.getMessagesByRoom(roomId);
  console.log(messages);
  messages = messages.map(msg => {
    return {
      id: msg.id,
      sender: msg.sender_id === user.id ? 'me' : msg.sender_name,
      roomId: roomId,
      message: msg.message,
      time: msg.send_date
    }
  });

  res.send(JSON.stringify(messages));
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
        USER_ID_SOCKET_MAP.set(user.id, socket);

        populateRoomIdSocketMap(user, socket);

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
        USER_ID_SOCKET_MAP.set(user.id, socket);

        populateRoomIdSocketMap(user, socket);
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

  socket.on('SEND_MESSAGE', async ({message, token, userId, roomId}) => {

    try {
      const user = await UserService.verifyToken(token);
      if (user) {
        let sockets = [];
        if (roomId) {
          sockets = ROOM_ID_SOCKET_MAP.get(roomId);
        } else {
          sockets = [USER_ID_SOCKET_MAP.get(userId)];
        }

        const msg = await MessageService.saveMessage(user.id, userId, roomId, message);

        for (let s of sockets) {
          if (s !== socket) {
            s.emit('ON_MESSAGE_RECEIVE', {
              userId: user.id,
              sender: user.name,
              roomId,
              message: message,
              time: new Date().toISOString()
            });
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

  });

  socket.on('ADD_INTO_ROOM', async ({token, userId, roomId, userIds}) => {
    try {
      const user = await UserService.verifyToken(token);
      if (user) {
        if (!roomId) {

          userIds = [user.id, userId, ...userIds];
          const {roomId, result} = await UserService.createRoom(user.id, userIds);

          const sockets = ROOM_ID_SOCKET_MAP.get(roomId) || [];
          console.log(result);
          for (let id of userIds) {
            const socket = USER_ID_SOCKET_MAP.get(id);
            if (socket) {
              const users = await UserService.getByIds(userIds.filter(uid => uid !== id));
              socket.emit('NEW_ROOM', {
                id: roomId,
                userId: user.id,
                users
              });

              sockets.push(socket);
            }
          }
          ROOM_ID_SOCKET_MAP.set(roomId, sockets);
        }
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
      SOCKET_TOKEN_MAP.delete(socket);
      USER_ID_SOCKET_MAP.delete(user.id);
    }
    io.emit('USER_LIST', getUserArray(''));
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});

function getUserArray(token) {
  const USERARRAY = [];
  for (let access_token in USER_INFO) {
    if (access_token !== token) {
      USERARRAY.push(USER_INFO[access_token]);
    }
  }
  return USERARRAY;
}


async function checkUserAuthentication(req, res) {
  if (!req.headers.authorization) {
    res.status(401);
    res.send();
    return null;
  }
  const token = req.headers.authorization.split(' ')[1];
  console.log("Authorization ", token);
  const user = await UserService.verifyToken(token);

  if (!user) {
    res.status(401);
    res.send();
    return null;
  }
  return user;
}

async function populateRoomIdSocketMap(user, socket) {
  const rooms = await UserService.getRooms(user);
  for (let room of rooms) {
    const sockets = ROOM_ID_SOCKET_MAP.get(room.id) || [];
    sockets.push(socket);
    ROOM_ID_SOCKET_MAP.set(room.id, sockets);
  }
}
