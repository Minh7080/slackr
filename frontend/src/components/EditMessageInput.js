import { editMessage, uploadImage } from '../lib/api.js';
import { fileToDataUrl } from '../lib/imageToUrl.js';
import { MessageInput } from './MessageInput.js';

export const EditMessageInput = ({ 
  getSelectedChannelId,
  message,
  updateMessageDOM,
  loadPinnedMessages,
}) => {
  // Clone template and place it on the mountpoint
  const messageInputMountpoint = document.getElementById('message-input-mountpoint');
  const messageEditDocument = document.
    getElementById('message-edit-component').content.cloneNode(true);
  messageInputMountpoint.replaceChildren(messageEditDocument);

  // DOM selectors
  const inputElement = document.getElementById('message-edit-input');
  const submitBtn = document.getElementById('message-edit-submit-button');
  const closeBtn = document.getElementById('message-edit-close-button');

  const addImageBtn = document.getElementById('message-edit-input-image-button');
  const imageInput = document.getElementById('message-edit-input-image-input');
  const imagePreview = document.getElementById('message-edit-input-image-preview');


  // Fill the inputElement.value with content of message and resize it accordingly
  inputElement.value = message.message ? message.message : '';
  inputElement.style.height = inputElement.scrollHeight + 'px';

  const originalHasImage = !!message.image;
  const originalMessage = message.message || '';
  let imageRemoved = false;

  // Focus on element upon creation
  inputElement.focus();

  // Disable submit button by default
  submitBtn.disabled = true;

  // Helper functions
  const updateSubmitBtn = () => {
    const hasText = inputElement.value.trim() !== '';
    const hasNewImage = !!imageInput.files[0];
    const textChanged = inputElement.value.trim() !== originalMessage.trim();
    
    // Check if the new image is the same as the old image
    let imageChanged = false;
    if (hasNewImage) {
      imageChanged = true;
    } else if (originalHasImage && imageRemoved) {
      imageChanged = true;
    }
    
    // Enable submit only if there is content and something changed
    const hasContent = hasText || hasNewImage || (originalHasImage && !imageRemoved);
    submitBtn.disabled = !hasContent || (!textChanged && !imageChanged);
  };

  const updateImageButton = () => {
    if (inputElement.value.trim()) {
      addImageBtn.disabled = true;
    } else {
      addImageBtn.disabled = false;
    }
  };

  // Resize text area based on content and updateSubmitBtn
  inputElement.addEventListener('input', () => {
    inputElement.style.height = 'auto';
    inputElement.style.height = inputElement.scrollHeight + 'px';
    updateSubmitBtn();
  });

  // Go back to MessageInput component if escape key is pressed or closeBtn is clicked
  inputElement.addEventListener('keydown', event => {
    if (event.key === 'Escape') MessageInput({ getSelectedChannelId, loadPinnedMessages });
  });
  closeBtn.addEventListener('click', () => {
    MessageInput({ getSelectedChannelId, loadPinnedMessages });
  });


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
  };

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
  });

  const submitMessage = () => {
    let finalImage = undefined;
    
    if (imageInput.files[0]) {
      // New image selected
      const form = new FormData();
      form.append('file', imageInput.files[0]);
      uploadImage(form).then(fileName => {
        finalImage = fileName;
        const finalMessage = inputElement.value.trim() || undefined;
        editMessage(getSelectedChannelId(), message.id, finalMessage, finalImage)
          .then(() => {
            message.message = inputElement.value;
            if (finalImage) {
              message.image = finalImage;
            } else {
              delete message.image;
            }
            message.edited = true;
            message.editedAt = new Date();
            updateMessageDOM(true);
          })
          .then(() => {
            MessageInput({ getSelectedChannelId, loadPinnedMessages });
            loadPinnedMessages();
          });
      });
    } else {
      // No new image keep original if not removed, otherwise remove it
      finalImage = (originalHasImage && !imageRemoved) ? message.image : undefined;
      const finalMessage = inputElement.value.trim() || undefined;
      
      editMessage(getSelectedChannelId(), message.id, finalMessage, finalImage)
        .then(() => {
          message.message = inputElement.value;
          if (finalImage) {
            message.image = finalImage;
          } else {
            delete message.image;
          }
          message.edited = true;
          message.editedAt = new Date();
          updateMessageDOM(true);
        })
        .then(() => {
          MessageInput({ getSelectedChannelId, loadPinnedMessages });
          loadPinnedMessages();
        });
    }
  };

  submitBtn.addEventListener('click', () => {
    submitMessage();
  });

  [addImageBtn, inputElement].forEach(element => element.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !submitBtn.disabled) {
      event.preventDefault();
      submitMessage();
    }
  }));
};
