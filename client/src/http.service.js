import axios from 'axios';
import auth from "./auth.service";
import router from "./router";

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
    router.push('/login');
  } else {
    return Promise.reject(error);
  }
});

httpClient.getUsers = function () {
  return this.get('/users')
}


export default httpClient;
