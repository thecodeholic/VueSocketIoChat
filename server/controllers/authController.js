const UserService = require('../models/user');

class AuthController {
  async register(req, res, next) {
    try {
      const user = await UserService.register(req.body);
      res.send(JSON.stringify(user));
    } catch (err) {
      res.status(500);
      res.send(JSON.stringify({message: err}));
    }
  }

  async login(req, res, next) {
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
  }
}

module.exports = new AuthController();