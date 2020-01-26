import Vue from 'vue'
import VueRouter from 'vue-router'
import auth from "../Chat/auth.service";
import Messenger from "../Chat/components/Messenger";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'messenger',
    component: Messenger,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/register',
    name: 'register',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Register.vue')
  },
  {
    path: '/login',
    name: 'login',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Login.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  console.log(to.meta.requiresAuth, auth.isAuthenticated());
  if (to.meta.requiresAuth && !auth.isAuthenticated()){
    next('/login');
  } else if (!to.meta.requiresAuth && auth.isAuthenticated()) {
    next('/');
  } else {
    next();
  }
});

export default router
