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
document.getElementById('searchForm').addEventListener('submit', async(e) => {
    e.preventDefault();
    const params = new URLSearchParams(new FormData(e.target)).toString();
    console.log(params);
    const data = await request(`/books/search?${params}`);
    document.getElementById('searchOutput').textContent = JSON.stringify(data, null, 2);
});

