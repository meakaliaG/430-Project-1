const fs = require('fs');
const path = require('path');
const booksPath = path.join(__dirname, '../books.json');

let books = JSON.parse(fs.readFileSync(booksPath, 'utf-8'));
let bookTitles = [];
let allGenres = [];

const saveBooks = () => {
    fs.writeFileSync(booksPath, JSON.stringify(books, null, 2));
};

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
    let body = '';
    const fullBody = buildBody(statusName, message, type, isError, extra);
   
    if (statusCode !== 204 && request.method !== 'HEAD') {
        body = fullBody;
    }

    response.writeHead(statusCode, {
        'Content-Type': type === 'json' ? 'application/json' : 'application/xml',
        'Content-Length': Buffer.byteLength(fullBody), 
        'X-Status-Name': statusName,
        'X-Status-Message': message
    });

    // Write body only for non-HEAD requests and non-204
    if (request.method !== 'HEAD' && statusCode !== 204) {
        response.write(body);
    }

    response.end();
};


// GET /bookTitles
const getBookTitles = (request, response) => {
    const extraData = {bookTitles};
    if (request.method === 'HEAD') {
        return respond(request, response, 200, 'success', '', false, extraData);
    }
    return respond(request, response, 200, 'success', 'Book titles retrieved successfully.', false, {bookTitles});
};

// GET /books
const getBooks = (request, response) => {
    const extraData = {books};
    if (request.method === 'HEAD') {
        return respond(request, response, 200, 'success', '', false, extraData);
    }
    return respond(request, response, 200, 'success', 'Books retrieved successfully.', false, {books});
};

// GET /genres
const getGenres = (request, response) => {
    const extraData = {allGenres};
    if (request.method === 'HEAD') {
        return respond(request, response, 200, 'success', '', false, extraData);
    }
    return respond(request, response, 200, 'success', 'Available genres.', false, {genres:allGenres});
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
    if (request.method === 'HEAD') {
        return respond(request, response, 200, 'success', '', false);
    }
    return respond(request, response, 200, 'success', 'Filtered results.', false, {results});
};

// POST /books
const addBook = (request, response, query, body) => {
    // body is already parsed by server.js!
    console.log('addBook body:', body);

    const { title, author, year, genres } = body;

    if (!title || !author) {
        return respond(request, response, 400, 'badRequest', 'Missing required fields (title, author)', true);
    }

    const newBook = {
        id: books.length + 1,
        title,
        author,
        year: year ? Number(year) : null,
        genres: genres ? genres.split(',').map((g) => g.trim()) : [],
        ratings: [],
    };

    books.push(newBook);
    saveBooks();
    refreshMeta();

    return respond(request, response, 201, 'created', 'Book added successfully.', false, { book: newBook });
};

// POST /books/rating
const addRating = (request, response, query, body) => {
    const { rating, title } = body;

    const parsedRating = Number(rating);
    if (!rating || isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
        return respond(
            request,
            response,
            400,
            'badRequest',
            'Rating must be a number between 0 and 5.',
            true
        );
    }
    const normalizedTitle = title.trim().toLowerCase();
    const book = books.find((b) => b.title.trim().toLowerCase() === normalizedTitle);

    if (!book) {
        return respond(request, response, 404, 'notFound', 'Book not found.', true);
    }
    book.ratings = book.ratings || [];
    book.ratings.push(parsedRating);
    // make ratings array a single value and average
    const avgRating = (
        book.ratings.reduce((a, b) => a + b, 0) / book.ratings.length
    ).toFixed(2);

    saveBooks();
    return respond(request, response, 201, 'created', 'Rating added successfully.', false, {
        book: { ...book, averageRating: avgRating },
    });

};

const notFound = (request, response) => {
    respond(request, response, 404, 'notFound', 'The requested resource was not found,', true);
};

module.exports = {
    getBookTitles,
    getBooks,
    getGenres,
    getBookSearch,
    addBook,
    addRating,
    notFound,
};


