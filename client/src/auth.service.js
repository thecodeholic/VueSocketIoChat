

const auth = {
  user: JSON.parse(sessionStorage.getItem('CURRENT_USER') || null),

  setUser(u){
    this.user = u;
    sessionStorage.setItem('CURRENT_USER', JSON.stringify(this.user))
    sessionStorage.setItem('ACCESS_TOKEN', this.user.access_token);
  },

  getUser(){
    return this.user;
  },

  isAuthenticated(){
    return !!this.getToken();
  },

  getToken(){
    return sessionStorage.getItem('ACCESS_TOKEN');
  }
};

export default auth;
