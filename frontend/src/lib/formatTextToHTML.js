export const formatTextToHTML = (text) => {
  return createParagraph(text);
}

const createParagraph = (text) => {
  const fragment = document.createDocumentFragment();

  for (const line of text.split('\n')) {
    const p = document.createElement('p');
    p.textContent = line;

    // if (!line) p.textContent = '\u00A0';

    fragment.appendChild(p);
  }
  return fragment;
}
