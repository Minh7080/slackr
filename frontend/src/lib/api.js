import { ToastError } from '../components/ToastError.js';

const baseURL = (await (await fetch('/config')).json()).API_URL ?? 'http://localhost:5005';

const register = (email, password, name) => {
  return fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: password,
      name: name,
    }),
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
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const login = (email, password) => {
  return fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
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
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const logout = () => {
  return fetch(`${baseURL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
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
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const check = () => {
  return fetch(`${baseURL}/auth/check`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        localStorage.removeItem('token');
        return Promise.reject(data);
      } else {
        return data;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const getChannels = () => {
  return fetch(`${baseURL}/channel`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data.channels;
      }
    });
};

const createChannel = (name, isPrivate, description) => {
  return fetch(`${baseURL}/channel`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      name: name,
      private: isPrivate,
      description: description,
    }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data.channelId;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const getChannelDetails = (channedId) => {
  return fetch(`${baseURL}/channel/${channedId}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
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
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      name: newName,
      description: newDescription,
    }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

// TODO: backend fix — GET /user should only return users who share at least one channel with
// the requesting user, so emails aren't exposed to completely unrelated users.
const getUsers = () => {
  return fetch(`${baseURL}/user`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data.users;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

// TODO: security risk — GET /user/:userId returns the full profile (email, bio, image) of any
// user to any authenticated caller. Backend should restrict email to the requesting user's own
// profile only.
const getUserDetails = (userId) => {
  return fetch(`${baseURL}/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const updateUserProfile = (email, name, bio, password, image) => {
  return fetch(`${baseURL}/user`, {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ email, password, name, bio, image }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const joinChannel = (channelId) => {
  return fetch(`${baseURL}/channel/${channelId}/join`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const leaveChannel = (channelId) => {
  return fetch(`${baseURL}/channel/${channelId}/leave`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const inviteToChannel = (channelId, userId) => {
  return fetch(`${baseURL}/channel/${channelId}/invite`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ userId }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const getMessages = (channelId, startIdx) => {
  return fetch(`${baseURL}/message/${channelId}?start=${startIdx}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        return Promise.reject(data);
      } else {
        return data.messages;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const getMessagesNoCache = (channelId, startIdx) => {
  return fetch(`${baseURL}/message/${channelId}?start=${startIdx}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        return Promise.reject(data);
      } else {
        return data.messages;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};


// TODO: backend fix — sendMessage and sendMessageImage are two separate functions hitting the
// same endpoint. The backend already accepts both fields; the frontend should merge these into
// one function. No backend change needed, just frontend cleanup once other TODOs are resolved.
const sendMessage = (channelId, message) => {
  return fetch(`${baseURL}/message/${channelId}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ message }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const sendMessageImage = (channelId, image) => {
  return fetch(`${baseURL}/message/${channelId}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ image }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const deleteMessage = (channelId, messageId) => {
  return fetch(`${baseURL}/message/${channelId}/${messageId}`, {
    method: 'DELETE',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const editMessage = (channelId, messageId, message, image) => {
  return fetch(`${baseURL}/message/${channelId}/${messageId}`, {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ message, image }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return Promise.reject(data);
      } else {
        return data;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const reactToMessage = (channelId, messageId, react) => {
  return fetch(`${baseURL}/message/react/${channelId}/${messageId}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ react }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return;
      } else {
        return data;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const unReactToMessage = (channelId, messageId, react) => {
  return fetch(`${baseURL}/message/unreact/${channelId}/${messageId}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ react }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return;
      } else {
        return data;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const pinMessage = (channelId, messageId) => {
  return fetch(`${baseURL}/message/pin/${channelId}/${messageId}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        console.log('hello');
        return;
      } else {
        return data;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const unpinMessage = (channelId, messageId) => {
  return fetch(`${baseURL}/message/unpin/${channelId}/${messageId}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        ToastError(data.error);
        return;
      } else {
        return data;
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

const getPinnedMessages = (channelId) => {
  return fetch(`${baseURL}/message/pinned/${channelId}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        return Promise.reject(data);
      } else {
        return data.messages.reverse();
      }
    })
    .catch((err) => {
      if (err instanceof TypeError) {
        ToastError('Network failure');
      }
      return Promise.reject(err);
    });
};

};

export {
  register,
  login,
  logout,
  check,
  getChannels,
  createChannel,
  getChannelDetails,
  editChannelDetails,
  getUsers,
  getUserDetails,
  updateUserProfile,
  joinChannel,
  leaveChannel,
  inviteToChannel,
  getMessages,
  sendMessage,
  sendMessageImage,
  deleteMessage,
  editMessage,
  reactToMessage,
  unReactToMessage,
  pinMessage,
  unpinMessage,
  getPinnedMessages,
};
