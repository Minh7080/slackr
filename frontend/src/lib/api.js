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
        localStorage.setItem('userId', data.userId);
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
        localStorage.setItem('userId', data.userId);
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
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        localStorage.removeItem('token');
        return Promise.reject(data);
      } else {
        localStorage.removeItem('token');
      }
    });
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
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data.channels.filter(x => x.members.includes(parseInt(localStorage.getItem('userId'))) || x.private === false);
      }
    });
}

const createChannel = (name, isPrivate, description) => {
  return fetch(`${baseURL}/channel`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      name: name,
      private: isPrivate,
      description: description
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data.channelId;
      }
    });
};

const getChannelDetails = (channedId) => {
  return fetch(`${baseURL}/channel/${channedId}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data;
      }
    });
};

const editChannelDetails = (channedId, newName, newDescription) => {
  return fetch(`${baseURL}/channel/${channedId}`, {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      name: newName,
      description: newDescription
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data;
      }
    });
};

const getUserDetails = (userId) => {
  return fetch(`${baseURL}/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data;
      }
    });
}

const joinChannel = (channelId) => {
  return fetch(`${baseURL}/channel/${channelId}/join`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data;
      }
    });
}

const leaveChannel = (channelId) => {
  return fetch(`${baseURL}/channel/${channelId}/leave`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data;
      }
    });

};

export {
  register,
  login,
  logout,
  getChannels,
  createChannel,
  getChannelDetails,
  editChannelDetails,
  getUserDetails,
  joinChannel,
  leaveChannel,
}
