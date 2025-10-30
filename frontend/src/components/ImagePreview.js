export const ImagePreview = ({ images, currentIndex = 0 }) => {
  const mountpoint = document.getElementById('modal-container');
  const modal = document.getElementById('image-preview-modal').content.cloneNode(true);
  const image = modal.querySelector('#image-preview-img');
  const closeBtn = modal.querySelector('#image-preview-close');
  const prevBtn = modal.querySelector('#image-preview-prev');
  const nextBtn = modal.querySelector('#image-preview-next');
  
  mountpoint.replaceChildren(modal);

  // Ensure we have a valid array
  const imageList = Array.isArray(images) && images.length > 0 ? images : [images];
  let currentIdx = Math.max(0, Math.min(currentIndex, imageList.length - 1));

  const updateImage = () => {
    image.src = imageList[currentIdx];
    
    // Show/hide navigation buttons based on image count
    if (imageList.length <= 1) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    } else {
      prevBtn.style.display = '';
      nextBtn.style.display = '';
      // Disable buttons at boundaries
      prevBtn.disabled = currentIdx === 0;
      nextBtn.disabled = currentIdx === imageList.length - 1;
    }
  };

  const goToPrev = () => {
    if (currentIdx > 0) {
      currentIdx--;
      updateImage();
    }
  };

  const goToNext = () => {
    if (currentIdx < imageList.length - 1) {
      currentIdx++;
      updateImage();
    }
  };

  // Initialize image
  updateImage();

  // Event listeners
  closeBtn.addEventListener('click', () => mountpoint.close());
  prevBtn.addEventListener('click', goToPrev);
  nextBtn.addEventListener('click', goToNext);

  // Keyboard navigation
  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      goToPrev();
    } else if (event.key === 'ArrowRight') {
      goToNext();
    } else if (event.key === 'Escape') {
      mountpoint.close();
    }
  };

  mountpoint.addEventListener('keydown', handleKeyDown);
  
  // Clean up event listeners when modal closes
  const handleClose = () => {
    mountpoint.removeEventListener('keydown', handleKeyDown);
    mountpoint.removeEventListener('close', handleClose);
  };
  mountpoint.addEventListener('close', handleClose);

  mountpoint.showModal();
};
