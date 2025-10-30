export const formatTextToHTML = (text) => {
  return createParagraph(text);
};

const createParagraph = (text) => {
  const fragment = document.createDocumentFragment();

  for (const line of text.split('\n')) {
    const p = document.createElement('p');
    p.textContent = line;

    fragment.appendChild(p);
  }
  return fragment;
};
