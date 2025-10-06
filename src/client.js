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

// Load all books
document.getElementById('loadBooks').addEventListener('click', async() => {
    const data = await request('/books');
    document.getElementById('booksOutput').textContent = JSON.stringify(data, null, 2);
});

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

//