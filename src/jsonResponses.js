const books = require('./books.json');

const getBooks = (request, response) => {
    response.json(books);
};

module.exports = {
    getBooks,
};


