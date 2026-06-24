const form = document.querySelector('#waitlist-form');
const statusEl = document.querySelector('.form-status');

function runAnimations() {
    if (!window.gsap) {
        document.documentElement.classList.add('no-gsap');
        document.documentElement.dataset.motion = 'fallback';
        return;
    }

    const { gsap } = window;
    document.documentElement.dataset.motion = 'gsap';

    if (window.ScrollTrigger) {
        gsap.registerPlugin(window.ScrollTrigger);
    }

    gsap.from('.site-header', {
        y: -24,
        opacity: 0,
        duration: 0.65,
        ease: 'power3.out',
    });

    gsap.from('.reveal', {
        y: 34,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
    });

    gsap.to('.hero-visual img', {
        y: -16,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
    });

    gsap.to('.sensor-card-one', {
        x: 10,
        y: -8,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
    });

    gsap.to('.sensor-card-two', {
        x: -8,
        y: 10,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
    });

    if (window.ScrollTrigger) {
        gsap.utils
            .toArray(
                '.feature-card, .pod-list span, .reserve-copy, .waitlist-form'
            )
            .forEach((el) => {
                gsap.from(el, {
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 84%',
                    },
                    y: 36,
                    opacity: 0,
                    duration: 0.7,
                    ease: 'power3.out',
                });
            });
    }
}

async function submitWaitlist(event) {
    event.preventDefault();

    const button = form.querySelector('button');
    const data = Object.fromEntries(new FormData(form).entries());
    button.disabled = true;
    statusEl.textContent = 'Saving your spot...';

    try {
        const response = await fetch('/api/waitlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const payload = await response.json();
        statusEl.textContent = payload.message;

        if (payload.ok) {
            form.reset();
            if (window.gsap) {
                window.gsap.fromTo(
                    statusEl,
                    { scale: 0.96 },
                    { scale: 1, duration: 0.25, ease: 'back.out(2)' }
                );
            }
        }
    } catch (error) {
        statusEl.textContent = 'Could not reach the server. Please try again.';
    } finally {
        button.disabled = false;
    }
}

form.addEventListener('submit', submitWaitlist);

if (document.readyState === 'complete') {
    runAnimations();
} else {
    window.addEventListener('load', runAnimations);
}
