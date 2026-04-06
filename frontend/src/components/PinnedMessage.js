import { getUserDetails } from '../lib/api.js';
import { dateFormatter } from '../lib/dateFormatter.js';
import { formatTextToHTML } from '../lib/formatTextToHTML.js';
import { MessageReactLabels } from './MessageReactLabels.js';
import { PinnedMessageImage } from './PinnedMessageImage.js';

export const PinnedMessage = ({ message }) => {
  const messageTemplate = document.getElementById('pinned-message-component')
    .content.cloneNode(true);
  const messageElement = messageTemplate.firstElementChild;

  const usernameElement = messageElement.querySelector('.message-username');
  const contentElement = messageElement.querySelector('.message-content');
  const avatarElement = messageElement.querySelector('.message-avatar');
  const timestamp = messageElement.querySelector('.message-timestamp');
  const reactLabelsMountpoint = messageElement.querySelector('.message-react-labels-mountpoint');
  const editTimestamp = messageElement.querySelector('.message-edit-timestamp');


  const updateMessageDOM = (currentMessage = message) => {
    // Render content, timestamps, and static react labels
    if (currentMessage.message) {
      contentElement.replaceChildren(formatTextToHTML(currentMessage.message));
    } else if (currentMessage.image) {
      contentElement.replaceChildren(PinnedMessageImage({ src: currentMessage.image }));
    }

    timestamp.textContent = dateFormatter(currentMessage.sentAt);
    if (currentMessage.edited) {
      editTimestamp.textContent = `(edited ${dateFormatter(currentMessage.editedAt)})`;
      editTimestamp.classList.remove('hidden');
    }
    reactLabelsMountpoint.replaceChildren(MessageReactLabels({
      reacts: message.reacts,
      reactFn: () => {},
    }));
  };

  updateMessageDOM(message);

  // TODO: WebSocket — polls every 5s to reflect pinned message changes. Replace with a
  // WebSocket listener once the backend supports it.
  setInterval(() => updateMessageDOM(message), 5000);

  return getUserDetails(message.sender).then(data => {
    usernameElement.textContent = data.name;
    avatarElement.src = data.image ? data.image : '../../assets/avatar.svg';
    return messageElement;
  });
};
