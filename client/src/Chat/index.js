import Vue from "vue";
import VueSocketIO from "vue-socket.io";
import auth from "./auth.service";

Vue.use(new VueSocketIO({
  debug: true,
  connection: process.env.VUE_APP_NODE_SERVER,
  vuex: {
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  },
  options: {
    path: "/socket.io",
    query: {token: auth.getToken()}
  },
}));
