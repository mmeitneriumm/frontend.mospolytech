/* eslint-disable */

export default {
	init() {
		const burger = document.querySelector('.burger');

		burger.addEventListener('click', () => {
			burger.classList.toggle('active');
		});
	}
}