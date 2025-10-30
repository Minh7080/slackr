import {
  deleteMessage,
  getUserDetails,
  pinMessage,
  reactToMessage,
  unpinMessage,
  unReactToMessage } from '../lib/api.js';
import { dateFormatter } from '../lib/dateFormatter.js';
import { formatTextToHTML } from '../lib/formatTextToHTML.js';
import { EditMessageInput } from './EditMessageInput.js';
import { MessageImage } from './MessageImage.js';
import { MessageReactLabels } from './MessageReactLabels.js';
import { ProfileModal } from './ProfileModal.js';

export const Message = ({ message, getSelectedChannelId, loadPinnedMessages }) => {
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
  const pinLabel = messageElement.querySelector('.message-pin-label');
  const pinBtn = messageElement.querySelector('.message-pin-button');

  [avatarElement, usernameElement].forEach(element => 
    element.addEventListener('click', () => 
      ProfileModal({ userId: message.sender })));

  const react = (reactString) => {
    // Toggle a reaction by current user
    const userId = parseInt(localStorage.getItem('userId'));
    let promise;

    const hasReacted = message.reacts?.some(
      react => react.user === userId && react.react === reactString,
    );
    
    if (hasReacted) {
      promise = unReactToMessage(getSelectedChannelId(), message.id, reactString);

      const idxToRemove = message.reacts.findIndex(x => {
        return x.user === userId && x.react === reactString;
      });
      message.reacts.splice(idxToRemove, 1);
    } else {
      promise = reactToMessage(getSelectedChannelId(), message.id, reactString);

      if (!message.reacts) message.reacts = [];
      message.reacts.push({ react: reactString, user: userId });
    }
    updateMessageDOM(false);
    promise.then(() => loadPinnedMessages());
  };

  const updateMessageDOM = (scrollTo, currentMessage = message) => {
    // Render content (text or image), timestamps, reacts, and pin visuals
    if (currentMessage.message) {
      contentElement.replaceChildren(formatTextToHTML(currentMessage.message));
    } else if (currentMessage.image) {
      contentElement.replaceChildren(MessageImage({
        src: currentMessage.image,
        messageId: currentMessage.id,
      }));
    }

    timestamp.textContent = dateFormatter(currentMessage.sentAt);
    if (currentMessage.edited) {
      editTimestamp.textContent = `(edited ${dateFormatter(currentMessage.editedAt)})`;
      editTimestamp.classList.remove('hidden');
    }
    reactLabelsMountpoint.replaceChildren(MessageReactLabels({
      reacts: message.reacts,
      reactFn: react,
    }));

    if (currentMessage.pinned) {
      pinLabel.classList.remove('hidden');
      pinBtn.querySelector('.message-pin-button-pin').classList.add('hidden');
      pinBtn.querySelector('.message-pin-button-unpin').classList.remove('hidden');
      messageElement.classList.add('bg-primary-content/50');
    } else {
      pinLabel.classList.add('hidden');
      pinBtn.querySelector('.message-pin-button-pin').classList.remove('hidden');
      pinBtn.querySelector('.message-pin-button-unpin').classList.add('hidden');
      messageElement.classList.remove('bg-primary-content/50');
    }

    if (scrollTo) messageElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  const interval = setInterval(() => updateMessageDOM(false, message), 5000);

  [deleteBtn, editBtn, divider].forEach(element => {
    element.hidden = message.sender !== parseInt(localStorage.userId);
  });
  messageElement.setAttribute('message-id', message.id);
  editBtn.addEventListener('click', () => EditMessageInput({
    getSelectedChannelId,
    message,
    updateMessageDOM,
    loadPinnedMessages,
  }));

  deleteBtn.addEventListener('click', () => {
    // Delete then remove from DOM
    deleteMessage(getSelectedChannelId(), message.id)
      .then(() => {
        clearInterval(interval);
        messageElement.remove();
        loadPinnedMessages();
      });
  });

  updateMessageDOM(false);

  reactButtons.forEach(button => button.addEventListener('click', () => {
    react(button.textContent);
  }));

  const pin = () => {
    // Toggle pin state and refresh pinned list
    let promise;
    if (message.pinned) {
      promise = unpinMessage(getSelectedChannelId(), message.id);
      message.pinned = false;
    } else {
      promise = pinMessage(getSelectedChannelId(), message.id);
      message.pinned = true;
    }
    updateMessageDOM(false);
    promise.then(() => loadPinnedMessages());
  };

  pinBtn.addEventListener('click', () => pin());

  // Reveal interaction bar on touch if you're on a touch device
  messageElement.addEventListener('click', event => {
    if (event.pointerType !== 'touch') {
      document.querySelectorAll('.message-interacton')
        .forEach(interaction => interaction.style.display = '');
      return;
    }

    document.querySelectorAll('.message-interacton')
      .forEach(interaction => interaction.style.display = '');

    messageElement.querySelector('.message-interacton').style.display = 'flex';
  });

  // Return the message element asynchronously
  return getUserDetails(message.sender).then(data => {
    usernameElement.textContent = data.name;
    avatarElement.src = data.image ? data.image : '../../assets/avatar.svg';
  })
    .then(() => messageElement);
};
