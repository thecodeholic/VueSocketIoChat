import router from '../router';
import axios from "axios";

class AuthService {
  user = null;

  constructor() {
    this.user = JSON.parse(sessionStorage.getItem('CURRENT_USER') || null);
  }

  setUser(u) {
    //TODO Implement to save the user in sessionStorage or localStorage
    this.user = u;
    sessionStorage.setItem('CURRENT_USER', JSON.stringify(this.user))
    sessionStorage.setItem('ACCESS_TOKEN', this.user.access_token);
  }

  getUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  getToken() {
    //TODO Implement to return user access token
    return sessionStorage.getItem('ACCESS_TOKEN');
  }

  login(data) {
    return axios.post('/login', data)
  }

  register(data){
    return axios.post('/register', data)
  }

  logout() {
    //TODO Implement deleting token from localStorage or sessionStorage
    sessionStorage.removeItem('CURRENT_USER');
    sessionStorage.removeItem('ACCESS_TOKEN');
    const router = this.getRouter();
    router.push('login');
  }

  getRouter() {
    //TODO Implement this method
    return router;
  }
}

const auth = new AuthService();
export default auth;
