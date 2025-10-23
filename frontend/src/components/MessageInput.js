import { getMessages, sendMessage } from '../lib/api.js';
import { Message } from './Message.js';

export const MessageInput = ({ getSelectedChannelId }) => {
  const messageMountpoint = document.getElementById('message-mountpoint');

  const inputElement = document.getElementById('message-input');
  const submitBtn = document.getElementById('message-submit-button');
  submitBtn.disabled = true;

  inputElement.addEventListener('input', () => {
    inputElement.style.height = 'auto';
    inputElement.style.height = inputElement.scrollHeight + 'px';
    submitBtn.disabled = inputElement.value.trim() === "";
  });

  const submitMessage = () => {
    sendMessage(getSelectedChannelId(), inputElement.value)
      .then(() => {
        inputElement.value = "";
        submitBtn.disabled = true;
        inputElement.style.height = 'auto';
      })
      .then(() => {
        return getMessages(getSelectedChannelId(), 0);
      })
      .then(messages => {
        return Message({ message: messages[0], getSelectedChannelId });
      })
      .then(message => {
        messageMountpoint.appendChild(message);
        message.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
  }

  submitBtn.addEventListener('click', () => {
    submitMessage();
  });

  inputElement.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !submitBtn.disabled) {
      submitMessage()
    }
  })
};
