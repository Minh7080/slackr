import { getUserDetails } from '../lib/api.js';

export const MessageReactLabels = ({ reacts, reactFn }) => {

  const reactCounter = new Map();
  for (const react of reacts) {
    if (!reactCounter.has(react.react)) reactCounter.set(react.react, []);
    reactCounter.get(react.react).push(react.user)
  }

  const out = document.createDocumentFragment();
  for (const react of [...reactCounter.keys()].sort()) {
    const reactDocument = document.getElementById('message-react-label-component').content.cloneNode(true);
    const reactElement = reactDocument.firstElementChild;

    reactElement.querySelector('.message-react-label-react').textContent = react;
    reactElement.querySelector('.message-react-label-count').textContent = reactCounter.get(react).length;

    const userId = parseInt(localStorage.getItem('userId'));

    if (reactCounter.get(react).includes(userId)) {
      reactElement.classList.add('border-blue-300', 'bg-blue-100');
    }

    reactElement.addEventListener('click', () => reactFn(react));

    out.appendChild(reactElement);

    /* const userPromises = reactCounter.get(react).map(user => getUserDetails(user))
    Promise.all(userPromises).then(data => {
      reactElement.title = 'Reacted:\n';
      reactElement.title += data.map(user => user.name).join('\n');
    }); */
    
  }
  return out;
}
