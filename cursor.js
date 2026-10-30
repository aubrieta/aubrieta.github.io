(() => {
    const finePointer = matchMedia('(any-hover: hover) and (any-pointer: fine)');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const forcedColors = matchMedia('(forced-colors: active)');
    const colors = ['#b586ce', '#a6ece3', '#edb6f6', '#ffe18c'];
    let layer;
    let press = null;
    let lastTrail = null;
    let colorIndex = 0;
    let trailIndex = 0;
    let burstIndex = 0;

    const canAnimate = () => finePointer.matches && !reducedMotion.matches && !forcedColors.matches;

    function clearEffects() {
        layer?.remove();
        layer = null;
        press = null;
        lastTrail = null;
    }

    function particle(x, y, dx, dy, type = '', shape = 'star') {
        if (!layer) {
            layer = document.createElement('div');
            layer.className = 'cursor-effects';
            layer.setAttribute('aria-hidden', 'true');
            document.body.append(layer);
        }
        // Bound the work even during rapid clicks; animations need no render loop.
        if (layer.childElementCount >= 32) layer.firstElementChild.remove();
        const dot = document.createElement('span');
        dot.className = `cursor-particle${type ? ` cursor-particle--${type}` : ''}${shape === 'heart' ? ' cursor-particle--heart' : ''}`;
        dot.style.setProperty('--x', `${x}px`);
        dot.style.setProperty('--y', `${y}px`);
        dot.style.setProperty('--dx', `${dx}px`);
        dot.style.setProperty('--dy', `${dy}px`);
        dot.style.setProperty('--particle-color', colors[colorIndex++ % colors.length]);
        dot.addEventListener('animationend', () => dot.remove(), { once: true });
        layer.append(dot);
    }

    document.addEventListener('pointermove', event => {
        if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) press = null;
        if (event.pointerType !== 'mouse' || !canAnimate() || event.buttons) return;
        const now = performance.now();
        if (!lastTrail) {
            lastTrail = { x: event.clientX, y: event.clientY, time: now };
            return;
        }
        if (now - lastTrail.time < 70 || Math.hypot(event.clientX - lastTrail.x, event.clientY - lastTrail.y) < 26) return;
        // Keep reading and text selection quiet; twinkle over desktop chrome and controls.
        if (!event.target.closest('p, h1, h2, h3, li, dt, dd, figcaption, input, textarea, [contenteditable]') || event.target.closest('a, button')) {
            particle(event.clientX - 6, event.clientY + 16, -5, 13, 'sparkle', trailIndex++ % 2 ? 'heart' : 'star');
        }
        lastTrail = { x: event.clientX, y: event.clientY, time: now };
    }, { passive: true });

    document.addEventListener('pointerdown', event => {
        press = event.pointerType === 'mouse' && event.button === 0 && canAnimate()
            ? { id: event.pointerId, x: event.clientX, y: event.clientY }
            : null;
    }, { capture: true, passive: true });

    document.addEventListener('pointerup', event => {
        const start = press;
        press = null;
        if (!start || start.id !== event.pointerId || !canAnimate()) return;
        // A window drag or text selection is not a click.
        if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;
        if (event.target.closest(':disabled, [aria-disabled="true"], input, textarea, [contenteditable]')) return;
        particle(event.clientX, event.clientY, 0, 0, 'burst', burstIndex++ % 2 ? 'heart' : 'star');
        for (let i = 0; i < 8; i++) {
            const angle = i * Math.PI / 4;
            const distance = i % 2 ? 34 : 44;
            particle(event.clientX, event.clientY, Math.cos(angle) * distance, Math.sin(angle) * distance, i % 2 ? '' : 'sparkle', i % 2 ? 'heart' : 'star');
        }
    }, { capture: true, passive: true });

    document.addEventListener('pointercancel', () => { press = null; }, { passive: true });
    document.documentElement.addEventListener('pointerleave', clearEffects);
    window.addEventListener('blur', clearEffects);
    window.addEventListener('pagehide', clearEffects);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearEffects();
    });
    [finePointer, reducedMotion, forcedColors].forEach(query => query.addEventListener('change', clearEffects));
})();
