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

const getUsers = () => {
  return fetch(`${baseURL}/user`, {
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
        return data.users;
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
};

const updateUserProfile = (email, name, bio, password, image) => {
  return fetch(`${baseURL}/user`, {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ email, password, name, bio, image })
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

const inviteToChannel = (channelId, userId) => {
  return fetch(`${baseURL}/channel/${channelId}/invite`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ userId })
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

const getMessages = (channelId, startIdx) => {
  return fetch(`${baseURL}/message/${channelId}?start=${startIdx}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        return Promise.reject(data);
      } else {
        return data.messages;
      }
    });
};

const sendMessage = (channelId, message) => {
  return fetch(`${baseURL}/message/${channelId}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ message })
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

const sendMessageImage = (channelId, image) => {
  return fetch(`${baseURL}/message/${channelId}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ image })
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

const deleteMessage = (channelId, messageId) => {
  return fetch(`${baseURL}/message/${channelId}/${messageId}`, {
    method: 'DELETE',
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

const editMessage = (channelId, messageId, message, image) => {
  return fetch(`${baseURL}/message/${channelId}/${messageId}`, {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ message, image })
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

const reactToMessage = (channelId, messageId, react) => {
  return fetch(`${baseURL}/message/react/${channelId}/${messageId}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ react })
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

const unReactToMessage = (channelId, messageId, react) => {
  return fetch(`${baseURL}/message/unreact/${channelId}/${messageId}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ react })
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

const pinMessage = (channelId, messageId) => {
  return fetch(`${baseURL}/message/pin/${channelId}/${messageId}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
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

const unpinMessage = (channelId, messageId) => {
  return fetch(`${baseURL}/message/unpin/${channelId}/${messageId}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
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

const getPinnedMessages = (channelId) => {
  let idx = 0;
  const messages = [];

  const loop = () => {
    return getMessages(channelId, idx).then(data => {
      messages.push(...data);
      idx = messages.length;

      if (data.length > 0) {
        return loop();
      } else {
        return messages.filter(message => message.pinned);
      }
    })
  }

  return loop();
}

export {
  register,
  login,
  logout,
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
}
