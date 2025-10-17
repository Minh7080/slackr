export const ToastError = (message) => {
  const container = document.getElementById('toast-container');
  const toast = document.getElementById('error-toast-component').content.cloneNode(true);
  const toastElement = toast.querySelector('div');
  const content = toast.querySelector('span');
  const closeBtn = toast.querySelector('button')

  const remove = () => {
    toastElement.classList.add('opacity-0');
    toastElement.classList.add('scale-20');
    setTimeout(() => {toastElement.remove()}, 200);
  };

  container.appendChild(toast);
  content.innerText = message;
  closeBtn.addEventListener('click', () => remove());
  setTimeout(() => remove(), 3000);
}
