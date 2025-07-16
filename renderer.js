document.addEventListener('DOMContentLoaded', () => {
    const openSecondWindowBtn = document.getElementById('openSecondWindowBtn');

    openSecondWindowBtn.addEventListener('click', () => {
        // Panggil fungsi yang diekspos melalui preload.js
        window.electronAPI.openSecondWindow();
    });
});