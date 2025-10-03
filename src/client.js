const API_URL = '';

const request = async(url, options = {}) => {
    const response = await fetch(url, {
        headers: {'Accept': 'application/json', ...options.headers},
        ...options,
    });
    const text = await response.text();
    return text ? JSON.parse(text) : {};
};

document.getElementById('loadBooks').addEventListener('click', async() => {
    const data = await request('/books');
    document.getElementById('booksOutput').textContent = JSON.stringify(data, null, 2);
});

