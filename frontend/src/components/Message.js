import { deleteMessage, getUserDetails } from '../lib/api.js';
import { dateFormatter } from '../lib/dateFormatter.js';
import { formatTextToHTML } from '../lib/formatTextToHTML.js';
import { EditMessageInput } from './EditMessageInput.js';

export const Message = ({ message, getSelectedChannelId }) => {
  const messageTemplate = document.getElementById('message-component').content.cloneNode(true);
  const messageElement = messageTemplate.querySelector('.message-container');

  const usernameElement = messageElement.querySelector('.message-username');
  const contentElement = messageElement.querySelector('.message-content');
  const avatarElement = messageElement.querySelector('.message-avatar');
  const timestamp = messageElement.querySelector('.message-timestamp');
  const editTimestamp = messageElement.querySelector('.message-edit-timestamp');
  const deleteBtn = messageElement.querySelector('.message-delete-button');
  const editBtn = messageElement.querySelector('.message-edit-button');
  const divider = messageElement.querySelector('.authenticated-divider');

  const updateMessageDOM = (content, sentAt, edited, editedAt, scrollTo) => {
    contentElement.replaceChildren(formatTextToHTML(content));
    timestamp.textContent = dateFormatter(sentAt);
    if (edited) {
      editTimestamp.textContent = `(edited ${dateFormatter(editedAt)})`;
      editTimestamp.classList.remove('hidden');
    }
    if (scrollTo) messageElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  updateMessageDOM(message.message, message.sentAt, message.edited, message.editedAt, false);

  [deleteBtn, editBtn, divider].forEach(x => x.hidden = message.sender !== parseInt(localStorage.userId));

  messageElement.setAttribute('message-id', message.id);

  editBtn.addEventListener('click', () => EditMessageInput({ getSelectedChannelId, message, updateMessageDOM }));

  deleteBtn.addEventListener('click', () => {
    deleteMessage(getSelectedChannelId(), message.id)
      .then(() => messageElement.remove())
  });

  return getUserDetails(message.sender).then(data => {
    usernameElement.textContent = data.name;
    avatarElement.src = data.image ? data.image : '../../assets/avatar.svg';
  }).then(() => messageElement);
};
