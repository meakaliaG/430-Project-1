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

async function headRequest(endpoint, outputId) {
    const response = await fetch(endpoint, {
        method: 'HEAD',
        headers: { 'Accept': 'application/json' }
    });

    const contentLength = response.headers.get('Content-Length') || 0;
    const statusName = response.headers.get('Status-Name');
    const statusCode = response.headers.get('Status-Code')

    document.getElementById(outputId).textContent =
        `HEAD request returned:\nStatus: ${statusCode}, ${statusName}\nContent-Length: ${contentLength}`;
}

// HEAD bookTitles
document.getElementById('headBookTitles').addEventListener('click', () => {
    headRequest('/bookTitles', 'bookTitlesOutput');
});
// HEAD books
document.getElementById('headBooks').addEventListener('click', () => {
    headRequest('/books', 'booksOutput');
});
// HEAD genres
document.getElementById('headGenres').addEventListener('click', () => {
    headRequest('/genres', 'genresOutput');
});


// GET all bookTitles
document.getElementById('getBookTitles').addEventListener('click', async() => {
    const data = await request('/bookTitles');
    document.getElementById('bookTitlesOutput').textContent = JSON.stringify(data, null, 2);
});
// GET all books
document.getElementById('getBooks').addEventListener('click', async() => {
    const data = await request('/books');
    document.getElementById('booksOutput').textContent = JSON.stringify(data, null, 2);
});
// GET all genres
document.getElementById('getGenres').addEventListener('click', async() => {
    const data = await request('/genres');
    document.getElementById('genresOutput').textContent = JSON.stringify(data, null, 2);
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

