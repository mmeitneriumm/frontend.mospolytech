import smoothscroll from 'smoothscroll-polyfill';
// kick off the polyfill!
smoothscroll.polyfill();

window._disableScroll = () => {
	const scrollY = window.pageYOffset;
	const { body } = document;
	body.style.position = 'fixed';
	body.style.top = `-${scrollY}px`;
};
window._enableScroll = () => {
	const { body } = document;
	const scrollY = body.style.top;
	body.style.position = '';
	body.style.top = '';
	window.scrollTo(0, parseInt(scrollY || '0') * -1);
};
