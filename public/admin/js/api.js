const API_BASE_URL = window.location.origin;

const storage = {
    setToken: (token) => localStorage.setItem('admin_token', token),
    getToken: () => localStorage.getItem('admin_token'),
    setUser: (user) => localStorage.setItem('admin_user', JSON.stringify(user)),
    getUser: () => JSON.parse(localStorage.getItem('admin_user')),
    clear: () => localStorage.removeItem('admin_token') || localStorage.removeItem('admin_user')
};

async function apiRequest(endpoint, method = 'GET', body = null) {
    const token = storage.getToken();
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (response.status === 401) {
            storage.clear();
            location.reload();
            return;
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
