import sal from 'sal.js';

export default {
	init() {
		window.sal = sal;

		const animation = sal({
			threshold: 0.05,
			once: true,
			selector: '[data-animate], [data-counter]',
			animateClassName: 'animate',
			disabledClassName: 'animate-disabled',
			rootMargin: '50px',
		});

		document.documentElement.classList.remove('animate-disabled');

		window.scrollAnimation = animation;
	},
};
