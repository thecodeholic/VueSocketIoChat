const routes = require('express').Router();
const UserService = require('../models/user');
const MessageService = require('../models/messages');

routes.post('/register', async function (req, res) {
  try {
    const user = await UserService.register(req.body);
    res.send(JSON.stringify(user));
  } catch (err) {
    res.status(500);
    res.send(JSON.stringify({message: err}));
  }
});
routes.post('/login', async function (req, res) {
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

routes.get('/users', async function (req, res) {
  const user = await checkUserAuthentication(req, res);
  if (!user) {
    return;
  }

  try {

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
  } catch (e) {
    console.error(e);
    res.send([]);
  }
});
routes.get('/rooms', async function (req, res) {
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
  try {

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
    // console.log(userIds, userObj);
    for (let room of rooms) {
      room.users = users.filter(u => room.user_ids.includes(u.id));
    }
    // console.log(rooms);

    res.send(JSON.stringify(rooms));
  } catch (e) {
    res.send([]);
  }
});

routes.get('/messages/:id', async function (req, res) {
  const user = await checkUserAuthentication(req, res);
  if (!user) {
    return;
  }

  try {

    const userId = req.params.id;
    // console.log(userId);
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
  } catch (e) {
    console.error(e);
    res.send([]);
  }
});

routes.get('/messages-by-room/:id', async function (req, res) {

  const user = await checkUserAuthentication(req, res);
  if (!user) {
    return;
  }
  try {

    const roomId = req.params.id;
    // console.log(roomId);
    let messages = await MessageService.getMessagesByRoom(roomId);
    // console.log(messages);
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
  } catch (e) {
    console.error();
    res.send([]);
  }
});

module.exports = routes;


async function checkUserAuthentication(req, res) {
  if (!req.headers.authorization) {
    res.status(401);
    res.send();
    return null;
  }
  const token = req.headers.authorization.split(' ')[1];
  // // console.log("Authorization ", token);
  const user = await UserService.verifyToken(token);

  if (!user) {
    res.status(401);
    res.send();
    return null;
  }
  return user;
}