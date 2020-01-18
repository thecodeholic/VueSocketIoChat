import axios from 'axios';
import auth from "./auth.service";

const httpClient = axios.create({
  baseURL: 'http://localhost:3000',
});

httpClient.interceptors.request.use(request => {
  console.log(request);
  request.headers.Authorization = `Bearer ${auth.getToken()}`;

  return request;
});
httpClient.interceptors.response.use(response => {
  console.log(response);

  return response;
}, (error) => {
  if (401 === error.response.status) {
    auth.goToLogin();
    return Promise.reject(error);
  } else {
    return Promise.reject(error);
  }
});

httpClient.getUsers = function () {
  return this.get('/users')
}
httpClient.getRooms = function () {
  return this.get('/rooms')
}


export default httpClient;
