/**
 * Debounce and throttle function's decorator plugin 1.0.5
 *
 * Copyright (c) 2009 Filatov Dmitry (alpha@zforms.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

(() => {
	window._throttle = function (fn, timeout, ctx) {
		let timer;
		let args;
		let needInvoke;

		return function () {
			args = arguments;
			needInvoke = true;
			ctx = ctx || this;

			if (!timer) {
				(function () {
					if (needInvoke) {
						fn.apply(ctx, args);
						needInvoke = false;
						timer = setTimeout(arguments.callee, timeout);
					} else {
						timer = null;
					}
				})();
			}
		};
	};

	window._debounce = function (fn, timeout, invokeAsap, ctx) {
		let timer;

		if (arguments.length === 3 && typeof invokeAsap !== 'boolean') {
			ctx = invokeAsap;
			invokeAsap = false;
		}

		return function () {
			const args = arguments;
			ctx = ctx || this;

			invokeAsap && !timer && fn.apply(ctx, args);

			clearTimeout(timer);

			timer = setTimeout(() => {
				!invokeAsap && fn.apply(ctx, args);
				timer = null;
			}, timeout);
		};
	};
})();
