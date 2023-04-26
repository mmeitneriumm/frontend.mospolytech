(function() {
	var arr = [window.Element, window.CharacterData, window.DocumentType];
	var args = [];

	arr.forEach(function (item) {
		if (item) {
			args.push(item.prototype);
		}
	});

	// from:https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
	(function (arr) {
		arr.forEach(function (item) {
			if (item.hasOwnProperty('remove')) {
				return;
			}
			Object.defineProperty(item, 'remove', {
				configurable: true,
				enumerable: true,
				writable: true,
				value: function remove() {
					this.parentNode.removeChild(this);
				}
			});
		});
	})(args);
})();
