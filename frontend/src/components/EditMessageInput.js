import { editMessage } from '../lib/api.js';
import { fileToDataUrl } from '../lib/imageToUrl.js';
import { MessageInput } from './MessageInput.js';

export const EditMessageInput = ({ getSelectedChannelId, message, updateMessageDOM, loadPinnedMessages }) => {
  const messageInputMountpoint = document.getElementById('message-input-mountpoint');
  const messageEditDocument = document.getElementById('message-edit-component').content.cloneNode(true);
  messageInputMountpoint.replaceChildren(messageEditDocument);

  const inputElement = document.getElementById('message-edit-input');
  const submitBtn = document.getElementById('message-edit-submit-button');
  const closeBtn = document.getElementById('message-edit-close-button');
  submitBtn.disabled = true;

  const addImageBtn = document.getElementById('message-edit-input-image-button');
  const imageInput = document.getElementById('message-edit-input-image-input');
  const imagePreview = document.getElementById('message-edit-input-image-preview');

  inputElement.value = message.message ? message.message : '';
  inputElement.style.height = inputElement.scrollHeight + 'px';

  const originalHasImage = !!message.image;
  const originalMessage = message.message || '';
  let imageRemoved = false;

  const updateSubmitBtn = () => {
    const hasText = inputElement.value.trim() !== "";
    const hasNewImage = !!imageInput.files[0];
    const textChanged = inputElement.value.trim() !== originalMessage.trim();
    
    // Image changed if: new image selected, original removed, or image was removed
    let imageChanged = false;
    if (hasNewImage) {
      imageChanged = true; // New image selected
    } else if (originalHasImage && imageRemoved) {
      imageChanged = true; // Original image was removed
    }
    
    // Need either text or image (new or original if not removed)
    const hasContent = hasText || hasNewImage || (originalHasImage && !imageRemoved);
    
    submitBtn.disabled = !hasContent || (!textChanged && !imageChanged);
  }

  inputElement.addEventListener('input', () => {
    inputElement.style.height = 'auto';
    inputElement.style.height = inputElement.scrollHeight + 'px';
    updateSubmitBtn();
  });

  inputElement.addEventListener('keydown', e => {
    if (e.key === 'Escape') MessageInput({ getSelectedChannelId, loadPinnedMessages });
  });

  inputElement.focus();

  closeBtn.addEventListener('click', () => MessageInput({ getSelectedChannelId, loadPinnedMessages }));


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
        imageRemoved = false;
        updateSubmitBtn();
      });
    } else if (message.image && !imageRemoved) {
      // Show original image if no new file selected and not removed
      imagePreview.querySelector('img').src = message.image;
      inputElement.style.display = 'none';
      imagePreview.style.display = '';
      updateSubmitBtn();
    } else {
      // No image to show
      inputElement.style.display = '';
      imagePreview.style.display = 'none';
      updateSubmitBtn();
    }
  }

  updateImageButton();
  updateImagePreview();
  updateSubmitBtn();

  imageInput.addEventListener('change', () => {
    imageRemoved = false;
    updateImagePreview();
    updateImageButton();
    updateSubmitBtn();
  });


  imagePreview.querySelector('button').addEventListener('click', () => {
    imageInput.value = '';
    imageRemoved = true;
    updateImagePreview();
    updateSubmitBtn();
  })

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
        loadPinnedMessages();
      })
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
