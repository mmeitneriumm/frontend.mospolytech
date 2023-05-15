/* eslint-disable */

import './polyfills';
import './utils/throttle';
import './utils/slideToggle';
import './utils/scroll';
import './utils/userAgent';

import Menu from "./components/menu";

import libs from'./libs';



import { devices } from './utils/breakpoints';



window.UPB = window.UPB || {};
window.breakpoints = devices;

__webpack_public_path__ = window.__webpack_public_path__ || '';

document.addEventListener('DOMContentLoaded', () => {
	document.documentElement.classList.add('content-loaded');
    libs.init();
    Menu.init();
})
