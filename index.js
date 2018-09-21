var baseUrl = 'https://raw.githubusercontent.com/jupadura/laboratorio-script/master/';
var random = (Math.random() + Date()).replace(/[\W]/g, '');

fetch(`${baseUrl}src/lab.js?${random}`)
    .then(response => response.text())
    .then(eval);

fetch(`${baseUrl}src/lab.css?${random}`)
    .then(response => response.text())
    .then(content => {
        var style = document.createElement('style');
        style.textContent = content;
        document.head.appendChild(style);
    });

fetch(`${baseUrl}src/lab.html?${random}`)
    .then(response => response.text())
    .then(content => {
        document.body.innerHTML = content;
    });