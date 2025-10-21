export const ToastError = (message) => {
  const container = document.getElementById('toast-container');
  const toast = document.getElementById('error-toast-component').content.cloneNode(true);
  const toastElement = toast.querySelector('div');
  const content = toast.querySelector('span');
  const closeBtn = toast.querySelector('button')

  const remove = (element) => {
    element.classList.add('opacity-0');
    element.classList.add('scale-20');
    setTimeout(() => {element.remove()}, 200);
  };

  if (container.children.length >= 3) {
    remove(container.lastChild);
  }

  container.prepend(toast);
  content.innerText = message;
  closeBtn.addEventListener('click', () => remove(toastElement));
  setTimeout(() => remove(toastElement), 3000);
}
