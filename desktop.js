const clock = document.querySelector('#desktop-clock');
function updateClock() {
    if (!clock) return;
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    clock.dateTime = now.toISOString();
}
updateClock();
if (clock) setInterval(updateClock, 30000);
document.querySelectorAll('button.hover-swap').forEach(button => {
    button.addEventListener('click', () => {
        button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
    });
});

const workspace = document.querySelector('.workspace');
const scene = document.querySelector('.desktop-scene');
const shortcuts = document.querySelector('.desktop-shortcuts');
let sceneScale = 1;
let topLayer = 2;
const compactDesktop = window.matchMedia('(max-width: 540px)').matches;
const windows = [...document.querySelectorAll('.draggable-window')].map(element => ({
    element, handle: element.querySelector('.title-bar'),
    x: element.id === 'lists-window' ? 0 : compactDesktop ? 0 : element.id === 'painting-window' ? -80 : element.id === 'photo-window' ? 48 : -35,
    y: element.id === 'lists-window' ? 0 : compactDesktop ? (element.id === 'photo-window' ? 24 : 0) : element.id === 'painting-window' ? -210 : element.id === 'photo-window' ? 145 : 18
}));

function reservedTop() {
    return shortcuts.offsetTop + shortcuts.offsetHeight + 14;
}

function moveWindow(state, x, y) {
    if (state.element.parentElement.hidden) return;
    const scale = state.element.closest('.desktop-scene') ? sceneScale : 1;
    const bounds = workspace.getBoundingClientRect();
    const rect = state.element.getBoundingClientRect();
    const originX = rect.left - state.x * scale;
    const originY = rect.top - state.y * scale;
    const minX = (bounds.left + 6 - originX) / scale;
    const maxX = (bounds.right - 6 - rect.width - originX) / scale;
    const clampedX = Math.max(minX, Math.min(maxX, x));
    const nextLeft = originX + clampedX * scale;
    const icons = shortcuts.getBoundingClientRect();
    const topInset = nextLeft < icons.right && nextLeft + rect.width > icons.left ? reservedTop() : 12;
    const minY = (bounds.top + topInset - originY) / scale;
    const maxY = (bounds.bottom - 6 - rect.height - originY) / scale;
    state.x = clampedX;
    state.y = Math.max(minY, Math.min(maxY, y));
    state.element.style.setProperty('--window-x', `${state.x}px`);
    state.element.style.setProperty('--window-y', `${state.y}px`);
}

function fitDesktop() {
    const margin = 12;
    const top = reservedTop();
    const width = scene.offsetWidth;
    const height = scene.offsetHeight;
    const availableHeight = Math.max(1, workspace.clientHeight - top - margin);
    sceneScale = Math.min(1, Math.max(1, workspace.clientWidth - margin * 2) / width, availableHeight / height);
    scene.style.transform = `scale(${sceneScale})`;
    scene.style.left = `${(workspace.clientWidth - width * sceneScale) / 2}px`;
    scene.style.top = `${top + (availableHeight - height * sceneScale) / 2}px`;
    windows.forEach(state => moveWindow(state, state.x, state.y));
}

if (scene && workspace && shortcuts) {
    const observer = new ResizeObserver(fitDesktop);
    [workspace, scene, shortcuts].forEach(element => observer.observe(element));
    document.fonts.ready.then(fitDesktop);
    fitDesktop();

    windows.forEach(state => {
        const { element, handle } = state;
        let drag = null;
        const defaultPosition = { x: state.x, y: state.y };
        const task = document.querySelector(`[data-window="${element.id}"]`);
        const isFolder = element.id === 'lists-window';
        const name = isFolder ? 'lists' : element.id === 'welcome' ? 'welcome' : element.id === 'painting-window' ? 'painting' : 'photo';
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'window-close';
        close.setAttribute('aria-label', `Close ${name} window`);
        close.title = `Close ${name} window`;
        close.textContent = '×';
        handle.append(close);
        close.addEventListener('click', event => {
            event.stopPropagation();
            element.style.visibility = 'hidden';
            element.inert = true;
            if (isFolder) {
                element.parentElement.hidden = true;
                if (location.hash === '#lists') history.replaceState(null, '', location.pathname + location.search);
            }
            task.setAttribute('aria-pressed', 'false');
            task.classList.remove('is-active');
            task.focus({ preventScroll: true });
        });
        state.show = () => {
            if (isFolder) {
                element.parentElement.hidden = false;
                task.hidden = false;
                history.replaceState(null, '', '#lists');
            }
            element.style.visibility = '';
            element.inert = false;
            task.setAttribute('aria-pressed', 'true');
            fitDesktop();
            raiseWindow();
            handle.focus({ preventScroll: true });
        };
        task.addEventListener('click', state.show);
        function raiseWindow() {
            element.parentElement.style.zIndex = ++topLayer;
            if (!isFolder) scene.style.zIndex = ++topLayer;
            windows.forEach(window => window.handle.classList.toggle('active', window === state));
            document.querySelectorAll('.task-tab').forEach(button => button.classList.toggle('is-active', button === task));
        }
        state.activate = raiseWindow;
        element.addEventListener('pointerdown', raiseWindow);
        handle.addEventListener('pointerdown', event => {
            if (event.button !== 0 || event.target.closest('button')) return;
            event.preventDefault();
            handle.focus({ preventScroll: true });
            handle.setPointerCapture(event.pointerId);
            drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: state.x, y: state.y };
            handle.classList.add('is-dragging');
        });
        handle.addEventListener('pointermove', event => {
            if (!drag || drag.id !== event.pointerId) return;
            const scale = isFolder ? 1 : sceneScale;
            moveWindow(state, drag.x + (event.clientX - drag.startX) / scale,
                drag.y + (event.clientY - drag.startY) / scale);
        });
        function endDrag() {
            drag = null;
            handle.classList.remove('is-dragging');
        }
        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => handle.addEventListener(type, endDrag));
        handle.addEventListener('dblclick', event => {
            if (!event.target.closest('button')) moveWindow(state, defaultPosition.x, defaultPosition.y);
        });
        handle.addEventListener('keydown', event => {
            if (event.target !== handle) return;
            const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
            if (event.key === 'Home') {
                event.preventDefault();
                moveWindow(state, defaultPosition.x, defaultPosition.y);
            } else if (directions[event.key]) {
                event.preventDefault();
                raiseWindow();
                const step = event.shiftKey ? 2 : 10;
                const [x, y] = directions[event.key];
                moveWindow(state, state.x + x * step, state.y + y * step);
            }
        });
    });
}

const listsWindow = windows.find(state => state.element.id === 'lists-window');
if (listsWindow) {
    document.querySelectorAll('a[href="lists/index.html"]').forEach(link => {
        link.addEventListener('click', event => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            event.preventDefault();
            listsWindow.show();
        });
    });
    window.addEventListener('message', event => {
        const frame = listsWindow.element.querySelector('iframe');
        if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
        if (event.data === 'close-lists-folder') listsWindow.handle.querySelector('.window-close').click();
        if (event.data === 'focus-lists-folder') listsWindow.activate();
    });
    if (location.hash === '#lists') listsWindow.show();
    window.addEventListener('hashchange', () => {
        if (location.hash === '#lists') listsWindow.show();
    });
}
