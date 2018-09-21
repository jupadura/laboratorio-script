var baseUrl = 'https://raw.githubusercontent.com/jupadura/laboratorio-script/master/';

fetch(`${baseUrl}src/lab.js`)
    .then(response => response.text())
    .then(eval);

fetch(`${baseUrl}src/lab.css`)
    .then(response => response.text())
    .then(content => {
        var style = document.createElement('style');
        style.textContent = content;
        document.head.appendChild(style);
    });

fetch(`${baseUrl}src/lab.html`)
    .then(response => response.text())
    .then(content => {
        document.body.innerHTML = content;
    });