const API_URL = '';

const request = async(url, options = {}) => {
    const response = await fetch(url, {
        headers: {'Accept': 'application/json', ...options.headers},
        ...options,
    });
    const text = await response.text();
    try {
        return text ? JSON.parse(text) : {};   
    } catch (err) {
        console.error('Failed to parse JSON:', text);
        return {error: 'Invalid JSON response'};
    }
};

// GET all bookTitles
document.getElementById('getBookTitles').addEventListener('click', async() => {
    const data = await request('/bookTitles');
    document.getElementById('bookTitlesOutput').textContent = JSON.stringify(data, null, 2);
});
// HEAD all bookTitles
document.getElementById('headBookTitles').addEventListener('click', async() => {
    const response = await fetch('/bookTitles', {method:'HEAD', headers:{'Accept':'application/json'}});
    document.getElementById('bookTitlesOutput').textContent = `HEAD requested returned status: ${response.status}`;
});

// GET all books
document.getElementById('getBooks').addEventListener('click', async() => {
    const data = await request('/books');
    document.getElementById('booksOutput').textContent = JSON.stringify(data, null, 2);
});
// HEAD all books
document.getElementById('headBooks').addEventListener('click', async() => {
    const response = await fetch('/books', {method:'HEAD', headers:{'Accept':'application/json'}});
    document.getElementById('booksOutput').textContent = `HEAD requested returned status: ${response.status}`;
});

// GET all genres
document.getElementById('getGenres').addEventListener('click', async() => {
    const data = await request('/genres');
    document.getElementById('genresOutput').textContent = JSON.stringify(data, null, 2);
});
// HEAD all genres
document.getElementById('headGenres').addEventListener('click', async() => {
    const response = await fetch('/generes', {method:'HEAD', headers:{'Accept':'application/json'}});
    document.getElementById('genresOutput').textContent = `HEAD requested returned status: ${response.status}`;
});

// GET book
// Search books
document.getElementById('authorSearch').addEventListener('submit', async(e) => {
    e.preventDefault();
    const params = new URLSearchParams(new FormData(e.target)).toString();
    console.log(params);
    const data = await request(`/books/search?${params}`);
    document.getElementById('searchOutput').textContent = JSON.stringify(data, null, 2);
});
document.getElementById('titleSearch').addEventListener('submit', async(e) => {
    e.preventDefault();
    const params = new URLSearchParams(new FormData(e.target)).toString();
    console.log(params);
    const data = await request(`/books/search?${params}`);
    document.getElementById('searchOutput').textContent = JSON.stringify(data, null, 2);
});
document.getElementById('yearSearch').addEventListener('submit', async(e) => {
    e.preventDefault();
    const params = new URLSearchParams(new FormData(e.target)).toString();
    console.log(params);
    const data = await request(`/books/search?${params}`);
    document.getElementById('searchOutput').textContent = JSON.stringify(data, null, 2);
});
document.getElementById('genreSearch').addEventListener('submit', async(e) => {
    e.preventDefault();
    const genre = document.getElementById('genreSelect').value;
    const params = new URLSearchParams({genre});
    console.log(params);
    const data = await request(`/books/search?${params}`);
    document.getElementById('searchOutput').textContent = JSON.stringify(data, null, 2);
});

async function loadGenres() {
    try {
        const response = await fetch('/genres');
        const data = await response.json();

        const select = document.getElementById('genreSelect');
        data.genres.forEach((g) => {
            const option = document.createElement('option');
            option.value = g;
            option.textContent = g;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Failed to load genres:', err);
    }
}
loadGenres();

// POST add book
document.getElementById('addBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    console.log(data);
    const result = await request('/books', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    });
    document.getElementById('addBookOutput').textContent = JSON.stringify(result, null, 2);
    e.target.reset();
});

document.getElementById('addRatingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dataObj = Object.fromEntries(formData.entries());

    // Rename the property to match what the server expects
    dataObj.title = dataObj.bookTitle;
    delete dataObj.bookTitle;

    // Ensure rating is numeric
    dataObj.rating = Number(dataObj.rating);

    const data = await request('/books/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataObj),
    });

    document.getElementById('addRatingOutput').textContent = JSON.stringify(data, null, 2);
    e.target.reset();
});


// POST add rating
// document.getElementById('addRatingForm').addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.target);
//     const data = Object.fromEntries(formData.entries());
//     console.log(data);
//     const result = await request('/books/rating', {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify(data),
//     });
//     document.getElementById('addRatingOutput').textContent = JSON.stringify(result, null, 2);
//     e.target.reset();
// });

// const ratingSection = document.createElement('section');
// ratingSection.innerHTML = `
//     <h2>addRating</h2>
//     <form id="ratingForm">
//         <label>Book Title: <input type="text" name="title" required></label>
//         <label>Rating (1–5): <input type="number" name="rating" min="1" max="5" required></label>
//         <button type="submit">Submit Rating</button>
//     </form>
//     <pre id="ratingOutput"></pre>
// `;
// document.body.appendChild(ratingSection);
