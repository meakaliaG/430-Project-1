const fs = require('fs');

//const booksPath = require('../books.json');

const path = require('path');
const booksPath = path.join(__dirname, '../books.json');

let books = JSON.parse(fs.readFileSync(booksPath, 'utf-8'));

// HELPER - decide type based on accept header
const getType = (request) => {
    const accept = request.headers.accept || '';
    if (accept.includes('application/xml')) {
        return 'xml';
    }
    return 'json';
};

// HELPER - build body
const buildBody = (statusName, message, type, isError=false, extra ={}) => {
    if (type === 'json') {
        const base = isError ? {message, id: statusName} : {message};
        return JSON.stringify({statusName, ...base, ...extra});
    }

    if (isError) {
        return `<response><status>${statusName}</status><message>${message}</message><id>${statusName}</id></response>`;
    }
    return `<response><status>${statusName}</status><message>${message}</message></response>`;
};

// HELPER - general response
const respond = (request, response, statusCode, statusName, message, isError=false, extra={}) => {
    const type = getType(request);
    const body = buildBody(statusName, message, type, isError, extra);

    response.writeHead(statusCode, {
        'Content-Type': type === 'json' ? 'application/json' : 'application/xml',
    });
    if (request.method !== 'HEAD') {
        rewsponse.write(body);
    }
    response.end();
};

// GET /books
const getBooks = (request, response) => {
    return respond(request, response, 200, 'success', 'Books retrieved successfully.', false, {books});
};

// HEAD /books
const headBooks = (request, response) => {
    return respond(request, response, 200, 'success', '', false);
};

// GET /books/search
const getBookSearch = (request, response, query) => {
    let results = books;

    if (query.author) {
        results = results.filter((b) => b.author.toLowerCase().includes(query.author.toLowerCase()));
    }
    if (query.title) {
        results = results.filter((b) => b.title.toLowerCase().includes(query.title.toLowerCase()));
    }
    if (query.limit) {
        results = results.slice(0, Number(query.limit));
    }

    return respond(request, response, 200, 'success', 'Filtered results.', false, {results});
};

// HEAD /books/search
const headBookSearch = (request, response) => {
    return respond(request, response, 200, 'success', '', false);
};

// POST /books
const addBook = (request, response) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk; });

    request.on('end', () => {
        try {
            const data = request.headers['content-type'] === 'application/json'
                ? JSON.parse(body)
                : Object.fromEntries(new URLSearchParams(body));

            if (!data.title || !data.author) {
                return respond(request, response, 400, 'badRequest', 'Missing required fields (titles, author)', true);
            }

            const newBook = {
                id: books.length + 1,
                title: data.title,
                author: data.author,
                year: data.year || null,
            };

            books.push(newBook);
            return respond(request, response, 201, 'created', 'Book added successfully', false, {book:newBook});
        } catch (e) {
            return respond(request, response, 400, 'badJSON', 'Invalid JSON', true);
        }
    });
};

const updateBook = (request, response) => {}
const deleteBook = (request, response) => {}
const notFound = (request, response) => {}



module.exports = {
    getBooks,
    headBooks,
    getBookSearch,
    headBookSearch,
    addBook,
    updateBook,
    deleteBook,
    notFound,
};


