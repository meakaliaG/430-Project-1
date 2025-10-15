const fs = require('fs');
const path = require('path');
const booksPath = path.join(__dirname, '../books.json');

let books = JSON.parse(fs.readFileSync(booksPath, 'utf-8'));
let bookTitles = [];
let allGenres = [];

const refreshMeta = () => {
    bookTitles = [];
    allGenres = [];
    for (const book of books) {
        bookTitles.push(book.title);
        if (Array.isArray(book.genres)) {
            for (const genre of book.genres) {
                const trimmed = genre.trim();
                if (!allGenres.includes(trimmed)) {
                    allGenres.push(trimmed);
                }
            }
        }
    }
};
refreshMeta();



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
        response.write(body);
    }
    response.end();
};

// GET /bookTitles
const getBookTitles = (request, response) => {
    if (request.method === 'HEAD') {
        return respond(request, response, 200, 'success', '', false);
    }
    return respond(request, response, 200, 'success', 'Book titles retrieved successfully.', false, {bookTitles});
};

// GET /books
const getBooks = (request, response) => {
    if (request.method === 'HEAD') {
        return respond(request, response, 200, 'success', '', false);
    }
    return respond(request, response, 200, 'success', 'Books retrieved successfully.', false, {books});
};

// GET /genres
const getGenres = (request, response) => {
    return respond(request, response, 200, 'success', 'Available genres.', false, {genres:allGenres});
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
    if (query.year) {
        const yearNum = Number(query.year);
        results = results.filter((b) => b.year === yearNum);
    }
    if (query.genre) {
        const genreQuery = query.genre.toLowerCase();
        results = results.filter((b) => 
        b.genres && b.genres.some((g) => g.toLowerCase().includes(genreQuery)));
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
            const data = 
                request.headers['content-type'] === 'application/json'
                ? JSON.parse(body)
                : Object.fromEntries(new URLSearchParams(body));

            if (!data.title || !data.author) {
                return respond(request, response, 400, 'badRequest', 'Missing required fields (titles, author)', true);
            }

            const newBook = {
                id: books.length + 1,
                title: data.title,
                author: data.author,
                year: data.year ? Number(data.year) : null,
                genres: data.genres ? data.genres.split(',').map((g) => g.trim()) : [],
                ratings: [],
            };

            books.push(newBook);
            saveBooks();
            refreshMeta();

            return respond(request, response, 201, 'created', 'Book added successfully', false, {book:newBook});
        } catch (e) {
            return respond(request, response, 400, 'badJSON', 'Invalid JSON', true);
        }
    });
};

const addRating = (request, response) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', () => {
        try {
            const data = 
            request.headers['content-type'] === 'application/json'
            ? JSON.parse(body)
            : Object.fromEntries(new URLSearchParams(body));

            const rating = Number(data.rating);
            if (isNaN(rating) || rating<0 || rating>5) {
                return respond(request, response, 400, 'badRequest', 'Rating must be a number between 0 and 5.', true);
            }

            let book = null;
            if (data.bookId) {
                book = books.find((b) => b.id === Number(data.bookId));
            } else if (data.title) {
                book = books.find((b) => b.title.toLowerCase() === data.title.toLowerCase());
            }

            if (!book) {
                return respond(request, response, 404, 'notFound', 'Book not found.', true);
            }

            book.ratings = book.ratings || [];
            book.ratings.push(rating);

            const avgRating = (book.ratings.reduce((a, b) => a + b, 0) / book.ratings.length).toFixed(2);
            saveBooks();

            return respond(request, response, 201, 'created', 'Rating added successfully.', false, {
                book: {...book, averageRating: avgRating},
            });
        } catch (e) {
            return respond(request, response, 400, 'badJSON', 'Invalid JSON.', true);
        }
    });
};

const notFound = (request, response) => {
    respond(request, response, 404, 'notFound', 'The requested resource was not found,', true);
};

module.exports = {
    getBookTitles,
    getBooks,
    getGenres,
    headBooks,
    getBookSearch,
    headBookSearch,
    addBook,
    addRating,
    notFound,
};


