const routes = require('express').Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

routes.post('/register', authController.register);

routes.post('/login', authController.login);

routes.get('/users', authMiddleware, userController.getUsers);

routes.get('/rooms', authMiddleware, userController.getRooms);

routes.get('/messages/:id', authMiddleware, userController.getMessagesByReceiver);

routes.get('/messages-by-room/:id', authMiddleware, userController.getMessagesByRoom);

module.exports = routes;