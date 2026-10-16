const directory = document.querySelector('.directory-window');
const views = document.querySelectorAll('button[data-view]');
views.forEach(button => {
    button.addEventListener('click', () => {
        directory.dataset.view = button.dataset.view;
        views.forEach(view => view.setAttribute('aria-pressed', String(view === button)));
    });
});

const embedded = window.parent !== window && new URLSearchParams(location.search).get('embedded') === '1';
if (embedded) {
    document.body.classList.add('embedded-directory');
    document.addEventListener('pointerdown', () => window.parent.postMessage('focus-lists-folder', location.origin));
    document.querySelectorAll('a[href="../index.html"]').forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            window.parent.postMessage('close-lists-folder', location.origin);
        });
    });
    document.querySelectorAll('.file').forEach(link => { link.target = '_top'; });
} else {
    location.replace('../index.html#lists');
}
