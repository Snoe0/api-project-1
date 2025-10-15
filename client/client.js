const init = () => {
  const endpointHeaders = document.querySelectorAll('.endpoint-header');
  endpointHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const endpoint = header.parentElement;
      const testSection = endpoint.querySelector('.test-section');
      if (testSection) {
        testSection.classList.toggle('expanded');
      }
    });
  });

  const allButtons = document.querySelectorAll('.send-request, .send-post-request');
  allButtons.forEach(button => {
    button.addEventListener('click', () => {
      const form = button.closest('form');
      const endpoint = button.closest('.endpoint');
      const resultDiv = endpoint.querySelector('.result');
      const endpointPath = endpoint.querySelector('.endpoint-path').textContent;
      const inputs = form.querySelectorAll('input[type="text"]');
      const isPostRequest = button.classList.contains('send-post-request');

      let fetchOptions = {};

      switch (isPostRequest) {
        case true: {
          const body = {};
          inputs.forEach(input => {
            if (input.value) {
              body[input.name] = input.value;
            }
          });
          fetchOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          };
          break;
        }
        case false: {
          const checkboxes = form.querySelectorAll('input[type="checkbox"]');
          const methodRadios = form.querySelectorAll('input[name^="method"]');

          let method = 'GET';
          methodRadios.forEach(radio => {
            if (radio.checked) method = radio.value;
          });

          const params = new URLSearchParams();
          inputs.forEach(input => {
            if (input.value) {
              params.append(input.name, input.value);
            }
          });
          checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
              params.append(checkbox.name, checkbox.value);
            }
          });

          const url = params.toString() ? `${endpointPath}?${params.toString()}` : endpointPath;
          fetchOptions = { method, url };
          break;
        }
      }

      const fetchUrl = fetchOptions.url || endpointPath;
      const fetchConfig = isPostRequest ? fetchOptions : { method: fetchOptions.method };

      fetch(fetchUrl, fetchConfig)
        .then(response => {
          if (!isPostRequest && fetchOptions.method === 'HEAD') {
            const headers = {
              'Status Code': response.status,
              'Status Text': response.statusText,
              'Content-Type': response.headers.get('Content-Type'),
            };
            resultDiv.textContent = JSON.stringify(headers, null, 2);
            return null;
          }
          return response.text();
        })
        .then(data => {
          if (data === null) return;
          try {
            const jsonData = JSON.parse(data);
            resultDiv.textContent = JSON.stringify(jsonData, null, 2);
          } catch (e) {
            resultDiv.textContent = data;
          }
        })
        .catch(error => {
          resultDiv.textContent = `Error: ${error}`;
        });
    });
  });
};

window.onload = init;
