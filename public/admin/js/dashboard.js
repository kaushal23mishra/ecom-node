const viewContainer = document.getElementById('view-container');
let livePoller = null;
let statsChart = null;

const UI = {
    renderView: (title, subtitle, badge, content) => {
        viewContainer.innerHTML = `
            <div class="welcome-section">
                <div class="badge">${badge}</div>
                <h1 style="font-family: 'Outfit', sans-serif;">${title}</h1>
                <p>${subtitle}</p>
            </div>
            ${content}
        `;
        lucide.createIcons();
    },
    showLoading: () => {
        viewContainer.innerHTML = `
            <div style="height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem;">
                <div class="logo-box spin" style="width: 60px; height: 60px; background: rgba(99, 102, 241, 0.1); border: 1px solid var(--primary);">
                    <i data-lucide="loader-2" style="color: var(--primary); width: 30px; height: 30px;"></i>
                </div>
                <div style="font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 2px; font-size: 0.8rem;">Establishing Secure Connection</div>
            </div>
        `;
        lucide.createIcons();
    }
};

const VIEWS = {
    dashboard: async () => {
        const user = storage.getUser();
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good Morning' : (hour < 18 ? 'Good Afternoon' : 'Good Evening');

        UI.renderView(`${greeting}, ${user.username}`, "Your enterprise API engine is running optimally. Monitoring 48 node clusters.", "Session Active • Real-time Monitoring", `
            <div class="stats-container">
                <div class="stat-card">
                    <div class="stat-icon icon-blue"><i data-lucide="users"></i></div>
                    <div class="stat-info"><div class="label">Total Customers</div><div class="value" id="count-users">---</div></div>
                    <div style="margin-top: 1.5rem; font-size: 0.8rem; color: var(--success); font-weight: 700; display: flex; align-items: center; gap: 5px;">
                        <i data-lucide="trending-up" style="width: 14px;"></i> +12.5% this week
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon icon-purple"><i data-lucide="package"></i></div>
                    <div class="stat-info"><div class="label">Inventory Items</div><div class="value" id="count-products">---</div></div>
                    <div style="margin-top: 1.5rem; font-size: 0.8rem; color: var(--text-muted); font-weight: 700;">Last updated 2m ago</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon icon-green"><i data-lucide="cpu"></i></div>
                    <div class="stat-info"><div class="label">Server Load</div><div class="value" id="server-load">---</div></div>
                    <div style="margin-top: 1.5rem; width: 100%; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px;">
                        <div id="load-progress" style="width: 0%; height: 100%; background: var(--success); border-radius: 2px; transition: width 1s;"></div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon icon-orange"><i data-lucide="zap"></i></div>
                    <div class="stat-info"><div class="label">Memory Usage</div><div class="value" id="server-mem">---</div></div>
                    <div id="mem-chart-mini" style="height: 40px; margin-top: 1rem;"></div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-bottom: 2.5rem;">
                <div class="table-card" style="padding: 2rem;">
                    <div class="chart-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.5rem; letter-spacing: -0.5px;">Performance Spectrum</h3>
                            <div style="color: var(--text-muted); font-size: 0.85rem; font-weight: 600;">Latency & Throughput (Live)</div>
                        </div>
                    </div>
                    <div style="height: 350px; margin-top: 2rem;"><canvas id="livePerformanceChart"></canvas></div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 2rem;">
                    <div class="stat-card" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border: none; padding: 2.5rem; text-align: center;">
                        <div class="logo-box" style="width: 70px; height: 70px; margin: 0 auto 2rem; background: rgba(255,255,255,0.1);">
                            <i data-lucide="activity" style="width: 35px; height: 35px; color: white;"></i>
                        </div>
                        <h2 style="color: white; font-size: 2rem; font-family: 'Outfit', sans-serif; margin-bottom: 0.5rem;">System: Healthy</h2>
                        <div style="width: 100%; margin-top: 2rem; background: rgba(0,0,0,0.2); border-radius: 16px; padding: 1rem;">
                             <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-bottom: 0.5rem;">
                                <span>Uptime</span><span id="uptime-val" style="color: #fff;">---</span>
                             </div>
                             <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.3); border-radius: 3px; overflow: hidden;">
                                <div style="width: 100%; height: 100%; background: linear-gradient(to right, var(--success), #34d399); border-radius: 3px;"></div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        // Initialize Charts
        const ctx = document.getElementById('livePerformanceChart').getContext('2d');
        statsChart = new Chart(ctx, {
            type: 'line',
            data: { labels: Array(20).fill(''), datasets: [{ data: Array(20).fill(0), borderColor: '#6366f1', borderWidth: 3, pointRadius: 0, tension: 0.4, fill: true, backgroundColor: 'rgba(99, 102, 241, 0.05)' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(255,255,255,0.03)' }, beginAtZero: true, max: 100 } }, animation: { duration: 1000, easing: 'linear' } }
        });

        const updateStats = async () => {
            try {
                const [userRes, productRes, systemRes] = await Promise.all([
                    apiRequest('/admin/user/list', 'POST', { options: { limit: 1 } }),
                    apiRequest('/admin/product/list', 'POST', { options: { limit: 1 } }),
                    apiRequest('/admin/system/info', 'GET')
                ]);
                if (userRes?.data?.paginator) document.getElementById('count-users').innerText = userRes.data.paginator.itemCount ?? 0;
                if (productRes?.data?.paginator) document.getElementById('count-products').innerText = productRes.data.paginator.itemCount ?? 0;
                if (systemRes?.data) {
                    const sys = systemRes.data;
                    const load = Math.round(sys.os.loadavg[0] * 100);
                    const memPercent = Math.round(((sys.os.totalMemory - sys.os.freeMemory) / sys.os.totalMemory) * 100);
                    document.getElementById('server-load').innerText = `${load}%`;
                    document.getElementById('load-progress').style.width = `${load}%`;
                    document.getElementById('server-mem').innerText = `${memPercent}% Used`;
                    document.getElementById('uptime-val').innerText = `${Math.round(sys.process.uptime / 60)}m ${Math.round(sys.process.uptime % 60)}s`;
                    if (statsChart) { statsChart.data.datasets[0].data.shift(); statsChart.data.datasets[0].data.push(load); statsChart.update('none'); }
                }
            } catch (e) {}
        };
        updateStats();
        livePoller = setInterval(updateStats, 2000);
    },
    users: async () => {
        UI.renderView("User Management", "Manage application access and user profiles across all platforms.", "Directory", `
            <div class="table-card animate-slide-up">
                <div class="table-header"><h3>Customer Database</h3><button class="btn-action">+ Create Profile</button></div>
                <table class="custom-table">
                    <thead><tr><th>User Identity</th><th>Communication</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody id="user-table-body"><tr><td colspan="5" style="text-align:center; padding: 4rem;">Syncing...</td></tr></tbody>
                </table>
            </div>
        `);
        const res = await apiRequest('/admin/user/list', 'POST', { options: { limit: 50 } });
        if (res?.data?.data) {
            document.getElementById('user-table-body').innerHTML = res.data.data.map(u => `
                <tr>
                    <td><div class="user-cell"><div class="name">${u.username}</div></div></td>
                    <td>${u.email}</td>
                    <td>${u.userType === 2 ? 'Admin' : 'Client'}</td>
                    <td><span class="badge ${u.isActive ? 'badge-active' : 'badge-inactive'}">${u.isActive ? 'Active' : 'Suspended'}</span></td>
                    <td><button data-delete-user data-id="${u.id || u._id}" data-name="${u.username}" class="btn-icon-soft"><i data-lucide="trash-2"></i></button></td>
                </tr>
            `).join('');
            lucide.createIcons();
            document.querySelector('.btn-action').onclick = handleAddUser;
            document.querySelectorAll('[data-delete-user]').forEach(btn => btn.onclick = () => handleDeleteUser(btn.dataset.id, btn.dataset.name));
        }
    },
    products: async () => {
        UI.renderView("Catalog Control", "Manage products, stock levels, and category mappings.", "Inventory", `
            <div class="table-card animate-slide-up">
                <div class="table-header"><h3>Global Inventory</h3><button class="btn-action">+ New Product</button></div>
                <table class="custom-table">
                    <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                    <tbody id="product-table-body"><tr><td colspan="5" style="text-align:center; padding: 4rem;">Loading...</td></tr></tbody>
                </table>
            </div>
        `);
        const res = await apiRequest('/admin/product/list', 'POST', { options: { limit: 20 } });
        if (res?.data?.data) {
            document.getElementById('product-table-body').innerHTML = res.data.data.map(p => `
                <tr>
                    <td>${p.name}</td><td>${p.category || 'General'}</td><td>$${p.price}</td>
                    <td>${p.stock} PCS</td>
                    <td><button data-delete-product data-id="${p.id || p._id}" data-name="${p.name}" class="btn-icon-soft"><i data-lucide="trash-2"></i></button></td>
                </tr>
            `).join('');
            lucide.createIcons();
            document.querySelector('.btn-action').onclick = handleAddProduct;
            document.querySelectorAll('[data-delete-product]').forEach(btn => btn.onclick = () => handleDeleteProduct(btn.dataset.id, btn.dataset.name));
        }
    }
};

const modal = {
    wrapper: document.getElementById('modal-wrapper'),
    show: (title, content) => {
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-body').innerHTML = content;
        modal.wrapper.style.display = 'flex';
        lucide.createIcons();
    },
    hide: () => { modal.wrapper.style.display = 'none'; }
};

async function handleAddUser() {
    modal.show('Add New User', `
        <form id="add-user-form" class="modal-content">
            <input type="text" id="new-username" placeholder="Username" required style="margin-bottom:1rem; width:100%;">
            <input type="email" id="new-email" placeholder="Email" required style="margin-bottom:1rem; width:100%;">
            <input type="password" id="new-password" placeholder="Password" required style="margin-bottom:1rem; width:100%;">
            <button type="submit" class="btn-action" style="width:100%;">Create Account</button>
        </form>
    `);
    document.getElementById('add-user-form').onsubmit = async (e) => {
        e.preventDefault();
        const res = await apiRequest('/admin/user/create', 'POST', { username: e.target[0].value, email: e.target[1].value, password: e.target[2].value, userType: 1 });
        if (res.status === 'SUCCESS') { modal.hide(); VIEWS.users(); }
    };
}

async function handleDeleteUser(id, name) {
    if (confirm(`Delete ${name}?`)) {
        const res = await apiRequest(`/admin/user/delete/${id}`, 'DELETE');
        if (res.status === 'SUCCESS') VIEWS.users();
    }
}

async function handleAddProduct() {
    modal.show('Add Product', `
        <form id="add-product-form" class="modal-content">
            <input type="text" id="p-name" placeholder="Name" required style="margin-bottom:1rem; width:100%;">
            <input type="number" id="p-price" placeholder="Price" required style="margin-bottom:1rem; width:100%;">
            <input type="number" id="p-stock" placeholder="Stock" required style="margin-bottom:1rem; width:100%;">
            <button type="submit" class="btn-action" style="width:100%;">Add Product</button>
        </form>
    `);
    document.getElementById('add-product-form').onsubmit = async (e) => {
        e.preventDefault();
        const res = await apiRequest('/admin/product/create', 'POST', { name: e.target[0].value, price: parseInt(e.target[1].value), stock: parseInt(e.target[2].value) });
        if (res.status === 'SUCCESS') { modal.hide(); VIEWS.products(); }
    };
}

async function handleDeleteProduct(id, name) {
    if (confirm(`Delete ${name}?`)) {
        const res = await apiRequest(`/admin/product/delete/${id}`, 'DELETE');
        if (res.status === 'SUCCESS') VIEWS.products();
    }
}

async function loadView(viewName) {
    if (livePoller) clearInterval(livePoller);
    UI.showLoading();
    if (VIEWS[viewName]) await VIEWS[viewName]();
}

document.querySelectorAll('.nav-item[data-view]').forEach(link => link.onclick = () => loadView(link.dataset.view));
if (storage.getToken()) loadView('dashboard');
