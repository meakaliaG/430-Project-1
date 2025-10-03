const fs = require('fs');
const path = require('path');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);
const js = fs.readFileSync(`${__dirname}/../src/client.js`);

// // HELPER - serve static files
// const serveFile = (response, filepaath, contentType) => {
//     const absPath = path.resolve(__dirname, filepath);

//     fs.readFile(absPath, (err, fileData) => {
//         if (err) {
//             console.error(`Error reading ${filepath}:`, err);
//             response.writeHead(404, {'Content-Type': 'applicaiton/json'});
//             response.end(JSON.stringify({
//                 message: 'File not found',
//                 id: 'missingFile',
//             }));
//             return;
//         }
//         response.writeHead(200, {
//             'Content-Type': contentType,
//             'Content-Length': Buffer.byteLength(fileData),
//         });
//         response.end(fileData);
//     });
// };

const getIndex = (request, response) => {
    response.writeHead(200, {
        'Content-Type': 'text/html',
        'Content-Length': Buffer.byteLength(index, 'utf8'),
    });
    response.write(index);
    response.end();
};

const getCSS = (request, response) => {
    response.writeHead(200, {
        'Content-Type': 'text/css',
    });
    response.write(css);
    response.end();
};

const getJS = (request, response) => {
    response.writeHead(200, {
        'Content-Type': 'application/javascript',
    });
    response.write(js);
    response.end();
};

module.exports = {
    getIndex,
    getCSS,
    getJS,
};