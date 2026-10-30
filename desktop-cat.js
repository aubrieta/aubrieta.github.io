(() => {
    const walkway = document.querySelector('#cat-walkway');
    if (!walkway) return;
    const cat = walkway.querySelector('.desktop-cat');
    const thought = walkway.querySelector('.cat-thought');
    const napToggle = walkway.querySelector('.cat-nap-toggle');
    const status = walkway.querySelector('.cat-status');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const reactions = ['purrr ♥', 'mrrp!', 'thank mew ♥', 'a good day.'];
    let x = 0;
    let maxX = 0;
    let target = 0;
    let measured = false;
    let hovered = false;
    let keyboardFocused = false;
    let napping = false;
    let reacting = false;
    let reactionIndex = 0;
    let stops = 0;
    let actionTimer;
    let reactionTimer;
    let frame;
    let lastTime;

    const canWander = () => !napping && !reducedMotion.matches && !document.hidden && !hovered && !keyboardFocused && !reacting;

    function stopWandering() {
        clearTimeout(actionTimer);
        cancelAnimationFrame(frame);
        frame = null;
        lastTime = null;
    }

    function setPose(pose, message = '') {
        cat.dataset.state = pose;
        thought.textContent = message;
        thought.hidden = !message;
        placeThought();
    }

    function placeThought() {
        if (thought.hidden) return;
        const bubbleWidth = thought.offsetWidth;
        const roomRight = napToggle.offsetLeft - 10 - (8 + x + cat.offsetWidth - 2);
        cat.dataset.bubbleSide = roomRight < bubbleWidth && x + 2 >= bubbleWidth ? 'left' : 'right';
    }

    function place() {
        cat.style.setProperty('--cat-x', `${Math.round(x)}px`);
        placeThought();
    }

    function measure() {
        maxX = Math.max(0, walkway.clientWidth - napToggle.offsetWidth - cat.offsetWidth - 32);
        if (!measured) {
            x = maxX * .65;
            measured = true;
        }
        x = Math.max(0, Math.min(maxX, x));
        target = Math.max(0, Math.min(maxX, target));
        place();
    }

    function scheduleWalk(delay) {
        clearTimeout(actionTimer);
        if (canWander()) actionTimer = setTimeout(walk, delay);
    }

    function rest() {
        stopWandering();
        if (napping || stops % 3 === 1) {
            setPose('sleeping', 'z z z');
            scheduleWalk(8500 + Math.random() * 3500);
        } else {
            setPose('sitting');
            scheduleWalk(2200 + Math.random() * 2500);
        }
    }

    function step(now) {
        if (!canWander()) {
            stopWandering();
            return;
        }
        const dt = lastTime == null ? 0 : Math.min((now - lastTime) / 1000, .08);
        lastTime = now;
        const direction = Math.sign(target - x);
        const distance = Math.min(Math.abs(target - x), dt * 25);
        x += direction * distance;
        place();
        if (Math.abs(target - x) < 1) {
            stops++;
            rest();
        } else {
            frame = requestAnimationFrame(step);
        }
    }

    function walk() {
        stopWandering();
        if (!canWander() || maxX < 20) return;
        const distance = 60 + Math.random() * 100;
        const direction = x > maxX * .65 ? -1 : x < maxX * .35 ? 1 : Math.random() < .5 ? -1 : 1;
        target = Math.max(0, Math.min(maxX, x + direction * distance));
        cat.style.setProperty('--cat-facing', target >= x ? '1' : '-1');
        setPose('walking');
        frame = requestAnimationFrame(step);
    }

    function hold() {
        stopWandering();
        if (!reacting && cat.dataset.state === 'walking') setPose('curious');
    }

    function resume() {
        if (reacting || document.hidden) return;
        if (napping) {
            setPose('sleeping', 'z z z');
        } else if (reducedMotion.matches) {
            setPose('sitting');
        } else {
            scheduleWalk(cat.dataset.state === 'sleeping' ? 5500 : 1200);
        }
    }

    cat.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
        hovered = true;
        hold();
    });
    cat.addEventListener('pointerleave', () => {
        hovered = false;
        resume();
    });
    cat.addEventListener('focus', () => {
        keyboardFocused = cat.matches(':focus-visible');
        if (keyboardFocused) hold();
    });
    cat.addEventListener('blur', () => {
        keyboardFocused = false;
        resume();
    });
    cat.addEventListener('click', () => {
        stopWandering();
        clearTimeout(reactionTimer);
        reacting = true;
        setPose('petted', reactions[reactionIndex++ % reactions.length]);
        status.textContent = 'The little cat purrs. It liked that.';
        reactionTimer = setTimeout(() => {
            reacting = false;
            setPose(napping ? 'sleeping' : 'sitting', napping ? 'z z z' : '');
            resume();
        }, 1900);
    });
    napToggle.addEventListener('click', () => {
        napping = !napping;
        reacting = false;
        clearTimeout(reactionTimer);
        stopWandering();
        napToggle.setAttribute('aria-pressed', String(napping));
        napToggle.setAttribute('aria-label', napping ? 'Wake the cat' : 'Let the cat nap');
        napToggle.textContent = napping ? 'wake up' : 'nap';
        measure();
        setPose(napping ? 'sleeping' : 'sitting', napping ? 'z z z' : '');
        status.textContent = napping ? 'The little cat curls up for a nap.' : 'The little cat is awake.';
        resume();
    });

    function suspend() {
        stopWandering();
        clearTimeout(reactionTimer);
        reacting = false;
    }
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) suspend();
        else {
            setPose(napping ? 'sleeping' : 'sitting', napping ? 'z z z' : '');
            resume();
        }
    });
    reducedMotion.addEventListener('change', () => {
        suspend();
        setPose(napping ? 'sleeping' : 'sitting', napping ? 'z z z' : '');
        resume();
    });
    window.addEventListener('pagehide', suspend);
    window.addEventListener('pageshow', resume);

    walkway.hidden = false;
    new ResizeObserver(measure).observe(walkway);
    measure();
    document.fonts.ready.then(measure);
    scheduleWalk(1500);
})();
