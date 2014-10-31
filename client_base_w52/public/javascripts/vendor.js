(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
/*!
 * iScroll v4.2.5 ~ Copyright (c) 2012 Matteo Spinelli, http://cubiq.org
 * Released under MIT license, http://cubiq.org/license
 */
(function(window, doc){
var m = Math,
	dummyStyle = doc.createElement('div').style,
	vendor = (function () {
		var vendors = 't,webkitT,MozT,msT,OT'.split(','),
			t,
			i = 0,
			l = vendors.length;

		for ( ; i < l; i++ ) {
			t = vendors[i] + 'ransform';
			if ( t in dummyStyle ) {
				return vendors[i].substr(0, vendors[i].length - 1);
			}
		}

		return false;
	})(),
	cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '',

	// Style properties
	transform = prefixStyle('transform'),
	transitionProperty = prefixStyle('transitionProperty'),
	transitionDuration = prefixStyle('transitionDuration'),
	transformOrigin = prefixStyle('transformOrigin'),
	transitionTimingFunction = prefixStyle('transitionTimingFunction'),
	transitionDelay = prefixStyle('transitionDelay'),

    // Browser capabilities
	isAndroid = (/android/gi).test(navigator.appVersion),
	isIDevice = (/iphone|ipad/gi).test(navigator.appVersion),
	isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),

    has3d = prefixStyle('perspective') in dummyStyle,
    hasTouch = 'ontouchstart' in window && !isTouchPad,
    hasTransform = vendor !== false,
    hasTransitionEnd = prefixStyle('transition') in dummyStyle,

	RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
	START_EV = hasTouch ? 'touchstart' : 'mousedown',
	MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
	END_EV = hasTouch ? 'touchend' : 'mouseup',
	CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',
	TRNEND_EV = (function () {
		if ( vendor === false ) return false;

		var transitionEnd = {
				''			: 'transitionend',
				'webkit'	: 'webkitTransitionEnd',
				'Moz'		: 'transitionend',
				'O'			: 'otransitionend',
				'ms'		: 'MSTransitionEnd'
			};

		return transitionEnd[vendor];
	})(),

	nextFrame = (function() {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback) { return setTimeout(callback, 1); };
	})(),
	cancelFrame = (function () {
		return window.cancelRequestAnimationFrame ||
			window.webkitCancelAnimationFrame ||
			window.webkitCancelRequestAnimationFrame ||
			window.mozCancelRequestAnimationFrame ||
			window.oCancelRequestAnimationFrame ||
			window.msCancelRequestAnimationFrame ||
			clearTimeout;
	})(),

	// Helpers
	translateZ = has3d ? ' translateZ(0)' : '',

	// Constructor
	iScroll = function (el, options) {
		var that = this,
			i;

		that.wrapper = typeof el == 'object' ? el : doc.getElementById(el);
		that.wrapper.style.overflow = 'hidden';
		that.scroller = that.wrapper.children[0];

		// Default options
		that.options = {
			hScroll: true,
			vScroll: true,
			x: 0,
			y: 0,
			bounce: true,
			bounceLock: false,
			momentum: true,
			lockDirection: true,
			useTransform: true,
			useTransition: false,
			topOffset: 0,
			checkDOMChanges: false,		// Experimental
			handleClick: true,

			// Scrollbar
			hScrollbar: true,
			vScrollbar: true,
			fixedScrollbar: isAndroid,
			hideScrollbar: isIDevice,
			fadeScrollbar: isIDevice && has3d,
			scrollbarClass: '',

			// Zoom
			zoom: false,
			zoomMin: 1,
			zoomMax: 4,
			doubleTapZoom: 2,
			wheelAction: 'scroll',

			// Snap
			snap: false,
			snapThreshold: 1,

			// Events
			onRefresh: null,
			onBeforeScrollStart: function (e) { e.preventDefault(); },
			onScrollStart: null,
			onBeforeScrollMove: null,
			onScrollMove: null,
			onBeforeScrollEnd: null,
			onScrollEnd: null,
			onTouchEnd: null,
			onDestroy: null,
			onZoomStart: null,
			onZoom: null,
			onZoomEnd: null
		};

		// User defined options
		for (i in options) that.options[i] = options[i];

		// Set starting position
		that.x = that.options.x;
		that.y = that.options.y;

		// Normalize options
		that.options.useTransform = hasTransform && that.options.useTransform;
		that.options.hScrollbar = that.options.hScroll && that.options.hScrollbar;
		that.options.vScrollbar = that.options.vScroll && that.options.vScrollbar;
		that.options.zoom = that.options.useTransform && that.options.zoom;
		that.options.useTransition = hasTransitionEnd && that.options.useTransition;

		// Helpers FIX ANDROID BUG!
		// translate3d and scale doesn't work together!
		// Ignoring 3d ONLY WHEN YOU SET that.options.zoom
		if ( that.options.zoom && isAndroid ){
			translateZ = '';
		}

		// Set some default styles
		that.scroller.style[transitionProperty] = that.options.useTransform ? cssVendor + 'transform' : 'top left';
		that.scroller.style[transitionDuration] = '0';
		that.scroller.style[transformOrigin] = '0 0';
		if (that.options.useTransition) that.scroller.style[transitionTimingFunction] = 'cubic-bezier(0.33,0.66,0.66,1)';

		if (that.options.useTransform) that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px)' + translateZ;
		else that.scroller.style.cssText += ';position:absolute;top:' + that.y + 'px;left:' + that.x + 'px';

		if (that.options.useTransition) that.options.fixedScrollbar = true;

		that.refresh();

		that._bind(RESIZE_EV, window);
		that._bind(START_EV);
		if (!hasTouch) {
			if (that.options.wheelAction != 'none') {
				that._bind('DOMMouseScroll');
				that._bind('mousewheel');
			}
		}

		if (that.options.checkDOMChanges) that.checkDOMTime = setInterval(function () {
			that._checkDOMChanges();
		}, 500);
	};

// Prototype
iScroll.prototype = {
	enabled: true,
	x: 0,
	y: 0,
	steps: [],
	scale: 1,
	currPageX: 0, currPageY: 0,
	pagesX: [], pagesY: [],
	aniTime: null,
	wheelZoomCount: 0,

	handleEvent: function (e) {
		var that = this;
		switch(e.type) {
			case START_EV:
				if (!hasTouch && e.button !== 0) return;
				that._start(e);
				break;
			case MOVE_EV: that._move(e); break;
			case END_EV:
			case CANCEL_EV: that._end(e); break;
			case RESIZE_EV: that._resize(); break;
			case 'DOMMouseScroll': case 'mousewheel': that._wheel(e); break;
			case TRNEND_EV: that._transitionEnd(e); break;
		}
	},

	_checkDOMChanges: function () {
		if (this.moved || this.zoomed || this.animating ||
			(this.scrollerW == this.scroller.offsetWidth * this.scale && this.scrollerH == this.scroller.offsetHeight * this.scale)) return;

		this.refresh();
	},

	_scrollbar: function (dir) {
		var that = this,
			bar;

		if (!that[dir + 'Scrollbar']) {
			if (that[dir + 'ScrollbarWrapper']) {
				if (hasTransform) that[dir + 'ScrollbarIndicator'].style[transform] = '';
				that[dir + 'ScrollbarWrapper'].parentNode.removeChild(that[dir + 'ScrollbarWrapper']);
				that[dir + 'ScrollbarWrapper'] = null;
				that[dir + 'ScrollbarIndicator'] = null;
			}

			return;
		}

		if (!that[dir + 'ScrollbarWrapper']) {
			// Create the scrollbar wrapper
			bar = doc.createElement('div');

			if (that.options.scrollbarClass) bar.className = that.options.scrollbarClass + dir.toUpperCase();
			else bar.style.cssText = 'position:absolute;z-index:100;' + (dir == 'h' ? 'height:7px;bottom:1px;left:2px;right:' + (that.vScrollbar ? '7' : '2') + 'px' : 'width:7px;bottom:' + (that.hScrollbar ? '7' : '2') + 'px;top:2px;right:1px');

			bar.style.cssText += ';pointer-events:none;' + cssVendor + 'transition-property:opacity;' + cssVendor + 'transition-duration:' + (that.options.fadeScrollbar ? '350ms' : '0') + ';overflow:hidden;opacity:' + (that.options.hideScrollbar ? '0' : '1');

			that.wrapper.appendChild(bar);
			that[dir + 'ScrollbarWrapper'] = bar;

			// Create the scrollbar indicator
			bar = doc.createElement('div');
			if (!that.options.scrollbarClass) {
				bar.style.cssText = 'position:absolute;z-index:100;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);' + cssVendor + 'background-clip:padding-box;' + cssVendor + 'box-sizing:border-box;' + (dir == 'h' ? 'height:100%' : 'width:100%') + ';' + cssVendor + 'border-radius:3px;border-radius:3px';
			}
			bar.style.cssText += ';pointer-events:none;' + cssVendor + 'transition-property:' + cssVendor + 'transform;' + cssVendor + 'transition-timing-function:cubic-bezier(0.33,0.66,0.66,1);' + cssVendor + 'transition-duration:0;' + cssVendor + 'transform: translate(0,0)' + translateZ;
			if (that.options.useTransition) bar.style.cssText += ';' + cssVendor + 'transition-timing-function:cubic-bezier(0.33,0.66,0.66,1)';

			that[dir + 'ScrollbarWrapper'].appendChild(bar);
			that[dir + 'ScrollbarIndicator'] = bar;
		}

		if (dir == 'h') {
			that.hScrollbarSize = that.hScrollbarWrapper.clientWidth;
			that.hScrollbarIndicatorSize = m.max(m.round(that.hScrollbarSize * that.hScrollbarSize / that.scrollerW), 8);
			that.hScrollbarIndicator.style.width = that.hScrollbarIndicatorSize + 'px';
			that.hScrollbarMaxScroll = that.hScrollbarSize - that.hScrollbarIndicatorSize;
			that.hScrollbarProp = that.hScrollbarMaxScroll / that.maxScrollX;
		} else {
			that.vScrollbarSize = that.vScrollbarWrapper.clientHeight;
			that.vScrollbarIndicatorSize = m.max(m.round(that.vScrollbarSize * that.vScrollbarSize / that.scrollerH), 8);
			that.vScrollbarIndicator.style.height = that.vScrollbarIndicatorSize + 'px';
			that.vScrollbarMaxScroll = that.vScrollbarSize - that.vScrollbarIndicatorSize;
			that.vScrollbarProp = that.vScrollbarMaxScroll / that.maxScrollY;
		}

		// Reset position
		that._scrollbarPos(dir, true);
	},

	_resize: function () {
		var that = this;
		setTimeout(function () { that.refresh(); }, isAndroid ? 200 : 0);
	},

	_pos: function (x, y) {
		if (this.zoomed) return;

		x = this.hScroll ? x : 0;
		y = this.vScroll ? y : 0;

		if (this.options.useTransform) {
			this.scroller.style[transform] = 'translate(' + x + 'px,' + y + 'px) scale(' + this.scale + ')' + translateZ;
		} else {
			x = m.round(x);
			y = m.round(y);
			this.scroller.style.left = x + 'px';
			this.scroller.style.top = y + 'px';
		}

		this.x = x;
		this.y = y;

		this._scrollbarPos('h');
		this._scrollbarPos('v');
	},

	_scrollbarPos: function (dir, hidden) {
		var that = this,
			pos = dir == 'h' ? that.x : that.y,
			size;

		if (!that[dir + 'Scrollbar']) return;

		pos = that[dir + 'ScrollbarProp'] * pos;

		if (pos < 0) {
			if (!that.options.fixedScrollbar) {
				size = that[dir + 'ScrollbarIndicatorSize'] + m.round(pos * 3);
				if (size < 8) size = 8;
				that[dir + 'ScrollbarIndicator'].style[dir == 'h' ? 'width' : 'height'] = size + 'px';
			}
			pos = 0;
		} else if (pos > that[dir + 'ScrollbarMaxScroll']) {
			if (!that.options.fixedScrollbar) {
				size = that[dir + 'ScrollbarIndicatorSize'] - m.round((pos - that[dir + 'ScrollbarMaxScroll']) * 3);
				if (size < 8) size = 8;
				that[dir + 'ScrollbarIndicator'].style[dir == 'h' ? 'width' : 'height'] = size + 'px';
				pos = that[dir + 'ScrollbarMaxScroll'] + (that[dir + 'ScrollbarIndicatorSize'] - size);
			} else {
				pos = that[dir + 'ScrollbarMaxScroll'];
			}
		}

		that[dir + 'ScrollbarWrapper'].style[transitionDelay] = '0';
		that[dir + 'ScrollbarWrapper'].style.opacity = hidden && that.options.hideScrollbar ? '0' : '1';
		that[dir + 'ScrollbarIndicator'].style[transform] = 'translate(' + (dir == 'h' ? pos + 'px,0)' : '0,' + pos + 'px)') + translateZ;
	},

	_start: function (e) {
		var that = this,
			point = hasTouch ? e.touches[0] : e,
			matrix, x, y,
			c1, c2;

		if (!that.enabled) return;

		if (that.options.onBeforeScrollStart) that.options.onBeforeScrollStart.call(that, e);

		if (that.options.useTransition || that.options.zoom) that._transitionTime(0);

		that.moved = false;
		that.animating = false;
		that.zoomed = false;
		that.distX = 0;
		that.distY = 0;
		that.absDistX = 0;
		that.absDistY = 0;
		that.dirX = 0;
		that.dirY = 0;

		// Gesture start
		if (that.options.zoom && hasTouch && e.touches.length > 1) {
			c1 = m.abs(e.touches[0].pageX-e.touches[1].pageX);
			c2 = m.abs(e.touches[0].pageY-e.touches[1].pageY);
			that.touchesDistStart = m.sqrt(c1 * c1 + c2 * c2);

			that.originX = m.abs(e.touches[0].pageX + e.touches[1].pageX - that.wrapperOffsetLeft * 2) / 2 - that.x;
			that.originY = m.abs(e.touches[0].pageY + e.touches[1].pageY - that.wrapperOffsetTop * 2) / 2 - that.y;

			if (that.options.onZoomStart) that.options.onZoomStart.call(that, e);
		}

		if (that.options.momentum) {
			if (that.options.useTransform) {
				// Very lame general purpose alternative to CSSMatrix
				matrix = getComputedStyle(that.scroller, null)[transform].replace(/[^0-9\-.,]/g, '').split(',');
				x = +(matrix[12] || matrix[4]);
				y = +(matrix[13] || matrix[5]);
			} else {
				x = +getComputedStyle(that.scroller, null).left.replace(/[^0-9-]/g, '');
				y = +getComputedStyle(that.scroller, null).top.replace(/[^0-9-]/g, '');
			}

			if (x != that.x || y != that.y) {
				if (that.options.useTransition) that._unbind(TRNEND_EV);
				else cancelFrame(that.aniTime);
				that.steps = [];
				that._pos(x, y);
				if (that.options.onScrollEnd) that.options.onScrollEnd.call(that);
			}
		}

		that.absStartX = that.x;	// Needed by snap threshold
		that.absStartY = that.y;

		that.startX = that.x;
		that.startY = that.y;
		that.pointX = point.pageX;
		that.pointY = point.pageY;

		that.startTime = e.timeStamp || Date.now();

		if (that.options.onScrollStart) that.options.onScrollStart.call(that, e);

		that._bind(MOVE_EV, window);
		that._bind(END_EV, window);
		that._bind(CANCEL_EV, window);
	},

	_move: function (e) {
		var that = this,
			point = hasTouch ? e.touches[0] : e,
			deltaX = point.pageX - that.pointX,
			deltaY = point.pageY - that.pointY,
			newX = that.x + deltaX,
			newY = that.y + deltaY,
			c1, c2, scale,
			timestamp = e.timeStamp || Date.now();

		if (that.options.onBeforeScrollMove) that.options.onBeforeScrollMove.call(that, e);

		// Zoom
		if (that.options.zoom && hasTouch && e.touches.length > 1) {
			c1 = m.abs(e.touches[0].pageX - e.touches[1].pageX);
			c2 = m.abs(e.touches[0].pageY - e.touches[1].pageY);
			that.touchesDist = m.sqrt(c1*c1+c2*c2);

			that.zoomed = true;

			scale = 1 / that.touchesDistStart * that.touchesDist * this.scale;

			if (scale < that.options.zoomMin) scale = 0.5 * that.options.zoomMin * Math.pow(2.0, scale / that.options.zoomMin);
			else if (scale > that.options.zoomMax) scale = 2.0 * that.options.zoomMax * Math.pow(0.5, that.options.zoomMax / scale);

			that.lastScale = scale / this.scale;

			newX = this.originX - this.originX * that.lastScale + this.x;
			newY = this.originY - this.originY * that.lastScale + this.y;

			this.scroller.style[transform] = 'translate(' + newX + 'px,' + newY + 'px) scale(' + scale + ')' + translateZ;

			if (that.options.onZoom) that.options.onZoom.call(that, e);
			return;
		}

		that.pointX = point.pageX;
		that.pointY = point.pageY;

		// Slow down if outside of the boundaries
		if (newX > 0 || newX < that.maxScrollX) {
			newX = that.options.bounce ? that.x + (deltaX / 2) : newX >= 0 || that.maxScrollX >= 0 ? 0 : that.maxScrollX;
		}
		if (newY > that.minScrollY || newY < that.maxScrollY) {
			newY = that.options.bounce ? that.y + (deltaY / 2) : newY >= that.minScrollY || that.maxScrollY >= 0 ? that.minScrollY : that.maxScrollY;
		}

		that.distX += deltaX;
		that.distY += deltaY;
		that.absDistX = m.abs(that.distX);
		that.absDistY = m.abs(that.distY);

		if (that.absDistX < 6 && that.absDistY < 6) {
			return;
		}

		// Lock direction
		if (that.options.lockDirection) {
			if (that.absDistX > that.absDistY + 5) {
				newY = that.y;
				deltaY = 0;
			} else if (that.absDistY > that.absDistX + 5) {
				newX = that.x;
				deltaX = 0;
			}
		}

		that.moved = true;
		that._pos(newX, newY);
		that.dirX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
		that.dirY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

		if (timestamp - that.startTime > 300) {
			that.startTime = timestamp;
			that.startX = that.x;
			that.startY = that.y;
		}

		if (that.options.onScrollMove) that.options.onScrollMove.call(that, e);
	},

	_end: function (e) {
		if (hasTouch && e.touches.length !== 0) return;

		var that = this,
			point = hasTouch ? e.changedTouches[0] : e,
			target, ev,
			momentumX = { dist:0, time:0 },
			momentumY = { dist:0, time:0 },
			duration = (e.timeStamp || Date.now()) - that.startTime,
			newPosX = that.x,
			newPosY = that.y,
			distX, distY,
			newDuration,
			snap,
			scale;

		that._unbind(MOVE_EV, window);
		that._unbind(END_EV, window);
		that._unbind(CANCEL_EV, window);

		if (that.options.onBeforeScrollEnd) that.options.onBeforeScrollEnd.call(that, e);

		if (that.zoomed) {
			scale = that.scale * that.lastScale;
			scale = Math.max(that.options.zoomMin, scale);
			scale = Math.min(that.options.zoomMax, scale);
			that.lastScale = scale / that.scale;
			that.scale = scale;

			that.x = that.originX - that.originX * that.lastScale + that.x;
			that.y = that.originY - that.originY * that.lastScale + that.y;

			that.scroller.style[transitionDuration] = '200ms';
			that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px) scale(' + that.scale + ')' + translateZ;

			that.zoomed = false;
			that.refresh();

			if (that.options.onZoomEnd) that.options.onZoomEnd.call(that, e);
			return;
		}

		if (!that.moved) {
			if (hasTouch) {
				if (that.doubleTapTimer && that.options.zoom) {
					// Double tapped
					clearTimeout(that.doubleTapTimer);
					that.doubleTapTimer = null;
					if (that.options.onZoomStart) that.options.onZoomStart.call(that, e);
					that.zoom(that.pointX, that.pointY, that.scale == 1 ? that.options.doubleTapZoom : 1);
					if (that.options.onZoomEnd) {
						setTimeout(function() {
							that.options.onZoomEnd.call(that, e);
						}, 200); // 200 is default zoom duration
					}
				} else if (this.options.handleClick) {
					that.doubleTapTimer = setTimeout(function () {
						that.doubleTapTimer = null;

						// Find the last touched element
						target = point.target;
						while (target.nodeType != 1) target = target.parentNode;

						if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA') {
							ev = doc.createEvent('MouseEvents');
							ev.initMouseEvent('click', true, true, e.view, 1,
								point.screenX, point.screenY, point.clientX, point.clientY,
								e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
								0, null);
							ev._fake = true;
							target.dispatchEvent(ev);
						}
					}, that.options.zoom ? 250 : 0);
				}
			}

			that._resetPos(400);

			if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
			return;
		}

		if (duration < 300 && that.options.momentum) {
			momentumX = newPosX ? that._momentum(newPosX - that.startX, duration, -that.x, that.scrollerW - that.wrapperW + that.x, that.options.bounce ? that.wrapperW : 0) : momentumX;
			momentumY = newPosY ? that._momentum(newPosY - that.startY, duration, -that.y, (that.maxScrollY < 0 ? that.scrollerH - that.wrapperH + that.y - that.minScrollY : 0), that.options.bounce ? that.wrapperH : 0) : momentumY;
			if (momentumX.dist> 3000) momentumX.dist= 3000;
			if (momentumX.dist<-3000) momentumX.dist=-3000;
			newPosX = that.x + momentumX.dist;
			newPosY = that.y + momentumY.dist;
			if ((that.x > 0 && newPosX > 0) || (that.x < that.maxScrollX && newPosX < that.maxScrollX)) momentumX = { dist:0, time:0 };
			if ((that.y > that.minScrollY && newPosY > that.minScrollY) || (that.y < that.maxScrollY && newPosY < that.maxScrollY)) momentumY = { dist:0, time:0 };
		}

		if (momentumX.dist || momentumY.dist) {
			newDuration = m.max(m.max(momentumX.time, momentumY.time), 10);

			// Do we need to snap?
			if (that.options.snap) {
				distX = newPosX - that.absStartX;
				distY = newPosY - that.absStartY;
				if (m.abs(distX) < that.options.snapThreshold && m.abs(distY) < that.options.snapThreshold) { that.scrollTo(that.absStartX, that.absStartY, 200); }
				else {
					snap = that._snap(newPosX, newPosY);
					newPosX = snap.x;
					newPosY = snap.y;
					newDuration = m.max(snap.time, newDuration);
				}
			}

			that.scrollTo(m.round(newPosX), m.round(newPosY), newDuration);

			if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
			return;
		}

		// Do we need to snap?
		if (that.options.snap) {
			distX = newPosX - that.absStartX;
			distY = newPosY - that.absStartY;
			if (m.abs(distX) < that.options.snapThreshold && m.abs(distY) < that.options.snapThreshold) that.scrollTo(that.absStartX, that.absStartY, 200);
			else {
				snap = that._snap(that.x, that.y);
				if (snap.x != that.x || snap.y != that.y) that.scrollTo(snap.x, snap.y, snap.time);
			}

			if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
			return;
		}

		that._resetPos(200);
		if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
	},

	_resetPos: function (time) {
		var that = this,
			resetX = that.x >= 0 ? 0 : that.x < that.maxScrollX ? that.maxScrollX : that.x,
			resetY = that.y >= that.minScrollY || that.maxScrollY > 0 ? that.minScrollY : that.y < that.maxScrollY ? that.maxScrollY : that.y;

		if (resetX == that.x && resetY == that.y) {
			if (that.moved) {
				that.moved = false;
				if (that.options.onScrollEnd) that.options.onScrollEnd.call(that);		// Execute custom code on scroll end
			}

			if (that.hScrollbar && that.options.hideScrollbar) {
				if (vendor == 'webkit') that.hScrollbarWrapper.style[transitionDelay] = '300ms';
				that.hScrollbarWrapper.style.opacity = '0';
			}
			if (that.vScrollbar && that.options.hideScrollbar) {
				if (vendor == 'webkit') that.vScrollbarWrapper.style[transitionDelay] = '300ms';
				that.vScrollbarWrapper.style.opacity = '0';
			}

			return;
		}

		that.scrollTo(resetX, resetY, time || 0);
	},

	_wheel: function (e) {
		var that = this,
			wheelDeltaX, wheelDeltaY,
			deltaX, deltaY,
			deltaScale;

		if ('wheelDeltaX' in e) {
			wheelDeltaX = e.wheelDeltaX / 12;
			wheelDeltaY = e.wheelDeltaY / 12;
		} else if('wheelDelta' in e) {
			wheelDeltaX = wheelDeltaY = e.wheelDelta / 12;
		} else if ('detail' in e) {
			wheelDeltaX = wheelDeltaY = -e.detail * 3;
		} else {
			return;
		}

		if (that.options.wheelAction == 'zoom') {
			deltaScale = that.scale * Math.pow(2, 1/3 * (wheelDeltaY ? wheelDeltaY / Math.abs(wheelDeltaY) : 0));
			if (deltaScale < that.options.zoomMin) deltaScale = that.options.zoomMin;
			if (deltaScale > that.options.zoomMax) deltaScale = that.options.zoomMax;

			if (deltaScale != that.scale) {
				if (!that.wheelZoomCount && that.options.onZoomStart) that.options.onZoomStart.call(that, e);
				that.wheelZoomCount++;

				that.zoom(e.pageX, e.pageY, deltaScale, 400);

				setTimeout(function() {
					that.wheelZoomCount--;
					if (!that.wheelZoomCount && that.options.onZoomEnd) that.options.onZoomEnd.call(that, e);
				}, 400);
			}

			return;
		}

		deltaX = that.x + wheelDeltaX;
		deltaY = that.y + wheelDeltaY;

		if (deltaX > 0) deltaX = 0;
		else if (deltaX < that.maxScrollX) deltaX = that.maxScrollX;

		if (deltaY > that.minScrollY) deltaY = that.minScrollY;
		else if (deltaY < that.maxScrollY) deltaY = that.maxScrollY;

		if (that.maxScrollY < 0) {
			that.scrollTo(deltaX, deltaY, 0);
		}
	},

	_transitionEnd: function (e) {
		var that = this;

		if (e.target != that.scroller) return;

		that._unbind(TRNEND_EV);

		that._startAni();
	},


	/**
	*
	* Utilities
	*
	*/
	_startAni: function () {
		var that = this,
			startX = that.x, startY = that.y,
			startTime = Date.now(),
			step, easeOut,
			animate;

		if (that.animating) return;

		if (!that.steps.length) {
			that._resetPos(400);
			return;
		}

		step = that.steps.shift();

		if (step.x == startX && step.y == startY) step.time = 0;

		that.animating = true;
		that.moved = true;

		if (that.options.useTransition) {
			that._transitionTime(step.time);
			that._pos(step.x, step.y);
			that.animating = false;
			if (step.time) that._bind(TRNEND_EV);
			else that._resetPos(0);
			return;
		}

		animate = function () {
			var now = Date.now(),
				newX, newY;

			if (now >= startTime + step.time) {
				that._pos(step.x, step.y);
				that.animating = false;
				if (that.options.onAnimationEnd) that.options.onAnimationEnd.call(that);			// Execute custom code on animation end
				that._startAni();
				return;
			}

			now = (now - startTime) / step.time - 1;
			easeOut = m.sqrt(1 - now * now);
			newX = (step.x - startX) * easeOut + startX;
			newY = (step.y - startY) * easeOut + startY;
			that._pos(newX, newY);
			if (that.animating) that.aniTime = nextFrame(animate);
		};

		animate();
	},

	_transitionTime: function (time) {
		time += 'ms';
		this.scroller.style[transitionDuration] = time;
		if (this.hScrollbar) this.hScrollbarIndicator.style[transitionDuration] = time;
		if (this.vScrollbar) this.vScrollbarIndicator.style[transitionDuration] = time;
	},

	_momentum: function (dist, time, maxDistUpper, maxDistLower, size) {
		var deceleration = 0.0006,
			speed = m.abs(dist) / time,
			newDist = (speed * speed) / (2 * deceleration),
			newTime = 0, outsideDist = 0;

		// Proportinally reduce speed if we are outside of the boundaries
		if (dist > 0 && newDist > maxDistUpper) {
			outsideDist = size / (6 / (newDist / speed * deceleration));
			maxDistUpper = maxDistUpper + outsideDist;
			speed = speed * maxDistUpper / newDist;
			newDist = maxDistUpper;
		} else if (dist < 0 && newDist > maxDistLower) {
			outsideDist = size / (6 / (newDist / speed * deceleration));
			maxDistLower = maxDistLower + outsideDist;
			speed = speed * maxDistLower / newDist;
			newDist = maxDistLower;
		}

		newDist = newDist * (dist < 0 ? -1 : 1);
		newTime = speed / deceleration;

		return { dist: newDist, time: m.round(newTime) };
	},

	_offset: function (el) {
		var left = -el.offsetLeft,
			top = -el.offsetTop;

		while (el = el.offsetParent) {
			left -= el.offsetLeft;
			top -= el.offsetTop;
		}

		if (el != this.wrapper) {
			left *= this.scale;
			top *= this.scale;
		}

		return { left: left, top: top };
	},

	_snap: function (x, y) {
		var that = this,
			i, l,
			page, time,
			sizeX, sizeY;

		// Check page X
		page = that.pagesX.length - 1;
		for (i=0, l=that.pagesX.length; i<l; i++) {
			if (x >= that.pagesX[i]) {
				page = i;
				break;
			}
		}
		if (page == that.currPageX && page > 0 && that.dirX < 0) page--;
		x = that.pagesX[page];
		sizeX = m.abs(x - that.pagesX[that.currPageX]);
		sizeX = sizeX ? m.abs(that.x - x) / sizeX * 500 : 0;
		that.currPageX = page;

		// Check page Y
		page = that.pagesY.length-1;
		for (i=0; i<page; i++) {
			if (y >= that.pagesY[i]) {
				page = i;
				break;
			}
		}
		if (page == that.currPageY && page > 0 && that.dirY < 0) page--;
		y = that.pagesY[page];
		sizeY = m.abs(y - that.pagesY[that.currPageY]);
		sizeY = sizeY ? m.abs(that.y - y) / sizeY * 500 : 0;
		that.currPageY = page;

		// Snap with constant speed (proportional duration)
		time = m.round(m.max(sizeX, sizeY)) || 200;

		return { x: x, y: y, time: time };
	},

	_bind: function (type, el, bubble) {
		(el || this.scroller).addEventListener(type, this, !!bubble);
	},

	_unbind: function (type, el, bubble) {
		(el || this.scroller).removeEventListener(type, this, !!bubble);
	},


	/**
	*
	* Public methods
	*
	*/
	destroy: function () {
		var that = this;

		that.scroller.style[transform] = '';

		// Remove the scrollbars
		that.hScrollbar = false;
		that.vScrollbar = false;
		that._scrollbar('h');
		that._scrollbar('v');

		// Remove the event listeners
		that._unbind(RESIZE_EV, window);
		that._unbind(START_EV);
		that._unbind(MOVE_EV, window);
		that._unbind(END_EV, window);
		that._unbind(CANCEL_EV, window);

		if (!that.options.hasTouch) {
			that._unbind('DOMMouseScroll');
			that._unbind('mousewheel');
		}

		if (that.options.useTransition) that._unbind(TRNEND_EV);

		if (that.options.checkDOMChanges) clearInterval(that.checkDOMTime);

		if (that.options.onDestroy) that.options.onDestroy.call(that);
	},

	refresh: function () {
		var that = this,
			offset,
			i, l,
			els,
			pos = 0,
			page = 0;

		if (that.scale < that.options.zoomMin) that.scale = that.options.zoomMin;
		that.wrapperW = that.wrapper.clientWidth || 1;
		that.wrapperH = that.wrapper.clientHeight || 1;

		that.minScrollY = -that.options.topOffset || 0;
		that.scrollerW = m.round(that.scroller.offsetWidth * that.scale);
		that.scrollerH = m.round((that.scroller.offsetHeight + that.minScrollY) * that.scale);
		that.maxScrollX = that.wrapperW - that.scrollerW;
		that.maxScrollY = that.wrapperH - that.scrollerH + that.minScrollY;
		that.dirX = 0;
		that.dirY = 0;

		if (that.options.onRefresh) that.options.onRefresh.call(that);

		that.hScroll = that.options.hScroll && that.maxScrollX < 0;
		that.vScroll = that.options.vScroll && (!that.options.bounceLock && !that.hScroll || that.scrollerH > that.wrapperH);

		that.hScrollbar = that.hScroll && that.options.hScrollbar;
		that.vScrollbar = that.vScroll && that.options.vScrollbar && that.scrollerH > that.wrapperH;

		offset = that._offset(that.wrapper);
		that.wrapperOffsetLeft = -offset.left;
		that.wrapperOffsetTop = -offset.top;

		// Prepare snap
		if (typeof that.options.snap == 'string') {
			that.pagesX = [];
			that.pagesY = [];
			els = that.scroller.querySelectorAll(that.options.snap);
			for (i=0, l=els.length; i<l; i++) {
				pos = that._offset(els[i]);
				pos.left += that.wrapperOffsetLeft;
				pos.top += that.wrapperOffsetTop;
				that.pagesX[i] = pos.left < that.maxScrollX ? that.maxScrollX : pos.left * that.scale;
				that.pagesY[i] = pos.top < that.maxScrollY ? that.maxScrollY : pos.top * that.scale;
			}
		} else if (that.options.snap) {
			that.pagesX = [];
			while (pos >= that.maxScrollX) {
				that.pagesX[page] = pos;
				pos = pos - that.wrapperW;
				page++;
			}
			if (that.maxScrollX%that.wrapperW) that.pagesX[that.pagesX.length] = that.maxScrollX - that.pagesX[that.pagesX.length-1] + that.pagesX[that.pagesX.length-1];

			pos = 0;
			page = 0;
			that.pagesY = [];
			while (pos >= that.maxScrollY) {
				that.pagesY[page] = pos;
				pos = pos - that.wrapperH;
				page++;
			}
			if (that.maxScrollY%that.wrapperH) that.pagesY[that.pagesY.length] = that.maxScrollY - that.pagesY[that.pagesY.length-1] + that.pagesY[that.pagesY.length-1];
		}

		// Prepare the scrollbars
		that._scrollbar('h');
		that._scrollbar('v');

		if (!that.zoomed) {
			that.scroller.style[transitionDuration] = '0';
			that._resetPos(400);
		}
	},

	scrollTo: function (x, y, time, relative) {
		var that = this,
			step = x,
			i, l;

		that.stop();

		if (!step.length) step = [{ x: x, y: y, time: time, relative: relative }];

		for (i=0, l=step.length; i<l; i++) {
			if (step[i].relative) { step[i].x = that.x - step[i].x; step[i].y = that.y - step[i].y; }
			that.steps.push({ x: step[i].x, y: step[i].y, time: step[i].time || 0 });
		}

		that._startAni();
	},

	scrollToElement: function (el, time) {
		var that = this, pos;
		el = el.nodeType ? el : that.scroller.querySelector(el);
		if (!el) return;

		pos = that._offset(el);
		pos.left += that.wrapperOffsetLeft;
		pos.top += that.wrapperOffsetTop;

		pos.left = pos.left > 0 ? 0 : pos.left < that.maxScrollX ? that.maxScrollX : pos.left;
		pos.top = pos.top > that.minScrollY ? that.minScrollY : pos.top < that.maxScrollY ? that.maxScrollY : pos.top;
		time = time === undefined ? m.max(m.abs(pos.left)*2, m.abs(pos.top)*2) : time;

		that.scrollTo(pos.left, pos.top, time);
	},

	scrollToPage: function (pageX, pageY, time) {
		var that = this, x, y;

		time = time === undefined ? 400 : time;

		if (that.options.onScrollStart) that.options.onScrollStart.call(that);

		if (that.options.snap) {
			pageX = pageX == 'next' ? that.currPageX+1 : pageX == 'prev' ? that.currPageX-1 : pageX;
			pageY = pageY == 'next' ? that.currPageY+1 : pageY == 'prev' ? that.currPageY-1 : pageY;

			pageX = pageX < 0 ? 0 : pageX > that.pagesX.length-1 ? that.pagesX.length-1 : pageX;
			pageY = pageY < 0 ? 0 : pageY > that.pagesY.length-1 ? that.pagesY.length-1 : pageY;

			that.currPageX = pageX;
			that.currPageY = pageY;
			x = that.pagesX[pageX];
			y = that.pagesY[pageY];
		} else {
			x = -that.wrapperW * pageX;
			y = -that.wrapperH * pageY;
			if (x < that.maxScrollX) x = that.maxScrollX;
			if (y < that.maxScrollY) y = that.maxScrollY;
		}

		that.scrollTo(x, y, time);
	},

	disable: function () {
		this.stop();
		this._resetPos(0);
		this.enabled = false;

		// If disabled after touchstart we make sure that there are no left over events
		this._unbind(MOVE_EV, window);
		this._unbind(END_EV, window);
		this._unbind(CANCEL_EV, window);
	},

	enable: function () {
		this.enabled = true;
	},

	stop: function () {
		if (this.options.useTransition) this._unbind(TRNEND_EV);
		else cancelFrame(this.aniTime);
		this.steps = [];
		this.moved = false;
		this.animating = false;
	},

	zoom: function (x, y, scale, time) {
		var that = this,
			relScale = scale / that.scale;

		if (!that.options.useTransform) return;

		that.zoomed = true;
		time = time === undefined ? 200 : time;
		x = x - that.wrapperOffsetLeft - that.x;
		y = y - that.wrapperOffsetTop - that.y;
		that.x = x - x * relScale + that.x;
		that.y = y - y * relScale + that.y;

		that.scale = scale;
		that.refresh();

		that.x = that.x > 0 ? 0 : that.x < that.maxScrollX ? that.maxScrollX : that.x;
		that.y = that.y > that.minScrollY ? that.minScrollY : that.y < that.maxScrollY ? that.maxScrollY : that.y;

		that.scroller.style[transitionDuration] = time + 'ms';
		that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px) scale(' + scale + ')' + translateZ;
		that.zoomed = false;
	},

	isReady: function () {
		return !this.moved && !this.zoomed && !this.animating;
	}
};

function prefixStyle (style) {
	if ( vendor === '' ) return style;

	style = style.charAt(0).toUpperCase() + style.substr(1);
	return vendor + style;
}

dummyStyle = null;	// for the sake of it

if (typeof exports !== 'undefined') exports.iScroll = iScroll;
else window.iScroll = iScroll;

})(window, document);

/*!{id:msgpack.js,ver:1.05,license:"MIT",author:"uupaa.js@gmail.com"}*/

// === msgpack ===
// MessagePack -> http://msgpack.sourceforge.net/

this.msgpack || (function(globalScope) {

globalScope.msgpack = {
    pack:       msgpackpack,    // msgpack.pack(data:Mix,
                                //              toString:Boolean = false):ByteArray/ByteString/false
                                //  [1][mix to String]    msgpack.pack({}, true) -> "..."
                                //  [2][mix to ByteArray] msgpack.pack({})       -> [...]
    unpack:     msgpackunpack,  // msgpack.unpack(data:BinaryString/ByteArray):Mix
                                //  [1][String to mix]    msgpack.unpack("...") -> {}
                                //  [2][ByteArray to mix] msgpack.unpack([...]) -> {}
    worker:     "msgpack.js",   // msgpack.worker - WebWorkers script filename
    upload:     msgpackupload,  // msgpack.upload(url:String, option:Hash, callback:Function)
    download:   msgpackdownload // msgpack.download(url:String, option:Hash, callback:Function)
};

var _ie         = /MSIE/.test(navigator.userAgent),
    _bin2num    = {}, // BinaryStringToNumber   { "\00": 0, ... "\ff": 255 }
    _num2bin    = {}, // NumberToBinaryString   { 0: "\00", ... 255: "\ff" }
    _num2b64    = ("ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                   "abcdefghijklmnopqrstuvwxyz0123456789+/").split(""),
    _buf        = [], // decode buffer
    _idx        = 0,  // decode buffer[index]
    _error      = 0,  // msgpack.pack() error code. 1 = CYCLIC_REFERENCE_ERROR
    _isArray    = Array.isArray || (function(mix) {
                    return Object.prototype.toString.call(mix) === "[object Array]";
                  }),
    _toString   = String.fromCharCode, // CharCode/ByteArray to String
    _MAX_DEPTH  = 512;

// for WebWorkers Code Block
self.importScripts && (onmessage = function(event) {
    if (event.data.method === "pack") {
        postMessage(base64encode(msgpackpack(event.data.data)));
    } else {
        postMessage(msgpackunpack(event.data.data));
    }
});

// msgpack.pack
function msgpackpack(data,       // @param Mix:
                     toString) { // @param Boolean(= false):
                                 // @return ByteArray/BinaryString/false:
                                 //     false is error return
    //  [1][mix to String]    msgpack.pack({}, true) -> "..."
    //  [2][mix to ByteArray] msgpack.pack({})       -> [...]

    _error = 0;

    var byteArray = encode([], data, 0);

    return _error ? false
                  : toString ? byteArrayToByteString(byteArray)
                             : byteArray;
}

// msgpack.unpack
function msgpackunpack(data) { // @param BinaryString/ByteArray:
                               // @return Mix/undefined:
                               //       undefined is error return
    //  [1][String to mix]    msgpack.unpack("...") -> {}
    //  [2][ByteArray to mix] msgpack.unpack([...]) -> {}

    _buf = typeof data === "string" ? toByteArray(data) : data;
    _idx = -1;
    return decode(); // mix or undefined
}

// inner - encoder
function encode(rv,      // @param ByteArray: result
                mix,     // @param Mix: source data
                depth) { // @param Number: depth
    var size, i, iz, c, pos,        // for UTF8.encode, Array.encode, Hash.encode
        high, low, sign, exp, frac; // for IEEE754

    if (mix == null) { // null or undefined -> 0xc0 ( null )
        rv.push(0xc0);
    } else if (mix === false) { // false -> 0xc2 ( false )
        rv.push(0xc2);
    } else if (mix === true) {  // true  -> 0xc3 ( true  )
        rv.push(0xc3);
    } else {
        switch (typeof mix) {
        case "number":
            if (mix !== mix) { // isNaN
                rv.push(0xcb, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff); // quiet NaN
            } else if (mix === Infinity) {
                rv.push(0xcb, 0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00); // positive infinity
            } else if (Math.floor(mix) === mix) { // int or uint
                if (mix < 0) {
                    // int
                    if (mix >= -32) { // negative fixnum
                        rv.push(0xe0 + mix + 32);
                    } else if (mix > -0x80) {
                        rv.push(0xd0, mix + 0x100);
                    } else if (mix > -0x8000) {
                        mix += 0x10000;
                        rv.push(0xd1, mix >> 8, mix & 0xff);
                    } else if (mix > -0x80000000) {
                        mix += 0x100000000;
                        rv.push(0xd2, mix >>> 24, (mix >> 16) & 0xff,
                                                  (mix >>  8) & 0xff, mix & 0xff);
                    } else {
                        high = Math.floor(mix / 0x100000000);
                        low  = mix & 0xffffffff;
                        rv.push(0xd3, (high >> 24) & 0xff, (high >> 16) & 0xff,
                                      (high >>  8) & 0xff,         high & 0xff,
                                      (low  >> 24) & 0xff, (low  >> 16) & 0xff,
                                      (low  >>  8) & 0xff,          low & 0xff);
                    }
                } else {
                    // uint
                    if (mix < 0x80) {
                        rv.push(mix); // positive fixnum
                    } else if (mix < 0x100) { // uint 8
                        rv.push(0xcc, mix);
                    } else if (mix < 0x10000) { // uint 16
                        rv.push(0xcd, mix >> 8, mix & 0xff);
                    } else if (mix < 0x100000000) { // uint 32
                        rv.push(0xce, mix >>> 24, (mix >> 16) & 0xff,
                                                  (mix >>  8) & 0xff, mix & 0xff);
                    } else {
                        high = Math.floor(mix / 0x100000000);
                        low  = mix & 0xffffffff;
                        rv.push(0xcf, (high >> 24) & 0xff, (high >> 16) & 0xff,
                                      (high >>  8) & 0xff,         high & 0xff,
                                      (low  >> 24) & 0xff, (low  >> 16) & 0xff,
                                      (low  >>  8) & 0xff,          low & 0xff);
                    }
                }
            } else { // double
                // THX!! @edvakf
                // http://javascript.g.hatena.ne.jp/edvakf/20101128/1291000731
                sign = mix < 0;
                sign && (mix *= -1);

                // add offset 1023 to ensure positive
                // 0.6931471805599453 = Math.LN2;
                exp  = ((Math.log(mix) / 0.6931471805599453) + 1023) | 0;

                // shift 52 - (exp - 1023) bits to make integer part exactly 53 bits,
                // then throw away trash less than decimal point
                frac = mix * Math.pow(2, 52 + 1023 - exp);

                //  S+-Exp(11)--++-----------------Fraction(52bits)-----------------------+
                //  ||          ||                                                        |
                //  v+----------++--------------------------------------------------------+
                //  00000000|00000000|00000000|00000000|00000000|00000000|00000000|00000000
                //  6      5    55  4        4        3        2        1        8        0
                //  3      6    21  8        0        2        4        6
                //
                //  +----------high(32bits)-----------+ +----------low(32bits)------------+
                //  |                                 | |                                 |
                //  +---------------------------------+ +---------------------------------+
                //  3      2    21  1        8        0
                //  1      4    09  6
                low  = frac & 0xffffffff;
                sign && (exp |= 0x800);
                high = ((frac / 0x100000000) & 0xfffff) | (exp << 20);

                rv.push(0xcb, (high >> 24) & 0xff, (high >> 16) & 0xff,
                              (high >>  8) & 0xff,  high        & 0xff,
                              (low  >> 24) & 0xff, (low  >> 16) & 0xff,
                              (low  >>  8) & 0xff,  low         & 0xff);
            }
            break;
        case "string":
            // http://d.hatena.ne.jp/uupaa/20101128
            iz = mix.length;
            pos = rv.length; // keep rewrite position

            rv.push(0); // placeholder

            // utf8.encode
            for (i = 0; i < iz; ++i) {
                c = mix.charCodeAt(i);
                if (c < 0x80) { // ASCII(0x00 ~ 0x7f)
                    rv.push(c & 0x7f);
                } else if (c < 0x0800) {
                    rv.push(((c >>>  6) & 0x1f) | 0xc0, (c & 0x3f) | 0x80);
                } else if (c < 0x10000) {
                    rv.push(((c >>> 12) & 0x0f) | 0xe0,
                            ((c >>>  6) & 0x3f) | 0x80, (c & 0x3f) | 0x80);
                }
            }
            size = rv.length - pos - 1;

            if (size < 32) {
                rv[pos] = 0xa0 + size; // rewrite
            } else if (size < 0x10000) { // 16
                rv.splice(pos, 1, 0xda, size >> 8, size & 0xff);
            } else if (size < 0x100000000) { // 32
                rv.splice(pos, 1, 0xdb,
                          size >>> 24, (size >> 16) & 0xff,
                                       (size >>  8) & 0xff, size & 0xff);
            }
            break;
        default: // array or hash
            if (++depth >= _MAX_DEPTH) {
                _error = 1; // CYCLIC_REFERENCE_ERROR
                return rv = []; // clear
            }
            if (_isArray(mix)) {
                size = mix.length;
                if (size < 16) {
                    rv.push(0x90 + size);
                } else if (size < 0x10000) { // 16
                    rv.push(0xdc, size >> 8, size & 0xff);
                } else if (size < 0x100000000) { // 32
                    rv.push(0xdd, size >>> 24, (size >> 16) & 0xff,
                                               (size >>  8) & 0xff, size & 0xff);
                }
                for (i = 0; i < size; ++i) {
                    encode(rv, mix[i], depth);
                }
            } else { // hash
                // http://d.hatena.ne.jp/uupaa/20101129
                pos = rv.length; // keep rewrite position
                rv.push(0); // placeholder
                size = 0;
                for (i in mix) {
                    ++size;
                    encode(rv, i,      depth);
                    encode(rv, mix[i], depth);
                }
                if (size < 16) {
                    rv[pos] = 0x80 + size; // rewrite
                } else if (size < 0x10000) { // 16
                    rv.splice(pos, 1, 0xde, size >> 8, size & 0xff);
                } else if (size < 0x100000000) { // 32
                    rv.splice(pos, 1, 0xdf,
                              size >>> 24, (size >> 16) & 0xff,
                                           (size >>  8) & 0xff, size & 0xff);
                }
            }
        }
    }
    return rv;
}

// inner - decoder
function decode() { // @return Mix:
    var size, i, iz, c, num = 0,
        sign, exp, frac, ary, hash,
        buf = _buf, type = buf[++_idx];

    if (type >= 0xe0) {             // Negative FixNum (111x xxxx) (-32 ~ -1)
        return type - 0x100;
    }
    if (type < 0xc0) {
        if (type < 0x80) {          // Positive FixNum (0xxx xxxx) (0 ~ 127)
            return type;
        }
        if (type < 0x90) {          // FixMap (1000 xxxx)
            num  = type - 0x80;
            type = 0x80;
        } else if (type < 0xa0) {   // FixArray (1001 xxxx)
            num  = type - 0x90;
            type = 0x90;
        } else { // if (type < 0xc0) {   // FixRaw (101x xxxx)
            num  = type - 0xa0;
            type = 0xa0;
        }
    }
    switch (type) {
    case 0xc0:  return null;
    case 0xc2:  return false;
    case 0xc3:  return true;
    case 0xca:  // float
                num = buf[++_idx] * 0x1000000 + (buf[++_idx] << 16) +
                                                (buf[++_idx] <<  8) + buf[++_idx];
                sign =  num & 0x80000000;    //  1bit
                exp  = (num >> 23) & 0xff;   //  8bits
                frac =  num & 0x7fffff;      // 23bits
                if (!num || num === 0x80000000) { // 0.0 or -0.0
                    return 0;
                }
                if (exp === 0xff) { // NaN or Infinity
                    return frac ? NaN : Infinity;
                }
                return (sign ? -1 : 1) *
                            (frac | 0x800000) * Math.pow(2, exp - 127 - 23); // 127: bias
    case 0xcb:  // double
                num = buf[++_idx] * 0x1000000 + (buf[++_idx] << 16) +
                                                (buf[++_idx] <<  8) + buf[++_idx];
                sign =  num & 0x80000000;    //  1bit
                exp  = (num >> 20) & 0x7ff;  // 11bits
                frac =  num & 0xfffff;       // 52bits - 32bits (high word)
                if (!num || num === 0x80000000) { // 0.0 or -0.0
                    _idx += 4;
                    return 0;
                }
                if (exp === 0x7ff) { // NaN or Infinity
                    _idx += 4;
                    return frac ? NaN : Infinity;
                }
                num = buf[++_idx] * 0x1000000 + (buf[++_idx] << 16) +
                                                (buf[++_idx] <<  8) + buf[++_idx];
                return (sign ? -1 : 1) *
                            ((frac | 0x100000) * Math.pow(2, exp - 1023 - 20) // 1023: bias
                             + num * Math.pow(2, exp - 1023 - 52));
    // 0xcf: uint64, 0xce: uint32, 0xcd: uint16
    case 0xcf:  num =  buf[++_idx] * 0x1000000 + (buf[++_idx] << 16) +
                                                 (buf[++_idx] <<  8) + buf[++_idx];
                return num * 0x100000000 +
                       buf[++_idx] * 0x1000000 + (buf[++_idx] << 16) +
                                                 (buf[++_idx] <<  8) + buf[++_idx];
    case 0xce:  num += buf[++_idx] * 0x1000000 + (buf[++_idx] << 16);
    case 0xcd:  num += buf[++_idx] << 8;
    case 0xcc:  return num + buf[++_idx];
    // 0xd3: int64, 0xd2: int32, 0xd1: int16, 0xd0: int8
    case 0xd3:  num = buf[++_idx];
                if (num & 0x80) { // sign -> avoid overflow
                    return ((num         ^ 0xff) * 0x100000000000000 +
                            (buf[++_idx] ^ 0xff) *   0x1000000000000 +
                            (buf[++_idx] ^ 0xff) *     0x10000000000 +
                            (buf[++_idx] ^ 0xff) *       0x100000000 +
                            (buf[++_idx] ^ 0xff) *         0x1000000 +
                            (buf[++_idx] ^ 0xff) *           0x10000 +
                            (buf[++_idx] ^ 0xff) *             0x100 +
                            (buf[++_idx] ^ 0xff) + 1) * -1;
                }
                return num         * 0x100000000000000 +
                       buf[++_idx] *   0x1000000000000 +
                       buf[++_idx] *     0x10000000000 +
                       buf[++_idx] *       0x100000000 +
                       buf[++_idx] *         0x1000000 +
                       buf[++_idx] *           0x10000 +
                       buf[++_idx] *             0x100 +
                       buf[++_idx];
    case 0xd2:  num  =  buf[++_idx] * 0x1000000 + (buf[++_idx] << 16) +
                       (buf[++_idx] << 8) + buf[++_idx];
                return num < 0x80000000 ? num : num - 0x100000000; // 0x80000000 * 2
    case 0xd1:  num  = (buf[++_idx] << 8) + buf[++_idx];
                return num < 0x8000 ? num : num - 0x10000; // 0x8000 * 2
    case 0xd0:  num  =  buf[++_idx];
                return num < 0x80 ? num : num - 0x100; // 0x80 * 2
    // 0xdb: raw32, 0xda: raw16, 0xa0: raw ( string )
    case 0xdb:  num +=  buf[++_idx] * 0x1000000 + (buf[++_idx] << 16);
    case 0xda:  num += (buf[++_idx] << 8)       +  buf[++_idx];
    case 0xa0:  // utf8.decode
                for (ary = [], i = _idx, iz = i + num; i < iz; ) {
                    c = buf[++i]; // lead byte
                    ary.push(c < 0x80 ? c : // ASCII(0x00 ~ 0x7f)
                             c < 0xe0 ? ((c & 0x1f) <<  6 | (buf[++i] & 0x3f)) :
                                        ((c & 0x0f) << 12 | (buf[++i] & 0x3f) << 6
                                                          | (buf[++i] & 0x3f)));
                }
                _idx = i;
                return ary.length < 10240 ? _toString.apply(null, ary)
                                          : byteArrayToByteString(ary);
    // 0xdf: map32, 0xde: map16, 0x80: map
    case 0xdf:  num +=  buf[++_idx] * 0x1000000 + (buf[++_idx] << 16);
    case 0xde:  num += (buf[++_idx] << 8)       +  buf[++_idx];
    case 0x80:  hash = {};
                while (num--) {
                    // make key/value pair
                    size = buf[++_idx] - 0xa0;

                    for (ary = [], i = _idx, iz = i + size; i < iz; ) {
                        c = buf[++i]; // lead byte
                        ary.push(c < 0x80 ? c : // ASCII(0x00 ~ 0x7f)
                                 c < 0xe0 ? ((c & 0x1f) <<  6 | (buf[++i] & 0x3f)) :
                                            ((c & 0x0f) << 12 | (buf[++i] & 0x3f) << 6
                                                              | (buf[++i] & 0x3f)));
                    }
                    _idx = i;
                    hash[_toString.apply(null, ary)] = decode();
                }
                return hash;
    // 0xdd: array32, 0xdc: array16, 0x90: array
    case 0xdd:  num +=  buf[++_idx] * 0x1000000 + (buf[++_idx] << 16);
    case 0xdc:  num += (buf[++_idx] << 8)       +  buf[++_idx];
    case 0x90:  ary = [];
                while (num--) {
                    ary.push(decode());
                }
                return ary;
    }
    return;
}

// inner - byteArray To ByteString
function byteArrayToByteString(byteArray) { // @param ByteArray
                                            // @return String
    // http://d.hatena.ne.jp/uupaa/20101128
    try {
        return _toString.apply(this, byteArray); // toString
    } catch(err) {
        ; // avoid "Maximum call stack size exceeded"
    }
    var rv = [], i = 0, iz = byteArray.length, num2bin = _num2bin;

    for (; i < iz; ++i) {
        rv[i] = num2bin[byteArray[i]];
    }
    return rv.join("");
}

// msgpack.download - load from server
function msgpackdownload(url,        // @param String:
                         option,     // @param Hash: { worker, timeout, before, after }
                                     //    option.worker - Boolean(= false): true is use WebWorkers
                                     //    option.timeout - Number(= 10): timeout sec
                                     //    option.before  - Function: before(xhr, option)
                                     //    option.after   - Function: after(xhr, option, { status, ok })
                         callback) { // @param Function: callback(data, option, { status, ok })
                                     //    data   - Mix/null:
                                     //    option - Hash:
                                     //    status - Number: HTTP status code
                                     //    ok     - Boolean:
    option.method = "GET";
    option.binary = true;
    ajax(url, option, callback);
}

// msgpack.upload - save to server
function msgpackupload(url,        // @param String:
                       option,     // @param Hash: { data, worker, timeout, before, after }
                                   //    option.data - Mix:
                                   //    option.worker - Boolean(= false): true is use WebWorkers
                                   //    option.timeout - Number(= 10): timeout sec
                                   //    option.before  - Function: before(xhr, option)
                                   //    option.after   - Function: after(xhr, option, { status, ok })
                       callback) { // @param Function: callback(data, option, { status, ok })
                                   //    data   - String: responseText
                                   //    option - Hash:
                                   //    status - Number: HTTP status code
                                   //    ok     - Boolean:
    option.method = "PUT";
    option.binary = true;

    if (option.worker && globalScope.Worker) {
        var worker = new Worker(msgpack.worker);

        worker.onmessage = function(event) {
            option.data = event.data;
            ajax(url, option, callback);
        };
        worker.postMessage({ method: "pack", data: option.data });
    } else {
        // pack and base64 encode
        option.data = base64encode(msgpackpack(option.data));
        ajax(url, option, callback);
    }
}

// inner -
function ajax(url,        // @param String:
              option,     // @param Hash: { data, ifmod, method, timeout,
                          //                header, binary, before, after, worker }
                          //    option.data    - Mix: upload data
                          //    option.ifmod   - Boolean: true is "If-Modified-Since" header
                          //    option.method  - String: "GET", "POST", "PUT"
                          //    option.timeout - Number(= 10): timeout sec
                          //    option.header  - Hash(= {}): { key: "value", ... }
                          //    option.binary  - Boolean(= false): true is binary data
                          //    option.before  - Function: before(xhr, option)
                          //    option.after   - Function: after(xhr, option, { status, ok })
                          //    option.worker  - Boolean(= false): true is use WebWorkers
              callback) { // @param Function: callback(data, option, { status, ok })
                          //    data   - String/Mix/null:
                          //    option - Hash:
                          //    status - Number: HTTP status code
                          //    ok     - Boolean:
    function readyStateChange() {
        if (xhr.readyState === 4) {
            var data, status = xhr.status, worker, byteArray,
                rv = { status: status, ok: status >= 200 && status < 300 };

            if (!run++) {
                if (method === "PUT") {
                    data = rv.ok ? xhr.responseText : "";
                } else {
                    if (rv.ok) {
                        if (option.worker && globalScope.Worker) {
                            worker = new Worker(msgpack.worker);
                            worker.onmessage = function(event) {
                                callback(event.data, option, rv);
                            };
                            worker.postMessage({ method: "unpack",
                                                 data: xhr.responseText });
                            gc();
                            return;
                        } else {
                            byteArray = _ie ? toByteArrayIE(xhr)
                                            : toByteArray(xhr.responseText);
                            data = msgpackunpack(byteArray);
                        }
                    }
                }
                after && after(xhr, option, rv);
                callback(data, option, rv);
                gc();
            }
        }
    }

    function ng(abort, status) {
        if (!run++) {
            var rv = { status: status || 400, ok: false };

            after && after(xhr, option, rv);
            callback(null, option, rv);
            gc(abort);
        }
    }

    function gc(abort) {
        abort && xhr && xhr.abort && xhr.abort();
        watchdog && (clearTimeout(watchdog), watchdog = 0);
        xhr = null;
        globalScope.addEventListener &&
            globalScope.removeEventListener("beforeunload", ng, false);
    }

    var watchdog = 0,
        method = option.method || "GET",
        header = option.header || {},
        before = option.before,
        after = option.after,
        data = option.data || null,
        xhr = globalScope.XMLHttpRequest ? new XMLHttpRequest() :
              globalScope.ActiveXObject  ? new ActiveXObject("Microsoft.XMLHTTP") :
              null,
        run = 0, i,
        overrideMimeType = "overrideMimeType",
        setRequestHeader = "setRequestHeader",
        getbinary = method === "GET" && option.binary;

    try {
        xhr.onreadystatechange = readyStateChange;
        xhr.open(method, url, true); // ASync

        before && before(xhr, option);

        getbinary && xhr[overrideMimeType] &&
            xhr[overrideMimeType]("text/plain; charset=x-user-defined");
        data &&
            xhr[setRequestHeader]("Content-Type",
                                  "application/x-www-form-urlencoded");

        for (i in header) {
            xhr[setRequestHeader](i, header[i]);
        }

        globalScope.addEventListener &&
            globalScope.addEventListener("beforeunload", ng, false); // 400: Bad Request

        xhr.send(data);
        watchdog = setTimeout(function() {
            ng(1, 408); // 408: Request Time-out
        }, (option.timeout || 10) * 1000);
    } catch (err) {
        ng(0, 400); // 400: Bad Request
    }
}

// inner - BinaryString To ByteArray
function toByteArray(data) { // @param BinaryString: "\00\01"
                             // @return ByteArray: [0x00, 0x01]
    var rv = [], bin2num = _bin2num, remain,
        ary = data.split(""),
        i = -1, iz;

    iz = ary.length;
    remain = iz % 8;

    while (remain--) {
        ++i;
        rv[i] = bin2num[ary[i]];
    }
    remain = iz >> 3;
    while (remain--) {
        rv.push(bin2num[ary[++i]], bin2num[ary[++i]],
                bin2num[ary[++i]], bin2num[ary[++i]],
                bin2num[ary[++i]], bin2num[ary[++i]],
                bin2num[ary[++i]], bin2num[ary[++i]]);
    }
    return rv;
}

// inner - BinaryString to ByteArray
function toByteArrayIE(xhr) {
    var rv = [], data, remain,
        charCodeAt = "charCodeAt",
        loop, v0, v1, v2, v3, v4, v5, v6, v7,
        i = -1, iz;

    iz = vblen(xhr);
    data = vbstr(xhr);
    loop = Math.ceil(iz / 2);
    remain = loop % 8;

    while (remain--) {
        v0 = data[charCodeAt](++i); // 0x00,0x01 -> 0x0100
        rv.push(v0 & 0xff, v0 >> 8);
    }
    remain = loop >> 3;
    while (remain--) {
        v0 = data[charCodeAt](++i);
        v1 = data[charCodeAt](++i);
        v2 = data[charCodeAt](++i);
        v3 = data[charCodeAt](++i);
        v4 = data[charCodeAt](++i);
        v5 = data[charCodeAt](++i);
        v6 = data[charCodeAt](++i);
        v7 = data[charCodeAt](++i);
        rv.push(v0 & 0xff, v0 >> 8, v1 & 0xff, v1 >> 8,
                v2 & 0xff, v2 >> 8, v3 & 0xff, v3 >> 8,
                v4 & 0xff, v4 >> 8, v5 & 0xff, v5 >> 8,
                v6 & 0xff, v6 >> 8, v7 & 0xff, v7 >> 8);
    }
    iz % 2 && rv.pop();

    return rv;
}

// inner - base64.encode
function base64encode(data) { // @param ByteArray:
                              // @return Base64String:
    var rv = [],
        c = 0, i = -1, iz = data.length,
        pad = [0, 2, 1][data.length % 3],
        num2bin = _num2bin,
        num2b64 = _num2b64;

    if (globalScope.btoa) {
        while (i < iz) {
            rv.push(num2bin[data[++i]]);
        }
        return btoa(rv.join(""));
    }
    --iz;
    while (i < iz) {
        c = (data[++i] << 16) | (data[++i] << 8) | (data[++i]); // 24bit
        rv.push(num2b64[(c >> 18) & 0x3f],
                num2b64[(c >> 12) & 0x3f],
                num2b64[(c >>  6) & 0x3f],
                num2b64[ c        & 0x3f]);
    }
    pad > 1 && (rv[rv.length - 2] = "=");
    pad > 0 && (rv[rv.length - 1] = "=");
    return rv.join("");
}

// --- init ---
(function() {
    var i = 0, v;

    for (; i < 0x100; ++i) {
        v = _toString(i);
        _bin2num[v] = i; // "\00" -> 0x00
        _num2bin[i] = v; //     0 -> "\00"
    }
    // http://twitter.com/edvakf/statuses/15576483807
    for (i = 0x80; i < 0x100; ++i) { // [Webkit][Gecko]
        _bin2num[_toString(0xf700 + i)] = i; // "\f780" -> 0x80
    }
})();

_ie && document.write('<script type="text/vbscript">\
Function vblen(b)vblen=LenB(b.responseBody)End Function\n\
Function vbstr(b)vbstr=CStr(b.responseBody)+chr(0)End Function</'+'script>');

})(this);

/*
Copyright (c) 2012, Dmytro V. Dogadailo <entropyhacker@gmail.com>

RJSON is Recursive JSON.

RJSON converts any JSON data collection into more compact recursive
form. Compressed data is still JSON and can be parsed with `JSON.parse`. RJSON
can compress not only homogeneous collections, but any data sets with free
structure.

RJSON is stream single-pass compressor, it extracts data schemes from a
document, assign each schema unique number and use this number instead of
repeating same property names again and again.

Bellow you can see same document in both forms.

JSON:

{
    "id": 7,
    "tags": ["programming", "javascript"],
    "users": [
    {"first": "Homer", "last": "Simpson"},
    {"first": "Hank", "last": "Hill"},
    {"first": "Peter", "last": "Griffin"}
    ],
    "books": [
    {"title": "JavaScript", "author": "Flanagan", "year": 2006},
    {"title": "Cascading Style Sheets", "author": "Meyer", "year": 2004}
    ]
}

RJSON:

{
    "id": 7,
    "tags": ["programming", "javascript"],
    "users": [
    {"first": "Homer", "last": "Simpson"},
        [2, "Hank", "Hill", "Peter", "Griffin"]
    ],
    "books": [
    {"title": "JavaScript", "author": "Flanagan", "year": 2006},
        [3, "Cascading Style Sheets", "Meyer", 2004]
    ]
}

RJSON allows to:

* reduce JSON data size and network traffic when gzip isn't available. For
example, in-browser 3D-modeling tools like [Mydeco
3D-planner](http://mydeco.com/3d-planner/) may process and send to server
megabytes of JSON-data;
* analyze large collections of JSON-data without
unpacking of whole dataset. RJSON-data is still JSON-data, so it can be
traversed and analyzed after parsing and fully unpacked only if a document meets
some conditions.

*/

var RJSON = (function() {
    'use strict';

    var hasOwnProperty = Object.prototype.hasOwnProperty,
    toString = Object.prototype.toString,
    getKeys = Object.keys || _keys,
    isArray = Array.isArray || _isArray;

    /**
     * @param {*} Any valid for JSON javascript data.
     * @return {*} Packed javascript data, usually a dictionary.
     */
    function pack(data) {
        var schemas = {}, maxSchemaIndex = 0;

        function encodeArray(value) {
            var len = value.length, encoded = [];
            if (len === 0) return [];
            if (typeof value[0] === 'number') {
                encoded.push(0);  // 0 is schema index for Array
            }
            for (var i = 0; i < len; i++) {
                var v = value[i],
                current = encode(v),
                last = encoded[encoded.length - 1];
                if (isEncodedObject(current) &&
                    isArray(last) && current[0] === last[0]) {
                    // current and previous object have same schema,
                    // so merge their values into one array
                    encoded[encoded.length - 1] =
                        last.concat(current.slice(1));
                } else {
                    encoded.push(current);
                }
            }
            return encoded;
        }

        function encodeObject(value) {
            var schemaKeys = getKeys(value).sort();
            if (schemaKeys.length === 0) {
                return {};
            }
            var encoded,
            schema = schemaKeys.length + ':' + schemaKeys.join('|'),
            schemaIndex = schemas[schema];
            if (schemaIndex) { // known schema
                encoded = [schemaIndex];
                for (var i = 0, k; k = schemaKeys[i++]; ) {
                    encoded[i] = encode(value[k]);
                }
            } else {    // new schema
                schemas[schema] = ++maxSchemaIndex;
                encoded = {};
                for (var i = 0, k; k = schemaKeys[i++]; ) {
                    encoded[k] = encode(value[k]);
                }
            }
            return encoded;
        }

        function encode(value) {
            if (typeof value !== 'object' || !value) {
                // non-objects or null return as is
                return value;
            } else if (isArray(value)) {
                return encodeArray(value);
            } else {
                return encodeObject(value);
            }
        }

        return encode(data);
    }

    /**
     * @param {*} data Packed javascript data.
     * @return {*} Original data.
     */
    function unpack(data) {
        var schemas = {}, maxSchemaIndex = 0;

        function parseArray(value) {
            if (value.length === 0) {
                return [];
            } else if (value[0] === 0 || typeof value[0] !== 'number') {
                return decodeArray(value);
            } else {
                return decodeObject(value);
            }
        }

        function decodeArray(value) {
            var len = value.length, decoded = []; // decode array of something
            for (var i = (value[0] === 0 ? 1 : 0); i < len; i++) {
                var v = value[i], obj = decode(v);
                if (isEncodedObject(v) && isArray(obj)) {
                    // several objects was encoded into single array
                    decoded = decoded.concat(obj);
                } else {
                    decoded.push(obj);
                }
            }
            return decoded;
        }

        function decodeObject(value) {
            var schemaKeys = schemas[value[0]],
            schemaLen = schemaKeys.length,
            total = (value.length - 1) / schemaLen,
            decoded;
            if (total > 1) {
                decoded = []; // array of objects with same schema
                for (var i = 0; i < total; i++) {
                    var obj = {};
                    for (var j = 0, k; k = schemaKeys[j++]; ) {
                        obj[k] = decode(value[i * schemaLen + j]);
                    }
                    decoded.push(obj);
                }
            } else {
                decoded = {};
                for (var j = 0, k; k = schemaKeys[j++]; ) {
                    decoded[k] = decode(value[j]);
                }
            }
            return decoded;
        }

        function decodeNewObject(value) {
            var schemaKeys = getKeys(value).sort();
            if (schemaKeys.length === 0) {
                return {};
            }
            schemas[++maxSchemaIndex] = schemaKeys;
            var decoded = {};
            for (var i = 0, k; k = schemaKeys[i++]; ) {
                decoded[k] = decode(value[k]);
            }
            return decoded;
        }

        function decode(value) {
            if (typeof value !== 'object' || !value) {
                // non-objects or null return as is
                return value;
            } else if (isArray(value)) {
                return parseArray(value);
            } else { // object with new schema
                return decodeNewObject(value);
            }
        }

        return decode(data);
    }

    /**
     * Object is encoded as array and object schema index is stored as
     * first item of the array. Valid schema index should be greater than 0,
     * because 0 is reserved for Array schema.
     * Several objects with same schema can be stored in the one array.
     * @param {*} value encoded value to check.
     * @return {boolean} true if value contains an encoded object or several
     * objects with same schema.
     */
    function isEncodedObject(value) {
        return isArray(value) && typeof value[0] === 'number' && value[0] !== 0;
    }

    function _keys(obj) {
        var keys = [], k;
        for (k in obj) {
            if (hasOwnProperty.call(obj, k)) {
                keys.push(k);
            }
        }
        return keys;
    }

    function _isArray(obj) {
        return toString.apply(obj) === '[object Array]';
    }

    return {
        pack: pack,
        unpack: unpack
    };

}());


// export for node.js
if (typeof module != 'undefined' && module.exports) {
    module.exports = RJSON;
}

;// lib/handlebars/base.js
var Handlebars = {};

Handlebars.VERSION = "1.0.beta.6";

Handlebars.helpers  = {};
Handlebars.partials = {};

Handlebars.registerHelper = function(name, fn, inverse) {
  if(inverse) { fn.not = inverse; }
  this.helpers[name] = fn;
};

Handlebars.registerPartial = function(name, str) {
  this.partials[name] = str;
};

Handlebars.registerHelper('helperMissing', function(arg) {
  if(arguments.length === 2) {
    return undefined;
  } else {
    throw new Error("Could not find property '" + arg + "'");
  }
});

var toString = Object.prototype.toString, functionType = "[object Function]";

Handlebars.registerHelper('blockHelperMissing', function(context, options) {
  var inverse = options.inverse || function() {}, fn = options.fn;


  var ret = "";
  var type = toString.call(context);

  if(type === functionType) { context = context.call(this); }

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return inverse(this);
  } else if(type === "[object Array]") {
    if(context.length > 0) {
      for(var i=0, j=context.length; i<j; i++) {
        ret = ret + fn(context[i]);
      }
    } else {
      ret = inverse(this);
    }
    return ret;
  } else {
    return fn(context);
  }
});

Handlebars.registerHelper('each', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var ret = "";

  if(context && context.length > 0) {
    for(var i=0, j=context.length; i<j; i++) {
      ret = ret + fn(context[i]);
    }
  } else {
    ret = inverse(this);
  }
  return ret;
});

Handlebars.registerHelper('if', function(context, options) {
  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if(!context || Handlebars.Utils.isEmpty(context)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

Handlebars.registerHelper('unless', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  options.fn = inverse;
  options.inverse = fn;

  return Handlebars.helpers['if'].call(this, context, options);
});

Handlebars.registerHelper('with', function(context, options) {
  return options.fn(context);
});

Handlebars.registerHelper('log', function(context) {
  Handlebars.log(context);
});
;
// lib/handlebars/utils.js
Handlebars.Exception = function(message) {
  var tmp = Error.prototype.constructor.apply(this, arguments);

  for (var p in tmp) {
    if (tmp.hasOwnProperty(p)) { this[p] = tmp[p]; }
  }

  this.message = tmp.message;
};
Handlebars.Exception.prototype = new Error;

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

(function() {
  var escape = {
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var badChars = /&(?!\w+;)|[<>"'`]/g;
  var possible = /[&<>"'`]/;

  var escapeChar = function(chr) {
    return escape[chr] || "&amp;";
  };

  Handlebars.Utils = {
    escapeExpression: function(string) {
      // don't escape SafeStrings, since they're already safe
      if (string instanceof Handlebars.SafeString) {
        return string.toString();
      } else if (string == null || string === false) {
        return "";
      }

      if(!possible.test(string)) { return string; }
      return string.replace(badChars, escapeChar);
    },

    isEmpty: function(value) {
      if (typeof value === "undefined") {
        return true;
      } else if (value === null) {
        return true;
      } else if (value === false) {
        return true;
      } else if(Object.prototype.toString.call(value) === "[object Array]" && value.length === 0) {
        return true;
      } else {
        return false;
      }
    }
  };
})();;
// lib/handlebars/runtime.js
Handlebars.VM = {
  template: function(templateSpec) {
    // Just add water
    var container = {
      escapeExpression: Handlebars.Utils.escapeExpression,
      invokePartial: Handlebars.VM.invokePartial,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          return Handlebars.VM.program(fn, data);
        } else if(programWrapper) {
          return programWrapper;
        } else {
          programWrapper = this.programs[i] = Handlebars.VM.program(fn);
          return programWrapper;
        }
      },
      programWithDepth: Handlebars.VM.programWithDepth,
      noop: Handlebars.VM.noop
    };

    return function(context, options) {
      options = options || {};
      return templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);
    };
  },

  programWithDepth: function(fn, data, $depth) {
    var args = Array.prototype.slice.call(arguments, 2);

    return function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
  },
  program: function(fn, data) {
    return function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
  },
  noop: function() { return ""; },
  invokePartial: function(partial, name, context, helpers, partials, data) {
    options = { helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Handlebars.Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    } else if (!Handlebars.compile) {
      throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    } else {
      partials[name] = Handlebars.compile(partial);
      return partials[name](context, options);
    }
  }
};

Handlebars.template = Handlebars.VM.template;
;

/**
 * Copyright (c) 2007-2013, Kaazing Corporation. All rights reserved.
 */

var browser=null;
if(typeof(ActiveXObject)!="undefined"){if(navigator.userAgent.indexOf("MSIE 10")!=-1){browser="chrome"
}else{browser="ie"
}}else{if(Object.prototype.toString.call(window.opera)=="[object Opera]"){browser="opera"
}else{if(navigator.vendor.indexOf("Apple")!=-1){browser="safari";
if(navigator.userAgent.indexOf("iPad")!=-1||navigator.userAgent.indexOf("iPhone")!=-1){browser.ios=true
}}else{if(navigator.vendor.indexOf("Google")!=-1){if(navigator.userAgent.indexOf("Android")!=-1){browser="android"
}else{browser="chrome"
}}else{if(navigator.product=="Gecko"&&window.find&&!navigator.savePreferences){browser="firefox"
}else{throw new Error("couldn't detect browser")
}}}}}switch(browser){case"ie":(function(){if(document.createEvent===undefined){var a=function(){};
a.prototype.initEvent=function(h,j,g){this.type=h;
this.bubbles=j;
this.cancelable=g
};
document.createEvent=function(g){if(g!="Events"){throw new Error("Unsupported event name: "+g)
}return new a()
}
}document._w_3_c_d_o_m_e_v_e_n_t_s_createElement=document.createElement;
document.createElement=function(g){var j=this._w_3_c_d_o_m_e_v_e_n_t_s_createElement(g);
if(j.addEventListener===undefined){var h={};
j.addEventListener=function(l,m,k){j.attachEvent("on"+l,m);
return e(h,l,m,k)
};
j.removeEventListener=function(l,m,k){return d(h,l,m,k)
};
j.dispatchEvent=function(k){return f(h,k)
}
}return j
};
if(window.addEventListener===undefined){var b=document.createElement("div");
var c=(typeof(postMessage)==="undefined");
window.addEventListener=function(h,j,g){if(c&&h=="message"){b.addEventListener(h,j,g)
}else{window.attachEvent("on"+h,j)
}};
window.removeEventListener=function(h,j,g){if(c&&h=="message"){b.removeEventListener(h,j,g)
}else{window.detachEvent("on"+h,j)
}};
window.dispatchEvent=function(g){if(c&&g.type=="message"){b.dispatchEvent(g)
}else{window.fireEvent("on"+g.type,g)
}}
}function e(j,h,l,g){if(g){throw new Error("Not implemented")
}var k=j[h]||{};
j[h]=k;
k[l]=l
}function d(j,h,l,g){if(g){throw new Error("Not implemented")
}var k=j[h]||{};
delete k[l]
}function f(j,l){var g=l.type;
var k=j[g]||{};
for(var h in k){if(typeof(k[h])=="function"){try{k[h](l)
}catch(m){}}}}})();
break;
case"chrome":case"android":case"safari":if(typeof(window.postMessage)==="undefined"&&typeof(window.dispatchEvent)==="undefined"&&typeof(document.dispatchEvent)==="function"){window.dispatchEvent=function(a){document.dispatchEvent(a)
};
var addEventListener0=window.addEventListener;
window.addEventListener=function(b,c,a){if(b==="message"){document.addEventListener(b,c,a)
}else{addEventListener0.call(window,b,c,a)
}};
var removeEventListener0=window.removeEventListener;
window.removeEventListener=function(b,c,a){if(b==="message"){document.removeEventListener(b,c,a)
}else{removeEventListener0.call(window,b,c,a)
}}
}break;
case"opera":var addEventListener0=window.addEventListener;
window.addEventListener=function(b,d,a){var c=d;
if(b==="message"){c=function(f){if(f.origin===undefined&&f.uri!==undefined){var e=new URI(f.uri);
delete e.path;
delete e.query;
delete e.fragment;
f.origin=e.toString()
}return d(f)
};
d._$=c
}addEventListener0.call(window,b,c,a)
};
var removeEventListener0=window.removeEventListener;
window.removeEventListener=function(b,d,a){var c=d;
if(b==="message"){c=d._$
}removeEventListener0.call(window,b,c,a)
};
break
}function URI(h){h=h||"";
var b=0;
var e=h.indexOf("://");
if(e!=-1){this.scheme=h.slice(0,e);
b=e+3;
var d=h.indexOf("/",b);
if(d==-1){d=h.length;
h+="/"
}var f=h.slice(b,d);
this.authority=f;
b=d;
this.host=f;
var c=f.indexOf(":");
if(c!=-1){this.host=f.slice(0,c);
this.port=parseInt(f.slice(c+1),10);
if(isNaN(this.port)){throw new Error("Invalid URI syntax")
}}}var g=h.indexOf("?",b);
if(g!=-1){this.path=h.slice(b,g);
b=g+1
}var a=h.indexOf("#",b);
if(a!=-1){if(g!=-1){this.query=h.slice(b,a)
}else{this.path=h.slice(b,a)
}b=a+1;
this.fragment=h.slice(b)
}else{if(g!=-1){this.query=h.slice(b)
}else{this.path=h.slice(b)
}}}(function(){var a=URI.prototype;
a.toString=function(){var e=[];
var d=this.scheme;
if(d!==undefined){e.push(d);
e.push("://");
e.push(this.host);
var c=this.port;
if(c!==undefined){e.push(":");
e.push(c.toString())
}}if(this.path!==undefined){e.push(this.path)
}if(this.query!==undefined){e.push("?");
e.push(this.query)
}if(this.fragment!==undefined){e.push("#");
e.push(this.fragment)
}return e.join("")
};
var b={http:80,ws:80,https:443,wss:443};
URI.replaceProtocol=function(c,e){var d=c.indexOf("://");
if(d>0){return e+c.substr(d)
}else{return""
}}
})();
(function(){Base64={};
Base64.encode=function(g){var f=[];
var h;
var e;
var d;
while(g.length){switch(g.length){case 1:h=g.shift();
f.push(c[(h>>2)&63]);
f.push(c[((h<<4)&48)]);
f.push("=");
f.push("=");
break;
case 2:h=g.shift();
e=g.shift();
f.push(c[(h>>2)&63]);
f.push(c[((h<<4)&48)|((e>>4)&15)]);
f.push(c[(e<<2)&60]);
f.push("=");
break;
default:h=g.shift();
e=g.shift();
d=g.shift();
f.push(c[(h>>2)&63]);
f.push(c[((h<<4)&48)|((e>>4)&15)]);
f.push(c[((e<<2)&60)|((d>>6)&3)]);
f.push(c[d&63]);
break
}}return f.join("")
};
Base64.decode=function(j){if(j.length===0){return[]
}if(j.length%4!==0){throw new Error("Invalid base64 string (must be quads)")
}var o=[];
for(var d=0;
d<j.length;
d+=4){var l=j.charAt(d);
var h=j.charAt(d+1);
var f=j.charAt(d+2);
var e=j.charAt(d+3);
var n=a[l];
var m=a[h];
var k=a[f];
var g=a[e];
o.push(((n<<2)&252)|((m>>4)&3));
if(f!="="){o.push(((m<<4)&240)|((k>>2)&15));
if(e!="="){o.push(((k<<6)&192)|(g&63))
}}}return o
};
var c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
var a={"=":0};
for(var b=0;
b<c.length;
b++){a[c[b]]=b
}if(typeof(window.btoa)==="undefined"){window.btoa=function(f){var d=f.split("");
for(var e=0;
e<d.length;
e++){d[e]=(d[e]).charCodeAt()
}return Base64.encode(d)
};
window.atob=function(d){var e=Base64.decode(d);
for(var f=0;
f<e.length;
f++){e[f]=String.fromCharCode(e[f])
}return e.join("")
}
}})();
var postMessage0=(function(){var g=new URI((browser=="ie")?document.URL:location.href);
var v={http:80,https:443};
if(g.port==null){g.port=v[g.scheme];
g.authority=g.host+":"+g.port
}var z=g.scheme+"://"+g.authority;
var t="/.kr";
if(typeof(postMessage)!=="undefined"){return function(F,E,D){if(typeof(E)!="string"){throw new Error("Unsupported type. Messages must be strings")
}if(D==="null"){D="*"
}switch(browser){case"ie":case"opera":case"firefox":setTimeout(function(){F.postMessage(E,D)
},0);
break;
default:F.postMessage(E,D);
break
}}
}else{function w(D){this.sourceToken=d(Math.floor(Math.random()*(Math.pow(2,32)-1)),8);
this.iframe=D;
this.bridged=false;
this.lastWrite=0;
this.lastRead=0;
this.lastReadIndex=2;
this.lastSyn=0;
this.lastAck=0;
this.queue=[];
this.escapedFragments=[]
}var x=w.prototype;
x.attach=function(J,E,F,D,I,H){this.target=J;
this.targetOrigin=E;
this.targetToken=F;
this.reader=D;
this.writer=I;
this.writerURL=H;
try{this._lastHash=D.location.hash;
this.poll=e
}catch(G){this._lastDocumentURL=D.document.URL;
this.poll=c
}if(J==parent){b(this,true)
}};
x.detach=function(){this.poll=function(){};
delete this.target;
delete this.targetOrigin;
delete this.reader;
delete this.lastFragment;
delete this.writer;
delete this.writerURL
};
x.poll=function(){};
function e(){var D=this.reader.location.hash;
if(this._lastHash!=D){l(this,D.substring(1));
this._lastHash=D
}}function c(){var E=this.reader.document.URL;
if(this._lastDocumentURL!=E){var D=E.indexOf("#");
if(D!=-1){l(this,E.substring(D+1));
this._lastDocumentURL=E
}}}x.post=function(H,G,D){p(this,H);
var J=1000;
var E=escape(G);
var I=[];
while(E.length>J){var F=E.substring(0,J);
E=E.substring(J);
I.push(F)
}I.push(E);
this.queue.push([D,I]);
if(this.writer!=null&&this.lastAck>=this.lastSyn){b(this,false)
}};
function p(O,N){if(O.lastWrite<1&&!O.bridged){if(N.parent==window){var D=O.iframe.src;
var H=D.split("#");
var R=null;
var S=document.getElementsByTagName("meta");
for(var I=0;
I<S.length;
I++){if(S[I].name=="kaazing:resources"){alert('kaazing:resources is no longer supported. Please refer to the Administrator\'s Guide section entitled "Configuring a Web Server to Integrate with Kaazing Gateway"')
}}var F=z;
var L=F.toString()+t+"?.kr=xsp&.kv=10.05";
if(R){var K=new URI(F.toString());
var H=R.split(":");
K.host=H.shift();
if(H.length){K.port=H.shift()
}L=K.toString()+t+"?.kr=xsp&.kv=10.05"
}for(var I=0;
I<S.length;
I++){if(S[I].name=="kaazing:postMessageBridgeURL"){var G=S[I].content;
var M=new URI(G);
var E=new URI(location.toString());
if(!M.authority){M.host=E.host;
M.port=E.port;
M.scheme=E.scheme;
if(G.indexOf("/")!=0){var Q=E.path.split("/");
Q.pop();
Q.push(G);
M.path=Q.join("/")
}}n.BridgeURL=M.toString()
}}if(n.BridgeURL){L=n.BridgeURL
}var P=["I",F,O.sourceToken,escape(L)];
if(H.length>1){var J=H[1];
P.push(escape(J))
}H[1]=P.join("!");
setTimeout(function(){N.location.replace(H.join("#"))
},200);
O.bridged=true
}}}function q(F,E){var D=F.writerURL+"#"+E;
F.writer.location.replace(D)
}function y(D){return parseInt(D,16)
}function d(F,D){var E=F.toString(16);
var G=[];
D-=E.length;
while(D-->0){G.push("0")
}G.push(E);
return G.join("")
}function b(K,L){var I=K.queue;
var O=K.lastRead;
if((I.length>0||L)&&K.lastSyn>K.lastAck){var F=K.lastFrames;
var E=K.lastReadIndex;
if(y(F[E])!=O){F[E]=d(O,8);
q(K,F.join(""))
}}else{if(I.length>0){var M=I.shift();
var G=M[0];
if(G=="*"||G==K.targetOrigin){K.lastWrite++;
var N=M[1];
var H=N.shift();
var J=3;
var F=[K.targetToken,d(K.lastWrite,8),d(O,8),"F",d(H.length,4),H];
var E=2;
if(N.length>0){F[J]="f";
K.queue.unshift(M)
}if(K.resendAck){var D=[K.targetToken,d(K.lastWrite-1,8),d(O,8),"a"];
F=D.concat(F);
E+=D.length
}q(K,F.join(""));
K.lastFrames=F;
K.lastReadIndex=E;
K.lastSyn=K.lastWrite;
K.resendAck=false
}}else{if(L){K.lastWrite++;
var F=[K.targetToken,d(K.lastWrite,8),d(O,8),"a"];
var E=2;
if(K.resendAck){var D=[K.targetToken,d(K.lastWrite-1,8),d(O,8),"a"];
F=D.concat(F);
E+=D.length
}q(K,F.join(""));
K.lastFrames=F;
K.lastReadIndex=E;
K.resendAck=true
}}}}function l(H,K){var D=K.substring(0,8);
var N=y(K.substring(8,16));
var G=y(K.substring(16,24));
var I=K.charAt(24);
if(D!=H.sourceToken){throw new Error("postMessage emulation tampering detected")
}var L=H.lastRead;
var J=L+1;
if(N==J){H.lastRead=J
}if(N==J||N==L){H.lastAck=G
}if(N==J||(N==L&&I=="a")){switch(I){case"f":var F=K.substr(29,y(K.substring(25,29)));
H.escapedFragments.push(F);
b(H,true);
break;
case"F":var E=K.substr(29,y(K.substring(25,29)));
if(H.escapedFragments!==undefined){H.escapedFragments.push(E);
E=H.escapedFragments.join("");
H.escapedFragments=[]
}var M=unescape(E);
C(M,H.target,H.targetOrigin);
b(H,true);
break;
case"a":if(K.length>25){l(H,K.substring(25))
}else{b(H,false)
}break;
default:throw new Error("unknown postMessage emulation payload type: "+I)
}}}function C(F,G,E){var D=document.createEvent("Events");
D.initEvent("message",false,true);
D.data=F;
D.origin=E;
D.source=G;
dispatchEvent(D)
}var k={};
var B=[];
function f(){for(var F=0,D=B.length;
F<D;
F++){var E=B[F];
E.poll()
}setTimeout(f,20)
}function o(G){if(G==parent){return k.parent
}else{if(G.parent==window){var F=document.getElementsByTagName("iframe");
for(var D=0;
D<F.length;
D++){var E=F[D];
if(G==E.contentWindow){return m(E)
}}}else{throw new Error("Generic peer postMessage not yet implemented")
}}}function m(F){var E=F._name;
if(E===undefined){E="iframe$"+String(Math.random()).substring(2);
F._name=E
}var D=k[E];
if(D===undefined){D=new w(F);
k[E]=D
}return D
}function n(G,F,D){if(typeof(F)!="string"){throw new Error("Unsupported type. Messages must be strings")
}if(G==window){if(D=="*"||D==z){C(F,window,z)
}}else{var E=o(G);
E.post(G,F,D)
}}n.attach=function(J,E,G,D,I,H){var F=o(J);
F.attach(J,E,G,D,I,H);
B.push(F)
};
var a=function(F){var G=new URI((browser=="ie")?document.URL:location.href);
var H;
var T={http:80,https:443};
if(G.port==null){G.port=T[G.scheme];
G.authority=G.host+":"+G.port
}var K=unescape(G.fragment||"");
if(K.length>0){var E=K.split(",");
var P=E.shift();
var D=E.shift();
var V=E.shift();
var M=G.scheme+"://"+document.domain+":"+G.port;
var S=G.scheme+"://"+G.authority;
var I=P+"/.kr?.kr=xsc&.kv=10.05";
var O=document.location.toString().split("#")[0];
var L=I+"#"+escape([M,D,escape(O)].join(","));
if(typeof(ActiveXObject)!="undefined"){H=new ActiveXObject("htmlfile");
H.open();
try{H.parentWindow.opener=window
}catch(R){if(F){H.domain=F
}H.parentWindow.opener=window
}H.write("<html>");
H.write("<body>");
if(F){H.write("<script>CollectGarbage();document.domain='"+F+"';<\/script>")
}H.write('<iframe src="'+I+'"></iframe>');
H.write("</body>");
H.write("</html>");
H.close();
var J=H.body.lastChild;
var Q=H.parentWindow;
var W=parent;
var N=W.parent.postMessage0;
if(typeof(N)!="undefined"){J.onload=function(){var X=J.contentWindow;
X.location.replace(L);
N.attach(W,P,V,Q,X,I)
}
}}else{var J=document.createElement("iframe");
J.src=L;
document.body.appendChild(J);
var Q=window;
var U=J.contentWindow;
var W=parent;
var N=W.parent.postMessage0;
if(typeof(N)!="undefined"){N.attach(W,P,V,Q,U,I)
}}}window.onunload=function(){try{var Y=window.parent.parent.postMessage0;
if(typeof(Y)!="undefined"){Y.detach(W)
}}catch(X){}if(typeof(H)!=="undefined"){H.parentWindow.opener=null;
H.open();
H.close();
H=null;
CollectGarbage()
}}
};
n.__init__=function(E,F){var D=a.toString();
E.URI=URI;
E.browser=browser;
if(!F){F=""
}E.setTimeout("("+D+")('"+F+"')",0)
};
n.bridgeURL=false;
n.detach=function(F){var D=o(F);
for(var E=0;
E<B.length;
E++){if(B[E]==D){B.splice(E,1)
}}D.detach()
};
if(window!=top){k.parent=new w();
function h(){var H=new URI((browser=="ie")?document.URL:location.href);
var L=H.fragment||"";
if(document.body!=null&&L.length>0&&L.charAt(0)=="I"){var P=unescape(L);
var I=P.split("!");
if(I.shift()=="I"){var D=I.shift();
var G=I.shift();
var M=unescape(I.shift());
var J=z;
if(D==J){try{parent.location.hash
}catch(E){document.domain=document.domain
}}var K=I.shift()||"";
switch(browser){case"firefox":location.replace([location.href.split("#")[0],K].join("#"));
break;
default:location.hash=K;
break
}var F=o(parent);
F.targetToken=G;
var Q=F.sourceToken;
var O=M+"#"+escape([J,G,Q].join(","));
var N;
N=document.createElement("iframe");
N.src=O;
N.style.position="absolute";
N.style.left="-10px";
N.style.top="10px";
N.style.visibility="hidden";
N.style.width="0px";
N.style.height="0px";
document.body.appendChild(N);
return
}}setTimeout(h,20)
}h()
}var j=document.getElementsByTagName("meta");
for(var u=0;
u<j.length;
u++){if(j[u].name==="kaazing:postMessage"){if("immediate"==j[u].content){var r=function(){var G=document.getElementsByTagName("iframe");
for(var E=0;
E<G.length;
E++){var F=G[E];
if(F.style.KaaPostMessage=="immediate"){F.style.KaaPostMessage="none";
var D=m(F);
p(D,F.contentWindow)
}}setTimeout(r,20)
};
setTimeout(r,20)
}break
}}for(var u=0;
u<j.length;
u++){if(j[u].name==="kaazing:postMessagePrefix"){var A=j[u].content;
if(A!=null&&A.length>0){if(A.charAt(0)!="/"){A="/"+A
}t=A
}}}setTimeout(f,20);
return n
}})();
var XMLHttpRequest0=(function(){var e=new URI((browser=="ie")?document.URL:location.href);
var g={http:80,https:443};
if(e.port==null){e.port=g[e.scheme];
e.authority=e.host+":"+e.port
}var b={};
var a={};
var c=0;
function o(){}var h=o.prototype;
h.readyState=0;
h.responseText="";
h.status=0;
h.statusText="";
h.timeout=0;
h.onreadystatechange;
h.onerror;
h.onload;
h.onprogress;
h.open=function(v,p,r){if(!r){throw new Error("Asynchronous is required for cross-origin XMLHttpRequest emulation")
}switch(this.readyState){case 0:case 4:break;
default:throw new Error("Invalid ready state")
}var u=m(this);
var q=k(this,p);
q.attach(u);
this._pipe=q;
this._requestHeaders=[];
this._method=v;
this._location=p;
this._responseHeaders={};
this.readyState=1;
this.status=0;
this.statusText="";
this.responseText="";
var t=this;
setTimeout(function(){t.readyState=1;
n(t)
},0)
};
h.setRequestHeader=function(p,q){if(this.readyState!==1){throw new Error("Invalid ready state")
}this._requestHeaders.push([p,q])
};
h.send=function(q){if(this.readyState!==1){throw new Error("Invalid ready state")
}var p=this;
setTimeout(function(){p.readyState=2;
n(p)
},0);
l(this,q)
};
h.abort=function(){var p=this._pipe;
if(p!==undefined){p.post(["a",this._id].join(""));
p.detach(this._id)
}};
h.getResponseHeader=function(p){if(this.status==0){throw new Error("Invalid ready state")
}var q=this._responseHeaders;
return q[p]
};
h.getAllResponseHeaders=function(){if(this.status==0){throw new Error("Invalid ready state")
}return this._responseHeaders
};
function n(p){if(typeof(p.onreadystatechange)!=="undefined"){p.onreadystatechange()
}switch(p.readyState){case 3:if(typeof(p.onprogress)!=="undefined"){p.onprogress()
}break;
case 4:if(p.status<100||p.status>=500){if(typeof(p.onerror)!=="undefined"){p.onerror()
}}else{if(typeof(p.onprogress)!=="undefined"){p.onprogress()
}if(typeof(p.onload)!=="undefined"){p.onload()
}}break
}}function m(p){var q=j(c++,8);
a[q]=p;
p._id=q;
return q
}function l(t,v){if(typeof(v)!=="string"){v=""
}var p=t._method.substring(0,10);
var w=t._location;
var r=t._requestHeaders;
var u=j(t.timeout,4);
var x=(t.onprogress!==undefined)?"t":"f";
var z=["s",t._id,p.length,p,j(w.length,4),w,j(r.length,4)];
for(var q=0;
q<r.length;
q++){var y=r[q];
z.push(j(y[0].length,4));
z.push(y[0]);
z.push(j(y[1].length,4));
z.push(y[1])
}z.push(j(v.length,8),v,j(u,4),x);
t._pipe.post(z.join(""))
}function k(x,A){var q=new URI(A);
var r=(q.scheme!=null&&q.authority!=null);
var z=r?q.scheme:e.scheme;
var D=r?q.authority:e.authority;
if(D!=null&&q.port==null){D=q.host+":"+g[z]
}var v=z+"://"+D;
var t=b[v];
if(t!==undefined){if(!("iframe" in t&&"contentWindow" in t.iframe&&typeof t.iframe.contentWindow=="object")){t=b[v]=undefined
}}if(t===undefined){var u=document.createElement("iframe");
u.style.position="absolute";
u.style.left="-10px";
u.style.top="10px";
u.style.visibility="hidden";
u.style.width="0px";
u.style.height="0px";
var C=new URI(v);
C.query=".kr=xs";
C.path="/";
u.src=C.toString();
function B(E){this.buffer.push(E)
}function w(F){var E=this.attached[F];
if(E===undefined){E={};
this.attached[F]=E
}if(E.timerID!==undefined){clearTimeout(E.timerID);
delete E.timerID
}}function y(G){var E=this.attached[G];
if(E!==undefined&&E.timerID===undefined){var F=this;
E.timerID=setTimeout(function(){delete F.attached[G];
var H=a[G];
if(H._pipe==t){delete a[G];
delete H._id;
delete H._pipe
}postMessage0(t.iframe.contentWindow,["d",G].join(""),t.targetOrigin)
},0)
}}t={targetOrigin:v,iframe:u,buffer:[],post:B,attach:w,detach:y,attached:{count:0}};
b[v]=t;
function p(){var E=u.contentWindow;
if(!E){setTimeout(p,20)
}else{postMessage0(E,"I",v)
}}t.handshakeID=setTimeout(function(){b[v]=undefined;
t.post=function(E){x.readyState=4;
x.status=0;
n(x)
};
if(t.buffer.length>0){t.post()
}},30000);
document.body.appendChild(u);
if(typeof(postMessage)==="undefined"){p()
}}return t
}function d(F){var K=F.origin;
var G={http:":80",https:":443"};
var A=K.split(":");
if(A.length===2){K+=G[A[0]]
}var E=b[K];
if(E!==undefined&&E.iframe!==undefined&&F.source==E.iframe.contentWindow){if(F.data=="I"){clearTimeout(E.handshakeID);
var z;
while((z=E.buffer.shift())!==undefined){postMessage0(E.iframe.contentWindow,z,E.targetOrigin)
}E.post=function(O){postMessage0(E.iframe.contentWindow,O,E.targetOrigin)
}
}else{var z=F.data;
if(z.length>=9){var L=0;
var q=z.substring(L,L+=1);
var B=z.substring(L,L+=8);
var t=a[B];
if(t!==undefined){switch(q){case"r":var r={};
var I=f(z.substring(L,L+=2));
for(var H=0;
H<I;
H++){var w=f(z.substring(L,L+=4));
var v=z.substring(L,L+=w);
var u=f(z.substring(L,L+=4));
var C=z.substring(L,L+=u);
r[v]=C
}var D=f(z.substring(L,L+=4));
var N=f(z.substring(L,L+=2));
var J=z.substring(L,L+=N);
switch(D){case 301:case 302:case 307:var y=r.Location;
var B=m(t);
var E=k(t,y);
E.attach(B);
t._pipe=E;
t._method="GET";
t._location=y;
t._redirect=true;
break;
case 403:t.status=D;
n(t);
break;
default:t._responseHeaders=r;
t.status=D;
t.statusText=J;
break
}break;
case"p":var p=parseInt(z.substring(L,L+=1));
if(t._id===B){t.readyState=p;
var M=f(z.substring(L,L+=8));
var x=z.substring(L,L+=M);
if(x.length>0){t.responseText+=x
}n(t)
}else{if(t._redirect){t._redirect=false;
l(t,"")
}}if(p==4){E.detach(B)
}break;
case"e":if(t._id===B){t.status=0;
t.statusText="";
t.readyState=4;
n(t)
}E.detach(B);
break;
case"t":if(t._id===B){t.status=0;
t.statusText="";
t.readyState=4;
if(typeof(t.ontimeout)!=="undefined"){t.ontimeout()
}}E.detach(B);
break
}}}}}else{}}function f(p){return parseInt(p,16)
}function j(r,p){var q=r.toString(16);
var t=[];
p-=q.length;
while(p-->0){t.push("0")
}t.push(q);
return t.join("")
}window.addEventListener("message",d,false);
return o
})();
ByteOrder=function(){};
(function(){var g=ByteOrder.prototype;
g.toString=function(){throw new Error("Abstract")
};
var d=function(n){return(n&255)
};
var j=function(n){return(n&128)?(n|-256):n
};
var c=function(n){return[((n>>8)&255),(n&255)]
};
var m=function(n,o){return(j(n)<<8)|(o&255)
};
var b=function(n,o){return((n&255)<<8)|(o&255)
};
var e=function(n,o,p){return((n&255)<<16)|((o&255)<<8)|(p&255)
};
var k=function(n){return[((n>>16)&255),((n>>8)&255),(n&255)]
};
var l=function(n,o,p){return((n&255)<<16)|((o&255)<<8)|(p&255)
};
var f=function(n){return[((n>>24)&255),((n>>16)&255),((n>>8)&255),(n&255)]
};
var h=function(q,n,o,p){return(j(q)<<24)|((n&255)<<16)|((o&255)<<8)|(p&255)
};
var a=function(t,n,p,r){var o=b(t,n);
var q=b(p,r);
return(o*65536+q)
};
ByteOrder.BIG_ENDIAN=(function(){var o=function(){};
o.prototype=new ByteOrder();
var n=o.prototype;
n._toUnsignedByte=d;
n._toByte=j;
n._fromShort=c;
n._toShort=m;
n._toUnsignedShort=b;
n._toUnsignedMediumInt=e;
n._fromMediumInt=k;
n._toMediumInt=l;
n._fromInt=f;
n._toInt=h;
n._toUnsignedInt=a;
n.toString=function(){return"<ByteOrder.BIG_ENDIAN>"
};
return new o()
})();
ByteOrder.LITTLE_ENDIAN=(function(){var o=function(){};
o.prototype=new ByteOrder();
var n=o.prototype;
n._toByte=j;
n._toUnsignedByte=d;
n._fromShort=function(p){return c(p).reverse()
};
n._toShort=function(p,q){return m(q,p)
};
n._toUnsignedShort=function(p,q){return b(q,p)
};
n._toUnsignedMediumInt=function(p,q,r){return e(r,q,p)
};
n._fromMediumInt=function(p){return k(p).reverse()
};
n._toMediumInt=function(t,u,v,p,q,r){return l(r,q,p,v,u,t)
};
n._fromInt=function(p){return f(p).reverse()
};
n._toInt=function(t,p,q,r){return h(r,q,p,t)
};
n._toUnsignedInt=function(t,p,q,r){return a(r,q,p,t)
};
n.toString=function(){return"<ByteOrder.LITTLE_ENDIAN>"
};
return new o()
})()
})();
function ByteBuffer(a){this.array=a||[];
this._mark=-1;
this.limit=this.capacity=this.array.length;
this.order=ByteOrder.BIG_ENDIAN
}(function(){ByteBuffer.allocate=function(f){var g=new ByteBuffer();
g.capacity=f;
g.limit=f;
return g
};
ByteBuffer.wrap=function(f){return new ByteBuffer(f)
};
var a=ByteBuffer.prototype;
a.autoExpand=true;
a.capacity=0;
a.position=0;
a.limit=0;
a.order=ByteOrder.BIG_ENDIAN;
a.array=[];
a.mark=function(){this._mark=this.position;
return this
};
a.reset=function(){var f=this._mark;
if(f<0){throw new Error("Invalid mark")
}this.position=f;
return this
};
a.compact=function(){this.array.splice(0,this.position);
this.limit-=this.position;
this.position=0;
return this
};
a.duplicate=function(){var f=new ByteBuffer(this.array);
f.position=this.position;
f.limit=this.limit;
f.capacity=this.capacity;
return f
};
a.fill=function(f){d(this,f);
while(f-->0){this.put(0)
}return this
};
a.fillWith=function(f,g){d(this,g);
while(g-->0){this.put(f)
}return this
};
a.indexOf=function(f){var g=this.limit;
var j=this.array;
for(var h=this.position;
h<g;
h++){if(j[h]==f){return h
}}return -1
};
a.put=function(f){d(this,1);
this.putAt(this.position++,f);
return this
};
a.putAt=function(g,f){b(this,g,1);
this.array[g]=this.order._toUnsignedByte(f);
return this
};
a.putUnsigned=function(f){d(this,1);
this.putUnsignedAt(this.position,f&255);
this.position+=1;
return this
};
a.putUnsignedAt=function(g,f){b(this,g,1);
this.putAt(g,f&255);
return this
};
a.putShort=function(f){d(this,2);
this.putShortAt(this.position,f);
this.position+=2;
return this
};
a.putShortAt=function(g,f){b(this,g,2);
this.putBytesAt(g,this.order._fromShort(f));
return this
};
a.putUnsignedShort=function(f){d(this,2);
this.putUnsignedShortAt(this.position,f&65535);
this.position+=2;
return this
};
a.putUnsignedShortAt=function(g,f){b(this,g,2);
this.putShortAt(g,f&65535);
return this
};
a.putMediumInt=function(f){d(this,3);
this.putMediumIntAt(this.position,f);
this.position+=3;
return this
};
a.putMediumIntAt=function(g,f){this.putBytesAt(g,this.order._fromMediumInt(f));
return this
};
a.putInt=function(f){d(this,4);
this.putIntAt(this.position,f);
this.position+=4;
return this
};
a.putIntAt=function(g,f){b(this,g,4);
this.putBytesAt(g,this.order._fromInt(f));
return this
};
a.putUnsignedInt=function(f){d(this,4);
this.putUnsignedIntAt(this.position,f&4294967295);
this.position+=4;
return this
};
a.putUnsignedIntAt=function(g,f){b(this,g,4);
this.putIntAt(g,f&4294967295);
return this
};
a.putString=function(f,g){g.encode(f,this);
return this
};
a.putPrefixedString=function(g,h,j){if(typeof(j)==="undefined"||typeof(j.encode)==="undefined"){throw new Error("ByteBuffer.putPrefixedString: character set parameter missing")
}if(g===0){return this
}d(this,g);
var f=h.length;
switch(g){case 1:this.put(f);
break;
case 2:this.putShort(f);
break;
case 4:this.putInt(f);
break
}j.encode(h,this);
return this
};
a.putBytes=function(f){d(this,f.length);
this.putBytesAt(this.position,f);
this.position+=f.length;
return this
};
a.putBytesAt=function(m,h){b(this,m,h.length);
for(var l=0,g=m,f=h.length;
l<f;
l++,g++){this.putAt(g,h[l])
}return this
};
a.putBuffer=function(f){this.putBytes(f.array.slice(f.position,f.limit));
return this
};
a.putBufferAt=function(g,f){this.putBytesAt(g,f.array.slice(f.position,f.limit));
return this
};
a.get=function(){e(this,1);
return this.getAt(this.position++)
};
a.getAt=function(f){c(this,f,1);
return this.order._toByte(this.array[f])
};
a.getUnsigned=function(){e(this,1);
var f=this.getUnsignedAt(this.position);
this.position+=1;
return f
};
a.getUnsignedAt=function(f){c(this,f,1);
return this.order._toUnsignedByte(this.array[f])
};
a.getBytes=function(h){e(this,h);
var f=new Array();
for(var g=0;
g<h;
g++){f.push(this.order._toByte(this.array[g+this.position]))
}this.position+=h;
return f
};
a.getBytesAt=function(g,j){c(this,g,j);
var f=new Array();
this.position=g;
for(var h=0;
h<j;
h++){f.push(this.order._toByte(this.array[h+this.position]))
}this.position+=j;
return f
};
a.getShort=function(){e(this,2);
var f=this.getShortAt(this.position);
this.position+=2;
return f
};
a.getShortAt=function(f){c(this,f,2);
var g=this.array;
return this.order._toShort(g[f++],g[f++])
};
a.getUnsignedShort=function(){e(this,2);
var f=this.getUnsignedShortAt(this.position);
this.position+=2;
return f
};
a.getUnsignedShortAt=function(f){c(this,f,2);
var g=this.array;
return this.order._toUnsignedShort(g[f++],g[f++])
};
a.getUnsignedMediumInt=function(){var f=this.array;
return this.order._toUnsignedMediumInt(f[this.position++],f[this.position++],f[this.position++])
};
a.getMediumInt=function(){var f=this.getMediumIntAt(this.position);
this.position+=3;
return f
};
a.getMediumIntAt=function(f){var g=this.array;
return this.order._toMediumInt(g[f++],g[f++],g[f++])
};
a.getInt=function(){e(this,4);
var f=this.getIntAt(this.position);
this.position+=4;
return f
};
a.getIntAt=function(f){c(this,f,4);
var g=this.array;
return this.order._toInt(g[f++],g[f++],g[f++],g[f++])
};
a.getUnsignedInt=function(){e(this,4);
var f=this.getUnsignedIntAt(this.position);
this.position+=4;
return f
};
a.getUnsignedIntAt=function(f){c(this,f,4);
var g=this.array;
return this.order._toUnsignedInt(g[f++],g[f++],g[f++],g[f++]);
return val
};
a.getPrefixedString=function(g,h){var f=0;
switch(g||2){case 1:f=this.getUnsigned();
break;
case 2:f=this.getUnsignedShort();
break;
case 4:f=this.getInt();
break
}if(f===0){return""
}var j=this.limit;
try{this.limit=this.position+f;
return h.decode(this)
}finally{this.limit=j
}};
a.getString=function(g){var f=this.position;
var h=this.limit;
var j=this.array;
while(f<h&&j[f]!==0){f++
}try{this.limit=f;
return g.decode(this)
}finally{if(f!=h){this.limit=h;
this.position=f+1
}}};
a.slice=function(){return new ByteBuffer(this.array.slice(this.position,this.limit))
};
a.flip=function(){this.limit=this.position;
this.position=0;
this._mark=-1;
return this
};
a.rewind=function(){this.position=0;
this._mark=-1;
return this
};
a.clear=function(){this.position=0;
this.limit=this.capacity;
this._mark=-1;
return this
};
a.remaining=function(){return(this.limit-this.position)
};
a.hasRemaining=function(){return(this.limit>this.position)
};
a.skip=function(f){this.position+=f;
return this
};
a.getHexDump=function(){var l=this.array;
var k=this.position;
var f=this.limit;
if(k==f){return"empty"
}var j=[];
for(var g=k;
g<f;
g++){var h=(l[g]||0).toString(16);
if(h.length==1){h="0"+h
}j.push(h)
}return j.join(" ")
};
a.toString=a.getHexDump;
a.expand=function(f){return this.expandAt(this.position,f)
};
a.expandAt=function(g,h){var f=g+h;
if(f>this.capacity){this.capacity=f
}if(f>this.limit){this.limit=f
}return this
};
function d(g,f){if(g.autoExpand){g.expand(f)
}return g
}function e(h,g){var f=h.position+g;
if(f>h.limit){throw new Error("Buffer underflow")
}return h
}function c(j,g,h){var f=g+h;
if(g<0||f>j.limit){throw new Error("Index out of bounds")
}return j
}function b(j,g,h){var f=g+h;
if(g<0||f>j.limit){throw new Error("Index out of bounds")
}return j
}})();
function Charset(){}(function(){var a=Charset.prototype;
a.decode=function(b){};
a.encode=function(b){};
Charset.UTF8=(function(){function d(){}d.prototype=new Charset();
var c=d.prototype;
c.decode=function(h){var k=h.remaining()<10000;
var g=[];
while(h.hasRemaining()){var j=h.remaining();
var f=h.getUnsigned();
var l=b(f);
if(j<l){h.skip(-1);
break
}var e=null;
switch(l){case 1:e=f;
break;
case 2:e=((f&31)<<6)|(h.getUnsigned()&63);
break;
case 3:e=((f&15)<<12)|((h.getUnsigned()&63)<<6)|(h.getUnsigned()&63);
break;
case 4:e=((f&7)<<18)|((h.getUnsigned()&63)<<12)|((h.getUnsigned()&63)<<6)|(h.getUnsigned()&63);
break
}if(k){g.push(e)
}else{g.push(String.fromCharCode(e))
}}if(k){return String.fromCharCode.apply(null,g)
}else{return g.join("")
}};
c.encode=function(h,f){for(var g=0;
g<h.length;
g++){var e=h.charCodeAt(g);
if(e<128){f.put(e)
}else{if(e<2048){f.put((e>>6)|192);
f.put((e&63)|128)
}else{if(e<65536){f.put((e>>12)|224);
f.put(((e>>6)&63)|128);
f.put((e&63)|128)
}else{if(e<1114112){f.put((e>>18)|240);
f.put(((e>>12)&63)|128);
f.put(((e>>6)&63)|128);
f.put((e&63)|128)
}else{throw new Error("Invalid UTF-8 string")
}}}}}};
function b(e){if((e&128)===0){return 1
}if((e&32)===0){return 2
}if((e&16)===0){return 3
}if((e&8)===0){return 4
}throw new Error("Invalid UTF-8 bytes")
}return new d()
})()
})();
(function(){var r="AmqpClient";
var m=function(w){this._name=w;
this._level=m.Level.INFO
};
(function(){m.Level={OFF:8,SEVERE:7,WARNING:6,INFO:5,CONFIG:4,FINE:3,FINER:2,FINEST:1,ALL:0};
var C;
var E=document.getElementsByTagName("meta");
for(var z=0;
z<E.length;
z++){if(E[z].name==="kaazing:logging"){C=E[z].content;
break
}}m._logConf={};
if(C){var B=C.split(",");
for(var z=0;
z<B.length;
z++){var x=B[z].split("=");
m._logConf[x[0]]=x[1]
}}var w={};
m.getLogger=function(G){var F=w[G];
if(F===undefined){F=new m(G);
w[G]=F
}return F
};
var A=m.prototype;
A.setLevel=function(F){if(F&&F>=m.Level.ALL&&F<=m.Level.OFF){this._level=F
}};
A.isLoggable=function(H){for(var G in m._logConf){if(this._name.match(G)){var F=m._logConf[G];
if(F){return(m.Level[F]<=H)
}}}return(this._level<=H)
};
var D=function(){};
var y={};
y[m.Level.OFF]=D;
y[m.Level.SEVERE]=(window.console)?(console.error||console.log||D):D;
y[m.Level.WARNING]=(window.console)?(console.warn||console.log||D):D;
y[m.Level.INFO]=(window.console)?(console.info||console.log||D):D;
y[m.Level.CONFIG]=(window.console)?(console.info||console.log||D):D;
y[m.Level.FINE]=(window.console)?(console.debug||console.log||D):D;
y[m.Level.FINER]=(window.console)?(console.debug||console.log||D):D;
y[m.Level.FINEST]=(window.console)?(console.debug||console.log||D):D;
y[m.Level.ALL]=(window.console)?(console.log||D):D;
A.config=function(G,F){this.log(m.Level.CONFIG,G,F)
};
A.entering=function(H,F,I){if(this.isLoggable(m.Level.FINER)){if(browser=="chrome"||browser=="safari"){H=console
}var G=y[m.Level.FINER];
if(I){if(typeof(G)=="object"){G("ENTRY "+F,I)
}else{G.call(H,"ENTRY "+F,I)
}}else{if(typeof(G)=="object"){G("ENTRY "+F)
}else{G.call(H,"ENTRY "+F)
}}}};
A.exiting=function(I,F,H){if(this.isLoggable(m.Level.FINER)){var G=y[m.Level.FINER];
if(browser=="chrome"||browser=="safari"){I=console
}if(H){if(typeof(G)=="object"){G("RETURN "+F,H)
}else{G.call(I,"RETURN "+F,H)
}}else{if(typeof(G)=="object"){G("RETURN "+F)
}else{G.call(I,"RETURN "+F)
}}}};
A.fine=function(G,F){this.log(m.Level.FINE,G,F)
};
A.finer=function(G,F){this.log(m.Level.FINER,G,F)
};
A.finest=function(G,F){this.log(m.Level.FINEST,G,F)
};
A.info=function(G,F){this.log(m.Level.INFO,G,F)
};
A.log=function(I,H,G){if(this.isLoggable(I)){var F=y[I];
if(browser=="chrome"||browser=="safari"){H=console
}if(typeof(F)=="object"){F(G)
}else{F.call(H,G)
}}};
A.severe=function(G,F){this.log(m.Level.SEVERE,G,F)
};
A.warning=function(G,F){this.log(m.Level.WARNING,G,F)
}
})();
var c=m.getLogger("com.kaazing.gateway.client.loader.Utils");
var k=function(z){c.entering(this,"Utils.getMetaValue",z);
var x=document.getElementsByTagName("meta");
for(var y=0;
y<x.length;
y++){if(x[y].name===z){var w=x[y].content;
c.exiting(this,"Utils.getMetaValue",w);
return w
}}c.exiting(this,"Utils.getMetaValue")
};
var g=function(y){c.entering(this,"Utils.arrayCopy",y);
var w=[];
for(var x=0;
x<y.length;
x++){w.push(y[x])
}return w
};
var q=function(A,z){c.entering(this,"Utils.arrayFilter",{array:A,callback:z});
var w=[];
for(var y=0;
y<A.length;
y++){var x=A[y];
if(z(x)){w.push(A[y])
}}return w
};
var d=function(y,w){c.entering(this,"Utils.indexOf",{array:y,searchElement:w});
for(var x=0;
x<y.length;
x++){if(y[x]==w){c.exiting(this,"Utils.indexOf",x);
return x
}}c.exiting(this,"Utils.indexOf",-1);
return -1
};
var o=function(A){c.entering(this,"Utils.decodeByteString",A);
var w=[];
for(var z=0;
z<A.length;
z++){w.push(A.charCodeAt(z)&255)
}var y=new ByteBuffer(w);
var x=j(y,Charset.UTF8);
c.exiting(this,"Utils.decodeByteString",x);
return x
};
var h=function(A){c.entering(this,"Utils.decodeArrayBuffer",A);
var x=new Uint8Array(A);
var w=[];
for(var y=0;
y<x.length;
y++){w.push(x[y])
}var x=new ByteBuffer(w);
var z=j(x,Charset.UTF8);
c.exiting(this,"Utils.decodeArrayBuffer",z);
return z
};
var n=function(z){c.entering(this,"Utils.decodeArrayBuffer2ByteBuffer");
var x=new Uint8Array(z);
var w=[];
for(var y=0;
y<x.length;
y++){w.push(x[y])
}c.exiting(this,"Utils.decodeArrayBuffer2ByteBuffer");
return new ByteBuffer(w)
};
var p=String.fromCharCode(127);
var u=String.fromCharCode(0);
var l="\n";
var v=function(y){c.entering(this,"Utils.encodeEscapedByte",y);
var w=[];
while(y.remaining()){var A=y.getUnsigned();
var z=String.fromCharCode(A);
switch(z){case p:w.push(p);
w.push(p);
break;
case u:w.push(p);
w.push("0");
break;
case l:w.push(p);
w.push("n");
break;
default:w.push(z)
}}var x=w.join("");
c.exiting(this,"Utils.encodeEscapedBytes",x);
return x
};
var t=function(x,y){c.entering(this,"Utils.encodeByteString",{buf:x,requiresEscaping:y});
if(y){return v(x)
}else{var w=[];
while(x.remaining()){var A=x.getUnsigned();
w.push(String.fromCharCode(A))
}var z=w.join("");
c.exiting(this,"Utils.encodeByteString",z);
return z
}};
var j=function(x,y){var w=x.position;
var z=x.limit;
var A=x.array;
while(w<z){w++
}try{x.limit=w;
return y.decode(x)
}finally{if(w!=z){x.limit=z;
x.position=w+1
}}};
var b=window.WebSocket;
var a=(function(){var w=m.getLogger("WebSocketNativeProxy");
var F=function(){this.parent;
this._listener
};
var y=(browser=="safari"&&typeof(b.CLOSING)=="undefined");
var D=F.prototype;
D.connect=function(J,M){w.entering(this,"WebSocketNativeProxy.<init>",{location:J,protocol:M});
if(typeof(b)==="undefined"){E(this);
return
}if(J.indexOf("javascript:")==0){J=J.substr("javascript:".length)
}var K=J.indexOf("?");
if(K!=-1){if(!/[\?&]\.kl=Y/.test(J.substring(K))){J+="&.kl=Y"
}}else{J+="?.kl=Y"
}if(y&&this.parent._isBinary){J+="&encoding=utf8"
}this._balanced=false;
this._sendQueue=[];
try{if(M){this._requestedProtocol=M;
this._delegate=new b(J,M)
}else{this._delegate=new b(J)
}this._delegate.binaryType="arraybuffer"
}catch(L){w.severe(this,"WebSocketNativeProxy.<init> "+L);
E(this);
return
}A(this)
};
D.onerror=function(){};
D.onmessage=function(){};
D.onopen=function(){};
D.onclose=function(){};
D.close=function(){w.entering(this,"WebSocketNativeProxy.close");
this._delegate.close()
};
D.send=function(J){w.entering(this,"WebSocketNativeProxy.send",J);
if(this._balanced==true){H(this,J)
}else{this._sendQueue.push(J)
}};
D.setListener=function(J){this._listener=J
};
function H(M,L){w.entering(this,"WebSocketNativeProxy.doSend",L);
if(typeof(L)=="string"){M._delegate.send(L)
}else{if(L.constructor==ByteBuffer){if(y){var N=t(L);
M._delegate.send(N)
}else{var J=new Uint8Array(L.remaining());
for(var K=0;
K<J.byteLength;
K++){J[K]=L.getUnsigned()
}M._delegate.send(J.buffer)
}}else{w.severe(this,"WebSocketNativeProxy.doSend called with unkown type "+typeof(L));
throw new Error("Cannot call send() with that type")
}}}function E(K,J){w.entering(this,"WebSocketNativeProxy.doError",J);
setTimeout(function(){K._listener.connectionFailed(K.parent)
},0)
}function z(M,L){var J;
if(typeof L.data.byteLength!=="undefined"){J=n(L.data)
}else{J=ByteBuffer.allocate(L.data.length);
if(M.parent._isBinary&&M.parent._balanced){for(var K=0;
K<L.data.length;
K++){J.put(L.data.charCodeAt(K))
}}else{J.putString(L.data,Charset.UTF8)
}J.flip()
}return J
}function I(P,O){w.entering(this,"WebSocketNativeProxy.messageHandler",O);
if(P._balanced==true){if(typeof O.data.byteLength!=="undefined"){O.decoder=h
}P._listener.messageReceived(P.parent,z(P,O))
}else{var N=O.data;
if(typeof O.data.byteLength!=="undefined"){N=h(O.data)
}if(N.match("^\uf0ff")=="\uf0ff"){var L=N.substring(1);
if(L.match("^R")=="R"){var K=L.substring(1);
if(K&&K!=""){w.finest(this,"WebSocketNativeProxy.messageHandler: redirectLoc = "+K);
var M=K.indexOf("?");
if(M!=-1){K+="&.kl=Y"
}else{K+="?.kl=Y"
}if(y&&P.parent._isBinary){K+="&encoding=utf8"
}G(P);
P.close();
P._delegate=new b(K);
P._delegate.binaryType="arraybuffer";
A(P)
}else{w.warning(this,"WebSocketNativeProxy.messageHandler: No balancees");
P.close()
}}else{if(L.match("^N$")=="N"){w.finest(this,"WebSocketNativeProxy.messageHandler: Not balancer - service gateway");
P._balanced=true;
P._listener.connectionOpened(P.parent,P.parent.protocol);
var J;
while(J=P._sendQueue.shift()){H(P,J)
}}else{w.warning(this,"WebSocketNativeProxy.messageHandler: Unknown balancer control frame command "+O.data);
P._balanced=true;
P._listener.messageReceived(P.parent,z(P,O))
}}}else{w.warning(this,"WebSocketNativeProxy.messageHandler: Unknown balancer control frame "+O.data);
P._balanced=true;
P._listener.messageReceived(P.parent,z(P,O))
}}}function x(K,J){w.entering(this,"WebSocketNativeProxy.closeHandler",J);
G(K);
K._listener.connectionClosed(K.parent)
}function C(K,J){w.entering(this,"WebSocketNativeProxy.errorHandler",J);
G(K);
K._listener.connectionFailed(K.parent)
}function B(K,J){w.entering(this,"WebSocketNativeProxy.openHandler",J);
K.parent.protocol=K._delegate.protocol;
if(browser=="safari"){K.parent.protocol=K._requestedProtocol
}}function A(K){w.entering(this,"WebSocketNativeProxy.bindHandlers");
var J=K._delegate;
J.onopen=function(L){B(K,L)
};
J.onmessage=function(L){I(K,L)
};
J.onclose=function(L){x(K,L)
};
J.onerror=function(L){C(K,L)
};
K.readyState=function(){return J.readyState
}
}function G(K){w.entering(this,"WebSocketNativeProxy.unbindHandlers");
var J=K._delegate;
J.onmessage=undefined;
J.onclose=undefined;
J.onopen=undefined;
J.onerror=undefined;
K.readyState=3
}return F
})();
var f=(function(){var z=m.getLogger("WebSocketEmulatedFlashProxy");
var A=function(){this.parent;
this._listener
};
var w=A.prototype;
w.connect=function(C,E){z.entering(this,"WebSocketEmulatedFlashProxy.<init>",C);
this.URL=C;
try{x(this,C,E)
}catch(D){z.severe(this,"WebSocketEmulatedFlashProxy.<init> "+D);
y(this,D)
}this.constructor=A;
z.exiting(this,"WebSocketEmulatedFlashProxy.<init>")
};
w.setListener=function(C){this._listener=C
};
A._flashBridge={};
A._flashBridge.readyWaitQueue=[];
A._flashBridge.failWaitQueue=[];
A._flashBridge.flashHasLoaded=false;
A._flashBridge.flashHasFailed=false;
w.URL="";
w.readyState=0;
w.bufferedAmount=0;
w.connectionOpened=function(D,E){var E=E.split("\n");
for(var C=0;
C<E.length;
C++){var F=E[C].split(":");
D.responseHeaders[F[0]]=F[1]
}this._listener.connectionOpened(D,"")
};
w.connectionClosed=function(C){this._listener.connectionClosed(C)
};
w.connectionFailed=function(C){this._listener.connectionFailed(C)
};
w.messageReceived=function(C,D){this._listener.messageReceived(C,D)
};
w.redirected=function(D,C){this._listener.redirected(D,C)
};
w.authenticationRequested=function(E,C,D){this._listener.authenticationRequested(E,C,D)
};
w.send=function(E){z.entering(this,"WebSocketEmulatedFlashProxy.send",E);
switch(this.readyState){case 0:z.severe(this,"WebSocketEmulatedFlashProxy.send: readyState is 0");
throw new Error("INVALID_STATE_ERR");
break;
case 1:if(E===null){z.severe(this,"WebSocketEmulatedFlashProxy.send: Data is null");
throw new Error("data is null")
}if(typeof(E)=="string"){A._flashBridge.sendText(this._instanceId,E)
}else{if(typeof(E.array)=="object"){var F;
var D=[];
var C;
while(E.remaining()){C=E.get();
D.push(String.fromCharCode(C))
}var F=D.join("");
A._flashBridge.sendByteString(this._instanceId,F);
return
}else{z.severe(this,"WebSocketEmulatedFlashProxy.send: Data is on invalid type "+typeof(E));
throw new Error("Invalid type")
}}B(this);
return true;
break;
case 2:return false;
break;
default:z.severe(this,"WebSocketEmulatedFlashProxy.send: Invalid readyState "+this.readyState);
throw new Error("INVALID_STATE_ERR")
}};
w.close=function(){z.entering(this,"WebSocketEmulatedFlashProxy.close");
switch(this.readyState){case 1:case 2:A._flashBridge.disconnect(this._instanceId);
break
}};
w.disconnect=w.close;
var B=function(C){z.entering(this,"WebSocketEmulatedFlashProxy.updateBufferedAmount");
C.bufferedAmount=A._flashBridge.getBufferedAmount(C._instanceId);
if(C.bufferedAmount!=0){setTimeout(function(){B(C)
},1000)
}};
var x=function(F,D,H){z.entering(this,"WebSocketEmulatedFlashProxy.registerWebSocket",D);
var C=function(K,J){J[K]=F;
F._instanceId=K
};
var I=function(){y(F)
};
var G=[];
if(F.parent.requestHeaders&&F.parent.requestHeaders.length>0){for(var E=0;
E<F.parent.requestHeaders.length;
E++){G.push(F.parent.requestHeaders[E].label+":"+F.parent.requestHeaders[E].value)
}}A._flashBridge.registerWebSocketEmulated(D,G.join("\n"),C,I)
};
function y(D,C){z.entering(this,"WebSocketEmulatedFlashProxy.doError",C);
setTimeout(function(){D._listener.connectionFailed(D.parent)
},0)
}return A
})();
var e=(function(){var z=m.getLogger("WebSocketRtmpFlashProxy");
var B=function(){this.parent;
this._listener
};
var w=B.prototype;
w.connect=function(C,E){z.entering(this,"WebSocketRtmpFlashProxy.<init>",C);
this.URL=C;
try{x(this,C,E)
}catch(D){z.severe(this,"WebSocketRtmpFlashProxy.<init> "+D);
y(this,D)
}this.constructor=B;
z.exiting(this,"WebSocketRtmpFlashProxy.<init>")
};
w.setListener=function(C){this._listener=C
};
f._flashBridge={};
f._flashBridge.readyWaitQueue=[];
f._flashBridge.failWaitQueue=[];
f._flashBridge.flashHasLoaded=false;
f._flashBridge.flashHasFailed=false;
w.URL="";
w.readyState=0;
w.bufferedAmount=0;
w.connectionOpened=function(D,E){var E=E.split("\n");
for(var C=0;
C<E.length;
C++){var F=E[C].split(":");
D.responseHeaders[F[0]]=F[1]
}this._listener.connectionOpened(D,"")
};
w.connectionClosed=function(C){this._listener.connectionClosed(C)
};
w.connectionFailed=function(C){this._listener.connectionFailed(C)
};
w.messageReceived=function(C,D){this._listener.messageReceived(C,D)
};
w.redirected=function(D,C){this._listener.redirected(D,C)
};
w.authenticationRequested=function(E,C,D){this._listener.authenticationRequested(E,C,D)
};
w.send=function(E){z.entering(this,"WebSocketRtmpFlashProxy.send",E);
switch(this.readyState){case 0:z.severe(this,"WebSocketRtmpFlashProxy.send: readyState is 0");
throw new Error("INVALID_STATE_ERR");
break;
case 1:if(E===null){z.severe(this,"WebSocketRtmpFlashProxy.send: Data is null");
throw new Error("data is null")
}if(typeof(E)=="string"){f._flashBridge.sendText(this._instanceId,E)
}else{if(typeof(E.array)=="object"){var F;
var D=[];
var C;
while(E.remaining()){C=E.get();
D.push(String.fromCharCode(C))
}var F=D.join("");
f._flashBridge.sendByteString(this._instanceId,F);
return
}else{z.severe(this,"WebSocketRtmpFlashProxy.send: Data is on invalid type "+typeof(E));
throw new Error("Invalid type")
}}A(this);
return true;
break;
case 2:return false;
break;
default:z.severe(this,"WebSocketRtmpFlashProxy.send: Invalid readyState "+this.readyState);
throw new Error("INVALID_STATE_ERR")
}};
w.close=function(){z.entering(this,"WebSocketRtmpFlashProxy.close");
switch(this.readyState){case 1:case 2:f._flashBridge.disconnect(this._instanceId);
break
}};
w.disconnect=w.close;
var A=function(C){z.entering(this,"WebSocketRtmpFlashProxy.updateBufferedAmount");
C.bufferedAmount=f._flashBridge.getBufferedAmount(C._instanceId);
if(C.bufferedAmount!=0){setTimeout(function(){A(C)
},1000)
}};
var x=function(F,D,H){z.entering(this,"WebSocketRtmpFlashProxy.registerWebSocket",D);
var C=function(K,J){J[K]=F;
F._instanceId=K
};
var I=function(){y(F)
};
var G=[];
if(F.parent.requestHeaders&&F.parent.requestHeaders.length>0){for(var E=0;
E<F.parent.requestHeaders.length;
E++){G.push(F.parent.requestHeaders[E].label+":"+F.parent.requestHeaders[E].value)
}}f._flashBridge.registerWebSocketRtmp(D,G.join("\n"),C,I)
};
function y(D,C){z.entering(this,"WebSocketRtmpFlashProxy.doError",C);
setTimeout(function(){D._listener.connectionFailed(D.parent)
},0)
}return B
})();
(function(){var x=m.getLogger("com.kaazing.gateway.client.loader.FlashBridge");
var w={};
f._flashBridge.registerWebSocketEmulated=function(z,C,D,A){x.entering(this,"WebSocketEmulatedFlashProxy._flashBridge.registerWebSocketEmulated",{location:z,callback:D,errback:A});
var B=function(){var E=f._flashBridge.doRegisterWebSocketEmulated(z,C);
D(E,w)
};
if(f._flashBridge.flashHasLoaded){if(f._flashBridge.flashHasFailed){A()
}else{B()
}}else{this.readyWaitQueue.push(B);
this.failWaitQueue.push(A)
}x.exiting(this,"WebSocketEmulatedFlashProxy._flashBridge.registerWebSocketEmulated")
};
f._flashBridge.doRegisterWebSocketEmulated=function(z,B){x.entering(this,"WebSocketEmulatedFlashProxy._flashBridge.doRegisterWebSocketEmulated",{location:z,headers:B});
var A=f._flashBridge.elt.registerWebSocketEmulated(z,B);
x.exiting(this,"WebSocketEmulatedFlashProxy._flashBridge.doRegisterWebSocketEmulated",A);
return A
};
f._flashBridge.registerWebSocketRtmp=function(z,C,D,A){x.entering(this,"WebSocketEmulatedFlashProxy._flashBridge.registerWebSocketRtmp",{location:z,callback:D,errback:A});
var B=function(){var E=f._flashBridge.doRegisterWebSocketRtmp(z,C);
D(E,w)
};
if(f._flashBridge.flashHasLoaded){if(f._flashBridge.flashHasFailed){A()
}else{B()
}}else{this.readyWaitQueue.push(B);
this.failWaitQueue.push(A)
}x.exiting(this,"WebSocketEmulatedFlashProxy._flashBridge.registerWebSocketEmulated")
};
f._flashBridge.doRegisterWebSocketRtmp=function(z,B){x.entering(this,"WebSocketEmulatedFlashProxy._flashBridge.doRegisterWebSocketRtmp",{location:z,protocol:B});
var A=f._flashBridge.elt.registerWebSocketRtmp(z,B);
x.exiting(this,"WebSocketEmulatedFlashProxy._flashBridge.doRegisterWebSocketRtmp",A);
return A
};
f._flashBridge.onready=function(){x.entering(this,"WebSocketEmulatedFlashProxy._flashBridge.onready");
var A=f._flashBridge.readyWaitQueue;
for(var z=0;
z<A.length;
z++){var B=A[z];
B()
}x.exiting(this,"WebSocketEmulatedFlashProxy._flashBridge.onready")
};
f._flashBridge.onfail=function(){x.entering(this,"WebSocketEmulatedFlashProxy._flashBridge.onfail");
var B=f._flashBridge.failWaitQueue;
for(var A=0;
A<B.length;
A++){var z=B[A];
z()
}x.exiting(this,"WebSocketEmulatedFlashProxy._flashBridge.onfail")
};
f._flashBridge.connectionOpened=function(z,A){x.entering(this,"WebSocketEmulatedFlashProxy._flashBridge.connectionOpened",z);
w[z].readyState=1;
w[z].connectionOpened(w[z].parent,A);
y();
x.exiting(this,"WebSocketEmulatedFlashProxy._flashBridge.connectionOpened")
};
f._flashBridge.connectionClosed=function(z){x.entering(this,"WebSocketEmulatedFlashProxy._flashBridge.connectionClosed",z);
w[z].readyState=2;
w[z].connectionClosed(w[z].parent);
x.exiting(this,"WebSocketEmulatedFlashProxy._flashBridge.connectionClosed")
};
f._flashBridge.connectionFailed=function(z){x.entering(this,"WebSocketEmulatedFlashProxy._flashBridge.connectionFailed",z);
w[z].connectionFailed(w[z].parent);
x.exiting(this,"WebSocketEmulatedFlashProxy._flashBridge.connectionFailed")
};
f._flashBridge.messageReceived=function(C,D){x.entering(this,"WebSocketEmulatedFlashProxy._flashBridge.messageReceived",{key:C,data:D});
var B=w[C];
if(B.readyState==1){var z=ByteBuffer.allocate(D.length);
for(var A=0;
A<D.length;
A++){z.put(D[A])
}z.flip();
B.messageReceived(B.parent,z)
}x.exiting(this,"WebSocketEmulatedFlashProxy._flashBridge.messageReceived")
};
f._flashBridge.redirected=function(B,z){x.entering(this,"WebSocketEmulatedFlashProxy._flashBridge.redirected",{key:B,data:z});
var A=w[B];
A.redirected(A.parent,z);
x.exiting(this,"WebSocketEmulatedFlashProxy._flashBridge.redirected")
};
f._flashBridge.authenticationRequested=function(C,z,B){x.entering(this,"WebSocketEmulatedFlashProxy._flashBridge.authenticationRequested",{key:C,data:z});
var A=w[C];
A.authenticationRequested(A.parent,z,B);
x.exiting(this,"WebSocketEmulatedFlashProxy._flashBridge.authenticationRequested")
};
var y=function(){x.entering(this,"WebSocketEmulatedFlashProxy.killLoadingBar");
if(browser==="firefox"){var z=document.createElement("iframe");
z.style.display="none";
document.body.appendChild(z);
document.body.removeChild(z)
}};
f._flashBridge.sendText=function(z,A){x.entering(this,"WebSocketEmulatedFlashProxy._flashBridge.sendText",{key:z,message:A});
this.elt.processTextMessage(z,escape(A));
setTimeout(y,200)
};
f._flashBridge.sendByteString=function(z,A){x.entering(this,"WebSocketEmulatedFlashProxy._flashBridge.sendByteString",{key:z,message:A});
this.elt.processBinaryMessage(z,escape(A));
setTimeout(y,200)
};
f._flashBridge.disconnect=function(z){x.entering(this,"WebSocketEmulatedFlashProxy._flashBridge.disconnect",z);
this.elt.processClose(z)
};
f._flashBridge.getBufferedAmount=function(A){x.entering(this,"WebSocketEmulatedFlashProxy._flashBridge.getBufferedAmount",A);
var z=this.elt.getBufferedAmount(A);
x.exiting(this,"WebSocketEmulatedFlashProxy._flashBridge.getBufferedAmount",z);
return z
}
})();
(function(){var z=function(ax){var az=this;
var ar=3000;
var aw="Loader";
var am=false;
var av=-1;
az.elt=null;
var at=function(){var aE=new RegExp(".*"+ax+".*.js$");
var aA=document.getElementsByTagName("script");
for(var aC=0;
aC<aA.length;
aC++){if(aA[aC].src){var aB=(aA[aC].src).match(aE);
if(aB){aB=aB.pop();
var aD=aB.split("/");
aD.pop();
if(aD.length>0){return aD.join("/")+"/"
}else{return""
}}}}};
var au=at();
var aq=au+"Loader.swf";
az.loader=function(){var aC="flash";
var aA=document.getElementsByTagName("meta");
for(var aB=0;
aB<aA.length;
aB++){if(aA[aB].name==="kaazing:upgrade"){aC=aA[aB].content
}}if(aC!="flash"||!an([9,0,115])){al()
}else{av=setTimeout(al,ar);
ao()
}};
az.clearFlashTimer=function(){clearTimeout(av);
av="cleared";
setTimeout(function(){ay(az.elt.handshake(ax))
},0)
};
var ay=function(aA){if(aA){f._flashBridge.flashHasLoaded=true;
f._flashBridge.elt=az.elt;
f._flashBridge.onready()
}else{al()
}window.___Loader=undefined
};
var al=function(){f._flashBridge.flashHasLoaded=true;
f._flashBridge.flashHasFailed=true;
f._flashBridge.onfail()
};
var ap=function(){var aB=null;
if(typeof(ActiveXObject)!="undefined"){try{am=true;
var aD=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
var aA=aD.GetVariable("$version");
var aE=aA.split(" ")[1].split(",");
aB=[];
for(var aC=0;
aC<aE.length;
aC++){aB[aC]=parseInt(aE[aC])
}}catch(aG){am=false
}}if(typeof navigator.plugins!="undefined"){if(typeof navigator.plugins["Shockwave Flash"]!="undefined"){var aA=navigator.plugins["Shockwave Flash"].description;
aA=aA.replace(/\s*r/g,".");
var aE=aA.split(" ")[2].split(".");
aB=[];
for(var aC=0;
aC<aE.length;
aC++){aB[aC]=parseInt(aE[aC])
}}}var aF=navigator.userAgent;
if(aB!==null&&aB[0]===10&&aB[1]===0&&aF.indexOf("Windows NT 6.0")!==-1){aB=null
}if(aF.indexOf("MSIE 6.0")==-1&&aF.indexOf("MSIE 7.0")==-1){aB=null
}return aB
};
var an=function(aC){var aA=ap();
if(aA==null){return false
}for(var aB=0;
aB<Math.max(aA.length,aC.length);
aB++){var aD=aA[aB]-aC[aB];
if(aD!=0){return(aD>0)?true:false
}}return true
};
var ao=function(){if(am){var aA=document.createElement("div");
document.body.appendChild(aA);
aA.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" height="0" width="0" id="'+aw+'"><param name="movie" value="'+aq+'"></param></object>';
az.elt=document.getElementById(aw)
}else{var aA=document.createElement("object");
aA.setAttribute("type","application/x-shockwave-flash");
aA.setAttribute("width",0);
aA.setAttribute("height",0);
aA.setAttribute("id",aw);
aA.setAttribute("data",aq);
document.body.appendChild(aA);
az.elt=aA
}};
az.attachToOnload=function(aA){if(window.addEventListener){window.addEventListener("load",aA,true)
}else{if(window.attachEvent){window.attachEvent("onload",aA)
}else{onload=aA
}}};
if(document.readyState==="complete"){az.loader()
}else{az.attachToOnload(az.loader)
}};
var R=(function(){var al=function(am){this.HOST=new al(0);
this.USERINFO=new al(1);
this.PORT=new al(2);
this.PATH=new al(3);
this.ordinal=am
};
return al
})();
var ai=(function(){var al=function(){};
al.getRealm=function(an){var ap=an.authenticationParameters;
if(ap==null){return null
}var ao=/realm=(\"(.*)\")/i;
var am=ao.exec(ap);
return(am!=null&&am.length>=3)?am[2]:null
};
return al
})();
function E(){this.Keys=new Array()
}var ad=(function(){var am=function(an){this.weakKeys=an;
this.elements=[];
this.dictionary=new E()
};
var al=am.prototype;
al.getlength=function(){return this.elements.length
};
al.getItemAt=function(an){return this.dictionary[this.elements[an]]
};
al.get=function(ao){var an=this.dictionary[ao];
if(an==undefined){an=null
}return an
};
al.remove=function(ap){for(var ao=0;
ao<this.elements.length;
ao++){var an=(this.weakKeys&&(this.elements[ao]==ap));
var aq=(!this.weakKeys&&(this.elements[ao]===ap));
if(an||aq){this.elements.remove(ao);
this.dictionary[this.elements[ao]]=undefined;
break
}}};
al.put=function(an,ao){this.remove(an);
this.elements.push(an);
this.dictionary[an]=ao
};
al.isEmpty=function(){return this.length==0
};
al.containsKey=function(ap){for(var ao=0;
ao<this.elements.length;
ao++){var an=(this.weakKeys&&(this.elements[ao]==ap));
var aq=(!this.weakKeys&&(this.elements[ao]===ap));
if(an||aq){return true
}}return false
};
al.keySet=function(){return this.elements
};
al.getvalues=function(){var an=[];
for(var ao=0;
ao<this.elements.length;
ao++){an.push(this.dictionary[this.elements[ao]])
}return an
};
return am
})();
var P=(function(){var am=function(){this.name="";
this.kind="";
this.values=[];
this.children=new ad()
};
var al=am.prototype;
al.getWildcardChar=function(){return"*"
};
al.addChild=function(ao,ap){if(ao==null||ao.length==0){throw new ArgumentError("A node may not have a null name.")
}var an=am.createNode(ao,this,ap);
this.children.put(ao,an);
return an
};
al.hasChild=function(an,ao){return null!=this.getChild(an)&&ao==this.getChild(an).kind
};
al.getChild=function(an){return this.children.get(an)
};
al.getDistanceFromRoot=function(){var an=0;
var ao=this;
while(!ao.isRootNode()){an++;
ao=ao.parent
}return an
};
al.appendValues=function(){if(this.isRootNode()){throw new ArgumentError("Cannot set a values on the root node.")
}if(this.values!=null){for(var an=0;
an<arguments.length;
an++){var ao=arguments[an];
this.values.push(ao)
}}};
al.removeValue=function(ao){if(this.isRootNode()){return
}for(var an=0;
an<this.values.length;
an++){if(this.values[an]==ao){this.values.splice(an,1)
}}};
al.getValues=function(){return this.values
};
al.hasValues=function(){return this.values!=null&&this.values.length>0
};
al.isRootNode=function(){return this.parent==null
};
al.hasChildren=function(){return this.children!=null&&this.children.getlength()>0
};
al.isWildcard=function(){return this.name!=null&&this.name==this.getWildcardChar()
};
al.hasWildcardChild=function(){return this.hasChildren()&&this.children.containsKey(this.getWildcardChar())
};
al.getFullyQualifiedName=function(){var an=new String();
var ap=[];
var aq=this;
while(!aq.isRootNode()){ap.push(aq.name);
aq=aq.parent
}ap=ap.reverse();
for(var ao=0;
ao<ap.length;
ao++){an+=ap[ao];
an+="."
}if(an.length>=1&&an.charAt(an.length-1)=="."){an=an.slice(0,an.length-1)
}return an.toString()
};
al.getChildrenAsList=function(){return this.children.getvalues()
};
al.findBestMatchingNode=function(at,ar){var aq=this.findAllMatchingNodes(at,ar);
var an=null;
var au=0;
for(var ao=0;
ao<aq.length;
ao++){var ap=aq[ao];
if(ap.getDistanceFromRoot()>au){au=ap.getDistanceFromRoot();
an=ap
}}return an
};
al.findAllMatchingNodes=function(av,au){var ax=[];
var an=this.getChildrenAsList();
for(var at=0;
at<an.length;
at++){var ap=an[at];
var aq=ap.matches(av,au);
if(aq<0){continue
}if(aq>=av.length){do{if(ap.hasValues()){ax.push(ap)
}if(ap.hasWildcardChild()){var ao=ap.getChild(this.getWildcardChar());
if(ao.kind!=this.kind){ap=null
}else{ap=ao
}}else{ap=null
}}while(ap!=null)
}else{var aw=ap.findAllMatchingNodes(av,aq);
for(var ar=0;
ar<aw.length;
ar++){ax.push(aw[ar])
}}}return ax
};
al.matches=function(ao,an){if(an<0||an>=ao.length){return -1
}if(this.matchesToken(ao[an])){return an+1
}if(!this.isWildcard()){return -1
}else{if(this.kind!=ao[an].kind){return -1
}do{an++
}while(an<ao.length&&this.kind==ao[an].kind);
return an
}};
al.matchesToken=function(an){return this.name==an.name&&this.kind==an.kind
};
am.createNode=function(an,ap,ao){var aq=new am();
aq.name=an;
aq.parent=ap;
aq.kind=ao;
return aq
};
return am
})();
var y=(function(){var al=function(am,an){this.kind=an;
this.name=am
};
return al
})();
window.Oid=(function(){var am=function(an){this.rep=an
};
var al=am.prototype;
al.asArray=function(){return this.rep
};
al.asString=function(){var ao="";
for(var an=0;
an<this.rep.length;
an++){ao+=(this.rep[an].toString());
ao+="."
}if(ao.length>0&&ao.charAt(ao.length-1)=="."){ao=ao.slice(0,ao.length-1)
}return ao
};
am.create=function(an){return new am(an.split("."))
};
return am
})();
var B=(function(){var al=function(){};
al.create=function(at,ao,ar){var aq=at+":"+ao;
var am=[];
for(var ap=0;
ap<aq.length;
++ap){am.push(aq.charCodeAt(ap))
}var an="Basic "+Base64.encode(am);
return new ChallengeResponse(an,ar)
};
return al
})();
function aj(){this.canHandle=function(al){return false
};
this.handle=function(al,am){am(null)
}
}window.PasswordAuthentication=(function(){function al(an,am){this.username=an;
this.password=am
}al.prototype.clear=function(){this.username=null;
this.password=null
};
return al
})();
window.ChallengeRequest=(function(){var al=function(am,an){if(am==null){throw new Error("location is not defined.")
}if(an==null){return
}var ao="Application ";
if(an.indexOf(ao)==0){an=an.substring(ao.length)
}this.location=am;
this.authenticationParameters=null;
var ap=an.indexOf(" ");
if(ap==-1){this.authenticationScheme=an
}else{this.authenticationScheme=an.substring(0,ap);
if(an.length>ap+1){this.authenticationParameters=an.substring(ap+1)
}}};
return al
})();
window.ChallengeResponse=(function(){var am=function(an,ao){this.credentials=an;
this.nextChallengeHandler=ao
};
var al=am.prototype;
al.clearCredentials=function(){if(this.credentials!=null){this.credentials=null
}};
return am
})();
window.BasicChallengeHandler=(function(){var am=function(){this.loginHandler=undefined;
this.loginHandlersByRealm={}
};
var al=am.prototype;
al.setRealmLoginHandler=function(an,ao){if(an==null){throw new ArgumentError("null realm")
}if(ao==null){throw new ArgumentError("null loginHandler")
}this.loginHandlersByRealm[an]=ao;
return this
};
al.canHandle=function(an){return an!=null&&"Basic"==an.authenticationScheme
};
al.handle=function(ao,ar){if(ao.location!=null){var ap=this.loginHandler;
var an=ai.getRealm(ao);
if(an!=null&&this.loginHandlersByRealm[an]!=null){ap=this.loginHandlersByRealm[an]
}var aq=this;
if(ap!=null){ap(function(at){if(at!=null&&at.username!=null){ar(B.create(at.username,at.password,aq))
}else{ar(null)
}});
return
}}ar(null)
};
al.loginHandler=function(an){an(null)
};
return am
})();
window.DispatchChallengeHandler=(function(){var av=function(){this.rootNode=new P();
var ax="^(.*)://(.*)";
this.SCHEME_URI_PATTERN=new RegExp(ax)
};
function an(ay,aC,ax){var aB=at(aC);
var aD=ay;
for(var aA=0;
aA<aB.length;
aA++){var az=aB[aA];
if(!aD.hasChild(az.name,az.kind)){return
}else{aD=aD.getChild(az.name)
}}aD.removeValue(ax)
}function al(ay,aC,ax){var aB=at(aC);
var aD=ay;
for(var aA=0;
aA<aB.length;
aA++){var az=aB[aA];
if(!aD.hasChild(az.name,az.kind)){aD=aD.addChild(az.name,az.kind)
}else{aD=aD.getChild(az.name)
}}aD.appendValues(ax)
}function au(aA,ay){var ax=new Array();
if(ay!=null){var az=ao(aA,ay);
if(az!=null){return az.values
}}return ax
}function ar(aC,aD){var ax=null;
var ay=aD.location;
if(ay!=null){var aB=ao(aC,ay);
if(aB!=null){var aA=aB.getValues();
if(aA!=null){for(var aE=0;
aE<aA.length;
aE++){var az=aA[aE];
if(az.canHandle(aD)){ax=az;
break
}}}}}return ax
}function ao(ay,ax){var aA=at(ax);
var az=0;
return ay.findBestMatchingNode(aA,az)
}function at(aE){var aG=new Array();
if(aE==null||aE.length==0){return aG
}var aP=new RegExp("^(([^:/?#]+):(//))?([^/?#]*)?([^?#]*)(\\?([^#]*))?(#(.*))?");
var ay=aP.exec(aE);
if(ay==null){return aG
}var aH=ay[2]||"http";
var aD=ay[4];
var aL=ay[5];
var aA=null;
var aB=null;
var aF=null;
var az=null;
if(aD!=null){var aJ=aD;
var aC=aJ.indexOf("@");
if(aC>=0){aB=aJ.substring(0,aC);
aJ=aJ.substring(aC+1);
var aO=aB.indexOf(":");
if(aO>=0){aF=aB.substring(0,aO);
az=aB.substring(aO+1)
}}var ax=aJ.indexOf(":");
if(ax>=0){aA=aJ.substring(ax+1);
aJ=aJ.substring(0,ax)
}}else{throw new ArgumentError("Hostname is required.")
}var aM=aJ.split(/\./);
aM.reverse();
for(var aN=0;
aN<aM.length;
aN++){aG.push(new y(aM[aN],R.HOST))
}if(aA!=null){aG.push(new y(aA,R.PORT))
}else{if(am(aH)>0){aG.push(new y(am(aH).toString(),R.PORT))
}}if(aB!=null){if(aF!=null){aG.push(new y(aF,R.USERINFO))
}if(az!=null){aG.push(new y(az,R.USERINFO))
}if(aF==null&&az==null){aG.push(new y(aB,R.USERINFO))
}}if(aw(aL)){if(aL.charAt(0)=="/"){aL=aL.substring(1)
}if(aw(aL)){var aQ=aL.split("/");
for(var aK=0;
aK<aQ.length;
aK++){var aI=aQ[aK];
aG.push(new y(aI,R.PATH))
}}}return aG
}function am(ax){if(ap[ax.toLowerCase()]!=null){return ap[ax]
}else{return -1
}}function ap(){http=80;
ws=80;
wss=443;
https=443
}function aw(ax){return ax!=null&&ax.length>0
}var aq=av.prototype;
aq.clear=function(){this.rootNode=new P()
};
aq.canHandle=function(ax){return ar(this.rootNode,ax)!=null
};
aq.handle=function(ay,az){var ax=ar(this.rootNode,ay);
if(ax==null){return null
}return ax.handle(ay,az)
};
aq.register=function(ay,ax){if(ay==null||ay.length==0){throw new Error("Must specify a location to handle challenges upon.")
}if(ax==null){throw new Error("Must specify a handler to handle challenges.")
}al(this.rootNode,ay,ax);
return this
};
aq.unregister=function(ay,ax){if(ay==null||ay.length==0){throw new Error("Must specify a location to un-register challenge handlers upon.")
}if(ax==null){throw new Error("Must specify a handler to un-register.")
}an(this.rootNode,ay,ax);
return this
};
return av
})();
window.NegotiableChallengeHandler=(function(){var am=function(){this.candidateChallengeHandlers=new Array()
};
var an=function(ao){var ap=new Array();
for(var aq=0;
aq<ao.length;
aq++){ap.push(Oid.create(ao[aq]).asArray())
}var ar=GssUtils.sizeOfSpnegoInitialContextTokenWithOids(null,ap);
var at=ByteBuffer.allocate(ar);
at.skip(ar);
GssUtils.encodeSpnegoInitialContextTokenWithOids(null,ap,at);
return ByteArrayUtils.arrayToByteArray(Base64Util.encodeBuffer(at))
};
var al=am.prototype;
al.register=function(ap){if(ap==null){throw new Error("handler is null")
}for(var ao=0;
ao<this.candidateChallengeHandlers.length;
ao++){if(ap===this.candidateChallengeHandlers[ao]){return this
}}this.candidateChallengeHandlers.push(ap);
return this
};
al.canHandle=function(ao){return ao!=null&&ao.authenticationScheme=="Negotiate"&&ao.authenticationParameters==null
};
al.handle=function(at,av){if(at==null){throw Error(new ArgumentError("challengeRequest is null"))
}var ax=new ad();
for(var ar=0;
ar<candidateChallengeHandlers.length;
ar++){var aw=candidateChallengeHandlers[ar];
if(aw.canHandle(at)){try{var ap=aw.getSupportedOids();
for(var aq=0;
aq<ap.length;
aq++){var ao=new Oid(ap[aq]).asString();
if(!ax.containsKey(ao)){ax.put(ao,aw)
}}}catch(au){}}}if(ax.isEmpty()){av(null);
return
}};
return am
})();
window.NegotiableChallengeHandler=(function(){var al=function(){this.loginHandler=undefined
};
al.prototype.getSupportedOids=function(){return new Array()
};
return al
})();
window.NegotiableChallengeHandler=(function(){var al=function(){this.loginHandler=undefined
};
al.prototype.getSupportedOids=function(){return new Array()
};
return al
})();
window.ChallengeHandlers=(function(){var al=function(){};
al._definedDefault=new aj();
al.setDefault=function(am){if(am==null){throw new Error("challengeHandler not defined")
}al._definedDefault=am
};
al.getDefault=function(){return al._definedDefault
};
return al
})();
var H={};
(function(){var ao=m.getLogger("com.kaazing.gateway.client.html5.Windows1252");
var aq={8364:128,129:129,8218:130,402:131,8222:132,8230:133,8224:134,8225:135,710:136,8240:137,352:138,8249:139,338:140,141:141,381:142,143:143,144:144,8216:145,8217:146,8220:147,8221:148,8226:149,8211:150,8212:151,732:152,8482:153,353:154,8250:155,339:156,157:157,382:158,376:159};
var an={128:8364,129:129,130:8218,131:402,132:8222,133:8230,134:8224,135:8225,136:710,137:8240,138:352,139:8249,140:338,141:141,142:381,143:143,144:144,145:8216,146:8217,147:8220,148:8221,149:8226,150:8211,151:8212,152:732,153:8482,154:353,155:8250,156:339,157:157,158:382,159:376};
H.toCharCode=function(av){if(av<128||(av>159&&av<256)){return av
}else{var au=an[av];
if(typeof(au)=="undefined"){ao.severe(this,"Windows1252.toCharCode: Error: Could not find "+av);
throw new Error("Windows1252.toCharCode could not find: "+av)
}return au
}};
H.fromCharCode=function(av){if(av<256){return av
}else{var au=aq[av];
if(typeof(au)=="undefined"){ao.severe(this,"Windows1252.fromCharCode: Error: Could not find "+av);
throw new Error("Windows1252.fromCharCode could not find: "+av)
}return au
}};
var ar=String.fromCharCode(127);
var ap=String.fromCharCode(0);
var at="\n";
var am=function(aw){ao.entering(this,"Windows1252.escapedToArray",aw);
var au=[];
for(var av=0;
av<aw.length;
av++){var ay=H.fromCharCode(aw.charCodeAt(av));
if(ay==127){av++;
if(av==aw.length){au.hasRemainder=true;
break
}var ax=H.fromCharCode(aw.charCodeAt(av));
switch(ax){case 127:au.push(127);
break;
case 48:au.push(0);
break;
case 110:au.push(10);
break;
case 114:au.push(13);
break;
default:ao.severe(this,"Windows1252.escapedToArray: Error: Escaping format error");
throw new Error("Escaping format error")
}}else{au.push(ay)
}}return au
};
var al=function(av){ao.entering(this,"Windows1252.toEscapedByteString",av);
var au=[];
while(av.remaining()){var ax=av.getUnsigned();
var aw=String.fromCharCode(H.toCharCode(ax));
switch(aw){case ar:au.push(ar);
au.push(ar);
break;
case ap:au.push(ar);
au.push("0");
break;
case at:au.push(ar);
au.push("n");
break;
default:au.push(aw)
}}return au.join("")
};
H.toArray=function(aw,ax){ao.entering(this,"Windows1252.toArray",{s:aw,escaped:ax});
if(ax){return am(aw)
}else{var au=[];
for(var av=0;
av<aw.length;
av++){au.push(H.fromCharCode(aw.charCodeAt(av)))
}return au
}};
H.toByteString=function(av,aw){ao.entering(this,"Windows1252.toByteString",{buf:av,escaped:aw});
if(aw){return al(av)
}else{var au=[];
while(av.remaining()){var ax=av.getUnsigned();
au.push(String.fromCharCode(H.toCharCode(ax)))
}return au.join("")
}}
})();
var aa=(function(){var al=function(am,an){this.label=am;
this.value=an
};
return al
})();
var ah=(function(){var am=function(ao){var ap=new URI(ao);
if(an(ap.scheme)){this._uri=ap
}else{throw new Error("HttpURI - invalid scheme: "+ao)
}};
function an(ao){return"http"==ao||"https"==ao
}var al=am.prototype;
al.getURI=function(){return this._uri
};
al.duplicate=function(ao){try{return new am(ao)
}catch(ap){throw ap
}return null
};
al.isSecure=function(){return("https"==this._uri.scheme)
};
al.toString=function(){return this._uri.toString()
};
am.replaceScheme=function(ao,ap){var aq=URI.replaceProtocol(ao,ap);
return new am(aq)
};
return am
})();
var ag=(function(){var am=function(ar){var at=new URI(ar);
if(aq(at.scheme)){this._uri=at;
if(at.port==undefined){this._uri=new URI(am.addDefaultPort(ar))
}}else{throw new Error("WSURI - invalid scheme: "+ar)
}};
function aq(ar){return"ws"==ar||"wss"==ar
}function ap(ar){try{return new am(ar)
}catch(at){throw at
}return null
}var al=am.prototype;
al.getAuthority=function(){return this._uri.authority
};
al.isSecure=function(){return"wss"==this._uri.scheme
};
al.getHttpEquivalentScheme=function(){return this.isSecure()?"https":"http"
};
al.toString=function(){return this._uri.toString()
};
var an=80;
var ao=443;
am.setDefaultPort=function(ar){if(ar.port==0){if(ar.scheme=="ws"){ar.port=an
}else{if(ar.scheme=="wss"){ar.port=ao
}else{if(ar.scheme=="http"){ar.port=80
}else{if(ar.schemel=="https"){ar.port=443
}else{throw new Error("Unknown protocol: "+ar.scheme)
}}}}ar.authority=ar.host+":"+ar.port
}};
am.addDefaultPort=function(ar){var at=new URI(ar);
if(at.port==undefined){am.setDefaultPort(at)
}return at.toString()
};
am.replaceScheme=function(ar,at){var au=URI.replaceProtocol(ar,at);
return new am(au)
};
return am
})();
var A=(function(){var am={};
am.ws="ws";
am.wss="wss";
am["javascript:wse"]="ws";
am["javascript:wse+ssl"]="wss";
am["javascript:ws"]="ws";
am["javascript:wss"]="wss";
am["flash:wsr"]="ws";
am["flash:wsr+ssl"]="wss";
am["flash:wse"]="ws";
am["flash:wse+ssl"]="wss";
var an=function(at){var ar=ao(at);
if(aq(ar)){this._uri=new URI(URI.replaceProtocol(at,am[ar]));
this._compositeScheme=ar;
this._location=at
}else{throw new Error("WSCompositeURI - invalid composite scheme: "+ao(at))
}};
function ao(ar){var at=ar.indexOf("://");
if(at>0){return ar.substr(0,at)
}else{return""
}}function aq(ar){return am[ar]!=null
}function ap(ar){try{return new an(ar)
}catch(at){throw at
}return null
}var al=an.prototype;
al.isSecure=function(){var ar=this._uri.scheme;
return"wss"==am[ar]
};
al.getWSEquivalent=function(){try{var ar=am[this._compositeScheme];
return ag.replaceScheme(this._location,ar)
}catch(at){throw at
}return null
};
al.getPlatformPrefix=function(){if(this._compositeScheme.indexOf("javascript:")===0){return"javascript"
}else{if(this._compositeScheme.indexOf("flash:")===0){return"flash"
}else{return""
}}};
al.toString=function(){return this._location
};
return an
})();
var X=(function(){var al=function(){this._parent=null;
this._challengeResponse=new ChallengeResponse(null,null)
};
al.prototype.toString=function(){return"[Channel]"
};
return al
})();
var x=(function(){var am=function(an,ap,ao){this._location=an;
this._protocol=ap;
this._isBinary=ao;
this._controlFrames={};
this._handshakePayload;
this._isEscape=false;
this._bufferedAmount=0
};
var al=am.prototype=new X();
al.getBufferedAmount=function(){return this._bufferedAmount
};
al.toString=function(){return"[WebSocketChannel "+_location+" "+_protocol!=null?_protocol:"- binary:"+isBinary+"]"
};
return am
})();
var C=(function(){var am=function(){this._nextHandler;
this._listener
};
var al=am.prototype;
al.processConnect=function(ao,an,ap){this._nextHandler.processConnect(ao,an,ap)
};
al.processAuthorize=function(ao,an){this._nextHandler.processAuthorize(ao,an)
};
al.processTextMessage=function(an,ao){this._nextHandler.processTextMessage(an,ao)
};
al.processBinaryMessage=function(ao,an){this._nextHandler.processBinaryMessage(ao,an)
};
al.processClose=function(an){this._nextHandler.processClose(an)
};
al.setListener=function(an){this._listener=an
};
al.setNextHandler=function(an){this._nextHandler=an
};
return am
})();
var N=(function(){var al=function(){var am="";
var an=""
};
al.KAAZING_EXTENDED_HANDSHAKE="x-kaazing-handshake";
al.KAAZING_SEC_EXTENSION_REVALIDATE="x-kaazing-http-revalidate";
al.HEADER_SEC_EXTENSIONS="X-WebSocket-Extensions";
return al
})();
var af=(function(){var am=function(an,ap,ao){this._location=an;
this._protocol=ap;
this._isBinary=ao;
this.requestHeaders=[];
this.responseHeaders={};
this.readyState=0;
this.authenticationReceived=false
};
var al=am.prototype=new x();
return am
})();
var I=(function(){var am=function(){};
var al=am.prototype;
al.createChannel=function(an,aq,ap){var ao=new af(an,aq,ap);
if(aq){ao.requestHeaders.push(new aa("X-WebSocket-Protocol",aq))
}ao.requestHeaders.push(new aa(N.HEADER_SEC_EXTENSIONS,N.KAAZING_SEC_EXTENSION_REVALIDATE));
return ao
};
return am
})();
var D=(function(){var am=function(){};
var al=am.prototype;
al.createChannel=function(an,aq,ap){var ao=new af(an,aq,ap);
return ao
};
return am
})();
var O=(function(){var am=function(an,ap,ao){this._location=an.getWSEquivalent();
this._protocol=ap;
this._isBinary=ao;
this._webSocket;
this._compositeScheme=an._compositeScheme;
this._connectionStrategies=[];
this._selectedChannel;
this.readyState=0;
this._closing=false;
this._compositeScheme=an._compositeScheme
};
var al=am.prototype=new x();
al.getReadyState=function(){return this.readyState
};
al.getWebSocket=function(){return this._webSocket
};
al.getCompositeScheme=function(){return this._compositeScheme
};
al.getNextStrategy=function(){if(this._connectionStrategies.length<=0){return null
}else{return this._connectionStrategies.shift()
}};
return am
})();
var ae=(function(){var ap="WebSocketControlFrameHandler";
var an=m.getLogger(ap);
var ao=function(){an.finest(ap,"<init>")
};
var am=function(au,ar){var aq=0;
for(var at=ar;
at<ar+4;
at++){aq=(aq<<8)+au.get()
}return aq
};
var al=ao.prototype=new C();
al.handleConnectionOpened=function(aw,ay){an.finest(ap,"handleConnectionOpened");
var ax=aw.responseHeaders;
if(ax["X-WebSocket-Protocol"]!=null){aw.protocol=ax["X-WebSocket-Protocol"]
}if(ax[N.HEADER_SEC_EXTENSIONS]!=null){var au=ax[N.HEADER_SEC_EXTENSIONS];
if(au!=null&&au.length>0){var at=au.split(",");
for(var aq=0;
aq<at.length;
aq++){var ar=at[aq].split(";");
if(ar.length>1){var av=ar[1].replace(/^\s+|\s+$/g,"");
aw._controlFrames[parseInt(av,16)]=ar[0].replace(/^\s+|\s+$/g,"")
}}}}this._listener.connectionOpened(aw,ay)
};
al.handleMessageReceived=function(av,au){an.finest(ap,"handleMessageReceived",au);
if(av._isEscape){av._isEscape=false;
this._listener.messageReceived(av,au);
return
}if(au==null||au.limit<4){this._listener.messageReceived(av,au);
return
}var aq=au.position;
var aw=am(au,0);
if(av._controlFrames[aw]!=null){if(au.limit==4){av._isEscape=true;
return
}else{if(N.KAAZING_SEC_EXTENSION_REVALIDATE==av._controlFrames[aw]){var at=au.getString(Charset.UTF8).substr(1);
if(av._redirectUri!=null){if(typeof(av._redirectUri)=="string"){var ar=new URI(av._redirectUri);
at=ar.scheme+"://"+ar.authority+at
}else{at=av._redirectUri.getHttpEquivalentScheme()+"://"+av._redirectUri.getAuthority()+at
}}else{at=av._location.getHttpEquivalentScheme()+"://"+av._location.getAuthority()+at
}this._listener.authenticationRequested(av,at,N.KAAZING_SEC_EXTENSION_REVALIDATE)
}}}else{au.position=aq;
this._listener.messageReceived(av,au)
}};
al.setNextHandler=function(ar){this._nextHandler=ar;
var at={};
var aq=this;
at.connectionOpened=function(au,av){aq.handleConnectionOpened(au,av)
};
at.messageReceived=function(av,au){aq.handleMessageReceived(av,au)
};
at.connectionClosed=function(au){aq._listener.connectionClosed(au)
};
at.connectionFailed=function(au){aq._listener.connectionFailed(au)
};
at.authenticationRequested=function(aw,au,av){aq._listener.authenticationRequested(aw,au,av)
};
at.redirected=function(av,au){aq._listener.redirected(av,au)
};
ar.setListener(at)
};
al.setListener=function(aq){this._listener=aq
};
return ao
})();
var ak=(function(){var am=m.getLogger("RevalidateHandler");
var an=function(ao){am.finest("ENTRY Revalidate.<init>");
this.channel=ao
};
var al=an.prototype;
al.connect=function(ao){am.finest("ENTRY Revalidate.connect with {0}",ao);
var aq=this;
var ap=new XMLHttpRequest0();
ap.open("GET",ao+"&.kr="+Math.random(),true);
if(aq.channel._challengeResponse!=null&&aq.channel._challengeResponse.credentials!=null){ap.setRequestHeader("Authorization",aq.channel._challengeResponse.credentials);
this.clearAuthenticationData(aq.channel)
}ap.onreadystatechange=function(){switch(ap.readyState){case 2:if(ap.status==403){ap.abort()
}break;
case 4:if(ap.status==401){aq.handle401(aq.channel,ao,ap.getResponseHeader("WWW-Authenticate"));
return
}break
}};
ap.send(null)
};
al.clearAuthenticationData=function(ao){if(ao._challengeResponse!=null){ao._challengeResponse.clearCredentials()
}};
al.handle401=function(at,ao,ar){var au=this;
var av=ao;
if(av.indexOf("/;a/")>0){av=av.substring(0,av.indexOf("/;a/"))
}else{if(av.indexOf("/;ae/")>0){av=av.substring(0,av.indexOf("/;ae/"))
}else{if(av.indexOf("/;ar/")>0){av=av.substring(0,av.indexOf("/;ar/"))
}}}var aq=new ChallengeRequest(av,ar);
var ap;
if(this.channel._challengeResponse.nextChallengeHandler!=null){ap=this.channel._challengeResponse.nextChallengeHandler
}else{ap=ChallengeHandlers.getDefault()
}if(ap!=null&&ap.canHandle(aq)){ap.handle(aq,function(aw){try{if(aw!=null&&aw.credentials!=null){au.channel._challengeResponse=aw;
au.connect(ao)
}}catch(ax){}})
}};
return an
})();
var U=(function(){var ao="WebSocketNativeDelegateHandler";
var an=m.getLogger(ao);
var am=function(){an.finest(ao,"<init>")
};
var al=am.prototype=new C();
al.processConnect=function(at,ar,au){an.finest(ao,"connect",at);
if(at.readyState==2){throw new Error("WebSocket is already closed")
}if(at._delegate==null){var aq=new a();
aq.parent=at;
at._delegate=aq;
ap(aq,this)
}at._delegate.connect(ar.toString(),au)
};
al.processTextMessage=function(aq,ar){an.finest(ao,"connect",aq);
if(aq._delegate.readyState()==1){aq._delegate.send(ar)
}else{throw new Error("WebSocket is already closed")
}};
al.processBinaryMessage=function(ar,aq){an.finest(ao,"connect",ar);
if(ar._delegate.readyState()==1){ar._delegate.send(aq)
}else{throw new Error("WebSocket is already closed")
}};
al.processClose=function(aq){an.finest(ao,"close",aq);
try{aq._delegate.close()
}catch(ar){}};
var ap=function(aq,at){var ar={};
ar.connectionOpened=function(au,av){at._listener.connectionOpened(au,av)
};
ar.messageReceived=function(av,au){at._listener.messageReceived(av,au)
};
ar.connectionClosed=function(au){at._listener.connectionClosed(au)
};
ar.connectionFailed=function(au){at._listener.connectionFailed(au)
};
ar.authenticationRequested=function(aw,au,av){at._listener.authenticationRequested(aw,au,av)
};
ar.redirected=function(av,au){at._listener.redirected(av,au)
};
aq.setListener(ar)
};
return am
})();
var F=(function(){var ap="WebSocketNativeBalancingHandler";
var an=m.getLogger(ap);
var ao=function(){an.finest(ap,"<init>")
};
var am=function(ar,aq,at){aq._redirecting=true;
aq._redirectUri=at;
ar._nextHandler.processClose(aq)
};
var al=ao.prototype=new C();
al.processConnect=function(ar,aq,at){ar._balanced=false;
this._nextHandler.processConnect(ar,aq,at)
};
al.handleConnectionClosed=function(aq){if(aq._redirecting==true){aq._redirecting=false;
aq._redirected=true;
aq.handshakePayload.clear();
var ar=aq._protocol;
if(ar==null||ar.length==0){ar=N.KAAZING_EXTENDED_HANDSHAKE
}else{if(ar.indexOf(N.KAAZING_EXTENDED_HANDSHAKE)<0){ar+=","+N.KAAZING_EXTENDED_HANDSHAKE
}}this.processConnect(aq,aq._redirectUri,ar)
}else{this._listener.connectionClosed(aq)
}};
al.handleMessageReceived=function(at,ar){an.finest(ap,"handleMessageReceived",ar);
if(at._balanced||ar.remaining()<4){this._listener.messageReceived(at,ar);
return
}var aq=ar.position;
var au=ar.getBytes(3);
if(au[0]==-17&&au[1]==-125){var av=ar.getString(Charset.UTF8);
if(av.match("N$")){at._balanced=true;
this._listener.connectionOpened(at,"")
}else{if(av.indexOf("R")==0){var aw=new ag(av.substring(1));
am(this,at,aw)
}else{an.warning(ap,"Invalidate balancing message: "+av)
}}return
}else{ar.position=aq;
this._listener.messageReceived(at,ar)
}};
al.setNextHandler=function(ar){this._nextHandler=ar;
var at={};
var aq=this;
at.connectionOpened=function(au,av){aq._listener.connectionOpened(au,av)
};
at.messageReceived=function(av,au){aq.handleMessageReceived(av,au)
};
at.connectionClosed=function(au){aq.handleConnectionClosed(au)
};
at.connectionFailed=function(au){aq._listener.connectionFailed(au)
};
at.authenticationRequested=function(aw,au,av){aq._listener.authenticationRequested(aw,au,av)
};
at.redirected=function(av,au){aq._listener.redirected(av,au)
};
ar.setListener(at)
};
al.setListener=function(aq){this._listener=aq
};
return ao
})();
var M=(function(){var al="WebSocketNativeHandshakeHandler";
var av=m.getLogger(al);
var ap="Sec-WebSocket-Protocol";
var aq="Sec-WebSocket-Extensions";
var ar="Authorization";
var au="WWW-Authenticate";
var aA="Set-Cookie";
var aw="GET";
var aB="HTTP/1.1";
var aE=":";
var aF=" ";
var ay="\r\n";
var az=function(){av.finest(al,"<init>")
};
var aC=function(aH,aJ){av.finest(al,"sendCookieRequest with {0}",aJ);
var aG=new XMLHttpRequest0();
var aI=aH._location.getHttpEquivalentScheme()+"://"+aH._location.getAuthority()+(aH._location._uri.path||"");
aI=aI.replace(/[\/]?$/,"/;api/set-cookies");
aG.open("POST",aI,true);
aG.setRequestHeader("Content-Type","text/plain; charset=utf-8");
aG.onreadystatechange=function(){};
aG.send(aJ)
};
var an=function(aL,aJ,aH){var aI=[];
var aG=[];
aI.push("WebSocket-Protocol");
aG.push("");
aI.push(ap);
aG.push(aJ._protocol);
aI.push(aq);
aG.push(N.KAAZING_SEC_EXTENSION_REVALIDATE);
aI.push(ar);
aG.push(aH);
var aK=ao(aJ._location,aI,aG);
aL._nextHandler.processTextMessage(aJ,aK)
};
var ao=function(aH,aL,aM){av.entering(al,"encodeGetRequest");
var aO=[];
aO.push(aw);
aO.push(aF);
var aN=[];
if(aH._uri.path!=undefined){aN.push(aH._uri.path)
}if(aH._uri.query!=undefined){aN.push("?");
aN.push(aH._uri.query)
}aO.push(aN.join(""));
aO.push(aF);
aO.push(aB);
aO.push(ay);
for(var aI=0;
aI<aL.length;
aI++){var aJ=aL[aI];
var aK=aM[aI];
if(aJ!=null&&aK!=null){aO.push(aJ);
aO.push(aE);
aO.push(aF);
aO.push(aK);
aO.push(ay)
}}aO.push(ay);
var aG=aO.join("");
return aG
};
var ax=function(aG){var aH=aG.getString(Charset.UTF8);
return aH.split("\n")
};
var at=function(aM,aK,aG){aK.handshakePayload.putBuffer(aG);
if(aG.capacity>0){return
}aK.handshakePayload.flip();
var aS=ax(aK.handshakePayload);
aK.handshakePayload.clear();
var aJ="";
for(var aI=aS.length-1;
aI>=0;
aI--){if(aS[aI].indexOf("HTTP/1.1")==0){var aQ=aS[aI].split(" ");
aJ=aQ[1];
break
}}if("101"==aJ){var aO="";
for(var aI in aS){var aR=aS[aI];
if(aR!=null&&aR.indexOf(aq)==0){aO=aR.substring(aq.length+2)
}else{if(aR!=null&&aR.indexOf(ap)==0){aK.protocol=aR.substring(ap.length+2)
}else{if(aR!=null&&aR.indexOf(aA)==0){aC(aK,aR.substring(aA.length+2))
}}}}if(aO.length>0){var aL=aO.split(", ");
for(var aI in aL){var aH=aL[aI].split("; ");
if(aH.length>1){var aP=aH[1];
aK._controlFrames[parseInt(aP,16)]=aH[0]
}}}return
}else{if("401"==aJ){aK.handshakestatus=2;
var aN="";
for(var aI in aS){if(aS[aI].indexOf(au)==0){aN=aS[aI].substring(au.length+2);
break
}}aM._listener.authenticationRequested(aK,aK._location.toString(),aN)
}else{if(aK.handshakestatus<3){try{aK.handshakestatus=3;
aM._nextHandler.processClose(aK)
}finally{aM._listener.connectionFailed(aK)
}}}}};
var am=function(aH,aG){if(aG.handshakestatus<3){try{aG.handshakestatus=3;
aH._nextHandler.processClose(aG)
}finally{aH._listener.connectionFailed(aG)
}}};
var aD=az.prototype=new C();
aD.processConnect=function(aH,aG,aJ){aH.handshakePayload=new ByteBuffer();
if(aJ==null||aJ.length==0){aJ=N.KAAZING_EXTENDED_HANDSHAKE
}else{if(aJ.indexOf(N.KAAZING_EXTENDED_HANDSHAKE)<0){aJ+=","+N.KAAZING_EXTENDED_HANDSHAKE
}}this._nextHandler.processConnect(aH,aG,aJ);
aH.handshakestatus=0;
var aI=this;
setTimeout(function(){if(aH.handshakestatus==0){am(aI,aH)
}},5000)
};
aD.processAuthorize=function(aH,aG){an(this,aH,aG)
};
aD.handleConnectionOpened=function(aG,aI){av.finest(al,"handleConnectionOpened");
if(N.KAAZING_EXTENDED_HANDSHAKE==aI){an(this,aG,null);
aG.handshakestatus=1;
var aH=this;
setTimeout(function(){if(aG.handshakestatus<2){am(aH,aG)
}},5000)
}else{aG._balanced=true;
aG.handshakestatus=2;
this._listener.connectionOpened(aG,aG.protocol)
}};
aD.handleMessageReceived=function(aH,aG){av.finest(al,"handleMessageReceived",aG);
if(aH.readyState==1){aH._isEscape=false;
this._listener.messageReceived(aH,aG)
}else{at(this,aH,aG)
}};
aD.setNextHandler=function(aG){this._nextHandler=aG;
var aI=this;
var aH={};
aH.connectionOpened=function(aJ,aK){aI.handleConnectionOpened(aJ,aK)
};
aH.messageReceived=function(aK,aJ){aI.handleMessageReceived(aK,aJ)
};
aH.connectionClosed=function(aJ){if(aJ.handshakestatus<3){aJ.handshakestatus=3;
aI._listener.connectionClosed(aJ)
}};
aH.connectionFailed=function(aJ){if(aJ.handshakestatus<3){aJ.handshakestatus=3;
aI._listener.connectionFailed(aJ)
}};
aH.authenticationRequested=function(aL,aJ,aK){aI._listener.authenticationRequested(aL,aJ,aK)
};
aH.redirected=function(aK,aJ){aI._listener.redirected(aK,aJ)
};
aG.setListener(aH)
};
aD.setListener=function(aG){this._listener=aG
};
return az
})();
var w=(function(){var an="WebSocketNativeAuthenticationHandler";
var am=m.getLogger(an);
var ao=function(){am.finest(an,"<init>")
};
var al=ao.prototype=new C();
al.handleClearAuthenticationData=function(ap){if(ap._challengeResponse!=null){ap._challengeResponse.clearCredentials()
}};
al.handleRemoveAuthenticationData=function(ap){this.handleClearAuthenticationData(ap);
ap._challengeResponse=new ChallengeResponse(null,null)
};
al.doError=function(ap){this._nextHandler.processClose(ap);
this.handleClearAuthenticationData(ap);
this._listener.connectionFailed(ap)
};
al.handle401=function(aw,ap,av){var ax=this;
var au=aw._location;
if(aw.redirectUri!=null){au=aw._redirectUri
}if(N.KAAZING_SEC_EXTENSION_REVALIDATE==av){var at=new ak(new af(au,aw._protocol,aw._isBinary));
at.connect(ap)
}else{var ar=new ChallengeRequest(au.toString(),av);
var aq;
if(aw._challengeResponse.nextChallengeHandler!=null){aq=aw._challengeResponse.nextChallengeHandler
}else{aq=ChallengeHandlers.getDefault()
}if(aq!=null&&aq.canHandle(ar)){aq.handle(ar,function(ay){try{if(ay==null||ay.credentials==null){ax.doError(aw)
}else{aw._challengeResponse=ay;
ax._nextHandler.processAuthorize(aw,ay.credentials)
}}catch(az){ax.doError(aw)
}})
}else{this.doError(aw)
}}};
al.handleAuthenticate=function(ar,ap,aq){ar.authenticationReceived=true;
this.handle401(ar,ap,aq)
};
al.setNextHandler=function(aq){this._nextHandler=aq;
var ar={};
var ap=this;
ar.connectionOpened=function(at,au){ap._listener.connectionOpened(at,au)
};
ar.messageReceived=function(au,at){ap._listener.messageReceived(au,at)
};
ar.connectionClosed=function(at){ap._listener.connectionClosed(at)
};
ar.connectionFailed=function(at){ap._listener.connectionFailed(at)
};
ar.authenticationRequested=function(av,at,au){ap.handleAuthenticate(av,at,au)
};
ar.redirected=function(au,at){ap._listener.redirected(au,at)
};
aq.setListener(ar)
};
al.setListener=function(ap){this._listener=ap
};
return ao
})();
var G=(function(){var al="WebSocketNativeHandler";
var az=m.getLogger(al);
var am=function(){var aB=new w();
return aB
};
var ap=function(){var aB=new M();
return aB
};
var an=function(){var aB=new ae();
return aB
};
var aA=function(){var aB=new F();
return aB
};
var ar=function(){var aB=new U();
return aB
};
var ax=am();
var ay=ap();
var au=an();
var ao=aA();
var aw=ar();
var aq=function(){az.finest(al,"<init>");
this.setNextHandler(ax);
ax.setNextHandler(ay);
ay.setNextHandler(au);
au.setNextHandler(ao);
ao.setNextHandler(aw)
};
var at=function(aB,aC){az.finest(al,"<init>")
};
var av=aq.prototype=new C();
av.setNextHandler=function(aB){this._nextHandler=aB;
var aD=this;
var aC={};
aC.connectionOpened=function(aE,aF){aD._listener.connectionOpened(aE,aF)
};
aC.messageReceived=function(aF,aE){aD._listener.messageReceived(aF,aE)
};
aC.connectionClosed=function(aE){aD._listener.connectionClosed(aE)
};
aC.connectionFailed=function(aE){aD._listener.connectionFailed(aE)
};
aC.authenticationRequested=function(aG,aE,aF){aD._listener.authenticationRequested(aG,aE,aF)
};
aC.redirected=function(aF,aE){aD._listener.redirected(aF,aE)
};
aB.setListener(aC)
};
av.setListener=function(aB){this._listener=aB
};
return aq
})();
var Z=(function(){var ao=m.getLogger("com.kaazing.gateway.client.html5.WebSocketEmulatedProxyDownstream");
var aA=512*1024;
var at=1;
var aD=function(aH){ao.entering(this,"WebSocketEmulatedProxyDownstream.<init>",aH);
this.retry=3000;
if(browser=="opera"||browser=="ie"){this.requiresEscaping=true
}var aK=new URI(aH);
var aI={http:80,https:443};
if(aK.port==undefined){aK.port=aI[aK.scheme];
aK.authority=aK.host+":"+aK.port
}this.origin=aK.scheme+"://"+aK.authority;
this.location=aH;
this.activeXhr=null;
this.reconnectTimer=null;
this.buf=new ByteBuffer();
var aJ=this;
setTimeout(function(){am(aJ,true);
aJ.activeXhr=aJ.mostRecentXhr;
aG(aJ,aJ.mostRecentXhr)
},0);
ao.exiting(this,"WebSocketEmulatedProxyDownstream.<init>")
};
var ay=aD.prototype;
var ar=0;
var ap=255;
var aC=1;
var aF=128;
var av=127;
var aw=3000;
ay.readyState=0;
function am(aK,aH){ao.entering(this,"WebSocketEmulatedProxyDownstream.connect");
if(aK.reconnectTimer!==null){aK.reconnectTimer=null
}var aJ=new URI(aK.location);
var aI=[];
switch(browser){case"ie":aI.push(".kns=1");
break;
case"safari":aI.push(".kp=256");
break;
case"firefox":aI.push(".kp=1025");
break;
case"android":aI.push(".kp=4096");
aI.push(".kbp=4096");
break
}if(browser=="android"||browser.ios){aI.push(".kkt=20")
}aI.push(".kc=text/plain;charset=windows-1252");
aI.push(".kb=4096");
aI.push(".kid="+String(Math.random()).substring(2));
if(aI.length>0){if(aJ.query===undefined){aJ.query=aI.join("&")
}else{aJ.query+="&"+aI.join("&")
}}var aL=new XMLHttpRequest0();
aL.id=at++;
aL.position=0;
aL.opened=false;
aL.reconnect=false;
aL.requestClosing=false;
aL.onprogress=function(){if(aL==aK.activeXhr&&aK.readyState!=2){setTimeout(function(){al(aK)
},0)
}};
aL.onload=function(){if(aL==aK.activeXhr&&aK.readyState!=2){al(aK);
aL.onerror=function(){};
aL.ontimeout=function(){};
aL.onreadystatechange=function(){};
if(!aL.reconnect){au(aK)
}else{if(aL.requestClosing){aq(aK)
}else{if(aK.activeXhr==aK.mostRecentXhr){am(aK);
aK.activeXhr=aK.mostRecentXhr;
aG(aK,aK.activeXhr)
}else{var aM=aK.mostRecentXhr;
aK.activeXhr=aM;
switch(aM.readyState){case 1:case 2:aG(aK,aM);
break;
case 3:al(aK);
break;
case 4:aK.activeXhr.onload();
break;
default:}}}}}};
aL.ontimeout=function(){ao.entering(this,"WebSocketEmulatedProxyDownstream.connect.xhr.ontimeout");
au(aK)
};
aL.onerror=function(){ao.entering(this,"WebSocketEmulatedProxyDownstream.connect.xhr.onerror");
au(aK)
};
aL.open("GET",aJ.toString(),true);
aL.send("");
aK.mostRecentXhr=aL
}function aG(aH,aI){if(aH.location.indexOf("&.ki=p")==-1){setTimeout(function(){if(aI&&aI.readyState<3&&aH.readyState<2){aH.location+="&.ki=p";
am(aH,false)
}},aw)
}}ay.disconnect=function(){ao.entering(this,"WebSocketEmulatedProxyDownstream.disconnect");
if(this.readyState!==2){az(this)
}};
function az(aH){ao.entering(this,"WebSocketEmulatedProxyDownstream._disconnect");
if(aH.reconnectTimer!==null){clearTimeout(aH.reconnectTimer);
aH.reconnectTimer=null
}if(aH.mostRecentXhr!==null){aH.mostRecentXhr.onprogress=function(){};
aH.mostRecentXhr.onload=function(){};
aH.mostRecentXhr.onerror=function(){};
aH.mostRecentXhr.abort()
}if(aH.activeXhr!=aH.mostRecentXhr&&aH.activeXhr!==null){aH.activeXhr.onprogress=function(){};
aH.activeXhr.onload=function(){};
aH.activeXhr.onerror=function(){};
aH.activeXhr.abort()
}aH.lineQueue=[];
aH.lastEventId=null;
aH.location=null;
aH.readyState=2
}function al(aQ){var aV=aQ.activeXhr;
var aP=aV.responseText;
if(aP.length>=aA){if(aQ.activeXhr==aQ.mostRecentXhr){am(aQ,false)
}}var aL=aP.slice(aV.position);
aV.position=aP.length;
var aJ=aQ.buf;
var aW=H.toArray(aL,aQ.requiresEscaping);
if(aW.hasRemainder){aV.position--
}aJ.position=aJ.limit;
aJ.putBytes(aW);
aJ.position=0;
aJ.mark();
parse:while(true){if(!aJ.hasRemaining()){break
}var aR=aJ.getUnsigned();
switch(aR&128){case ar:var aU=aJ.indexOf(ap);
if(aU==-1){break parse
}var aK=aJ.array.slice(aJ.position,aU);
var aM=new ByteBuffer(aK);
var aH=aU-aJ.position;
aJ.skip(aH+1);
aJ.mark();
if(aR==aC){an(aQ,aM)
}else{ax(aQ,aM)
}break;
case aF:var aI=0;
var aN=false;
while(aJ.hasRemaining()){var aS=aJ.getUnsigned();
aI=aI<<7;
aI|=(aS&127);
if((aS&128)!=128){aN=true;
break
}}if(!aN){break parse
}if(aJ.remaining()<aI){break parse
}var aO=aJ.array.slice(aJ.position,aJ.position+aI);
var aT=new ByteBuffer(aO);
aJ.skip(aI);
aJ.mark();
aB(aQ,aT);
break;
default:throw new Error("Emulation protocol error. Unknown frame type: "+aR)
}}aJ.reset();
aJ.compact()
}function an(aI,aH){while(aH.remaining()){var aJ=String.fromCharCode(aH.getUnsigned());
switch(aJ){case"0":break;
case"1":aI.activeXhr.reconnect=true;
break;
case"2":aI.activeXhr.requestClosing=true;
break;
default:throw new Error("Protocol decode error. Unknown command: "+aJ)
}}}function aB(aJ,aH){var aI=document.createEvent("Events");
aI.initEvent("message",true,true);
aI.lastEventId=aJ.lastEventId;
aI.data=aH;
aI.decoder=o;
aI.origin=aJ.origin;
if(aI.source!==null){aI.source=null
}if(typeof(aJ.onmessage)==="function"){aJ.onmessage(aI)
}}function ax(aJ,aH){var aI=document.createEvent("Events");
aI.initEvent("message",true,true);
aI.lastEventId=aJ.lastEventId;
aI.text=aH;
aI.origin=aJ.origin;
if(aI.source!==null){aI.source=null
}if(typeof(aJ.onmessage)==="function"){aJ.onmessage(aI)
}}function aq(aH){au(aH)
}function au(aH){if(aH.readyState!=2){aH.disconnect();
aE(aH)
}}function aE(aI){var aH=document.createEvent("Events");
aH.initEvent("error",true,true);
if(typeof(aI.onerror)==="function"){aI.onerror(aH)
}}return aD
})();
var T=(function(){var ap=m.getLogger("WebSocketEmulatedProxy");
var aB=function(){this.parent;
this._listener
};
var az=aB.prototype;
az.connect=function(aF,aG){ap.entering(this,"WebSocketEmulatedProxy.connect",{location:aF,subprotocol:aG});
this.URL=aF.replace("ws","http");
this.protocol=aG;
if(browser=="opera"||browser=="ie"){ap.config(this,"WebSocketEmulatedProxy.<init>: browser is "+browser);
this.requiresEscaping=true
}this._sendQueue=[];
al(this);
ap.exiting(this,"WebSocketEmulatedProxy.<init>")
};
az.readyState=0;
az.bufferedAmount=0;
az.URL="";
az.onopen=function(){};
az.onerror=function(){};
az.onmessage=function(aF){};
az.onclose=function(){};
var aE=128;
var aw=0;
var aq=255;
var aD=1;
var an=[aD,48,49,aq];
var aA=[aD,48,50,aq];
az.send=function(aG){ap.entering(this,"WebSocketEmulatedProxy.send",{data:aG});
switch(this.readyState){case 0:ap.severe(this,"WebSocketEmulatedProxy.send: Error: readyState is 0");
throw new Error("INVALID_STATE_ERR");
case 1:if(aG===null){ap.severe(this,"WebSocketEmulatedProxy.send: Error: data is null");
throw new Error("data is null")
}var aF=new ByteBuffer();
if(typeof aG=="string"){ap.finest(this,"WebSocketEmulatedProxy.send: Data is string");
aF.put(aw);
aF.putString(aG,Charset.UTF8);
aF.put(aq)
}else{if(aG.constructor==ByteBuffer){ap.finest(this,"WebSocketEmulatedProxy.send: Data is ByteBuffer");
aF.put(aE);
aC(aF,aG.remaining());
aF.putBuffer(aG)
}else{ap.severe(this,"WebSocketEmulatedProxy.send: Error: Invalid type for send");
throw new Error("Invalid type for send")
}}aF.flip();
ao(this,aF);
return true;
case 2:return false;
default:ap.severe(this,"WebSocketEmulatedProxy.send: Error: invalid readyState");
throw new Error("INVALID_STATE_ERR")
}ap.exiting(this,"WebSocketEmulatedProxy.send")
};
az.close=function(){ap.entering(this,"WebSocketEmulatedProxy.close");
switch(this.readyState){case 0:av(this);
break;
case 1:ao(this,new ByteBuffer(aA));
av(this);
break
}};
az.setListener=function(aF){this._listener=aF
};
function ao(aG,aF){ap.entering(this,"WebSocketEmulatedProxy.doSend",aF);
aG.bufferedAmount+=aF.remaining();
aG._sendQueue.push(aF);
if(!aG._writeSuspended){ax(aG)
}}function ax(aI){ap.entering(this,"WebSocketEmulatedProxy.doFlush");
var aG=aI._sendQueue;
var aH=aG.length;
aI._writeSuspended=(aH>0);
if(aH>0){var aJ=new XMLHttpRequest0();
aJ.open("POST",aI._upstream+"&.kr="+Math.random(),true);
aJ.onreadystatechange=function(){if(aJ.readyState==4){ap.finest(this,"WebSocketEmulatedProxy.doFlush: xhr.status="+aJ.status);
switch(aJ.status){case 200:setTimeout(function(){ax(aI)
},0);
break;
default:av(aI);
break
}}};
var aF=new ByteBuffer();
while(aG.length){aF.putBuffer(aG.shift())
}aF.putBytes(an);
aF.flip();
if(browser=="firefox"){if(aJ.sendAsBinary){ap.finest(this,"WebSocketEmulatedProxy.doFlush: xhr.sendAsBinary");
aJ.setRequestHeader("Content-Type","application/octet-stream");
aJ.sendAsBinary(t(aF))
}else{aJ.send(t(aF))
}}else{aJ.setRequestHeader("Content-Type","text/plain; charset=utf-8");
aJ.send(t(aF,aI.requiresEscaping))
}}aI.bufferedAmount=0
}var ar=function(aF){if(aF.challengeResponse==null){return
}aF.challengeResponse.clearCredentials()
};
var al=function(aM){ap.entering(this,"WebSocketEmulatedProxy.connect");
var aH=new URI(aM.URL);
aH.scheme=aH.scheme.replace("ws","http");
var aI=aM.requiresEscaping?"/;e/cte":"/;e/ct";
aH.path=aH.path.replace(/[\/]?$/,aI);
var aF=aH.toString();
var aN=aF.indexOf("?");
if(aN==-1){aF+="?"
}else{aF+="&"
}aF+=".kn="+String(Math.random()).substring(2);
ap.finest(this,"WebSocketEmulatedProxy.connect: Connecting to "+aF);
var aL=new XMLHttpRequest0();
var aJ=false;
aL.open("GET",aF,true);
aL.setRequestHeader("X-WebSocket-Version","wseb-1.0");
for(var aK=0;
aK<aM.parent.requestHeaders.length;
aK++){var aG=aM.parent.requestHeaders[aK];
aL.setRequestHeader(aG.label,aG.value)
}if(aM.challengeResponse!=null&&aM.challengeResponse.credentials!=null){aL.setRequestHeader("Authorization",aM.challengeResponse.credentials);
ar(aM)
}aL.onreadystatechange=function(){switch(aL.readyState){case 2:if(aL.status==403){ay(aM)
}else{timer=setTimeout(function(){if(!aJ){ay(aM)
}},5000)
}break;
case 4:aJ=true;
if(aL.status==401){aM._listener.authenticationRequested(aM.parent,aL._location,aL.getResponseHeader("WWW-Authenticate"));
return
}if(aM.readyState<2){if(aL.status==201){var aO=aL.responseText.split("\n");
aM._upstream=aO[0];
var aP=aO[1];
aM._downstream=new Z(aP);
var aQ=aP.substring(0,aP.indexOf("/;e/"));
if(aQ!=aM.parent._location.toString().replace("ws","http")){aM.parent._redirectUri=aQ
}at(aM,aM._downstream);
aM.parent.responseHeaders=aL.getAllResponseHeaders();
au(aM)
}else{ay(aM)
}}break
}};
aL.send(null);
ap.exiting(this,"WebSocketEmulatedProxy.connect")
};
var aC=function(aF,aG){ap.entering(this,"WebSocketEmulatedProxy.encodeLength",{buf:aF,length:aG});
var aJ=0;
var aH=0;
do{aH<<=8;
aH|=(aG&127);
aG>>=7;
aJ++
}while(aG>0);
do{var aI=aH&255;
aH>>=8;
if(aJ!=1){aI|=128
}aF.put(aI)
}while(--aJ>0)
};
var au=function(aF){ap.entering(this,"WebSocketEmulatedProxy.doOpen");
aF.readyState=1;
aF._listener.connectionOpened(aF.parent,"")
};
function ay(aF){ar(aF);
if(aF.readyState<2){ap.entering(this,"WebSocketEmulatedProxy.doError");
aF.readyState=2;
if(aF.onerror!=null){aF._listener.connectionFailed(aF.parent)
}}}var av=function(aF){ap.entering(this,"WebSocketEmulatedProxy.doClose");
switch(aF.readyState){case 2:break;
case 0:case 1:aF.readyState=2;
aF._listener.connectionClosed(aF.parent);
break;
default:}};
var am=function(aI,aH){ap.finest("WebSocket.handleMessage: A WebSocket binary frame received on a WebSocket");
var aG;
if(aH.text){var aF=aH.text;
aG=ByteBuffer.allocate(aF.length);
aG.putString(aF,Charset.UTF8);
aG.position=0
}else{if(aH.data){aG=aH.data
}}aI._listener.messageReceived(aI.parent,aG)
};
var at=function(aG,aF){ap.entering(this,"WebSocketEmulatedProxy.bindHandlers");
aF.onmessage=function(aH){switch(aH.type){case"message":if(aG.readyState==1){am(aG,aH)
}break
}};
aF.onerror=function(){try{aF.disconnect()
}finally{av(aG)
}}
};
return aB
})();
var ab=(function(){var ao="WebSocketEmulatedDelegateHandler";
var am=m.getLogger(ao);
var an=function(){am.finest(ao,"<init>")
};
var al=an.prototype=new C();
al.processConnect=function(at,ar,au){am.finest(ao,"connect",at);
if(at.readyState==2){throw new Error("WebSocket is already closed")
}var aq=new T();
aq.parent=at;
at._delegate=aq;
ap(aq,this);
aq.connect(ar.toString(),au)
};
al.processTextMessage=function(aq,ar){am.finest(ao,"connect",aq);
if(aq.readyState==1){aq._delegate.send(ar)
}else{throw new Error("WebSocket is already closed")
}};
al.processBinaryMessage=function(ar,aq){am.finest(ao,"connect",ar);
if(ar.readyState==1){ar._delegate.send(aq)
}else{throw new Error("WebSocket is already closed")
}};
al.processClose=function(aq){try{aq._delegate.close()
}catch(ar){listener.connectionClosed(aq)
}};
var ap=function(aq,at){var ar={};
ar.connectionOpened=function(au,av){at._listener.connectionOpened(au,av)
};
ar.messageReceived=function(av,au){at._listener.messageReceived(av,au)
};
ar.connectionClosed=function(au){at._listener.connectionClosed(au)
};
ar.connectionFailed=function(au){at._listener.connectionFailed(au)
};
ar.authenticationRequested=function(aw,au,av){at._listener.authenticationRequested(aw,au,av)
};
ar.redirected=function(av,au){at._listener.redirected(av,au)
};
aq.setListener(ar)
};
return an
})();
var Y=(function(){var ao="WebSocketEmulatedAuthenticationHandler";
var am=m.getLogger(ao);
var an=function(){am.finest(ao,"<init>")
};
var al=an.prototype=new C();
al.handleClearAuthenticationData=function(ap){if(ap._challengeResponse!=null){ap._challengeResponse.clearCredentials()
}};
al.handleRemoveAuthenticationData=function(ap){this.handleClearAuthenticationData(ap);
ap._challengeResponse=new ChallengeResponse(null,null)
};
al.handle401=function(at,ay,ax){var av=this;
if(N.KAAZING_SEC_EXTENSION_REVALIDATE==ax){var au=new ak(at);
au.connect(ay)
}else{var aw=ay;
if(aw.indexOf("/;e/")>0){aw=aw.substring(0,aw.indexOf("/;e/"))
}var aq=new ag(aw.replace("http","ws"));
var ar=new ChallengeRequest(aw,ax);
var ap;
if(at._challengeResponse.nextChallengeHandler!=null){ap=at._challengeResponse.nextChallengeHandler
}else{ap=ChallengeHandlers.getDefault()
}if(ap!=null&&ap.canHandle(ar)){ap.handle(ar,function(az){try{if(az==null||az.credentials==null){av.handleClearAuthenticationData(at);
av._listener.connectionFailed(at)
}else{at._challengeResponse=az;
av.processConnect(at,aq,at._protocol)
}}catch(aA){av.handleClearAuthenticationData(at);
av._listener.connectionFailed(at)
}})
}else{this.handleClearAuthenticationData(at);
this._listener.connectionFailed(at)
}}};
al.processConnect=function(at,ap,au){if(at._challengeResponse!=null&&at._challengeResponse.credentials!=null){var aq=at._challengeResponse.credentials.toString();
var ar=new aa("Authorization",aq);
at.requestHeaders.push(ar);
this.handleClearAuthenticationData(at)
}this._nextHandler.processConnect(at,ap,au)
};
al.handleAuthenticate=function(ar,ap,aq){ar.authenticationReceived=true;
this.handle401(ar,ap,aq)
};
al.setNextHandler=function(aq){this._nextHandler=aq;
var ar={};
var ap=this;
ar.connectionOpened=function(at,au){ap._listener.connectionOpened(at,au)
};
ar.messageReceived=function(au,at){ap._listener.messageReceived(au,at)
};
ar.connectionClosed=function(at){ap._listener.connectionClosed(at)
};
ar.connectionFailed=function(at){ap._listener.connectionFailed(at)
};
ar.authenticationRequested=function(av,at,au){ap.handleAuthenticate(av,at,au)
};
ar.redirected=function(au,at){ap._listener.redirected(au,at)
};
aq.setListener(ar)
};
al.setListener=function(ap){this._listener=ap
};
return an
})();
var L=(function(){var al="WebSocketEmulatedHandler";
var aw=m.getLogger(al);
var am=function(){var ax=new Y();
return ax
};
var an=function(){var ax=new ae();
return ax
};
var ap=function(){var ax=new ab();
return ax
};
var av=am();
var ar=an();
var au=ap();
var ao=function(){aw.finest(al,"<init>");
this.setNextHandler(av);
av.setNextHandler(ar);
ar.setNextHandler(au)
};
var aq=function(ax,ay){aw.finest(al,"<init>")
};
var at=ao.prototype=new C();
at.setNextHandler=function(ax){this._nextHandler=ax;
var az=this;
var ay={};
ay.connectionOpened=function(aA,aB){az._listener.connectionOpened(aA,aB)
};
ay.messageReceived=function(aB,aA){az._listener.messageReceived(aB,aA)
};
ay.connectionClosed=function(aA){az._listener.connectionClosed(aA)
};
ay.connectionFailed=function(aA){az._listener.connectionFailed(aA)
};
ay.authenticationRequested=function(aC,aA,aB){az._listener.authenticationRequested(aC,aA,aB)
};
ay.redirected=function(aB,aA){az._listener.redirected(aB,aA)
};
ax.setListener(ay)
};
at.setListener=function(ax){this._listener=ax
};
return ao
})();
var J=(function(){var an="WebSocketFlashEmulatedDelegateHandler";
var am=m.getLogger(an);
var ap=function(){am.finest(an,"<init>")
};
var al=ap.prototype=new C();
al.processConnect=function(at,ar,au){am.finest(an,"connect",at);
if(at.readyState==2){throw new Error("WebSocket is already closed")
}var aq=new f();
aq.parent=at;
at._delegate=aq;
ao(aq,this);
aq.connect(ar.toString(),au)
};
al.processTextMessage=function(aq,ar){am.finest(an,"connect",aq);
if(aq.readyState==1){aq._delegate.send(ar)
}else{throw new Error("WebSocket is already closed")
}};
al.processBinaryMessage=function(ar,aq){am.finest(an,"connect",ar);
if(ar.readyState==1){ar._delegate.send(aq)
}else{throw new Error("WebSocket is already closed")
}};
al.processClose=function(aq){am.finest(an,"close",aq);
if(aq.readyState==1){aq._delegate.close()
}else{throw new Error("WebSocket is already closed")
}};
var ao=function(aq,at){var ar={};
ar.connectionOpened=function(au,av){at._listener.connectionOpened(au,av)
};
ar.messageReceived=function(av,au){at._listener.messageReceived(av,au)
};
ar.connectionClosed=function(au){at._listener.connectionClosed(au)
};
ar.connectionFailed=function(au){at._listener.connectionFailed(au)
};
ar.authenticationRequested=function(aw,au,av){at._listener.authenticationRequested(aw,au,av)
};
ar.redirected=function(av,au){av._redirectUri=au
};
aq.setListener(ar)
};
return ap
})();
var V=(function(){var al="WebSocketFlashEmulatedHandler";
var aw=m.getLogger(al);
var am=function(){var ax=new Y();
return ax
};
var an=function(){var ax=new ae();
return ax
};
var ap=function(){var ax=new J();
return ax
};
var av=am();
var ar=an();
var au=ap();
var ao=function(){aw.finest(al,"<init>");
this.setNextHandler(av);
av.setNextHandler(ar);
ar.setNextHandler(au)
};
var aq=function(ax,ay){aw.finest(al,"<init>")
};
var at=ao.prototype=new C();
at.setNextHandler=function(ax){this._nextHandler=ax;
var az=this;
var ay={};
ay.connectionOpened=function(aA,aB){az._listener.connectionOpened(aA,aB)
};
ay.messageReceived=function(aB,aA){az._listener.messageReceived(aB,aA)
};
ay.connectionClosed=function(aA){az._listener.connectionClosed(aA)
};
ay.connectionFailed=function(aA){az._listener.connectionFailed(aA)
};
ay.authenticationRequested=function(aC,aA,aB){az._listener.authenticationRequested(aC,aA,aB)
};
ay.redirected=function(aB,aA){az._listener.redirected(aB,aA)
};
ax.setListener(ay)
};
at.setListener=function(ax){this._listener=ax
};
return ao
})();
var S=(function(){var ao="WebSocketFlashRtmpDelegateHandler";
var am=m.getLogger(ao);
var aq;
var an=function(){am.finest(ao,"<init>");
aq=this
};
var al=an.prototype=new C();
al.processConnect=function(au,at,av){am.finest(ao,"connect",au);
if(au.readyState==2){throw new Error("WebSocket is already closed")
}var ar=new e();
ar.parent=au;
au._delegate=ar;
ap(ar,this);
ar.connect(at.toString(),av)
};
al.processTextMessage=function(ar,at){am.finest(ao,"connect",ar);
if(ar.readyState==1){ar._delegate.send(at)
}else{throw new Error("WebSocket is already closed")
}};
al.processBinaryMessage=function(at,ar){am.finest(ao,"connect",at);
if(at.readyState==1){at._delegate.send(ar)
}else{throw new Error("WebSocket is already closed")
}};
al.processClose=function(ar){am.finest(ao,"close",ar);
if(ar.readyState==1){ar._delegate.close()
}else{throw new Error("WebSocket is already closed")
}};
var ap=function(ar,au){var at={};
at.connectionOpened=function(av,aw){au._listener.connectionOpened(av,aw)
};
at.messageReceived=function(aw,av){au._listener.messageReceived(aw,av)
};
at.connectionClosed=function(av){au._listener.connectionClosed(av)
};
at.connectionFailed=function(av){au._listener.connectionFailed(av)
};
at.authenticationRequested=function(ax,av,aw){au._listener.authenticationRequested(ax,av,aw)
};
at.redirected=function(aw,av){aw._redirectUri=av
};
ar.setListener(at)
};
return an
})();
var W=(function(){var al="WebSocketFlashRtmpHandler";
var aw=m.getLogger(al);
var am=function(){var ax=new Y();
return ax
};
var an=function(){var ax=new ae();
return ax
};
var ao=function(){var ax=new S();
return ax
};
var av=am();
var aq=an();
var au=ao();
var ar=function(){aw.finest(al,"<init>");
this.setNextHandler(av);
av.setNextHandler(aq);
aq.setNextHandler(au)
};
var ap=function(ax,ay){aw.finest(al,"<init>")
};
var at=ar.prototype=new C();
at.setNextHandler=function(ax){this._nextHandler=ax;
var az=this;
var ay={};
ay.connectionOpened=function(aA,aB){az._listener.connectionOpened(aA,aB)
};
ay.messageReceived=function(aB,aA){az._listener.messageReceived(aB,aA)
};
ay.connectionClosed=function(aA){az._listener.connectionClosed(aA)
};
ay.connectionFailed=function(aA){az._listener.connectionFailed(aA)
};
ay.authenticationRequested=function(aC,aA,aB){az._listener.authenticationRequested(aC,aA,aB)
};
ay.redirected=function(aB,aA){az._listener.redirected(aB,aA)
};
ax.setListener(ay)
};
at.setListener=function(ax){this._listener=ax
};
return ar
})();
var ac=(function(){var ao="WebSocketSelectedHandler";
var am=m.getLogger(ao);
var an=function(){am.fine(ao,"<init>")
};
var al=an.prototype=new C();
al.processConnect=function(aq,ap,ar){am.fine(ao,"connect",aq);
if(aq.readyState==2){throw new Error("WebSocket is already closed")
}this._nextHandler.processConnect(aq,ap,ar)
};
al.handleConnectionOpened=function(aq,ar){am.fine(ao,"handleConnectionOpened");
var ap=aq;
if(ap.readyState==0){ap.readyState=1;
this._listener.connectionOpened(aq,ar)
}};
al.handleMessageReceived=function(aq,ap){am.fine(ao,"handleMessageReceived",ap);
if(aq.readyState!=1){return
}this._listener.messageReceived(aq,ap)
};
al.handleConnectionClosed=function(aq){am.fine(ao,"handleConnectionClosed");
var ap=aq;
if(ap.readyState!=2){ap.readyState=2;
this._listener.connectionClosed(aq)
}};
al.handleConnectionFailed=function(ap){am.fine(ao,"connectionFailed");
if(ap.readyState!=2){ap.readyState=2;
this._listener.connectionFailed(ap)
}};
al.setNextHandler=function(ap){this._nextHandler=ap;
var aq={};
var ar=this;
aq.connectionOpened=function(at,au){ar.handleConnectionOpened(at,au)
};
aq.redirected=function(au,at){throw new Error("invalid event received")
};
aq.authenticationRequested=function(av,at,au){throw new Error("invalid event received")
};
aq.messageReceived=function(au,at){ar.handleMessageReceived(au,at)
};
aq.connectionClosed=function(at){ar.handleConnectionClosed(at)
};
aq.connectionFailed=function(at){ar.handleConnectionFailed(at)
};
ap.setListener(aq)
};
al.setListener=function(ap){this._listener=ap
};
return an
})();
var Q=(function(){var al=function(an,ao,am){this._nativeEquivalent=an;
this._handler=ao;
this._channelFactory=am
};
return al
})();
var K=(function(){var am="WebSocketCompositeHandler";
var aD=m.getLogger(am);
var aA="javascript:ws";
var ap="javascript:wss";
var az="javascript:wse";
var aG="javascript:wse+ssl";
var aB="flash:wse";
var au="flash:wse+ssl";
var ar="flash:wsr";
var av="flash:wsr+ssl";
var aJ={};
var ao={};
var an=new D();
var al=new I();
var aw=function(){this._handlerListener=at(this);
this._nativeHandler=aC(this);
this._emulatedHandler=aE(this);
this._emulatedFlashHandler=aq(this);
this._rtmpFlashHandler=aH(this);
aD.finest(am,"<init>");
ay();
aJ[aA]=new Q("ws",this._nativeHandler,an);
aJ[ap]=new Q("wss",this._nativeHandler,an);
aJ[az]=new Q("ws",this._emulatedHandler,al);
aJ[aG]=new Q("wss",this._emulatedHandler,al);
aJ[aB]=new Q("ws",this._emulatedFlashHandler,al);
aJ[au]=new Q("wss",this._emulatedFlashHandler,al);
aJ[ar]=new Q("ws",this._rtmpFlashHandler,al);
aJ[av]=new Q("wss",this._rtmpFlashHandler,al)
};
function ax(){if(browser!="ie"){return false
}var aK=navigator.appVersion;
return(aK.indexOf("MSIE 6.0")>=0||aK.indexOf("MSIE 7.0")>=0)
}function ay(){if(ax()){ao.ws=new Array(aA,aB,az);
ao.wss=new Array(ap,au,aG)
}else{ao.ws=new Array(aA,az);
ao.wss=new Array(ap,aG)
}}function at(aL){var aK={};
aK.connectionOpened=function(aM,aN){aL.handleConnectionOpened(aM,aN)
};
aK.messageReceived=function(aN,aM){aL.handleMessageReceived(aN,aM)
};
aK.connectionClosed=function(aM){aL.handleConnectionClosed(aM)
};
aK.connectionFailed=function(aM){aL.handleConnectionFailed(aM)
};
aK.authenticationRequested=function(aO,aM,aN){};
aK.redirected=function(aN,aM){};
return aK
}function aC(aL){var aK=new ac();
var aM=new G();
aK.setListener(aL._handlerListener);
aK.setNextHandler(aM);
return aK
}function aE(aL){var aK=new ac();
var aM=new L();
aK.setListener(aL._handlerListener);
aK.setNextHandler(aM);
return aK
}function aq(aM){var aK=new ac();
var aL=new V();
aK.setListener(aM._handlerListener);
aK.setNextHandler(aL);
return aK
}function aH(aM){var aK=new ac();
var aL=new W();
aK.setListener(aM._handlerListener);
aK.setNextHandler(aL);
return aK
}var aF=function(aO,aN){var aR=aJ[aN];
var aM=aR._channelFactory;
var aK=aO._location;
var aQ=aO._protocol;
var aP=aO._isBinary;
var aL=aM.createChannel(aK,aQ,aP);
aO._selectedChannel=aL;
aL.parent=aO;
aL._handler=aR._handler;
aL._handler.processConnect(aO._selectedChannel,aK,aQ)
};
var aI=aw.prototype;
aI.fallbackNext=function(aL){aD.finest(am,"fallbackNext");
var aK=aL.getNextStrategy();
if(aK==null){this.doClose(aL)
}else{aF(aL,aK)
}};
aI.doOpen=function(aK){if(aK.readyState==0){aK.readyState=1;
aK._webSocket.handleOpen()
}};
aI.doClose=function(aK){if(aK.readyState==0||aK.readyState==1){aK.readyState=2;
aK._webSocket.handleClose()
}};
aI.processConnect=function(aP,aL,aR){aD.finest(am,"connect",aP);
var aK=aP;
aD.finest("Current ready state = "+aK.readyState);
if(aK.readyState==1){aD.fine("Attempt to reconnect an existing open WebSocket to a different location");
throw new Error("Attempt to reconnect an existing open WebSocket to a different location")
}var aM=aK._compositeScheme;
if(aM!="ws"&&aM!="wss"){var aQ=aJ[aM];
if(aQ==null){throw new Error("Invalid connection scheme: "+aM)
}aD.finest("Turning off fallback since the URL is prefixed with java:");
aK._connectionStrategies.push(aM)
}else{var aO=ao[aM];
if(aO!=null){for(var aN=0;
aN<aO.length;
aN++){aK._connectionStrategies.push(aO[aN])
}}else{throw new Error("Invalid connection scheme: "+aM)
}}this.fallbackNext(aK)
};
aI.processTextMessage=function(aN,aM){aD.finest(am,"send",aM);
var aL=aN;
if(aL.readyState!=1){aD.fine("Attempt to post message on unopened or closed web socket");
throw new Error("Attempt to post message on unopened or closed web socket")
}var aK=aL._selectedChannel;
aK._handler.processTextMessage(aK,aM)
};
aI.processBinaryMessage=function(aN,aM){aD.finest(am,"send",aM);
var aL=aN;
if(aL.readyState!=1){aD.fine("Attempt to post message on unopened or closed web socket");
throw new Error("Attempt to post message on unopened or closed web socket")
}var aK=aL._selectedChannel;
aK._handler.processBinaryMessage(aK,aM)
};
aI.processClose=function(aM){aD.finest(am,"close");
var aL=aM;
if(aL&&aL.readyState==2){aD.fine("WebSocket already closed");
throw new Error("WebSocket already closed")
}if(aL&&!aL._closing){aL._closing=true;
var aK=aL._selectedChannel;
aK._handler.processClose(aK)
}};
aI.setListener=function(aK){this._listener=aK
};
aI.handleConnectionOpened=function(aL,aM){var aK=aL.parent;
this.doOpen(aK)
};
aI.handleMessageReceived=function(aM,aK){var aL=aM.parent;
aL._webSocket.handleMessage(aK)
};
aI.handleConnectionClosed=function(aL){var aK=aL.parent;
if(aK._closing){this.doClose(aK)
}else{if(aK.readyState==0&&!aL.authenticationReceived){this.fallbackNext(aK)
}else{this.doClose(aK)
}}};
aI.handleConnectionFailed=function(aL){var aK=aL.parent;
if(aK._closing){this.doClose(aK)
}else{if(aK.readyState==0&&!aL.authenticationReceived){this.fallbackNext(aK)
}else{this.doClose(aK)
}}};
return aw
})();
(function(){var al=new K();
window.WebSocket=(function(){var am="WebSocket";
var au=m.getLogger(am);
var ap=function(aw,ax){au.entering(this,"WebSocket.<init>",{url:aw,protocol:ax});
this.readyState=0;
this.location=aw;
this.protocol=ax;
this._queue=[];
av(this,aw,ax)
};
var av=function(ay,aw,az){var ax=new A(aw);
ay._channel=new O(ax,az,false);
ay._channel._webSocket=ay;
al.processConnect(ay._channel,ax.getWSEquivalent(),az)
};
function aq(ay,aw){au.entering(this,"WebSocket.doOpen");
if(ay.readyState<1){ay.readyState=1;
if(typeof(ay.onopen)!=="undefined"){if(!aw){try{aw=document.createEvent("Events");
aw.initEvent("open",true,true)
}catch(az){aw={type:"open",bubbles:true,cancelable:true}
}}try{ay.onopen(aw)
}catch(ax){au.severe(this,"WebSocket.onopen: Error thrown from application")
}}}}var ao=ap.prototype;
ao.getURL=function(){return this.location
};
ao.getProtocol=function(){return this._channel.protocol||""
};
ao.getReadyState=function(){return this.readyState
};
ao.send=function(aw){switch(this.readyState){case 0:au.error("WebSocket.send: Error: Attempt to send message on unopened or closed WebSocket");
throw new Error("Attempt to send message on unopened or closed WebSocket");
case 1:al.processTextMessage(this._channel,aw);
return true;
case 2:return false;
default:au.error("WebSocket.send: Illegal state error");
throw new Error("Illegal state error")
}};
ao.close=function(){al.processClose(this._channel)
};
ao.handleOpen=function(ax){switch(this.readyState){case 0:aq(this,ax);
break;
case 1:case 2:var aw=(ax?" from "+ax.target:"");
au.severe(this,"WebSocket.openHandler: Error: Invalid readyState for open event"+aw);
throw new Error("Invalid readyState for open event"+aw);
default:au.severe(this,"WebSocket.openHandler: Error: Invalid readyState "+_readyState);
throw new Error("Socket has invalid readyState: "+_readyState)
}};
var an=function(ay,aw){if(typeof(ay.onmessage)==="function"){var ax;
try{ax=document.createEvent("Events");
ax.initEvent("message",true,true)
}catch(az){ax={type:"message",bubbles:true,cancelable:true}
}ax.data=j(aw,Charset.UTF8);
ax.source=ay;
ay.onmessage(ax)
}};
var at=function(az){var aA=new Date().getTime();
var ax=aA+50;
while(az._queue.length>0){if(new Date().getTime()>ax){setTimeout(function(){at(az)
},0);
return
}var aw=az._queue.shift();
var ay=false;
try{an(az,aw);
ay=true
}finally{if(!ay){if(az._queue.length==0){az._delivering=false
}else{setTimeout(function(){at(az)
},0)
}}}}az._delivering=false
};
ao.handleMessage=function(aw){switch(this.readyState){case 1:this._queue.push(aw);
if(!this._delivering){this._delivering=true;
at(this)
}break;
case 0:case 2:break;
default:throw new Error("Socket has invalid readyState: "+$this.readyState)
}};
var ar=function(ax,aw){au.entering(ax,"WebSocket.doClose");
if(ax.readyState<2){ax.readyState=2;
delete ax._channel;
if(typeof(ax.onclose)!=="undefined"){setTimeout(function(){if(!aw){try{aw=document.createEvent("Events");
aw.initEvent("close",true,true)
}catch(az){aw={type:"close",bubbles:true,cancelable:true}
}}try{ax.onclose(aw)
}catch(ay){au.severe(this,"WebSocket.onclose: Error thrown from application")
}},0)
}}};
ao.handleClose=function(aw){ar(this,aw)
};
ao.handleError=function(aw){ar(this,aw)
};
return ap
})();
window.WebSocket.__impls__={};
window.WebSocket.__impls__["flash:wse"]=f
}());
(function(){window.ByteSocket=(function(){var am="ByteSocket";
var aq=m.getLogger(am);
var aw=new K();
var ar=function(aA,aB){aq.entering(this,"ByteSocket.<init>",{url:aA,subprotocol:aB});
$this=this;
this.readyState=0;
this.location=aA;
this.protocol=aB;
this._queue=[];
az(this,aA,aB)
};
var az=function(aC,aA,aD){var aB=new A(aA);
aC._channel=new O(aB,aD,true);
aC._channel._webSocket=aC;
aw.processConnect(aC._channel,aB.getWSEquivalent(),aD)
};
var at=ar.prototype;
at.send=function(aA){aq.entering(this,"ByteSocket.send",aA);
if(aA.constructor!=window.ByteBuffer){throw new Error("ByteSocket.send must be called with a ByteBuffer argument")
}switch(this.readyState){case 0:aq.severe(this,"ByteSocket.send: Error: readyState is 0");
throw new Error("INVALID_STATE_ERR");
case 1:if(aA===null){aq.severe(this,"ByteSocket.send: Error: data is null");
throw new Error("data is null")
}aw.processBinaryMessage(this._channel,aA);
ao(this);
return true;
case 2:return false;
default:aq.severe(this,"ByteSocket.send: Error: Invalid readyState "+readyState);
throw new Error("INVALID_STATE_ERR")
}};
at.handleOpen=function(aB){switch(this.readyState){case 0:av(this,aB);
break;
case 1:case 2:var aA=(aB?" from "+aB.target:"");
WSLOG.severe(this,"WebSocket.openHandler: Error: Invalid readyState for open event"+aA);
throw new Error("Invalid readyState for open event"+aA);
default:WSLOG.severe(this,"WebSocket.openHandler: Error: Invalid readyState "+_readyState);
throw new Error("Socket has invalid readyState: "+_readyState)
}};
var ao=function(aA){};
at.postMessage=at.send;
at.disconnect=at.close;
at.close=function(){aq.entering(this,"ByteSocket.close");
aw.processClose(this._channel)
};
function av(aC,aA){aq.entering(aC,"ByteSocket.doOpen");
if(aC.readyState<1){aC.readyState=1;
if(typeof(aC.onopen)!=="undefined"){if(!aA){try{aA=document.createEvent("Events");
aA.initEvent("open",true,true)
}catch(aD){aA={type:"open",bubbles:true,cancelable:true}
}}try{aC.onopen(aA)
}catch(aB){aq.severe(aC,"ByteSocket.doOpen: Error thrown from application")
}}}}function ap(aC,aB){aq.entering(aC,"ByteSocket.openHandler",aB);
switch(aC.readyState){case 0:av(aC,aB);
break;
case 1:case 2:var aA=(aB?" from "+aB.target:"");
aq.severe(aC,"ByteSocket.openHandler: Error: Invalid readyState for open event"+aA);
throw new Error("Invalid readyState for open event"+aA);
default:aq.severe(aC,"ByteSocket.openHandler: Error: Invalid readyState "+aC.readyState);
throw new Error("Socket has invalid readyState: "+aC.readyState)
}}function al(aD,aA){if(typeof(aD.onmessage)==="function"){aq.entering(this,"ByteSocket.messageHandler");
var aC;
try{aC=document.createEvent("Events");
aC.initEvent("message",true,true)
}catch(aE){aC={type:"message",bubbles:true,cancelable:true}
}aC.data=aA;
aC.source=aD;
try{aD.onmessage(aC)
}catch(aB){aq.severe(aD,"ByteSocket.doOpen: Error thrown from application message handler")
}}}function ay(aD){var aE=new Date().getTime();
var aB=aE+50;
while(aD._queue.length>0){if(new Date().getTime()>aB){setTimeout(function(){ay(aD)
},0);
return
}var aA=aD._queue.shift();
var aC=false;
try{al(aD,aA);
aC=true
}finally{if(!aC){if(aD._queue.length==0){aD._delivering=false
}else{setTimeout(function(){ay(aD)
},0)
}}}}aD._delivering=false
}function au(aB,aA){switch(aB.readyState){case 1:aB._queue.push(aA);
if(!aB._delivering){aB._delivering=true;
setTimeout(function(){ay(aB)
},0)
}break;
case 0:case 2:break;
default:throw new Error("Socket has invalid readyState: "+aB.readyState)
}}function ax(aB,aA){aq.entering(aB,"ByteSocket.doClose");
if(aB.readyState<2){aB.readyState=2;
if(typeof(aB.onclose)!=="undefined"){setTimeout(function(){if(!aA){try{aA=document.createEvent("Events");
aA.initEvent("close",true,true)
}catch(aD){aA={type:"close",bubbles:true,cancelable:true}
}}try{aB.onclose(aA)
}catch(aC){aq.severe(aB,"ByteSocket.doClose: Error thrown from application")
}},0)
}}}function an(aC,aB){aq.entering(aC,"ByteSocket.closeHandler",aB);
switch(aC.readyState){case 0:unbindHandlers(aC);
fallbackNext(aC);
break;
case 1:ax(aC,aB);
break;
case 2:var aA=(aB?" from "+aB.target:"");
aq.severe(aC,"ByteSocket.closeHandler: Error: Invalid readyState for close event"+aA);
throw new Error("Invalid readyState for close event"+aA);
break;
default:aq.severe(aC,"ByteSocket.closeHandler: Error: Invalid readyState "+aC.readyState);
throw new Error("Socket has invalid readyState: "+aC.readyState)
}}at.handleMessage=function(aA){switch(this.readyState){case 1:var aB=this;
this._queue.push(aA);
if(!this._delivering){this._delivering=true;
setTimeout(function(){ay(aB)
},0)
}break;
case 0:case 2:break;
default:throw new Error("Socket has invalid readyState: "+aB.readyState)
}};
at.handleClose=function(aA){ax(this,aA)
};
at.handleError=function(aA){ax(this,aA)
};
return ar
})()
}());
window.___Loader=new z(r)
})()
})();
var EventDispatcher=function(){};
(function(){var a=EventDispatcher.prototype;
a._initEventDispatcher=function(){this._eventListeners={}
};
a.addEventListener=function(c,d){var b=this._eventListeners[c];
if(b){b.push(d)
}else{this._eventListeners[c]=[d]
}};
a.removeEventListener=function(e,f){var d=this._eventListeners[e];
if(d){var b=[];
for(var c=0;
c<d.length;
c++){if(d[c]!==f){b.push(d[c])
}}this._eventListeners[e]=new Listeners
}};
a.hasEventListener=function(c){var b=this._eventListeners[c];
return Boolean(b)
};
a.dispatchEvent=function(d){var c=this._eventListeners[d.type];
if(c){for(var b=0;
b<c.length;
b++){c[b](d)
}}if(this["on"+d.type]){this["on"+d.type](d)
}}
})();
var AmqpClient=function(){this._options={};
this._readyState=0;
this._init()
};
(function(){var w=function(aA){this.context=aA;
this.states={}
};
(function(){var aA=w.prototype;
var aB=function aB(){};
aA.enterState=function(aG,aD,aE){if(this.currentState){this.currentState.exitBehavior(this.context,aD,aE,aG)
}var aF=this.states[aG];
this.currentState=aF;
try{aF.entryBehavior(this.context,aD,aE,aG)
}catch(aH){var aC=new Error("Could not call behavior for state "+aF.stateName+"\n\n"+aH.message);
aC.innerException=aH;
throw (aC)
}};
aA.addState=function(aL,aE,aJ,aD){var aC={};
aC.stateName=aL;
aC.entryBehavior=aJ||aB;
aC.exitBehavior=aD||aB;
this.states[aL]=(aC);
aC.rules={};
var aK=aE||[];
for(var aG=0;
aG<aK.length;
aG++){var aH=aK[aG];
for(var aF=0;
aF<aH.inputs.length;
aF++){var aI=aH.inputs[aF];
aC.rules[aI]=aH.targetState
}}};
aA.feedInput=function(aC,aD){var aF=this.currentState;
if(aF.rules[aC]){var aG=this;
var aE=function(){aG.enterState(aF.rules[aC],aC,aD)
};
aE();
return true
}else{return false
}}
})();
var e=function(){};
(function(){e.prototype=new EventDispatcher();
var aD=e.prototype;
var aA=function aA(){};
var aC=function aC(aF){throw aF
};
aD._stateMachine=null;
aD.onerror=function(aF){};
aD._actions=[];
aD._processActions=function aB(){if(!this._actions.length){return
}var aH=this._actions[0];
var aG=this._stateMachine.feedInput(aH.actionName+"Action",aH);
if(aG){var aF=this;
setTimeout(function(){try{aH.func.apply(aF,aH.args)
}catch(aI){aH.error(aI)
}},0);
this._actions.shift()
}};
aD._enqueueAction=function aE(aG,aK,aI,aF,aH){var aL={};
aL.actionName=aG||"";
aL.func=aK||aA;
aL.args=aI||null;
aL.continuation=aF||aA;
aL.error=aH||aC;
this._actions.push(aL);
var aJ=this;
var aK=function(){aJ._processActions()
};
setTimeout(aK,0)
};
aD._initAsyncClient=function(){this._initEventDispatcher();
this._stateMachine=new w(this);
this._actions=[];
this._buffer=null;
this._socket=null
};
aD._send=null;
aD._readHandler=null
})();
var N={};
N.FRAME_METHOD={value:1,message:""};
N.FRAME_HEADER={value:2,message:""};
N.FRAME_BODY={value:3,message:""};
N.FRAME_HEARTBEAT={value:8,message:""};
N.FRAME_MIN_SIZE={value:4096,message:""};
N.FRAME_END={value:206,message:""};
N.REPLY_SUCCESS={value:200,message:"Indicates that the method completed successfully. This reply code is reserved for future use - the current protocol design does not use positive confirmation and reply codes are sent only in case of an error."};
N.CONTENT_TOO_LARGE={value:311,message:"The client attempted to transfer content larger than the server could accept at the present time. The client may retry at a later time."};
N.NO_CONSUMERS={value:313,message:"When the exchange cannot deliver to a consumer when the immediate flag is set. As a result of pending data on the queue or the absence of any consumers of the queue."};
N.CONNECTION_FORCED={value:320,message:"An operator intervened to close the connection for some reason. The client may retry at some later date."};
N.INVALID_PATH={value:402,message:"The client tried to work with an unknown virtual host."};
N.ACCESS_REFUSED={value:403,message:"The client attempted to work with a server entity to which it has no access due to security settings."};
N.NOT_FOUND={value:404,message:"The client attempted to work with a server entity that does not exist."};
N.RESOURCE_LOCKED={value:405,message:"The client attempted to work with a server entity to which it has no access because another client is working with it."};
N.PRECONDITION_FAILED={value:406,message:"The client requested a method that was not allowed because some precondition failed."};
N.FRAME_ERROR={value:501,message:"The sender sent a malformed frame that the recipient could not decode. This strongly implies a programming error in the sending peer."};
N.SYNTAX_ERROR={value:502,message:"The sender sent a frame that contained illegal values for one or more fields. This strongly implies a programming error in the sending peer."};
N.COMMAND_INVALID={value:503,message:"The client sent an invalid sequence of frames, attempting to perform an operation that was considered invalid by the server. This usually implies a programming error in the client."};
N.CHANNEL_ERROR={value:504,message:"The client attempted to work with a channel that had not been correctly opened. This most likely indicates a fault in the client layer."};
N.UNEXPECTED_FRAME={value:505,message:"The peer sent a frame that was not expected, usually in the context of a content header and body.  This strongly indicates a fault in the peer's content processing."};
N.RESOURCE_ERROR={value:506,message:"The server could not complete the method because it lacked sufficient resources. This may be due to the client creating too many of some type of entity."};
N.NOT_ALLOWED={value:530,message:"The client tried to work with some entity in a manner that is prohibited by the server, due to security settings or by some other criteria."};
N.NOT_IMPLEMENTED={value:540,message:"The client tried to use functionality that is not implemented in the server."};
N.INTERNAL_ERROR={value:541,message:"The server could not complete the method because of an internal error. The server may require intervention by an operator in order to resume normal operations."};
var g={ClassId:{type:"short",asserts:[]},ConsumerTag:{type:"shortstr",asserts:[]},DeliveryTag:{type:"longlong",asserts:[]},ExchangeName:{type:"shortstr",asserts:[]},MethodId:{type:"short",asserts:[]},NoAck:{type:"bit",asserts:[]},NoLocal:{type:"bit",asserts:[]},NoWait:{type:"bit",asserts:[]},Path:{type:"shortstr",asserts:[]},PeerProperties:{type:"table",asserts:[]},QueueName:{type:"shortstr",asserts:[]},Redelivered:{type:"bit",asserts:[]},MessageCount:{type:"long",asserts:[]},ReplyCode:{type:"short",asserts:[]},ReplyText:{type:"shortstr",asserts:[]},Bit:{type:"bit",asserts:[]},Octet:{type:"octet",asserts:[]},Short:{type:"short",asserts:[]},Long:{type:"long",asserts:[]},Longlong:{type:"longlong",asserts:[]},Shortstr:{type:"shortstr",asserts:[]},Longstr:{type:"longstr",asserts:[]},Timestamp:{type:"timestamp",asserts:[]},Table:{type:"table",asserts:[]}};
var V={};
V.Connection={};
V.Connection.startConnection={};
V.Connection.startConnection.allParameters=[{name:"versionMajor",type:"Octet"},{name:"versionMinor",type:"Octet"},{name:"serverProperties",type:"PeerProperties"},{name:"mechanisms",type:"Longstr"},{name:"locales",type:"Longstr"}];
V.Connection.startConnection.returnType="StartOkConnection";
V.Connection.startConnection.index=10;
V.Connection.startConnection.classIndex=10;
V.Connection.startConnection.synchronous=true;
V.Connection.startConnection.hasContent=false;
V.Connection.startOkConnection={};
V.Connection.startOkConnection.allParameters=[{name:"clientProperties",type:"PeerProperties"},{name:"mechanism",type:"Shortstr"},{name:"response",type:"Longstr"},{name:"locale",type:"Shortstr"}];
V.Connection.startOkConnection.returnType="voidConnection";
V.Connection.startOkConnection.index=11;
V.Connection.startOkConnection.classIndex=10;
V.Connection.startOkConnection.synchronous=true;
V.Connection.startOkConnection.hasContent=false;
V.Connection.secureConnection={};
V.Connection.secureConnection.allParameters=[{name:"challenge",type:"Longstr"}];
V.Connection.secureConnection.returnType="SecureOkConnection";
V.Connection.secureConnection.index=20;
V.Connection.secureConnection.classIndex=10;
V.Connection.secureConnection.synchronous=true;
V.Connection.secureConnection.hasContent=false;
V.Connection.secureOkConnection={};
V.Connection.secureOkConnection.allParameters=[{name:"response",type:"Longstr"}];
V.Connection.secureOkConnection.returnType="voidConnection";
V.Connection.secureOkConnection.index=21;
V.Connection.secureOkConnection.classIndex=10;
V.Connection.secureOkConnection.synchronous=true;
V.Connection.secureOkConnection.hasContent=false;
V.Connection.tuneConnection={};
V.Connection.tuneConnection.allParameters=[{name:"channelMax",type:"Short"},{name:"frameMax",type:"Long"},{name:"heartbeat",type:"Short"}];
V.Connection.tuneConnection.returnType="TuneOkConnection";
V.Connection.tuneConnection.index=30;
V.Connection.tuneConnection.classIndex=10;
V.Connection.tuneConnection.synchronous=true;
V.Connection.tuneConnection.hasContent=false;
V.Connection.tuneOkConnection={};
V.Connection.tuneOkConnection.allParameters=[{name:"channelMax",type:"Short"},{name:"frameMax",type:"Long"},{name:"heartbeat",type:"Short"}];
V.Connection.tuneOkConnection.returnType="voidConnection";
V.Connection.tuneOkConnection.index=31;
V.Connection.tuneOkConnection.classIndex=10;
V.Connection.tuneOkConnection.synchronous=true;
V.Connection.tuneOkConnection.hasContent=false;
V.Connection.openConnection={};
V.Connection.openConnection.allParameters=[{name:"virtualHost",type:"Path"},{name:"reserved1",type:"Shortstr"},{name:"reserved2",type:"Bit"}];
V.Connection.openConnection.returnType="OpenOkConnection";
V.Connection.openConnection.index=40;
V.Connection.openConnection.classIndex=10;
V.Connection.openConnection.synchronous=true;
V.Connection.openConnection.hasContent=false;
V.Connection.openOkConnection={};
V.Connection.openOkConnection.allParameters=[{name:"reserved1",type:"Shortstr"}];
V.Connection.openOkConnection.returnType="voidConnection";
V.Connection.openOkConnection.index=41;
V.Connection.openOkConnection.classIndex=10;
V.Connection.openOkConnection.synchronous=true;
V.Connection.openOkConnection.hasContent=false;
V.Connection.closeConnection={};
V.Connection.closeConnection.allParameters=[{name:"replyCode",type:"ReplyCode"},{name:"replyText",type:"ReplyText"},{name:"classId",type:"ClassId"},{name:"methodId",type:"MethodId"}];
V.Connection.closeConnection.returnType="CloseOkConnection";
V.Connection.closeConnection.index=50;
V.Connection.closeConnection.classIndex=10;
V.Connection.closeConnection.synchronous=true;
V.Connection.closeConnection.hasContent=false;
V.Connection.closeOkConnection={};
V.Connection.closeOkConnection.allParameters=[];
V.Connection.closeOkConnection.returnType="voidConnection";
V.Connection.closeOkConnection.index=51;
V.Connection.closeOkConnection.classIndex=10;
V.Connection.closeOkConnection.synchronous=true;
V.Connection.closeOkConnection.hasContent=false;
V.Connection.methodLookup={10:"startConnection",11:"startOkConnection",20:"secureConnection",21:"secureOkConnection",30:"tuneConnection",31:"tuneOkConnection",40:"openConnection",41:"openOkConnection",50:"closeConnection",51:"closeOkConnection"};
V.Connection.className="Connection";
V.Channel={};
V.Channel.openChannel={};
V.Channel.openChannel.allParameters=[{name:"reserved1",type:"Shortstr"}];
V.Channel.openChannel.returnType="OpenOkChannel";
V.Channel.openChannel.index=10;
V.Channel.openChannel.classIndex=20;
V.Channel.openChannel.synchronous=true;
V.Channel.openChannel.hasContent=false;
V.Channel.openOkChannel={};
V.Channel.openOkChannel.allParameters=[{name:"reserved1",type:"Longstr"}];
V.Channel.openOkChannel.returnType="voidChannel";
V.Channel.openOkChannel.index=11;
V.Channel.openOkChannel.classIndex=20;
V.Channel.openOkChannel.synchronous=true;
V.Channel.openOkChannel.hasContent=false;
V.Channel.flowChannel={};
V.Channel.flowChannel.allParameters=[{name:"active",type:"Bit"}];
V.Channel.flowChannel.returnType="FlowOkChannel";
V.Channel.flowChannel.index=20;
V.Channel.flowChannel.classIndex=20;
V.Channel.flowChannel.synchronous=true;
V.Channel.flowChannel.hasContent=false;
V.Channel.flowOkChannel={};
V.Channel.flowOkChannel.allParameters=[{name:"active",type:"Bit"}];
V.Channel.flowOkChannel.returnType="voidChannel";
V.Channel.flowOkChannel.index=21;
V.Channel.flowOkChannel.classIndex=20;
V.Channel.flowOkChannel.synchronous=false;
V.Channel.flowOkChannel.hasContent=false;
V.Channel.closeChannel={};
V.Channel.closeChannel.allParameters=[{name:"replyCode",type:"ReplyCode"},{name:"replyText",type:"ReplyText"},{name:"classId",type:"ClassId"},{name:"methodId",type:"MethodId"}];
V.Channel.closeChannel.returnType="CloseOkChannel";
V.Channel.closeChannel.index=40;
V.Channel.closeChannel.classIndex=20;
V.Channel.closeChannel.synchronous=true;
V.Channel.closeChannel.hasContent=false;
V.Channel.closeOkChannel={};
V.Channel.closeOkChannel.allParameters=[];
V.Channel.closeOkChannel.returnType="voidChannel";
V.Channel.closeOkChannel.index=41;
V.Channel.closeOkChannel.classIndex=20;
V.Channel.closeOkChannel.synchronous=true;
V.Channel.closeOkChannel.hasContent=false;
V.Channel.methodLookup={10:"openChannel",11:"openOkChannel",20:"flowChannel",21:"flowOkChannel",40:"closeChannel",41:"closeOkChannel"};
V.Channel.className="Channel";
V.Exchange={};
V.Exchange.declareExchange={};
V.Exchange.declareExchange.allParameters=[{name:"reserved1",type:"Short"},{name:"exchange",type:"ExchangeName"},{name:"type",type:"Shortstr"},{name:"passive",type:"Bit"},{name:"durable",type:"Bit"},{name:"reserved2",type:"Bit"},{name:"reserved3",type:"Bit"},{name:"noWait",type:"NoWait"},{name:"arguments",type:"Table"}];
V.Exchange.declareExchange.returnType="DeclareOkExchange";
V.Exchange.declareExchange.index=10;
V.Exchange.declareExchange.classIndex=40;
V.Exchange.declareExchange.synchronous=true;
V.Exchange.declareExchange.hasContent=false;
V.Exchange.declareOkExchange={};
V.Exchange.declareOkExchange.allParameters=[];
V.Exchange.declareOkExchange.returnType="voidExchange";
V.Exchange.declareOkExchange.index=11;
V.Exchange.declareOkExchange.classIndex=40;
V.Exchange.declareOkExchange.synchronous=true;
V.Exchange.declareOkExchange.hasContent=false;
V.Exchange.deleteExchange={};
V.Exchange.deleteExchange.allParameters=[{name:"reserved1",type:"Short"},{name:"exchange",type:"ExchangeName"},{name:"ifUnused",type:"Bit"},{name:"noWait",type:"NoWait"}];
V.Exchange.deleteExchange.returnType="DeleteOkExchange";
V.Exchange.deleteExchange.index=20;
V.Exchange.deleteExchange.classIndex=40;
V.Exchange.deleteExchange.synchronous=true;
V.Exchange.deleteExchange.hasContent=false;
V.Exchange.deleteOkExchange={};
V.Exchange.deleteOkExchange.allParameters=[];
V.Exchange.deleteOkExchange.returnType="voidExchange";
V.Exchange.deleteOkExchange.index=21;
V.Exchange.deleteOkExchange.classIndex=40;
V.Exchange.deleteOkExchange.synchronous=true;
V.Exchange.deleteOkExchange.hasContent=false;
V.Exchange.methodLookup={10:"declareExchange",11:"declareOkExchange",20:"deleteExchange",21:"deleteOkExchange"};
V.Exchange.className="Exchange";
V.Queue={};
V.Queue.declareQueue={};
V.Queue.declareQueue.allParameters=[{name:"reserved1",type:"Short"},{name:"queue",type:"QueueName"},{name:"passive",type:"Bit"},{name:"durable",type:"Bit"},{name:"exclusive",type:"Bit"},{name:"autoDelete",type:"Bit"},{name:"noWait",type:"NoWait"},{name:"arguments",type:"Table"}];
V.Queue.declareQueue.returnType="DeclareOkQueue";
V.Queue.declareQueue.index=10;
V.Queue.declareQueue.classIndex=50;
V.Queue.declareQueue.synchronous=true;
V.Queue.declareQueue.hasContent=false;
V.Queue.declareOkQueue={};
V.Queue.declareOkQueue.allParameters=[{name:"queue",type:"QueueName"},{name:"messageCount",type:"MessageCount"},{name:"consumerCount",type:"Long"}];
V.Queue.declareOkQueue.returnType="voidQueue";
V.Queue.declareOkQueue.index=11;
V.Queue.declareOkQueue.classIndex=50;
V.Queue.declareOkQueue.synchronous=true;
V.Queue.declareOkQueue.hasContent=false;
V.Queue.bindQueue={};
V.Queue.bindQueue.allParameters=[{name:"reserved1",type:"Short"},{name:"queue",type:"QueueName"},{name:"exchange",type:"ExchangeName"},{name:"routingKey",type:"Shortstr"},{name:"noWait",type:"NoWait"},{name:"arguments",type:"Table"}];
V.Queue.bindQueue.returnType="BindOkQueue";
V.Queue.bindQueue.index=20;
V.Queue.bindQueue.classIndex=50;
V.Queue.bindQueue.synchronous=true;
V.Queue.bindQueue.hasContent=false;
V.Queue.bindOkQueue={};
V.Queue.bindOkQueue.allParameters=[];
V.Queue.bindOkQueue.returnType="voidQueue";
V.Queue.bindOkQueue.index=21;
V.Queue.bindOkQueue.classIndex=50;
V.Queue.bindOkQueue.synchronous=true;
V.Queue.bindOkQueue.hasContent=false;
V.Queue.unbindQueue={};
V.Queue.unbindQueue.allParameters=[{name:"reserved1",type:"Short"},{name:"queue",type:"QueueName"},{name:"exchange",type:"ExchangeName"},{name:"routingKey",type:"Shortstr"},{name:"arguments",type:"Table"}];
V.Queue.unbindQueue.returnType="UnbindOkQueue";
V.Queue.unbindQueue.index=50;
V.Queue.unbindQueue.classIndex=50;
V.Queue.unbindQueue.synchronous=true;
V.Queue.unbindQueue.hasContent=false;
V.Queue.unbindOkQueue={};
V.Queue.unbindOkQueue.allParameters=[];
V.Queue.unbindOkQueue.returnType="voidQueue";
V.Queue.unbindOkQueue.index=51;
V.Queue.unbindOkQueue.classIndex=50;
V.Queue.unbindOkQueue.synchronous=true;
V.Queue.unbindOkQueue.hasContent=false;
V.Queue.purgeQueue={};
V.Queue.purgeQueue.allParameters=[{name:"reserved1",type:"Short"},{name:"queue",type:"QueueName"},{name:"noWait",type:"NoWait"}];
V.Queue.purgeQueue.returnType="PurgeOkQueue";
V.Queue.purgeQueue.index=30;
V.Queue.purgeQueue.classIndex=50;
V.Queue.purgeQueue.synchronous=true;
V.Queue.purgeQueue.hasContent=false;
V.Queue.purgeOkQueue={};
V.Queue.purgeOkQueue.allParameters=[{name:"messageCount",type:"MessageCount"}];
V.Queue.purgeOkQueue.returnType="voidQueue";
V.Queue.purgeOkQueue.index=31;
V.Queue.purgeOkQueue.classIndex=50;
V.Queue.purgeOkQueue.synchronous=true;
V.Queue.purgeOkQueue.hasContent=false;
V.Queue.deleteQueue={};
V.Queue.deleteQueue.allParameters=[{name:"reserved1",type:"Short"},{name:"queue",type:"QueueName"},{name:"ifUnused",type:"Bit"},{name:"ifEmpty",type:"Bit"},{name:"noWait",type:"NoWait"}];
V.Queue.deleteQueue.returnType="DeleteOkQueue";
V.Queue.deleteQueue.index=40;
V.Queue.deleteQueue.classIndex=50;
V.Queue.deleteQueue.synchronous=true;
V.Queue.deleteQueue.hasContent=false;
V.Queue.deleteOkQueue={};
V.Queue.deleteOkQueue.allParameters=[{name:"messageCount",type:"MessageCount"}];
V.Queue.deleteOkQueue.returnType="voidQueue";
V.Queue.deleteOkQueue.index=41;
V.Queue.deleteOkQueue.classIndex=50;
V.Queue.deleteOkQueue.synchronous=true;
V.Queue.deleteOkQueue.hasContent=false;
V.Queue.methodLookup={10:"declareQueue",11:"declareOkQueue",20:"bindQueue",21:"bindOkQueue",50:"unbindQueue",51:"unbindOkQueue",30:"purgeQueue",31:"purgeOkQueue",40:"deleteQueue",41:"deleteOkQueue"};
V.Queue.className="Queue";
V.Basic={};
V.Basic.qosBasic={};
V.Basic.qosBasic.allParameters=[{name:"prefetchSize",type:"Long"},{name:"prefetchCount",type:"Short"},{name:"global",type:"Bit"}];
V.Basic.qosBasic.returnType="QosOkBasic";
V.Basic.qosBasic.index=10;
V.Basic.qosBasic.classIndex=60;
V.Basic.qosBasic.synchronous=true;
V.Basic.qosBasic.hasContent=false;
V.Basic.qosOkBasic={};
V.Basic.qosOkBasic.allParameters=[];
V.Basic.qosOkBasic.returnType="voidBasic";
V.Basic.qosOkBasic.index=11;
V.Basic.qosOkBasic.classIndex=60;
V.Basic.qosOkBasic.synchronous=true;
V.Basic.qosOkBasic.hasContent=false;
V.Basic.consumeBasic={};
V.Basic.consumeBasic.allParameters=[{name:"reserved1",type:"Short"},{name:"queue",type:"QueueName"},{name:"consumerTag",type:"ConsumerTag"},{name:"noLocal",type:"NoLocal"},{name:"noAck",type:"NoAck"},{name:"exclusive",type:"Bit"},{name:"noWait",type:"NoWait"},{name:"arguments",type:"Table"}];
V.Basic.consumeBasic.returnType="ConsumeOkBasic";
V.Basic.consumeBasic.index=20;
V.Basic.consumeBasic.classIndex=60;
V.Basic.consumeBasic.synchronous=true;
V.Basic.consumeBasic.hasContent=false;
V.Basic.consumeOkBasic={};
V.Basic.consumeOkBasic.allParameters=[{name:"consumerTag",type:"ConsumerTag"}];
V.Basic.consumeOkBasic.returnType="voidBasic";
V.Basic.consumeOkBasic.index=21;
V.Basic.consumeOkBasic.classIndex=60;
V.Basic.consumeOkBasic.synchronous=true;
V.Basic.consumeOkBasic.hasContent=false;
V.Basic.cancelBasic={};
V.Basic.cancelBasic.allParameters=[{name:"consumerTag",type:"ConsumerTag"},{name:"noWait",type:"NoWait"}];
V.Basic.cancelBasic.returnType="CancelOkBasic";
V.Basic.cancelBasic.index=30;
V.Basic.cancelBasic.classIndex=60;
V.Basic.cancelBasic.synchronous=true;
V.Basic.cancelBasic.hasContent=false;
V.Basic.cancelOkBasic={};
V.Basic.cancelOkBasic.allParameters=[{name:"consumerTag",type:"ConsumerTag"}];
V.Basic.cancelOkBasic.returnType="voidBasic";
V.Basic.cancelOkBasic.index=31;
V.Basic.cancelOkBasic.classIndex=60;
V.Basic.cancelOkBasic.synchronous=true;
V.Basic.cancelOkBasic.hasContent=false;
V.Basic.publishBasic={};
V.Basic.publishBasic.allParameters=[{name:"reserved1",type:"Short"},{name:"exchange",type:"ExchangeName"},{name:"routingKey",type:"Shortstr"},{name:"mandatory",type:"Bit"},{name:"immediate",type:"Bit"}];
V.Basic.publishBasic.returnType="voidBasic";
V.Basic.publishBasic.index=40;
V.Basic.publishBasic.classIndex=60;
V.Basic.publishBasic.synchronous=false;
V.Basic.publishBasic.hasContent=true;
V.Basic.returnBasic={};
V.Basic.returnBasic.allParameters=[{name:"replyCode",type:"ReplyCode"},{name:"replyText",type:"ReplyText"},{name:"exchange",type:"ExchangeName"},{name:"routingKey",type:"Shortstr"}];
V.Basic.returnBasic.returnType="voidBasic";
V.Basic.returnBasic.index=50;
V.Basic.returnBasic.classIndex=60;
V.Basic.returnBasic.synchronous=false;
V.Basic.returnBasic.hasContent=true;
V.Basic.deliverBasic={};
V.Basic.deliverBasic.allParameters=[{name:"consumerTag",type:"ConsumerTag"},{name:"deliveryTag",type:"DeliveryTag"},{name:"redelivered",type:"Redelivered"},{name:"exchange",type:"ExchangeName"},{name:"routingKey",type:"Shortstr"}];
V.Basic.deliverBasic.returnType="voidBasic";
V.Basic.deliverBasic.index=60;
V.Basic.deliverBasic.classIndex=60;
V.Basic.deliverBasic.synchronous=false;
V.Basic.deliverBasic.hasContent=true;
V.Basic.getBasic={};
V.Basic.getBasic.allParameters=[{name:"reserved1",type:"Short"},{name:"queue",type:"QueueName"},{name:"noAck",type:"NoAck"}];
V.Basic.getBasic.returnType="GetOkBasic";
V.Basic.getBasic.index=70;
V.Basic.getBasic.classIndex=60;
V.Basic.getBasic.synchronous=true;
V.Basic.getBasic.hasContent=false;
V.Basic.getOkBasic={};
V.Basic.getOkBasic.allParameters=[{name:"deliveryTag",type:"DeliveryTag"},{name:"redelivered",type:"Redelivered"},{name:"exchange",type:"ExchangeName"},{name:"routingKey",type:"Shortstr"},{name:"messageCount",type:"MessageCount"}];
V.Basic.getOkBasic.returnType="voidBasic";
V.Basic.getOkBasic.index=71;
V.Basic.getOkBasic.classIndex=60;
V.Basic.getOkBasic.synchronous=true;
V.Basic.getOkBasic.hasContent=true;
V.Basic.getEmptyBasic={};
V.Basic.getEmptyBasic.allParameters=[{name:"reserved1",type:"Shortstr"}];
V.Basic.getEmptyBasic.returnType="voidBasic";
V.Basic.getEmptyBasic.index=72;
V.Basic.getEmptyBasic.classIndex=60;
V.Basic.getEmptyBasic.synchronous=true;
V.Basic.getEmptyBasic.hasContent=false;
V.Basic.ackBasic={};
V.Basic.ackBasic.allParameters=[{name:"deliveryTag",type:"DeliveryTag"},{name:"multiple",type:"Bit"}];
V.Basic.ackBasic.returnType="voidBasic";
V.Basic.ackBasic.index=80;
V.Basic.ackBasic.classIndex=60;
V.Basic.ackBasic.synchronous=false;
V.Basic.ackBasic.hasContent=false;
V.Basic.rejectBasic={};
V.Basic.rejectBasic.allParameters=[{name:"deliveryTag",type:"DeliveryTag"},{name:"requeue",type:"Bit"}];
V.Basic.rejectBasic.returnType="voidBasic";
V.Basic.rejectBasic.index=90;
V.Basic.rejectBasic.classIndex=60;
V.Basic.rejectBasic.synchronous=false;
V.Basic.rejectBasic.hasContent=false;
V.Basic.recoverAsyncBasic={};
V.Basic.recoverAsyncBasic.allParameters=[{name:"requeue",type:"Bit"}];
V.Basic.recoverAsyncBasic.returnType="voidBasic";
V.Basic.recoverAsyncBasic.index=100;
V.Basic.recoverAsyncBasic.classIndex=60;
V.Basic.recoverAsyncBasic.synchronous=false;
V.Basic.recoverAsyncBasic.hasContent=false;
V.Basic.recoverBasic={};
V.Basic.recoverBasic.allParameters=[{name:"requeue",type:"Bit"}];
V.Basic.recoverBasic.returnType="voidBasic";
V.Basic.recoverBasic.index=110;
V.Basic.recoverBasic.classIndex=60;
V.Basic.recoverBasic.synchronous=false;
V.Basic.recoverBasic.hasContent=false;
V.Basic.recoverOkBasic={};
V.Basic.recoverOkBasic.allParameters=[];
V.Basic.recoverOkBasic.returnType="voidBasic";
V.Basic.recoverOkBasic.index=111;
V.Basic.recoverOkBasic.classIndex=60;
V.Basic.recoverOkBasic.synchronous=true;
V.Basic.recoverOkBasic.hasContent=false;
V.Basic.methodLookup={10:"qosBasic",11:"qosOkBasic",20:"consumeBasic",21:"consumeOkBasic",30:"cancelBasic",31:"cancelOkBasic",40:"publishBasic",50:"returnBasic",60:"deliverBasic",70:"getBasic",71:"getOkBasic",72:"getEmptyBasic",80:"ackBasic",90:"rejectBasic",100:"recoverAsyncBasic",110:"recoverBasic",111:"recoverOkBasic"};
V.Basic.className="Basic";
V.Tx={};
V.Tx.selectTx={};
V.Tx.selectTx.allParameters=[];
V.Tx.selectTx.returnType="SelectOkTx";
V.Tx.selectTx.index=10;
V.Tx.selectTx.classIndex=90;
V.Tx.selectTx.synchronous=true;
V.Tx.selectTx.hasContent=false;
V.Tx.selectOkTx={};
V.Tx.selectOkTx.allParameters=[];
V.Tx.selectOkTx.returnType="voidTx";
V.Tx.selectOkTx.index=11;
V.Tx.selectOkTx.classIndex=90;
V.Tx.selectOkTx.synchronous=true;
V.Tx.selectOkTx.hasContent=false;
V.Tx.commitTx={};
V.Tx.commitTx.allParameters=[];
V.Tx.commitTx.returnType="CommitOkTx";
V.Tx.commitTx.index=20;
V.Tx.commitTx.classIndex=90;
V.Tx.commitTx.synchronous=true;
V.Tx.commitTx.hasContent=false;
V.Tx.commitOkTx={};
V.Tx.commitOkTx.allParameters=[];
V.Tx.commitOkTx.returnType="voidTx";
V.Tx.commitOkTx.index=21;
V.Tx.commitOkTx.classIndex=90;
V.Tx.commitOkTx.synchronous=true;
V.Tx.commitOkTx.hasContent=false;
V.Tx.rollbackTx={};
V.Tx.rollbackTx.allParameters=[];
V.Tx.rollbackTx.returnType="RollbackOkTx";
V.Tx.rollbackTx.index=30;
V.Tx.rollbackTx.classIndex=90;
V.Tx.rollbackTx.synchronous=true;
V.Tx.rollbackTx.hasContent=false;
V.Tx.rollbackOkTx={};
V.Tx.rollbackOkTx.allParameters=[];
V.Tx.rollbackOkTx.returnType="voidTx";
V.Tx.rollbackOkTx.index=31;
V.Tx.rollbackOkTx.classIndex=90;
V.Tx.rollbackOkTx.synchronous=true;
V.Tx.rollbackOkTx.hasContent=false;
V.Tx.methodLookup={10:"selectTx",11:"selectOkTx",20:"commitTx",21:"commitOkTx",30:"rollbackTx",31:"rollbackOkTx"};
V.Tx.className="Tx";
var J={10:V.Connection,20:V.Channel,40:V.Exchange,50:V.Queue,60:V.Basic,90:V.Tx};
var Y={startConnection:V.Connection.startConnection,startOkConnection:V.Connection.startOkConnection,secureConnection:V.Connection.secureConnection,secureOkConnection:V.Connection.secureOkConnection,tuneConnection:V.Connection.tuneConnection,tuneOkConnection:V.Connection.tuneOkConnection,openConnection:V.Connection.openConnection,openOkConnection:V.Connection.openOkConnection,closeConnection:V.Connection.closeConnection,closeOkConnection:V.Connection.closeOkConnection,openChannel:V.Channel.openChannel,openOkChannel:V.Channel.openOkChannel,flowChannel:V.Channel.flowChannel,flowOkChannel:V.Channel.flowOkChannel,closeChannel:V.Channel.closeChannel,closeOkChannel:V.Channel.closeOkChannel,declareExchange:V.Exchange.declareExchange,declareOkExchange:V.Exchange.declareOkExchange,deleteExchange:V.Exchange.deleteExchange,deleteOkExchange:V.Exchange.deleteOkExchange,declareQueue:V.Queue.declareQueue,declareOkQueue:V.Queue.declareOkQueue,bindQueue:V.Queue.bindQueue,bindOkQueue:V.Queue.bindOkQueue,unbindQueue:V.Queue.unbindQueue,unbindOkQueue:V.Queue.unbindOkQueue,purgeQueue:V.Queue.purgeQueue,purgeOkQueue:V.Queue.purgeOkQueue,deleteQueue:V.Queue.deleteQueue,deleteOkQueue:V.Queue.deleteOkQueue,qosBasic:V.Basic.qosBasic,qosOkBasic:V.Basic.qosOkBasic,consumeBasic:V.Basic.consumeBasic,consumeOkBasic:V.Basic.consumeOkBasic,cancelBasic:V.Basic.cancelBasic,cancelOkBasic:V.Basic.cancelOkBasic,publishBasic:V.Basic.publishBasic,returnBasic:V.Basic.returnBasic,deliverBasic:V.Basic.deliverBasic,getBasic:V.Basic.getBasic,getOkBasic:V.Basic.getOkBasic,getEmptyBasic:V.Basic.getEmptyBasic,ackBasic:V.Basic.ackBasic,rejectBasic:V.Basic.rejectBasic,recoverAsyncBasic:V.Basic.recoverAsyncBasic,recoverBasic:V.Basic.recoverBasic,recoverOkBasic:V.Basic.recoverOkBasic,selectTx:V.Tx.selectTx,selectOkTx:V.Tx.selectOkTx,commitTx:V.Tx.commitTx,commitOkTx:V.Tx.commitOkTx,rollbackTx:V.Tx.rollbackTx,rollbackOkTx:V.Tx.rollbackOkTx};
var aq=function(aA){this.array=aA||[];
this._mark=-1;
this.limit=this.capacity=this.array.length;
this.order=ByteOrder.BIG_ENDIAN;
this.bitCount=0
};
aq.prototype=new ByteBuffer();
var x=function(aB,aA){if(!aB){throw (new Error(aA))
}};
var q={octet:"Unsigned","short":"UnsignedShort","long":"UnsignedInt",longlong:"UnsignedLong","int":"Int",table:"Table",longstr:"LongString",shortstr:"ShortString",bit:"Bit",fieldtable:"FieldTable",timestamp:"Timestamp"};
var P={F:"fieldtable",S:"longstr",I:"int"};
var ad={longstr:"S","int":"I"};
var G=function(aF,aC){var aB=new aq();
aB.putShortString("LOGIN");
aB.putTypeIdentifier("longstr");
aB.putLongString(aF);
aB.putShortString("PASSWORD");
aB.putTypeIdentifier("longstr");
aB.putLongString(aC);
aB.rewind();
var aA=aB.remaining();
var aE=[];
for(var aD=0;
aD<aA;
aD++){aE.push(String.fromCharCode(aB.getUnsigned()))
}return aE.join("")
};
var E=function(aB,aA){throw (new Error("not implemented"))
};
aq.prototype.getLongString=function(){var aA=this.getUnsignedInt();
var aC=[];
for(var aB=0;
aB<aA;
aB++){aC.push(String.fromCharCode(this.getUnsigned()))
}return aC.join("")
};
aq.prototype.getShortString=function(){var aA=this.getUnsigned();
var aC=[];
for(var aB=0;
aB<aA;
aB++){aC.push(String.fromCharCode(this.getUnsigned()))
}return aC.join("")
};
aq.prototype.getTypeIdentifier=function(){var aA=this.getUnsigned();
return P[String.fromCharCode(aA)]
};
aq.prototype.putTypeIdentifier=function(aB){var aA=ad[aB];
this.putUnsigned(aA.charCodeAt(0))
};
aq.prototype.getFieldValue=function(){var aA=this.getUnsigned();
switch(String.fromCharCode(aA)){case"t":return !!this.getUnsigned();
default:throw new Error("Decoding Error in AmqpBuffer: cannot decode field value")
}};
aq.prototype.getFieldTable=function(){var aA=this.getUnsignedInt();
var aE={};
var aB=this.position;
while(aA>(this.position-aB)){var aC=this.getShortString();
var aD=this.getFieldValue();
aE[aC]=aD
}return aE
};
aq.prototype.getTable=function(){var aD=new AmqpArguments();
var aA=this.getUnsignedInt();
var aB=new aq(this.array.slice(this.position,this.position+aA));
this.position+=aA;
while(aB.remaining()){var aE={};
aE.key=aB.getShortString();
var aC=aB.getTypeIdentifier();
aE.value=aB["get"+q[aC]]();
aE.type=q[aC];
aD.push(aE)
}return aD
};
aq.prototype.getBit=function(aA){return this.getUnsigned()
};
aq.prototype.putBit=function(aB){if(this.bitCount>0){var aA=this.array[this.position-1];
aA=aB<<this.bitCount|aA;
this.array[this.position-1]=aA
}else{this.putUnsigned(aB)
}};
aq.prototype.putUnsignedLong=function(aA){this.putInt(0);
return this.putUnsignedInt(aA)
};
aq.prototype.getUnsignedLong=function(aA){this.getInt();
return this.getUnsignedInt()
};
aq.prototype.putTimestamp=function(aC){var aE=aC.getTime();
var aB=[0,0,0,0,0,0,0,0];
for(var aD=7;
aD>=0;
aD--){var aA=aC&255;
aB[aD]=aA;
aC=(aC-aA)/256
}this.putBytes(aB);
return this
};
aq.prototype.getTimestamp=function(aB){var aA=this.getBytes(8);
var aD=0;
for(var aC=0;
aC<8;
aC++){aD=aD*256+(aA[aC]&255)
}return new Date(aD)
};
aq.prototype.putLongString=function(aB){this.putUnsignedInt(aB.length);
for(var aA=0;
aA<aB.length;
aA++){this.putUnsigned(aB.charCodeAt(aA))
}};
aq.prototype.putShortString=function(aB){this.putUnsigned(aB.length);
for(var aA=0;
aA<aB.length;
aA++){this.putUnsigned(aB.charCodeAt(aA))
}};
aq.prototype.putTable=function(aD){if(!aD){this.putUnsignedInt(0);
return this
}var aA=new aq();
for(var aB=0;
aB<aD.length;
aB++){var aC=aD[aB];
aA.putShortString(aC.key);
aA.putTypeIdentifier(aC.type);
aA["put"+q[aC.type]](aC.value)
}aA.rewind();
this.putUnsignedInt(aA.remaining());
this.putBuffer(aA);
return this
};
aq.prototype.getFrameHeader=function(){var aA=this.getUnsigned();
var aC=this.getUnsignedShort();
var aB=this.getUnsignedInt();
var aD={};
aD.type=aA;
aD.size=aB;
aD.channel=aC;
return aD
};
aq.prototype.getFrame=function(){var aI=this.position;
var aC={};
if(this.remaining()>7){aC.header=this.getFrameHeader();
aC.channel=aC.header.channel;
aC.type=aC.header.type;
if(this.remaining()>=aC.header.size+1){switch(aC.type){case N.FRAME_BODY.value:var aG=new aq(this.array.slice(this.position,this.position+aC.header.size));
this.position+=aC.header.size;
aC.body=aG;
aC.methodName="body";
break;
case N.FRAME_HEADER.value:var aK=this.getUnsignedShort();
var aF=this.getUnsignedShort();
var aB=this.getUnsignedLong();
aC.contentProperties=this.getContentProperties();
aC.methodName="header";
break;
case N.FRAME_METHOD.value:var aK=this.getUnsignedShort();
var aH=this.getUnsignedShort();
var aE=J[aK].className;
var aJ=J[aK].methodLookup[aH];
var aA=J[aK][aJ];
var aD=J[aK][aJ].allParameters;
aC.methodName=aJ;
aC.args=this.getMethodArguments(aD);
break;
default:throw (new Error("getFrame: This AMQP frame type is unknown or has not been implemented"))
}x((this.getUnsigned()===N.FRAME_END.value),"AMQP: Frame terminator missing")
}else{this.position=aI;
return null
}return aC
}return null
};
aq.prototype.putFrame=function(aB,aC,aD){this.putUnsigned(aB);
this.putUnsignedShort(aC);
var aA=aD.remaining();
this.putUnsignedInt(aA);
this.putBuffer(aD);
this.putUnsigned(N.FRAME_END.value);
return this
};
aq.prototype.putMethodFrame=function(aD,aB,aA){var aC=new aq();
aC.putUnsignedShort(aD.classIndex);
aC.putUnsignedShort(aD.index);
aC.putMethodArguments(aA,aD.allParameters);
aC.flip();
return this.putFrame(N.FRAME_METHOD.value,aB,aC)
};
aq.prototype.putHeaderFrame=function(aD,aC,aE,aA,aB){var aF=new aq();
aF.putUnsignedShort(aC);
aF.putUnsignedShort(aE);
aF.putUnsignedLong(aA);
aF.putContentProperties(aB);
aF.flip();
return this.putFrame(N.FRAME_HEADER.value,aD,aF)
};
aq.prototype.putBodyFrame=function(aA,aB){return this.putFrame(N.FRAME_BODY.value,aA,aB)
};
aq.prototype.putHeartbeat=function(){throw (new Error("not implemented"))
};
aq.prototype.putMethodArguments=function(aB,aE){for(var aC=0;
aC<aE.length;
aC++){var aG=aE[aC];
var aA=aG.type;
var aF=g[aA];
if(aF){var aD=aF.type
}else{throw (new Error("Unknown AMQP domain "+aA))
}this["put"+q[aD]](aB[aC]);
this.bitCount=(aD==="bit")?this.bitCount+1:0
}return this
};
aq.prototype.getMethodArguments=function(aB){var aF=[];
for(var aC=0;
aC<aB.length;
aC++){var aA=aB[aC];
var aI=aA.type;
var aE=g[aI].type;
var aH={};
aH.type=aE;
aH.name=aA.name;
try{var aG=this["get"+q[aE]]()
}catch(aD){throw (new Error("type codec failed for type "+aE+" for domain "+aI))
}this.bitCount=(aE==="bit")?this.bitCount+1:0;
aH.value=aG;
aF.push(aH)
}return aF
};
aq.prototype.putArgument=function(aB,aA){var aD=g[aB];
if(aD){var aC=aD.type
}else{throw (new Error("Unknown AMQP domain "+dtype))
}this["put"+q[aC]](aA)
};
aq.prototype.getArgument=function(aA){try{return this["get"+q[aA]]()
}catch(aB){throw (new Error("type codec failed for type "+aA+" for domain "+dtype))
}};
aq.prototype.getContentProperties=function(){var aI={};
var aH=[];
var aC=this.getUnsignedShort();
for(var aE=0;
aE<=16;
aE++){var aG=(aC>>(aE))&1;
if(aG){aH.unshift(aE+1)
}}for(var aE=0;
aE<aH.length;
aE++){var aD=16-aH[aE];
var aF=_basicProperties[aD].name;
var aB=_basicProperties[aD].domain;
var aA=g[aB];
aI[aF]=this.getArgument(aA.type)
}return aI
};
aq.prototype.putContentProperties=function(aH){if(!aH){return this.putUnsignedShort(0)
}var aB=0;
var aG=[];
for(var aE=0;
aE<_basicProperties.length;
aE++){var aF=_basicProperties[aE].name;
var aD=_basicProperties[aE].domain;
var aC=aH[aF];
if(typeof(aC)!=="undefined"){aG.push({propertyName:aF,propertyValue:aC,domain:aD});
aB=aB<<1|1
}else{aB=aB<<1
}}aB=aB<<2;
this.putUnsignedShort(aB);
for(var aE=0;
aE<aG.length;
aE++){var aI=aG[aE];
var aA=aI.domain;
this.putArgument(aA,aI.propertyValue)
}return this
};
AmqpClient.prototype=new e();
var aj=AmqpClient.prototype;
aj.CLOSED=0;
aj.OPEN=1;
aj.CONNECTING=2;
aj.getReadyState=function(){return this._readyState
};
aj.setReadyState=function(aA){this._readyState=aA
};
aj.onopen=function(aA){};
aj.onclose=function(aA){};
aj.onerror=function(aA){};
var x=function(aB,aA){if(!aB){throw (new Error(aA))
}};
aj._init=function(){this._initAsyncClient();
this._buffer=new aq();
this._channels={};
this._channelCount=0;
this._stateMachine.addState("handshaking",[{inputs:["startConnectionFrame"],targetState:"starting"},{inputs:["closeConnectionFrame"],targetState:"closing"}],ae);
this._stateMachine.addState("starting",[{inputs:["startOkConnectionAction"],targetState:"started"}],C);
this._stateMachine.addState("started",[{inputs:["tuneConnectionFrame"],targetState:"tuning"}]);
this._stateMachine.addState("tuning",[{inputs:["tuneOkConnectionAction"],targetState:"tuned"}],O,o);
this._stateMachine.addState("tuned",[{inputs:["openConnectionAction"],targetState:"opening"}]);
this._stateMachine.addState("opening",[{inputs:["openOkConnectionFrame"],targetState:"ready"}],n,av);
this._stateMachine.addState("ready",[{inputs:["openOkChannelFrame","closeChannelFrame","closeOkChannelFrame","flowOkChannelFrame","flowChannelFrame","declareOkExchangeFrame","declareOkQueueFrame","bindOkQueueFrame","unbindOkQueueFrame","deleteOkQueueFrame","deleteOkExchangeFrame","commitOkTxFrame","rollbackOkTxFrame","selectOkTxFrame","purgeOkQueueFrame","cancelOkBasicFrame","getOkBasicFrame","getEmptyBasicFrame","consumeOkBasicFrame","recoverOkBasicFrame","rejectOkBasicFrame","deliverBasicFrame","bodyFrame","headerFrame"],targetState:"ready"},{inputs:["closeConnectionFrame","closeConnectionAction"],targetState:"closing"}],ax);
this._stateMachine.addState("closing",[{inputs:["closeOkConnectionFrame","closeOkConnectionAction"],targetState:"closed"}],av,null);
this._stateMachine.addState("closed",[],z,null)
};
var K={"0-9-1":[65,77,81,80,0,0,9,1]};
aj.connect=function au(aC,aA,aD,aF){if(this._socket){throw (new Error("AmqpClient already connected."))
}var aE;
if(typeof(aC)==="string"){aE=[aC]
}else{aE=aC
}this.setReadyState(this.CONNECTING);
var aB={url:aE[0],virtualHost:aA,credentials:aD};
this._openContinuation=aF;
this._hasNegotiated=false;
al(this,aE[0],aA,aD)
};
var F=aj.connect;
aj.connect=function(aC,aE){if(typeof aC=="object"){myConfig=aC||{};
var aB=myConfig.url;
var aA=myConfig.virtualHost;
var aD=myConfig.credentials;
if(!aB||typeof aB!="string"){throw new Error("AmqpClient.connect(): Parameter 'url' is required")
}if(!aA||typeof aB!="string"){throw new Error("AmqpClient.connect(): Parameter 'virtualHost' is required")
}if(!aD||!aD.username||!aD.password||typeof aD.username!="string"||typeof aD.password!="string"){throw new Error("AmqpClient.connect(): credentials are required")
}F.call(this,aB,aA,aD,aE)
}else{F.apply(this,arguments)
}};
aj.disconnect=function Z(){if(this.getReadyState()==this.OPEN){p(this,0,"",0,0)
}if(this.getReadyState()==this.CONNECTING){this.setReadyState(this.CLOSED);
var aB={};
aB.methodName="closeConnection";
aB.type="closeConnection";
aB.args="";
var aA=new AmqpEvent(this,aB);
this.dispatchEvent(aA)
}};
aj.openChannel=function m(aC){var aB=++this._channelCount;
var aA=new az();
L(aA,aB,this,aC);
this._channels[aB]=aA;
return aA
};
var h=function(aA){var aB=new ByteBuffer(K["0-9-1"]);
aA._socket.send(aB)
};
var u=function(aA){z(aA)
};
var am=function(aC,aA){if(aA.remaining()<aC.length){return false
}else{var aD=aA.limit;
aA.limit=aC.length;
var aB=aA.getString(Charset.UTF8);
aA.limit=aD;
return aC===aB
}};
var ah=function(aC,aG){var aE=aC._buffer;
aE.mark();
aE.position=aE.limit;
aE.putBuffer(aG.data);
aE.reset();
if(!aC._hasNegotiated&&aE.remaining()>7){if(am("AMQP",aE)){var aB=[aE.get(),aE.get(),aE.get(),aE.get()];
var aD={args:[{name:"replyText",value:"Server does not support AMQP protocol versions after "+aB[2]+"-"+aB[3]}],methodName:"closeOkConnection"};
var aA={};
aA.methodName="error";
aA.args=aD.args;
aC.dispatchEvent(new AmqpEvent(aC,aA));
z(aC,"",aD);
return
}else{aE.reset();
aC._hasNegotiated=true
}}var aH=null;
while(aH=aE.getFrame()){var aF=aH;
aC._stateMachine.feedInput(aF.methodName+"Frame",aF)
}aE.compact()
};
var ag=function(aB,aA){aB._socket.send(aA)
};
var aa=function ao(aB,aA,aF,aD){var aC=new aq();
var aE=aA.classIndex;
aC.putMethodFrame(aA,aF,aD);
aC.flip();
ag(aB,aC)
};
var ae=function ae(aC,aB,aD,aE){var aA=new ByteSocket(aD.url);
aA.onopen=function(){h(aC)
};
aA.onclose=function(){u(aC)
};
aA.onmessage=function(aF){ah(aC,aF)
};
aC._socket=aA;
aC._virtualHost=aD.virtualHost;
aC._credentialsOrKey=aD.credentials
};
var R=null;
var C=function(aE,aH,aA){x((aA.channel===0),N.UNEXPECTED_FRAME.message);
var aC=new aq();
var aD=new AmqpArguments();
aD.addLongString("library","KaazingAmqpClient");
aD.addLongString("library_version","3.3.0");
aD.addLongString("library_platform","JavaScript");
var aI=aE._locale||"en_US";
var aG="AMQPLAIN";
var aB=aE._credentialsOrKey;
if(typeof(aB.resolve)!="function"){var aF=G(aB.username,aB.password);
R(aE,aD,aG,aF,aI)
}else{aB.resolve(function(aK){var aJ=G(aK.username,aK.password);
R(aE,aD,aG,aJ,aI)
})
}};
var O=function(aA,aB,aF){x((aF.channel===0),N.UNEXPECTED_FRAME.message);
var aC=aF.args[0].value;
var aE=aF.args[1].value;
var aD=0;
D(aA,aC,aE,aD);
U(aA,aA._virtualHost,aA._openContinuation,aA._openErrorCb)
};
var av=function av(aD,aC,aF){if(aF){if(aF.actionName&&(aF.actionName=="closeConnection")){return
}}if(aC==="nowaitAction"){aD._waitingAction=null;
return
}var aB={};
if(!aB._connection){aB=aD
}else{aB=aD._connection
}var aE=new AmqpEvent(aD,aF);
if(aD._waitingAction){if(aC==="closeChannelFrame"){aD._waitingAction.error(aE)
}else{if(aF.methodName=="closeConnection"){var aA={};
aA.methodName="error";
aA.args=aF.args;
aB.dispatchEvent(new AmqpEvent(aB,aA));
z(aB,"",aF);
return
}else{if(aF.methodName=="openOkConnection"){aB.setReadyState(aB.OPEN)
}else{aD._waitingAction.continuation(aE)
}}}}else{throw (new Error("AmqpClient not in waiting state: protocol violation"))
}aD.dispatchEvent(aE);
if(aF.methodName=="openOkConnection"){aB._openContinuation()
}};
var o=function o(aA,aB,aD){var aC=aA;
setTimeout(function(){aC._processActions()
},0)
};
var ax=function M(aA,aB,aD){if(aD.channel===0){}else{if(aA._channels[aD.channel]){var aC=aA._channels[aD.channel];
A(aC,aB,aD)
}else{}}};
var f=function f(aB,aA,aC){};
var z=function z(aC,aA,aF){if(!(aC.getReadyState()==aC.CLOSED)){var aE;
if(typeof(aF)==="undefined"){aE=new AmqpEvent(aC,{args:[],methodName:"closeOkConnection"})
}else{aF.methodName="closeOkConnection";
aE=new AmqpEvent(aC,aF)
}aC.dispatchEvent(aE);
aC.setReadyState(aC.CLOSED);
if(typeof(aC._channels)!=="undefined"){for(var aB in aC._channels){var aD=aC._channels[aB];
aD.dispatchEvent(aE)
}}}aC._socket.onclose=function(){};
if(aC._socket.readyState==0||aC._socket.readyState==1){aC._socket.close()
}if(typeof(aC._openErrorCb)!=="undefined"){aC._openErrorCb(aE)
}};
function al(aE,aC,aA,aD){var aB={url:aC,virtualHost:aA,credentials:aD};
aE._stateMachine.enterState("handshaking","",aB)
}var L=function L(aC,aD,aB,aA){aC._id=aD;
aC._callbacks=aA;
aC._connection=aB;
aC._transacted=false;
aC._waitingAction=null;
aC._initAsyncClient();
aC._stateMachine.addState("channelReady",[{inputs:["openChannelAction","closeChannelAction","consumeBasicAction","flowChannelAction","declareExchangeAction","declareQueueAction","bindQueueAction","unbindQueueAction","deleteQueueAction","deleteExchangeAction","purgeQueueAction","cancelBasicAction","recoverBasicAction","rejectBasicAction","selectTxAction","commitTxAction","rollbackTxAction",],targetState:"waiting"},{inputs:["publishBasicAction","ackBasicAction"],targetState:"channelReady"},{inputs:["getBasicAction"],targetState:"getting"},{inputs:["deliverBasicFrame"],targetState:"readingContentHeader"}],o);
aC._stateMachine.addState("getting",[{inputs:["getOkBasicFrame"],targetState:"readingContentHeader"},{inputs:["getEmptyBasicFrame"],targetState:"channelReady"},{inputs:["closeChannelFrame"],targetState:"closing"}],n,W);
aC._stateMachine.addState("waiting",[{inputs:["openOkChannelFrame","closeOkChannelFrame","flowOkChannelFrame","declareOkExchangeFrame","declareOkQueueFrame","bindOkQueueFrame","unbindOkQueueFrame","deleteOkQueueFrame","deleteOkExchangeFrame","purgeOkQueueFrame","cancelOkBasicFrame","recoverOkBasicFrame","rejectOkBasicFrame","commitOkTxFrame","rollbackOkTxFrame","selectOkTxFrame","getOkBasicFrame","getEmptyBasicFrame","consumeOkBasicFrame","nowaitAction"],targetState:"channelReady"},{inputs:["closeChannelFrame"],targetState:"closing"}],n,av);
aC._stateMachine.addState("readingContentHeader",[{inputs:["headerFrame"],targetState:"readingContentBody"}],X,I);
aC._stateMachine.addState("readingContentBody",[{inputs:["bodyFrame"],targetState:"channelReady"}],null,aw);
aC._stateMachine.addState("closing",[{inputs:["closeOkChannelAction"],targetState:"closed"}],null);
aC._stateMachine.addState("closed",null,null);
if(aB.getReadyState()==aB.OPEN){m(aC,[aA])
}};
var az=function(){};
az.prototype=new e();
var aj=az.prototype;
aj._init=function(aA){};
var b=function b(aF,aH,aC,aG,aE,aB){var aA=new aq();
var aI=aH.classIndex;
aA.putMethodFrame(aH,aC,aG);
if(aH.hasContent){var aD=0;
aA.putHeaderFrame(aC,aI,aD,aE.remaining(),aB);
if(aE.remaining()>0){aA.putBodyFrame(aC,aE)
}}aA.flip();
ag(aF._connection,aA)
};
var A=function A(aD,aC,aE){if(aE){var aB=aE.methodName||"";
if(aB=="closeChannel"){var aA={};
aA.methodName="error";
aA.type="error";
aA.args=aE.args;
aD.dispatchEvent(new AmqpEvent(aD,aA));
aD.dispatchEvent(new AmqpEvent(aD,aE));
return
}}aD._stateMachine.feedInput(aC,aE)
};
var aw=function aw(aA,aB,aD){aD.args=aA._headerFrame.args;
aD.methodName=aA._headerFrame.methodName;
var aC=new AmqpEvent(aA,aD,aA._headerFrame.contentProperties);
if(aD.methodName==="getOkBasic"){aA._waitingAction.continuation(aC)
}aA.dispatchEvent(aC)
};
var X=function X(aA,aB,aC){aA._headerFrame=aC
};
var I=function I(aA,aB,aC){aA._headerFrame.contentProperties=aC.contentProperties
};
var W=function(aB,aA,aD){var aC=new AmqpEvent(aB,aD);
if(aB._waitingAction){if(aA==="closeChannelFrame"){aB._waitingAction.error(aC);
aB.dispatchEvent(aC);
aB._waitingAction=null
}else{if(aA==="getEmptyBasicFrame"){aB._waitingAction.continuation(aC);
aB.dispatchEvent(aC);
aB._waitingAction=null
}}}else{throw new Error("AmqpClient not in waiting state: protocol violation")
}};
var n=function n(aB,aA,aC){var aD=aC.args[1];
if(aD.synchronous){aB._waitingAction=aC
}else{throw (new Error("AMQP: trying to enter wait state for method that is not sychronous"))
}};
az.prototype.flowFlag=true;
az.prototype.onmessage=function(aA){};
az.prototype.onclose=function(aA){};
az.prototype.onerror=function(aA){};
az.prototype.onopen=function(aA){};
az.prototype.ondeclarequeue=function(aA){};
az.prototype.ondeclareexchange=function(aA){};
az.prototype.onflow=function(aA){};
az.prototype.onbindqueue=function(aA){};
az.prototype.onunbindqueue=function(aA){};
az.prototype.ondeletequeue=function(aA){};
az.prototype.ondeleteexchange=function(aA){};
az.prototype.onconsume=function(aA){};
az.prototype.oncancel=function(aA){};
az.prototype.oncommittransaction=function(aA){};
az.prototype.onrollbacktransaction=function(aA){};
az.prototype.onselecttransaction=function(aA){};
az.prototype.onget=function(aA){};
az.prototype.onpurgequeue=function(aA){};
az.prototype.onrecover=function(aA){};
az.prototype.onreject=function(aA){};
var R=function(aH,aG,aE,aC,aA,aF){var aD=[aG,aE,aC,aA];
var aB="startOkConnection";
aH._enqueueAction(aB,aa,[aH,Y[aB],0,aD],aF);
return aH
};
var B=function(aE,aB,aD){var aC=[aB];
var aA="secureOkConnection";
aE._enqueueAction(aA,aa,[aE,Y[aA],0,aC],aD);
return aE
};
var D=function(aG,aC,aE,aD,aF){var aB=[aC,aE,aD];
var aA="tuneOkConnection";
aG._enqueueAction(aA,aa,[aG,Y[aA],0,aB],aF);
return aG
};
var U=function(aE,aA,aD){var aC=[aA,0,0];
var aB="openConnection";
aE._enqueueAction(aB,aa,[aE,Y[aB],0,aC],aD);
return aE
};
var p=function(aH,aF,aB,aE,aA,aG){var aD=[aF,aB,aE,aA];
var aC="closeConnection";
aH._enqueueAction(aC,aa,[aH,Y[aC],0,aD],aG);
return aH
};
var v=function(aD,aC){var aB=[];
var aA="closeOkConnection";
aD._enqueueAction(aA,aa,[aD,Y[aA],0,aB],aC);
return aD
};
az.prototype.openChannel=function(aE){var aD=[0];
var aB="openChannel";
var aA=Y[aB];
var aC=false;
if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aB,b,[this,aA,this._id,aD],aE)
}if(aB=="flowChannel"){az.prototype.flowFlag=active
}if(aC){if(typeof(noWait)!=="undefined"&&noWait){this._enqueueAction("nowait")
}}return this
};
az.prototype.flowChannel=function(aG,aH){var aE=[aG];
var aC="flowChannel";
var aA=Y[aC];
var aD=false;
for(var aF=0;
aF<aA.allParameters.length;
aF++){var aB=aA.allParameters[aF].name;
if(aB="noWait"){aD=true;
break
}}if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aC,b,[this,aA,this._id,aE],aH)
}if(aC=="flowChannel"){az.prototype.flowFlag=aG
}if(aD){if(typeof(noWait)!=="undefined"&&noWait){this._enqueueAction("nowait")
}}return this
};
az.prototype.flowOkChannel=function(aG,aH){var aE=[aG];
var aC="flowOkChannel";
var aA=Y[aC];
var aD=false;
for(var aF=0;
aF<aA.allParameters.length;
aF++){var aB=aA.allParameters[aF].name;
if(aB="noWait"){aD=true;
break
}}if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aC,b,[this,aA,this._id,aE],aH)
}if(aC=="flowChannel"){az.prototype.flowFlag=aG
}if(aD){if(typeof(noWait)!=="undefined"&&noWait){this._enqueueAction("nowait")
}}return this
};
az.prototype.closeChannel=function(aK,aG,aE,aH,aJ){var aC=[aK,aG,aE,aH];
var aI="closeChannel";
var aF=Y[aI];
var aB=false;
for(var aA=0;
aA<aF.allParameters.length;
aA++){var aD=aF.allParameters[aA].name;
if(aD="noWait"){aB=true;
break
}}if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aI,b,[this,aF,this._id,aC],aJ)
}if(aI=="flowChannel"){az.prototype.flowFlag=active
}if(aB){if(typeof(noWait)!=="undefined"&&noWait){this._enqueueAction("nowait")
}}return this
};
az.prototype.closeOkChannel=function(aE){var aD=[];
var aB="closeOkChannel";
var aA=Y[aB];
var aC=false;
if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aB,b,[this,aA,this._id,aD],aE)
}if(aB=="flowChannel"){az.prototype.flowFlag=active
}if(aC){if(typeof(noWait)!=="undefined"&&noWait){this._enqueueAction("nowait")
}}return this
};
az.prototype.declareExchange=function(aD,aI,aK,aB,aM,aA,aL){var aF=[0,aD,aI,aK,aB,0,0,aM,aA];
var aJ="declareExchange";
var aH=Y[aJ];
var aE=false;
for(var aC=0;
aC<aH.allParameters.length;
aC++){var aG=aH.allParameters[aC].name;
if(aG="noWait"){aE=true;
break
}}if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aJ,b,[this,aH,this._id,aF],aL)
}if(aJ=="flowChannel"){az.prototype.flowFlag=active
}if(aE){if(typeof(aM)!=="undefined"&&aM){this._enqueueAction("nowait")
}}return this
};
az.prototype.deleteExchange=function(aB,aJ,aI,aH){var aD=[0,aB,aJ,aI];
var aG="deleteExchange";
var aF=Y[aG];
var aC=false;
for(var aA=0;
aA<aF.allParameters.length;
aA++){var aE=aF.allParameters[aA].name;
if(aE="noWait"){aC=true;
break
}}if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aG,b,[this,aF,this._id,aD],aH)
}if(aG=="flowChannel"){az.prototype.flowFlag=active
}if(aC){if(typeof(aI)!=="undefined"&&aI){this._enqueueAction("nowait")
}}return this
};
az.prototype.declareQueue=function(aE,aK,aC,aA,aN,aM,aB,aL){var aG=[0,aE,aK,aC,aA,aN,aM,aB];
var aJ="declareQueue";
var aI=Y[aJ];
var aF=false;
for(var aD=0;
aD<aI.allParameters.length;
aD++){var aH=aI.allParameters[aD].name;
if(aH="noWait"){aF=true;
break
}}if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aJ,b,[this,aI,this._id,aG],aL)
}if(aJ=="flowChannel"){az.prototype.flowFlag=active
}if(aF){if(typeof(aM)!=="undefined"&&aM){this._enqueueAction("nowait")
}}return this
};
az.prototype.bindQueue=function(aD,aE,aC,aL,aA,aK){var aG=[0,aD,aE,aC,aL,aA];
var aJ="bindQueue";
var aI=Y[aJ];
var aF=false;
for(var aB=0;
aB<aI.allParameters.length;
aB++){var aH=aI.allParameters[aB].name;
if(aH="noWait"){aF=true;
break
}}if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aJ,b,[this,aI,this._id,aG],aK)
}if(aJ=="flowChannel"){az.prototype.flowFlag=active
}if(aF){if(typeof(aL)!=="undefined"&&aL){this._enqueueAction("nowait")
}}return this
};
az.prototype.unbindQueue=function(aD,aE,aC,aA,aK){var aG=[0,aD,aE,aC,aA];
var aJ="unbindQueue";
var aI=Y[aJ];
var aF=false;
for(var aB=0;
aB<aI.allParameters.length;
aB++){var aH=aI.allParameters[aB].name;
if(aH="noWait"){aF=true;
break
}}if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aJ,b,[this,aI,this._id,aG],aK)
}if(aJ=="flowChannel"){az.prototype.flowFlag=active
}if(aF){if(typeof(noWait)!=="undefined"&&noWait){this._enqueueAction("nowait")
}}return this
};
az.prototype.purgeQueue=function(aB,aI,aH){var aD=[0,aB,aI];
var aG="purgeQueue";
var aF=Y[aG];
var aC=false;
for(var aA=0;
aA<aF.allParameters.length;
aA++){var aE=aF.allParameters[aA].name;
if(aE="noWait"){aC=true;
break
}}if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aG,b,[this,aF,this._id,aD],aH)
}if(aG=="flowChannel"){az.prototype.flowFlag=active
}if(aC){if(typeof(aI)!=="undefined"&&aI){this._enqueueAction("nowait")
}}return this
};
az.prototype.deleteQueue=function(aC,aK,aB,aJ,aI){var aE=[0,aC,aK,aB,aJ];
var aH="deleteQueue";
var aG=Y[aH];
var aD=false;
for(var aA=0;
aA<aG.allParameters.length;
aA++){var aF=aG.allParameters[aA].name;
if(aF="noWait"){aD=true;
break
}}if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aH,b,[this,aG,this._id,aE],aI)
}if(aH=="flowChannel"){az.prototype.flowFlag=active
}if(aD){if(typeof(aJ)!=="undefined"&&aJ){this._enqueueAction("nowait")
}}return this
};
az.prototype.qosBasic=function(aB,aI,aA,aJ){var aE=[aB,aI,aA];
var aH="qosBasic";
var aG=Y[aH];
var aD=false;
for(var aC=0;
aC<aG.allParameters.length;
aC++){var aF=aG.allParameters[aC].name;
if(aF="noWait"){aD=true;
break
}}if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aH,b,[this,aG,this._id,aE],aJ)
}if(aH=="flowChannel"){az.prototype.flowFlag=active
}if(aD){if(typeof(noWait)!=="undefined"&&noWait){this._enqueueAction("nowait")
}}return this
};
az.prototype.consumeBasic=function(aG,aA,aD,aF,aB,aN,aC,aM){var aI=[0,aG,aA,aD,aF,aB,aN,aC];
var aL="consumeBasic";
var aK=Y[aL];
var aH=false;
for(var aE=0;
aE<aK.allParameters.length;
aE++){var aJ=aK.allParameters[aE].name;
if(aJ="noWait"){aH=true;
break
}}if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aL,b,[this,aK,this._id,aI],aM)
}if(aL=="flowChannel"){az.prototype.flowFlag=active
}if(aH){if(typeof(aN)!=="undefined"&&aN){this._enqueueAction("nowait")
}}return this
};
az.prototype.cancelBasic=function(aA,aI,aH){var aD=[aA,aI];
var aG="cancelBasic";
var aF=Y[aG];
var aC=false;
for(var aB=0;
aB<aF.allParameters.length;
aB++){var aE=aF.allParameters[aB].name;
if(aE="noWait"){aC=true;
break
}}if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aG,b,[this,aF,this._id,aD],aH)
}if(aG=="flowChannel"){az.prototype.flowFlag=active
}if(aC){if(typeof(aI)!=="undefined"&&aI){this._enqueueAction("nowait")
}}return this
};
az.prototype.publishBasic=function(aF,aA,aG,aD,aE,aB,aM){var aI=[0,aG,aD,aE,aB];
var aL="publishBasic";
var aK=Y[aL];
var aH=false;
for(var aC=0;
aC<aK.allParameters.length;
aC++){var aJ=aK.allParameters[aC].name;
if(aJ="noWait"){aH=true;
break
}}if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aL,b,[this,aK,this._id,aI,aF,aA],aM)
}if(aL=="flowChannel"){az.prototype.flowFlag=active
}if(aH){if(typeof(noWait)!=="undefined"&&noWait){this._enqueueAction("nowait")
}}return this
};
az.prototype.getBasic=function(aC,aB,aI){var aE=[0,aC,aB];
var aH="getBasic";
var aG=Y[aH];
var aD=false;
for(var aA=0;
aA<aG.allParameters.length;
aA++){var aF=aG.allParameters[aA].name;
if(aF="noWait"){aD=true;
break
}}if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aH,b,[this,aG,this._id,aE],aI)
}if(aH=="flowChannel"){az.prototype.flowFlag=active
}if(aD){if(typeof(noWait)!=="undefined"&&noWait){this._enqueueAction("nowait")
}}return this
};
az.prototype.ackBasic=function(aF,aI,aH){var aC=[aF,aI];
var aG="ackBasic";
var aE=Y[aG];
var aB=false;
for(var aA=0;
aA<aE.allParameters.length;
aA++){var aD=aE.allParameters[aA].name;
if(aD="noWait"){aB=true;
break
}}if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aG,b,[this,aE,this._id,aC],aH)
}if(aG=="flowChannel"){az.prototype.flowFlag=active
}if(aB){if(typeof(noWait)!=="undefined"&&noWait){this._enqueueAction("nowait")
}}return this
};
az.prototype.rejectBasic=function(aG,aA,aI){var aD=[aG,aA];
var aH="rejectBasic";
var aF=Y[aH];
var aC=false;
for(var aB=0;
aB<aF.allParameters.length;
aB++){var aE=aF.allParameters[aB].name;
if(aE="noWait"){aC=true;
break
}}if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aH,b,[this,aF,this._id,aD],aI)
}if(aH=="flowChannel"){az.prototype.flowFlag=active
}if(aC){if(typeof(noWait)!=="undefined"&&noWait){this._enqueueAction("nowait")
}}return this
};
az.prototype.recoverBasic=function(aF,aH){var aE=[aF];
var aC="recoverBasic";
var aA=Y[aC];
var aD=false;
for(var aG=0;
aG<aA.allParameters.length;
aG++){var aB=aA.allParameters[aG].name;
if(aB="noWait"){aD=true;
break
}}if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aC,b,[this,aA,this._id,aE],aH)
}if(aC=="flowChannel"){az.prototype.flowFlag=active
}if(aD){if(typeof(noWait)!=="undefined"&&noWait){this._enqueueAction("nowait")
}}return this
};
_basicProperties=[{name:"contentType",domain:"Shortstr",label:"MIME content type"},{name:"contentEncoding",domain:"Shortstr",label:"MIME content encoding"},{name:"headers",domain:"Table",label:"message header field table"},{name:"deliveryMode",domain:"Octet",label:"non-persistent (1) or persistent (2)"},{name:"priority",domain:"Octet",label:"message priority, 0 to 9"},{name:"correlationId",domain:"Shortstr",label:"application correlation identifier"},{name:"replyTo",domain:"Shortstr",label:"address to reply to"},{name:"expiration",domain:"Shortstr",label:"message expiration specification"},{name:"messageId",domain:"Shortstr",label:"application message identifier"},{name:"timestamp",domain:"Timestamp",label:"message timestamp"},{name:"type",domain:"Shortstr",label:"message type name"},{name:"userId",domain:"Shortstr",label:"creating user id"},{name:"appId",domain:"Shortstr",label:"creating application id"},{name:"reserved",domain:"Shortstr",label:"reserved, must be empty"}];
az.prototype.selectTx=function(aE){var aD=[];
var aB="selectTx";
var aA=Y[aB];
var aC=false;
if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aB,b,[this,aA,this._id,aD],aE)
}if(aB=="flowChannel"){az.prototype.flowFlag=active
}if(aC){if(typeof(noWait)!=="undefined"&&noWait){this._enqueueAction("nowait")
}}return this
};
az.prototype.commitTx=function(aE){var aD=[];
var aB="commitTx";
var aA=Y[aB];
var aC=false;
if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aB,b,[this,aA,this._id,aD],aE)
}if(aB=="flowChannel"){az.prototype.flowFlag=active
}if(aC){if(typeof(noWait)!=="undefined"&&noWait){this._enqueueAction("nowait")
}}return this
};
az.prototype.rollbackTx=function(aE){var aD=[];
var aB="rollbackTx";
var aA=Y[aB];
var aC=false;
if(this._connection._readyState==this._connection.OPEN){this._enqueueAction(aB,b,[this,aA,this._id,aD],aE)
}if(aB=="flowChannel"){az.prototype.flowFlag=active
}if(aC){if(typeof(noWait)!=="undefined"&&noWait){this._enqueueAction("nowait")
}}return this
};
var T=az.prototype.openChannel;
var m=function(aB,aA){aB._stateMachine.enterState("channelReady","",null);
T.apply(aB,aA)
};
delete az.prototype.openChannel;
var d=az.prototype.closeOkChannel;
var at=function(aB,aA){d.apply(aB,aA)
};
delete az.prototype.closeOkChannel;
var S=az.prototype.closeChannel;
az.prototype.closeChannel=function(aC,aF){if(typeof aC=="object"){myConfig=aC||{};
var aE=myConfig.replyCode||0;
var aB=myConfig.replyText||"";
var aD=myConfig.classId||0;
var aA=myConfig.methodId||0;
if(typeof aE!="number"){throw new Error("AmqpChannel.closeChannel(): Parameter 'replyCode' is expected to be of numeric type")
}if(typeof aB!="string"){throw new Error("AmqpChannel.closeChannel(): Parameter 'replyText' is expected to be a string")
}if(typeof aD!="number"){throw new Error("AmqpChannel.closeChannel(): Parameter 'classId' is expected to be of numeric type")
}if(typeof aA!="number"){throw new Error("AmqpChannel.closeChannel(): Parameter 'methodId' is expected to be of numeric type")
}return S.call(this,aE,aB,aD,aA,aF)
}else{return S.apply(this,arguments)
}};
var ai=az.prototype.declareExchange;
az.prototype.declareExchange=function(aD,aH){if(typeof aD=="object"){myConfig=aD||{};
var aB=myConfig.exchange;
var aF=myConfig.type;
var aE=myConfig.passive||false;
var aG=myConfig.durable||false;
var aA=myConfig.noWait||false;
var aC=myConfig.args||null;
if(!aB||typeof aB!="string"){throw new Error("AmqpChannel.declareExchange(): String parameter 'exchange' is required")
}if(!aF||typeof aF!="string"||((aF!="fanout")&&(aF!="direct")&&(aF!="topic")&&(aF!="headers"))){throw new Error("AmqpChannel.declareExchange(): Legal values of parameter 'type' are direct | fanout | headers | topic")
}if(typeof aE!="boolean"){throw new Error("AmqpChannel.declareExchange(): Parameter 'passive' only accepts boolean values")
}if(typeof aG!="boolean"){throw new Error("AmqpChannel.declareExchange(): Parameter 'durable' only accepts boolean values")
}if(typeof aA!="boolean"){throw new Error("AmqpChannel.declareExchange(): Parameter 'noWait' only accepts boolean values")
}return ai.call(this,aB,aF,aE,aG,aA,aC,aH)
}else{return ai.apply(this,arguments)
}};
var af=az.prototype.deleteExchange;
az.prototype.deleteExchange=function(aC,aE){if(typeof aC=="object"){myConfig=aC||{};
var aB=myConfig.exchange;
var aD=myConfig.ifUnused||false;
var aA=myConfig.noWait||false;
if(!aB||typeof aB!="string"){throw new Error("AmqpChannel.deleteExchange(): String parameter 'exchange' is required")
}if(typeof aD!="boolean"){throw new Error("AmqpChannel.deleteExchange(): Parameter 'ifUnused' only accepts boolean values")
}if(typeof aA!="boolean"){throw new Error("AmqpChannel.deleteExchange(): Parameter 'noWait' only accepts boolean values")
}return af.call(this,aB,aD,aA,aE)
}else{return af.apply(this,arguments)
}};
var y=az.prototype.declareQueue;
az.prototype.declareQueue=function(aC,aG){if(typeof aC=="object"){myConfig=aC||{};
var aD=myConfig.queue;
var aF=myConfig.passive||false;
var aB=myConfig.durable||false;
var aA=myConfig.exclusive||false;
var aI=myConfig.autoDelete||false;
var aH=myConfig.noWait||false;
var aE=myConfig.args||null;
if(!aD||typeof aD!="string"){throw new Error("AmqpChannel.declareQueue(): String parameter 'queue' is required")
}if(typeof aF!="boolean"){throw new Error("AmqpChannel.declareQueue(): Parameter 'passive' only accepts boolean values")
}if(typeof aB!="boolean"){throw new Error("AmqpChannel.declareQueue(): Parameter 'durable' only accepts boolean values")
}if(typeof aA!="boolean"){throw new Error("AmqpChannel.declareQueue(): Parameter 'exclusive' only accepts boolean values")
}if(typeof aI!="boolean"){throw new Error("AmqpChannel.declareQueue(): Parameter 'autoDelete' only accepts boolean values")
}if(typeof aH!="boolean"){throw new Error("AmqpChannel.declareQueue(): Parameter 'noWait' only accepts boolean values")
}return y.call(this,aD,aF,aB,aA,aI,aH,aE,aG)
}else{return y.apply(this,arguments)
}};
var Q=az.prototype.bindQueue;
az.prototype.bindQueue=function(aE,aG){if(typeof aE=="object"){myConfig=aE||{};
var aA=myConfig.queue;
var aC=myConfig.exchange;
var aF=myConfig.routingKey;
var aB=myConfig.noWait||false;
var aD=myConfig.args||null;
if(!aA||typeof aA!="string"){throw new Error("AmqpChannel.bindQueue(): String parameter 'queue' is required")
}if(!aC||typeof aC!="string"){throw new Error("AmqpChannel.bindQueue(): String parameter 'exchange' is required")
}if(!aF||typeof aF!="string"){throw new Error("AmqpChannel.bindQueue(): String parameter 'routingKey' is required")
}if(typeof aB!="boolean"){throw new Error("AmqpChannel.bindQueue(): Parameter 'noWait' only accepts boolean values")
}return Q.call(this,aA,aC,aF,aB,aD,aG)
}else{return Q.apply(this,arguments)
}};
var ac=az.prototype.unbindQueue;
az.prototype.unbindQueue=function(aD,aF){if(typeof aD=="object"){myConfig=aD||{};
var aA=myConfig.queue;
var aB=myConfig.exchange;
var aE=myConfig.routingKey;
var aC=myConfig.args||null;
if(!aA||typeof aA!="string"){throw new Error("AmqpChannel.unbindQueue(): String parameter 'queue' is required")
}if(!aB||typeof aB!="string"){throw new Error("AmqpChannel.unbindQueue(): String parameter 'exchange' is required")
}if(!aE||typeof aE!="string"){throw new Error("AmqpChannel.unbindQueue(): String parameter 'routingKey' is required")
}return ac.call(this,aA,aB,aE,aC,aF)
}else{return ac.apply(this,arguments)
}};
var H=az.prototype.purgeQueue;
az.prototype.purgeQueue=function(aC,aD){if(typeof aC=="object"){myConfig=aC||{};
var aA=myConfig.queue;
var aB=myConfig.noWait||false;
if(!aA||typeof aA!="string"){throw new Error("AmqpChannel.purgeQueue(): String parameter 'queue' is required")
}if(typeof aB!="boolean"){throw new Error("AmqpChannel.purgeQueue(): Parameter 'noWait' only accepts boolean values")
}return H.call(this,aA,aB,aD)
}else{return H.apply(this,arguments)
}};
var ak=az.prototype.deleteQueue;
az.prototype.deleteQueue=function(aD,aF){if(typeof aD=="object"){myConfig=aD||{};
var aB=myConfig.queue;
var aE=myConfig.ifUnused||false;
var aA=myConfig.ifEmpty||false;
var aC=myConfig.noWait||false;
if(!aB||typeof aB!="string"){throw new Error("AmqpChannel.deleteQueue(): String parameter 'queue' is required")
}if(typeof aE!="boolean"){throw new Error("AmqpChannel.deleteQueue(): Parameter 'ifUnused' only accepts boolean values")
}if(typeof aA!="boolean"){throw new Error("AmqpChannel.deleteQueue(): Parameter 'ifEmpty' only accepts boolean values")
}if(typeof aC!="boolean"){throw new Error("AmqpChannel.deleteQueue(): Parameter 'noWait' only accepts boolean values")
}return ak.call(this,aB,aE,aA,aC,aF)
}else{return ak.apply(this,arguments)
}};
var an=az.prototype.qosBasic;
az.prototype.qosBasic=function(aA,aE){if(typeof aA=="object"){myConfig=aA||{};
var aD=myConfig.prefetchSize||0;
var aB=myConfig.prefetchCount||0;
var aC=myConfig.global||false;
if(typeof aD!="number"){throw new Error("AmqpChannel.qosBasic(): Parameter 'prefetchSize' is expected to be of numeric type")
}if(typeof aB!="number"){throw new Error("AmqpChannel.qosBasic(): Parameter 'prefetchCount' is expected to be of numeric type")
}if(typeof aC!="boolean"){throw new Error("AmqpChannel.qosBasic(): Parameter 'global' only accepts boolean values")
}return an.call(this,aD,aB,aC,aE)
}else{return an.apply(this,arguments)
}};
var ar=az.prototype.consumeBasic;
az.prototype.consumeBasic=function(aD,aH){if(typeof aD=="object"){myConfig=aD||{};
var aF=myConfig.queue;
var aA=myConfig.consumerTag;
var aC=myConfig.noLocal||false;
var aE=myConfig.noAck||false;
var aB=myConfig.exclusive||false;
var aI=myConfig.noWait||false;
var aG=myConfig.args||null;
if(!aF||typeof aF!="string"){throw new Error("AmqpChannel.consumeBasic(): String parameter 'queue' is required")
}if(!aA||typeof aA!="string"){throw new Error("AmqpChannel.consumeBasic(): String parameter 'consumerTag' is required")
}if(typeof aC!="boolean"){throw new Error("AmqpChannel.consumeBasic(): Parameter 'noLocal' only accepts boolean values")
}if(typeof aE!="boolean"){throw new Error("AmqpChannel.consumeBasic(): Parameter 'noAck' only accepts boolean values")
}if(typeof aB!="boolean"){throw new Error("AmqpChannel.consumeBasic(): Parameter 'exclusive' only accepts boolean values")
}if(typeof aI!="boolean"){throw new Error("AmqpChannel.consumeBasic(): Parameter 'noWait' only accepts boolean values")
}return ar.call(this,aF,aA,aC,aE,aB,aI,aG,aH)
}else{return ar.apply(this,arguments)
}};
var ab=az.prototype.cancelBasic;
az.prototype.cancelBasic=function(aB,aD){if(typeof aB=="object"){myConfig=aB||{};
var aC=myConfig.consumerTag;
var aA=myConfig.noWait||false;
if(!aC||typeof aC!="string"){throw new Error("AmqpChannel.cancelBasic(): String parameter 'consumerTag' is required")
}if(typeof aA!="boolean"){throw new Error("AmqpChannel.cancelBasic(): Parameter 'noWait' only accepts boolean values")
}return ab.call(this,aC,aA,aD)
}else{return ab.apply(this,arguments)
}};
var l=az.prototype.publishBasic;
az.prototype.publishBasic=function(aD,aJ){if(typeof aD=="object"&&aD.body){myConfig=aD||{};
var aG=myConfig.body;
var aC=myConfig.headers;
var aI=myConfig.properties;
var aH=myConfig.exchange;
var aE=myConfig.routingKey;
var aF=myConfig.mandatory||false;
var aB=myConfig.immediate||false;
if(!aG){throw new Error("AmqpChannel.publishBasic(): ByteBuffer parameter 'body' is required")
}if(!aH||typeof aH!="string"){throw new Error("AmqpChannel.publishBasic(): String parameter 'exchange' is required")
}if(!aE||typeof aE!="string"){throw new Error("AmqpChannel.publishBasic(): String parameter 'routingKey' is required")
}if(typeof aF!="boolean"){throw new Error("AmqpChannel.publishBasic(): Parameter 'mandatory' only accepts boolean values")
}if(typeof aB!="boolean"){throw new Error("AmqpChannel.publishBasic(): Parameter 'immediate' only accepts boolean values")
}var aA={};
if(aI!=undefined){aA=aI.getProperties()
}else{if(aC!=undefined){aA=aC
}}return l.call(this,aG,aA,aH,aE,aF,aB,aJ)
}else{return l.apply(this,arguments)
}};
var a=az.prototype.getBasic;
az.prototype.getBasic=function(aC,aD){if(typeof aC=="object"){myConfig=aC||{};
var aA=myConfig.queue;
var aB=myConfig.noAck||false;
if(!aA||typeof aA!="string"){throw new Error("AmqpChannel.getBasic(): String parameter 'queue' is required")
}if(typeof aB!="boolean"){throw new Error("AmqpChannel.getBasic(): Parameter 'noAck' only accepts boolean values")
}return a.call(this,aA,aB,aD)
}else{return a.apply(this,arguments)
}};
var c=az.prototype.ackBasic;
az.prototype.ackBasic=function(aB,aD){if(typeof aB=="object"){myConfig=aB||{};
var aC=myConfig.deliveryTag;
var aA=myConfig.multiple||false;
if(!aC||typeof aC!="string"){throw new Error("AmqpChannel.ackBasic(): String parameter 'deliveryTag' is required")
}if(typeof aA!="boolean"){throw new Error("AmqpChannel.ackBasic(): Parameter 'multiple' only accepts boolean values")
}return c.call(this,aC,aA,aD)
}else{return c.apply(this,arguments)
}};
var ay=az.prototype.rejectBasic;
az.prototype.rejectBasic=function(aB,aD){if(typeof aB=="object"){myConfig=aB||{};
var aC=myConfig.deliveryTag;
var aA=myConfig.requeue||false;
if(!aC||typeof aC!="string"){throw new Error("AmqpChannel.rejectBasic(): String parameter 'deliveryTag' is required")
}if(typeof aA!="boolean"){throw new Error("AmqpChannel.rejectBasic(): Parameter 'requeue' only accepts boolean values")
}return ay.call(this,aC,aA,aD)
}else{return ay.apply(this,arguments)
}};
var t=function(){this._actionList=new Array();
this.currentAction=0;
this._replayLength=0
};
t.prototype.getActionList=function(){return this._actionList
};
t.prototype.setReplayLength=function(aA){this._replayLength=aA
};
t.prototype._processActions=function r(){if(!this._actionList.length){return
}if(this.currentAction==this._actionList.length){this.currentAction=0
}var aA=this._actionList[this.currentAction];
this.currentAction++;
aA.func.apply(aA.object,aA.args)
};
t.prototype._processAllActions=function k(){for(i=0;
i<this._replayLength;
i++){var aA=this._actionList[i];
aA.func.apply(aA.object,aA.args)
}};
t.prototype._processAllNewActions=function ap(){for(i=this._replayLength;
i<this._actionList.length;
i++){var aA=this._actionList[i];
aA.func.apply(aA.object,aA.args)
}};
t.prototype._addAction=function j(aB,aD,aE,aC){switch(aB){case"declareExchange":break;
case"declareQueue":break;
case"bindQueue":break;
case"consumeBasic":break;
default:return
}var aA=function aA(){};
var aF={};
aF.object=aD;
aF.func=aE||aA;
aF.args=aC||null;
this._actionList.push(aF)
}
})();
var AmqpArguments=function(){};
AmqpArguments.prototype=new Array();
(function(){var a=AmqpArguments.prototype;
var b=function(g,c,f,d){var e={};
e.key=c;
e.value=f;
e.type=d;
g.push(e)
};
a.addLongString=function(c,d){b(this,c,d,"longstr");
return this
};
a.addInteger=function(c,d){b(this,c,d,"int");
return this
};
a.toString=function(){var c=[];
for(var d=0;
d<this.length;
d++){if(this[d].key!=null){c.push("{key:"+this[d].key+", value:"+this[d].value+", type:"+this[d].type+"}")
}}return"{"+c.join(", ")+"}"
}
})();
var AmqpProperties=function(f){this._properties={};
if(f!=null){var e=false;
for(var g in f){e=false;
for(var a=0;
a<_basicProperties.length;
a++){if(g==_basicProperties[a].name){e=true;
break
}}if(!e){throw new Error("Illegal property: '"+g.getKey()+"' passed")
}}for(var c in f){var d=f[c];
if(c=="appId"||c=="contentType"||c=="contentEncoding"||c=="correlationId"||c=="expiration"||c=="messageId"||c=="replyTo"||c=="type"||c=="userId"){if((d!=null)&&(typeof(d)!="string")){var b="Invalid type: Value of '"+c+"' should be of type String";
throw new Error(b)
}}else{if(c=="headers"){if((d!=null)&&!(d instanceof AmqpArguments)){b="Invalid type: Value of '"+c+"' should be of type AmqpArguments";
throw new Error(b)
}}else{if(c=="timestamp"){if((d!=null)&&d.getMonth&&d.getMonth.call){continue
}var b="Invalid type: Value of '"+c+"' should be of type Date";
throw new Error(b)
}else{if(c=="deliveryMode"){if((d!=null)&&(typeof(d)!="number")){var b="Invalid type: Value of '"+c+"' should be of type Integer";
throw new Error(b)
}if((d!=1)&&(d!=2)){var b="Invalid value: Value of '"+c+"' should be either 1(non-persistent) or 2(persistent)";
throw new Error(b)
}}else{if(c=="priority"){if((d!=null)&&(typeof(d)!="number")){var b="Invalid type: Value of '"+c+"' should be of type Integer";
throw new Error(b)
}if((d<0)||(d>9)){var b="Invalid value: Value of property '"+c+"' should be between 0 and 9";
throw new Error(b)
}}else{var b="Illegal property '"+c+"' specified";
throw new Error(b)
}}}}}}this._properties=f
}};
(function(){var a=AmqpProperties.prototype;
a.getAppId=function(){return this._properties.appId
};
a.getContentType=function(){return this._properties.contentType
};
a.getContentEncoding=function(){return this._properties.contentEncoding
};
a.getCorrelationId=function(){return this._properties.correlationId
};
a.getDeliveryMode=function(){return parseInt(this._properties.deliveryMode)
};
a.getExpiration=function(){return this._properties.expiration
};
a.getHeaders=function(){return this._properties.headers
};
a.getMessageId=function(){return this._properties.messageId
};
a.getPriority=function(){return parseInt(this._properties.priority)
};
a.getProperties=function(){var c={};
for(var b in this._properties){if(this._properties[b]!=null){c[b]=this._properties[b]
}}return c
};
a.getReplyTo=function(){return this._properties.replyTo
};
a.getTimestamp=function(){return this._properties.timestamp
};
a.getType=function(){return this._properties.type
};
a.getUserId=function(){return this._properties.userId
};
a.setAppId=function(b){this._properties.appId=b
};
a.setContentType=function(b){this._properties.contentType=b
};
a.setContentEncoding=function(b){this._properties.contentEncoding=b
};
a.setCorrelationId=function(b){this._properties.correlationId=b
};
a.setDeliveryMode=function(c){if(c==null){var b="Null parameter passed into AmqpProperties.setPriority()";
throw new Error(b)
}if((c!=1)&&(c!=2)){b="AMQP 0-9-1 spec mandates 'deliveryMode' value to be either 1(for non-persistent) or 2(for persistent)";
throw new Error(b)
}this._properties.deliveryMode=c
};
a.setExpiration=function(b){this._properties.expiration=b
};
a.setHeaders=function(b){this._properties.headers=b
};
a.setMessageId=function(b){this._properties.messageId=b
};
a.setPriority=function(b){if(b==null){var c="Null parameter passed into AmqpProperties.setPriority()";
throw new Error(c)
}if((b<0)||(b>9)){c="AMQP 0-9-1 spec mandates 'priority' value to be between 0 and 9";
throw new Error(c)
}this._properties.priority=b
};
a.setReplyTo=function(b){this._properties.replyTo=b
};
a.setTimestamp=function(b){if(b!=null){if(b.getMonth&&b.getMonth.call){s="AmqpProperties.setTimestamp() expects a Date"
}}this._properties.timestamp=b
};
a.setType=function(b){this._properties.type=b
};
a.setUserId=function(b){this._properties.userId=b
};
a.toString=function(){if((this._properties==null)||(this._properties.length==0)){return""
}var b=[];
for(var c in this._properties){if(this._properties[c]!=null){b.push(c+":"+this._properties[c])
}}return"{"+b.join(", ")+"}"
}
})();
(function(){var b=function(c){switch(c){case"deliverBasic":return"message";
case"closeOkChannel":case"closeChannel":case"closeOkConnection":case"closeConnection":return"close";
case"getOkBasic":case"getEmptyBasic":return"get";
case"consumeOkBasic":return"consume";
case"cancelOkBasic":return"cancel";
case"openOkConnection":case"openOkChannel":return"open";
case"declareOkQueue":return"declarequeue";
case"declareOkExchange":return"declareexchange";
case"flowOkChannel":return"flow";
case"bindOkQueue":return"bindqueue";
case"unbindOkQueue":return"unbindqueue";
case"deleteOkQueue":return"deletequeue";
case"deleteOkExchange":return"deleteexchange";
case"commitOkTx":return"committransaction";
case"rollbackOkTx":return"rollbacktransaction";
case"selectOkTx":return"selecttransaction";
case"purgeOkQueue":return"purgequeue";
case"recoverOkBasic":return"recover";
case"rejectOkBasic":return"reject";
case"error":return"error";
default:throw (new Error("AMQP: unknown event name "+c))
}};
AmqpEvent=function(d,f,e){this.type=f.methodName;
this.type=b(this.type);
this.args={};
for(var c=0;
c<f.args.length;
c++){this.args[f.args[c].name]=f.args[c].value
}this.headers=e;
this.body=f.body;
this.target=d;
if(this.type=="message"){this.properties=new AmqpProperties(e)
}if(this.type=="error"){this.message=this.args.replyText
}};
var a=AmqpEvent.prototype;
a.type;
a.message;
a.body;
a.headers;
a.properties;
a.target
})();
(function (window) {
    'use strict';

    /**
     * Module dependencies
     */
    var on = (window.addEventListener !== undefined) ? 'addEventListener' : 'attachEvent',
        off = (window.removeEventListener !== undefined) ? 'removeEventListener' : 'detachEvent',
        scrollEvent = (on !== 'addEventListener') ? 'onscroll' : 'scroll',
        scrolled = false,
        requestAnimFrame = (function () {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
        }()),
        scrolledElement,
        scroll,
        eve;


    /**
     * Captures the scroll event and the element who emits it.
     * @function
     * @private
     */
    function captureScroll(e) {
        // No changing, exit
        if (!scrolled) {
            scrolled = true;
            scrolledElement = this;
            eve = e || window.e;


            /**
             * requestAnimationFrame
             */
            requestAnimFrame(update);
        }
    }

    /**
     * If the scroll event exist, it will execute the scrolledElement listeners.
     * @function
     * @private
     */
    function update() {

        var i = 0,
            listeners = scroll._collection[scrolledElement].listeners,
            len = listeners.length;

        for (i; i < len; i += 1) {
            listeners[i].call(scrolledElement, eve);
        }

        scrolledElement = undefined;

        // Change scroll status
        scrolled = false;
    }

    /**
     * Scroll Constructor.
     * @constructor
     * @returns {scroll} Returns a new instance of Scroll.
     */
    function Scroll() {
        this.initialize();
        return this;
    }

    /**
     * Initializes a new instance of Scroll.
     * @function
     * @returns {scroll} Returns a new instance of Scroll.
     */
    Scroll.prototype.initialize = function () {
        this._collection = {};
        return this;
    };

    /**
     * Adds an el with a listener to the collection.
     * @memberof! Scroll.prototype
     * @function
     * @param {HTMLElement} [el] - A given HTMLElement to add to scroll.
     * @param {Funtion} listener - A given listener to execute when the given el is scrolled.
     * @returns {scroll}
     */
    Scroll.prototype.add = function (el, listener) {

        if ('function' === typeof el) {
            listener = el;
            el = window;
        }

        if (this._collection[el] === undefined) {
            this._collection[el] = {
                'listeners': []
            };

            el[on](scrollEvent, captureScroll, false);
        }

        // Add listeners to an el collection
        this._collection[el].listeners.push(listener);

        return this;
    };

    /**
     * Removes a HTMLElement and its listener from the collection with the given el.
     * @memberof! Scroll.prototype
     * @function
     * @param {HTMLElement} el - A given HTMLElement to remove.
     * @param {Funtion} [listener] - A given listener to remove.
     * @returns {scroll}
     */
    Scroll.prototype.remove = function (el, listener) {
        var listeners = this._collection[el].listeners,
            i = 0,
            len = listeners.length;

        if (len !== undefined) {
            for (i; i < len; i += 1) {
                if (listeners[i] === listener) {
                    listeners.splice(i, 1);
                    break;
                }
            }
        }

        if (listeners.length === 0 || listener === undefined) {
            el[off](scrollEvent, captureScroll, false);
            delete this._collection[el];
        }

        return this;
    };

    // Defines a new instance of Scroll.
    scroll = new Scroll();

    /**
     * Adds an el with a listener to the collection.
     * @function
     * @param {HTMLElement} [el] - A given HTMLElement to add to scroll.
     * @param {Funtion} listener - A given listener to execute when the given el is scrolled.
     * @returns {scroll}
     */
    function scrolling(el, listener) {
        scroll.add(el, listener);

        return scrolling;
    }

    /**
     * Removes a HTMLElement and its listener from the collection with the given el.
     * @function
     * @param {HTMLElement} el - A given HTMLElement to remove.
     * @param {Funtion} [listener] - A given listener to remove.
     * @returns {scrolling}
     */
    scrolling.remove = function (el, listener) {
        scroll.remove(el, listener);

        return scrolling;
    };
    /**
     * Expose scrolling
     */
    // AMD suppport
    if (typeof window.define === 'function' && window.define.amd !== undefined) {
        window.define('scrolling', [], function () {
            return scrolling;
        });

    // CommonJS suppport
    } else if (typeof module !== 'undefined' && module.exports !== undefined) {
        module.exports = scrolling;

    // Default
    } else {
        window.scrolling = scrolling;
    }
}(this));

//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

(function() {
  var _global = this;

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng;

  // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
  //
  // Moderately fast, high quality
  if (typeof(require) == 'function') {
    try {
      var _rb = require('crypto').randomBytes;
      _rng = _rb && function() {return _rb(16);};
    } catch(e) {}
  }

  if (!_rng && _global.crypto && crypto.getRandomValues) {
    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
    //
    // Moderately fast, high quality
    var _rnds8 = new Uint8Array(16);
    _rng = function whatwgRNG() {
      crypto.getRandomValues(_rnds8);
      return _rnds8;
    };
  }

  if (!_rng) {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var  _rnds = new Array(16);
    _rng = function() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return _rnds;
    };
  }

  // Buffer class to use
  var BufferClass = typeof(Buffer) == 'function' ? Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = options.msecs != null ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;

  if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});
  } else if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else {
    // Publish as global (in browsers)
    var _previousRoot = _global.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _global.uuid = _previousRoot;
      return uuid;
    };

    _global.uuid = uuid;
  }
}).call(this);



/* Function's to set left bottom menu as static for IE Browser version 8 & 9 */
function isIE( version, comparison ){
    var $div = $('<div style="display:none;"/>').appendTo($('body'));
    $div.html('<!--[if '+(comparison||'')+' IE '+(version||'')+']><a>&nbsp;</a><![endif]-->');
    var ieTest = $div.find('a').length;
    $div.remove();
    return ieTest;
}


var checkDevice = false;
    var isMobile = {
    	Android: function() {
    		return navigator.userAgent.match(/Android/i);
    	},
    	BlackBerry: function() {
    		return navigator.userAgent.match(/BlackBerry/i);
    	},
    	iOS: function() {
    		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    	},
    	Opera: function() {
    		return navigator.userAgent.match(/Opera Mini/i);
    	},
    	Windows: function() {
    		return navigator.userAgent.match(/IEMobile/i);
    	},
    	any: function() {
    		return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || 			isMobile.Opera() || isMobile.Windows());
    	}
    };

	if( isMobile.any() ) {
	 	checkDevice = true;
	 	
	}
         
        
if(checkDevice) {      
         
  function doOnOrientationChange()
  {
    switch(window.orientation) 
    {  
      case -90:
      case 90:
       
        break; 
      default:
        alert('Please use landscape orientation for better experience.');
        break; 
    }
  }

	window.addEventListener('orientationchange', doOnOrientationChange);
  	// Initial execution if needed
  	doOnOrientationChange();
}


$(function() {

if(isIE(8) || isIE(9) ){  

 	$("ul.menuContainer").html('<img src="images/openup.png" alt="" id="mapid" usemap="#map" /><map name="map"><area shape="poly" id="changeDisp" onmouseover="javascript:hoverEffect(this.id);"  onmouseout="javascript:hoverOut();" coords="171, 102, 188, 137, 196, 167, 199, 200, 103, 201, 98, 175, 91, 156, 86, 151" /><area shape="poly" id="sort" onmouseover="javascript:hoverEffect(this.id);" onmouseout="javascript:hoverOut();" coords="99, 33, 122, 45, 147, 70, 169, 99, 87, 148, 73, 131, 58, 118, 50, 115" /><area shape="poly" id="search" onmouseover="javascript:hoverEffect(this.id);" onmouseout="javascript:hoverOut();" coords="3, 6, 48, 9, 79, 20, 96, 29, 48, 113, 22, 102, 1, 102" /></map>');

    if (window.PIE) {
        $('.menuBtn').each(function() {
            PIE.attach(this);
        });
        
        $('.selectBtn').each(function() {
            PIE.attach(this);
        });
        
        $('.allSelectBtn').each(function() {
            PIE.attach(this);
        });
        
        $('.nextBtn').each(function() {
            PIE.attach(this);
        });
        
        $('.prevBtn').each(function() {
            PIE.attach(this);
        });
        
        $('.conditionBox').each(function() {
            PIE.attach(this);
        });
    }
}

});

function hoverEffect(id) {
	if(id == "search") {
		$("#mapid").attr("src", "images/search_openup.png");
	} else if(id == "sort") {
		$("#mapid").attr("src", "images/sort_openup.png");
	} else {
		$("#mapid").attr("src", "images/display_openup.png");
	}
}

function hoverOut() {	
	$("#mapid").attr("src", "images/openup.png");
}

/* End : Function's to set left bottom menu as static for IE Browser version 8 & 9 */
;
//# sourceMappingURL=vendor.js.map