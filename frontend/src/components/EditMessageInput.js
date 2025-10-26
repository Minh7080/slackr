import { editMessage } from '../lib/api.js';
import { MessageInput } from './MessageInput.js';

export const EditMessageInput = ({ getSelectedChannelId, message, updateMessageDOM }) => {
  const messageInputMountpoint = document.getElementById('message-input-mountpoint');
  const messageEditDocument = document.getElementById('message-edit-component').content.cloneNode(true);
  messageInputMountpoint.replaceChildren(messageEditDocument);

  const messageMountpoint = document.getElementById('message-mountpoint');
  const inputElement = document.getElementById('message-edit-input');
  const submitBtn = document.getElementById('message-edit-submit-button');
  const closeBtn = document.getElementById('message-edit-close-button');
  submitBtn.disabled = true;

  inputElement.value = message.message;
  inputElement.style.height = inputElement.scrollHeight + 'px';

  inputElement.addEventListener('input', () => {
    inputElement.style.height = 'auto';
    inputElement.style.height = inputElement.scrollHeight + 'px';
    submitBtn.disabled = inputElement.value.trim() === '' || inputElement.value.trim() === message.message.trim();
  });

  inputElement.addEventListener('keydown', e => {
    if (e.key === 'Escape') MessageInput({ getSelectedChannelId });
  });

  inputElement.focus();

  closeBtn.addEventListener('click', () => MessageInput({ getSelectedChannelId }));

  const submitMessage = () => {
    editMessage(getSelectedChannelId(), message.id, inputElement.value)
      .then(() => {
        message.message = inputElement.value;
        message.edited = true;
        message.editedAt = new Date();
        updateMessageDOM(true);
      })
      .then(() => {
        MessageInput({ getSelectedChannelId });
      })
  };

  submitBtn.addEventListener('click', () => {
    submitMessage();
  });

  inputElement.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !submitBtn.disabled) {
      submitMessage()
    }
  })
};
