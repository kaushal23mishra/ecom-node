document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = 'Verifying...';
    btn.disabled = true;

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await apiRequest('/admin/auth/login', 'POST', { username, password });

        if (response.status === 'SUCCESS') {
            storage.setToken(response.data.token);
            storage.setUser(response.data);
            window.toast.show('Access Granted. Welcome back!', 'success');
            setTimeout(() => initApp(), 500);
        } else {
            window.toast.show(response.message || 'Authentication Failed', 'error');
        }
    } catch (err) {
        window.toast.show('Connectivity Error: API unreachable', 'error');
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});

function initApp() {
    const token = storage.getToken();
    const user = storage.getUser();

    if (token && user) {
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('admin-shell').style.display = 'block'; 
        document.getElementById('user-display').innerText = user.username;
        document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&bold=true&rounded=true`;
        loadView('dashboard');
    } else {
        document.getElementById('login-view').style.display = 'flex';
        document.getElementById('admin-shell').style.display = 'none';
    }
}

document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    storage.clear();
    location.reload(); // Hard refresh for clean state
});

// Initial boot
initApp();
