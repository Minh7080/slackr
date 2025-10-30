import { getMessages, sendMessage, sendMessageImage } from '../lib/api.js';
import { fileToDataUrl } from '../lib/imageToUrl.js';
import { Message } from './Message.js';

export const MessageInput = ({ getSelectedChannelId, loadPinnedMessages }) => {
  const messageInputMountpoint = document.getElementById('message-input-mountpoint');
  const messageInputDocument = document.getElementById('message-input-component').content.cloneNode(true);
  messageInputMountpoint.replaceChildren(messageInputDocument);

  const messageMountpoint = document.getElementById('message-mountpoint');
  const inputElement = document.getElementById('message-input');
  const submitBtn = document.getElementById('message-submit-button');
  submitBtn.disabled = true;

  const addImageBtn = document.getElementById('message-input-image-button');
  const imageInput = document.getElementById('message-input-image-input');
  const imagePreview = document.getElementById('message-input-image-preview');

  const updateSubmitBtn = () => {
    submitBtn.disabled = inputElement.value.trim() === "" && !imageInput.files[0];
  }

  inputElement.addEventListener('input', () => {
    inputElement.style.height = 'auto';
    inputElement.style.height = inputElement.scrollHeight + 'px';
    updateSubmitBtn();
  });

  const updateImageButton = () => {
    if (inputElement.value.trim()) {
      addImageBtn.disabled = true;
    } else {
      addImageBtn.disabled = false;
    }
  }

  inputElement.addEventListener('input', () => {
    updateImageButton();
  });

  addImageBtn.addEventListener('click', () => imageInput.click());

  const updateImagePreview = () => {
    if (imageInput.files[0]) {
      fileToDataUrl(imageInput.files[0]).then(url => {
        imagePreview.querySelector('img').src = url;
        inputElement.style.display = 'none';
        imagePreview.style.display = '';
      });
    } else {
      inputElement.style.display = '';
      imagePreview.style.display = 'none';
    }
  }

  imagePreview.style.display = 'none';
  imageInput.addEventListener('change', () => {
    updateImagePreview();
    updateImageButton();
    updateSubmitBtn();
  });


  imagePreview.querySelector('button').addEventListener('click', () => {
    imageInput.value = '';
    updateImagePreview();
    updateSubmitBtn();
  })

  const submitMessage = () => {
    const messagePromise = inputElement.value
    ? sendMessage(getSelectedChannelId(), inputElement.value)
    : fileToDataUrl(imageInput.files[0])
      .then(url => sendMessageImage(getSelectedChannelId(), url));

    messagePromise
      .then(() => {
        inputElement.value = '';
        imageInput.value = ''
        submitBtn.disabled = true;
        inputElement.style.height = 'auto';
        updateImagePreview();
        updateImageButton();
      })
      .then(() => {
        return getMessages(getSelectedChannelId(), 0);
      })
      .then(messages => {
        return Message({ message: messages[0], getSelectedChannelId, loadPinnedMessages });
      })
      .then(message => {
        messageMountpoint.appendChild(message);
        message.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
  };

  submitBtn.addEventListener('click', () => {
    submitMessage();
  });

  [addImageBtn, inputElement].forEach(element => element.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !submitBtn.disabled) {
      e.preventDefault();
      submitMessage();
    }
  }))
};
