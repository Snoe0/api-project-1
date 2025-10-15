const init = () => {
  const endpointHeaders = document.querySelectorAll('.endpoint-header');
  endpointHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const endpoint = header.parentElement;
      const docsSection = endpoint.querySelector('.docs-section');
      if (docsSection) {
        docsSection.classList.toggle('expanded');
      }
    });
  });
};

window.onload = init;
