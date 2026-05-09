// UI Logic & Toast System
window.toast = {
  show: (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'info';
    if(type === 'success') icon = 'check-circle';
    if(type === 'error') icon = 'alert-triangle';

    toast.innerHTML = `
      <i data-lucide="${icon}"></i>
      <span style="font-weight: 600; font-size: 0.9rem;">${message}</span>
    `;
    
    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
      toast.style.animation = 'slideIn 0.4s reverse forwards';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }
};

// Global Listeners & Observers
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // Observer for dynamic content to re-init icons
    const viewContainer = document.getElementById('view-container');
    if (viewContainer) {
        const observer = new MutationObserver(() => lucide.createIcons());
        observer.observe(viewContainer, { childList: true });
    }

    // Modal close logic
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            document.getElementById('modal-wrapper').style.display = 'none';
        });
    }
});
