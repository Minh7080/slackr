import { deleteMessage, getUserDetails, reactToMessage, unReactToMessage } from '../lib/api.js';
import { dateFormatter } from '../lib/dateFormatter.js';
import { formatTextToHTML } from '../lib/formatTextToHTML.js';
import { EditMessageInput } from './EditMessageInput.js';
import { MessageReactLabels } from './MessageReactLabels.js';

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
  const reactButtons = [...messageElement.querySelectorAll('.message-react-button')];
  const reactLabelsMountpoint = messageElement.querySelector('.message-react-labels-mountpoint');

  const react = (reactString) => {
    const userId = parseInt(localStorage.getItem('userId'));

    const hasReacted = message.reacts?.some(
      react => react.user === userId && react.react === reactString
    );
    if (hasReacted) {
      unReactToMessage(getSelectedChannelId(), message.id, reactString);
      const idxToRemove = message.reacts.findIndex(x => x.user === userId && x.react === reactString);
      message.reacts.splice(idxToRemove, 1);
    } else {
      reactToMessage(getSelectedChannelId(), message.id, reactString);
      if (!message.reacts) message.reacts = [];
      message.reacts.push({ react: reactString, user: userId });
    }
    updateMessageDOM(false);
  }

  const updateMessageDOM = (scrollTo, currentMessage = message) => {
    contentElement.replaceChildren(formatTextToHTML(currentMessage.message));
    timestamp.textContent = dateFormatter(currentMessage.sentAt);
    if (currentMessage.edited) {
      editTimestamp.textContent = `(edited ${dateFormatter(currentMessage.editedAt)})`;
      editTimestamp.classList.remove('hidden');
    }
    reactLabelsMountpoint.replaceChildren(MessageReactLabels({ reacts: message.reacts, reactFn: react }));

    if (scrollTo) messageElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  const interval = setInterval(() => updateMessageDOM(false, message), 5000);

  [deleteBtn, editBtn, divider].forEach(x => x.hidden = message.sender !== parseInt(localStorage.userId));
  messageElement.setAttribute('message-id', message.id);
  editBtn.addEventListener('click', () => EditMessageInput({ getSelectedChannelId, message, updateMessageDOM }));

  deleteBtn.addEventListener('click', () => {
    deleteMessage(getSelectedChannelId(), message.id)
      .then(() => {
        clearInterval(interval);
        messageElement.remove();
      });
  });

  updateMessageDOM(false);


  reactButtons.forEach(button => button.addEventListener('click', () => {
    react(button.textContent);
  }));


  return getUserDetails(message.sender).then(data => {
    usernameElement.textContent = data.name;
    avatarElement.src = data.image ? data.image : '../../assets/avatar.svg';
  }).then(() => messageElement);
};
