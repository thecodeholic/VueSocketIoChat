import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import App from './App.vue'
import router from './router'
import auth from "./auth.service";

Vue.use(BootstrapVue)
Vue.use(new VueSocketIO({
  debug: true,
  connection: 'http://localhost:3000',
  vuex: {
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  },
  options: {
    path: "/socket.io",
    query: {token: auth.getToken()}
  },
}))


Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
