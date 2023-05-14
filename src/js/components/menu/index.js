/* eslint-disable */

export default {
	init() {
		const burger = document.querySelector('.burger');
		const menu = document.querySelector('.menu');

		burger.addEventListener('click', () => {
			burger.classList.toggle('active');
			menu.classList.toggle('active');
		});
	}
}