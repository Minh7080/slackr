import { ToastError } from "../components/ToastError.js";
import { BACKEND_PORT } from "./config.js";

const baseURL = `http://localhost:${BACKEND_PORT}`

const register = (email, password, name) => {
  return fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: password,
      name: name
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        localStorage.setItem('token', data.token);
        return data;
      }
    })
}

const login = (email, password) => {
  return fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: password,
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        localStorage.setItem('token', data.token);
        return data;
      }
    })
}

const logout = () => {
  return fetch(`${baseURL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(res => res.json())
    .then((data => {
      if (data.error) {
        ToastError(data.error);
        localStorage.removeItem('token');
        return Promise.reject(data);
      } else {
        localStorage.removeItem('token');
      }
    }))
}

const getChannels = () => {
  return fetch(`${baseURL}/channel`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(res => res.json())
    .then((data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data.channels;
      }
    }))
}

export {
  register,
  login,
  logout,
  getChannels,
}
