const UserService = require('./../models/user');
const MessageService = require('./../models/messages');

const SOCKET_TOKEN_MAP = new Map();
const USER_ID_SOCKET_MAP = new Map();
const ROOM_ID_SOCKET_MAP = new Map();
const USER_INFO = {};

class SocketIo {
  constructor(io) {
    this.io = io;
    this.connections = new Map();

    // // middleware
    // io.use(async (socket, next) => {
    //   let header = socket.handshake.query.token;
    //
    //   try {
    //     console.log("Verifying token ", header);
    //     const user = await UserService.verifyToken(header);
    //     if (user) {
    //       next(user);
    //     }
    //   } catch (e) {
    //     return next(new Error('authentication error'));
    //   }
    // });

    this.io.on('connection', this.onConnection.bind(this))

    // this.io.sockets
    //     .on('connection', socketIOJwt.authorize({
    //       secret: "secret333",
    //       timeout: 15000
    //     }))
    //     .on('authenticated', this.onAuthenticated.bind(this));

  }

  async onConnection(socket) {
    let token = socket.handshake.query && socket.handshake.query.token;
    // console.log("Connection made. TOKEN: " + token);
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
          // console.log(getUserArray(token));
          this.io.emit('USER_LIST', getUserArray(''));
          // console.log(`User "${user.name}" logged in`);
          // console.log(JSON.stringify(USER_INFO, undefined, 2));
          // console.log(`Emitting event "USER_CONNECTED" to other users that "${user.name}" connected`);
          // console.log(`Emitting event "USER_LIST" to current user`);
          // console.log("=======================================");
        }
      } catch (e) {
        console.error(e);
      }
    }

    socket.on('USER_LOGGED_IN', async ({token}) => {
      // let token = socket.handshake.query.token;
      // console.log("USER_LOGGED_IN ", token);
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
          this.io.emit('USER_LIST', getUserArray(''));
          // console.log(`User "${user.name}" logged in`);
          // console.log(JSON.stringify(USER_INFO, undefined, 2));
          // console.log(`Emitting event "USER_CONNECTED" to other users that "${user.name}" connected`);
          // console.log(`Emitting event "USER_LIST" to all connected users`);
          // console.log("=======================================");
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
            sockets = USER_ID_SOCKET_MAP.get(userId) ? [USER_ID_SOCKET_MAP.get(userId)] : [];
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
            // console.log(result);
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

    socket.on('disconnect', this.onDisconnect.bind(this));
  }

  onDisconnect(socket) {
    console.log(socket);
    let token = SOCKET_TOKEN_MAP.get(socket);

    if (token) {
      const user = USER_INFO[token];
      if (user) {
        // // console.log(`User "${user.name}" disconnected`);
        // // console.log(JSON.stringify(USER_INFO, undefined, 2));
        // // console.log("=======================================");
        USER_ID_SOCKET_MAP.delete(user.id);
      }
      delete USER_INFO[token];
      SOCKET_TOKEN_MAP.delete(socket);
    }
    this.io.emit('USER_LIST', getUserArray(''));
  }

  onAuthenticated(socket) {
    const userId = socket.decoded_token.sub;
    let mySocket = this.connections.get(userId);
    if (mySocket) {
      mySocket.setIoSocket(socket);
    } else {
      mySocket = new Connection(socket, userId);
      this.connections.set(userId, mySocket);
    }
  }

}

module.exports = SocketIo;


function getUserArray(token) {
  const USERARRAY = [];
  for (let access_token in USER_INFO) {
    if (access_token !== token) {
      USERARRAY.push(USER_INFO[access_token]);
    }
  }
  return USERARRAY;
}

async function populateRoomIdSocketMap(user, socket) {
  try {
    const rooms = await UserService.getRooms(user);
    for (let room of rooms) {
      const sockets = ROOM_ID_SOCKET_MAP.get(room.id) || [];
      sockets.push(socket);
      ROOM_ID_SOCKET_MAP.set(room.id, sockets);
    }
  } catch (e) {
    console.error(e);
  }
}

