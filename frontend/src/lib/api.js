import { ToastError } from "../components/ToastError.js";
import { BACKEND_PORT } from "./config.js";

const baseURL = `http://localhost:${BACKEND_PORT}`

const channelsCacher = {
  cache(data) {
    localStorage.setItem('channelsCache', JSON.stringify(data));
  },
  get() {
    const cache = localStorage.getItem('channelsCache');
    return cache ? JSON.parse(cache) : [];
  }
};

const messageCacher = {
  pageSize: 25,
  cache(channelId, data, append = false) {
    const cacheKey = `messageCache:${channelId}`;
    if (!append) {
      localStorage.setItem(cacheKey, JSON.stringify(data));
      return;
    }

    const existing = JSON.parse(localStorage.getItem(cacheKey)) || [];

    const seenIds = new Set(existing.map(m => m.id));
    const dedupAppends = [];
    for (const m of data) {
      if (!seenIds.has(m.id)) {
        seenIds.add(m.id);
        dedupAppends.push(m);
      }
    }

    localStorage.setItem(cacheKey, JSON.stringify([...existing, ...dedupAppends]));
  },
  get(channelId, startIdx = 0) {
    const cacheKey = `messageCache:${channelId}`;
    const cache = localStorage.getItem(cacheKey);
    if (!cache) return [];
    const all = JSON.parse(cache);
    if (startIdx <= 0) return all.slice(0, this.pageSize);
    return all.slice(startIdx, startIdx + this.pageSize);
  }
};

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
    .catch((err) => {
      ToastError('No internet connection');
      return Promise.reject(err);
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
    .catch((err) => {
      ToastError('No internet connection');
      return Promise.reject(err);
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
    })
    .catch((err) => {
      ToastError('No internet connection');
      return Promise.reject(err);
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
        const filtered = data.channels.filter(x => x.members.includes(parseInt(localStorage.getItem('userId'))) || x.private === false);
        channelsCacher.cache(filtered);
        return filtered;
      }
    })
    .catch(() => channelsCacher.get())
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
    })
    .catch((err) => {
      ToastError('No internet connection');
      return Promise.reject(err);
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
    })
    .catch(() => {
      return {
        name: 'Unknown',
        creator: -1,
        private: false,
        description: 'No internet',
        createdAt: '2011-10-05T14:48:00.000Z',
        members: [
          -1
        ]
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
    })
    .catch((err) => {
      ToastError('No internet connection');
      return Promise.reject(err);
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
    })
    .catch((err) => {
      ToastError('No internet connection');
      return Promise.reject(err);
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
    })
    .catch(() => {
      return {
        id: userId,
        name: `User ${userId === -1 ? 'Unknown' : userId}`,
        email: '',
        image: null,
        bio: ''
      };
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
    })
    .catch((err) => {
      ToastError('No internet connection');
      return Promise.reject(err);
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
    })
    .catch((err) => {
      ToastError('No internet connection');
      return Promise.reject(err);
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
        messageCacher.cache(channelId, data.messages, startIdx > 0);
        return data.messages;
      }
    })
    .catch(() => {
      return messageCacher.get(channelId, startIdx);
    });
};

const getMessagesNoCache = (channelId, startIdx) => {
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
    })
    .catch((err) => {
      ToastError('No internet connection');
      return Promise.reject(err);
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
    })
    .catch((err) => {
      ToastError('No internet connection');
      return Promise.reject(err);
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
    })
    .catch((err) => {
      ToastError('No internet connection');
      return Promise.reject(err);
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
    })
    .catch((err) => {
      ToastError('No internet connection');
      return Promise.reject(err);
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
    })
    .catch((err) => {
      ToastError('No internet connection');
      return Promise.reject(err);
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
        return;
      } else {
        return data;
      }
    })
    .catch(() => {
      ToastError('No internet connection');
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
        return;
      } else {
        return data;
      }
    })
    .catch(() => {
      ToastError('No internet connection');
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
        console.log('hello');
        return;
      } else {
        return data;
      }
    })
    .catch(() => {
      ToastError('No internet connection');
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
        return;
      } else {
        return data;
      }
    })
    .catch(() => {
      ToastError('No internet connection');
    });
};

const getPinnedMessages = (channelId) => {
  let idx = 0;
  const messages = [];

  const loop = () => {
    return getMessagesNoCache(channelId, idx)
      .then(data => {
        messages.push(...data);
        idx = messages.length;

        if (data.length > 0) {
          return loop();
        } else {
          return messages.filter(message => message.pinned);
        }
      })
      .catch(() => {
        return messageCacher.get(channelId, idx).filter(message => message.pinned);
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
