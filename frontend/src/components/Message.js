import { deleteMessage, getUserDetails } from '../lib/api.js';
import { dateFormatter } from '../lib/dateFormatter.js';
import { formatTextToHTML } from '../lib/formatTextToHTML.js';

export const Message = ({ message, getSelectedChannelId }) => {
  const messageTemplate = document.getElementById('message-component').content.cloneNode(true);
  const messageElement = messageTemplate.querySelector('.message-container');

  const usernameElement = messageElement.querySelector('.message-username');
  const contentElement = messageElement.querySelector('.message-content');
  const avatarElement = messageElement.querySelector('.message-avatar');
  const timestamp = messageElement.querySelector('.message-timestamp');
  const deleteBtn = messageElement.querySelector('.message-delete-button');

  contentElement.replaceChildren(formatTextToHTML(message.message));
  timestamp.textContent = dateFormatter(message.sentAt);
  deleteBtn.hidden = message.sender !== parseInt(localStorage.userId);

  deleteBtn.addEventListener('click', () => {
    deleteMessage(getSelectedChannelId(), message.id)
      .then(() => messageElement.remove())
  });

  return getUserDetails(message.sender).then(data => {
    usernameElement.textContent = data.name;
    avatarElement.src = data.image ? data.image : '../../assets/avatar.svg';
  }).then(() => messageElement);
};
