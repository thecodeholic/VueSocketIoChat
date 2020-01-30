const UserService = require('../models/user');
const MessageService = require('../models/messages');

class UserController {
  async getUsers(req, res, next) {
    const user = req.currentUser;

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
      console.log(e);
      res.status(500).json(e);
    }
  }

  async getRooms(req, res, next) {

    const user = req.currentUser;

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
      console.error(e);
      res.status(500).json(e);
    }
  }

  async getMessagesByReceiver(req, res, next) {
    const user = req.currentUser;

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
      res.status(500).json(e);
    }
  }

  async getMessagesByRoom(req, res, next) {

    const user = req.currentUser;
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
      console.error(e);
      res.status(500).json(e);
      res.send([]);
    }
  }
}

module.exports = new UserController();