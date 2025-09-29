const books = require('./books.json');
console.log(books);

books.push({
    title: 'Lord',
    author: 'Me'
});

console.log(books[0].author);