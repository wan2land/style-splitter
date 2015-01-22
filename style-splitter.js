;(function(global, factory){
	if (typeof exports === "object") {
		module.exports = factory();
	}
	else if ( typeof define === 'function' && define.amd ) {
		define(factory);
	}
	else {
		global.StyleSplitter = factory();
	}
})(this, function() {

	var
	indexOf = (function() {
		return Array.prototype.indexOf ? Array.prototype.indexOf : function(obj, start) {
			for (var i = (start || 0), j = this.length; i < j; i++) {
				if (this[i] === obj) { return i; }
			}
			return -1;
		}
	})(),
	isRegExp = function(value) {
		return Object.prototype.toString.call(value) === '[object RegExp]';
	},
	extend = function(origin){
		var targets = [].slice.call(arguments, 1);
		for (var i = 0, ilen = targets.length; i < ilen; i++) {
			var target = targets[i];
			for (var index in target) {
				if (target.hasOwnProperty(index)) {
					origin[index] = target[index];
				}
			}
		}
		return origin;
	},
	each = function(obj, closure) {
		var i, length, result;
		if (typeof obj.length !== 'undefined') {
			for (i = 0, length = obj.length; i < length; i++) {
				result = closure(obj[i], i, obj);
				if (result === false) return false;
			}
		} else {
			for (i in obj) {
				if (obj.hasOwnProperty(i)) {
					result = closure(obj[i], i, obj);
					if (result === false) return false;
				}
			}
		}
		return true;
	},
	compare = function(source, target) {
		if (source.length !== target.length) return false;
		for (var i = 0, ilen = target.length; i < ilen; i++) {
			if (indexOf.call(source, target[i]) === -1) return false;
		}
		for (var i = 0, ilen = source.length; i < ilen; i++) {
			if (indexOf.call(target, source[i]) === -1) return false;
		}
		return true;
	},
	domTraverse = function(node) {
		var elems= [];
		if (node) {
			node = node.firstChild;
			while (node != null) {
				if (
					node.innerHTML &&
					node.innerHTML == node.innerText &&
					node.nodeName !== 'SCRIPT'
				) {
					elems[elems.length] = node;
				}
				else {
					elems = elems.concat(domTraverse(node));
				}
				node = node.nextSibling;
			}
		}
		return elems;
	},
	defaultSettings = {
		en: /[a-zA-Z]/,
		no: /[0-9]/
	};

	var StyleSplitter = function(settings) {
		this.settings = extend({}, defaultSettings, settings || {});
	};
	StyleSplitter.prototype = {
		wrap: function(styles, contents) {
			if (styles.length === 0 && contents === '') return '';
			if (styles.length === 0) {
				return '<span class="ss">' + contents + '</span>';
			}
			return '<span class="ss ' + styles.join(' ') + '">' + contents + '</span>';
		},
		parse: function(text) {
			var
			self = this,
			parsedText = "",
			lastStyles = [],
			bufferString = '';

			each(text, function(ch) {
				if (/\s/.test(ch)) {
					parsedText += self.wrap(lastStyles, bufferString);
					parsedText += ch;
					lastStyles = [];
					bufferString = '';
					return;
				}

				var currentStyles = [];

				each(self.settings, function(regExp, key) {
					if (isRegExp(regExp) && regExp.test(ch)) currentStyles.push(key);
				});

				if (compare(lastStyles,currentStyles)) {
					bufferString += '' + ch;
				} else {
					parsedText += self.wrap(lastStyles, bufferString);
					lastStyles = currentStyles;
					bufferString = ch;
				}
			});
			parsedText += self.wrap(lastStyles, bufferString);
			return parsedText;
		},
		applyAll: function() {
			var
			self = this,
			elems = domTraverse(document.body);
			each(elems, function(elem) {
				if (elem.innerHTML === elem.innerText && elem.nodeName !== 'SCRIPT') {
					elem.innerHTML = self.parse(elem.innerText);
				}
			});
		}
	};

	return StyleSplitter;

});