require('dotenv').config({path: '../.env'});

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser')
const bearerToken = require('express-bearer-token');
var cors = require('cors');

const routes = require('./routes');

app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(bearerToken());

app.use('/', routes);

let SocketIo = require('./socket');
const mySocketIo = new SocketIo(io);

http.listen(3000, function () {
  // console.log('listening on *:3000');
});
