export const PinnedMessageImage = ({ src }) => {
  const messageDocument = document.getElementById('message-pinned-image-component')
    .content.cloneNode(true);
  const messageElement = messageDocument.firstElementChild;

  messageElement.src = src;
  return messageElement;
};
