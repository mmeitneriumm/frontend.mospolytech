import { CountUp } from 'countup.js';

export default {
	init() {
		const elements = document.querySelectorAll('[data-counter]');
		if (!elements.length) return;

		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];

			const initValue = element.getAttribute('data-counter') || element.innerHTML;

			let endValue = 0;
			let decimal = '';
			let decimalPlaces = 0;
			const duration = 3;

			if (initValue.split('.').length > 1) {
				decimal = '.';
				decimalPlaces = initValue.split('.')[1].trim().length;
				endValue = initValue.replace(/ +/g, '').trim();
			} else if (initValue.split(',').length > 1) {
				decimal = ',';
				decimalPlaces = initValue.split(',')[1].trim().length;
				endValue = initValue.replace(/\,/g, '.').replace(/ +/g, '').trim();
			} else if (initValue.split(' ').length > 1) {
				decimal = ' ';
				endValue = initValue.replace(/ +/g, '').trim();
			} else {
				decimal = '';
				endValue = initValue.trim();
			}

			this.setMinWidth(element);

			const options = {
				startVal: 0,
				separator: ' ',
				decimal,
				decimalPlaces,
				duration,
			};

			const count = new CountUp(element, endValue, options);

			if (element.classList.contains('animate')) {
				count.start();
			}
			element.addEventListener('sal:in', () => {
				count.start();
			});
			element.addEventListener('sal:out', () => {
				count.reset();
			});
		}
	},

	setMinWidth(el) {
		const width = el.scrollWidth;
		const fz = parseInt(window.getComputedStyle(document.querySelector('html'), null)
			.getPropertyValue('font-size'), 10);

		el.setAttribute('style', `min-width: ${(width / fz).toFixed(1)}rem`);
	},
};
