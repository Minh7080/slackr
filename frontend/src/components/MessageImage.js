import { ImagePreview } from './ImagePreview.js';

export const MessageImage = ({ src, messageId }) => {
  const messageDocument = document.getElementById('message-image-component')
    .content.cloneNode(true);
  const messageElement = messageDocument.firstElementChild;
  messageElement.setAttribute('message-id', messageId);
  messageElement.src = src;

  messageElement.addEventListener('click', () => {
    const messageMountpoint = document.getElementById('message-mountpoint');
    if (!messageMountpoint) {
      // Fallback: preview just this single image
      ImagePreview({ images: [src], currentIndex: 0 });
      return;
    }

    const images = [...messageMountpoint.querySelectorAll('.message-image')]
      .filter(img => img.src && img.src.trim() !== '');

    const currentIndex = images.findIndex(img => (
      img.src.trim() === src.trim() && parseInt(img.getAttribute('message-id')) === messageId
    ));
    
    // Preview all images in the message list, starting from this one
    ImagePreview({
      images: images.length > 0 ? images.map(img => img.src) : [src],
      currentIndex: currentIndex >= 0 ? currentIndex : 0,
    });
  });

  return messageElement;
};
