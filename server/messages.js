const connection = require('./db');

module.exports = {
  getMessages: (userId1, userId2) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM messages WHERE sender_id = ? AND receiver_id = ? OR sender_id = ? and receiver_id = ?', [
        userId1,
        userId2,
        userId2,
        userId1
      ], async function (error, messages, fields) {
        if (error) {
          reject(error);
        } else if (messages) {
          resolve(messages);
        } else {
          resolve(false);
        }
      });
    })
  },
  getMessagesByRoom: (roomId) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM messages WHERE room_id = ?', [roomId], async function (error, messages, fields) {
        if (error) {
          reject(error);
        } else if (messages) {
          resolve(messages);
        } else {
          resolve(false);
        }
      });
    })
  },
  saveMessage: (sender_id, receiver_id, room_id, message) => {
    return new Promise((resolve, reject) => {
      let msg = {
        message,
        sender_id,
        receiver_id,
        room_id,
        send_date: Date.now()
      };
      connection.query('INSERT INTO messages SET ?', msg, function (error, results, fields) {
        if (error) {
          reject(error);
          return;
        }
        console.log(results);
        msg.id = results.insertId;
        resolve(msg);
      });
    })
  }
}
