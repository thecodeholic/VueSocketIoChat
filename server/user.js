const connection = require('./db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = {
  verifyToken: token => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM users WHERE access_token = ?', token, async function (error, [user], fields) {
        if (error) {
          reject(error);
        } else if (user) {
          resolve(user);
        } else {
          resolve(false);
        }
      });
    })
  },
  register: userData => {
    return new Promise((resolve, reject) => {
      cryptPassword(userData.password, (err, hash) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        userData.password = hash;
        crypto.randomBytes(48, function (err, buffer) {
          if (err) {
            reject(err);
            return;
          }
          userData.access_token = buffer.toString('hex');

          connection.query('INSERT INTO users SET ?', userData, function (error, results, fields) {
            if (error) {
              reject(error);
              return;
            }
            console.log(results);
            userData.id = results.insertId;
            resolve(userData);
          });
        });
      });
    })
  },
  login: userData => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM users WHERE email = ?', userData.email, async function (error, [user], fields) {
        if (error) {
          reject(error);
          return;
        }

        if (user) {
          const result = await validatePassword(userData.password, user.password);
          if (result) {
            resolve({success: true, user});
          } else {
            resolve({success: false, message: "Password is not correct"})
          }
        } else {
          resolve({success: false, message: "User does not exist with this email address"})
        }
      });
    })
  },
  getUsers(user) {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT u.* FROM users u WHERE u.id != ?`, user.id, async function (error, users, fields) {
        if (error) {
          reject(error);
        } else {
          resolve(users);
        }
      });
    });
  },
  getRooms(user) {
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT r.id, ru.user_id,
               GROUP_CONCAT(ru2.user_id) as user_ids,
               (SELECT message FROM messages m WHERE m.room_id = ru2.room_id ORDER BY send_date DESC LIMIT 1) as latestMessage
        FROM rooms r
            JOIN room_users ru on r.id = ru.room_id
            JOIN room_users ru2 on ru2.room_id = r.id
        WHERE ru.user_id = ?
        AND ru2.user_id != ?
        GROUP BY ru2.room_id
      `, [user.id, user.id], async function (error, rooms, fields) {
        if (error) {
          reject(error);
        } else {
          resolve(rooms);
        }
      });
    });
  },

  getByIds(userIds) {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM users WHERE id IN (?)`, [userIds], async function (error, users, fields) {
        if (error) {
          reject(error);
        } else {
          resolve(users);
        }
      });
    });
  }
};


function validatePassword(password, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, function (err, res) {
      if (err) {
        // handle error
        reject(err);
      }
      if (res) {
        // Send JWT
        resolve(true);
      } else {
        resolve(false);
      }
    });
  })
}

function cryptPassword(password, callback) {
  bcrypt.genSalt(10, function (err, salt) {
    if (err)
      return callback(err);

    bcrypt.hash(password, salt, function (err, hash) {
      return callback(err, hash);
    });
  });
};
