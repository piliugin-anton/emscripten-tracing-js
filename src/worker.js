(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var callBind = require('./');

var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'));

module.exports = function callBoundIntrinsic(name, allowMissing) {
	var intrinsic = GetIntrinsic(name, !!allowMissing);
	if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
		return callBind(intrinsic);
	}
	return intrinsic;
};

},{"./":2,"get-intrinsic":28}],2:[function(require,module,exports){
'use strict';

var bind = require('function-bind');
var GetIntrinsic = require('get-intrinsic');

var $apply = GetIntrinsic('%Function.prototype.apply%');
var $call = GetIntrinsic('%Function.prototype.call%');
var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);
var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
var $max = GetIntrinsic('%Math.max%');

if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = null;
	}
}

module.exports = function callBind(originalFunction) {
	var func = $reflectApply(bind, $call, arguments);
	if ($gOPD && $defineProperty) {
		var desc = $gOPD(func, 'length');
		if (desc.configurable) {
			// original length, plus the receiver, minus any additional arguments (after the receiver)
			$defineProperty(
				func,
				'length',
				{ value: 1 + $max(0, originalFunction.length - (arguments.length - 1)) }
			);
		}
	}
	return func;
};

var applyBind = function applyBind() {
	return $reflectApply(bind, $apply, arguments);
};

if ($defineProperty) {
	$defineProperty(module.exports, 'apply', { value: applyBind });
} else {
	module.exports.apply = applyBind;
}

},{"function-bind":27,"get-intrinsic":28}],3:[function(require,module,exports){
/* chnl v1.2.0 by Vitaliy Potapov @preserve */
"use strict";function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function _createClass(e,t,n){return t&&_defineProperties(e.prototype,t),n&&_defineProperties(e,n),e}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&_setPrototypeOf(e,t)}function _getPrototypeOf(e){return(_getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function _setPrototypeOf(e,t){return(_setPrototypeOf=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function _isNativeReflectConstruct(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch(e){return!1}}function _assertThisInitialized(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function _possibleConstructorReturn(e,t){return!t||"object"!=typeof t&&"function"!=typeof t?_assertThisInitialized(e):t}function _createSuper(r){var i=_isNativeReflectConstruct();return function(){var e,t=_getPrototypeOf(r);if(i){var n=_getPrototypeOf(this).constructor;e=Reflect.construct(t,arguments,n)}else e=t.apply(this,arguments);return _possibleConstructorReturn(this,e)}}function _toConsumableArray(e){return _arrayWithoutHoles(e)||_iterableToArray(e)||_unsupportedIterableToArray(e)||_nonIterableSpread()}function _arrayWithoutHoles(e){if(Array.isArray(e))return _arrayLikeToArray(e)}function _iterableToArray(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}function _unsupportedIterableToArray(e,t){if(e){if("string"==typeof e)return _arrayLikeToArray(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?_arrayLikeToArray(e,t):void 0}}function _arrayLikeToArray(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var Channel=function(){function c(e){_classCallCheck(this,c),this._listeners=[],this._mute=!1,this._accumulate=!1,this._accumulatedEvents=[],this._name=e||"",this._onListenerAdded=null,this._onFirstListenerAdded=null,this._onListenerRemoved=null,this._onLastListenerRemoved=null}return _createClass(c,[{key:"addListener",value:function(e,t){this._pushListener(e,t,!1)}},{key:"addOnceListener",value:function(e,t){this._pushListener(e,t,!0)}},{key:"removeListener",value:function(e,t){this._ensureListener(e);var n=this._indexOfListener(e,t);0<=n&&this._spliceListener(n)}},{key:"removeAllListeners",value:function(){for(;this.hasListeners();)this._spliceListener(0)}},{key:"hasListener",value:function(e,t){return this._ensureListener(e),0<=this._indexOfListener(e,t)}},{key:"hasListeners",value:function(){return 0<this._listeners.length}},{key:"dispatch",value:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];this._invokeListeners({args:t,async:!1})}},{key:"dispatchAsync",value:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];this._invokeListeners({args:t,async:!0})}},{key:"mute",value:function(e){var t=0<arguments.length&&void 0!==e?e:{};this._mute=!0,t.accumulate?this._accumulate=!0:(this._accumulate=!1,this._accumulatedEvents=[])}},{key:"unmute",value:function(){this._mute=!1,this._accumulate&&(this._dispatchAccumulated(),this._accumulate=!1)}},{key:"_invokeListeners",value:function(e){var t=this,n=0<arguments.length&&void 0!==e?e:{args:[],async:!1};this._mute?this._accumulate&&this._accumulatedEvents.push(n):this._listeners.slice().forEach(function(e){t._invokeListener(e,n),e.once&&t.removeListener(e.callback,e.context)})}},{key:"_invokeListener",value:function(e,t){var n,r,i=e.callback instanceof c;t.async?i?(n=e.callback).dispatchAsync.apply(n,_toConsumableArray(t.args)):setTimeout(function(){return e.callback.apply(e.context,t.args)},0):i?(r=e.callback).dispatch.apply(r,_toConsumableArray(t.args)):e.callback.apply(e.context,t.args)}},{key:"_ensureListener",value:function(e){if(!c.isValidListener(e))throw new Error("Channel "+this._name+": listener is not a function and not a Channel")}},{key:"_dispatchInnerAddEvents",value:function(){var e,t;this._onListenerAdded&&(e=this._onListenerAdded).dispatch.apply(e,arguments);this._onFirstListenerAdded&&1===this._listeners.length&&(t=this._onFirstListenerAdded).dispatch.apply(t,arguments)}},{key:"_dispatchInnerRemoveEvents",value:function(){var e,t;this._onListenerRemoved&&(e=this._onListenerRemoved).dispatch.apply(e,arguments);this._onLastListenerRemoved&&0===this._listeners.length&&(t=this._onLastListenerRemoved).dispatch.apply(t,arguments)}},{key:"_indexOfListener",value:function(e,t){for(var n=0;n<this._listeners.length;n++){var r=this._listeners[n],i=r.callback===e,s=e instanceof c,o=void 0===t&&void 0===r.context,a=t===r.context;if(i&&(s||o||a))return n}}},{key:"_dispatchAccumulated",value:function(){var t=this;this._accumulatedEvents.forEach(function(e){return t._invokeListeners(e)}),this._accumulatedEvents=[]}},{key:"_pushListener",value:function(e,t,n){this._ensureListener(e),this._checkForDuplicates(e,t),this._listeners.push({callback:e,context:t,once:n}),this._dispatchInnerAddEvents(e,t,n)}},{key:"_checkForDuplicates",value:function(e,t){if(this.hasListener(e,t))throw new Error("Channel "+this._name+": duplicating listeners")}},{key:"_spliceListener",value:function(e){var t=this._listeners[e],n=t.callback,r=t.context,i=t.once;this._listeners.splice(e,1),this._dispatchInnerRemoveEvents(n,r,i)}},{key:"onListenerAdded",get:function(){return this._onListenerAdded||(this._onListenerAdded=new c("".concat(this._name,":onListenerAdded"))),this._onListenerAdded}},{key:"onFirstListenerAdded",get:function(){return this._onFirstListenerAdded||(this._onFirstListenerAdded=new c("".concat(this._name,":onFirstListenerAdded"))),this._onFirstListenerAdded}},{key:"onListenerRemoved",get:function(){return this._onListenerRemoved||(this._onListenerRemoved=new c("".concat(this._name,":onListenerRemoved"))),this._onListenerRemoved}},{key:"onLastListenerRemoved",get:function(){return this._onLastListenerRemoved||(this._onLastListenerRemoved=new c("".concat(this._name,":onLastListenerRemoved"))),this._onLastListenerRemoved}}],[{key:"isValidListener",value:function(e){return"function"==typeof e||e instanceof c}}]),c}(),EventEmitter=function(){function e(){_classCallCheck(this,e),this._channels=new Map}return _createClass(e,[{key:"addListener",value:function(e,t,n){this._getChannel(e).addListener(t,n)}},{key:"on",value:function(e,t,n){this.addListener(e,t,n)}},{key:"addOnceListener",value:function(e,t,n){this._getChannel(e).addOnceListener(t,n)}},{key:"once",value:function(e,t,n){this.addOnceListener(e,t,n)}},{key:"removeListener",value:function(e,t,n){this._getChannel(e).removeListener(t,n)}},{key:"off",value:function(e,t,n){this.removeListener(e,t,n)}},{key:"hasListener",value:function(e,t,n){return this._getChannel(e).hasListener(t,n)}},{key:"has",value:function(e,t,n){return this.hasListener(e,t,n)}},{key:"hasListeners",value:function(e){return this._getChannel(e).hasListeners()}},{key:"dispatch",value:function(e){for(var t,n=arguments.length,r=new Array(1<n?n-1:0),i=1;i<n;i++)r[i-1]=arguments[i];(t=this._getChannel(e)).dispatch.apply(t,r)}},{key:"emit",value:function(e){for(var t=arguments.length,n=new Array(1<t?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];this.dispatch.apply(this,[e].concat(n))}},{key:"_getChannel",value:function(e){return this._channels.has(e)||this._channels.set(e,new Channel(e)),this._channels.get(e)}}]),e}(),SubscriptionItem=function(){function t(e){_classCallCheck(this,t),this._params=e,this._isOn=!1,this._assertParams()}return _createClass(t,[{key:"on",value:function(){if(!this._isOn){var e=this._params.channel,t=e.addListener||e.addEventListener||e.on;this._applyMethod(t),this._isOn=!0}}},{key:"off",value:function(){if(this._isOn){var e=this._params.channel,t=e.removeListener||e.removeEventListener||e.off;this._applyMethod(t),this._isOn=!1}}},{key:"_applyMethod",value:function(e){var t=this._params,n=t.channel,r=t.event,i=t.listener,s=r?[r,i]:[i];e.apply(n,s)}},{key:"_assertParams",value:function(){var e=this._params,t=e.channel,n=e.event,r=e.listener;if(!t||"object"!==_typeof(t))throw new Error("Channel should be object");if(n&&"string"!=typeof n)throw new Error("Event should be string");if(!r||!Channel.isValidListener(r))throw new Error("Listener should be function or Channel")}}]),t}(),Subscription=function(){function t(e){_classCallCheck(this,t),this._items=e.map(function(e){return new SubscriptionItem(e)})}return _createClass(t,[{key:"on",value:function(){return this._items.forEach(function(e){return e.on()}),this}},{key:"off",value:function(){return this._items.forEach(function(e){return e.off()}),this}}]),t}(),ReactSubscription=function(){_inherits(i,Subscription);var r=_createSuper(i);function i(e,t){var n;return _classCallCheck(this,i),(n=r.call(this,t))._overrideComponentCallback(e,"componentDidMount","on"),n._overrideComponentCallback(e,"componentWillUnmount","off"),n}return _createClass(i,[{key:"_overrideComponentCallback",value:function(r,e,i){var s=this,o=r[e];r[e]=function(){if(s[i](),"function"==typeof o){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return o.apply(r,t)}}}}]),i}(),chnl=Channel;chnl.EventEmitter=EventEmitter,chnl.Subscription=Subscription,chnl.ReactSubscription=ReactSubscription,module.exports=chnl;

},{}],4:[function(require,module,exports){
'use strict';

var keys = require('object-keys');
var hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

var toStr = Object.prototype.toString;
var concat = Array.prototype.concat;
var origDefineProperty = Object.defineProperty;

var isFunction = function (fn) {
	return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
};

var hasPropertyDescriptors = require('has-property-descriptors')();

var supportsDescriptors = origDefineProperty && hasPropertyDescriptors;

var defineProperty = function (object, name, value, predicate) {
	if (name in object && (!isFunction(predicate) || !predicate())) {
		return;
	}
	if (supportsDescriptors) {
		origDefineProperty(object, name, {
			configurable: true,
			enumerable: false,
			value: value,
			writable: true
		});
	} else {
		object[name] = value; // eslint-disable-line no-param-reassign
	}
};

var defineProperties = function (object, map) {
	var predicates = arguments.length > 2 ? arguments[2] : {};
	var props = keys(map);
	if (hasSymbols) {
		props = concat.call(props, Object.getOwnPropertySymbols(map));
	}
	for (var i = 0; i < props.length; i += 1) {
		defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
	}
};

defineProperties.supportsDescriptors = !!supportsDescriptors;

module.exports = defineProperties;

},{"has-property-descriptors":29,"object-keys":35}],5:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');

var isPropertyDescriptor = require('../helpers/isPropertyDescriptor');
var DefineOwnProperty = require('../helpers/DefineOwnProperty');

var FromPropertyDescriptor = require('./FromPropertyDescriptor');
var IsAccessorDescriptor = require('./IsAccessorDescriptor');
var IsDataDescriptor = require('./IsDataDescriptor');
var IsPropertyKey = require('./IsPropertyKey');
var SameValue = require('./SameValue');
var ToPropertyDescriptor = require('./ToPropertyDescriptor');
var Type = require('./Type');

// https://ecma-international.org/ecma-262/6.0/#sec-definepropertyorthrow

module.exports = function DefinePropertyOrThrow(O, P, desc) {
	if (Type(O) !== 'Object') {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}

	if (!IsPropertyKey(P)) {
		throw new $TypeError('Assertion failed: IsPropertyKey(P) is not true');
	}

	var Desc = isPropertyDescriptor({
		Type: Type,
		IsDataDescriptor: IsDataDescriptor,
		IsAccessorDescriptor: IsAccessorDescriptor
	}, desc) ? desc : ToPropertyDescriptor(desc);
	if (!isPropertyDescriptor({
		Type: Type,
		IsDataDescriptor: IsDataDescriptor,
		IsAccessorDescriptor: IsAccessorDescriptor
	}, Desc)) {
		throw new $TypeError('Assertion failed: Desc is not a valid Property Descriptor');
	}

	return DefineOwnProperty(
		IsDataDescriptor,
		SameValue,
		FromPropertyDescriptor,
		O,
		P,
		Desc
	);
};

},{"../helpers/DefineOwnProperty":19,"../helpers/isPropertyDescriptor":25,"./FromPropertyDescriptor":6,"./IsAccessorDescriptor":7,"./IsDataDescriptor":10,"./IsPropertyKey":11,"./SameValue":12,"./ToPropertyDescriptor":15,"./Type":16,"get-intrinsic":28}],6:[function(require,module,exports){
'use strict';

var assertRecord = require('../helpers/assertRecord');
var fromPropertyDescriptor = require('../helpers/fromPropertyDescriptor');

var Type = require('./Type');

// https://ecma-international.org/ecma-262/6.0/#sec-frompropertydescriptor

module.exports = function FromPropertyDescriptor(Desc) {
	if (typeof Desc !== 'undefined') {
		assertRecord(Type, 'Property Descriptor', 'Desc', Desc);
	}

	return fromPropertyDescriptor(Desc);
};

},{"../helpers/assertRecord":21,"../helpers/fromPropertyDescriptor":22,"./Type":16}],7:[function(require,module,exports){
'use strict';

var has = require('has');

var assertRecord = require('../helpers/assertRecord');

var Type = require('./Type');

// https://ecma-international.org/ecma-262/6.0/#sec-isaccessordescriptor

module.exports = function IsAccessorDescriptor(Desc) {
	if (typeof Desc === 'undefined') {
		return false;
	}

	assertRecord(Type, 'Property Descriptor', 'Desc', Desc);

	if (!has(Desc, '[[Get]]') && !has(Desc, '[[Set]]')) {
		return false;
	}

	return true;
};

},{"../helpers/assertRecord":21,"./Type":16,"has":32}],8:[function(require,module,exports){
'use strict';

// http://262.ecma-international.org/5.1/#sec-9.11

module.exports = require('is-callable');

},{"is-callable":33}],9:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('../GetIntrinsic.js');

var $construct = GetIntrinsic('%Reflect.construct%', true);

var DefinePropertyOrThrow = require('./DefinePropertyOrThrow');
try {
	DefinePropertyOrThrow({}, '', { '[[Get]]': function () {} });
} catch (e) {
	// Accessor properties aren't supported
	DefinePropertyOrThrow = null;
}

// https://ecma-international.org/ecma-262/6.0/#sec-isconstructor

if (DefinePropertyOrThrow && $construct) {
	var isConstructorMarker = {};
	var badArrayLike = {};
	DefinePropertyOrThrow(badArrayLike, 'length', {
		'[[Get]]': function () {
			throw isConstructorMarker;
		},
		'[[Enumerable]]': true
	});

	module.exports = function IsConstructor(argument) {
		try {
			// `Reflect.construct` invokes `IsConstructor(target)` before `Get(args, 'length')`:
			$construct(argument, badArrayLike);
		} catch (err) {
			return err === isConstructorMarker;
		}
	};
} else {
	module.exports = function IsConstructor(argument) {
		// unfortunately there's no way to truly check this without try/catch `new argument` in old environments
		return typeof argument === 'function' && !!argument.prototype;
	};
}

},{"../GetIntrinsic.js":18,"./DefinePropertyOrThrow":5}],10:[function(require,module,exports){
'use strict';

var has = require('has');

var assertRecord = require('../helpers/assertRecord');

var Type = require('./Type');

// https://ecma-international.org/ecma-262/6.0/#sec-isdatadescriptor

module.exports = function IsDataDescriptor(Desc) {
	if (typeof Desc === 'undefined') {
		return false;
	}

	assertRecord(Type, 'Property Descriptor', 'Desc', Desc);

	if (!has(Desc, '[[Value]]') && !has(Desc, '[[Writable]]')) {
		return false;
	}

	return true;
};

},{"../helpers/assertRecord":21,"./Type":16,"has":32}],11:[function(require,module,exports){
'use strict';

// https://ecma-international.org/ecma-262/6.0/#sec-ispropertykey

module.exports = function IsPropertyKey(argument) {
	return typeof argument === 'string' || typeof argument === 'symbol';
};

},{}],12:[function(require,module,exports){
'use strict';

var $isNaN = require('../helpers/isNaN');

// http://262.ecma-international.org/5.1/#sec-9.12

module.exports = function SameValue(x, y) {
	if (x === y) { // 0 === -0, but they are not identical.
		if (x === 0) { return 1 / x === 1 / y; }
		return true;
	}
	return $isNaN(x) && $isNaN(y);
};

},{"../helpers/isNaN":24}],13:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $species = GetIntrinsic('%Symbol.species%', true);
var $TypeError = GetIntrinsic('%TypeError%');

var IsConstructor = require('./IsConstructor');
var Type = require('./Type');

// https://ecma-international.org/ecma-262/6.0/#sec-speciesconstructor

module.exports = function SpeciesConstructor(O, defaultConstructor) {
	if (Type(O) !== 'Object') {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}
	var C = O.constructor;
	if (typeof C === 'undefined') {
		return defaultConstructor;
	}
	if (Type(C) !== 'Object') {
		throw new $TypeError('O.constructor is not an Object');
	}
	var S = $species ? C[$species] : void 0;
	if (S == null) {
		return defaultConstructor;
	}
	if (IsConstructor(S)) {
		return S;
	}
	throw new $TypeError('no constructor found');
};

},{"./IsConstructor":9,"./Type":16,"get-intrinsic":28}],14:[function(require,module,exports){
'use strict';

// http://262.ecma-international.org/5.1/#sec-9.2

module.exports = function ToBoolean(value) { return !!value; };

},{}],15:[function(require,module,exports){
'use strict';

var has = require('has');

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');

var Type = require('./Type');
var ToBoolean = require('./ToBoolean');
var IsCallable = require('./IsCallable');

// https://262.ecma-international.org/5.1/#sec-8.10.5

module.exports = function ToPropertyDescriptor(Obj) {
	if (Type(Obj) !== 'Object') {
		throw new $TypeError('ToPropertyDescriptor requires an object');
	}

	var desc = {};
	if (has(Obj, 'enumerable')) {
		desc['[[Enumerable]]'] = ToBoolean(Obj.enumerable);
	}
	if (has(Obj, 'configurable')) {
		desc['[[Configurable]]'] = ToBoolean(Obj.configurable);
	}
	if (has(Obj, 'value')) {
		desc['[[Value]]'] = Obj.value;
	}
	if (has(Obj, 'writable')) {
		desc['[[Writable]]'] = ToBoolean(Obj.writable);
	}
	if (has(Obj, 'get')) {
		var getter = Obj.get;
		if (typeof getter !== 'undefined' && !IsCallable(getter)) {
			throw new $TypeError('getter must be a function');
		}
		desc['[[Get]]'] = getter;
	}
	if (has(Obj, 'set')) {
		var setter = Obj.set;
		if (typeof setter !== 'undefined' && !IsCallable(setter)) {
			throw new $TypeError('setter must be a function');
		}
		desc['[[Set]]'] = setter;
	}

	if ((has(desc, '[[Get]]') || has(desc, '[[Set]]')) && (has(desc, '[[Value]]') || has(desc, '[[Writable]]'))) {
		throw new $TypeError('Invalid property descriptor. Cannot both specify accessors and a value or writable attribute');
	}
	return desc;
};

},{"./IsCallable":8,"./ToBoolean":14,"./Type":16,"get-intrinsic":28,"has":32}],16:[function(require,module,exports){
'use strict';

var ES5Type = require('../5/Type');

// https://262.ecma-international.org/11.0/#sec-ecmascript-data-types-and-values

module.exports = function Type(x) {
	if (typeof x === 'symbol') {
		return 'Symbol';
	}
	if (typeof x === 'bigint') {
		return 'BigInt';
	}
	return ES5Type(x);
};

},{"../5/Type":17}],17:[function(require,module,exports){
'use strict';

// https://262.ecma-international.org/5.1/#sec-8

module.exports = function Type(x) {
	if (x === null) {
		return 'Null';
	}
	if (typeof x === 'undefined') {
		return 'Undefined';
	}
	if (typeof x === 'function' || typeof x === 'object') {
		return 'Object';
	}
	if (typeof x === 'number') {
		return 'Number';
	}
	if (typeof x === 'boolean') {
		return 'Boolean';
	}
	if (typeof x === 'string') {
		return 'String';
	}
};

},{}],18:[function(require,module,exports){
'use strict';

// TODO: remove, semver-major

module.exports = require('get-intrinsic');

},{"get-intrinsic":28}],19:[function(require,module,exports){
'use strict';

var hasPropertyDescriptors = require('has-property-descriptors');

var GetIntrinsic = require('get-intrinsic');

var $defineProperty = hasPropertyDescriptors() && GetIntrinsic('%Object.defineProperty%', true);

var hasArrayLengthDefineBug = hasPropertyDescriptors.hasArrayLengthDefineBug();

// eslint-disable-next-line global-require
var isArray = hasArrayLengthDefineBug && require('../helpers/IsArray');

var callBound = require('call-bind/callBound');

var $isEnumerable = callBound('Object.prototype.propertyIsEnumerable');

// eslint-disable-next-line max-params
module.exports = function DefineOwnProperty(IsDataDescriptor, SameValue, FromPropertyDescriptor, O, P, desc) {
	if (!$defineProperty) {
		if (!IsDataDescriptor(desc)) {
			// ES3 does not support getters/setters
			return false;
		}
		if (!desc['[[Configurable]]'] || !desc['[[Writable]]']) {
			return false;
		}

		// fallback for ES3
		if (P in O && $isEnumerable(O, P) !== !!desc['[[Enumerable]]']) {
			// a non-enumerable existing property
			return false;
		}

		// property does not exist at all, or exists but is enumerable
		var V = desc['[[Value]]'];
		// eslint-disable-next-line no-param-reassign
		O[P] = V; // will use [[Define]]
		return SameValue(O[P], V);
	}
	if (
		hasArrayLengthDefineBug
		&& P === 'length'
		&& '[[Value]]' in desc
		&& isArray(O)
		&& O.length !== desc['[[Value]]']
	) {
		// eslint-disable-next-line no-param-reassign
		O.length = desc['[[Value]]'];
		return O.length === desc['[[Value]]'];
	}

	$defineProperty(O, P, FromPropertyDescriptor(desc));
	return true;
};

},{"../helpers/IsArray":20,"call-bind/callBound":1,"get-intrinsic":28,"has-property-descriptors":29}],20:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $Array = GetIntrinsic('%Array%');

// eslint-disable-next-line global-require
var toStr = !$Array.isArray && require('call-bind/callBound')('Object.prototype.toString');

module.exports = $Array.isArray || function IsArray(argument) {
	return toStr(argument) === '[object Array]';
};

},{"call-bind/callBound":1,"get-intrinsic":28}],21:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');
var $SyntaxError = GetIntrinsic('%SyntaxError%');

var has = require('has');

var isMatchRecord = require('./isMatchRecord');

var predicates = {
	// https://262.ecma-international.org/6.0/#sec-property-descriptor-specification-type
	'Property Descriptor': function isPropertyDescriptor(Desc) {
		var allowed = {
			'[[Configurable]]': true,
			'[[Enumerable]]': true,
			'[[Get]]': true,
			'[[Set]]': true,
			'[[Value]]': true,
			'[[Writable]]': true
		};

		for (var key in Desc) { // eslint-disable-line
			if (has(Desc, key) && !allowed[key]) {
				return false;
			}
		}

		var isData = has(Desc, '[[Value]]');
		var IsAccessor = has(Desc, '[[Get]]') || has(Desc, '[[Set]]');
		if (isData && IsAccessor) {
			throw new $TypeError('Property Descriptors may not be both accessor and data descriptors');
		}
		return true;
	},
	// https://262.ecma-international.org/13.0/#sec-match-records
	'Match Record': isMatchRecord
};

module.exports = function assertRecord(Type, recordType, argumentName, value) {
	var predicate = predicates[recordType];
	if (typeof predicate !== 'function') {
		throw new $SyntaxError('unknown record type: ' + recordType);
	}
	if (Type(value) !== 'Object' || !predicate(value)) {
		throw new $TypeError(argumentName + ' must be a ' + recordType);
	}
};

},{"./isMatchRecord":23,"get-intrinsic":28,"has":32}],22:[function(require,module,exports){
'use strict';

module.exports = function fromPropertyDescriptor(Desc) {
	if (typeof Desc === 'undefined') {
		return Desc;
	}
	var obj = {};
	if ('[[Value]]' in Desc) {
		obj.value = Desc['[[Value]]'];
	}
	if ('[[Writable]]' in Desc) {
		obj.writable = !!Desc['[[Writable]]'];
	}
	if ('[[Get]]' in Desc) {
		obj.get = Desc['[[Get]]'];
	}
	if ('[[Set]]' in Desc) {
		obj.set = Desc['[[Set]]'];
	}
	if ('[[Enumerable]]' in Desc) {
		obj.enumerable = !!Desc['[[Enumerable]]'];
	}
	if ('[[Configurable]]' in Desc) {
		obj.configurable = !!Desc['[[Configurable]]'];
	}
	return obj;
};

},{}],23:[function(require,module,exports){
'use strict';

var has = require('has');

// https://262.ecma-international.org/13.0/#sec-match-records

module.exports = function isMatchRecord(record) {
	return (
		has(record, '[[StartIndex]]')
        && has(record, '[[EndIndex]]')
        && record['[[StartIndex]]'] >= 0
        && record['[[EndIndex]]'] >= record['[[StartIndex]]']
        && String(parseInt(record['[[StartIndex]]'], 10)) === String(record['[[StartIndex]]'])
        && String(parseInt(record['[[EndIndex]]'], 10)) === String(record['[[EndIndex]]'])
	);
};

},{"has":32}],24:[function(require,module,exports){
'use strict';

module.exports = Number.isNaN || function isNaN(a) {
	return a !== a;
};

},{}],25:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var has = require('has');
var $TypeError = GetIntrinsic('%TypeError%');

module.exports = function IsPropertyDescriptor(ES, Desc) {
	if (ES.Type(Desc) !== 'Object') {
		return false;
	}
	var allowed = {
		'[[Configurable]]': true,
		'[[Enumerable]]': true,
		'[[Get]]': true,
		'[[Set]]': true,
		'[[Value]]': true,
		'[[Writable]]': true
	};

	for (var key in Desc) { // eslint-disable-line no-restricted-syntax
		if (has(Desc, key) && !allowed[key]) {
			return false;
		}
	}

	if (ES.IsDataDescriptor(Desc) && ES.IsAccessorDescriptor(Desc)) {
		throw new $TypeError('Property Descriptors may not be both accessor and data descriptors');
	}
	return true;
};

},{"get-intrinsic":28,"has":32}],26:[function(require,module,exports){
'use strict';

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],27:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":26}],28:[function(require,module,exports){
'use strict';

var undefined;

var $SyntaxError = SyntaxError;
var $Function = Function;
var $TypeError = TypeError;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function (expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD = Object.getOwnPropertyDescriptor;
if ($gOPD) {
	try {
		$gOPD({}, '');
	} catch (e) {
		$gOPD = null; // this is IE 8, which has a broken gOPD
	}
}

var throwTypeError = function () {
	throw new $TypeError();
};
var ThrowTypeError = $gOPD
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols = require('has-symbols')();

var getProto = Object.getPrototypeOf || function (x) { return x.__proto__; }; // eslint-disable-line no-proto

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' ? undefined : getProto(Uint8Array);

var INTRINSICS = {
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols ? getProto([][Symbol.iterator]()) : undefined,
	'%AsyncFromSyncIteratorPrototype%': undefined,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': EvalError,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols ? getProto(getProto([][Symbol.iterator]())) : undefined,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined,
	'%Map%': typeof Map === 'undefined' ? undefined : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols ? undefined : getProto(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': Object,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
	'%RangeError%': RangeError,
	'%ReferenceError%': ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols ? undefined : getProto(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols ? getProto(''[Symbol.iterator]()) : undefined,
	'%Symbol%': hasSymbols ? Symbol : undefined,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
	'%URIError%': URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet
};

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen) {
			value = getProto(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = require('function-bind');
var hasOwn = require('has');
var $concat = bind.call(Function.call, Array.prototype.concat);
var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
var $replace = bind.call(Function.call, String.prototype.replace);
var $strSlice = bind.call(Function.call, String.prototype.slice);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

module.exports = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}

	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if (
			(
				(first === '"' || first === "'" || first === '`')
				|| (last === '"' || last === "'" || last === '`')
			)
			&& first !== last
		) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void undefined;
			}
			if ($gOPD && (i + 1) >= parts.length) {
				var desc = $gOPD(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};

},{"function-bind":27,"has":32,"has-symbols":30}],29:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);

var hasPropertyDescriptors = function hasPropertyDescriptors() {
	if ($defineProperty) {
		try {
			$defineProperty({}, 'a', { value: 1 });
			return true;
		} catch (e) {
			// IE 8 has a broken defineProperty
			return false;
		}
	}
	return false;
};

hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
	// node v0.6 has a bug where array lengths can be Set but not Defined
	if (!hasPropertyDescriptors()) {
		return null;
	}
	try {
		return $defineProperty([], 'length', { value: 1 }).length !== 1;
	} catch (e) {
		// In Firefox 4-22, defining length on an array throws an exception.
		return true;
	}
};

module.exports = hasPropertyDescriptors;

},{"get-intrinsic":28}],30:[function(require,module,exports){
'use strict';

var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = require('./shams');

module.exports = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') { return false; }
	if (typeof Symbol !== 'function') { return false; }
	if (typeof origSymbol('foo') !== 'symbol') { return false; }
	if (typeof Symbol('bar') !== 'symbol') { return false; }

	return hasSymbolSham();
};

},{"./shams":31}],31:[function(require,module,exports){
'use strict';

/* eslint complexity: [2, 18], max-statements: [2, 33] */
module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};

},{}],32:[function(require,module,exports){
'use strict';

var bind = require('function-bind');

module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);

},{"function-bind":27}],33:[function(require,module,exports){
'use strict';

var fnToStr = Function.prototype.toString;
var reflectApply = typeof Reflect === 'object' && Reflect !== null && Reflect.apply;
var badArrayLike;
var isCallableMarker;
if (typeof reflectApply === 'function' && typeof Object.defineProperty === 'function') {
	try {
		badArrayLike = Object.defineProperty({}, 'length', {
			get: function () {
				throw isCallableMarker;
			}
		});
		isCallableMarker = {};
		// eslint-disable-next-line no-throw-literal
		reflectApply(function () { throw 42; }, null, badArrayLike);
	} catch (_) {
		if (_ !== isCallableMarker) {
			reflectApply = null;
		}
	}
} else {
	reflectApply = null;
}

var constructorRegex = /^\s*class\b/;
var isES6ClassFn = function isES6ClassFunction(value) {
	try {
		var fnStr = fnToStr.call(value);
		return constructorRegex.test(fnStr);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject = function tryFunctionToStr(value) {
	try {
		if (isES6ClassFn(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var hasToStringTag = typeof Symbol === 'function' && !!Symbol.toStringTag; // better: use `has-tostringtag`
/* globals document: false */
var documentDotAll = typeof document === 'object' && typeof document.all === 'undefined' && document.all !== undefined ? document.all : {};

module.exports = reflectApply
	? function isCallable(value) {
		if (value === documentDotAll) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		if (typeof value === 'function' && !value.prototype) { return true; }
		try {
			reflectApply(value, null, badArrayLike);
		} catch (e) {
			if (e !== isCallableMarker) { return false; }
		}
		return !isES6ClassFn(value);
	}
	: function isCallable(value) {
		if (value === documentDotAll) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		if (typeof value === 'function' && !value.prototype) { return true; }
		if (hasToStringTag) { return tryFunctionObject(value); }
		if (isES6ClassFn(value)) { return false; }
		var strClass = toStr.call(value);
		return strClass === fnClass || strClass === genClass;
	};

},{}],34:[function(require,module,exports){
'use strict';

var keysShim;
if (!Object.keys) {
	// modified from https://github.com/es-shims/es5-shim
	var has = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;
	var isArgs = require('./isArguments'); // eslint-disable-line global-require
	var isEnumerable = Object.prototype.propertyIsEnumerable;
	var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
	var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
	var dontEnums = [
		'toString',
		'toLocaleString',
		'valueOf',
		'hasOwnProperty',
		'isPrototypeOf',
		'propertyIsEnumerable',
		'constructor'
	];
	var equalsConstructorPrototype = function (o) {
		var ctor = o.constructor;
		return ctor && ctor.prototype === o;
	};
	var excludedKeys = {
		$applicationCache: true,
		$console: true,
		$external: true,
		$frame: true,
		$frameElement: true,
		$frames: true,
		$innerHeight: true,
		$innerWidth: true,
		$onmozfullscreenchange: true,
		$onmozfullscreenerror: true,
		$outerHeight: true,
		$outerWidth: true,
		$pageXOffset: true,
		$pageYOffset: true,
		$parent: true,
		$scrollLeft: true,
		$scrollTop: true,
		$scrollX: true,
		$scrollY: true,
		$self: true,
		$webkitIndexedDB: true,
		$webkitStorageInfo: true,
		$window: true
	};
	var hasAutomationEqualityBug = (function () {
		/* global window */
		if (typeof window === 'undefined') { return false; }
		for (var k in window) {
			try {
				if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
					try {
						equalsConstructorPrototype(window[k]);
					} catch (e) {
						return true;
					}
				}
			} catch (e) {
				return true;
			}
		}
		return false;
	}());
	var equalsConstructorPrototypeIfNotBuggy = function (o) {
		/* global window */
		if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
			return equalsConstructorPrototype(o);
		}
		try {
			return equalsConstructorPrototype(o);
		} catch (e) {
			return false;
		}
	};

	keysShim = function keys(object) {
		var isObject = object !== null && typeof object === 'object';
		var isFunction = toStr.call(object) === '[object Function]';
		var isArguments = isArgs(object);
		var isString = isObject && toStr.call(object) === '[object String]';
		var theKeys = [];

		if (!isObject && !isFunction && !isArguments) {
			throw new TypeError('Object.keys called on a non-object');
		}

		var skipProto = hasProtoEnumBug && isFunction;
		if (isString && object.length > 0 && !has.call(object, 0)) {
			for (var i = 0; i < object.length; ++i) {
				theKeys.push(String(i));
			}
		}

		if (isArguments && object.length > 0) {
			for (var j = 0; j < object.length; ++j) {
				theKeys.push(String(j));
			}
		} else {
			for (var name in object) {
				if (!(skipProto && name === 'prototype') && has.call(object, name)) {
					theKeys.push(String(name));
				}
			}
		}

		if (hasDontEnumBug) {
			var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

			for (var k = 0; k < dontEnums.length; ++k) {
				if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
					theKeys.push(dontEnums[k]);
				}
			}
		}
		return theKeys;
	};
}
module.exports = keysShim;

},{"./isArguments":36}],35:[function(require,module,exports){
'use strict';

var slice = Array.prototype.slice;
var isArgs = require('./isArguments');

var origKeys = Object.keys;
var keysShim = origKeys ? function keys(o) { return origKeys(o); } : require('./implementation');

var originalKeys = Object.keys;

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			var args = Object.keys(arguments);
			return args && args.length === arguments.length;
		}(1, 2));
		if (!keysWorksWithArguments) {
			Object.keys = function keys(object) { // eslint-disable-line func-name-matching
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				}
				return originalKeys(object);
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;

},{"./implementation":34,"./isArguments":36}],36:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

},{}],37:[function(require,module,exports){
/**
 * @typedef {Object} Options
 *
 * @property {Number} [timeout=0] - Timeout in ms after that promise will be rejected automatically.
 * @property {String|Function} [timeoutReason] - Rejection reason for timeout.
 * Promise will be rejected with {@link PromiseController.TimeoutError} and this message. The message can contain
 * placeholder `{timeout}` for actual timeout value. If timeoutReason is a function,
 * it will be evaluated and returned value will be used as message.
 * @property {String|Function} [resetReason] - Rejection reason used when `.reset()` is called while promise is pending.
 * Promise will be rejected with {@link PromiseController.ResetError} and this message. If resetReason is a function,
 * it will be evaluated and returned value will be used as message.
 */

module.exports = {
  timeout: 0,
  timeoutReason: 'Promise rejected by PromiseController timeout {timeout} ms.',
  resetReason: 'Promise rejected by PromiseController reset.',
};

},{}],38:[function(require,module,exports){
/**
 * @ignore
 */
const defaults = require('./defaults');
const {isPromise, createErrorType, tryCall} = require('./utils');

/**
 * @typicalname pc
 */
class PromiseController {
  /**
   * Creates promise controller. Unlike original Promise, it does not immediately call any function.
   * Instead it has [.call()](#PromiseController+call) method that calls provided function
   * and stores `resolve / reject` methods for future access.
   *
   * @param {Options} [options]
   */
  constructor(options) {
    this._options = Object.assign({}, defaults, options);
    this._resolve = null;
    this._reject = null;
    this._isPending = false;
    this._isFulfilled = false;
    this._isRejected = false;
    this._value = undefined;
    this._promise = null;
    this._timer = null;
  }

  /**
   * Returns promise itself.
   *
   * @returns {Promise}
   */
  get promise() {
    return this._promise;
  }

  /**
   * Returns value with that promise was settled (fulfilled or rejected).
   *
   * @returns {*}
   */
  get value() {
    return this._value;
  }

  /**
   * Returns true if promise is pending.
   *
   * @returns {Boolean}
   */
  get isPending() {
    return this._isPending;
  }

  /**
   * Returns true if promise is fulfilled.
   *
   * @returns {Boolean}
   */
  get isFulfilled() {
    return this._isFulfilled;
  }

  /**
   * Returns true if promise rejected.
   *
   * @returns {Boolean}
   */
  get isRejected() {
    return this._isRejected;
  }

  /**
   * Returns true if promise is fulfilled or rejected.
   *
   * @returns {Boolean}
   */
  get isSettled() {
    return this._isFulfilled || this._isRejected;
  }

  /**
   * Calls `fn` and returns promise OR just returns existing promise from previous `call()` if it is still pending.
   * To fulfill returned promise you should use
   * {@link PromiseController#resolve} / {@link PromiseController#reject} methods.
   * If `fn` itself returns promise, then external promise is attached to it and fulfills together.
   * If no `fn` passed - promiseController is initialized as well.
   *
   * @param {Function} [fn] function to be called.
   * @returns {Promise}
   */
  call(fn) {
    if (!this._isPending) {
      this.reset();
      this._createPromise();
      this._createTimer();
      this._callFn(fn);
    }
    return this._promise;
  }

  /**
   * Resolves pending promise with specified `value`.
   *
   * @param {*} [value]
   */
  resolve(value) {
    if (this._isPending) {
      if (isPromise(value)) {
        this._tryAttachToPromise(value);
      } else {
        this._settle(value);
        this._isFulfilled = true;
        this._resolve(value);
      }
    }
  }

  /**
   * Rejects pending promise with specified `value`.
   *
   * @param {*} [value]
   */
  reject(value) {
    if (this._isPending) {
      this._settle(value);
      this._isRejected = true;
      this._reject(value);
    }
  }

  /**
   * Resets to initial state.
   * If promise is pending it will be rejected with {@link PromiseController.ResetError}.
   */
  reset() {
    if (this._isPending) {
      const message = tryCall(this._options.resetReason);
      const error = new PromiseController.ResetError(message);
      this.reject(error);
    }
    this._promise = null;
    this._isPending = false;
    this._isFulfilled = false;
    this._isRejected = false;
    this._value = undefined;
    this._clearTimer();
  }

  /**
   * Re-assign one or more options.
   *
   * @param {Options} options
   */
  configure(options) {
    Object.assign(this._options, options);
  }

  _createPromise() {
    this._promise = new Promise((resolve, reject) => {
      this._isPending = true;
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  _handleTimeout() {
    const messageTpl = tryCall(this._options.timeoutReason);
    const message = typeof messageTpl === 'string' ? messageTpl.replace('{timeout}', this._options.timeout) : '';
    const error = new PromiseController.TimeoutError(message);
    this.reject(error);
  }

  _createTimer() {
    if (this._options.timeout) {
      this._timer = setTimeout(() => this._handleTimeout(), this._options.timeout);
    }
  }

  _clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  _settle(value) {
    this._isPending = false;
    this._value = value;
    this._clearTimer();
  }

  _callFn(fn) {
    if (typeof fn === 'function') {
      try {
        const result = fn();
        this._tryAttachToPromise(result);
      } catch (e) {
        this.reject(e);
      }
    }
  }

  _tryAttachToPromise(p) {
    if (isPromise(p)) {
      p.then(value => this.resolve(value), e => this.reject(e));
    }
  }
}

/**
 * Error for rejection in case of timeout.
 * @type {PromiseController.TimeoutError}
 */
PromiseController.TimeoutError = createErrorType('TimeoutError');

/**
 * Error for rejection in case of call `.reset()` while promise is pending.
 * @type {PromiseController.ResetError}
 */
PromiseController.ResetError = createErrorType('ResetError');

module.exports = PromiseController;

},{"./defaults":37,"./utils":39}],39:[function(require,module,exports){

/**
 * Simple check for Promise.
 * @param {*} p
 * @returns {Boolean}
 * @ignore
 */
exports.isPromise = function (p) {
  return p && typeof p.then === 'function';
};

/**
 * Calls argument if it is function
 * @param {*} value
 * @returns {*}
 * @ignore
 */
exports.tryCall = function (value) {
  return typeof value === 'function' ? value() : value;
};

/**
 * Just `class MyError extends Error` does not work with transpiler.
 * See: https://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
 * @ignore
 */
exports.createErrorType = function (name) {
  function E(message) {
    if (!Error.captureStackTrace) {
      this.stack = (new Error()).stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
    this.message = message;
  }
  E.prototype = new Error();
  E.prototype.name = name;
  E.prototype.constructor = E;
  return E;
};

},{}],40:[function(require,module,exports){
'use strict';

var requirePromise = require('./requirePromise');

requirePromise();

var IsCallable = require('es-abstract/2021/IsCallable');
var SpeciesConstructor = require('es-abstract/2021/SpeciesConstructor');
var Type = require('es-abstract/2021/Type');

var promiseResolve = function PromiseResolve(C, value) {
	return new C(function (resolve) {
		resolve(value);
	});
};

var OriginalPromise = Promise;

var createThenFinally = function CreateThenFinally(C, onFinally) {
	return function (value) {
		var result = onFinally();
		var promise = promiseResolve(C, result);
		var valueThunk = function () {
			return value;
		};
		return promise.then(valueThunk);
	};
};

var createCatchFinally = function CreateCatchFinally(C, onFinally) {
	return function (reason) {
		var result = onFinally();
		var promise = promiseResolve(C, result);
		var thrower = function () {
			throw reason;
		};
		return promise.then(thrower);
	};
};

var promiseFinally = function finally_(onFinally) {
	/* eslint no-invalid-this: 0 */

	var promise = this;

	if (Type(promise) !== 'Object') {
		throw new TypeError('receiver is not an Object');
	}

	var C = SpeciesConstructor(promise, OriginalPromise); // may throw

	var thenFinally = onFinally;
	var catchFinally = onFinally;
	if (IsCallable(onFinally)) {
		thenFinally = createThenFinally(C, onFinally);
		catchFinally = createCatchFinally(C, onFinally);
	}

	return promise.then(thenFinally, catchFinally);
};

if (Object.getOwnPropertyDescriptor) {
	var descriptor = Object.getOwnPropertyDescriptor(promiseFinally, 'name');
	if (descriptor && descriptor.configurable) {
		Object.defineProperty(promiseFinally, 'name', { configurable: true, value: 'finally' });
	}
}

module.exports = promiseFinally;

},{"./requirePromise":43,"es-abstract/2021/IsCallable":8,"es-abstract/2021/SpeciesConstructor":13,"es-abstract/2021/Type":16}],41:[function(require,module,exports){
'use strict';

var callBind = require('call-bind');
var define = require('define-properties');

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var shim = require('./shim');

var bound = callBind(getPolyfill());

define(bound, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = bound;

},{"./implementation":40,"./polyfill":42,"./shim":44,"call-bind":2,"define-properties":4}],42:[function(require,module,exports){
'use strict';

var requirePromise = require('./requirePromise');

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	requirePromise();
	return typeof Promise.prototype['finally'] === 'function' ? Promise.prototype['finally'] : implementation;
};

},{"./implementation":40,"./requirePromise":43}],43:[function(require,module,exports){
'use strict';

module.exports = function requirePromise() {
	if (typeof Promise !== 'function') {
		throw new TypeError('`Promise.prototype.finally` requires a global `Promise` be available.');
	}
};

},{}],44:[function(require,module,exports){
'use strict';

var requirePromise = require('./requirePromise');

var getPolyfill = require('./polyfill');
var define = require('define-properties');

module.exports = function shimPromiseFinally() {
	requirePromise();

	var polyfill = getPolyfill();
	define(Promise.prototype, { 'finally': polyfill }, {
		'finally': function testFinally() {
			return Promise.prototype['finally'] !== polyfill;
		}
	});
	return polyfill;
};

},{"./polyfill":42,"./requirePromise":43,"define-properties":4}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromisedMap = void 0;
var PromisedMap = /** @class */ (function () {
    function PromisedMap() {
        this.map = new Map();
    }
    Object.defineProperty(PromisedMap.prototype, "size", {
        /**
         * Returns map size.
         */
        get: function () {
            return this.map.size;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Sets key/data pair and creates related promise.
     * If key already exists in map - it will be replaced with new data and new promise.
     */
    PromisedMap.prototype.set = function (key, data) {
        var item = this.createMapItem(data);
        this.map.set(key, item);
        return item.promise;
    };
    /**
     * Returns data for key.
     */
    PromisedMap.prototype.get = function (key) {
        var item = this.map.get(key);
        return item && item.data;
    };
    /**
     * Checks if key exists.
     */
    PromisedMap.prototype.has = function (key) {
        return this.map.has(key);
    };
    /**
     * Deletes key from map.
     * Caution: previously returned promise will no be resolved or rejected.
     */
    PromisedMap.prototype.delete = function (key) {
        return this.map.delete(key);
    };
    /**
     * Resolves promise in map by key and removes key from map.
     * If no such key in map - nothing happens.
     */
    PromisedMap.prototype.resolve = function (key, value) {
        var item = this.map.get(key);
        if (item) {
            this.delete(key);
            item.resolve(value);
        }
    };
    /**
     * Rejects promise in map by key and removes key from map.
     * If no such key in map - nothing happens.
     */
    PromisedMap.prototype.reject = function (key, reason) {
        var item = this.map.get(key);
        if (item) {
            this.delete(key);
            item.reject(reason);
        }
    };
    /**
     * Resolves all promise in map and removes all keys.
     */
    PromisedMap.prototype.resolveAll = function (value) {
        this.map.forEach(function (item) { return item.resolve(value); });
        this.map.clear();
    };
    /**
     * Rejects all promise in map and removes all keys.
     */
    PromisedMap.prototype.rejectAll = function (reason) {
        this.map.forEach(function (item) { return item.reject(reason); });
        this.map.clear();
    };
    /**
     * Iterate map.
     */
    PromisedMap.prototype.forEach = function (fn) {
        this.map.forEach(function (item, key, map) { return fn(item.data, key, map); });
    };
    /**
     * Clears map.
     */
    PromisedMap.prototype.clear = function () {
        return this.map.clear();
    };
    PromisedMap.prototype.createMapItem = function (data) {
        var item = { data: data };
        item.promise = new Promise(function (resolve, reject) {
            item.resolve = resolve;
            item.reject = reject;
        });
        return item;
    };
    return PromisedMap;
}());
exports.PromisedMap = PromisedMap;

},{}],46:[function(require,module,exports){
'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

var Event = /** @class */ (function () {
    function Event(type, target) {
        this.target = target;
        this.type = type;
    }
    return Event;
}());
var ErrorEvent = /** @class */ (function (_super) {
    __extends(ErrorEvent, _super);
    function ErrorEvent(error, target) {
        var _this = _super.call(this, 'error', target) || this;
        _this.message = error.message;
        _this.error = error;
        return _this;
    }
    return ErrorEvent;
}(Event));
var CloseEvent = /** @class */ (function (_super) {
    __extends(CloseEvent, _super);
    function CloseEvent(code, reason, target) {
        if (code === void 0) { code = 1000; }
        if (reason === void 0) { reason = ''; }
        var _this = _super.call(this, 'close', target) || this;
        _this.wasClean = true;
        _this.code = code;
        _this.reason = reason;
        return _this;
    }
    return CloseEvent;
}(Event));

/*!
 * Reconnecting WebSocket
 * by Pedro Ladaria <pedro.ladaria@gmail.com>
 * https://github.com/pladaria/reconnecting-websocket
 * License MIT
 */
var getGlobalWebSocket = function () {
    if (typeof WebSocket !== 'undefined') {
        // @ts-ignore
        return WebSocket;
    }
};
/**
 * Returns true if given argument looks like a WebSocket class
 */
var isWebSocket = function (w) { return typeof w !== 'undefined' && !!w && w.CLOSING === 2; };
var DEFAULT = {
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000 + Math.random() * 4000,
    minUptime: 5000,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 4000,
    maxRetries: Infinity,
    maxEnqueuedMessages: Infinity,
    startClosed: false,
    debug: false,
};
var ReconnectingWebSocket = /** @class */ (function () {
    function ReconnectingWebSocket(url, protocols, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this._listeners = {
            error: [],
            message: [],
            open: [],
            close: [],
        };
        this._retryCount = -1;
        this._shouldReconnect = true;
        this._connectLock = false;
        this._binaryType = 'blob';
        this._closeCalled = false;
        this._messageQueue = [];
        /**
         * An event listener to be called when the WebSocket connection's readyState changes to CLOSED
         */
        this.onclose = null;
        /**
         * An event listener to be called when an error occurs
         */
        this.onerror = null;
        /**
         * An event listener to be called when a message is received from the server
         */
        this.onmessage = null;
        /**
         * An event listener to be called when the WebSocket connection's readyState changes to OPEN;
         * this indicates that the connection is ready to send and receive data
         */
        this.onopen = null;
        this._handleOpen = function (event) {
            _this._debug('open event');
            var _a = _this._options.minUptime, minUptime = _a === void 0 ? DEFAULT.minUptime : _a;
            clearTimeout(_this._connectTimeout);
            _this._uptimeTimeout = setTimeout(function () { return _this._acceptOpen(); }, minUptime);
            _this._ws.binaryType = _this._binaryType;
            // send enqueued messages (messages sent before websocket open event)
            _this._messageQueue.forEach(function (message) { return _this._ws.send(message); });
            _this._messageQueue = [];
            if (_this.onopen) {
                _this.onopen(event);
            }
            _this._listeners.open.forEach(function (listener) { return _this._callEventListener(event, listener); });
        };
        this._handleMessage = function (event) {
            _this._debug('message event');
            if (_this.onmessage) {
                _this.onmessage(event);
            }
            _this._listeners.message.forEach(function (listener) { return _this._callEventListener(event, listener); });
        };
        this._handleError = function (event) {
            _this._debug('error event', event.message);
            _this._disconnect(undefined, event.message === 'TIMEOUT' ? 'timeout' : undefined);
            if (_this.onerror) {
                _this.onerror(event);
            }
            _this._debug('exec error listeners');
            _this._listeners.error.forEach(function (listener) { return _this._callEventListener(event, listener); });
            _this._connect();
        };
        this._handleClose = function (event) {
            _this._debug('close event');
            _this._clearTimeouts();
            if (_this._shouldReconnect) {
                _this._connect();
            }
            if (_this.onclose) {
                _this.onclose(event);
            }
            _this._listeners.close.forEach(function (listener) { return _this._callEventListener(event, listener); });
        };
        this._url = url;
        this._protocols = protocols;
        this._options = options;
        if (this._options.startClosed) {
            this._shouldReconnect = false;
        }
        this._connect();
    }
    Object.defineProperty(ReconnectingWebSocket, "CONNECTING", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket, "OPEN", {
        get: function () {
            return 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket, "CLOSING", {
        get: function () {
            return 2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket, "CLOSED", {
        get: function () {
            return 3;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "CONNECTING", {
        get: function () {
            return ReconnectingWebSocket.CONNECTING;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "OPEN", {
        get: function () {
            return ReconnectingWebSocket.OPEN;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "CLOSING", {
        get: function () {
            return ReconnectingWebSocket.CLOSING;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "CLOSED", {
        get: function () {
            return ReconnectingWebSocket.CLOSED;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "binaryType", {
        get: function () {
            return this._ws ? this._ws.binaryType : this._binaryType;
        },
        set: function (value) {
            this._binaryType = value;
            if (this._ws) {
                this._ws.binaryType = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "retryCount", {
        /**
         * Returns the number or connection retries
         */
        get: function () {
            return Math.max(this._retryCount, 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "bufferedAmount", {
        /**
         * The number of bytes of data that have been queued using calls to send() but not yet
         * transmitted to the network. This value resets to zero once all queued data has been sent.
         * This value does not reset to zero when the connection is closed; if you keep calling send(),
         * this will continue to climb. Read only
         */
        get: function () {
            var bytes = this._messageQueue.reduce(function (acc, message) {
                if (typeof message === 'string') {
                    acc += message.length; // not byte size
                }
                else if (message instanceof Blob) {
                    acc += message.size;
                }
                else {
                    acc += message.byteLength;
                }
                return acc;
            }, 0);
            return bytes + (this._ws ? this._ws.bufferedAmount : 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "extensions", {
        /**
         * The extensions selected by the server. This is currently only the empty string or a list of
         * extensions as negotiated by the connection
         */
        get: function () {
            return this._ws ? this._ws.extensions : '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "protocol", {
        /**
         * A string indicating the name of the sub-protocol the server selected;
         * this will be one of the strings specified in the protocols parameter when creating the
         * WebSocket object
         */
        get: function () {
            return this._ws ? this._ws.protocol : '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "readyState", {
        /**
         * The current state of the connection; this is one of the Ready state constants
         */
        get: function () {
            if (this._ws) {
                return this._ws.readyState;
            }
            return this._options.startClosed
                ? ReconnectingWebSocket.CLOSED
                : ReconnectingWebSocket.CONNECTING;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReconnectingWebSocket.prototype, "url", {
        /**
         * The URL as resolved by the constructor
         */
        get: function () {
            return this._ws ? this._ws.url : '';
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Closes the WebSocket connection or connection attempt, if any. If the connection is already
     * CLOSED, this method does nothing
     */
    ReconnectingWebSocket.prototype.close = function (code, reason) {
        if (code === void 0) { code = 1000; }
        this._closeCalled = true;
        this._shouldReconnect = false;
        this._clearTimeouts();
        if (!this._ws) {
            this._debug('close enqueued: no ws instance');
            return;
        }
        if (this._ws.readyState === this.CLOSED) {
            this._debug('close: already closed');
            return;
        }
        this._ws.close(code, reason);
    };
    /**
     * Closes the WebSocket connection or connection attempt and connects again.
     * Resets retry counter;
     */
    ReconnectingWebSocket.prototype.reconnect = function (code, reason) {
        this._shouldReconnect = true;
        this._closeCalled = false;
        this._retryCount = -1;
        if (!this._ws || this._ws.readyState === this.CLOSED) {
            this._connect();
        }
        else {
            this._disconnect(code, reason);
            this._connect();
        }
    };
    /**
     * Enqueue specified data to be transmitted to the server over the WebSocket connection
     */
    ReconnectingWebSocket.prototype.send = function (data) {
        if (this._ws && this._ws.readyState === this.OPEN) {
            this._debug('send', data);
            this._ws.send(data);
        }
        else {
            var _a = this._options.maxEnqueuedMessages, maxEnqueuedMessages = _a === void 0 ? DEFAULT.maxEnqueuedMessages : _a;
            if (this._messageQueue.length < maxEnqueuedMessages) {
                this._debug('enqueue', data);
                this._messageQueue.push(data);
            }
        }
    };
    /**
     * Register an event handler of a specific event type
     */
    ReconnectingWebSocket.prototype.addEventListener = function (type, listener) {
        if (this._listeners[type]) {
            // @ts-ignore
            this._listeners[type].push(listener);
        }
    };
    ReconnectingWebSocket.prototype.dispatchEvent = function (event) {
        var e_1, _a;
        var listeners = this._listeners[event.type];
        if (listeners) {
            try {
                for (var listeners_1 = __values(listeners), listeners_1_1 = listeners_1.next(); !listeners_1_1.done; listeners_1_1 = listeners_1.next()) {
                    var listener = listeners_1_1.value;
                    this._callEventListener(event, listener);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (listeners_1_1 && !listeners_1_1.done && (_a = listeners_1.return)) _a.call(listeners_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return true;
    };
    /**
     * Removes an event listener
     */
    ReconnectingWebSocket.prototype.removeEventListener = function (type, listener) {
        if (this._listeners[type]) {
            // @ts-ignore
            this._listeners[type] = this._listeners[type].filter(function (l) { return l !== listener; });
        }
    };
    ReconnectingWebSocket.prototype._debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this._options.debug) {
            // not using spread because compiled version uses Symbols
            // tslint:disable-next-line
            console.log.apply(console, __spread(['RWS>'], args));
        }
    };
    ReconnectingWebSocket.prototype._getNextDelay = function () {
        var _a = this._options, _b = _a.reconnectionDelayGrowFactor, reconnectionDelayGrowFactor = _b === void 0 ? DEFAULT.reconnectionDelayGrowFactor : _b, _c = _a.minReconnectionDelay, minReconnectionDelay = _c === void 0 ? DEFAULT.minReconnectionDelay : _c, _d = _a.maxReconnectionDelay, maxReconnectionDelay = _d === void 0 ? DEFAULT.maxReconnectionDelay : _d;
        var delay = 0;
        if (this._retryCount > 0) {
            delay =
                minReconnectionDelay * Math.pow(reconnectionDelayGrowFactor, this._retryCount - 1);
            if (delay > maxReconnectionDelay) {
                delay = maxReconnectionDelay;
            }
        }
        this._debug('next delay', delay);
        return delay;
    };
    ReconnectingWebSocket.prototype._wait = function () {
        var _this = this;
        return new Promise(function (resolve) {
            setTimeout(resolve, _this._getNextDelay());
        });
    };
    ReconnectingWebSocket.prototype._getNextUrl = function (urlProvider) {
        if (typeof urlProvider === 'string') {
            return Promise.resolve(urlProvider);
        }
        if (typeof urlProvider === 'function') {
            var url = urlProvider();
            if (typeof url === 'string') {
                return Promise.resolve(url);
            }
            if (!!url.then) {
                return url;
            }
        }
        throw Error('Invalid URL');
    };
    ReconnectingWebSocket.prototype._connect = function () {
        var _this = this;
        if (this._connectLock || !this._shouldReconnect) {
            return;
        }
        this._connectLock = true;
        var _a = this._options, _b = _a.maxRetries, maxRetries = _b === void 0 ? DEFAULT.maxRetries : _b, _c = _a.connectionTimeout, connectionTimeout = _c === void 0 ? DEFAULT.connectionTimeout : _c, _d = _a.WebSocket, WebSocket = _d === void 0 ? getGlobalWebSocket() : _d;
        if (this._retryCount >= maxRetries) {
            this._debug('max retries reached', this._retryCount, '>=', maxRetries);
            return;
        }
        this._retryCount++;
        this._debug('connect', this._retryCount);
        this._removeListeners();
        if (!isWebSocket(WebSocket)) {
            throw Error('No valid WebSocket class provided');
        }
        this._wait()
            .then(function () { return _this._getNextUrl(_this._url); })
            .then(function (url) {
            // close could be called before creating the ws
            if (_this._closeCalled) {
                return;
            }
            _this._debug('connect', { url: url, protocols: _this._protocols });
            _this._ws = _this._protocols
                ? new WebSocket(url, _this._protocols)
                : new WebSocket(url);
            _this._ws.binaryType = _this._binaryType;
            _this._connectLock = false;
            _this._addListeners();
            _this._connectTimeout = setTimeout(function () { return _this._handleTimeout(); }, connectionTimeout);
        });
    };
    ReconnectingWebSocket.prototype._handleTimeout = function () {
        this._debug('timeout event');
        this._handleError(new ErrorEvent(Error('TIMEOUT'), this));
    };
    ReconnectingWebSocket.prototype._disconnect = function (code, reason) {
        if (code === void 0) { code = 1000; }
        this._clearTimeouts();
        if (!this._ws) {
            return;
        }
        this._removeListeners();
        try {
            this._ws.close(code, reason);
            this._handleClose(new CloseEvent(code, reason, this));
        }
        catch (error) {
            // ignore
        }
    };
    ReconnectingWebSocket.prototype._acceptOpen = function () {
        this._debug('accept open');
        this._retryCount = 0;
    };
    ReconnectingWebSocket.prototype._callEventListener = function (event, listener) {
        if ('handleEvent' in listener) {
            // @ts-ignore
            listener.handleEvent(event);
        }
        else {
            // @ts-ignore
            listener(event);
        }
    };
    ReconnectingWebSocket.prototype._removeListeners = function () {
        if (!this._ws) {
            return;
        }
        this._debug('removeListeners');
        this._ws.removeEventListener('open', this._handleOpen);
        this._ws.removeEventListener('close', this._handleClose);
        this._ws.removeEventListener('message', this._handleMessage);
        // @ts-ignore
        this._ws.removeEventListener('error', this._handleError);
    };
    ReconnectingWebSocket.prototype._addListeners = function () {
        if (!this._ws) {
            return;
        }
        this._debug('addListeners');
        this._ws.addEventListener('open', this._handleOpen);
        this._ws.addEventListener('close', this._handleClose);
        this._ws.addEventListener('message', this._handleMessage);
        // @ts-ignore
        this._ws.addEventListener('error', this._handleError);
    };
    ReconnectingWebSocket.prototype._clearTimeouts = function () {
        clearTimeout(this._connectTimeout);
        clearTimeout(this._uptimeTimeout);
    };
    return ReconnectingWebSocket;
}());

module.exports = ReconnectingWebSocket;

},{}],47:[function(require,module,exports){
/**
 * WebSocket with promise api
 */

/**
 * @external Channel
 */

const Channel = require('chnl');
// todo: maybe remove PromiseController and just use promised-map with 2 items?
const PromiseController = require('promise-controller');
const { PromisedMap } = require('promised-map');
// todo: maybe remove Requests and just use promised-map?
const Requests = require('./requests');
const defaultOptions = require('./options');
const {throwIf, isPromise} = require('./utils');

// see: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#Ready_state_constants
const STATE = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
};

/**
 * @typicalname wsp
 */
class WebSocketAsPromised {
  /**
   * Constructor. Unlike original WebSocket it does not immediately open connection.
   * Please call `open()` method to connect.
   *
   * @param {String} url WebSocket URL
   * @param {Options} [options]
   */
  constructor(url, options) {
    this._assertOptions(options);
    this._url = url;
    this._options = Object.assign({}, defaultOptions, options);
    this._requests = new Requests();
    this._promisedMap = new PromisedMap();
    this._ws = null;
    this._wsSubscription = null;
    this._createOpeningController();
    this._createClosingController();
    this._createChannels();
  }

  /**
   * Returns original WebSocket instance created by `options.createWebSocket`.
   *
   * @returns {WebSocket}
   */
  get ws() {
    return this._ws;
  }

  /**
   * Returns WebSocket url.
   *
   * @returns {String}
   */
  get url() {
    return this._url;
  }

  /**
   * Is WebSocket connection in opening state.
   *
   * @returns {Boolean}
   */
  get isOpening() {
    return Boolean(this._ws && this._ws.readyState === STATE.CONNECTING);
  }

  /**
   * Is WebSocket connection opened.
   *
   * @returns {Boolean}
   */
  get isOpened() {
    return Boolean(this._ws && this._ws.readyState === STATE.OPEN);
  }

  /**
   * Is WebSocket connection in closing state.
   *
   * @returns {Boolean}
   */
  get isClosing() {
    return Boolean(this._ws && this._ws.readyState === STATE.CLOSING);
  }

  /**
   * Is WebSocket connection closed.
   *
   * @returns {Boolean}
   */
  get isClosed() {
    return Boolean(!this._ws || this._ws.readyState === STATE.CLOSED);
  }

  /**
   * Event channel triggered when connection is opened.
   *
   * @see https://vitalets.github.io/chnl/#channel
   * @example
   * wsp.onOpen.addListener(() => console.log('Connection opened'));
   *
   * @returns {Channel}
   */
  get onOpen() {
    return this._onOpen;
  }

  /**
   * Event channel triggered every time when message is sent to server.
   *
   * @see https://vitalets.github.io/chnl/#channel
   * @example
   * wsp.onSend.addListener(data => console.log('Message sent', data));
   *
   * @returns {Channel}
   */
  get onSend() {
    return this._onSend;
  }

  /**
   * Event channel triggered every time when message received from server.
   *
   * @see https://vitalets.github.io/chnl/#channel
   * @example
   * wsp.onMessage.addListener(message => console.log(message));
   *
   * @returns {Channel}
   */
  get onMessage() {
    return this._onMessage;
  }

  /**
   * Event channel triggered every time when received message is successfully unpacked.
   * For example, if you are using JSON transport, the listener will receive already JSON parsed data.
   *
   * @see https://vitalets.github.io/chnl/#channel
   * @example
   * wsp.onUnpackedMessage.addListener(data => console.log(data.foo));
   *
   * @returns {Channel}
   */
  get onUnpackedMessage() {
    return this._onUnpackedMessage;
  }

  /**
   * Event channel triggered every time when response to some request comes.
   * Received message considered a response if requestId is found in it.
   *
   * @see https://vitalets.github.io/chnl/#channel
   * @example
   * wsp.onResponse.addListener(data => console.log(data));
   *
   * @returns {Channel}
   */
  get onResponse() {
    return this._onResponse;
  }

  /**
   * Event channel triggered when connection closed.
   * Listener accepts single argument `{code, reason}`.
   *
   * @see https://vitalets.github.io/chnl/#channel
   * @example
   * wsp.onClose.addListener(event => console.log(`Connections closed: ${event.reason}`));
   *
   * @returns {Channel}
   */
  get onClose() {
    return this._onClose;
  }

  /**
   * Event channel triggered when by Websocket 'error' event.
   *
   * @see https://vitalets.github.io/chnl/#channel
   * @example
   * wsp.onError.addListener(event => console.error(event));
   *
   * @returns {Channel}
   */
  get onError() {
    return this._onError;
  }

  /**
   * Opens WebSocket connection. If connection already opened, promise will be resolved with "open event".
   *
   * @returns {Promise<Event>}
   */
  open() {
    if (this.isClosing) {
      return Promise.reject(new Error(`Can't open WebSocket while closing.`));
    }
    if (this.isOpened) {
      return this._opening.promise;
    }
    return this._opening.call(() => {
      this._opening.promise.catch(e => this._cleanup(e));
      this._createWS();
    });
  }

  /**
   * Performs request and waits for response.
   *
   * @param {*} data
   * @param {Object} [options]
   * @param {String|Number} [options.requestId=<auto-generated>]
   * @param {Number} [options.timeout=0]
   * @returns {Promise}
   */
  sendRequest(data, options = {}) {
    const requestId = options.requestId || `${Math.random()}`;
    const timeout = options.timeout !== undefined ? options.timeout : this._options.timeout;
    return this._requests.create(requestId, () => {
      this._assertRequestIdHandlers();
      const finalData = this._options.attachRequestId(data, requestId);
      this.sendPacked(finalData);
    }, timeout);
  }

  /**
   * Packs data with `options.packMessage` and sends to the server.
   *
   * @param {*} data
   */
  sendPacked(data) {
    this._assertPackingHandlers();
    const message = this._options.packMessage(data);
    this.send(message);
  }

  /**
   * Sends data without packing.
   *
   * @param {String|Blob|ArrayBuffer} data
   */
  send(data) {
    throwIf(!this.isOpened, `Can't send data because WebSocket is not opened.`);
    this._ws.send(data);
    this._onSend.dispatchAsync(data);
  }

  /**
   * Waits for particular message to come.
   *
   * @param {Function} predicate function to check incoming message.
   * @param {Object} [options]
   * @param {Number} [options.timeout=0]
   * @param {Error} [options.timeoutError]
   * @returns {Promise}
   *
   * @example
   * const response = await wsp.waitUnpackedMessage(data => data && data.foo === 'bar');
   */
  waitUnpackedMessage(predicate, options = {}) {
    throwIf(typeof predicate !== 'function', `Predicate must be a function, got ${typeof predicate}`);
    if (options.timeout) {
      setTimeout(() => {
        if (this._promisedMap.has(predicate)) {
          const error = options.timeoutError || new Error('Timeout');
          this._promisedMap.reject(predicate, error);
        }
      }, options.timeout);
    }
    return this._promisedMap.set(predicate);
  }

  /**
   * Closes WebSocket connection. If connection already closed, promise will be resolved with "close event".
   *
   * @param {number=} [code=1000] A numeric value indicating the status code.
   * @param {string=} [reason] A human-readable reason for closing connection.
   * @returns {Promise<Event>}
   */
  close(code, reason) { // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close
    return this.isClosed
      ? Promise.resolve(this._closing.value)
      : this._closing.call(() => this._ws.close(code, reason));
  }

  /**
   * Removes all listeners from WSP instance. Useful for cleanup.
   */
  removeAllListeners() {
    this._onOpen.removeAllListeners();
    this._onMessage.removeAllListeners();
    this._onUnpackedMessage.removeAllListeners();
    this._onResponse.removeAllListeners();
    this._onSend.removeAllListeners();
    this._onClose.removeAllListeners();
    this._onError.removeAllListeners();
  }

  _createOpeningController() {
    const connectionTimeout = this._options.connectionTimeout || this._options.timeout;
    this._opening = new PromiseController({
      timeout: connectionTimeout,
      timeoutReason: `Can't open WebSocket within allowed timeout: ${connectionTimeout} ms.`
    });
  }

  _createClosingController() {
    const closingTimeout = this._options.timeout;
    this._closing = new PromiseController({
      timeout: closingTimeout,
      timeoutReason: `Can't close WebSocket within allowed timeout: ${closingTimeout} ms.`
    });
  }

  _createChannels() {
    this._onOpen = new Channel();
    this._onMessage = new Channel();
    this._onUnpackedMessage = new Channel();
    this._onResponse = new Channel();
    this._onSend = new Channel();
    this._onClose = new Channel();
    this._onError = new Channel();
  }

  _createWS() {
    this._ws = this._options.createWebSocket(this._url);
    this._wsSubscription = new Channel.Subscription([
      { channel: this._ws, event: 'open', listener: e => this._handleOpen(e) },
      { channel: this._ws, event: 'message', listener: e => this._handleMessage(e) },
      { channel: this._ws, event: 'error', listener: e => this._handleError(e) },
      { channel: this._ws, event: 'close', listener: e => this._handleClose(e) },
    ]).on();
  }

  _handleOpen(event) {
    this._onOpen.dispatchAsync(event);
    this._opening.resolve(event);
  }

  _handleMessage(event) {
    const data = this._options.extractMessageData(event);
    this._onMessage.dispatchAsync(data);
    this._tryUnpack(data);
  }

  _tryUnpack(data) {
    if (this._options.unpackMessage) {
      data = this._options.unpackMessage(data);
      if (isPromise(data)) {
        data.then(data => this._handleUnpackedData(data));
      } else {
        this._handleUnpackedData(data);
      }
    }
  }

  _handleUnpackedData(data) {
    if (data !== undefined) {
      // todo: maybe trigger onUnpackedMessage always?
      this._onUnpackedMessage.dispatchAsync(data);
      this._tryHandleResponse(data);
    }
    this._tryHandleWaitingMessage(data);
  }

  _tryHandleResponse(data) {
    if (this._options.extractRequestId) {
      const requestId = this._options.extractRequestId(data);
      if (requestId) {
        this._onResponse.dispatchAsync(data, requestId);
        this._requests.resolve(requestId, data);
      }
    }
  }

  _tryHandleWaitingMessage(data) {
    this._promisedMap.forEach((_, predicate) => {
      let isMatched = false;
      try {
        isMatched = predicate(data);
      } catch (e) {
        this._promisedMap.reject(predicate, e);
        return;
      }
      if (isMatched) {
        this._promisedMap.resolve(predicate, data);
      }
    });
  }

  _handleError(event) {
    this._onError.dispatchAsync(event);
  }

  _handleClose(event) {
    this._onClose.dispatchAsync(event);
    this._closing.resolve(event);
    const error = new Error(`WebSocket closed with reason: ${event.reason} (${event.code}).`);
    if (this._opening.isPending) {
      this._opening.reject(error);
    }
    this._cleanup(error);
  }

  _cleanupWS() {
    if (this._wsSubscription) {
      this._wsSubscription.off();
      this._wsSubscription = null;
    }
    this._ws = null;
  }

  _cleanup(error) {
    this._cleanupWS();
    this._requests.rejectAll(error);
  }

  _assertOptions(options) {
    Object.keys(options || {}).forEach(key => {
      if (!defaultOptions.hasOwnProperty(key)) {
        throw new Error(`Unknown option: ${key}`);
      }
    });
  }

  _assertPackingHandlers() {
    const { packMessage, unpackMessage } = this._options;
    throwIf(!packMessage || !unpackMessage,
      `Please define 'options.packMessage / options.unpackMessage' for sending packed messages.`
    );
  }

  _assertRequestIdHandlers() {
    const { attachRequestId, extractRequestId } = this._options;
    throwIf(!attachRequestId || !extractRequestId,
      `Please define 'options.attachRequestId / options.extractRequestId' for sending requests.`
    );
  }
}

module.exports = WebSocketAsPromised;

},{"./options":48,"./requests":49,"./utils":50,"chnl":3,"promise-controller":38,"promised-map":45}],48:[function(require,module,exports){
/**
 * Default options.
 */

/**
 * @typedef {Object} Options
 * @property {Function} [createWebSocket=url => new WebSocket(url)] - custom function for WebSocket construction.
  *
 * @property {Function} [packMessage=noop] - packs message for sending. For example, `data => JSON.stringify(data)`.
 *
 * @property {Function} [unpackMessage=noop] - unpacks received message. For example, `data => JSON.parse(data)`.
 *
 * @property {Function} [attachRequestId=noop] - injects request id into data.
 * For example, `(data, requestId) => Object.assign({requestId}, data)`.
 *
 * @property {Function} [extractRequestId=noop] - extracts request id from received data.
 * For example, `data => data.requestId`.
 *
 * @property {Function} [extractMessageData=event => event.data] - extracts data from event object.
 *
 * @property {Number} timeout=0 - timeout for opening connection and sending messages.
 *
 * @property {Number} connectionTimeout=0 - special timeout for opening connection, by default equals to `timeout`.
 *
 * @defaults
 * please see [options.js](https://github.com/vitalets/websocket-as-promised/blob/master/src/options.js)
 */

module.exports = {
  /**
   * See {@link Options.createWebSocket}
   *
   * @param {String} url
   * @returns {WebSocket}
   */
  createWebSocket: url => new WebSocket(url),

  /**
   * See {@link Options.packMessage}
   *
   * @param {*} data
   * @returns {String|ArrayBuffer|Blob}
   */
  packMessage: null,

  /**
   * See {@link Options.unpackMessage}
   *
   * @param {String|ArrayBuffer|Blob} data
   * @returns {*}
   */
  unpackMessage: null,

  /**
   * See {@link Options.attachRequestId}
   *
   * @param {*} data
   * @param {String|Number} requestId
   * @returns {*}
   */
  attachRequestId: null,

  /**
   * See {@link Options.extractRequestId}
   *
   * @param {*} data
   * @returns {String|Number|undefined}
   */
  extractRequestId: null,

  /**
   * See {@link Options.extractMessageData}
   *
   * @param {*} event
   * @returns {*}
   */
  extractMessageData: event => event.data,

  /**
   * See {@link Options.timeout}
   */
  timeout: 0,

  /**
   * See {@link Options.connectionTimeout}
   */
  connectionTimeout: 0,
};

},{}],49:[function(require,module,exports){
/**
 * Class for manage pending requests.
 * @private
 */

const PromiseController = require('promise-controller');
const promiseFinally = require('promise.prototype.finally');

module.exports = class Requests {
  constructor() {
    this._items = new Map();
  }

  /**
   * Creates new request and stores it in the list.
   *
   * @param {String|Number} requestId
   * @param {Function} fn
   * @param {Number} timeout
   * @returns {Promise}
   */
  create(requestId, fn, timeout) {
    this._rejectExistingRequest(requestId);
    return this._createNewRequest(requestId, fn, timeout);
  }

  resolve(requestId, data) {
    if (requestId && this._items.has(requestId)) {
      this._items.get(requestId).resolve(data);
    }
  }

  rejectAll(error) {
    this._items.forEach(request => request.isPending ? request.reject(error) : null);
  }

  _rejectExistingRequest(requestId) {
    const existingRequest = this._items.get(requestId);
    if (existingRequest && existingRequest.isPending) {
      existingRequest.reject(new Error(`WebSocket request is replaced, id: ${requestId}`));
    }
  }

  _createNewRequest(requestId, fn, timeout) {
    const request = new PromiseController({
      timeout,
      timeoutReason: `WebSocket request was rejected by timeout (${timeout} ms). RequestId: ${requestId}`
    });
    this._items.set(requestId, request);
    return promiseFinally(request.call(fn), () => this._deleteRequest(requestId, request));
  }

  _deleteRequest(requestId, request) {
    // this check is important when request was replaced
    if (this._items.get(requestId) === request) {
      this._items.delete(requestId);
    }
  }
};

},{"promise-controller":38,"promise.prototype.finally":41}],50:[function(require,module,exports){

exports.throwIf = (condition, message) => {
  if (condition) {
    throw new Error(message);
  }
};

exports.isPromise = value => {
  return value && typeof value.then === 'function';
};

},{}],51:[function(require,module,exports){
"use strict";

var _websocketAsPromised = _interopRequireDefault(require("websocket-as-promised"));

var _reconnectingWebsocket = _interopRequireDefault(require("reconnecting-websocket"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var Tracer = /*#__PURE__*/function () {
  function Tracer() {
    _classCallCheck(this, Tracer);

    this.wsp = null;
    this.rws = null;
  }

  _createClass(Tracer, [{
    key: "connect",
    value: function connect(wsUrl) {
      var _this = this;

      if (this.wsp === null) {
        this.wsp = new _websocketAsPromised["default"](wsUrl, {
          createWebSocket: function createWebSocket(url) {
            if (_this.rws === null) {
              _this.rws = new _reconnectingWebsocket["default"](url); //this.rws.addEventListener("open", () => wsp.open());
            }

            return _this.rws;
          }
        });
      }

      return this.wsp.open();
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      if (this.wsp !== null) this.wsp.close();
    }
  }]);

  return Tracer;
}();

var tracer = new Tracer();
var queue = [];
var timeout = undefined;
var SEND_TIMEOUT = 500;
var PING_EVERY = 16000; // 16 sec

var LAST_PING = Date.now();
var CLOSE_TIMEOUT = 100; //console.log("UUID", generateUUID());

function generateUUID() {
  // Public Domain/MIT
  var d = Date.now(); //Timestamp

  var d2 = typeof performance !== "undefined" && performance.now && performance.now() * 1000 || 0; //Time in microseconds since page-load or 0 if unsupported

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16; //random number between 0 and 16

    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }

    return (c === "x" ? r : r & 0x3 | 0x8).toString(16);
  });
}

function send() {}
/*function send(entry) {
  queue.push(entry);

  if (timeout === undefined) {
    timeout = setTimeout(sendQueue, SEND_TIMEOUT);
  }
}*/


function wsConnect(url, data_version, session_id) {
  console.log("url", url);
  WS = null;
  WS = new WebSocket(url + "tracer?version=" + data_version + "&session=" + session_id);

  WS.onerror = function (e) {
    var error = e.message;
    console.log("WS error: " + error);
    WS.close();
  };

  WS.onmessage = function (e) {
    var message = JSON.parse(e.data);
    console.log("message from WS: ", message);
  };

  WS.onopen = function (e) {
    if (WS.readyState === WebSocket.OPEN) {
      timeout = setTimeout(sendQueue, SEND_TIMEOUT);
    }
  };

  WS.onclose = function (e) {
    console.log("WS disconnected", e);
    wsConnect(url, data_version, session_id);
  };
}

function wsSend(data) {
  if (WS.readyState === WebSocket.OPEN) {
    WS.send(JSON.stringify(data));
    return true;
  }

  return false;
}

function sendQueue() {
  if (queue.length !== 0 && wsSend(queue)) {
    timeout = setTimeout(sendQueue, SEND_TIMEOUT);
    queue = [];
  } else {
    timeout = undefined;
  }

  var NOW = Date.now();

  if (NOW - LAST_PING > PING_EVERY) {
    if (wsSend({
      ping: 1
    })) LAST_PING = NOW;
  }
}

function attemptClose() {
  if (queue.length === 0) {
    WS.close();
    self.close();
  } else {
    setTimeout(attemptClose, CLOSE_TIMEOUT);
  }
}

self.addEventListener("message", function (e) {
  var message = e.data;
  var cmd = message.cmd;

  if (cmd === "post") {//send(message.entry);
  } else if (cmd === "configure") {
    var url = message.url.replace(/^http/, "ws");
    tracer.connect("".concat(url, "?version=").concat(message.data_version, "&session=").concat(message.session_id));
  } else if (cmd === "close") {
    console.log("CLOSE!", message); //attemptClose();
  }
}, false);

},{"reconnecting-websocket":46,"websocket-as-promised":47}]},{},[51])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2FsbC1iaW5kL2NhbGxCb3VuZC5qcyIsIm5vZGVfbW9kdWxlcy9jYWxsLWJpbmQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2hubC9kaXN0L2NoYW5uZWwuY2pzLmpzIiwibm9kZV9tb2R1bGVzL2RlZmluZS1wcm9wZXJ0aWVzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2VzLWFic3RyYWN0LzIwMjEvRGVmaW5lUHJvcGVydHlPclRocm93LmpzIiwibm9kZV9tb2R1bGVzL2VzLWFic3RyYWN0LzIwMjEvRnJvbVByb3BlcnR5RGVzY3JpcHRvci5qcyIsIm5vZGVfbW9kdWxlcy9lcy1hYnN0cmFjdC8yMDIxL0lzQWNjZXNzb3JEZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL2VzLWFic3RyYWN0LzIwMjEvSXNDYWxsYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9lcy1hYnN0cmFjdC8yMDIxL0lzQ29uc3RydWN0b3IuanMiLCJub2RlX21vZHVsZXMvZXMtYWJzdHJhY3QvMjAyMS9Jc0RhdGFEZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL2VzLWFic3RyYWN0LzIwMjEvSXNQcm9wZXJ0eUtleS5qcyIsIm5vZGVfbW9kdWxlcy9lcy1hYnN0cmFjdC8yMDIxL1NhbWVWYWx1ZS5qcyIsIm5vZGVfbW9kdWxlcy9lcy1hYnN0cmFjdC8yMDIxL1NwZWNpZXNDb25zdHJ1Y3Rvci5qcyIsIm5vZGVfbW9kdWxlcy9lcy1hYnN0cmFjdC8yMDIxL1RvQm9vbGVhbi5qcyIsIm5vZGVfbW9kdWxlcy9lcy1hYnN0cmFjdC8yMDIxL1RvUHJvcGVydHlEZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL2VzLWFic3RyYWN0LzIwMjEvVHlwZS5qcyIsIm5vZGVfbW9kdWxlcy9lcy1hYnN0cmFjdC81L1R5cGUuanMiLCJub2RlX21vZHVsZXMvZXMtYWJzdHJhY3QvR2V0SW50cmluc2ljLmpzIiwibm9kZV9tb2R1bGVzL2VzLWFic3RyYWN0L2hlbHBlcnMvRGVmaW5lT3duUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvZXMtYWJzdHJhY3QvaGVscGVycy9Jc0FycmF5LmpzIiwibm9kZV9tb2R1bGVzL2VzLWFic3RyYWN0L2hlbHBlcnMvYXNzZXJ0UmVjb3JkLmpzIiwibm9kZV9tb2R1bGVzL2VzLWFic3RyYWN0L2hlbHBlcnMvZnJvbVByb3BlcnR5RGVzY3JpcHRvci5qcyIsIm5vZGVfbW9kdWxlcy9lcy1hYnN0cmFjdC9oZWxwZXJzL2lzTWF0Y2hSZWNvcmQuanMiLCJub2RlX21vZHVsZXMvZXMtYWJzdHJhY3QvaGVscGVycy9pc05hTi5qcyIsIm5vZGVfbW9kdWxlcy9lcy1hYnN0cmFjdC9oZWxwZXJzL2lzUHJvcGVydHlEZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL2Z1bmN0aW9uLWJpbmQvaW1wbGVtZW50YXRpb24uanMiLCJub2RlX21vZHVsZXMvZnVuY3Rpb24tYmluZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9nZXQtaW50cmluc2ljL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2hhcy1wcm9wZXJ0eS1kZXNjcmlwdG9ycy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9oYXMtc3ltYm9scy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9oYXMtc3ltYm9scy9zaGFtcy5qcyIsIm5vZGVfbW9kdWxlcy9oYXMvc3JjL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWNhbGxhYmxlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1rZXlzL2ltcGxlbWVudGF0aW9uLmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1rZXlzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1rZXlzL2lzQXJndW1lbnRzLmpzIiwibm9kZV9tb2R1bGVzL3Byb21pc2UtY29udHJvbGxlci9zcmMvZGVmYXVsdHMuanMiLCJub2RlX21vZHVsZXMvcHJvbWlzZS1jb250cm9sbGVyL3NyYy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9taXNlLWNvbnRyb2xsZXIvc3JjL3V0aWxzLmpzIiwibm9kZV9tb2R1bGVzL3Byb21pc2UucHJvdG90eXBlLmZpbmFsbHkvaW1wbGVtZW50YXRpb24uanMiLCJub2RlX21vZHVsZXMvcHJvbWlzZS5wcm90b3R5cGUuZmluYWxseS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9taXNlLnByb3RvdHlwZS5maW5hbGx5L3BvbHlmaWxsLmpzIiwibm9kZV9tb2R1bGVzL3Byb21pc2UucHJvdG90eXBlLmZpbmFsbHkvcmVxdWlyZVByb21pc2UuanMiLCJub2RlX21vZHVsZXMvcHJvbWlzZS5wcm90b3R5cGUuZmluYWxseS9zaGltLmpzIiwibm9kZV9tb2R1bGVzL3Byb21pc2VkLW1hcC9kaXN0L2Nqcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWNvbm5lY3Rpbmctd2Vic29ja2V0L2Rpc3QvcmVjb25uZWN0aW5nLXdlYnNvY2tldC1janMuanMiLCJub2RlX21vZHVsZXMvd2Vic29ja2V0LWFzLXByb21pc2VkL3NyYy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy93ZWJzb2NrZXQtYXMtcHJvbWlzZWQvc3JjL29wdGlvbnMuanMiLCJub2RlX21vZHVsZXMvd2Vic29ja2V0LWFzLXByb21pc2VkL3NyYy9yZXF1ZXN0cy5qcyIsIm5vZGVfbW9kdWxlcy93ZWJzb2NrZXQtYXMtcHJvbWlzZWQvc3JjL3V0aWxzLmpzIiwic3JjL3dvcmtlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN2tCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDVkE7O0FBQ0E7Ozs7Ozs7Ozs7SUFFTSxNO0VBQ0osa0JBQWM7SUFBQTs7SUFDWixLQUFLLEdBQUwsR0FBVyxJQUFYO0lBQ0EsS0FBSyxHQUFMLEdBQVcsSUFBWDtFQUNEOzs7O1dBRUQsaUJBQVEsS0FBUixFQUFlO01BQUE7O01BQ2IsSUFBSSxLQUFLLEdBQUwsS0FBYSxJQUFqQixFQUF1QjtRQUNyQixLQUFLLEdBQUwsR0FBVyxJQUFJLCtCQUFKLENBQXdCLEtBQXhCLEVBQStCO1VBQ3hDLGVBQWUsRUFBRSx5QkFBQyxHQUFELEVBQVM7WUFDeEIsSUFBSSxLQUFJLENBQUMsR0FBTCxLQUFhLElBQWpCLEVBQXVCO2NBQ3JCLEtBQUksQ0FBQyxHQUFMLEdBQVcsSUFBSSxpQ0FBSixDQUEwQixHQUExQixDQUFYLENBRHFCLENBRXJCO1lBQ0Q7O1lBRUQsT0FBTyxLQUFJLENBQUMsR0FBWjtVQUNEO1FBUnVDLENBQS9CLENBQVg7TUFVRDs7TUFFRCxPQUFPLEtBQUssR0FBTCxDQUFTLElBQVQsRUFBUDtJQUNEOzs7V0FFRCxzQkFBYTtNQUNYLElBQUksS0FBSyxHQUFMLEtBQWEsSUFBakIsRUFBdUIsS0FBSyxHQUFMLENBQVMsS0FBVDtJQUN4Qjs7Ozs7O0FBR0gsSUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFKLEVBQWY7QUFFQSxJQUFJLEtBQUssR0FBRyxFQUFaO0FBQ0EsSUFBSSxPQUFPLEdBQUcsU0FBZDtBQUNBLElBQUksWUFBWSxHQUFHLEdBQW5CO0FBQ0EsSUFBSSxVQUFVLEdBQUcsS0FBakIsQyxDQUF3Qjs7QUFFeEIsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUwsRUFBaEI7QUFDQSxJQUFJLGFBQWEsR0FBRyxHQUFwQixDLENBQXlCOztBQUV6QixTQUFTLFlBQVQsR0FBd0I7RUFDdEI7RUFDQSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBTCxFQUFSLENBRnNCLENBRUY7O0VBRXBCLElBQUksRUFBRSxHQUNILE9BQU8sV0FBUCxLQUF1QixXQUF2QixJQUNDLFdBQVcsQ0FBQyxHQURiLElBRUMsV0FBVyxDQUFDLEdBQVosS0FBb0IsSUFGdEIsSUFHQSxDQUpGLENBSnNCLENBUWpCOztFQUVMLE9BQU8sdUNBQXVDLE9BQXZDLENBQStDLE9BQS9DLEVBQXdELFVBQVUsQ0FBVixFQUFhO0lBQzFFLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFMLEtBQWdCLEVBQXhCLENBRDBFLENBQzlDOztJQUU1QixJQUFJLENBQUMsR0FBRyxDQUFSLEVBQVc7TUFDVDtNQUNBLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFMLElBQVUsRUFBVixHQUFlLENBQW5CO01BQ0EsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQyxHQUFHLEVBQWYsQ0FBSjtJQUNELENBSkQsTUFJTztNQUNMO01BQ0EsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQU4sSUFBVyxFQUFYLEdBQWdCLENBQXBCO01BQ0EsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFMLENBQVcsRUFBRSxHQUFHLEVBQWhCLENBQUw7SUFDRDs7SUFFRCxPQUFPLENBQUMsQ0FBQyxLQUFLLEdBQU4sR0FBWSxDQUFaLEdBQWlCLENBQUMsR0FBRyxHQUFMLEdBQVksR0FBN0IsRUFBa0MsUUFBbEMsQ0FBMkMsRUFBM0MsQ0FBUDtFQUNELENBZE0sQ0FBUDtBQWVEOztBQUVELFNBQVMsSUFBVCxHQUFnQixDQUFFO0FBRWxCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQSxTQUFTLFNBQVQsQ0FBbUIsR0FBbkIsRUFBd0IsWUFBeEIsRUFBc0MsVUFBdEMsRUFBa0Q7RUFDaEQsT0FBTyxDQUFDLEdBQVIsQ0FBWSxLQUFaLEVBQW1CLEdBQW5CO0VBQ0EsRUFBRSxHQUFHLElBQUw7RUFDQSxFQUFFLEdBQUcsSUFBSSxTQUFKLENBQ0gsR0FBRyxHQUFHLGlCQUFOLEdBQTBCLFlBQTFCLEdBQXlDLFdBQXpDLEdBQXVELFVBRHBELENBQUw7O0VBSUEsRUFBRSxDQUFDLE9BQUgsR0FBYSxVQUFVLENBQVYsRUFBYTtJQUN4QixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBZDtJQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksZUFBZSxLQUEzQjtJQUNBLEVBQUUsQ0FBQyxLQUFIO0VBQ0QsQ0FKRDs7RUFNQSxFQUFFLENBQUMsU0FBSCxHQUFlLFVBQVUsQ0FBVixFQUFhO0lBQzFCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQyxDQUFDLElBQWIsQ0FBZDtJQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksbUJBQVosRUFBaUMsT0FBakM7RUFDRCxDQUhEOztFQUtBLEVBQUUsQ0FBQyxNQUFILEdBQVksVUFBVSxDQUFWLEVBQWE7SUFDdkIsSUFBSSxFQUFFLENBQUMsVUFBSCxLQUFrQixTQUFTLENBQUMsSUFBaEMsRUFBc0M7TUFDcEMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxTQUFELEVBQVksWUFBWixDQUFwQjtJQUNEO0VBQ0YsQ0FKRDs7RUFNQSxFQUFFLENBQUMsT0FBSCxHQUFhLFVBQVUsQ0FBVixFQUFhO0lBQ3hCLE9BQU8sQ0FBQyxHQUFSLENBQVksaUJBQVosRUFBK0IsQ0FBL0I7SUFDQSxTQUFTLENBQUMsR0FBRCxFQUFNLFlBQU4sRUFBb0IsVUFBcEIsQ0FBVDtFQUNELENBSEQ7QUFJRDs7QUFFRCxTQUFTLE1BQVQsQ0FBZ0IsSUFBaEIsRUFBc0I7RUFDcEIsSUFBSSxFQUFFLENBQUMsVUFBSCxLQUFrQixTQUFTLENBQUMsSUFBaEMsRUFBc0M7SUFDcEMsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFJLENBQUMsU0FBTCxDQUFlLElBQWYsQ0FBUjtJQUNBLE9BQU8sSUFBUDtFQUNEOztFQUVELE9BQU8sS0FBUDtBQUNEOztBQUVELFNBQVMsU0FBVCxHQUFxQjtFQUNuQixJQUFJLEtBQUssQ0FBQyxNQUFOLEtBQWlCLENBQWpCLElBQXNCLE1BQU0sQ0FBQyxLQUFELENBQWhDLEVBQXlDO0lBQ3ZDLE9BQU8sR0FBRyxVQUFVLENBQUMsU0FBRCxFQUFZLFlBQVosQ0FBcEI7SUFDQSxLQUFLLEdBQUcsRUFBUjtFQUNELENBSEQsTUFHTztJQUNMLE9BQU8sR0FBRyxTQUFWO0VBQ0Q7O0VBRUQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUwsRUFBVjs7RUFFQSxJQUFJLEdBQUcsR0FBRyxTQUFOLEdBQWtCLFVBQXRCLEVBQWtDO0lBQ2hDLElBQ0UsTUFBTSxDQUFDO01BQ0wsSUFBSSxFQUFFO0lBREQsQ0FBRCxDQURSLEVBS0UsU0FBUyxHQUFHLEdBQVo7RUFDSDtBQUNGOztBQUVELFNBQVMsWUFBVCxHQUF3QjtFQUN0QixJQUFJLEtBQUssQ0FBQyxNQUFOLEtBQWlCLENBQXJCLEVBQXdCO0lBQ3RCLEVBQUUsQ0FBQyxLQUFIO0lBQ0EsSUFBSSxDQUFDLEtBQUw7RUFDRCxDQUhELE1BR087SUFDTCxVQUFVLENBQUMsWUFBRCxFQUFlLGFBQWYsQ0FBVjtFQUNEO0FBQ0Y7O0FBRUQsSUFBSSxDQUFDLGdCQUFMLENBQ0UsU0FERixFQUVFLFVBQVUsQ0FBVixFQUFhO0VBQ1gsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQWhCO0VBQ0EsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQWxCOztFQUVBLElBQUksR0FBRyxLQUFLLE1BQVosRUFBb0IsQ0FDbEI7RUFDRCxDQUZELE1BRU8sSUFBSSxHQUFHLEtBQUssV0FBWixFQUF5QjtJQUM5QixJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBUixDQUFZLE9BQVosQ0FBb0IsT0FBcEIsRUFBNkIsSUFBN0IsQ0FBWjtJQUNBLE1BQU0sQ0FBQyxPQUFQLFdBQWtCLEdBQWxCLHNCQUFpQyxPQUFPLENBQUMsWUFBekMsc0JBQWlFLE9BQU8sQ0FBQyxVQUF6RTtFQUNELENBSE0sTUFHQSxJQUFJLEdBQUcsS0FBSyxPQUFaLEVBQXFCO0lBQzFCLE9BQU8sQ0FBQyxHQUFSLENBQVksUUFBWixFQUFzQixPQUF0QixFQUQwQixDQUUxQjtFQUNEO0FBQ0YsQ0FmSCxFQWdCRSxLQWhCRiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIid1c2Ugc3RyaWN0JztcblxudmFyIEdldEludHJpbnNpYyA9IHJlcXVpcmUoJ2dldC1pbnRyaW5zaWMnKTtcblxudmFyIGNhbGxCaW5kID0gcmVxdWlyZSgnLi8nKTtcblxudmFyICRpbmRleE9mID0gY2FsbEJpbmQoR2V0SW50cmluc2ljKCdTdHJpbmcucHJvdG90eXBlLmluZGV4T2YnKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY2FsbEJvdW5kSW50cmluc2ljKG5hbWUsIGFsbG93TWlzc2luZykge1xuXHR2YXIgaW50cmluc2ljID0gR2V0SW50cmluc2ljKG5hbWUsICEhYWxsb3dNaXNzaW5nKTtcblx0aWYgKHR5cGVvZiBpbnRyaW5zaWMgPT09ICdmdW5jdGlvbicgJiYgJGluZGV4T2YobmFtZSwgJy5wcm90b3R5cGUuJykgPiAtMSkge1xuXHRcdHJldHVybiBjYWxsQmluZChpbnRyaW5zaWMpO1xuXHR9XG5cdHJldHVybiBpbnRyaW5zaWM7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJ2Z1bmN0aW9uLWJpbmQnKTtcbnZhciBHZXRJbnRyaW5zaWMgPSByZXF1aXJlKCdnZXQtaW50cmluc2ljJyk7XG5cbnZhciAkYXBwbHkgPSBHZXRJbnRyaW5zaWMoJyVGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHklJyk7XG52YXIgJGNhbGwgPSBHZXRJbnRyaW5zaWMoJyVGdW5jdGlvbi5wcm90b3R5cGUuY2FsbCUnKTtcbnZhciAkcmVmbGVjdEFwcGx5ID0gR2V0SW50cmluc2ljKCclUmVmbGVjdC5hcHBseSUnLCB0cnVlKSB8fCBiaW5kLmNhbGwoJGNhbGwsICRhcHBseSk7XG5cbnZhciAkZ09QRCA9IEdldEludHJpbnNpYygnJU9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IlJywgdHJ1ZSk7XG52YXIgJGRlZmluZVByb3BlcnR5ID0gR2V0SW50cmluc2ljKCclT2JqZWN0LmRlZmluZVByb3BlcnR5JScsIHRydWUpO1xudmFyICRtYXggPSBHZXRJbnRyaW5zaWMoJyVNYXRoLm1heCUnKTtcblxuaWYgKCRkZWZpbmVQcm9wZXJ0eSkge1xuXHR0cnkge1xuXHRcdCRkZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7IHZhbHVlOiAxIH0pO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0Ly8gSUUgOCBoYXMgYSBicm9rZW4gZGVmaW5lUHJvcGVydHlcblx0XHQkZGVmaW5lUHJvcGVydHkgPSBudWxsO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY2FsbEJpbmQob3JpZ2luYWxGdW5jdGlvbikge1xuXHR2YXIgZnVuYyA9ICRyZWZsZWN0QXBwbHkoYmluZCwgJGNhbGwsIGFyZ3VtZW50cyk7XG5cdGlmICgkZ09QRCAmJiAkZGVmaW5lUHJvcGVydHkpIHtcblx0XHR2YXIgZGVzYyA9ICRnT1BEKGZ1bmMsICdsZW5ndGgnKTtcblx0XHRpZiAoZGVzYy5jb25maWd1cmFibGUpIHtcblx0XHRcdC8vIG9yaWdpbmFsIGxlbmd0aCwgcGx1cyB0aGUgcmVjZWl2ZXIsIG1pbnVzIGFueSBhZGRpdGlvbmFsIGFyZ3VtZW50cyAoYWZ0ZXIgdGhlIHJlY2VpdmVyKVxuXHRcdFx0JGRlZmluZVByb3BlcnR5KFxuXHRcdFx0XHRmdW5jLFxuXHRcdFx0XHQnbGVuZ3RoJyxcblx0XHRcdFx0eyB2YWx1ZTogMSArICRtYXgoMCwgb3JpZ2luYWxGdW5jdGlvbi5sZW5ndGggLSAoYXJndW1lbnRzLmxlbmd0aCAtIDEpKSB9XG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZnVuYztcbn07XG5cbnZhciBhcHBseUJpbmQgPSBmdW5jdGlvbiBhcHBseUJpbmQoKSB7XG5cdHJldHVybiAkcmVmbGVjdEFwcGx5KGJpbmQsICRhcHBseSwgYXJndW1lbnRzKTtcbn07XG5cbmlmICgkZGVmaW5lUHJvcGVydHkpIHtcblx0JGRlZmluZVByb3BlcnR5KG1vZHVsZS5leHBvcnRzLCAnYXBwbHknLCB7IHZhbHVlOiBhcHBseUJpbmQgfSk7XG59IGVsc2Uge1xuXHRtb2R1bGUuZXhwb3J0cy5hcHBseSA9IGFwcGx5QmluZDtcbn1cbiIsIi8qIGNobmwgdjEuMi4wIGJ5IFZpdGFsaXkgUG90YXBvdiBAcHJlc2VydmUgKi9cblwidXNlIHN0cmljdFwiO2Z1bmN0aW9uIF90eXBlb2YoZSl7cmV0dXJuKF90eXBlb2Y9XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKGUpe3JldHVybiB0eXBlb2YgZX06ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmZS5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmZSE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgZX0pKGUpfWZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9ZnVuY3Rpb24gX2RlZmluZVByb3BlcnRpZXMoZSx0KXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHI9dFtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsci5rZXkscil9fWZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhlLHQsbil7cmV0dXJuIHQmJl9kZWZpbmVQcm9wZXJ0aWVzKGUucHJvdG90eXBlLHQpLG4mJl9kZWZpbmVQcm9wZXJ0aWVzKGUsbiksZX1mdW5jdGlvbiBfaW5oZXJpdHMoZSx0KXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiB0JiZudWxsIT09dCl0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7ZS5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZSh0JiZ0LnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOmUsd3JpdGFibGU6ITAsY29uZmlndXJhYmxlOiEwfX0pLHQmJl9zZXRQcm90b3R5cGVPZihlLHQpfWZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihlKXtyZXR1cm4oX2dldFByb3RvdHlwZU9mPU9iamVjdC5zZXRQcm90b3R5cGVPZj9PYmplY3QuZ2V0UHJvdG90eXBlT2Y6ZnVuY3Rpb24oZSl7cmV0dXJuIGUuX19wcm90b19ffHxPYmplY3QuZ2V0UHJvdG90eXBlT2YoZSl9KShlKX1mdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YoZSx0KXtyZXR1cm4oX3NldFByb3RvdHlwZU9mPU9iamVjdC5zZXRQcm90b3R5cGVPZnx8ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZS5fX3Byb3RvX189dCxlfSkoZSx0KX1mdW5jdGlvbiBfaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0KCl7aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIFJlZmxlY3R8fCFSZWZsZWN0LmNvbnN0cnVjdClyZXR1cm4hMTtpZihSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKXJldHVybiExO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIFByb3h5KXJldHVybiEwO3RyeXtyZXR1cm4gRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChSZWZsZWN0LmNvbnN0cnVjdChEYXRlLFtdLGZ1bmN0aW9uKCl7fSkpLCEwfWNhdGNoKGUpe3JldHVybiExfX1mdW5jdGlvbiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKGUpe2lmKHZvaWQgMD09PWUpdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO3JldHVybiBlfWZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKGUsdCl7cmV0dXJuIXR8fFwib2JqZWN0XCIhPXR5cGVvZiB0JiZcImZ1bmN0aW9uXCIhPXR5cGVvZiB0P19hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoZSk6dH1mdW5jdGlvbiBfY3JlYXRlU3VwZXIocil7dmFyIGk9X2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCgpO3JldHVybiBmdW5jdGlvbigpe3ZhciBlLHQ9X2dldFByb3RvdHlwZU9mKHIpO2lmKGkpe3ZhciBuPV9nZXRQcm90b3R5cGVPZih0aGlzKS5jb25zdHJ1Y3RvcjtlPVJlZmxlY3QuY29uc3RydWN0KHQsYXJndW1lbnRzLG4pfWVsc2UgZT10LmFwcGx5KHRoaXMsYXJndW1lbnRzKTtyZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcyxlKX19ZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGUpe3JldHVybiBfYXJyYXlXaXRob3V0SG9sZXMoZSl8fF9pdGVyYWJsZVRvQXJyYXkoZSl8fF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShlKXx8X25vbkl0ZXJhYmxlU3ByZWFkKCl9ZnVuY3Rpb24gX2FycmF5V2l0aG91dEhvbGVzKGUpe2lmKEFycmF5LmlzQXJyYXkoZSkpcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KGUpfWZ1bmN0aW9uIF9pdGVyYWJsZVRvQXJyYXkoZSl7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbCYmU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChlKSlyZXR1cm4gQXJyYXkuZnJvbShlKX1mdW5jdGlvbiBfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkoZSx0KXtpZihlKXtpZihcInN0cmluZ1wiPT10eXBlb2YgZSlyZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkoZSx0KTt2YXIgbj1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZSkuc2xpY2UoOCwtMSk7cmV0dXJuXCJPYmplY3RcIj09PW4mJmUuY29uc3RydWN0b3ImJihuPWUuY29uc3RydWN0b3IubmFtZSksXCJNYXBcIj09PW58fFwiU2V0XCI9PT1uP0FycmF5LmZyb20oZSk6XCJBcmd1bWVudHNcIj09PW58fC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pP19hcnJheUxpa2VUb0FycmF5KGUsdCk6dm9pZCAwfX1mdW5jdGlvbiBfYXJyYXlMaWtlVG9BcnJheShlLHQpeyhudWxsPT10fHx0PmUubGVuZ3RoKSYmKHQ9ZS5sZW5ndGgpO2Zvcih2YXIgbj0wLHI9bmV3IEFycmF5KHQpO248dDtuKyspcltuXT1lW25dO3JldHVybiByfWZ1bmN0aW9uIF9ub25JdGVyYWJsZVNwcmVhZCgpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gc3ByZWFkIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpfXZhciBDaGFubmVsPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYyhlKXtfY2xhc3NDYWxsQ2hlY2sodGhpcyxjKSx0aGlzLl9saXN0ZW5lcnM9W10sdGhpcy5fbXV0ZT0hMSx0aGlzLl9hY2N1bXVsYXRlPSExLHRoaXMuX2FjY3VtdWxhdGVkRXZlbnRzPVtdLHRoaXMuX25hbWU9ZXx8XCJcIix0aGlzLl9vbkxpc3RlbmVyQWRkZWQ9bnVsbCx0aGlzLl9vbkZpcnN0TGlzdGVuZXJBZGRlZD1udWxsLHRoaXMuX29uTGlzdGVuZXJSZW1vdmVkPW51bGwsdGhpcy5fb25MYXN0TGlzdGVuZXJSZW1vdmVkPW51bGx9cmV0dXJuIF9jcmVhdGVDbGFzcyhjLFt7a2V5OlwiYWRkTGlzdGVuZXJcIix2YWx1ZTpmdW5jdGlvbihlLHQpe3RoaXMuX3B1c2hMaXN0ZW5lcihlLHQsITEpfX0se2tleTpcImFkZE9uY2VMaXN0ZW5lclwiLHZhbHVlOmZ1bmN0aW9uKGUsdCl7dGhpcy5fcHVzaExpc3RlbmVyKGUsdCwhMCl9fSx7a2V5OlwicmVtb3ZlTGlzdGVuZXJcIix2YWx1ZTpmdW5jdGlvbihlLHQpe3RoaXMuX2Vuc3VyZUxpc3RlbmVyKGUpO3ZhciBuPXRoaXMuX2luZGV4T2ZMaXN0ZW5lcihlLHQpOzA8PW4mJnRoaXMuX3NwbGljZUxpc3RlbmVyKG4pfX0se2tleTpcInJlbW92ZUFsbExpc3RlbmVyc1wiLHZhbHVlOmZ1bmN0aW9uKCl7Zm9yKDt0aGlzLmhhc0xpc3RlbmVycygpOyl0aGlzLl9zcGxpY2VMaXN0ZW5lcigwKX19LHtrZXk6XCJoYXNMaXN0ZW5lclwiLHZhbHVlOmZ1bmN0aW9uKGUsdCl7cmV0dXJuIHRoaXMuX2Vuc3VyZUxpc3RlbmVyKGUpLDA8PXRoaXMuX2luZGV4T2ZMaXN0ZW5lcihlLHQpfX0se2tleTpcImhhc0xpc3RlbmVyc1wiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIDA8dGhpcy5fbGlzdGVuZXJzLmxlbmd0aH19LHtrZXk6XCJkaXNwYXRjaFwiLHZhbHVlOmZ1bmN0aW9uKCl7Zm9yKHZhciBlPWFyZ3VtZW50cy5sZW5ndGgsdD1uZXcgQXJyYXkoZSksbj0wO248ZTtuKyspdFtuXT1hcmd1bWVudHNbbl07dGhpcy5faW52b2tlTGlzdGVuZXJzKHthcmdzOnQsYXN5bmM6ITF9KX19LHtrZXk6XCJkaXNwYXRjaEFzeW5jXCIsdmFsdWU6ZnVuY3Rpb24oKXtmb3IodmFyIGU9YXJndW1lbnRzLmxlbmd0aCx0PW5ldyBBcnJheShlKSxuPTA7bjxlO24rKyl0W25dPWFyZ3VtZW50c1tuXTt0aGlzLl9pbnZva2VMaXN0ZW5lcnMoe2FyZ3M6dCxhc3luYzohMH0pfX0se2tleTpcIm11dGVcIix2YWx1ZTpmdW5jdGlvbihlKXt2YXIgdD0wPGFyZ3VtZW50cy5sZW5ndGgmJnZvaWQgMCE9PWU/ZTp7fTt0aGlzLl9tdXRlPSEwLHQuYWNjdW11bGF0ZT90aGlzLl9hY2N1bXVsYXRlPSEwOih0aGlzLl9hY2N1bXVsYXRlPSExLHRoaXMuX2FjY3VtdWxhdGVkRXZlbnRzPVtdKX19LHtrZXk6XCJ1bm11dGVcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX211dGU9ITEsdGhpcy5fYWNjdW11bGF0ZSYmKHRoaXMuX2Rpc3BhdGNoQWNjdW11bGF0ZWQoKSx0aGlzLl9hY2N1bXVsYXRlPSExKX19LHtrZXk6XCJfaW52b2tlTGlzdGVuZXJzXCIsdmFsdWU6ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcyxuPTA8YXJndW1lbnRzLmxlbmd0aCYmdm9pZCAwIT09ZT9lOnthcmdzOltdLGFzeW5jOiExfTt0aGlzLl9tdXRlP3RoaXMuX2FjY3VtdWxhdGUmJnRoaXMuX2FjY3VtdWxhdGVkRXZlbnRzLnB1c2gobik6dGhpcy5fbGlzdGVuZXJzLnNsaWNlKCkuZm9yRWFjaChmdW5jdGlvbihlKXt0Ll9pbnZva2VMaXN0ZW5lcihlLG4pLGUub25jZSYmdC5yZW1vdmVMaXN0ZW5lcihlLmNhbGxiYWNrLGUuY29udGV4dCl9KX19LHtrZXk6XCJfaW52b2tlTGlzdGVuZXJcIix2YWx1ZTpmdW5jdGlvbihlLHQpe3ZhciBuLHIsaT1lLmNhbGxiYWNrIGluc3RhbmNlb2YgYzt0LmFzeW5jP2k/KG49ZS5jYWxsYmFjaykuZGlzcGF0Y2hBc3luYy5hcHBseShuLF90b0NvbnN1bWFibGVBcnJheSh0LmFyZ3MpKTpzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7cmV0dXJuIGUuY2FsbGJhY2suYXBwbHkoZS5jb250ZXh0LHQuYXJncyl9LDApOmk/KHI9ZS5jYWxsYmFjaykuZGlzcGF0Y2guYXBwbHkocixfdG9Db25zdW1hYmxlQXJyYXkodC5hcmdzKSk6ZS5jYWxsYmFjay5hcHBseShlLmNvbnRleHQsdC5hcmdzKX19LHtrZXk6XCJfZW5zdXJlTGlzdGVuZXJcIix2YWx1ZTpmdW5jdGlvbihlKXtpZighYy5pc1ZhbGlkTGlzdGVuZXIoZSkpdGhyb3cgbmV3IEVycm9yKFwiQ2hhbm5lbCBcIit0aGlzLl9uYW1lK1wiOiBsaXN0ZW5lciBpcyBub3QgYSBmdW5jdGlvbiBhbmQgbm90IGEgQ2hhbm5lbFwiKX19LHtrZXk6XCJfZGlzcGF0Y2hJbm5lckFkZEV2ZW50c1wiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIGUsdDt0aGlzLl9vbkxpc3RlbmVyQWRkZWQmJihlPXRoaXMuX29uTGlzdGVuZXJBZGRlZCkuZGlzcGF0Y2guYXBwbHkoZSxhcmd1bWVudHMpO3RoaXMuX29uRmlyc3RMaXN0ZW5lckFkZGVkJiYxPT09dGhpcy5fbGlzdGVuZXJzLmxlbmd0aCYmKHQ9dGhpcy5fb25GaXJzdExpc3RlbmVyQWRkZWQpLmRpc3BhdGNoLmFwcGx5KHQsYXJndW1lbnRzKX19LHtrZXk6XCJfZGlzcGF0Y2hJbm5lclJlbW92ZUV2ZW50c1wiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIGUsdDt0aGlzLl9vbkxpc3RlbmVyUmVtb3ZlZCYmKGU9dGhpcy5fb25MaXN0ZW5lclJlbW92ZWQpLmRpc3BhdGNoLmFwcGx5KGUsYXJndW1lbnRzKTt0aGlzLl9vbkxhc3RMaXN0ZW5lclJlbW92ZWQmJjA9PT10aGlzLl9saXN0ZW5lcnMubGVuZ3RoJiYodD10aGlzLl9vbkxhc3RMaXN0ZW5lclJlbW92ZWQpLmRpc3BhdGNoLmFwcGx5KHQsYXJndW1lbnRzKX19LHtrZXk6XCJfaW5kZXhPZkxpc3RlbmVyXCIsdmFsdWU6ZnVuY3Rpb24oZSx0KXtmb3IodmFyIG49MDtuPHRoaXMuX2xpc3RlbmVycy5sZW5ndGg7bisrKXt2YXIgcj10aGlzLl9saXN0ZW5lcnNbbl0saT1yLmNhbGxiYWNrPT09ZSxzPWUgaW5zdGFuY2VvZiBjLG89dm9pZCAwPT09dCYmdm9pZCAwPT09ci5jb250ZXh0LGE9dD09PXIuY29udGV4dDtpZihpJiYoc3x8b3x8YSkpcmV0dXJuIG59fX0se2tleTpcIl9kaXNwYXRjaEFjY3VtdWxhdGVkXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdD10aGlzO3RoaXMuX2FjY3VtdWxhdGVkRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZSl7cmV0dXJuIHQuX2ludm9rZUxpc3RlbmVycyhlKX0pLHRoaXMuX2FjY3VtdWxhdGVkRXZlbnRzPVtdfX0se2tleTpcIl9wdXNoTGlzdGVuZXJcIix2YWx1ZTpmdW5jdGlvbihlLHQsbil7dGhpcy5fZW5zdXJlTGlzdGVuZXIoZSksdGhpcy5fY2hlY2tGb3JEdXBsaWNhdGVzKGUsdCksdGhpcy5fbGlzdGVuZXJzLnB1c2goe2NhbGxiYWNrOmUsY29udGV4dDp0LG9uY2U6bn0pLHRoaXMuX2Rpc3BhdGNoSW5uZXJBZGRFdmVudHMoZSx0LG4pfX0se2tleTpcIl9jaGVja0ZvckR1cGxpY2F0ZXNcIix2YWx1ZTpmdW5jdGlvbihlLHQpe2lmKHRoaXMuaGFzTGlzdGVuZXIoZSx0KSl0aHJvdyBuZXcgRXJyb3IoXCJDaGFubmVsIFwiK3RoaXMuX25hbWUrXCI6IGR1cGxpY2F0aW5nIGxpc3RlbmVyc1wiKX19LHtrZXk6XCJfc3BsaWNlTGlzdGVuZXJcIix2YWx1ZTpmdW5jdGlvbihlKXt2YXIgdD10aGlzLl9saXN0ZW5lcnNbZV0sbj10LmNhbGxiYWNrLHI9dC5jb250ZXh0LGk9dC5vbmNlO3RoaXMuX2xpc3RlbmVycy5zcGxpY2UoZSwxKSx0aGlzLl9kaXNwYXRjaElubmVyUmVtb3ZlRXZlbnRzKG4scixpKX19LHtrZXk6XCJvbkxpc3RlbmVyQWRkZWRcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fb25MaXN0ZW5lckFkZGVkfHwodGhpcy5fb25MaXN0ZW5lckFkZGVkPW5ldyBjKFwiXCIuY29uY2F0KHRoaXMuX25hbWUsXCI6b25MaXN0ZW5lckFkZGVkXCIpKSksdGhpcy5fb25MaXN0ZW5lckFkZGVkfX0se2tleTpcIm9uRmlyc3RMaXN0ZW5lckFkZGVkXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX29uRmlyc3RMaXN0ZW5lckFkZGVkfHwodGhpcy5fb25GaXJzdExpc3RlbmVyQWRkZWQ9bmV3IGMoXCJcIi5jb25jYXQodGhpcy5fbmFtZSxcIjpvbkZpcnN0TGlzdGVuZXJBZGRlZFwiKSkpLHRoaXMuX29uRmlyc3RMaXN0ZW5lckFkZGVkfX0se2tleTpcIm9uTGlzdGVuZXJSZW1vdmVkXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX29uTGlzdGVuZXJSZW1vdmVkfHwodGhpcy5fb25MaXN0ZW5lclJlbW92ZWQ9bmV3IGMoXCJcIi5jb25jYXQodGhpcy5fbmFtZSxcIjpvbkxpc3RlbmVyUmVtb3ZlZFwiKSkpLHRoaXMuX29uTGlzdGVuZXJSZW1vdmVkfX0se2tleTpcIm9uTGFzdExpc3RlbmVyUmVtb3ZlZFwiLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9vbkxhc3RMaXN0ZW5lclJlbW92ZWR8fCh0aGlzLl9vbkxhc3RMaXN0ZW5lclJlbW92ZWQ9bmV3IGMoXCJcIi5jb25jYXQodGhpcy5fbmFtZSxcIjpvbkxhc3RMaXN0ZW5lclJlbW92ZWRcIikpKSx0aGlzLl9vbkxhc3RMaXN0ZW5lclJlbW92ZWR9fV0sW3trZXk6XCJpc1ZhbGlkTGlzdGVuZXJcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiBlfHxlIGluc3RhbmNlb2YgY319XSksY30oKSxFdmVudEVtaXR0ZXI9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKCl7X2NsYXNzQ2FsbENoZWNrKHRoaXMsZSksdGhpcy5fY2hhbm5lbHM9bmV3IE1hcH1yZXR1cm4gX2NyZWF0ZUNsYXNzKGUsW3trZXk6XCJhZGRMaXN0ZW5lclwiLHZhbHVlOmZ1bmN0aW9uKGUsdCxuKXt0aGlzLl9nZXRDaGFubmVsKGUpLmFkZExpc3RlbmVyKHQsbil9fSx7a2V5Olwib25cIix2YWx1ZTpmdW5jdGlvbihlLHQsbil7dGhpcy5hZGRMaXN0ZW5lcihlLHQsbil9fSx7a2V5OlwiYWRkT25jZUxpc3RlbmVyXCIsdmFsdWU6ZnVuY3Rpb24oZSx0LG4pe3RoaXMuX2dldENoYW5uZWwoZSkuYWRkT25jZUxpc3RlbmVyKHQsbil9fSx7a2V5Olwib25jZVwiLHZhbHVlOmZ1bmN0aW9uKGUsdCxuKXt0aGlzLmFkZE9uY2VMaXN0ZW5lcihlLHQsbil9fSx7a2V5OlwicmVtb3ZlTGlzdGVuZXJcIix2YWx1ZTpmdW5jdGlvbihlLHQsbil7dGhpcy5fZ2V0Q2hhbm5lbChlKS5yZW1vdmVMaXN0ZW5lcih0LG4pfX0se2tleTpcIm9mZlwiLHZhbHVlOmZ1bmN0aW9uKGUsdCxuKXt0aGlzLnJlbW92ZUxpc3RlbmVyKGUsdCxuKX19LHtrZXk6XCJoYXNMaXN0ZW5lclwiLHZhbHVlOmZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gdGhpcy5fZ2V0Q2hhbm5lbChlKS5oYXNMaXN0ZW5lcih0LG4pfX0se2tleTpcImhhc1wiLHZhbHVlOmZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gdGhpcy5oYXNMaXN0ZW5lcihlLHQsbil9fSx7a2V5OlwiaGFzTGlzdGVuZXJzXCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX2dldENoYW5uZWwoZSkuaGFzTGlzdGVuZXJzKCl9fSx7a2V5OlwiZGlzcGF0Y2hcIix2YWx1ZTpmdW5jdGlvbihlKXtmb3IodmFyIHQsbj1hcmd1bWVudHMubGVuZ3RoLHI9bmV3IEFycmF5KDE8bj9uLTE6MCksaT0xO2k8bjtpKyspcltpLTFdPWFyZ3VtZW50c1tpXTsodD10aGlzLl9nZXRDaGFubmVsKGUpKS5kaXNwYXRjaC5hcHBseSh0LHIpfX0se2tleTpcImVtaXRcIix2YWx1ZTpmdW5jdGlvbihlKXtmb3IodmFyIHQ9YXJndW1lbnRzLmxlbmd0aCxuPW5ldyBBcnJheSgxPHQ/dC0xOjApLHI9MTtyPHQ7cisrKW5bci0xXT1hcmd1bWVudHNbcl07dGhpcy5kaXNwYXRjaC5hcHBseSh0aGlzLFtlXS5jb25jYXQobikpfX0se2tleTpcIl9nZXRDaGFubmVsXCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX2NoYW5uZWxzLmhhcyhlKXx8dGhpcy5fY2hhbm5lbHMuc2V0KGUsbmV3IENoYW5uZWwoZSkpLHRoaXMuX2NoYW5uZWxzLmdldChlKX19XSksZX0oKSxTdWJzY3JpcHRpb25JdGVtPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXtfY2xhc3NDYWxsQ2hlY2sodGhpcyx0KSx0aGlzLl9wYXJhbXM9ZSx0aGlzLl9pc09uPSExLHRoaXMuX2Fzc2VydFBhcmFtcygpfXJldHVybiBfY3JlYXRlQ2xhc3ModCxbe2tleTpcIm9uXCIsdmFsdWU6ZnVuY3Rpb24oKXtpZighdGhpcy5faXNPbil7dmFyIGU9dGhpcy5fcGFyYW1zLmNoYW5uZWwsdD1lLmFkZExpc3RlbmVyfHxlLmFkZEV2ZW50TGlzdGVuZXJ8fGUub247dGhpcy5fYXBwbHlNZXRob2QodCksdGhpcy5faXNPbj0hMH19fSx7a2V5Olwib2ZmXCIsdmFsdWU6ZnVuY3Rpb24oKXtpZih0aGlzLl9pc09uKXt2YXIgZT10aGlzLl9wYXJhbXMuY2hhbm5lbCx0PWUucmVtb3ZlTGlzdGVuZXJ8fGUucmVtb3ZlRXZlbnRMaXN0ZW5lcnx8ZS5vZmY7dGhpcy5fYXBwbHlNZXRob2QodCksdGhpcy5faXNPbj0hMX19fSx7a2V5OlwiX2FwcGx5TWV0aG9kXCIsdmFsdWU6ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcy5fcGFyYW1zLG49dC5jaGFubmVsLHI9dC5ldmVudCxpPXQubGlzdGVuZXIscz1yP1tyLGldOltpXTtlLmFwcGx5KG4scyl9fSx7a2V5OlwiX2Fzc2VydFBhcmFtc1wiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5fcGFyYW1zLHQ9ZS5jaGFubmVsLG49ZS5ldmVudCxyPWUubGlzdGVuZXI7aWYoIXR8fFwib2JqZWN0XCIhPT1fdHlwZW9mKHQpKXRocm93IG5ldyBFcnJvcihcIkNoYW5uZWwgc2hvdWxkIGJlIG9iamVjdFwiKTtpZihuJiZcInN0cmluZ1wiIT10eXBlb2Ygbil0aHJvdyBuZXcgRXJyb3IoXCJFdmVudCBzaG91bGQgYmUgc3RyaW5nXCIpO2lmKCFyfHwhQ2hhbm5lbC5pc1ZhbGlkTGlzdGVuZXIocikpdGhyb3cgbmV3IEVycm9yKFwiTGlzdGVuZXIgc2hvdWxkIGJlIGZ1bmN0aW9uIG9yIENoYW5uZWxcIil9fV0pLHR9KCksU3Vic2NyaXB0aW9uPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXtfY2xhc3NDYWxsQ2hlY2sodGhpcyx0KSx0aGlzLl9pdGVtcz1lLm1hcChmdW5jdGlvbihlKXtyZXR1cm4gbmV3IFN1YnNjcmlwdGlvbkl0ZW0oZSl9KX1yZXR1cm4gX2NyZWF0ZUNsYXNzKHQsW3trZXk6XCJvblwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2l0ZW1zLmZvckVhY2goZnVuY3Rpb24oZSl7cmV0dXJuIGUub24oKX0pLHRoaXN9fSx7a2V5Olwib2ZmXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5faXRlbXMuZm9yRWFjaChmdW5jdGlvbihlKXtyZXR1cm4gZS5vZmYoKX0pLHRoaXN9fV0pLHR9KCksUmVhY3RTdWJzY3JpcHRpb249ZnVuY3Rpb24oKXtfaW5oZXJpdHMoaSxTdWJzY3JpcHRpb24pO3ZhciByPV9jcmVhdGVTdXBlcihpKTtmdW5jdGlvbiBpKGUsdCl7dmFyIG47cmV0dXJuIF9jbGFzc0NhbGxDaGVjayh0aGlzLGkpLChuPXIuY2FsbCh0aGlzLHQpKS5fb3ZlcnJpZGVDb21wb25lbnRDYWxsYmFjayhlLFwiY29tcG9uZW50RGlkTW91bnRcIixcIm9uXCIpLG4uX292ZXJyaWRlQ29tcG9uZW50Q2FsbGJhY2soZSxcImNvbXBvbmVudFdpbGxVbm1vdW50XCIsXCJvZmZcIiksbn1yZXR1cm4gX2NyZWF0ZUNsYXNzKGksW3trZXk6XCJfb3ZlcnJpZGVDb21wb25lbnRDYWxsYmFja1wiLHZhbHVlOmZ1bmN0aW9uKHIsZSxpKXt2YXIgcz10aGlzLG89cltlXTtyW2VdPWZ1bmN0aW9uKCl7aWYoc1tpXSgpLFwiZnVuY3Rpb25cIj09dHlwZW9mIG8pe2Zvcih2YXIgZT1hcmd1bWVudHMubGVuZ3RoLHQ9bmV3IEFycmF5KGUpLG49MDtuPGU7bisrKXRbbl09YXJndW1lbnRzW25dO3JldHVybiBvLmFwcGx5KHIsdCl9fX19XSksaX0oKSxjaG5sPUNoYW5uZWw7Y2hubC5FdmVudEVtaXR0ZXI9RXZlbnRFbWl0dGVyLGNobmwuU3Vic2NyaXB0aW9uPVN1YnNjcmlwdGlvbixjaG5sLlJlYWN0U3Vic2NyaXB0aW9uPVJlYWN0U3Vic2NyaXB0aW9uLG1vZHVsZS5leHBvcnRzPWNobmw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBrZXlzID0gcmVxdWlyZSgnb2JqZWN0LWtleXMnKTtcbnZhciBoYXNTeW1ib2xzID0gdHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgU3ltYm9sKCdmb28nKSA9PT0gJ3N5bWJvbCc7XG5cbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIgY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcbnZhciBvcmlnRGVmaW5lUHJvcGVydHkgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XG5cbnZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gKGZuKSB7XG5cdHJldHVybiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicgJiYgdG9TdHIuY2FsbChmbikgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59O1xuXG52YXIgaGFzUHJvcGVydHlEZXNjcmlwdG9ycyA9IHJlcXVpcmUoJ2hhcy1wcm9wZXJ0eS1kZXNjcmlwdG9ycycpKCk7XG5cbnZhciBzdXBwb3J0c0Rlc2NyaXB0b3JzID0gb3JpZ0RlZmluZVByb3BlcnR5ICYmIGhhc1Byb3BlcnR5RGVzY3JpcHRvcnM7XG5cbnZhciBkZWZpbmVQcm9wZXJ0eSA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUsIHZhbHVlLCBwcmVkaWNhdGUpIHtcblx0aWYgKG5hbWUgaW4gb2JqZWN0ICYmICghaXNGdW5jdGlvbihwcmVkaWNhdGUpIHx8ICFwcmVkaWNhdGUoKSkpIHtcblx0XHRyZXR1cm47XG5cdH1cblx0aWYgKHN1cHBvcnRzRGVzY3JpcHRvcnMpIHtcblx0XHRvcmlnRGVmaW5lUHJvcGVydHkob2JqZWN0LCBuYW1lLCB7XG5cdFx0XHRjb25maWd1cmFibGU6IHRydWUsXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHRcdHZhbHVlOiB2YWx1ZSxcblx0XHRcdHdyaXRhYmxlOiB0cnVlXG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0b2JqZWN0W25hbWVdID0gdmFsdWU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cblx0fVxufTtcblxudmFyIGRlZmluZVByb3BlcnRpZXMgPSBmdW5jdGlvbiAob2JqZWN0LCBtYXApIHtcblx0dmFyIHByZWRpY2F0ZXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMiA/IGFyZ3VtZW50c1syXSA6IHt9O1xuXHR2YXIgcHJvcHMgPSBrZXlzKG1hcCk7XG5cdGlmIChoYXNTeW1ib2xzKSB7XG5cdFx0cHJvcHMgPSBjb25jYXQuY2FsbChwcm9wcywgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhtYXApKTtcblx0fVxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0ZGVmaW5lUHJvcGVydHkob2JqZWN0LCBwcm9wc1tpXSwgbWFwW3Byb3BzW2ldXSwgcHJlZGljYXRlc1twcm9wc1tpXV0pO1xuXHR9XG59O1xuXG5kZWZpbmVQcm9wZXJ0aWVzLnN1cHBvcnRzRGVzY3JpcHRvcnMgPSAhIXN1cHBvcnRzRGVzY3JpcHRvcnM7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmaW5lUHJvcGVydGllcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEdldEludHJpbnNpYyA9IHJlcXVpcmUoJ2dldC1pbnRyaW5zaWMnKTtcblxudmFyICRUeXBlRXJyb3IgPSBHZXRJbnRyaW5zaWMoJyVUeXBlRXJyb3IlJyk7XG5cbnZhciBpc1Byb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaXNQcm9wZXJ0eURlc2NyaXB0b3InKTtcbnZhciBEZWZpbmVPd25Qcm9wZXJ0eSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvRGVmaW5lT3duUHJvcGVydHknKTtcblxudmFyIEZyb21Qcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuL0Zyb21Qcm9wZXJ0eURlc2NyaXB0b3InKTtcbnZhciBJc0FjY2Vzc29yRGVzY3JpcHRvciA9IHJlcXVpcmUoJy4vSXNBY2Nlc3NvckRlc2NyaXB0b3InKTtcbnZhciBJc0RhdGFEZXNjcmlwdG9yID0gcmVxdWlyZSgnLi9Jc0RhdGFEZXNjcmlwdG9yJyk7XG52YXIgSXNQcm9wZXJ0eUtleSA9IHJlcXVpcmUoJy4vSXNQcm9wZXJ0eUtleScpO1xudmFyIFNhbWVWYWx1ZSA9IHJlcXVpcmUoJy4vU2FtZVZhbHVlJyk7XG52YXIgVG9Qcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuL1RvUHJvcGVydHlEZXNjcmlwdG9yJyk7XG52YXIgVHlwZSA9IHJlcXVpcmUoJy4vVHlwZScpO1xuXG4vLyBodHRwczovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtZGVmaW5lcHJvcGVydHlvcnRocm93XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRGVmaW5lUHJvcGVydHlPclRocm93KE8sIFAsIGRlc2MpIHtcblx0aWYgKFR5cGUoTykgIT09ICdPYmplY3QnKSB7XG5cdFx0dGhyb3cgbmV3ICRUeXBlRXJyb3IoJ0Fzc2VydGlvbiBmYWlsZWQ6IFR5cGUoTykgaXMgbm90IE9iamVjdCcpO1xuXHR9XG5cblx0aWYgKCFJc1Byb3BlcnR5S2V5KFApKSB7XG5cdFx0dGhyb3cgbmV3ICRUeXBlRXJyb3IoJ0Fzc2VydGlvbiBmYWlsZWQ6IElzUHJvcGVydHlLZXkoUCkgaXMgbm90IHRydWUnKTtcblx0fVxuXG5cdHZhciBEZXNjID0gaXNQcm9wZXJ0eURlc2NyaXB0b3Ioe1xuXHRcdFR5cGU6IFR5cGUsXG5cdFx0SXNEYXRhRGVzY3JpcHRvcjogSXNEYXRhRGVzY3JpcHRvcixcblx0XHRJc0FjY2Vzc29yRGVzY3JpcHRvcjogSXNBY2Nlc3NvckRlc2NyaXB0b3Jcblx0fSwgZGVzYykgPyBkZXNjIDogVG9Qcm9wZXJ0eURlc2NyaXB0b3IoZGVzYyk7XG5cdGlmICghaXNQcm9wZXJ0eURlc2NyaXB0b3Ioe1xuXHRcdFR5cGU6IFR5cGUsXG5cdFx0SXNEYXRhRGVzY3JpcHRvcjogSXNEYXRhRGVzY3JpcHRvcixcblx0XHRJc0FjY2Vzc29yRGVzY3JpcHRvcjogSXNBY2Nlc3NvckRlc2NyaXB0b3Jcblx0fSwgRGVzYykpIHtcblx0XHR0aHJvdyBuZXcgJFR5cGVFcnJvcignQXNzZXJ0aW9uIGZhaWxlZDogRGVzYyBpcyBub3QgYSB2YWxpZCBQcm9wZXJ0eSBEZXNjcmlwdG9yJyk7XG5cdH1cblxuXHRyZXR1cm4gRGVmaW5lT3duUHJvcGVydHkoXG5cdFx0SXNEYXRhRGVzY3JpcHRvcixcblx0XHRTYW1lVmFsdWUsXG5cdFx0RnJvbVByb3BlcnR5RGVzY3JpcHRvcixcblx0XHRPLFxuXHRcdFAsXG5cdFx0RGVzY1xuXHQpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGFzc2VydFJlY29yZCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYXNzZXJ0UmVjb3JkJyk7XG52YXIgZnJvbVByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZnJvbVByb3BlcnR5RGVzY3JpcHRvcicpO1xuXG52YXIgVHlwZSA9IHJlcXVpcmUoJy4vVHlwZScpO1xuXG4vLyBodHRwczovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtZnJvbXByb3BlcnR5ZGVzY3JpcHRvclxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEZyb21Qcm9wZXJ0eURlc2NyaXB0b3IoRGVzYykge1xuXHRpZiAodHlwZW9mIERlc2MgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0YXNzZXJ0UmVjb3JkKFR5cGUsICdQcm9wZXJ0eSBEZXNjcmlwdG9yJywgJ0Rlc2MnLCBEZXNjKTtcblx0fVxuXG5cdHJldHVybiBmcm9tUHJvcGVydHlEZXNjcmlwdG9yKERlc2MpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhcyA9IHJlcXVpcmUoJ2hhcycpO1xuXG52YXIgYXNzZXJ0UmVjb3JkID0gcmVxdWlyZSgnLi4vaGVscGVycy9hc3NlcnRSZWNvcmQnKTtcblxudmFyIFR5cGUgPSByZXF1aXJlKCcuL1R5cGUnKTtcblxuLy8gaHR0cHM6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLWlzYWNjZXNzb3JkZXNjcmlwdG9yXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gSXNBY2Nlc3NvckRlc2NyaXB0b3IoRGVzYykge1xuXHRpZiAodHlwZW9mIERlc2MgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0YXNzZXJ0UmVjb3JkKFR5cGUsICdQcm9wZXJ0eSBEZXNjcmlwdG9yJywgJ0Rlc2MnLCBEZXNjKTtcblxuXHRpZiAoIWhhcyhEZXNjLCAnW1tHZXRdXScpICYmICFoYXMoRGVzYywgJ1tbU2V0XV0nKSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHJldHVybiB0cnVlO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gaHR0cDovLzI2Mi5lY21hLWludGVybmF0aW9uYWwub3JnLzUuMS8jc2VjLTkuMTFcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdpcy1jYWxsYWJsZScpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgR2V0SW50cmluc2ljID0gcmVxdWlyZSgnLi4vR2V0SW50cmluc2ljLmpzJyk7XG5cbnZhciAkY29uc3RydWN0ID0gR2V0SW50cmluc2ljKCclUmVmbGVjdC5jb25zdHJ1Y3QlJywgdHJ1ZSk7XG5cbnZhciBEZWZpbmVQcm9wZXJ0eU9yVGhyb3cgPSByZXF1aXJlKCcuL0RlZmluZVByb3BlcnR5T3JUaHJvdycpO1xudHJ5IHtcblx0RGVmaW5lUHJvcGVydHlPclRocm93KHt9LCAnJywgeyAnW1tHZXRdXSc6IGZ1bmN0aW9uICgpIHt9IH0pO1xufSBjYXRjaCAoZSkge1xuXHQvLyBBY2Nlc3NvciBwcm9wZXJ0aWVzIGFyZW4ndCBzdXBwb3J0ZWRcblx0RGVmaW5lUHJvcGVydHlPclRocm93ID0gbnVsbDtcbn1cblxuLy8gaHR0cHM6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLWlzY29uc3RydWN0b3JcblxuaWYgKERlZmluZVByb3BlcnR5T3JUaHJvdyAmJiAkY29uc3RydWN0KSB7XG5cdHZhciBpc0NvbnN0cnVjdG9yTWFya2VyID0ge307XG5cdHZhciBiYWRBcnJheUxpa2UgPSB7fTtcblx0RGVmaW5lUHJvcGVydHlPclRocm93KGJhZEFycmF5TGlrZSwgJ2xlbmd0aCcsIHtcblx0XHQnW1tHZXRdXSc6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHRocm93IGlzQ29uc3RydWN0b3JNYXJrZXI7XG5cdFx0fSxcblx0XHQnW1tFbnVtZXJhYmxlXV0nOiB0cnVlXG5cdH0pO1xuXG5cdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gSXNDb25zdHJ1Y3Rvcihhcmd1bWVudCkge1xuXHRcdHRyeSB7XG5cdFx0XHQvLyBgUmVmbGVjdC5jb25zdHJ1Y3RgIGludm9rZXMgYElzQ29uc3RydWN0b3IodGFyZ2V0KWAgYmVmb3JlIGBHZXQoYXJncywgJ2xlbmd0aCcpYDpcblx0XHRcdCRjb25zdHJ1Y3QoYXJndW1lbnQsIGJhZEFycmF5TGlrZSk7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRyZXR1cm4gZXJyID09PSBpc0NvbnN0cnVjdG9yTWFya2VyO1xuXHRcdH1cblx0fTtcbn0gZWxzZSB7XG5cdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gSXNDb25zdHJ1Y3Rvcihhcmd1bWVudCkge1xuXHRcdC8vIHVuZm9ydHVuYXRlbHkgdGhlcmUncyBubyB3YXkgdG8gdHJ1bHkgY2hlY2sgdGhpcyB3aXRob3V0IHRyeS9jYXRjaCBgbmV3IGFyZ3VtZW50YCBpbiBvbGQgZW52aXJvbm1lbnRzXG5cdFx0cmV0dXJuIHR5cGVvZiBhcmd1bWVudCA9PT0gJ2Z1bmN0aW9uJyAmJiAhIWFyZ3VtZW50LnByb3RvdHlwZTtcblx0fTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhcyA9IHJlcXVpcmUoJ2hhcycpO1xuXG52YXIgYXNzZXJ0UmVjb3JkID0gcmVxdWlyZSgnLi4vaGVscGVycy9hc3NlcnRSZWNvcmQnKTtcblxudmFyIFR5cGUgPSByZXF1aXJlKCcuL1R5cGUnKTtcblxuLy8gaHR0cHM6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLWlzZGF0YWRlc2NyaXB0b3JcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBJc0RhdGFEZXNjcmlwdG9yKERlc2MpIHtcblx0aWYgKHR5cGVvZiBEZXNjID09PSAndW5kZWZpbmVkJykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGFzc2VydFJlY29yZChUeXBlLCAnUHJvcGVydHkgRGVzY3JpcHRvcicsICdEZXNjJywgRGVzYyk7XG5cblx0aWYgKCFoYXMoRGVzYywgJ1tbVmFsdWVdXScpICYmICFoYXMoRGVzYywgJ1tbV3JpdGFibGVdXScpKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cmV0dXJuIHRydWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBodHRwczovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtaXNwcm9wZXJ0eWtleVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIElzUHJvcGVydHlLZXkoYXJndW1lbnQpIHtcblx0cmV0dXJuIHR5cGVvZiBhcmd1bWVudCA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGFyZ3VtZW50ID09PSAnc3ltYm9sJztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciAkaXNOYU4gPSByZXF1aXJlKCcuLi9oZWxwZXJzL2lzTmFOJyk7XG5cbi8vIGh0dHA6Ly8yNjIuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy81LjEvI3NlYy05LjEyXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gU2FtZVZhbHVlKHgsIHkpIHtcblx0aWYgKHggPT09IHkpIHsgLy8gMCA9PT0gLTAsIGJ1dCB0aGV5IGFyZSBub3QgaWRlbnRpY2FsLlxuXHRcdGlmICh4ID09PSAwKSB7IHJldHVybiAxIC8geCA9PT0gMSAvIHk7IH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gJGlzTmFOKHgpICYmICRpc05hTih5KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBHZXRJbnRyaW5zaWMgPSByZXF1aXJlKCdnZXQtaW50cmluc2ljJyk7XG5cbnZhciAkc3BlY2llcyA9IEdldEludHJpbnNpYygnJVN5bWJvbC5zcGVjaWVzJScsIHRydWUpO1xudmFyICRUeXBlRXJyb3IgPSBHZXRJbnRyaW5zaWMoJyVUeXBlRXJyb3IlJyk7XG5cbnZhciBJc0NvbnN0cnVjdG9yID0gcmVxdWlyZSgnLi9Jc0NvbnN0cnVjdG9yJyk7XG52YXIgVHlwZSA9IHJlcXVpcmUoJy4vVHlwZScpO1xuXG4vLyBodHRwczovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtc3BlY2llc2NvbnN0cnVjdG9yXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gU3BlY2llc0NvbnN0cnVjdG9yKE8sIGRlZmF1bHRDb25zdHJ1Y3Rvcikge1xuXHRpZiAoVHlwZShPKSAhPT0gJ09iamVjdCcpIHtcblx0XHR0aHJvdyBuZXcgJFR5cGVFcnJvcignQXNzZXJ0aW9uIGZhaWxlZDogVHlwZShPKSBpcyBub3QgT2JqZWN0Jyk7XG5cdH1cblx0dmFyIEMgPSBPLmNvbnN0cnVjdG9yO1xuXHRpZiAodHlwZW9mIEMgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0cmV0dXJuIGRlZmF1bHRDb25zdHJ1Y3Rvcjtcblx0fVxuXHRpZiAoVHlwZShDKSAhPT0gJ09iamVjdCcpIHtcblx0XHR0aHJvdyBuZXcgJFR5cGVFcnJvcignTy5jb25zdHJ1Y3RvciBpcyBub3QgYW4gT2JqZWN0Jyk7XG5cdH1cblx0dmFyIFMgPSAkc3BlY2llcyA/IENbJHNwZWNpZXNdIDogdm9pZCAwO1xuXHRpZiAoUyA9PSBudWxsKSB7XG5cdFx0cmV0dXJuIGRlZmF1bHRDb25zdHJ1Y3Rvcjtcblx0fVxuXHRpZiAoSXNDb25zdHJ1Y3RvcihTKSkge1xuXHRcdHJldHVybiBTO1xuXHR9XG5cdHRocm93IG5ldyAkVHlwZUVycm9yKCdubyBjb25zdHJ1Y3RvciBmb3VuZCcpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gaHR0cDovLzI2Mi5lY21hLWludGVybmF0aW9uYWwub3JnLzUuMS8jc2VjLTkuMlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFRvQm9vbGVhbih2YWx1ZSkgeyByZXR1cm4gISF2YWx1ZTsgfTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhcyA9IHJlcXVpcmUoJ2hhcycpO1xuXG52YXIgR2V0SW50cmluc2ljID0gcmVxdWlyZSgnZ2V0LWludHJpbnNpYycpO1xuXG52YXIgJFR5cGVFcnJvciA9IEdldEludHJpbnNpYygnJVR5cGVFcnJvciUnKTtcblxudmFyIFR5cGUgPSByZXF1aXJlKCcuL1R5cGUnKTtcbnZhciBUb0Jvb2xlYW4gPSByZXF1aXJlKCcuL1RvQm9vbGVhbicpO1xudmFyIElzQ2FsbGFibGUgPSByZXF1aXJlKCcuL0lzQ2FsbGFibGUnKTtcblxuLy8gaHR0cHM6Ly8yNjIuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy81LjEvI3NlYy04LjEwLjVcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBUb1Byb3BlcnR5RGVzY3JpcHRvcihPYmopIHtcblx0aWYgKFR5cGUoT2JqKSAhPT0gJ09iamVjdCcpIHtcblx0XHR0aHJvdyBuZXcgJFR5cGVFcnJvcignVG9Qcm9wZXJ0eURlc2NyaXB0b3IgcmVxdWlyZXMgYW4gb2JqZWN0Jyk7XG5cdH1cblxuXHR2YXIgZGVzYyA9IHt9O1xuXHRpZiAoaGFzKE9iaiwgJ2VudW1lcmFibGUnKSkge1xuXHRcdGRlc2NbJ1tbRW51bWVyYWJsZV1dJ10gPSBUb0Jvb2xlYW4oT2JqLmVudW1lcmFibGUpO1xuXHR9XG5cdGlmIChoYXMoT2JqLCAnY29uZmlndXJhYmxlJykpIHtcblx0XHRkZXNjWydbW0NvbmZpZ3VyYWJsZV1dJ10gPSBUb0Jvb2xlYW4oT2JqLmNvbmZpZ3VyYWJsZSk7XG5cdH1cblx0aWYgKGhhcyhPYmosICd2YWx1ZScpKSB7XG5cdFx0ZGVzY1snW1tWYWx1ZV1dJ10gPSBPYmoudmFsdWU7XG5cdH1cblx0aWYgKGhhcyhPYmosICd3cml0YWJsZScpKSB7XG5cdFx0ZGVzY1snW1tXcml0YWJsZV1dJ10gPSBUb0Jvb2xlYW4oT2JqLndyaXRhYmxlKTtcblx0fVxuXHRpZiAoaGFzKE9iaiwgJ2dldCcpKSB7XG5cdFx0dmFyIGdldHRlciA9IE9iai5nZXQ7XG5cdFx0aWYgKHR5cGVvZiBnZXR0ZXIgIT09ICd1bmRlZmluZWQnICYmICFJc0NhbGxhYmxlKGdldHRlcikpIHtcblx0XHRcdHRocm93IG5ldyAkVHlwZUVycm9yKCdnZXR0ZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cdFx0fVxuXHRcdGRlc2NbJ1tbR2V0XV0nXSA9IGdldHRlcjtcblx0fVxuXHRpZiAoaGFzKE9iaiwgJ3NldCcpKSB7XG5cdFx0dmFyIHNldHRlciA9IE9iai5zZXQ7XG5cdFx0aWYgKHR5cGVvZiBzZXR0ZXIgIT09ICd1bmRlZmluZWQnICYmICFJc0NhbGxhYmxlKHNldHRlcikpIHtcblx0XHRcdHRocm93IG5ldyAkVHlwZUVycm9yKCdzZXR0ZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cdFx0fVxuXHRcdGRlc2NbJ1tbU2V0XV0nXSA9IHNldHRlcjtcblx0fVxuXG5cdGlmICgoaGFzKGRlc2MsICdbW0dldF1dJykgfHwgaGFzKGRlc2MsICdbW1NldF1dJykpICYmIChoYXMoZGVzYywgJ1tbVmFsdWVdXScpIHx8IGhhcyhkZXNjLCAnW1tXcml0YWJsZV1dJykpKSB7XG5cdFx0dGhyb3cgbmV3ICRUeXBlRXJyb3IoJ0ludmFsaWQgcHJvcGVydHkgZGVzY3JpcHRvci4gQ2Fubm90IGJvdGggc3BlY2lmeSBhY2Nlc3NvcnMgYW5kIGEgdmFsdWUgb3Igd3JpdGFibGUgYXR0cmlidXRlJyk7XG5cdH1cblx0cmV0dXJuIGRlc2M7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRVM1VHlwZSA9IHJlcXVpcmUoJy4uLzUvVHlwZScpO1xuXG4vLyBodHRwczovLzI2Mi5lY21hLWludGVybmF0aW9uYWwub3JnLzExLjAvI3NlYy1lY21hc2NyaXB0LWRhdGEtdHlwZXMtYW5kLXZhbHVlc1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFR5cGUoeCkge1xuXHRpZiAodHlwZW9mIHggPT09ICdzeW1ib2wnKSB7XG5cdFx0cmV0dXJuICdTeW1ib2wnO1xuXHR9XG5cdGlmICh0eXBlb2YgeCA9PT0gJ2JpZ2ludCcpIHtcblx0XHRyZXR1cm4gJ0JpZ0ludCc7XG5cdH1cblx0cmV0dXJuIEVTNVR5cGUoeCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBodHRwczovLzI2Mi5lY21hLWludGVybmF0aW9uYWwub3JnLzUuMS8jc2VjLThcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBUeXBlKHgpIHtcblx0aWYgKHggPT09IG51bGwpIHtcblx0XHRyZXR1cm4gJ051bGwnO1xuXHR9XG5cdGlmICh0eXBlb2YgeCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRyZXR1cm4gJ1VuZGVmaW5lZCc7XG5cdH1cblx0aWYgKHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB4ID09PSAnb2JqZWN0Jykge1xuXHRcdHJldHVybiAnT2JqZWN0Jztcblx0fVxuXHRpZiAodHlwZW9mIHggPT09ICdudW1iZXInKSB7XG5cdFx0cmV0dXJuICdOdW1iZXInO1xuXHR9XG5cdGlmICh0eXBlb2YgeCA9PT0gJ2Jvb2xlYW4nKSB7XG5cdFx0cmV0dXJuICdCb29sZWFuJztcblx0fVxuXHRpZiAodHlwZW9mIHggPT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuICdTdHJpbmcnO1xuXHR9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBUT0RPOiByZW1vdmUsIHNlbXZlci1tYWpvclxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2dldC1pbnRyaW5zaWMnKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhc1Byb3BlcnR5RGVzY3JpcHRvcnMgPSByZXF1aXJlKCdoYXMtcHJvcGVydHktZGVzY3JpcHRvcnMnKTtcblxudmFyIEdldEludHJpbnNpYyA9IHJlcXVpcmUoJ2dldC1pbnRyaW5zaWMnKTtcblxudmFyICRkZWZpbmVQcm9wZXJ0eSA9IGhhc1Byb3BlcnR5RGVzY3JpcHRvcnMoKSAmJiBHZXRJbnRyaW5zaWMoJyVPYmplY3QuZGVmaW5lUHJvcGVydHklJywgdHJ1ZSk7XG5cbnZhciBoYXNBcnJheUxlbmd0aERlZmluZUJ1ZyA9IGhhc1Byb3BlcnR5RGVzY3JpcHRvcnMuaGFzQXJyYXlMZW5ndGhEZWZpbmVCdWcoKTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGdsb2JhbC1yZXF1aXJlXG52YXIgaXNBcnJheSA9IGhhc0FycmF5TGVuZ3RoRGVmaW5lQnVnICYmIHJlcXVpcmUoJy4uL2hlbHBlcnMvSXNBcnJheScpO1xuXG52YXIgY2FsbEJvdW5kID0gcmVxdWlyZSgnY2FsbC1iaW5kL2NhbGxCb3VuZCcpO1xuXG52YXIgJGlzRW51bWVyYWJsZSA9IGNhbGxCb3VuZCgnT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZScpO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbWF4LXBhcmFtc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBEZWZpbmVPd25Qcm9wZXJ0eShJc0RhdGFEZXNjcmlwdG9yLCBTYW1lVmFsdWUsIEZyb21Qcm9wZXJ0eURlc2NyaXB0b3IsIE8sIFAsIGRlc2MpIHtcblx0aWYgKCEkZGVmaW5lUHJvcGVydHkpIHtcblx0XHRpZiAoIUlzRGF0YURlc2NyaXB0b3IoZGVzYykpIHtcblx0XHRcdC8vIEVTMyBkb2VzIG5vdCBzdXBwb3J0IGdldHRlcnMvc2V0dGVyc1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRpZiAoIWRlc2NbJ1tbQ29uZmlndXJhYmxlXV0nXSB8fCAhZGVzY1snW1tXcml0YWJsZV1dJ10pIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBmYWxsYmFjayBmb3IgRVMzXG5cdFx0aWYgKFAgaW4gTyAmJiAkaXNFbnVtZXJhYmxlKE8sIFApICE9PSAhIWRlc2NbJ1tbRW51bWVyYWJsZV1dJ10pIHtcblx0XHRcdC8vIGEgbm9uLWVudW1lcmFibGUgZXhpc3RpbmcgcHJvcGVydHlcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBwcm9wZXJ0eSBkb2VzIG5vdCBleGlzdCBhdCBhbGwsIG9yIGV4aXN0cyBidXQgaXMgZW51bWVyYWJsZVxuXHRcdHZhciBWID0gZGVzY1snW1tWYWx1ZV1dJ107XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG5cdFx0T1tQXSA9IFY7IC8vIHdpbGwgdXNlIFtbRGVmaW5lXV1cblx0XHRyZXR1cm4gU2FtZVZhbHVlKE9bUF0sIFYpO1xuXHR9XG5cdGlmIChcblx0XHRoYXNBcnJheUxlbmd0aERlZmluZUJ1Z1xuXHRcdCYmIFAgPT09ICdsZW5ndGgnXG5cdFx0JiYgJ1tbVmFsdWVdXScgaW4gZGVzY1xuXHRcdCYmIGlzQXJyYXkoTylcblx0XHQmJiBPLmxlbmd0aCAhPT0gZGVzY1snW1tWYWx1ZV1dJ11cblx0KSB7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG5cdFx0Ty5sZW5ndGggPSBkZXNjWydbW1ZhbHVlXV0nXTtcblx0XHRyZXR1cm4gTy5sZW5ndGggPT09IGRlc2NbJ1tbVmFsdWVdXSddO1xuXHR9XG5cblx0JGRlZmluZVByb3BlcnR5KE8sIFAsIEZyb21Qcm9wZXJ0eURlc2NyaXB0b3IoZGVzYykpO1xuXHRyZXR1cm4gdHJ1ZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBHZXRJbnRyaW5zaWMgPSByZXF1aXJlKCdnZXQtaW50cmluc2ljJyk7XG5cbnZhciAkQXJyYXkgPSBHZXRJbnRyaW5zaWMoJyVBcnJheSUnKTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGdsb2JhbC1yZXF1aXJlXG52YXIgdG9TdHIgPSAhJEFycmF5LmlzQXJyYXkgJiYgcmVxdWlyZSgnY2FsbC1iaW5kL2NhbGxCb3VuZCcpKCdPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gJEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gSXNBcnJheShhcmd1bWVudCkge1xuXHRyZXR1cm4gdG9TdHIoYXJndW1lbnQpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEdldEludHJpbnNpYyA9IHJlcXVpcmUoJ2dldC1pbnRyaW5zaWMnKTtcblxudmFyICRUeXBlRXJyb3IgPSBHZXRJbnRyaW5zaWMoJyVUeXBlRXJyb3IlJyk7XG52YXIgJFN5bnRheEVycm9yID0gR2V0SW50cmluc2ljKCclU3ludGF4RXJyb3IlJyk7XG5cbnZhciBoYXMgPSByZXF1aXJlKCdoYXMnKTtcblxudmFyIGlzTWF0Y2hSZWNvcmQgPSByZXF1aXJlKCcuL2lzTWF0Y2hSZWNvcmQnKTtcblxudmFyIHByZWRpY2F0ZXMgPSB7XG5cdC8vIGh0dHBzOi8vMjYyLmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvNi4wLyNzZWMtcHJvcGVydHktZGVzY3JpcHRvci1zcGVjaWZpY2F0aW9uLXR5cGVcblx0J1Byb3BlcnR5IERlc2NyaXB0b3InOiBmdW5jdGlvbiBpc1Byb3BlcnR5RGVzY3JpcHRvcihEZXNjKSB7XG5cdFx0dmFyIGFsbG93ZWQgPSB7XG5cdFx0XHQnW1tDb25maWd1cmFibGVdXSc6IHRydWUsXG5cdFx0XHQnW1tFbnVtZXJhYmxlXV0nOiB0cnVlLFxuXHRcdFx0J1tbR2V0XV0nOiB0cnVlLFxuXHRcdFx0J1tbU2V0XV0nOiB0cnVlLFxuXHRcdFx0J1tbVmFsdWVdXSc6IHRydWUsXG5cdFx0XHQnW1tXcml0YWJsZV1dJzogdHJ1ZVxuXHRcdH07XG5cblx0XHRmb3IgKHZhciBrZXkgaW4gRGVzYykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5cdFx0XHRpZiAoaGFzKERlc2MsIGtleSkgJiYgIWFsbG93ZWRba2V5XSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dmFyIGlzRGF0YSA9IGhhcyhEZXNjLCAnW1tWYWx1ZV1dJyk7XG5cdFx0dmFyIElzQWNjZXNzb3IgPSBoYXMoRGVzYywgJ1tbR2V0XV0nKSB8fCBoYXMoRGVzYywgJ1tbU2V0XV0nKTtcblx0XHRpZiAoaXNEYXRhICYmIElzQWNjZXNzb3IpIHtcblx0XHRcdHRocm93IG5ldyAkVHlwZUVycm9yKCdQcm9wZXJ0eSBEZXNjcmlwdG9ycyBtYXkgbm90IGJlIGJvdGggYWNjZXNzb3IgYW5kIGRhdGEgZGVzY3JpcHRvcnMnKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cdC8vIGh0dHBzOi8vMjYyLmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvMTMuMC8jc2VjLW1hdGNoLXJlY29yZHNcblx0J01hdGNoIFJlY29yZCc6IGlzTWF0Y2hSZWNvcmRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXNzZXJ0UmVjb3JkKFR5cGUsIHJlY29yZFR5cGUsIGFyZ3VtZW50TmFtZSwgdmFsdWUpIHtcblx0dmFyIHByZWRpY2F0ZSA9IHByZWRpY2F0ZXNbcmVjb3JkVHlwZV07XG5cdGlmICh0eXBlb2YgcHJlZGljYXRlICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0dGhyb3cgbmV3ICRTeW50YXhFcnJvcigndW5rbm93biByZWNvcmQgdHlwZTogJyArIHJlY29yZFR5cGUpO1xuXHR9XG5cdGlmIChUeXBlKHZhbHVlKSAhPT0gJ09iamVjdCcgfHwgIXByZWRpY2F0ZSh2YWx1ZSkpIHtcblx0XHR0aHJvdyBuZXcgJFR5cGVFcnJvcihhcmd1bWVudE5hbWUgKyAnIG11c3QgYmUgYSAnICsgcmVjb3JkVHlwZSk7XG5cdH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZnJvbVByb3BlcnR5RGVzY3JpcHRvcihEZXNjKSB7XG5cdGlmICh0eXBlb2YgRGVzYyA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRyZXR1cm4gRGVzYztcblx0fVxuXHR2YXIgb2JqID0ge307XG5cdGlmICgnW1tWYWx1ZV1dJyBpbiBEZXNjKSB7XG5cdFx0b2JqLnZhbHVlID0gRGVzY1snW1tWYWx1ZV1dJ107XG5cdH1cblx0aWYgKCdbW1dyaXRhYmxlXV0nIGluIERlc2MpIHtcblx0XHRvYmoud3JpdGFibGUgPSAhIURlc2NbJ1tbV3JpdGFibGVdXSddO1xuXHR9XG5cdGlmICgnW1tHZXRdXScgaW4gRGVzYykge1xuXHRcdG9iai5nZXQgPSBEZXNjWydbW0dldF1dJ107XG5cdH1cblx0aWYgKCdbW1NldF1dJyBpbiBEZXNjKSB7XG5cdFx0b2JqLnNldCA9IERlc2NbJ1tbU2V0XV0nXTtcblx0fVxuXHRpZiAoJ1tbRW51bWVyYWJsZV1dJyBpbiBEZXNjKSB7XG5cdFx0b2JqLmVudW1lcmFibGUgPSAhIURlc2NbJ1tbRW51bWVyYWJsZV1dJ107XG5cdH1cblx0aWYgKCdbW0NvbmZpZ3VyYWJsZV1dJyBpbiBEZXNjKSB7XG5cdFx0b2JqLmNvbmZpZ3VyYWJsZSA9ICEhRGVzY1snW1tDb25maWd1cmFibGVdXSddO1xuXHR9XG5cdHJldHVybiBvYmo7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzID0gcmVxdWlyZSgnaGFzJyk7XG5cbi8vIGh0dHBzOi8vMjYyLmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvMTMuMC8jc2VjLW1hdGNoLXJlY29yZHNcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc01hdGNoUmVjb3JkKHJlY29yZCkge1xuXHRyZXR1cm4gKFxuXHRcdGhhcyhyZWNvcmQsICdbW1N0YXJ0SW5kZXhdXScpXG4gICAgICAgICYmIGhhcyhyZWNvcmQsICdbW0VuZEluZGV4XV0nKVxuICAgICAgICAmJiByZWNvcmRbJ1tbU3RhcnRJbmRleF1dJ10gPj0gMFxuICAgICAgICAmJiByZWNvcmRbJ1tbRW5kSW5kZXhdXSddID49IHJlY29yZFsnW1tTdGFydEluZGV4XV0nXVxuICAgICAgICAmJiBTdHJpbmcocGFyc2VJbnQocmVjb3JkWydbW1N0YXJ0SW5kZXhdXSddLCAxMCkpID09PSBTdHJpbmcocmVjb3JkWydbW1N0YXJ0SW5kZXhdXSddKVxuICAgICAgICAmJiBTdHJpbmcocGFyc2VJbnQocmVjb3JkWydbW0VuZEluZGV4XV0nXSwgMTApKSA9PT0gU3RyaW5nKHJlY29yZFsnW1tFbmRJbmRleF1dJ10pXG5cdCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE51bWJlci5pc05hTiB8fCBmdW5jdGlvbiBpc05hTihhKSB7XG5cdHJldHVybiBhICE9PSBhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEdldEludHJpbnNpYyA9IHJlcXVpcmUoJ2dldC1pbnRyaW5zaWMnKTtcblxudmFyIGhhcyA9IHJlcXVpcmUoJ2hhcycpO1xudmFyICRUeXBlRXJyb3IgPSBHZXRJbnRyaW5zaWMoJyVUeXBlRXJyb3IlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gSXNQcm9wZXJ0eURlc2NyaXB0b3IoRVMsIERlc2MpIHtcblx0aWYgKEVTLlR5cGUoRGVzYykgIT09ICdPYmplY3QnKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdHZhciBhbGxvd2VkID0ge1xuXHRcdCdbW0NvbmZpZ3VyYWJsZV1dJzogdHJ1ZSxcblx0XHQnW1tFbnVtZXJhYmxlXV0nOiB0cnVlLFxuXHRcdCdbW0dldF1dJzogdHJ1ZSxcblx0XHQnW1tTZXRdXSc6IHRydWUsXG5cdFx0J1tbVmFsdWVdXSc6IHRydWUsXG5cdFx0J1tbV3JpdGFibGVdXSc6IHRydWVcblx0fTtcblxuXHRmb3IgKHZhciBrZXkgaW4gRGVzYykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXJlc3RyaWN0ZWQtc3ludGF4XG5cdFx0aWYgKGhhcyhEZXNjLCBrZXkpICYmICFhbGxvd2VkW2tleV0pIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRpZiAoRVMuSXNEYXRhRGVzY3JpcHRvcihEZXNjKSAmJiBFUy5Jc0FjY2Vzc29yRGVzY3JpcHRvcihEZXNjKSkge1xuXHRcdHRocm93IG5ldyAkVHlwZUVycm9yKCdQcm9wZXJ0eSBEZXNjcmlwdG9ycyBtYXkgbm90IGJlIGJvdGggYWNjZXNzb3IgYW5kIGRhdGEgZGVzY3JpcHRvcnMnKTtcblx0fVxuXHRyZXR1cm4gdHJ1ZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qIGVzbGludCBuby1pbnZhbGlkLXRoaXM6IDEgKi9cblxudmFyIEVSUk9SX01FU1NBR0UgPSAnRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgY2FsbGVkIG9uIGluY29tcGF0aWJsZSAnO1xudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbnZhciBmdW5jVHlwZSA9ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZCh0aGF0KSB7XG4gICAgdmFyIHRhcmdldCA9IHRoaXM7XG4gICAgaWYgKHR5cGVvZiB0YXJnZXQgIT09ICdmdW5jdGlvbicgfHwgdG9TdHIuY2FsbCh0YXJnZXQpICE9PSBmdW5jVHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEVSUk9SX01FU1NBR0UgKyB0YXJnZXQpO1xuICAgIH1cbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgIHZhciBib3VuZDtcbiAgICB2YXIgYmluZGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIGJvdW5kKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gdGFyZ2V0LmFwcGx5KFxuICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmIChPYmplY3QocmVzdWx0KSA9PT0gcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5hcHBseShcbiAgICAgICAgICAgICAgICB0aGF0LFxuICAgICAgICAgICAgICAgIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGJvdW5kTGVuZ3RoID0gTWF0aC5tYXgoMCwgdGFyZ2V0Lmxlbmd0aCAtIGFyZ3MubGVuZ3RoKTtcbiAgICB2YXIgYm91bmRBcmdzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBib3VuZExlbmd0aDsgaSsrKSB7XG4gICAgICAgIGJvdW5kQXJncy5wdXNoKCckJyArIGkpO1xuICAgIH1cblxuICAgIGJvdW5kID0gRnVuY3Rpb24oJ2JpbmRlcicsICdyZXR1cm4gZnVuY3Rpb24gKCcgKyBib3VuZEFyZ3Muam9pbignLCcpICsgJyl7IHJldHVybiBiaW5kZXIuYXBwbHkodGhpcyxhcmd1bWVudHMpOyB9JykoYmluZGVyKTtcblxuICAgIGlmICh0YXJnZXQucHJvdG90eXBlKSB7XG4gICAgICAgIHZhciBFbXB0eSA9IGZ1bmN0aW9uIEVtcHR5KCkge307XG4gICAgICAgIEVtcHR5LnByb3RvdHlwZSA9IHRhcmdldC5wcm90b3R5cGU7XG4gICAgICAgIGJvdW5kLnByb3RvdHlwZSA9IG5ldyBFbXB0eSgpO1xuICAgICAgICBFbXB0eS5wcm90b3R5cGUgPSBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBib3VuZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpbXBsZW1lbnRhdGlvbiA9IHJlcXVpcmUoJy4vaW1wbGVtZW50YXRpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCB8fCBpbXBsZW1lbnRhdGlvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHVuZGVmaW5lZDtcblxudmFyICRTeW50YXhFcnJvciA9IFN5bnRheEVycm9yO1xudmFyICRGdW5jdGlvbiA9IEZ1bmN0aW9uO1xudmFyICRUeXBlRXJyb3IgPSBUeXBlRXJyb3I7XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxudmFyIGdldEV2YWxsZWRDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uIChleHByZXNzaW9uU3ludGF4KSB7XG5cdHRyeSB7XG5cdFx0cmV0dXJuICRGdW5jdGlvbignXCJ1c2Ugc3RyaWN0XCI7IHJldHVybiAoJyArIGV4cHJlc3Npb25TeW50YXggKyAnKS5jb25zdHJ1Y3RvcjsnKSgpO1xuXHR9IGNhdGNoIChlKSB7fVxufTtcblxudmFyICRnT1BEID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbmlmICgkZ09QRCkge1xuXHR0cnkge1xuXHRcdCRnT1BEKHt9LCAnJyk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHQkZ09QRCA9IG51bGw7IC8vIHRoaXMgaXMgSUUgOCwgd2hpY2ggaGFzIGEgYnJva2VuIGdPUERcblx0fVxufVxuXG52YXIgdGhyb3dUeXBlRXJyb3IgPSBmdW5jdGlvbiAoKSB7XG5cdHRocm93IG5ldyAkVHlwZUVycm9yKCk7XG59O1xudmFyIFRocm93VHlwZUVycm9yID0gJGdPUERcblx0PyAoZnVuY3Rpb24gKCkge1xuXHRcdHRyeSB7XG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLWV4cHJlc3Npb25zLCBuby1jYWxsZXIsIG5vLXJlc3RyaWN0ZWQtcHJvcGVydGllc1xuXHRcdFx0YXJndW1lbnRzLmNhbGxlZTsgLy8gSUUgOCBkb2VzIG5vdCB0aHJvdyBoZXJlXG5cdFx0XHRyZXR1cm4gdGhyb3dUeXBlRXJyb3I7XG5cdFx0fSBjYXRjaCAoY2FsbGVlVGhyb3dzKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHQvLyBJRSA4IHRocm93cyBvbiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGFyZ3VtZW50cywgJycpXG5cdFx0XHRcdHJldHVybiAkZ09QRChhcmd1bWVudHMsICdjYWxsZWUnKS5nZXQ7XG5cdFx0XHR9IGNhdGNoIChnT1BEdGhyb3dzKSB7XG5cdFx0XHRcdHJldHVybiB0aHJvd1R5cGVFcnJvcjtcblx0XHRcdH1cblx0XHR9XG5cdH0oKSlcblx0OiB0aHJvd1R5cGVFcnJvcjtcblxudmFyIGhhc1N5bWJvbHMgPSByZXF1aXJlKCdoYXMtc3ltYm9scycpKCk7XG5cbnZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiAoeCkgeyByZXR1cm4geC5fX3Byb3RvX187IH07IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcHJvdG9cblxudmFyIG5lZWRzRXZhbCA9IHt9O1xuXG52YXIgVHlwZWRBcnJheSA9IHR5cGVvZiBVaW50OEFycmF5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IGdldFByb3RvKFVpbnQ4QXJyYXkpO1xuXG52YXIgSU5UUklOU0lDUyA9IHtcblx0JyVBZ2dyZWdhdGVFcnJvciUnOiB0eXBlb2YgQWdncmVnYXRlRXJyb3IgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogQWdncmVnYXRlRXJyb3IsXG5cdCclQXJyYXklJzogQXJyYXksXG5cdCclQXJyYXlCdWZmZXIlJzogdHlwZW9mIEFycmF5QnVmZmVyID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IEFycmF5QnVmZmVyLFxuXHQnJUFycmF5SXRlcmF0b3JQcm90b3R5cGUlJzogaGFzU3ltYm9scyA/IGdldFByb3RvKFtdW1N5bWJvbC5pdGVyYXRvcl0oKSkgOiB1bmRlZmluZWQsXG5cdCclQXN5bmNGcm9tU3luY0l0ZXJhdG9yUHJvdG90eXBlJSc6IHVuZGVmaW5lZCxcblx0JyVBc3luY0Z1bmN0aW9uJSc6IG5lZWRzRXZhbCxcblx0JyVBc3luY0dlbmVyYXRvciUnOiBuZWVkc0V2YWwsXG5cdCclQXN5bmNHZW5lcmF0b3JGdW5jdGlvbiUnOiBuZWVkc0V2YWwsXG5cdCclQXN5bmNJdGVyYXRvclByb3RvdHlwZSUnOiBuZWVkc0V2YWwsXG5cdCclQXRvbWljcyUnOiB0eXBlb2YgQXRvbWljcyA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBBdG9taWNzLFxuXHQnJUJpZ0ludCUnOiB0eXBlb2YgQmlnSW50ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IEJpZ0ludCxcblx0JyVCb29sZWFuJSc6IEJvb2xlYW4sXG5cdCclRGF0YVZpZXclJzogdHlwZW9mIERhdGFWaWV3ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IERhdGFWaWV3LFxuXHQnJURhdGUlJzogRGF0ZSxcblx0JyVkZWNvZGVVUkklJzogZGVjb2RlVVJJLFxuXHQnJWRlY29kZVVSSUNvbXBvbmVudCUnOiBkZWNvZGVVUklDb21wb25lbnQsXG5cdCclZW5jb2RlVVJJJSc6IGVuY29kZVVSSSxcblx0JyVlbmNvZGVVUklDb21wb25lbnQlJzogZW5jb2RlVVJJQ29tcG9uZW50LFxuXHQnJUVycm9yJSc6IEVycm9yLFxuXHQnJWV2YWwlJzogZXZhbCwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1ldmFsXG5cdCclRXZhbEVycm9yJSc6IEV2YWxFcnJvcixcblx0JyVGbG9hdDMyQXJyYXklJzogdHlwZW9mIEZsb2F0MzJBcnJheSA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBGbG9hdDMyQXJyYXksXG5cdCclRmxvYXQ2NEFycmF5JSc6IHR5cGVvZiBGbG9hdDY0QXJyYXkgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogRmxvYXQ2NEFycmF5LFxuXHQnJUZpbmFsaXphdGlvblJlZ2lzdHJ5JSc6IHR5cGVvZiBGaW5hbGl6YXRpb25SZWdpc3RyeSA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBGaW5hbGl6YXRpb25SZWdpc3RyeSxcblx0JyVGdW5jdGlvbiUnOiAkRnVuY3Rpb24sXG5cdCclR2VuZXJhdG9yRnVuY3Rpb24lJzogbmVlZHNFdmFsLFxuXHQnJUludDhBcnJheSUnOiB0eXBlb2YgSW50OEFycmF5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IEludDhBcnJheSxcblx0JyVJbnQxNkFycmF5JSc6IHR5cGVvZiBJbnQxNkFycmF5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IEludDE2QXJyYXksXG5cdCclSW50MzJBcnJheSUnOiB0eXBlb2YgSW50MzJBcnJheSA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBJbnQzMkFycmF5LFxuXHQnJWlzRmluaXRlJSc6IGlzRmluaXRlLFxuXHQnJWlzTmFOJSc6IGlzTmFOLFxuXHQnJUl0ZXJhdG9yUHJvdG90eXBlJSc6IGhhc1N5bWJvbHMgPyBnZXRQcm90byhnZXRQcm90byhbXVtTeW1ib2wuaXRlcmF0b3JdKCkpKSA6IHVuZGVmaW5lZCxcblx0JyVKU09OJSc6IHR5cGVvZiBKU09OID09PSAnb2JqZWN0JyA/IEpTT04gOiB1bmRlZmluZWQsXG5cdCclTWFwJSc6IHR5cGVvZiBNYXAgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogTWFwLFxuXHQnJU1hcEl0ZXJhdG9yUHJvdG90eXBlJSc6IHR5cGVvZiBNYXAgPT09ICd1bmRlZmluZWQnIHx8ICFoYXNTeW1ib2xzID8gdW5kZWZpbmVkIDogZ2V0UHJvdG8obmV3IE1hcCgpW1N5bWJvbC5pdGVyYXRvcl0oKSksXG5cdCclTWF0aCUnOiBNYXRoLFxuXHQnJU51bWJlciUnOiBOdW1iZXIsXG5cdCclT2JqZWN0JSc6IE9iamVjdCxcblx0JyVwYXJzZUZsb2F0JSc6IHBhcnNlRmxvYXQsXG5cdCclcGFyc2VJbnQlJzogcGFyc2VJbnQsXG5cdCclUHJvbWlzZSUnOiB0eXBlb2YgUHJvbWlzZSA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBQcm9taXNlLFxuXHQnJVByb3h5JSc6IHR5cGVvZiBQcm94eSA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBQcm94eSxcblx0JyVSYW5nZUVycm9yJSc6IFJhbmdlRXJyb3IsXG5cdCclUmVmZXJlbmNlRXJyb3IlJzogUmVmZXJlbmNlRXJyb3IsXG5cdCclUmVmbGVjdCUnOiB0eXBlb2YgUmVmbGVjdCA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBSZWZsZWN0LFxuXHQnJVJlZ0V4cCUnOiBSZWdFeHAsXG5cdCclU2V0JSc6IHR5cGVvZiBTZXQgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogU2V0LFxuXHQnJVNldEl0ZXJhdG9yUHJvdG90eXBlJSc6IHR5cGVvZiBTZXQgPT09ICd1bmRlZmluZWQnIHx8ICFoYXNTeW1ib2xzID8gdW5kZWZpbmVkIDogZ2V0UHJvdG8obmV3IFNldCgpW1N5bWJvbC5pdGVyYXRvcl0oKSksXG5cdCclU2hhcmVkQXJyYXlCdWZmZXIlJzogdHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IFNoYXJlZEFycmF5QnVmZmVyLFxuXHQnJVN0cmluZyUnOiBTdHJpbmcsXG5cdCclU3RyaW5nSXRlcmF0b3JQcm90b3R5cGUlJzogaGFzU3ltYm9scyA/IGdldFByb3RvKCcnW1N5bWJvbC5pdGVyYXRvcl0oKSkgOiB1bmRlZmluZWQsXG5cdCclU3ltYm9sJSc6IGhhc1N5bWJvbHMgPyBTeW1ib2wgOiB1bmRlZmluZWQsXG5cdCclU3ludGF4RXJyb3IlJzogJFN5bnRheEVycm9yLFxuXHQnJVRocm93VHlwZUVycm9yJSc6IFRocm93VHlwZUVycm9yLFxuXHQnJVR5cGVkQXJyYXklJzogVHlwZWRBcnJheSxcblx0JyVUeXBlRXJyb3IlJzogJFR5cGVFcnJvcixcblx0JyVVaW50OEFycmF5JSc6IHR5cGVvZiBVaW50OEFycmF5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IFVpbnQ4QXJyYXksXG5cdCclVWludDhDbGFtcGVkQXJyYXklJzogdHlwZW9mIFVpbnQ4Q2xhbXBlZEFycmF5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IFVpbnQ4Q2xhbXBlZEFycmF5LFxuXHQnJVVpbnQxNkFycmF5JSc6IHR5cGVvZiBVaW50MTZBcnJheSA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBVaW50MTZBcnJheSxcblx0JyVVaW50MzJBcnJheSUnOiB0eXBlb2YgVWludDMyQXJyYXkgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogVWludDMyQXJyYXksXG5cdCclVVJJRXJyb3IlJzogVVJJRXJyb3IsXG5cdCclV2Vha01hcCUnOiB0eXBlb2YgV2Vha01hcCA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBXZWFrTWFwLFxuXHQnJVdlYWtSZWYlJzogdHlwZW9mIFdlYWtSZWYgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogV2Vha1JlZixcblx0JyVXZWFrU2V0JSc6IHR5cGVvZiBXZWFrU2V0ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IFdlYWtTZXRcbn07XG5cbnZhciBkb0V2YWwgPSBmdW5jdGlvbiBkb0V2YWwobmFtZSkge1xuXHR2YXIgdmFsdWU7XG5cdGlmIChuYW1lID09PSAnJUFzeW5jRnVuY3Rpb24lJykge1xuXHRcdHZhbHVlID0gZ2V0RXZhbGxlZENvbnN0cnVjdG9yKCdhc3luYyBmdW5jdGlvbiAoKSB7fScpO1xuXHR9IGVsc2UgaWYgKG5hbWUgPT09ICclR2VuZXJhdG9yRnVuY3Rpb24lJykge1xuXHRcdHZhbHVlID0gZ2V0RXZhbGxlZENvbnN0cnVjdG9yKCdmdW5jdGlvbiogKCkge30nKTtcblx0fSBlbHNlIGlmIChuYW1lID09PSAnJUFzeW5jR2VuZXJhdG9yRnVuY3Rpb24lJykge1xuXHRcdHZhbHVlID0gZ2V0RXZhbGxlZENvbnN0cnVjdG9yKCdhc3luYyBmdW5jdGlvbiogKCkge30nKTtcblx0fSBlbHNlIGlmIChuYW1lID09PSAnJUFzeW5jR2VuZXJhdG9yJScpIHtcblx0XHR2YXIgZm4gPSBkb0V2YWwoJyVBc3luY0dlbmVyYXRvckZ1bmN0aW9uJScpO1xuXHRcdGlmIChmbikge1xuXHRcdFx0dmFsdWUgPSBmbi5wcm90b3R5cGU7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKG5hbWUgPT09ICclQXN5bmNJdGVyYXRvclByb3RvdHlwZSUnKSB7XG5cdFx0dmFyIGdlbiA9IGRvRXZhbCgnJUFzeW5jR2VuZXJhdG9yJScpO1xuXHRcdGlmIChnZW4pIHtcblx0XHRcdHZhbHVlID0gZ2V0UHJvdG8oZ2VuLnByb3RvdHlwZSk7XG5cdFx0fVxuXHR9XG5cblx0SU5UUklOU0lDU1tuYW1lXSA9IHZhbHVlO1xuXG5cdHJldHVybiB2YWx1ZTtcbn07XG5cbnZhciBMRUdBQ1lfQUxJQVNFUyA9IHtcblx0JyVBcnJheUJ1ZmZlclByb3RvdHlwZSUnOiBbJ0FycmF5QnVmZmVyJywgJ3Byb3RvdHlwZSddLFxuXHQnJUFycmF5UHJvdG90eXBlJSc6IFsnQXJyYXknLCAncHJvdG90eXBlJ10sXG5cdCclQXJyYXlQcm90b19lbnRyaWVzJSc6IFsnQXJyYXknLCAncHJvdG90eXBlJywgJ2VudHJpZXMnXSxcblx0JyVBcnJheVByb3RvX2ZvckVhY2glJzogWydBcnJheScsICdwcm90b3R5cGUnLCAnZm9yRWFjaCddLFxuXHQnJUFycmF5UHJvdG9fa2V5cyUnOiBbJ0FycmF5JywgJ3Byb3RvdHlwZScsICdrZXlzJ10sXG5cdCclQXJyYXlQcm90b192YWx1ZXMlJzogWydBcnJheScsICdwcm90b3R5cGUnLCAndmFsdWVzJ10sXG5cdCclQXN5bmNGdW5jdGlvblByb3RvdHlwZSUnOiBbJ0FzeW5jRnVuY3Rpb24nLCAncHJvdG90eXBlJ10sXG5cdCclQXN5bmNHZW5lcmF0b3IlJzogWydBc3luY0dlbmVyYXRvckZ1bmN0aW9uJywgJ3Byb3RvdHlwZSddLFxuXHQnJUFzeW5jR2VuZXJhdG9yUHJvdG90eXBlJSc6IFsnQXN5bmNHZW5lcmF0b3JGdW5jdGlvbicsICdwcm90b3R5cGUnLCAncHJvdG90eXBlJ10sXG5cdCclQm9vbGVhblByb3RvdHlwZSUnOiBbJ0Jvb2xlYW4nLCAncHJvdG90eXBlJ10sXG5cdCclRGF0YVZpZXdQcm90b3R5cGUlJzogWydEYXRhVmlldycsICdwcm90b3R5cGUnXSxcblx0JyVEYXRlUHJvdG90eXBlJSc6IFsnRGF0ZScsICdwcm90b3R5cGUnXSxcblx0JyVFcnJvclByb3RvdHlwZSUnOiBbJ0Vycm9yJywgJ3Byb3RvdHlwZSddLFxuXHQnJUV2YWxFcnJvclByb3RvdHlwZSUnOiBbJ0V2YWxFcnJvcicsICdwcm90b3R5cGUnXSxcblx0JyVGbG9hdDMyQXJyYXlQcm90b3R5cGUlJzogWydGbG9hdDMyQXJyYXknLCAncHJvdG90eXBlJ10sXG5cdCclRmxvYXQ2NEFycmF5UHJvdG90eXBlJSc6IFsnRmxvYXQ2NEFycmF5JywgJ3Byb3RvdHlwZSddLFxuXHQnJUZ1bmN0aW9uUHJvdG90eXBlJSc6IFsnRnVuY3Rpb24nLCAncHJvdG90eXBlJ10sXG5cdCclR2VuZXJhdG9yJSc6IFsnR2VuZXJhdG9yRnVuY3Rpb24nLCAncHJvdG90eXBlJ10sXG5cdCclR2VuZXJhdG9yUHJvdG90eXBlJSc6IFsnR2VuZXJhdG9yRnVuY3Rpb24nLCAncHJvdG90eXBlJywgJ3Byb3RvdHlwZSddLFxuXHQnJUludDhBcnJheVByb3RvdHlwZSUnOiBbJ0ludDhBcnJheScsICdwcm90b3R5cGUnXSxcblx0JyVJbnQxNkFycmF5UHJvdG90eXBlJSc6IFsnSW50MTZBcnJheScsICdwcm90b3R5cGUnXSxcblx0JyVJbnQzMkFycmF5UHJvdG90eXBlJSc6IFsnSW50MzJBcnJheScsICdwcm90b3R5cGUnXSxcblx0JyVKU09OUGFyc2UlJzogWydKU09OJywgJ3BhcnNlJ10sXG5cdCclSlNPTlN0cmluZ2lmeSUnOiBbJ0pTT04nLCAnc3RyaW5naWZ5J10sXG5cdCclTWFwUHJvdG90eXBlJSc6IFsnTWFwJywgJ3Byb3RvdHlwZSddLFxuXHQnJU51bWJlclByb3RvdHlwZSUnOiBbJ051bWJlcicsICdwcm90b3R5cGUnXSxcblx0JyVPYmplY3RQcm90b3R5cGUlJzogWydPYmplY3QnLCAncHJvdG90eXBlJ10sXG5cdCclT2JqUHJvdG9fdG9TdHJpbmclJzogWydPYmplY3QnLCAncHJvdG90eXBlJywgJ3RvU3RyaW5nJ10sXG5cdCclT2JqUHJvdG9fdmFsdWVPZiUnOiBbJ09iamVjdCcsICdwcm90b3R5cGUnLCAndmFsdWVPZiddLFxuXHQnJVByb21pc2VQcm90b3R5cGUlJzogWydQcm9taXNlJywgJ3Byb3RvdHlwZSddLFxuXHQnJVByb21pc2VQcm90b190aGVuJSc6IFsnUHJvbWlzZScsICdwcm90b3R5cGUnLCAndGhlbiddLFxuXHQnJVByb21pc2VfYWxsJSc6IFsnUHJvbWlzZScsICdhbGwnXSxcblx0JyVQcm9taXNlX3JlamVjdCUnOiBbJ1Byb21pc2UnLCAncmVqZWN0J10sXG5cdCclUHJvbWlzZV9yZXNvbHZlJSc6IFsnUHJvbWlzZScsICdyZXNvbHZlJ10sXG5cdCclUmFuZ2VFcnJvclByb3RvdHlwZSUnOiBbJ1JhbmdlRXJyb3InLCAncHJvdG90eXBlJ10sXG5cdCclUmVmZXJlbmNlRXJyb3JQcm90b3R5cGUlJzogWydSZWZlcmVuY2VFcnJvcicsICdwcm90b3R5cGUnXSxcblx0JyVSZWdFeHBQcm90b3R5cGUlJzogWydSZWdFeHAnLCAncHJvdG90eXBlJ10sXG5cdCclU2V0UHJvdG90eXBlJSc6IFsnU2V0JywgJ3Byb3RvdHlwZSddLFxuXHQnJVNoYXJlZEFycmF5QnVmZmVyUHJvdG90eXBlJSc6IFsnU2hhcmVkQXJyYXlCdWZmZXInLCAncHJvdG90eXBlJ10sXG5cdCclU3RyaW5nUHJvdG90eXBlJSc6IFsnU3RyaW5nJywgJ3Byb3RvdHlwZSddLFxuXHQnJVN5bWJvbFByb3RvdHlwZSUnOiBbJ1N5bWJvbCcsICdwcm90b3R5cGUnXSxcblx0JyVTeW50YXhFcnJvclByb3RvdHlwZSUnOiBbJ1N5bnRheEVycm9yJywgJ3Byb3RvdHlwZSddLFxuXHQnJVR5cGVkQXJyYXlQcm90b3R5cGUlJzogWydUeXBlZEFycmF5JywgJ3Byb3RvdHlwZSddLFxuXHQnJVR5cGVFcnJvclByb3RvdHlwZSUnOiBbJ1R5cGVFcnJvcicsICdwcm90b3R5cGUnXSxcblx0JyVVaW50OEFycmF5UHJvdG90eXBlJSc6IFsnVWludDhBcnJheScsICdwcm90b3R5cGUnXSxcblx0JyVVaW50OENsYW1wZWRBcnJheVByb3RvdHlwZSUnOiBbJ1VpbnQ4Q2xhbXBlZEFycmF5JywgJ3Byb3RvdHlwZSddLFxuXHQnJVVpbnQxNkFycmF5UHJvdG90eXBlJSc6IFsnVWludDE2QXJyYXknLCAncHJvdG90eXBlJ10sXG5cdCclVWludDMyQXJyYXlQcm90b3R5cGUlJzogWydVaW50MzJBcnJheScsICdwcm90b3R5cGUnXSxcblx0JyVVUklFcnJvclByb3RvdHlwZSUnOiBbJ1VSSUVycm9yJywgJ3Byb3RvdHlwZSddLFxuXHQnJVdlYWtNYXBQcm90b3R5cGUlJzogWydXZWFrTWFwJywgJ3Byb3RvdHlwZSddLFxuXHQnJVdlYWtTZXRQcm90b3R5cGUlJzogWydXZWFrU2V0JywgJ3Byb3RvdHlwZSddXG59O1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJ2Z1bmN0aW9uLWJpbmQnKTtcbnZhciBoYXNPd24gPSByZXF1aXJlKCdoYXMnKTtcbnZhciAkY29uY2F0ID0gYmluZC5jYWxsKEZ1bmN0aW9uLmNhbGwsIEFycmF5LnByb3RvdHlwZS5jb25jYXQpO1xudmFyICRzcGxpY2VBcHBseSA9IGJpbmQuY2FsbChGdW5jdGlvbi5hcHBseSwgQXJyYXkucHJvdG90eXBlLnNwbGljZSk7XG52YXIgJHJlcGxhY2UgPSBiaW5kLmNhbGwoRnVuY3Rpb24uY2FsbCwgU3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlKTtcbnZhciAkc3RyU2xpY2UgPSBiaW5kLmNhbGwoRnVuY3Rpb24uY2FsbCwgU3RyaW5nLnByb3RvdHlwZS5zbGljZSk7XG5cbi8qIGFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbG9kYXNoL2xvZGFzaC9ibG9iLzQuMTcuMTUvZGlzdC9sb2Rhc2guanMjTDY3MzUtTDY3NDQgKi9cbnZhciByZVByb3BOYW1lID0gL1teJS5bXFxdXSt8XFxbKD86KC0/XFxkKyg/OlxcLlxcZCspPyl8KFtcIiddKSgoPzooPyFcXDIpW15cXFxcXXxcXFxcLikqPylcXDIpXFxdfCg/PSg/OlxcLnxcXFtcXF0pKD86XFwufFxcW1xcXXwlJCkpL2c7XG52YXIgcmVFc2NhcGVDaGFyID0gL1xcXFwoXFxcXCk/L2c7IC8qKiBVc2VkIHRvIG1hdGNoIGJhY2tzbGFzaGVzIGluIHByb3BlcnR5IHBhdGhzLiAqL1xudmFyIHN0cmluZ1RvUGF0aCA9IGZ1bmN0aW9uIHN0cmluZ1RvUGF0aChzdHJpbmcpIHtcblx0dmFyIGZpcnN0ID0gJHN0clNsaWNlKHN0cmluZywgMCwgMSk7XG5cdHZhciBsYXN0ID0gJHN0clNsaWNlKHN0cmluZywgLTEpO1xuXHRpZiAoZmlyc3QgPT09ICclJyAmJiBsYXN0ICE9PSAnJScpIHtcblx0XHR0aHJvdyBuZXcgJFN5bnRheEVycm9yKCdpbnZhbGlkIGludHJpbnNpYyBzeW50YXgsIGV4cGVjdGVkIGNsb3NpbmcgYCVgJyk7XG5cdH0gZWxzZSBpZiAobGFzdCA9PT0gJyUnICYmIGZpcnN0ICE9PSAnJScpIHtcblx0XHR0aHJvdyBuZXcgJFN5bnRheEVycm9yKCdpbnZhbGlkIGludHJpbnNpYyBzeW50YXgsIGV4cGVjdGVkIG9wZW5pbmcgYCVgJyk7XG5cdH1cblx0dmFyIHJlc3VsdCA9IFtdO1xuXHQkcmVwbGFjZShzdHJpbmcsIHJlUHJvcE5hbWUsIGZ1bmN0aW9uIChtYXRjaCwgbnVtYmVyLCBxdW90ZSwgc3ViU3RyaW5nKSB7XG5cdFx0cmVzdWx0W3Jlc3VsdC5sZW5ndGhdID0gcXVvdGUgPyAkcmVwbGFjZShzdWJTdHJpbmcsIHJlRXNjYXBlQ2hhciwgJyQxJykgOiBudW1iZXIgfHwgbWF0Y2g7XG5cdH0pO1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcbi8qIGVuZCBhZGFwdGF0aW9uICovXG5cbnZhciBnZXRCYXNlSW50cmluc2ljID0gZnVuY3Rpb24gZ2V0QmFzZUludHJpbnNpYyhuYW1lLCBhbGxvd01pc3NpbmcpIHtcblx0dmFyIGludHJpbnNpY05hbWUgPSBuYW1lO1xuXHR2YXIgYWxpYXM7XG5cdGlmIChoYXNPd24oTEVHQUNZX0FMSUFTRVMsIGludHJpbnNpY05hbWUpKSB7XG5cdFx0YWxpYXMgPSBMRUdBQ1lfQUxJQVNFU1tpbnRyaW5zaWNOYW1lXTtcblx0XHRpbnRyaW5zaWNOYW1lID0gJyUnICsgYWxpYXNbMF0gKyAnJSc7XG5cdH1cblxuXHRpZiAoaGFzT3duKElOVFJJTlNJQ1MsIGludHJpbnNpY05hbWUpKSB7XG5cdFx0dmFyIHZhbHVlID0gSU5UUklOU0lDU1tpbnRyaW5zaWNOYW1lXTtcblx0XHRpZiAodmFsdWUgPT09IG5lZWRzRXZhbCkge1xuXHRcdFx0dmFsdWUgPSBkb0V2YWwoaW50cmluc2ljTmFtZSk7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnICYmICFhbGxvd01pc3NpbmcpIHtcblx0XHRcdHRocm93IG5ldyAkVHlwZUVycm9yKCdpbnRyaW5zaWMgJyArIG5hbWUgKyAnIGV4aXN0cywgYnV0IGlzIG5vdCBhdmFpbGFibGUuIFBsZWFzZSBmaWxlIGFuIGlzc3VlIScpO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRhbGlhczogYWxpYXMsXG5cdFx0XHRuYW1lOiBpbnRyaW5zaWNOYW1lLFxuXHRcdFx0dmFsdWU6IHZhbHVlXG5cdFx0fTtcblx0fVxuXG5cdHRocm93IG5ldyAkU3ludGF4RXJyb3IoJ2ludHJpbnNpYyAnICsgbmFtZSArICcgZG9lcyBub3QgZXhpc3QhJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEdldEludHJpbnNpYyhuYW1lLCBhbGxvd01pc3NpbmcpIHtcblx0aWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJyB8fCBuYW1lLmxlbmd0aCA9PT0gMCkge1xuXHRcdHRocm93IG5ldyAkVHlwZUVycm9yKCdpbnRyaW5zaWMgbmFtZSBtdXN0IGJlIGEgbm9uLWVtcHR5IHN0cmluZycpO1xuXHR9XG5cdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSAmJiB0eXBlb2YgYWxsb3dNaXNzaW5nICE9PSAnYm9vbGVhbicpIHtcblx0XHR0aHJvdyBuZXcgJFR5cGVFcnJvcignXCJhbGxvd01pc3NpbmdcIiBhcmd1bWVudCBtdXN0IGJlIGEgYm9vbGVhbicpO1xuXHR9XG5cblx0dmFyIHBhcnRzID0gc3RyaW5nVG9QYXRoKG5hbWUpO1xuXHR2YXIgaW50cmluc2ljQmFzZU5hbWUgPSBwYXJ0cy5sZW5ndGggPiAwID8gcGFydHNbMF0gOiAnJztcblxuXHR2YXIgaW50cmluc2ljID0gZ2V0QmFzZUludHJpbnNpYygnJScgKyBpbnRyaW5zaWNCYXNlTmFtZSArICclJywgYWxsb3dNaXNzaW5nKTtcblx0dmFyIGludHJpbnNpY1JlYWxOYW1lID0gaW50cmluc2ljLm5hbWU7XG5cdHZhciB2YWx1ZSA9IGludHJpbnNpYy52YWx1ZTtcblx0dmFyIHNraXBGdXJ0aGVyQ2FjaGluZyA9IGZhbHNlO1xuXG5cdHZhciBhbGlhcyA9IGludHJpbnNpYy5hbGlhcztcblx0aWYgKGFsaWFzKSB7XG5cdFx0aW50cmluc2ljQmFzZU5hbWUgPSBhbGlhc1swXTtcblx0XHQkc3BsaWNlQXBwbHkocGFydHMsICRjb25jYXQoWzAsIDFdLCBhbGlhcykpO1xuXHR9XG5cblx0Zm9yICh2YXIgaSA9IDEsIGlzT3duID0gdHJ1ZTsgaSA8IHBhcnRzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0dmFyIHBhcnQgPSBwYXJ0c1tpXTtcblx0XHR2YXIgZmlyc3QgPSAkc3RyU2xpY2UocGFydCwgMCwgMSk7XG5cdFx0dmFyIGxhc3QgPSAkc3RyU2xpY2UocGFydCwgLTEpO1xuXHRcdGlmIChcblx0XHRcdChcblx0XHRcdFx0KGZpcnN0ID09PSAnXCInIHx8IGZpcnN0ID09PSBcIidcIiB8fCBmaXJzdCA9PT0gJ2AnKVxuXHRcdFx0XHR8fCAobGFzdCA9PT0gJ1wiJyB8fCBsYXN0ID09PSBcIidcIiB8fCBsYXN0ID09PSAnYCcpXG5cdFx0XHQpXG5cdFx0XHQmJiBmaXJzdCAhPT0gbGFzdFxuXHRcdCkge1xuXHRcdFx0dGhyb3cgbmV3ICRTeW50YXhFcnJvcigncHJvcGVydHkgbmFtZXMgd2l0aCBxdW90ZXMgbXVzdCBoYXZlIG1hdGNoaW5nIHF1b3RlcycpO1xuXHRcdH1cblx0XHRpZiAocGFydCA9PT0gJ2NvbnN0cnVjdG9yJyB8fCAhaXNPd24pIHtcblx0XHRcdHNraXBGdXJ0aGVyQ2FjaGluZyA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aW50cmluc2ljQmFzZU5hbWUgKz0gJy4nICsgcGFydDtcblx0XHRpbnRyaW5zaWNSZWFsTmFtZSA9ICclJyArIGludHJpbnNpY0Jhc2VOYW1lICsgJyUnO1xuXG5cdFx0aWYgKGhhc093bihJTlRSSU5TSUNTLCBpbnRyaW5zaWNSZWFsTmFtZSkpIHtcblx0XHRcdHZhbHVlID0gSU5UUklOU0lDU1tpbnRyaW5zaWNSZWFsTmFtZV07XG5cdFx0fSBlbHNlIGlmICh2YWx1ZSAhPSBudWxsKSB7XG5cdFx0XHRpZiAoIShwYXJ0IGluIHZhbHVlKSkge1xuXHRcdFx0XHRpZiAoIWFsbG93TWlzc2luZykge1xuXHRcdFx0XHRcdHRocm93IG5ldyAkVHlwZUVycm9yKCdiYXNlIGludHJpbnNpYyBmb3IgJyArIG5hbWUgKyAnIGV4aXN0cywgYnV0IHRoZSBwcm9wZXJ0eSBpcyBub3QgYXZhaWxhYmxlLicpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB2b2lkIHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHRcdGlmICgkZ09QRCAmJiAoaSArIDEpID49IHBhcnRzLmxlbmd0aCkge1xuXHRcdFx0XHR2YXIgZGVzYyA9ICRnT1BEKHZhbHVlLCBwYXJ0KTtcblx0XHRcdFx0aXNPd24gPSAhIWRlc2M7XG5cblx0XHRcdFx0Ly8gQnkgY29udmVudGlvbiwgd2hlbiBhIGRhdGEgcHJvcGVydHkgaXMgY29udmVydGVkIHRvIGFuIGFjY2Vzc29yXG5cdFx0XHRcdC8vIHByb3BlcnR5IHRvIGVtdWxhdGUgYSBkYXRhIHByb3BlcnR5IHRoYXQgZG9lcyBub3Qgc3VmZmVyIGZyb21cblx0XHRcdFx0Ly8gdGhlIG92ZXJyaWRlIG1pc3Rha2UsIHRoYXQgYWNjZXNzb3IncyBnZXR0ZXIgaXMgbWFya2VkIHdpdGhcblx0XHRcdFx0Ly8gYW4gYG9yaWdpbmFsVmFsdWVgIHByb3BlcnR5LiBIZXJlLCB3aGVuIHdlIGRldGVjdCB0aGlzLCB3ZVxuXHRcdFx0XHQvLyB1cGhvbGQgdGhlIGlsbHVzaW9uIGJ5IHByZXRlbmRpbmcgdG8gc2VlIHRoYXQgb3JpZ2luYWwgZGF0YVxuXHRcdFx0XHQvLyBwcm9wZXJ0eSwgaS5lLiwgcmV0dXJuaW5nIHRoZSB2YWx1ZSByYXRoZXIgdGhhbiB0aGUgZ2V0dGVyXG5cdFx0XHRcdC8vIGl0c2VsZi5cblx0XHRcdFx0aWYgKGlzT3duICYmICdnZXQnIGluIGRlc2MgJiYgISgnb3JpZ2luYWxWYWx1ZScgaW4gZGVzYy5nZXQpKSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBkZXNjLmdldDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YWx1ZSA9IHZhbHVlW3BhcnRdO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpc093biA9IGhhc093bih2YWx1ZSwgcGFydCk7XG5cdFx0XHRcdHZhbHVlID0gdmFsdWVbcGFydF07XG5cdFx0XHR9XG5cblx0XHRcdGlmIChpc093biAmJiAhc2tpcEZ1cnRoZXJDYWNoaW5nKSB7XG5cdFx0XHRcdElOVFJJTlNJQ1NbaW50cmluc2ljUmVhbE5hbWVdID0gdmFsdWU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB2YWx1ZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBHZXRJbnRyaW5zaWMgPSByZXF1aXJlKCdnZXQtaW50cmluc2ljJyk7XG5cbnZhciAkZGVmaW5lUHJvcGVydHkgPSBHZXRJbnRyaW5zaWMoJyVPYmplY3QuZGVmaW5lUHJvcGVydHklJywgdHJ1ZSk7XG5cbnZhciBoYXNQcm9wZXJ0eURlc2NyaXB0b3JzID0gZnVuY3Rpb24gaGFzUHJvcGVydHlEZXNjcmlwdG9ycygpIHtcblx0aWYgKCRkZWZpbmVQcm9wZXJ0eSkge1xuXHRcdHRyeSB7XG5cdFx0XHQkZGVmaW5lUHJvcGVydHkoe30sICdhJywgeyB2YWx1ZTogMSB9KTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdC8vIElFIDggaGFzIGEgYnJva2VuIGRlZmluZVByb3BlcnR5XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmYWxzZTtcbn07XG5cbmhhc1Byb3BlcnR5RGVzY3JpcHRvcnMuaGFzQXJyYXlMZW5ndGhEZWZpbmVCdWcgPSBmdW5jdGlvbiBoYXNBcnJheUxlbmd0aERlZmluZUJ1ZygpIHtcblx0Ly8gbm9kZSB2MC42IGhhcyBhIGJ1ZyB3aGVyZSBhcnJheSBsZW5ndGhzIGNhbiBiZSBTZXQgYnV0IG5vdCBEZWZpbmVkXG5cdGlmICghaGFzUHJvcGVydHlEZXNjcmlwdG9ycygpKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dHJ5IHtcblx0XHRyZXR1cm4gJGRlZmluZVByb3BlcnR5KFtdLCAnbGVuZ3RoJywgeyB2YWx1ZTogMSB9KS5sZW5ndGggIT09IDE7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHQvLyBJbiBGaXJlZm94IDQtMjIsIGRlZmluaW5nIGxlbmd0aCBvbiBhbiBhcnJheSB0aHJvd3MgYW4gZXhjZXB0aW9uLlxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc1Byb3BlcnR5RGVzY3JpcHRvcnM7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBvcmlnU3ltYm9sID0gdHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sO1xudmFyIGhhc1N5bWJvbFNoYW0gPSByZXF1aXJlKCcuL3NoYW1zJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaGFzTmF0aXZlU3ltYm9scygpIHtcblx0aWYgKHR5cGVvZiBvcmlnU3ltYm9sICE9PSAnZnVuY3Rpb24nKSB7IHJldHVybiBmYWxzZTsgfVxuXHRpZiAodHlwZW9mIFN5bWJvbCAhPT0gJ2Z1bmN0aW9uJykgeyByZXR1cm4gZmFsc2U7IH1cblx0aWYgKHR5cGVvZiBvcmlnU3ltYm9sKCdmb28nKSAhPT0gJ3N5bWJvbCcpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdGlmICh0eXBlb2YgU3ltYm9sKCdiYXInKSAhPT0gJ3N5bWJvbCcpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0cmV0dXJuIGhhc1N5bWJvbFNoYW0oKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qIGVzbGludCBjb21wbGV4aXR5OiBbMiwgMThdLCBtYXgtc3RhdGVtZW50czogWzIsIDMzXSAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBoYXNTeW1ib2xzKCkge1xuXHRpZiAodHlwZW9mIFN5bWJvbCAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyAhPT0gJ2Z1bmN0aW9uJykgeyByZXR1cm4gZmFsc2U7IH1cblx0aWYgKHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09ICdzeW1ib2wnKSB7IHJldHVybiB0cnVlOyB9XG5cblx0dmFyIG9iaiA9IHt9O1xuXHR2YXIgc3ltID0gU3ltYm9sKCd0ZXN0Jyk7XG5cdHZhciBzeW1PYmogPSBPYmplY3Qoc3ltKTtcblx0aWYgKHR5cGVvZiBzeW0gPT09ICdzdHJpbmcnKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3ltKSAhPT0gJ1tvYmplY3QgU3ltYm9sXScpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3ltT2JqKSAhPT0gJ1tvYmplY3QgU3ltYm9sXScpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0Ly8gdGVtcCBkaXNhYmxlZCBwZXIgaHR0cHM6Ly9naXRodWIuY29tL2xqaGFyYi9vYmplY3QuYXNzaWduL2lzc3Vlcy8xN1xuXHQvLyBpZiAoc3ltIGluc3RhbmNlb2YgU3ltYm9sKSB7IHJldHVybiBmYWxzZTsgfVxuXHQvLyB0ZW1wIGRpc2FibGVkIHBlciBodHRwczovL2dpdGh1Yi5jb20vV2ViUmVmbGVjdGlvbi9nZXQtb3duLXByb3BlcnR5LXN5bWJvbHMvaXNzdWVzLzRcblx0Ly8gaWYgKCEoc3ltT2JqIGluc3RhbmNlb2YgU3ltYm9sKSkgeyByZXR1cm4gZmFsc2U7IH1cblxuXHQvLyBpZiAodHlwZW9mIFN5bWJvbC5wcm90b3R5cGUudG9TdHJpbmcgIT09ICdmdW5jdGlvbicpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdC8vIGlmIChTdHJpbmcoc3ltKSAhPT0gU3ltYm9sLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN5bSkpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0dmFyIHN5bVZhbCA9IDQyO1xuXHRvYmpbc3ltXSA9IHN5bVZhbDtcblx0Zm9yIChzeW0gaW4gb2JqKSB7IHJldHVybiBmYWxzZTsgfSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXJlc3RyaWN0ZWQtc3ludGF4LCBuby11bnJlYWNoYWJsZS1sb29wXG5cdGlmICh0eXBlb2YgT2JqZWN0LmtleXMgPT09ICdmdW5jdGlvbicgJiYgT2JqZWN0LmtleXMob2JqKS5sZW5ndGggIT09IDApIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0aWYgKHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyA9PT0gJ2Z1bmN0aW9uJyAmJiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLmxlbmd0aCAhPT0gMCkgeyByZXR1cm4gZmFsc2U7IH1cblxuXHR2YXIgc3ltcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqKTtcblx0aWYgKHN5bXMubGVuZ3RoICE9PSAxIHx8IHN5bXNbMF0gIT09IHN5bSkgeyByZXR1cm4gZmFsc2U7IH1cblxuXHRpZiAoIU9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChvYmosIHN5bSkpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0aWYgKHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0dmFyIGRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwgc3ltKTtcblx0XHRpZiAoZGVzY3JpcHRvci52YWx1ZSAhPT0gc3ltVmFsIHx8IGRlc2NyaXB0b3IuZW51bWVyYWJsZSAhPT0gdHJ1ZSkgeyByZXR1cm4gZmFsc2U7IH1cblx0fVxuXG5cdHJldHVybiB0cnVlO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCdmdW5jdGlvbi1iaW5kJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYmluZC5jYWxsKEZ1bmN0aW9uLmNhbGwsIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZm5Ub1N0ciA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZztcbnZhciByZWZsZWN0QXBwbHkgPSB0eXBlb2YgUmVmbGVjdCA9PT0gJ29iamVjdCcgJiYgUmVmbGVjdCAhPT0gbnVsbCAmJiBSZWZsZWN0LmFwcGx5O1xudmFyIGJhZEFycmF5TGlrZTtcbnZhciBpc0NhbGxhYmxlTWFya2VyO1xuaWYgKHR5cGVvZiByZWZsZWN0QXBwbHkgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJykge1xuXHR0cnkge1xuXHRcdGJhZEFycmF5TGlrZSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2xlbmd0aCcsIHtcblx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR0aHJvdyBpc0NhbGxhYmxlTWFya2VyO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGlzQ2FsbGFibGVNYXJrZXIgPSB7fTtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdGhyb3ctbGl0ZXJhbFxuXHRcdHJlZmxlY3RBcHBseShmdW5jdGlvbiAoKSB7IHRocm93IDQyOyB9LCBudWxsLCBiYWRBcnJheUxpa2UpO1xuXHR9IGNhdGNoIChfKSB7XG5cdFx0aWYgKF8gIT09IGlzQ2FsbGFibGVNYXJrZXIpIHtcblx0XHRcdHJlZmxlY3RBcHBseSA9IG51bGw7XG5cdFx0fVxuXHR9XG59IGVsc2Uge1xuXHRyZWZsZWN0QXBwbHkgPSBudWxsO1xufVxuXG52YXIgY29uc3RydWN0b3JSZWdleCA9IC9eXFxzKmNsYXNzXFxiLztcbnZhciBpc0VTNkNsYXNzRm4gPSBmdW5jdGlvbiBpc0VTNkNsYXNzRnVuY3Rpb24odmFsdWUpIHtcblx0dHJ5IHtcblx0XHR2YXIgZm5TdHIgPSBmblRvU3RyLmNhbGwodmFsdWUpO1xuXHRcdHJldHVybiBjb25zdHJ1Y3RvclJlZ2V4LnRlc3QoZm5TdHIpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0cmV0dXJuIGZhbHNlOyAvLyBub3QgYSBmdW5jdGlvblxuXHR9XG59O1xuXG52YXIgdHJ5RnVuY3Rpb25PYmplY3QgPSBmdW5jdGlvbiB0cnlGdW5jdGlvblRvU3RyKHZhbHVlKSB7XG5cdHRyeSB7XG5cdFx0aWYgKGlzRVM2Q2xhc3NGbih2YWx1ZSkpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdFx0Zm5Ub1N0ci5jYWxsKHZhbHVlKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIgZm5DbGFzcyA9ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG52YXIgZ2VuQ2xhc3MgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nO1xudmFyIGhhc1RvU3RyaW5nVGFnID0gdHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiAhIVN5bWJvbC50b1N0cmluZ1RhZzsgLy8gYmV0dGVyOiB1c2UgYGhhcy10b3N0cmluZ3RhZ2Bcbi8qIGdsb2JhbHMgZG9jdW1lbnQ6IGZhbHNlICovXG52YXIgZG9jdW1lbnREb3RBbGwgPSB0eXBlb2YgZG9jdW1lbnQgPT09ICdvYmplY3QnICYmIHR5cGVvZiBkb2N1bWVudC5hbGwgPT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LmFsbCAhPT0gdW5kZWZpbmVkID8gZG9jdW1lbnQuYWxsIDoge307XG5cbm1vZHVsZS5leHBvcnRzID0gcmVmbGVjdEFwcGx5XG5cdD8gZnVuY3Rpb24gaXNDYWxsYWJsZSh2YWx1ZSkge1xuXHRcdGlmICh2YWx1ZSA9PT0gZG9jdW1lbnREb3RBbGwpIHsgcmV0dXJuIHRydWU7IH1cblx0XHRpZiAoIXZhbHVlKSB7IHJldHVybiBmYWxzZTsgfVxuXHRcdGlmICh0eXBlb2YgdmFsdWUgIT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JykgeyByZXR1cm4gZmFsc2U7IH1cblx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICYmICF2YWx1ZS5wcm90b3R5cGUpIHsgcmV0dXJuIHRydWU7IH1cblx0XHR0cnkge1xuXHRcdFx0cmVmbGVjdEFwcGx5KHZhbHVlLCBudWxsLCBiYWRBcnJheUxpa2UpO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGlmIChlICE9PSBpc0NhbGxhYmxlTWFya2VyKSB7IHJldHVybiBmYWxzZTsgfVxuXHRcdH1cblx0XHRyZXR1cm4gIWlzRVM2Q2xhc3NGbih2YWx1ZSk7XG5cdH1cblx0OiBmdW5jdGlvbiBpc0NhbGxhYmxlKHZhbHVlKSB7XG5cdFx0aWYgKHZhbHVlID09PSBkb2N1bWVudERvdEFsbCkgeyByZXR1cm4gdHJ1ZTsgfVxuXHRcdGlmICghdmFsdWUpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7IHJldHVybiBmYWxzZTsgfVxuXHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgJiYgIXZhbHVlLnByb3RvdHlwZSkgeyByZXR1cm4gdHJ1ZTsgfVxuXHRcdGlmIChoYXNUb1N0cmluZ1RhZykgeyByZXR1cm4gdHJ5RnVuY3Rpb25PYmplY3QodmFsdWUpOyB9XG5cdFx0aWYgKGlzRVM2Q2xhc3NGbih2YWx1ZSkpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdFx0dmFyIHN0ckNsYXNzID0gdG9TdHIuY2FsbCh2YWx1ZSk7XG5cdFx0cmV0dXJuIHN0ckNsYXNzID09PSBmbkNsYXNzIHx8IHN0ckNsYXNzID09PSBnZW5DbGFzcztcblx0fTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGtleXNTaGltO1xuaWYgKCFPYmplY3Qua2V5cykge1xuXHQvLyBtb2RpZmllZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9lcy1zaGltcy9lczUtc2hpbVxuXHR2YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblx0dmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblx0dmFyIGlzQXJncyA9IHJlcXVpcmUoJy4vaXNBcmd1bWVudHMnKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBnbG9iYWwtcmVxdWlyZVxuXHR2YXIgaXNFbnVtZXJhYmxlID0gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblx0dmFyIGhhc0RvbnRFbnVtQnVnID0gIWlzRW51bWVyYWJsZS5jYWxsKHsgdG9TdHJpbmc6IG51bGwgfSwgJ3RvU3RyaW5nJyk7XG5cdHZhciBoYXNQcm90b0VudW1CdWcgPSBpc0VudW1lcmFibGUuY2FsbChmdW5jdGlvbiAoKSB7fSwgJ3Byb3RvdHlwZScpO1xuXHR2YXIgZG9udEVudW1zID0gW1xuXHRcdCd0b1N0cmluZycsXG5cdFx0J3RvTG9jYWxlU3RyaW5nJyxcblx0XHQndmFsdWVPZicsXG5cdFx0J2hhc093blByb3BlcnR5Jyxcblx0XHQnaXNQcm90b3R5cGVPZicsXG5cdFx0J3Byb3BlcnR5SXNFbnVtZXJhYmxlJyxcblx0XHQnY29uc3RydWN0b3InXG5cdF07XG5cdHZhciBlcXVhbHNDb25zdHJ1Y3RvclByb3RvdHlwZSA9IGZ1bmN0aW9uIChvKSB7XG5cdFx0dmFyIGN0b3IgPSBvLmNvbnN0cnVjdG9yO1xuXHRcdHJldHVybiBjdG9yICYmIGN0b3IucHJvdG90eXBlID09PSBvO1xuXHR9O1xuXHR2YXIgZXhjbHVkZWRLZXlzID0ge1xuXHRcdCRhcHBsaWNhdGlvbkNhY2hlOiB0cnVlLFxuXHRcdCRjb25zb2xlOiB0cnVlLFxuXHRcdCRleHRlcm5hbDogdHJ1ZSxcblx0XHQkZnJhbWU6IHRydWUsXG5cdFx0JGZyYW1lRWxlbWVudDogdHJ1ZSxcblx0XHQkZnJhbWVzOiB0cnVlLFxuXHRcdCRpbm5lckhlaWdodDogdHJ1ZSxcblx0XHQkaW5uZXJXaWR0aDogdHJ1ZSxcblx0XHQkb25tb3pmdWxsc2NyZWVuY2hhbmdlOiB0cnVlLFxuXHRcdCRvbm1vemZ1bGxzY3JlZW5lcnJvcjogdHJ1ZSxcblx0XHQkb3V0ZXJIZWlnaHQ6IHRydWUsXG5cdFx0JG91dGVyV2lkdGg6IHRydWUsXG5cdFx0JHBhZ2VYT2Zmc2V0OiB0cnVlLFxuXHRcdCRwYWdlWU9mZnNldDogdHJ1ZSxcblx0XHQkcGFyZW50OiB0cnVlLFxuXHRcdCRzY3JvbGxMZWZ0OiB0cnVlLFxuXHRcdCRzY3JvbGxUb3A6IHRydWUsXG5cdFx0JHNjcm9sbFg6IHRydWUsXG5cdFx0JHNjcm9sbFk6IHRydWUsXG5cdFx0JHNlbGY6IHRydWUsXG5cdFx0JHdlYmtpdEluZGV4ZWREQjogdHJ1ZSxcblx0XHQkd2Via2l0U3RvcmFnZUluZm86IHRydWUsXG5cdFx0JHdpbmRvdzogdHJ1ZVxuXHR9O1xuXHR2YXIgaGFzQXV0b21hdGlvbkVxdWFsaXR5QnVnID0gKGZ1bmN0aW9uICgpIHtcblx0XHQvKiBnbG9iYWwgd2luZG93ICovXG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7IHJldHVybiBmYWxzZTsgfVxuXHRcdGZvciAodmFyIGsgaW4gd2luZG93KSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRpZiAoIWV4Y2x1ZGVkS2V5c1snJCcgKyBrXSAmJiBoYXMuY2FsbCh3aW5kb3csIGspICYmIHdpbmRvd1trXSAhPT0gbnVsbCAmJiB0eXBlb2Ygd2luZG93W2tdID09PSAnb2JqZWN0Jykge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRlcXVhbHNDb25zdHJ1Y3RvclByb3RvdHlwZSh3aW5kb3dba10pO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KCkpO1xuXHR2YXIgZXF1YWxzQ29uc3RydWN0b3JQcm90b3R5cGVJZk5vdEJ1Z2d5ID0gZnVuY3Rpb24gKG8pIHtcblx0XHQvKiBnbG9iYWwgd2luZG93ICovXG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnIHx8ICFoYXNBdXRvbWF0aW9uRXF1YWxpdHlCdWcpIHtcblx0XHRcdHJldHVybiBlcXVhbHNDb25zdHJ1Y3RvclByb3RvdHlwZShvKTtcblx0XHR9XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiBlcXVhbHNDb25zdHJ1Y3RvclByb3RvdHlwZShvKTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9O1xuXG5cdGtleXNTaGltID0gZnVuY3Rpb24ga2V5cyhvYmplY3QpIHtcblx0XHR2YXIgaXNPYmplY3QgPSBvYmplY3QgIT09IG51bGwgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCc7XG5cdFx0dmFyIGlzRnVuY3Rpb24gPSB0b1N0ci5jYWxsKG9iamVjdCkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG5cdFx0dmFyIGlzQXJndW1lbnRzID0gaXNBcmdzKG9iamVjdCk7XG5cdFx0dmFyIGlzU3RyaW5nID0gaXNPYmplY3QgJiYgdG9TdHIuY2FsbChvYmplY3QpID09PSAnW29iamVjdCBTdHJpbmddJztcblx0XHR2YXIgdGhlS2V5cyA9IFtdO1xuXG5cdFx0aWYgKCFpc09iamVjdCAmJiAhaXNGdW5jdGlvbiAmJiAhaXNBcmd1bWVudHMpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5rZXlzIGNhbGxlZCBvbiBhIG5vbi1vYmplY3QnKTtcblx0XHR9XG5cblx0XHR2YXIgc2tpcFByb3RvID0gaGFzUHJvdG9FbnVtQnVnICYmIGlzRnVuY3Rpb247XG5cdFx0aWYgKGlzU3RyaW5nICYmIG9iamVjdC5sZW5ndGggPiAwICYmICFoYXMuY2FsbChvYmplY3QsIDApKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG9iamVjdC5sZW5ndGg7ICsraSkge1xuXHRcdFx0XHR0aGVLZXlzLnB1c2goU3RyaW5nKGkpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoaXNBcmd1bWVudHMgJiYgb2JqZWN0Lmxlbmd0aCA+IDApIHtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgb2JqZWN0Lmxlbmd0aDsgKytqKSB7XG5cdFx0XHRcdHRoZUtleXMucHVzaChTdHJpbmcoaikpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRmb3IgKHZhciBuYW1lIGluIG9iamVjdCkge1xuXHRcdFx0XHRpZiAoIShza2lwUHJvdG8gJiYgbmFtZSA9PT0gJ3Byb3RvdHlwZScpICYmIGhhcy5jYWxsKG9iamVjdCwgbmFtZSkpIHtcblx0XHRcdFx0XHR0aGVLZXlzLnB1c2goU3RyaW5nKG5hbWUpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChoYXNEb250RW51bUJ1Zykge1xuXHRcdFx0dmFyIHNraXBDb25zdHJ1Y3RvciA9IGVxdWFsc0NvbnN0cnVjdG9yUHJvdG90eXBlSWZOb3RCdWdneShvYmplY3QpO1xuXG5cdFx0XHRmb3IgKHZhciBrID0gMDsgayA8IGRvbnRFbnVtcy5sZW5ndGg7ICsraykge1xuXHRcdFx0XHRpZiAoIShza2lwQ29uc3RydWN0b3IgJiYgZG9udEVudW1zW2tdID09PSAnY29uc3RydWN0b3InKSAmJiBoYXMuY2FsbChvYmplY3QsIGRvbnRFbnVtc1trXSkpIHtcblx0XHRcdFx0XHR0aGVLZXlzLnB1c2goZG9udEVudW1zW2tdKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdGhlS2V5cztcblx0fTtcbn1cbm1vZHVsZS5leHBvcnRzID0ga2V5c1NoaW07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBpc0FyZ3MgPSByZXF1aXJlKCcuL2lzQXJndW1lbnRzJyk7XG5cbnZhciBvcmlnS2V5cyA9IE9iamVjdC5rZXlzO1xudmFyIGtleXNTaGltID0gb3JpZ0tleXMgPyBmdW5jdGlvbiBrZXlzKG8pIHsgcmV0dXJuIG9yaWdLZXlzKG8pOyB9IDogcmVxdWlyZSgnLi9pbXBsZW1lbnRhdGlvbicpO1xuXG52YXIgb3JpZ2luYWxLZXlzID0gT2JqZWN0LmtleXM7XG5cbmtleXNTaGltLnNoaW0gPSBmdW5jdGlvbiBzaGltT2JqZWN0S2V5cygpIHtcblx0aWYgKE9iamVjdC5rZXlzKSB7XG5cdFx0dmFyIGtleXNXb3Jrc1dpdGhBcmd1bWVudHMgPSAoZnVuY3Rpb24gKCkge1xuXHRcdFx0Ly8gU2FmYXJpIDUuMCBidWdcblx0XHRcdHZhciBhcmdzID0gT2JqZWN0LmtleXMoYXJndW1lbnRzKTtcblx0XHRcdHJldHVybiBhcmdzICYmIGFyZ3MubGVuZ3RoID09PSBhcmd1bWVudHMubGVuZ3RoO1xuXHRcdH0oMSwgMikpO1xuXHRcdGlmICgha2V5c1dvcmtzV2l0aEFyZ3VtZW50cykge1xuXHRcdFx0T2JqZWN0LmtleXMgPSBmdW5jdGlvbiBrZXlzKG9iamVjdCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGZ1bmMtbmFtZS1tYXRjaGluZ1xuXHRcdFx0XHRpZiAoaXNBcmdzKG9iamVjdCkpIHtcblx0XHRcdFx0XHRyZXR1cm4gb3JpZ2luYWxLZXlzKHNsaWNlLmNhbGwob2JqZWN0KSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG9yaWdpbmFsS2V5cyhvYmplY3QpO1xuXHRcdFx0fTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0T2JqZWN0LmtleXMgPSBrZXlzU2hpbTtcblx0fVxuXHRyZXR1cm4gT2JqZWN0LmtleXMgfHwga2V5c1NoaW07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGtleXNTaGltO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQXJndW1lbnRzKHZhbHVlKSB7XG5cdHZhciBzdHIgPSB0b1N0ci5jYWxsKHZhbHVlKTtcblx0dmFyIGlzQXJncyA9IHN0ciA9PT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cdGlmICghaXNBcmdzKSB7XG5cdFx0aXNBcmdzID0gc3RyICE9PSAnW29iamVjdCBBcnJheV0nICYmXG5cdFx0XHR2YWx1ZSAhPT0gbnVsbCAmJlxuXHRcdFx0dHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJlxuXHRcdFx0dHlwZW9mIHZhbHVlLmxlbmd0aCA9PT0gJ251bWJlcicgJiZcblx0XHRcdHZhbHVlLmxlbmd0aCA+PSAwICYmXG5cdFx0XHR0b1N0ci5jYWxsKHZhbHVlLmNhbGxlZSkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG5cdH1cblx0cmV0dXJuIGlzQXJncztcbn07XG4iLCIvKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IE9wdGlvbnNcbiAqXG4gKiBAcHJvcGVydHkge051bWJlcn0gW3RpbWVvdXQ9MF0gLSBUaW1lb3V0IGluIG1zIGFmdGVyIHRoYXQgcHJvbWlzZSB3aWxsIGJlIHJlamVjdGVkIGF1dG9tYXRpY2FsbHkuXG4gKiBAcHJvcGVydHkge1N0cmluZ3xGdW5jdGlvbn0gW3RpbWVvdXRSZWFzb25dIC0gUmVqZWN0aW9uIHJlYXNvbiBmb3IgdGltZW91dC5cbiAqIFByb21pc2Ugd2lsbCBiZSByZWplY3RlZCB3aXRoIHtAbGluayBQcm9taXNlQ29udHJvbGxlci5UaW1lb3V0RXJyb3J9IGFuZCB0aGlzIG1lc3NhZ2UuIFRoZSBtZXNzYWdlIGNhbiBjb250YWluXG4gKiBwbGFjZWhvbGRlciBge3RpbWVvdXR9YCBmb3IgYWN0dWFsIHRpbWVvdXQgdmFsdWUuIElmIHRpbWVvdXRSZWFzb24gaXMgYSBmdW5jdGlvbixcbiAqIGl0IHdpbGwgYmUgZXZhbHVhdGVkIGFuZCByZXR1cm5lZCB2YWx1ZSB3aWxsIGJlIHVzZWQgYXMgbWVzc2FnZS5cbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfEZ1bmN0aW9ufSBbcmVzZXRSZWFzb25dIC0gUmVqZWN0aW9uIHJlYXNvbiB1c2VkIHdoZW4gYC5yZXNldCgpYCBpcyBjYWxsZWQgd2hpbGUgcHJvbWlzZSBpcyBwZW5kaW5nLlxuICogUHJvbWlzZSB3aWxsIGJlIHJlamVjdGVkIHdpdGgge0BsaW5rIFByb21pc2VDb250cm9sbGVyLlJlc2V0RXJyb3J9IGFuZCB0aGlzIG1lc3NhZ2UuIElmIHJlc2V0UmVhc29uIGlzIGEgZnVuY3Rpb24sXG4gKiBpdCB3aWxsIGJlIGV2YWx1YXRlZCBhbmQgcmV0dXJuZWQgdmFsdWUgd2lsbCBiZSB1c2VkIGFzIG1lc3NhZ2UuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHRpbWVvdXQ6IDAsXG4gIHRpbWVvdXRSZWFzb246ICdQcm9taXNlIHJlamVjdGVkIGJ5IFByb21pc2VDb250cm9sbGVyIHRpbWVvdXQge3RpbWVvdXR9IG1zLicsXG4gIHJlc2V0UmVhc29uOiAnUHJvbWlzZSByZWplY3RlZCBieSBQcm9taXNlQ29udHJvbGxlciByZXNldC4nLFxufTtcbiIsIi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcbmNvbnN0IHtpc1Byb21pc2UsIGNyZWF0ZUVycm9yVHlwZSwgdHJ5Q2FsbH0gPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbi8qKlxuICogQHR5cGljYWxuYW1lIHBjXG4gKi9cbmNsYXNzIFByb21pc2VDb250cm9sbGVyIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgcHJvbWlzZSBjb250cm9sbGVyLiBVbmxpa2Ugb3JpZ2luYWwgUHJvbWlzZSwgaXQgZG9lcyBub3QgaW1tZWRpYXRlbHkgY2FsbCBhbnkgZnVuY3Rpb24uXG4gICAqIEluc3RlYWQgaXQgaGFzIFsuY2FsbCgpXSgjUHJvbWlzZUNvbnRyb2xsZXIrY2FsbCkgbWV0aG9kIHRoYXQgY2FsbHMgcHJvdmlkZWQgZnVuY3Rpb25cbiAgICogYW5kIHN0b3JlcyBgcmVzb2x2ZSAvIHJlamVjdGAgbWV0aG9kcyBmb3IgZnV0dXJlIGFjY2Vzcy5cbiAgICpcbiAgICogQHBhcmFtIHtPcHRpb25zfSBbb3B0aW9uc11cbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLl9vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIHRoaXMuX3Jlc29sdmUgPSBudWxsO1xuICAgIHRoaXMuX3JlamVjdCA9IG51bGw7XG4gICAgdGhpcy5faXNQZW5kaW5nID0gZmFsc2U7XG4gICAgdGhpcy5faXNGdWxmaWxsZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9pc1JlamVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5fdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fcHJvbWlzZSA9IG51bGw7XG4gICAgdGhpcy5fdGltZXIgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgcHJvbWlzZSBpdHNlbGYuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgKi9cbiAgZ2V0IHByb21pc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB2YWx1ZSB3aXRoIHRoYXQgcHJvbWlzZSB3YXMgc2V0dGxlZCAoZnVsZmlsbGVkIG9yIHJlamVjdGVkKS5cbiAgICpcbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBnZXQgdmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBwcm9taXNlIGlzIHBlbmRpbmcuXG4gICAqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKi9cbiAgZ2V0IGlzUGVuZGluZygpIHtcbiAgICByZXR1cm4gdGhpcy5faXNQZW5kaW5nO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBwcm9taXNlIGlzIGZ1bGZpbGxlZC5cbiAgICpcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqL1xuICBnZXQgaXNGdWxmaWxsZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzRnVsZmlsbGVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBwcm9taXNlIHJlamVjdGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICovXG4gIGdldCBpc1JlamVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl9pc1JlamVjdGVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBwcm9taXNlIGlzIGZ1bGZpbGxlZCBvciByZWplY3RlZC5cbiAgICpcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqL1xuICBnZXQgaXNTZXR0bGVkKCkge1xuICAgIHJldHVybiB0aGlzLl9pc0Z1bGZpbGxlZCB8fCB0aGlzLl9pc1JlamVjdGVkO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIGBmbmAgYW5kIHJldHVybnMgcHJvbWlzZSBPUiBqdXN0IHJldHVybnMgZXhpc3RpbmcgcHJvbWlzZSBmcm9tIHByZXZpb3VzIGBjYWxsKClgIGlmIGl0IGlzIHN0aWxsIHBlbmRpbmcuXG4gICAqIFRvIGZ1bGZpbGwgcmV0dXJuZWQgcHJvbWlzZSB5b3Ugc2hvdWxkIHVzZVxuICAgKiB7QGxpbmsgUHJvbWlzZUNvbnRyb2xsZXIjcmVzb2x2ZX0gLyB7QGxpbmsgUHJvbWlzZUNvbnRyb2xsZXIjcmVqZWN0fSBtZXRob2RzLlxuICAgKiBJZiBgZm5gIGl0c2VsZiByZXR1cm5zIHByb21pc2UsIHRoZW4gZXh0ZXJuYWwgcHJvbWlzZSBpcyBhdHRhY2hlZCB0byBpdCBhbmQgZnVsZmlsbHMgdG9nZXRoZXIuXG4gICAqIElmIG5vIGBmbmAgcGFzc2VkIC0gcHJvbWlzZUNvbnRyb2xsZXIgaXMgaW5pdGlhbGl6ZWQgYXMgd2VsbC5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXSBmdW5jdGlvbiB0byBiZSBjYWxsZWQuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgKi9cbiAgY2FsbChmbikge1xuICAgIGlmICghdGhpcy5faXNQZW5kaW5nKSB7XG4gICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICB0aGlzLl9jcmVhdGVQcm9taXNlKCk7XG4gICAgICB0aGlzLl9jcmVhdGVUaW1lcigpO1xuICAgICAgdGhpcy5fY2FsbEZuKGZuKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3Byb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogUmVzb2x2ZXMgcGVuZGluZyBwcm9taXNlIHdpdGggc3BlY2lmaWVkIGB2YWx1ZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gW3ZhbHVlXVxuICAgKi9cbiAgcmVzb2x2ZSh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9pc1BlbmRpbmcpIHtcbiAgICAgIGlmIChpc1Byb21pc2UodmFsdWUpKSB7XG4gICAgICAgIHRoaXMuX3RyeUF0dGFjaFRvUHJvbWlzZSh2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zZXR0bGUodmFsdWUpO1xuICAgICAgICB0aGlzLl9pc0Z1bGZpbGxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuX3Jlc29sdmUodmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWplY3RzIHBlbmRpbmcgcHJvbWlzZSB3aXRoIHNwZWNpZmllZCBgdmFsdWVgLlxuICAgKlxuICAgKiBAcGFyYW0geyp9IFt2YWx1ZV1cbiAgICovXG4gIHJlamVjdCh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9pc1BlbmRpbmcpIHtcbiAgICAgIHRoaXMuX3NldHRsZSh2YWx1ZSk7XG4gICAgICB0aGlzLl9pc1JlamVjdGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX3JlamVjdCh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0byBpbml0aWFsIHN0YXRlLlxuICAgKiBJZiBwcm9taXNlIGlzIHBlbmRpbmcgaXQgd2lsbCBiZSByZWplY3RlZCB3aXRoIHtAbGluayBQcm9taXNlQ29udHJvbGxlci5SZXNldEVycm9yfS5cbiAgICovXG4gIHJlc2V0KCkge1xuICAgIGlmICh0aGlzLl9pc1BlbmRpbmcpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSB0cnlDYWxsKHRoaXMuX29wdGlvbnMucmVzZXRSZWFzb24pO1xuICAgICAgY29uc3QgZXJyb3IgPSBuZXcgUHJvbWlzZUNvbnRyb2xsZXIuUmVzZXRFcnJvcihtZXNzYWdlKTtcbiAgICAgIHRoaXMucmVqZWN0KGVycm9yKTtcbiAgICB9XG4gICAgdGhpcy5fcHJvbWlzZSA9IG51bGw7XG4gICAgdGhpcy5faXNQZW5kaW5nID0gZmFsc2U7XG4gICAgdGhpcy5faXNGdWxmaWxsZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9pc1JlamVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5fdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fY2xlYXJUaW1lcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlLWFzc2lnbiBvbmUgb3IgbW9yZSBvcHRpb25zLlxuICAgKlxuICAgKiBAcGFyYW0ge09wdGlvbnN9IG9wdGlvbnNcbiAgICovXG4gIGNvbmZpZ3VyZShvcHRpb25zKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLl9vcHRpb25zLCBvcHRpb25zKTtcbiAgfVxuXG4gIF9jcmVhdGVQcm9taXNlKCkge1xuICAgIHRoaXMuX3Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLl9pc1BlbmRpbmcgPSB0cnVlO1xuICAgICAgdGhpcy5fcmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICB0aGlzLl9yZWplY3QgPSByZWplY3Q7XG4gICAgfSk7XG4gIH1cblxuICBfaGFuZGxlVGltZW91dCgpIHtcbiAgICBjb25zdCBtZXNzYWdlVHBsID0gdHJ5Q2FsbCh0aGlzLl9vcHRpb25zLnRpbWVvdXRSZWFzb24pO1xuICAgIGNvbnN0IG1lc3NhZ2UgPSB0eXBlb2YgbWVzc2FnZVRwbCA9PT0gJ3N0cmluZycgPyBtZXNzYWdlVHBsLnJlcGxhY2UoJ3t0aW1lb3V0fScsIHRoaXMuX29wdGlvbnMudGltZW91dCkgOiAnJztcbiAgICBjb25zdCBlcnJvciA9IG5ldyBQcm9taXNlQ29udHJvbGxlci5UaW1lb3V0RXJyb3IobWVzc2FnZSk7XG4gICAgdGhpcy5yZWplY3QoZXJyb3IpO1xuICB9XG5cbiAgX2NyZWF0ZVRpbWVyKCkge1xuICAgIGlmICh0aGlzLl9vcHRpb25zLnRpbWVvdXQpIHtcbiAgICAgIHRoaXMuX3RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLl9oYW5kbGVUaW1lb3V0KCksIHRoaXMuX29wdGlvbnMudGltZW91dCk7XG4gICAgfVxuICB9XG5cbiAgX2NsZWFyVGltZXIoKSB7XG4gICAgaWYgKHRoaXMuX3RpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuICAgICAgdGhpcy5fdGltZXIgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9zZXR0bGUodmFsdWUpIHtcbiAgICB0aGlzLl9pc1BlbmRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuX2NsZWFyVGltZXIoKTtcbiAgfVxuXG4gIF9jYWxsRm4oZm4pIHtcbiAgICBpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBmbigpO1xuICAgICAgICB0aGlzLl90cnlBdHRhY2hUb1Byb21pc2UocmVzdWx0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5yZWplY3QoZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3RyeUF0dGFjaFRvUHJvbWlzZShwKSB7XG4gICAgaWYgKGlzUHJvbWlzZShwKSkge1xuICAgICAgcC50aGVuKHZhbHVlID0+IHRoaXMucmVzb2x2ZSh2YWx1ZSksIGUgPT4gdGhpcy5yZWplY3QoZSkpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEVycm9yIGZvciByZWplY3Rpb24gaW4gY2FzZSBvZiB0aW1lb3V0LlxuICogQHR5cGUge1Byb21pc2VDb250cm9sbGVyLlRpbWVvdXRFcnJvcn1cbiAqL1xuUHJvbWlzZUNvbnRyb2xsZXIuVGltZW91dEVycm9yID0gY3JlYXRlRXJyb3JUeXBlKCdUaW1lb3V0RXJyb3InKTtcblxuLyoqXG4gKiBFcnJvciBmb3IgcmVqZWN0aW9uIGluIGNhc2Ugb2YgY2FsbCBgLnJlc2V0KClgIHdoaWxlIHByb21pc2UgaXMgcGVuZGluZy5cbiAqIEB0eXBlIHtQcm9taXNlQ29udHJvbGxlci5SZXNldEVycm9yfVxuICovXG5Qcm9taXNlQ29udHJvbGxlci5SZXNldEVycm9yID0gY3JlYXRlRXJyb3JUeXBlKCdSZXNldEVycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvbWlzZUNvbnRyb2xsZXI7XG4iLCJcbi8qKlxuICogU2ltcGxlIGNoZWNrIGZvciBQcm9taXNlLlxuICogQHBhcmFtIHsqfSBwXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAqIEBpZ25vcmVcbiAqL1xuZXhwb3J0cy5pc1Byb21pc2UgPSBmdW5jdGlvbiAocCkge1xuICByZXR1cm4gcCAmJiB0eXBlb2YgcC50aGVuID09PSAnZnVuY3Rpb24nO1xufTtcblxuLyoqXG4gKiBDYWxscyBhcmd1bWVudCBpZiBpdCBpcyBmdW5jdGlvblxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybnMgeyp9XG4gKiBAaWdub3JlXG4gKi9cbmV4cG9ydHMudHJ5Q2FsbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nID8gdmFsdWUoKSA6IHZhbHVlO1xufTtcblxuLyoqXG4gKiBKdXN0IGBjbGFzcyBNeUVycm9yIGV4dGVuZHMgRXJyb3JgIGRvZXMgbm90IHdvcmsgd2l0aCB0cmFuc3BpbGVyLlxuICogU2VlOiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMzgyMTA3L3doYXRzLWEtZ29vZC13YXktdG8tZXh0ZW5kLWVycm9yLWluLWphdmFzY3JpcHRcbiAqIEBpZ25vcmVcbiAqL1xuZXhwb3J0cy5jcmVhdGVFcnJvclR5cGUgPSBmdW5jdGlvbiAobmFtZSkge1xuICBmdW5jdGlvbiBFKG1lc3NhZ2UpIHtcbiAgICBpZiAoIUVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgICB0aGlzLnN0YWNrID0gKG5ldyBFcnJvcigpKS5zdGFjaztcbiAgICB9IGVsc2Uge1xuICAgICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgdGhpcy5jb25zdHJ1Y3Rvcik7XG4gICAgfVxuICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gIH1cbiAgRS5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcbiAgRS5wcm90b3R5cGUubmFtZSA9IG5hbWU7XG4gIEUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRTtcbiAgcmV0dXJuIEU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmVxdWlyZVByb21pc2UgPSByZXF1aXJlKCcuL3JlcXVpcmVQcm9taXNlJyk7XG5cbnJlcXVpcmVQcm9taXNlKCk7XG5cbnZhciBJc0NhbGxhYmxlID0gcmVxdWlyZSgnZXMtYWJzdHJhY3QvMjAyMS9Jc0NhbGxhYmxlJyk7XG52YXIgU3BlY2llc0NvbnN0cnVjdG9yID0gcmVxdWlyZSgnZXMtYWJzdHJhY3QvMjAyMS9TcGVjaWVzQ29uc3RydWN0b3InKTtcbnZhciBUeXBlID0gcmVxdWlyZSgnZXMtYWJzdHJhY3QvMjAyMS9UeXBlJyk7XG5cbnZhciBwcm9taXNlUmVzb2x2ZSA9IGZ1bmN0aW9uIFByb21pc2VSZXNvbHZlKEMsIHZhbHVlKSB7XG5cdHJldHVybiBuZXcgQyhmdW5jdGlvbiAocmVzb2x2ZSkge1xuXHRcdHJlc29sdmUodmFsdWUpO1xuXHR9KTtcbn07XG5cbnZhciBPcmlnaW5hbFByb21pc2UgPSBQcm9taXNlO1xuXG52YXIgY3JlYXRlVGhlbkZpbmFsbHkgPSBmdW5jdGlvbiBDcmVhdGVUaGVuRmluYWxseShDLCBvbkZpbmFsbHkpIHtcblx0cmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdHZhciByZXN1bHQgPSBvbkZpbmFsbHkoKTtcblx0XHR2YXIgcHJvbWlzZSA9IHByb21pc2VSZXNvbHZlKEMsIHJlc3VsdCk7XG5cdFx0dmFyIHZhbHVlVGh1bmsgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fTtcblx0XHRyZXR1cm4gcHJvbWlzZS50aGVuKHZhbHVlVGh1bmspO1xuXHR9O1xufTtcblxudmFyIGNyZWF0ZUNhdGNoRmluYWxseSA9IGZ1bmN0aW9uIENyZWF0ZUNhdGNoRmluYWxseShDLCBvbkZpbmFsbHkpIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChyZWFzb24pIHtcblx0XHR2YXIgcmVzdWx0ID0gb25GaW5hbGx5KCk7XG5cdFx0dmFyIHByb21pc2UgPSBwcm9taXNlUmVzb2x2ZShDLCByZXN1bHQpO1xuXHRcdHZhciB0aHJvd2VyID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0dGhyb3cgcmVhc29uO1xuXHRcdH07XG5cdFx0cmV0dXJuIHByb21pc2UudGhlbih0aHJvd2VyKTtcblx0fTtcbn07XG5cbnZhciBwcm9taXNlRmluYWxseSA9IGZ1bmN0aW9uIGZpbmFsbHlfKG9uRmluYWxseSkge1xuXHQvKiBlc2xpbnQgbm8taW52YWxpZC10aGlzOiAwICovXG5cblx0dmFyIHByb21pc2UgPSB0aGlzO1xuXG5cdGlmIChUeXBlKHByb21pc2UpICE9PSAnT2JqZWN0Jykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ3JlY2VpdmVyIGlzIG5vdCBhbiBPYmplY3QnKTtcblx0fVxuXG5cdHZhciBDID0gU3BlY2llc0NvbnN0cnVjdG9yKHByb21pc2UsIE9yaWdpbmFsUHJvbWlzZSk7IC8vIG1heSB0aHJvd1xuXG5cdHZhciB0aGVuRmluYWxseSA9IG9uRmluYWxseTtcblx0dmFyIGNhdGNoRmluYWxseSA9IG9uRmluYWxseTtcblx0aWYgKElzQ2FsbGFibGUob25GaW5hbGx5KSkge1xuXHRcdHRoZW5GaW5hbGx5ID0gY3JlYXRlVGhlbkZpbmFsbHkoQywgb25GaW5hbGx5KTtcblx0XHRjYXRjaEZpbmFsbHkgPSBjcmVhdGVDYXRjaEZpbmFsbHkoQywgb25GaW5hbGx5KTtcblx0fVxuXG5cdHJldHVybiBwcm9taXNlLnRoZW4odGhlbkZpbmFsbHksIGNhdGNoRmluYWxseSk7XG59O1xuXG5pZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcikge1xuXHR2YXIgZGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocHJvbWlzZUZpbmFsbHksICduYW1lJyk7XG5cdGlmIChkZXNjcmlwdG9yICYmIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHByb21pc2VGaW5hbGx5LCAnbmFtZScsIHsgY29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogJ2ZpbmFsbHknIH0pO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcHJvbWlzZUZpbmFsbHk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjYWxsQmluZCA9IHJlcXVpcmUoJ2NhbGwtYmluZCcpO1xudmFyIGRlZmluZSA9IHJlcXVpcmUoJ2RlZmluZS1wcm9wZXJ0aWVzJyk7XG5cbnZhciBpbXBsZW1lbnRhdGlvbiA9IHJlcXVpcmUoJy4vaW1wbGVtZW50YXRpb24nKTtcbnZhciBnZXRQb2x5ZmlsbCA9IHJlcXVpcmUoJy4vcG9seWZpbGwnKTtcbnZhciBzaGltID0gcmVxdWlyZSgnLi9zaGltJyk7XG5cbnZhciBib3VuZCA9IGNhbGxCaW5kKGdldFBvbHlmaWxsKCkpO1xuXG5kZWZpbmUoYm91bmQsIHtcblx0Z2V0UG9seWZpbGw6IGdldFBvbHlmaWxsLFxuXHRpbXBsZW1lbnRhdGlvbjogaW1wbGVtZW50YXRpb24sXG5cdHNoaW06IHNoaW1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJvdW5kO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmVxdWlyZVByb21pc2UgPSByZXF1aXJlKCcuL3JlcXVpcmVQcm9taXNlJyk7XG5cbnZhciBpbXBsZW1lbnRhdGlvbiA9IHJlcXVpcmUoJy4vaW1wbGVtZW50YXRpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRQb2x5ZmlsbCgpIHtcblx0cmVxdWlyZVByb21pc2UoKTtcblx0cmV0dXJuIHR5cGVvZiBQcm9taXNlLnByb3RvdHlwZVsnZmluYWxseSddID09PSAnZnVuY3Rpb24nID8gUHJvbWlzZS5wcm90b3R5cGVbJ2ZpbmFsbHknXSA6IGltcGxlbWVudGF0aW9uO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZXF1aXJlUHJvbWlzZSgpIHtcblx0aWYgKHR5cGVvZiBQcm9taXNlICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignYFByb21pc2UucHJvdG90eXBlLmZpbmFsbHlgIHJlcXVpcmVzIGEgZ2xvYmFsIGBQcm9taXNlYCBiZSBhdmFpbGFibGUuJyk7XG5cdH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciByZXF1aXJlUHJvbWlzZSA9IHJlcXVpcmUoJy4vcmVxdWlyZVByb21pc2UnKTtcblxudmFyIGdldFBvbHlmaWxsID0gcmVxdWlyZSgnLi9wb2x5ZmlsbCcpO1xudmFyIGRlZmluZSA9IHJlcXVpcmUoJ2RlZmluZS1wcm9wZXJ0aWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2hpbVByb21pc2VGaW5hbGx5KCkge1xuXHRyZXF1aXJlUHJvbWlzZSgpO1xuXG5cdHZhciBwb2x5ZmlsbCA9IGdldFBvbHlmaWxsKCk7XG5cdGRlZmluZShQcm9taXNlLnByb3RvdHlwZSwgeyAnZmluYWxseSc6IHBvbHlmaWxsIH0sIHtcblx0XHQnZmluYWxseSc6IGZ1bmN0aW9uIHRlc3RGaW5hbGx5KCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucHJvdG90eXBlWydmaW5hbGx5J10gIT09IHBvbHlmaWxsO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBwb2x5ZmlsbDtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuUHJvbWlzZWRNYXAgPSB2b2lkIDA7XG52YXIgUHJvbWlzZWRNYXAgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUHJvbWlzZWRNYXAoKSB7XG4gICAgICAgIHRoaXMubWFwID0gbmV3IE1hcCgpO1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUHJvbWlzZWRNYXAucHJvdG90eXBlLCBcInNpemVcIiwge1xuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyBtYXAgc2l6ZS5cbiAgICAgICAgICovXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFwLnNpemU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICAvKipcbiAgICAgKiBTZXRzIGtleS9kYXRhIHBhaXIgYW5kIGNyZWF0ZXMgcmVsYXRlZCBwcm9taXNlLlxuICAgICAqIElmIGtleSBhbHJlYWR5IGV4aXN0cyBpbiBtYXAgLSBpdCB3aWxsIGJlIHJlcGxhY2VkIHdpdGggbmV3IGRhdGEgYW5kIG5ldyBwcm9taXNlLlxuICAgICAqL1xuICAgIFByb21pc2VkTWFwLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoa2V5LCBkYXRhKSB7XG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5jcmVhdGVNYXBJdGVtKGRhdGEpO1xuICAgICAgICB0aGlzLm1hcC5zZXQoa2V5LCBpdGVtKTtcbiAgICAgICAgcmV0dXJuIGl0ZW0ucHJvbWlzZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgZGF0YSBmb3Iga2V5LlxuICAgICAqL1xuICAgIFByb21pc2VkTWFwLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5tYXAuZ2V0KGtleSk7XG4gICAgICAgIHJldHVybiBpdGVtICYmIGl0ZW0uZGF0YTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBrZXkgZXhpc3RzLlxuICAgICAqL1xuICAgIFByb21pc2VkTWFwLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcC5oYXMoa2V5KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIERlbGV0ZXMga2V5IGZyb20gbWFwLlxuICAgICAqIENhdXRpb246IHByZXZpb3VzbHkgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIG5vIGJlIHJlc29sdmVkIG9yIHJlamVjdGVkLlxuICAgICAqL1xuICAgIFByb21pc2VkTWFwLnByb3RvdHlwZS5kZWxldGUgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcC5kZWxldGUoa2V5KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJlc29sdmVzIHByb21pc2UgaW4gbWFwIGJ5IGtleSBhbmQgcmVtb3ZlcyBrZXkgZnJvbSBtYXAuXG4gICAgICogSWYgbm8gc3VjaCBrZXkgaW4gbWFwIC0gbm90aGluZyBoYXBwZW5zLlxuICAgICAqL1xuICAgIFByb21pc2VkTWFwLnByb3RvdHlwZS5yZXNvbHZlID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLm1hcC5nZXQoa2V5KTtcbiAgICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICBpdGVtLnJlc29sdmUodmFsdWUpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZWplY3RzIHByb21pc2UgaW4gbWFwIGJ5IGtleSBhbmQgcmVtb3ZlcyBrZXkgZnJvbSBtYXAuXG4gICAgICogSWYgbm8gc3VjaCBrZXkgaW4gbWFwIC0gbm90aGluZyBoYXBwZW5zLlxuICAgICAqL1xuICAgIFByb21pc2VkTWFwLnByb3RvdHlwZS5yZWplY3QgPSBmdW5jdGlvbiAoa2V5LCByZWFzb24pIHtcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLm1hcC5nZXQoa2V5KTtcbiAgICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICBpdGVtLnJlamVjdChyZWFzb24pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXNvbHZlcyBhbGwgcHJvbWlzZSBpbiBtYXAgYW5kIHJlbW92ZXMgYWxsIGtleXMuXG4gICAgICovXG4gICAgUHJvbWlzZWRNYXAucHJvdG90eXBlLnJlc29sdmVBbGwgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5tYXAuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkgeyByZXR1cm4gaXRlbS5yZXNvbHZlKHZhbHVlKTsgfSk7XG4gICAgICAgIHRoaXMubWFwLmNsZWFyKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZWplY3RzIGFsbCBwcm9taXNlIGluIG1hcCBhbmQgcmVtb3ZlcyBhbGwga2V5cy5cbiAgICAgKi9cbiAgICBQcm9taXNlZE1hcC5wcm90b3R5cGUucmVqZWN0QWxsID0gZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICB0aGlzLm1hcC5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7IHJldHVybiBpdGVtLnJlamVjdChyZWFzb24pOyB9KTtcbiAgICAgICAgdGhpcy5tYXAuY2xlYXIoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEl0ZXJhdGUgbWFwLlxuICAgICAqL1xuICAgIFByb21pc2VkTWFwLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHRoaXMubWFwLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGtleSwgbWFwKSB7IHJldHVybiBmbihpdGVtLmRhdGEsIGtleSwgbWFwKTsgfSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDbGVhcnMgbWFwLlxuICAgICAqL1xuICAgIFByb21pc2VkTWFwLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwLmNsZWFyKCk7XG4gICAgfTtcbiAgICBQcm9taXNlZE1hcC5wcm90b3R5cGUuY3JlYXRlTWFwSXRlbSA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHZhciBpdGVtID0geyBkYXRhOiBkYXRhIH07XG4gICAgICAgIGl0ZW0ucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGl0ZW0ucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAgICAgICBpdGVtLnJlamVjdCA9IHJlamVjdDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgIH07XG4gICAgcmV0dXJuIFByb21pc2VkTWFwO1xufSgpKTtcbmV4cG9ydHMuUHJvbWlzZWRNYXAgPSBQcm9taXNlZE1hcDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcblxuLyohICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2VcclxudGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGVcclxuTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcclxuXHJcblRISVMgQ09ERSBJUyBQUk9WSURFRCBPTiBBTiAqQVMgSVMqIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTllcclxuS0lORCwgRUlUSEVSIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIFdJVEhPVVQgTElNSVRBVElPTiBBTlkgSU1QTElFRFxyXG5XQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgVElUTEUsIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLFxyXG5NRVJDSEFOVEFCTElUWSBPUiBOT04tSU5GUklOR0VNRU5ULlxyXG5cclxuU2VlIHRoZSBBcGFjaGUgVmVyc2lvbiAyLjAgTGljZW5zZSBmb3Igc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zXHJcbmFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuLyogZ2xvYmFsIFJlZmxlY3QsIFByb21pc2UgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBfX3NwcmVhZCgpIHtcclxuICAgIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIGFyID0gYXIuY29uY2F0KF9fcmVhZChhcmd1bWVudHNbaV0pKTtcclxuICAgIHJldHVybiBhcjtcclxufVxuXG52YXIgRXZlbnQgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBFdmVudCh0eXBlLCB0YXJnZXQpIHtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIEV2ZW50O1xyXG59KCkpO1xyXG52YXIgRXJyb3JFdmVudCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhFcnJvckV2ZW50LCBfc3VwZXIpO1xyXG4gICAgZnVuY3Rpb24gRXJyb3JFdmVudChlcnJvciwgdGFyZ2V0KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgJ2Vycm9yJywgdGFyZ2V0KSB8fCB0aGlzO1xyXG4gICAgICAgIF90aGlzLm1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgICAgIF90aGlzLmVycm9yID0gZXJyb3I7XHJcbiAgICAgICAgcmV0dXJuIF90aGlzO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIEVycm9yRXZlbnQ7XHJcbn0oRXZlbnQpKTtcclxudmFyIENsb3NlRXZlbnQgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XHJcbiAgICBfX2V4dGVuZHMoQ2xvc2VFdmVudCwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIENsb3NlRXZlbnQoY29kZSwgcmVhc29uLCB0YXJnZXQpIHtcclxuICAgICAgICBpZiAoY29kZSA9PT0gdm9pZCAwKSB7IGNvZGUgPSAxMDAwOyB9XHJcbiAgICAgICAgaWYgKHJlYXNvbiA9PT0gdm9pZCAwKSB7IHJlYXNvbiA9ICcnOyB9XHJcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgJ2Nsb3NlJywgdGFyZ2V0KSB8fCB0aGlzO1xyXG4gICAgICAgIF90aGlzLndhc0NsZWFuID0gdHJ1ZTtcclxuICAgICAgICBfdGhpcy5jb2RlID0gY29kZTtcclxuICAgICAgICBfdGhpcy5yZWFzb24gPSByZWFzb247XHJcbiAgICAgICAgcmV0dXJuIF90aGlzO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIENsb3NlRXZlbnQ7XHJcbn0oRXZlbnQpKTtcblxuLyohXHJcbiAqIFJlY29ubmVjdGluZyBXZWJTb2NrZXRcclxuICogYnkgUGVkcm8gTGFkYXJpYSA8cGVkcm8ubGFkYXJpYUBnbWFpbC5jb20+XHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9wbGFkYXJpYS9yZWNvbm5lY3Rpbmctd2Vic29ja2V0XHJcbiAqIExpY2Vuc2UgTUlUXHJcbiAqL1xyXG52YXIgZ2V0R2xvYmFsV2ViU29ja2V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHR5cGVvZiBXZWJTb2NrZXQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIHJldHVybiBXZWJTb2NrZXQ7XHJcbiAgICB9XHJcbn07XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRydWUgaWYgZ2l2ZW4gYXJndW1lbnQgbG9va3MgbGlrZSBhIFdlYlNvY2tldCBjbGFzc1xyXG4gKi9cclxudmFyIGlzV2ViU29ja2V0ID0gZnVuY3Rpb24gKHcpIHsgcmV0dXJuIHR5cGVvZiB3ICE9PSAndW5kZWZpbmVkJyAmJiAhIXcgJiYgdy5DTE9TSU5HID09PSAyOyB9O1xyXG52YXIgREVGQVVMVCA9IHtcclxuICAgIG1heFJlY29ubmVjdGlvbkRlbGF5OiAxMDAwMCxcclxuICAgIG1pblJlY29ubmVjdGlvbkRlbGF5OiAxMDAwICsgTWF0aC5yYW5kb20oKSAqIDQwMDAsXHJcbiAgICBtaW5VcHRpbWU6IDUwMDAsXHJcbiAgICByZWNvbm5lY3Rpb25EZWxheUdyb3dGYWN0b3I6IDEuMyxcclxuICAgIGNvbm5lY3Rpb25UaW1lb3V0OiA0MDAwLFxyXG4gICAgbWF4UmV0cmllczogSW5maW5pdHksXHJcbiAgICBtYXhFbnF1ZXVlZE1lc3NhZ2VzOiBJbmZpbml0eSxcclxuICAgIHN0YXJ0Q2xvc2VkOiBmYWxzZSxcclxuICAgIGRlYnVnOiBmYWxzZSxcclxufTtcclxudmFyIFJlY29ubmVjdGluZ1dlYlNvY2tldCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFJlY29ubmVjdGluZ1dlYlNvY2tldCh1cmwsIHByb3RvY29scywgb3B0aW9ucykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0ge307IH1cclxuICAgICAgICB0aGlzLl9saXN0ZW5lcnMgPSB7XHJcbiAgICAgICAgICAgIGVycm9yOiBbXSxcclxuICAgICAgICAgICAgbWVzc2FnZTogW10sXHJcbiAgICAgICAgICAgIG9wZW46IFtdLFxyXG4gICAgICAgICAgICBjbG9zZTogW10sXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLl9yZXRyeUNvdW50ID0gLTE7XHJcbiAgICAgICAgdGhpcy5fc2hvdWxkUmVjb25uZWN0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9jb25uZWN0TG9jayA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2JpbmFyeVR5cGUgPSAnYmxvYic7XHJcbiAgICAgICAgdGhpcy5fY2xvc2VDYWxsZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9tZXNzYWdlUXVldWUgPSBbXTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBbiBldmVudCBsaXN0ZW5lciB0byBiZSBjYWxsZWQgd2hlbiB0aGUgV2ViU29ja2V0IGNvbm5lY3Rpb24ncyByZWFkeVN0YXRlIGNoYW5nZXMgdG8gQ0xPU0VEXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5vbmNsb3NlID0gbnVsbDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBbiBldmVudCBsaXN0ZW5lciB0byBiZSBjYWxsZWQgd2hlbiBhbiBlcnJvciBvY2N1cnNcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLm9uZXJyb3IgPSBudWxsO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFuIGV2ZW50IGxpc3RlbmVyIHRvIGJlIGNhbGxlZCB3aGVuIGEgbWVzc2FnZSBpcyByZWNlaXZlZCBmcm9tIHRoZSBzZXJ2ZXJcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLm9ubWVzc2FnZSA9IG51bGw7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQW4gZXZlbnQgbGlzdGVuZXIgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIFdlYlNvY2tldCBjb25uZWN0aW9uJ3MgcmVhZHlTdGF0ZSBjaGFuZ2VzIHRvIE9QRU47XHJcbiAgICAgICAgICogdGhpcyBpbmRpY2F0ZXMgdGhhdCB0aGUgY29ubmVjdGlvbiBpcyByZWFkeSB0byBzZW5kIGFuZCByZWNlaXZlIGRhdGFcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLm9ub3BlbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlT3BlbiA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICBfdGhpcy5fZGVidWcoJ29wZW4gZXZlbnQnKTtcclxuICAgICAgICAgICAgdmFyIF9hID0gX3RoaXMuX29wdGlvbnMubWluVXB0aW1lLCBtaW5VcHRpbWUgPSBfYSA9PT0gdm9pZCAwID8gREVGQVVMVC5taW5VcHRpbWUgOiBfYTtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KF90aGlzLl9jb25uZWN0VGltZW91dCk7XHJcbiAgICAgICAgICAgIF90aGlzLl91cHRpbWVUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHJldHVybiBfdGhpcy5fYWNjZXB0T3BlbigpOyB9LCBtaW5VcHRpbWUpO1xyXG4gICAgICAgICAgICBfdGhpcy5fd3MuYmluYXJ5VHlwZSA9IF90aGlzLl9iaW5hcnlUeXBlO1xyXG4gICAgICAgICAgICAvLyBzZW5kIGVucXVldWVkIG1lc3NhZ2VzIChtZXNzYWdlcyBzZW50IGJlZm9yZSB3ZWJzb2NrZXQgb3BlbiBldmVudClcclxuICAgICAgICAgICAgX3RoaXMuX21lc3NhZ2VRdWV1ZS5mb3JFYWNoKGZ1bmN0aW9uIChtZXNzYWdlKSB7IHJldHVybiBfdGhpcy5fd3Muc2VuZChtZXNzYWdlKTsgfSk7XHJcbiAgICAgICAgICAgIF90aGlzLl9tZXNzYWdlUXVldWUgPSBbXTtcclxuICAgICAgICAgICAgaWYgKF90aGlzLm9ub3Blbikge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMub25vcGVuKGV2ZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBfdGhpcy5fbGlzdGVuZXJzLm9wZW4uZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHsgcmV0dXJuIF90aGlzLl9jYWxsRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIpOyB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZU1lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgX3RoaXMuX2RlYnVnKCdtZXNzYWdlIGV2ZW50Jyk7XHJcbiAgICAgICAgICAgIGlmIChfdGhpcy5vbm1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLm9ubWVzc2FnZShldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgX3RoaXMuX2xpc3RlbmVycy5tZXNzYWdlLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7IHJldHVybiBfdGhpcy5fY2FsbEV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKTsgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVFcnJvciA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICBfdGhpcy5fZGVidWcoJ2Vycm9yIGV2ZW50JywgZXZlbnQubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIF90aGlzLl9kaXNjb25uZWN0KHVuZGVmaW5lZCwgZXZlbnQubWVzc2FnZSA9PT0gJ1RJTUVPVVQnID8gJ3RpbWVvdXQnIDogdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgaWYgKF90aGlzLm9uZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLm9uZXJyb3IoZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF90aGlzLl9kZWJ1ZygnZXhlYyBlcnJvciBsaXN0ZW5lcnMnKTtcclxuICAgICAgICAgICAgX3RoaXMuX2xpc3RlbmVycy5lcnJvci5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0ZW5lcikgeyByZXR1cm4gX3RoaXMuX2NhbGxFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcik7IH0pO1xyXG4gICAgICAgICAgICBfdGhpcy5fY29ubmVjdCgpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5faGFuZGxlQ2xvc2UgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgX3RoaXMuX2RlYnVnKCdjbG9zZSBldmVudCcpO1xyXG4gICAgICAgICAgICBfdGhpcy5fY2xlYXJUaW1lb3V0cygpO1xyXG4gICAgICAgICAgICBpZiAoX3RoaXMuX3Nob3VsZFJlY29ubmVjdCkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuX2Nvbm5lY3QoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoX3RoaXMub25jbG9zZSkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMub25jbG9zZShldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgX3RoaXMuX2xpc3RlbmVycy5jbG9zZS5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0ZW5lcikgeyByZXR1cm4gX3RoaXMuX2NhbGxFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcik7IH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5fdXJsID0gdXJsO1xyXG4gICAgICAgIHRoaXMuX3Byb3RvY29scyA9IHByb3RvY29scztcclxuICAgICAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICBpZiAodGhpcy5fb3B0aW9ucy5zdGFydENsb3NlZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9zaG91bGRSZWNvbm5lY3QgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY29ubmVjdCgpO1xyXG4gICAgfVxyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlY29ubmVjdGluZ1dlYlNvY2tldCwgXCJDT05ORUNUSU5HXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVjb25uZWN0aW5nV2ViU29ja2V0LCBcIk9QRU5cIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZWNvbm5lY3RpbmdXZWJTb2NrZXQsIFwiQ0xPU0lOR1wiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAyO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlY29ubmVjdGluZ1dlYlNvY2tldCwgXCJDTE9TRURcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gMztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZWNvbm5lY3RpbmdXZWJTb2NrZXQucHJvdG90eXBlLCBcIkNPTk5FQ1RJTkdcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gUmVjb25uZWN0aW5nV2ViU29ja2V0LkNPTk5FQ1RJTkc7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVjb25uZWN0aW5nV2ViU29ja2V0LnByb3RvdHlwZSwgXCJPUEVOXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJlY29ubmVjdGluZ1dlYlNvY2tldC5PUEVOO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlY29ubmVjdGluZ1dlYlNvY2tldC5wcm90b3R5cGUsIFwiQ0xPU0lOR1wiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWNvbm5lY3RpbmdXZWJTb2NrZXQuQ0xPU0lORztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZWNvbm5lY3RpbmdXZWJTb2NrZXQucHJvdG90eXBlLCBcIkNMT1NFRFwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWNvbm5lY3RpbmdXZWJTb2NrZXQuQ0xPU0VEO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlY29ubmVjdGluZ1dlYlNvY2tldC5wcm90b3R5cGUsIFwiYmluYXJ5VHlwZVwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93cyA/IHRoaXMuX3dzLmJpbmFyeVR5cGUgOiB0aGlzLl9iaW5hcnlUeXBlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fYmluYXJ5VHlwZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fd3MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3dzLmJpbmFyeVR5cGUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlY29ubmVjdGluZ1dlYlNvY2tldC5wcm90b3R5cGUsIFwicmV0cnlDb3VudFwiLCB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9yIGNvbm5lY3Rpb24gcmV0cmllc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5tYXgodGhpcy5fcmV0cnlDb3VudCwgMCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVjb25uZWN0aW5nV2ViU29ja2V0LnByb3RvdHlwZSwgXCJidWZmZXJlZEFtb3VudFwiLCB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIG51bWJlciBvZiBieXRlcyBvZiBkYXRhIHRoYXQgaGF2ZSBiZWVuIHF1ZXVlZCB1c2luZyBjYWxscyB0byBzZW5kKCkgYnV0IG5vdCB5ZXRcclxuICAgICAgICAgKiB0cmFuc21pdHRlZCB0byB0aGUgbmV0d29yay4gVGhpcyB2YWx1ZSByZXNldHMgdG8gemVybyBvbmNlIGFsbCBxdWV1ZWQgZGF0YSBoYXMgYmVlbiBzZW50LlxyXG4gICAgICAgICAqIFRoaXMgdmFsdWUgZG9lcyBub3QgcmVzZXQgdG8gemVybyB3aGVuIHRoZSBjb25uZWN0aW9uIGlzIGNsb3NlZDsgaWYgeW91IGtlZXAgY2FsbGluZyBzZW5kKCksXHJcbiAgICAgICAgICogdGhpcyB3aWxsIGNvbnRpbnVlIHRvIGNsaW1iLiBSZWFkIG9ubHlcclxuICAgICAgICAgKi9cclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGJ5dGVzID0gdGhpcy5fbWVzc2FnZVF1ZXVlLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWNjICs9IG1lc3NhZ2UubGVuZ3RoOyAvLyBub3QgYnl0ZSBzaXplXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXNzYWdlIGluc3RhbmNlb2YgQmxvYikge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjYyArPSBtZXNzYWdlLnNpemU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBhY2MgKz0gbWVzc2FnZS5ieXRlTGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjYztcclxuICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgICAgIHJldHVybiBieXRlcyArICh0aGlzLl93cyA/IHRoaXMuX3dzLmJ1ZmZlcmVkQW1vdW50IDogMCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVjb25uZWN0aW5nV2ViU29ja2V0LnByb3RvdHlwZSwgXCJleHRlbnNpb25zXCIsIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgZXh0ZW5zaW9ucyBzZWxlY3RlZCBieSB0aGUgc2VydmVyLiBUaGlzIGlzIGN1cnJlbnRseSBvbmx5IHRoZSBlbXB0eSBzdHJpbmcgb3IgYSBsaXN0IG9mXHJcbiAgICAgICAgICogZXh0ZW5zaW9ucyBhcyBuZWdvdGlhdGVkIGJ5IHRoZSBjb25uZWN0aW9uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93cyA/IHRoaXMuX3dzLmV4dGVuc2lvbnMgOiAnJztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZWNvbm5lY3RpbmdXZWJTb2NrZXQucHJvdG90eXBlLCBcInByb3RvY29sXCIsIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBIHN0cmluZyBpbmRpY2F0aW5nIHRoZSBuYW1lIG9mIHRoZSBzdWItcHJvdG9jb2wgdGhlIHNlcnZlciBzZWxlY3RlZDtcclxuICAgICAgICAgKiB0aGlzIHdpbGwgYmUgb25lIG9mIHRoZSBzdHJpbmdzIHNwZWNpZmllZCBpbiB0aGUgcHJvdG9jb2xzIHBhcmFtZXRlciB3aGVuIGNyZWF0aW5nIHRoZVxyXG4gICAgICAgICAqIFdlYlNvY2tldCBvYmplY3RcclxuICAgICAgICAgKi9cclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dzID8gdGhpcy5fd3MucHJvdG9jb2wgOiAnJztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZWNvbm5lY3RpbmdXZWJTb2NrZXQucHJvdG90eXBlLCBcInJlYWR5U3RhdGVcIiwge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBjb25uZWN0aW9uOyB0aGlzIGlzIG9uZSBvZiB0aGUgUmVhZHkgc3RhdGUgY29uc3RhbnRzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl93cykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dzLnJlYWR5U3RhdGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnMuc3RhcnRDbG9zZWRcclxuICAgICAgICAgICAgICAgID8gUmVjb25uZWN0aW5nV2ViU29ja2V0LkNMT1NFRFxyXG4gICAgICAgICAgICAgICAgOiBSZWNvbm5lY3RpbmdXZWJTb2NrZXQuQ09OTkVDVElORztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZWNvbm5lY3RpbmdXZWJTb2NrZXQucHJvdG90eXBlLCBcInVybFwiLCB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIFVSTCBhcyByZXNvbHZlZCBieSB0aGUgY29uc3RydWN0b3JcclxuICAgICAgICAgKi9cclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dzID8gdGhpcy5fd3MudXJsIDogJyc7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICAvKipcclxuICAgICAqIENsb3NlcyB0aGUgV2ViU29ja2V0IGNvbm5lY3Rpb24gb3IgY29ubmVjdGlvbiBhdHRlbXB0LCBpZiBhbnkuIElmIHRoZSBjb25uZWN0aW9uIGlzIGFscmVhZHlcclxuICAgICAqIENMT1NFRCwgdGhpcyBtZXRob2QgZG9lcyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFJlY29ubmVjdGluZ1dlYlNvY2tldC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoY29kZSwgcmVhc29uKSB7XHJcbiAgICAgICAgaWYgKGNvZGUgPT09IHZvaWQgMCkgeyBjb2RlID0gMTAwMDsgfVxyXG4gICAgICAgIHRoaXMuX2Nsb3NlQ2FsbGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9zaG91bGRSZWNvbm5lY3QgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9jbGVhclRpbWVvdXRzKCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl93cykge1xyXG4gICAgICAgICAgICB0aGlzLl9kZWJ1ZygnY2xvc2UgZW5xdWV1ZWQ6IG5vIHdzIGluc3RhbmNlJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX3dzLnJlYWR5U3RhdGUgPT09IHRoaXMuQ0xPU0VEKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdjbG9zZTogYWxyZWFkeSBjbG9zZWQnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl93cy5jbG9zZShjb2RlLCByZWFzb24pO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ2xvc2VzIHRoZSBXZWJTb2NrZXQgY29ubmVjdGlvbiBvciBjb25uZWN0aW9uIGF0dGVtcHQgYW5kIGNvbm5lY3RzIGFnYWluLlxyXG4gICAgICogUmVzZXRzIHJldHJ5IGNvdW50ZXI7XHJcbiAgICAgKi9cclxuICAgIFJlY29ubmVjdGluZ1dlYlNvY2tldC5wcm90b3R5cGUucmVjb25uZWN0ID0gZnVuY3Rpb24gKGNvZGUsIHJlYXNvbikge1xyXG4gICAgICAgIHRoaXMuX3Nob3VsZFJlY29ubmVjdCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fY2xvc2VDYWxsZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9yZXRyeUNvdW50ID0gLTE7XHJcbiAgICAgICAgaWYgKCF0aGlzLl93cyB8fCB0aGlzLl93cy5yZWFkeVN0YXRlID09PSB0aGlzLkNMT1NFRCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9kaXNjb25uZWN0KGNvZGUsIHJlYXNvbik7XHJcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3QoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBFbnF1ZXVlIHNwZWNpZmllZCBkYXRhIHRvIGJlIHRyYW5zbWl0dGVkIHRvIHRoZSBzZXJ2ZXIgb3ZlciB0aGUgV2ViU29ja2V0IGNvbm5lY3Rpb25cclxuICAgICAqL1xyXG4gICAgUmVjb25uZWN0aW5nV2ViU29ja2V0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICBpZiAodGhpcy5fd3MgJiYgdGhpcy5fd3MucmVhZHlTdGF0ZSA9PT0gdGhpcy5PUEVOKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdzZW5kJywgZGF0YSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3dzLnNlbmQoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgX2EgPSB0aGlzLl9vcHRpb25zLm1heEVucXVldWVkTWVzc2FnZXMsIG1heEVucXVldWVkTWVzc2FnZXMgPSBfYSA9PT0gdm9pZCAwID8gREVGQVVMVC5tYXhFbnF1ZXVlZE1lc3NhZ2VzIDogX2E7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9tZXNzYWdlUXVldWUubGVuZ3RoIDwgbWF4RW5xdWV1ZWRNZXNzYWdlcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZGVidWcoJ2VucXVldWUnLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VRdWV1ZS5wdXNoKGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmVnaXN0ZXIgYW4gZXZlbnQgaGFuZGxlciBvZiBhIHNwZWNpZmljIGV2ZW50IHR5cGVcclxuICAgICAqL1xyXG4gICAgUmVjb25uZWN0aW5nV2ViU29ja2V0LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKHR5cGUsIGxpc3RlbmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2xpc3RlbmVyc1t0eXBlXSkge1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgUmVjb25uZWN0aW5nV2ViU29ja2V0LnByb3RvdHlwZS5kaXNwYXRjaEV2ZW50ID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgdmFyIGVfMSwgX2E7XHJcbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVyc1tldmVudC50eXBlXTtcclxuICAgICAgICBpZiAobGlzdGVuZXJzKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBsaXN0ZW5lcnNfMSA9IF9fdmFsdWVzKGxpc3RlbmVycyksIGxpc3RlbmVyc18xXzEgPSBsaXN0ZW5lcnNfMS5uZXh0KCk7ICFsaXN0ZW5lcnNfMV8xLmRvbmU7IGxpc3RlbmVyc18xXzEgPSBsaXN0ZW5lcnNfMS5uZXh0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNfMV8xLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhbGxFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cclxuICAgICAgICAgICAgZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsaXN0ZW5lcnNfMV8xICYmICFsaXN0ZW5lcnNfMV8xLmRvbmUgJiYgKF9hID0gbGlzdGVuZXJzXzEucmV0dXJuKSkgX2EuY2FsbChsaXN0ZW5lcnNfMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGFuIGV2ZW50IGxpc3RlbmVyXHJcbiAgICAgKi9cclxuICAgIFJlY29ubmVjdGluZ1dlYlNvY2tldC5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lcikge1xyXG4gICAgICAgIGlmICh0aGlzLl9saXN0ZW5lcnNbdHlwZV0pIHtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV0gPSB0aGlzLl9saXN0ZW5lcnNbdHlwZV0uZmlsdGVyKGZ1bmN0aW9uIChsKSB7IHJldHVybiBsICE9PSBsaXN0ZW5lcjsgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFJlY29ubmVjdGluZ1dlYlNvY2tldC5wcm90b3R5cGUuX2RlYnVnID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBhcmdzID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgYXJnc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fb3B0aW9ucy5kZWJ1Zykge1xyXG4gICAgICAgICAgICAvLyBub3QgdXNpbmcgc3ByZWFkIGJlY2F1c2UgY29tcGlsZWQgdmVyc2lvbiB1c2VzIFN5bWJvbHNcclxuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIF9fc3ByZWFkKFsnUldTPiddLCBhcmdzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFJlY29ubmVjdGluZ1dlYlNvY2tldC5wcm90b3R5cGUuX2dldE5leHREZWxheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX2EgPSB0aGlzLl9vcHRpb25zLCBfYiA9IF9hLnJlY29ubmVjdGlvbkRlbGF5R3Jvd0ZhY3RvciwgcmVjb25uZWN0aW9uRGVsYXlHcm93RmFjdG9yID0gX2IgPT09IHZvaWQgMCA/IERFRkFVTFQucmVjb25uZWN0aW9uRGVsYXlHcm93RmFjdG9yIDogX2IsIF9jID0gX2EubWluUmVjb25uZWN0aW9uRGVsYXksIG1pblJlY29ubmVjdGlvbkRlbGF5ID0gX2MgPT09IHZvaWQgMCA/IERFRkFVTFQubWluUmVjb25uZWN0aW9uRGVsYXkgOiBfYywgX2QgPSBfYS5tYXhSZWNvbm5lY3Rpb25EZWxheSwgbWF4UmVjb25uZWN0aW9uRGVsYXkgPSBfZCA9PT0gdm9pZCAwID8gREVGQVVMVC5tYXhSZWNvbm5lY3Rpb25EZWxheSA6IF9kO1xyXG4gICAgICAgIHZhciBkZWxheSA9IDA7XHJcbiAgICAgICAgaWYgKHRoaXMuX3JldHJ5Q291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgIGRlbGF5ID1cclxuICAgICAgICAgICAgICAgIG1pblJlY29ubmVjdGlvbkRlbGF5ICogTWF0aC5wb3cocmVjb25uZWN0aW9uRGVsYXlHcm93RmFjdG9yLCB0aGlzLl9yZXRyeUNvdW50IC0gMSk7XHJcbiAgICAgICAgICAgIGlmIChkZWxheSA+IG1heFJlY29ubmVjdGlvbkRlbGF5KSB7XHJcbiAgICAgICAgICAgICAgICBkZWxheSA9IG1heFJlY29ubmVjdGlvbkRlbGF5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2RlYnVnKCduZXh0IGRlbGF5JywgZGVsYXkpO1xyXG4gICAgICAgIHJldHVybiBkZWxheTtcclxuICAgIH07XHJcbiAgICBSZWNvbm5lY3RpbmdXZWJTb2NrZXQucHJvdG90eXBlLl93YWl0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgX3RoaXMuX2dldE5leHREZWxheSgpKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBSZWNvbm5lY3RpbmdXZWJTb2NrZXQucHJvdG90eXBlLl9nZXROZXh0VXJsID0gZnVuY3Rpb24gKHVybFByb3ZpZGVyKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB1cmxQcm92aWRlciA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh1cmxQcm92aWRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgdXJsUHJvdmlkZXIgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdmFyIHVybCA9IHVybFByb3ZpZGVyKCk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdXJsID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh1cmwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghIXVybC50aGVuKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdXJsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IEVycm9yKCdJbnZhbGlkIFVSTCcpO1xyXG4gICAgfTtcclxuICAgIFJlY29ubmVjdGluZ1dlYlNvY2tldC5wcm90b3R5cGUuX2Nvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICBpZiAodGhpcy5fY29ubmVjdExvY2sgfHwgIXRoaXMuX3Nob3VsZFJlY29ubmVjdCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2Nvbm5lY3RMb2NrID0gdHJ1ZTtcclxuICAgICAgICB2YXIgX2EgPSB0aGlzLl9vcHRpb25zLCBfYiA9IF9hLm1heFJldHJpZXMsIG1heFJldHJpZXMgPSBfYiA9PT0gdm9pZCAwID8gREVGQVVMVC5tYXhSZXRyaWVzIDogX2IsIF9jID0gX2EuY29ubmVjdGlvblRpbWVvdXQsIGNvbm5lY3Rpb25UaW1lb3V0ID0gX2MgPT09IHZvaWQgMCA/IERFRkFVTFQuY29ubmVjdGlvblRpbWVvdXQgOiBfYywgX2QgPSBfYS5XZWJTb2NrZXQsIFdlYlNvY2tldCA9IF9kID09PSB2b2lkIDAgPyBnZXRHbG9iYWxXZWJTb2NrZXQoKSA6IF9kO1xyXG4gICAgICAgIGlmICh0aGlzLl9yZXRyeUNvdW50ID49IG1heFJldHJpZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGVidWcoJ21heCByZXRyaWVzIHJlYWNoZWQnLCB0aGlzLl9yZXRyeUNvdW50LCAnPj0nLCBtYXhSZXRyaWVzKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yZXRyeUNvdW50Kys7XHJcbiAgICAgICAgdGhpcy5fZGVidWcoJ2Nvbm5lY3QnLCB0aGlzLl9yZXRyeUNvdW50KTtcclxuICAgICAgICB0aGlzLl9yZW1vdmVMaXN0ZW5lcnMoKTtcclxuICAgICAgICBpZiAoIWlzV2ViU29ja2V0KFdlYlNvY2tldCkpIHtcclxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ05vIHZhbGlkIFdlYlNvY2tldCBjbGFzcyBwcm92aWRlZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl93YWl0KClcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkgeyByZXR1cm4gX3RoaXMuX2dldE5leHRVcmwoX3RoaXMuX3VybCk7IH0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh1cmwpIHtcclxuICAgICAgICAgICAgLy8gY2xvc2UgY291bGQgYmUgY2FsbGVkIGJlZm9yZSBjcmVhdGluZyB0aGUgd3NcclxuICAgICAgICAgICAgaWYgKF90aGlzLl9jbG9zZUNhbGxlZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF90aGlzLl9kZWJ1ZygnY29ubmVjdCcsIHsgdXJsOiB1cmwsIHByb3RvY29sczogX3RoaXMuX3Byb3RvY29scyB9KTtcclxuICAgICAgICAgICAgX3RoaXMuX3dzID0gX3RoaXMuX3Byb3RvY29sc1xyXG4gICAgICAgICAgICAgICAgPyBuZXcgV2ViU29ja2V0KHVybCwgX3RoaXMuX3Byb3RvY29scylcclxuICAgICAgICAgICAgICAgIDogbmV3IFdlYlNvY2tldCh1cmwpO1xyXG4gICAgICAgICAgICBfdGhpcy5fd3MuYmluYXJ5VHlwZSA9IF90aGlzLl9iaW5hcnlUeXBlO1xyXG4gICAgICAgICAgICBfdGhpcy5fY29ubmVjdExvY2sgPSBmYWxzZTtcclxuICAgICAgICAgICAgX3RoaXMuX2FkZExpc3RlbmVycygpO1xyXG4gICAgICAgICAgICBfdGhpcy5fY29ubmVjdFRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgcmV0dXJuIF90aGlzLl9oYW5kbGVUaW1lb3V0KCk7IH0sIGNvbm5lY3Rpb25UaW1lb3V0KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBSZWNvbm5lY3RpbmdXZWJTb2NrZXQucHJvdG90eXBlLl9oYW5kbGVUaW1lb3V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX2RlYnVnKCd0aW1lb3V0IGV2ZW50Jyk7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlRXJyb3IobmV3IEVycm9yRXZlbnQoRXJyb3IoJ1RJTUVPVVQnKSwgdGhpcykpO1xyXG4gICAgfTtcclxuICAgIFJlY29ubmVjdGluZ1dlYlNvY2tldC5wcm90b3R5cGUuX2Rpc2Nvbm5lY3QgPSBmdW5jdGlvbiAoY29kZSwgcmVhc29uKSB7XHJcbiAgICAgICAgaWYgKGNvZGUgPT09IHZvaWQgMCkgeyBjb2RlID0gMTAwMDsgfVxyXG4gICAgICAgIHRoaXMuX2NsZWFyVGltZW91dHMoKTtcclxuICAgICAgICBpZiAoIXRoaXMuX3dzKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlTGlzdGVuZXJzKCk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGhpcy5fd3MuY2xvc2UoY29kZSwgcmVhc29uKTtcclxuICAgICAgICAgICAgdGhpcy5faGFuZGxlQ2xvc2UobmV3IENsb3NlRXZlbnQoY29kZSwgcmVhc29uLCB0aGlzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAvLyBpZ25vcmVcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgUmVjb25uZWN0aW5nV2ViU29ja2V0LnByb3RvdHlwZS5fYWNjZXB0T3BlbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl9kZWJ1ZygnYWNjZXB0IG9wZW4nKTtcclxuICAgICAgICB0aGlzLl9yZXRyeUNvdW50ID0gMDtcclxuICAgIH07XHJcbiAgICBSZWNvbm5lY3RpbmdXZWJTb2NrZXQucHJvdG90eXBlLl9jYWxsRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudCwgbGlzdGVuZXIpIHtcclxuICAgICAgICBpZiAoJ2hhbmRsZUV2ZW50JyBpbiBsaXN0ZW5lcikge1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIGxpc3RlbmVyLmhhbmRsZUV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgbGlzdGVuZXIoZXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBSZWNvbm5lY3RpbmdXZWJTb2NrZXQucHJvdG90eXBlLl9yZW1vdmVMaXN0ZW5lcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl93cykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2RlYnVnKCdyZW1vdmVMaXN0ZW5lcnMnKTtcclxuICAgICAgICB0aGlzLl93cy5yZW1vdmVFdmVudExpc3RlbmVyKCdvcGVuJywgdGhpcy5faGFuZGxlT3Blbik7XHJcbiAgICAgICAgdGhpcy5fd3MucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xvc2UnLCB0aGlzLl9oYW5kbGVDbG9zZSk7XHJcbiAgICAgICAgdGhpcy5fd3MucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuX2hhbmRsZU1lc3NhZ2UpO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICB0aGlzLl93cy5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuX2hhbmRsZUVycm9yKTtcclxuICAgIH07XHJcbiAgICBSZWNvbm5lY3RpbmdXZWJTb2NrZXQucHJvdG90eXBlLl9hZGRMaXN0ZW5lcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl93cykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2RlYnVnKCdhZGRMaXN0ZW5lcnMnKTtcclxuICAgICAgICB0aGlzLl93cy5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgdGhpcy5faGFuZGxlT3Blbik7XHJcbiAgICAgICAgdGhpcy5fd3MuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCB0aGlzLl9oYW5kbGVDbG9zZSk7XHJcbiAgICAgICAgdGhpcy5fd3MuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuX2hhbmRsZU1lc3NhZ2UpO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICB0aGlzLl93cy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuX2hhbmRsZUVycm9yKTtcclxuICAgIH07XHJcbiAgICBSZWNvbm5lY3RpbmdXZWJTb2NrZXQucHJvdG90eXBlLl9jbGVhclRpbWVvdXRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9jb25uZWN0VGltZW91dCk7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3VwdGltZVRpbWVvdXQpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBSZWNvbm5lY3RpbmdXZWJTb2NrZXQ7XHJcbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVjb25uZWN0aW5nV2ViU29ja2V0O1xuIiwiLyoqXG4gKiBXZWJTb2NrZXQgd2l0aCBwcm9taXNlIGFwaVxuICovXG5cbi8qKlxuICogQGV4dGVybmFsIENoYW5uZWxcbiAqL1xuXG5jb25zdCBDaGFubmVsID0gcmVxdWlyZSgnY2hubCcpO1xuLy8gdG9kbzogbWF5YmUgcmVtb3ZlIFByb21pc2VDb250cm9sbGVyIGFuZCBqdXN0IHVzZSBwcm9taXNlZC1tYXAgd2l0aCAyIGl0ZW1zP1xuY29uc3QgUHJvbWlzZUNvbnRyb2xsZXIgPSByZXF1aXJlKCdwcm9taXNlLWNvbnRyb2xsZXInKTtcbmNvbnN0IHsgUHJvbWlzZWRNYXAgfSA9IHJlcXVpcmUoJ3Byb21pc2VkLW1hcCcpO1xuLy8gdG9kbzogbWF5YmUgcmVtb3ZlIFJlcXVlc3RzIGFuZCBqdXN0IHVzZSBwcm9taXNlZC1tYXA/XG5jb25zdCBSZXF1ZXN0cyA9IHJlcXVpcmUoJy4vcmVxdWVzdHMnKTtcbmNvbnN0IGRlZmF1bHRPcHRpb25zID0gcmVxdWlyZSgnLi9vcHRpb25zJyk7XG5jb25zdCB7dGhyb3dJZiwgaXNQcm9taXNlfSA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxuLy8gc2VlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2ViU29ja2V0I1JlYWR5X3N0YXRlX2NvbnN0YW50c1xuY29uc3QgU1RBVEUgPSB7XG4gIENPTk5FQ1RJTkc6IDAsXG4gIE9QRU46IDEsXG4gIENMT1NJTkc6IDIsXG4gIENMT1NFRDogMyxcbn07XG5cbi8qKlxuICogQHR5cGljYWxuYW1lIHdzcFxuICovXG5jbGFzcyBXZWJTb2NrZXRBc1Byb21pc2VkIHtcbiAgLyoqXG4gICAqIENvbnN0cnVjdG9yLiBVbmxpa2Ugb3JpZ2luYWwgV2ViU29ja2V0IGl0IGRvZXMgbm90IGltbWVkaWF0ZWx5IG9wZW4gY29ubmVjdGlvbi5cbiAgICogUGxlYXNlIGNhbGwgYG9wZW4oKWAgbWV0aG9kIHRvIGNvbm5lY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgV2ViU29ja2V0IFVSTFxuICAgKiBAcGFyYW0ge09wdGlvbnN9IFtvcHRpb25zXVxuICAgKi9cbiAgY29uc3RydWN0b3IodXJsLCBvcHRpb25zKSB7XG4gICAgdGhpcy5fYXNzZXJ0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB0aGlzLl91cmwgPSB1cmw7XG4gICAgdGhpcy5fb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcbiAgICB0aGlzLl9yZXF1ZXN0cyA9IG5ldyBSZXF1ZXN0cygpO1xuICAgIHRoaXMuX3Byb21pc2VkTWFwID0gbmV3IFByb21pc2VkTWFwKCk7XG4gICAgdGhpcy5fd3MgPSBudWxsO1xuICAgIHRoaXMuX3dzU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9jcmVhdGVPcGVuaW5nQ29udHJvbGxlcigpO1xuICAgIHRoaXMuX2NyZWF0ZUNsb3NpbmdDb250cm9sbGVyKCk7XG4gICAgdGhpcy5fY3JlYXRlQ2hhbm5lbHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIG9yaWdpbmFsIFdlYlNvY2tldCBpbnN0YW5jZSBjcmVhdGVkIGJ5IGBvcHRpb25zLmNyZWF0ZVdlYlNvY2tldGAuXG4gICAqXG4gICAqIEByZXR1cm5zIHtXZWJTb2NrZXR9XG4gICAqL1xuICBnZXQgd3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgV2ViU29ja2V0IHVybC5cbiAgICpcbiAgICogQHJldHVybnMge1N0cmluZ31cbiAgICovXG4gIGdldCB1cmwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3VybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBJcyBXZWJTb2NrZXQgY29ubmVjdGlvbiBpbiBvcGVuaW5nIHN0YXRlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICovXG4gIGdldCBpc09wZW5pbmcoKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy5fd3MgJiYgdGhpcy5fd3MucmVhZHlTdGF0ZSA9PT0gU1RBVEUuQ09OTkVDVElORyk7XG4gIH1cblxuICAvKipcbiAgICogSXMgV2ViU29ja2V0IGNvbm5lY3Rpb24gb3BlbmVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICovXG4gIGdldCBpc09wZW5lZCgpIHtcbiAgICByZXR1cm4gQm9vbGVhbih0aGlzLl93cyAmJiB0aGlzLl93cy5yZWFkeVN0YXRlID09PSBTVEFURS5PUEVOKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJcyBXZWJTb2NrZXQgY29ubmVjdGlvbiBpbiBjbG9zaW5nIHN0YXRlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICovXG4gIGdldCBpc0Nsb3NpbmcoKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy5fd3MgJiYgdGhpcy5fd3MucmVhZHlTdGF0ZSA9PT0gU1RBVEUuQ0xPU0lORyk7XG4gIH1cblxuICAvKipcbiAgICogSXMgV2ViU29ja2V0IGNvbm5lY3Rpb24gY2xvc2VkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICovXG4gIGdldCBpc0Nsb3NlZCgpIHtcbiAgICByZXR1cm4gQm9vbGVhbighdGhpcy5fd3MgfHwgdGhpcy5fd3MucmVhZHlTdGF0ZSA9PT0gU1RBVEUuQ0xPU0VEKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmVudCBjaGFubmVsIHRyaWdnZXJlZCB3aGVuIGNvbm5lY3Rpb24gaXMgb3BlbmVkLlxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vdml0YWxldHMuZ2l0aHViLmlvL2NobmwvI2NoYW5uZWxcbiAgICogQGV4YW1wbGVcbiAgICogd3NwLm9uT3Blbi5hZGRMaXN0ZW5lcigoKSA9PiBjb25zb2xlLmxvZygnQ29ubmVjdGlvbiBvcGVuZWQnKSk7XG4gICAqXG4gICAqIEByZXR1cm5zIHtDaGFubmVsfVxuICAgKi9cbiAgZ2V0IG9uT3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5fb25PcGVuO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2ZW50IGNoYW5uZWwgdHJpZ2dlcmVkIGV2ZXJ5IHRpbWUgd2hlbiBtZXNzYWdlIGlzIHNlbnQgdG8gc2VydmVyLlxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vdml0YWxldHMuZ2l0aHViLmlvL2NobmwvI2NoYW5uZWxcbiAgICogQGV4YW1wbGVcbiAgICogd3NwLm9uU2VuZC5hZGRMaXN0ZW5lcihkYXRhID0+IGNvbnNvbGUubG9nKCdNZXNzYWdlIHNlbnQnLCBkYXRhKSk7XG4gICAqXG4gICAqIEByZXR1cm5zIHtDaGFubmVsfVxuICAgKi9cbiAgZ2V0IG9uU2VuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fb25TZW5kO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2ZW50IGNoYW5uZWwgdHJpZ2dlcmVkIGV2ZXJ5IHRpbWUgd2hlbiBtZXNzYWdlIHJlY2VpdmVkIGZyb20gc2VydmVyLlxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vdml0YWxldHMuZ2l0aHViLmlvL2NobmwvI2NoYW5uZWxcbiAgICogQGV4YW1wbGVcbiAgICogd3NwLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihtZXNzYWdlID0+IGNvbnNvbGUubG9nKG1lc3NhZ2UpKTtcbiAgICpcbiAgICogQHJldHVybnMge0NoYW5uZWx9XG4gICAqL1xuICBnZXQgb25NZXNzYWdlKCkge1xuICAgIHJldHVybiB0aGlzLl9vbk1lc3NhZ2U7XG4gIH1cblxuICAvKipcbiAgICogRXZlbnQgY2hhbm5lbCB0cmlnZ2VyZWQgZXZlcnkgdGltZSB3aGVuIHJlY2VpdmVkIG1lc3NhZ2UgaXMgc3VjY2Vzc2Z1bGx5IHVucGFja2VkLlxuICAgKiBGb3IgZXhhbXBsZSwgaWYgeW91IGFyZSB1c2luZyBKU09OIHRyYW5zcG9ydCwgdGhlIGxpc3RlbmVyIHdpbGwgcmVjZWl2ZSBhbHJlYWR5IEpTT04gcGFyc2VkIGRhdGEuXG4gICAqXG4gICAqIEBzZWUgaHR0cHM6Ly92aXRhbGV0cy5naXRodWIuaW8vY2hubC8jY2hhbm5lbFxuICAgKiBAZXhhbXBsZVxuICAgKiB3c3Aub25VbnBhY2tlZE1lc3NhZ2UuYWRkTGlzdGVuZXIoZGF0YSA9PiBjb25zb2xlLmxvZyhkYXRhLmZvbykpO1xuICAgKlxuICAgKiBAcmV0dXJucyB7Q2hhbm5lbH1cbiAgICovXG4gIGdldCBvblVucGFja2VkTWVzc2FnZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fb25VbnBhY2tlZE1lc3NhZ2U7XG4gIH1cblxuICAvKipcbiAgICogRXZlbnQgY2hhbm5lbCB0cmlnZ2VyZWQgZXZlcnkgdGltZSB3aGVuIHJlc3BvbnNlIHRvIHNvbWUgcmVxdWVzdCBjb21lcy5cbiAgICogUmVjZWl2ZWQgbWVzc2FnZSBjb25zaWRlcmVkIGEgcmVzcG9uc2UgaWYgcmVxdWVzdElkIGlzIGZvdW5kIGluIGl0LlxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vdml0YWxldHMuZ2l0aHViLmlvL2NobmwvI2NoYW5uZWxcbiAgICogQGV4YW1wbGVcbiAgICogd3NwLm9uUmVzcG9uc2UuYWRkTGlzdGVuZXIoZGF0YSA9PiBjb25zb2xlLmxvZyhkYXRhKSk7XG4gICAqXG4gICAqIEByZXR1cm5zIHtDaGFubmVsfVxuICAgKi9cbiAgZ2V0IG9uUmVzcG9uc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX29uUmVzcG9uc2U7XG4gIH1cblxuICAvKipcbiAgICogRXZlbnQgY2hhbm5lbCB0cmlnZ2VyZWQgd2hlbiBjb25uZWN0aW9uIGNsb3NlZC5cbiAgICogTGlzdGVuZXIgYWNjZXB0cyBzaW5nbGUgYXJndW1lbnQgYHtjb2RlLCByZWFzb259YC5cbiAgICpcbiAgICogQHNlZSBodHRwczovL3ZpdGFsZXRzLmdpdGh1Yi5pby9jaG5sLyNjaGFubmVsXG4gICAqIEBleGFtcGxlXG4gICAqIHdzcC5vbkNsb3NlLmFkZExpc3RlbmVyKGV2ZW50ID0+IGNvbnNvbGUubG9nKGBDb25uZWN0aW9ucyBjbG9zZWQ6ICR7ZXZlbnQucmVhc29ufWApKTtcbiAgICpcbiAgICogQHJldHVybnMge0NoYW5uZWx9XG4gICAqL1xuICBnZXQgb25DbG9zZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fb25DbG9zZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmVudCBjaGFubmVsIHRyaWdnZXJlZCB3aGVuIGJ5IFdlYnNvY2tldCAnZXJyb3InIGV2ZW50LlxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vdml0YWxldHMuZ2l0aHViLmlvL2NobmwvI2NoYW5uZWxcbiAgICogQGV4YW1wbGVcbiAgICogd3NwLm9uRXJyb3IuYWRkTGlzdGVuZXIoZXZlbnQgPT4gY29uc29sZS5lcnJvcihldmVudCkpO1xuICAgKlxuICAgKiBAcmV0dXJucyB7Q2hhbm5lbH1cbiAgICovXG4gIGdldCBvbkVycm9yKCkge1xuICAgIHJldHVybiB0aGlzLl9vbkVycm9yO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIFdlYlNvY2tldCBjb25uZWN0aW9uLiBJZiBjb25uZWN0aW9uIGFscmVhZHkgb3BlbmVkLCBwcm9taXNlIHdpbGwgYmUgcmVzb2x2ZWQgd2l0aCBcIm9wZW4gZXZlbnRcIi5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2U8RXZlbnQ+fVxuICAgKi9cbiAgb3BlbigpIHtcbiAgICBpZiAodGhpcy5pc0Nsb3NpbmcpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoYENhbid0IG9wZW4gV2ViU29ja2V0IHdoaWxlIGNsb3NpbmcuYCkpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc09wZW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuX29wZW5pbmcucHJvbWlzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX29wZW5pbmcuY2FsbCgoKSA9PiB7XG4gICAgICB0aGlzLl9vcGVuaW5nLnByb21pc2UuY2F0Y2goZSA9PiB0aGlzLl9jbGVhbnVwKGUpKTtcbiAgICAgIHRoaXMuX2NyZWF0ZVdTKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgcmVxdWVzdCBhbmQgd2FpdHMgZm9yIHJlc3BvbnNlLlxuICAgKlxuICAgKiBAcGFyYW0geyp9IGRhdGFcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IFtvcHRpb25zLnJlcXVlc3RJZD08YXV0by1nZW5lcmF0ZWQ+XVxuICAgKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMudGltZW91dD0wXVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICovXG4gIHNlbmRSZXF1ZXN0KGRhdGEsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHJlcXVlc3RJZCA9IG9wdGlvbnMucmVxdWVzdElkIHx8IGAke01hdGgucmFuZG9tKCl9YDtcbiAgICBjb25zdCB0aW1lb3V0ID0gb3B0aW9ucy50aW1lb3V0ICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLnRpbWVvdXQgOiB0aGlzLl9vcHRpb25zLnRpbWVvdXQ7XG4gICAgcmV0dXJuIHRoaXMuX3JlcXVlc3RzLmNyZWF0ZShyZXF1ZXN0SWQsICgpID0+IHtcbiAgICAgIHRoaXMuX2Fzc2VydFJlcXVlc3RJZEhhbmRsZXJzKCk7XG4gICAgICBjb25zdCBmaW5hbERhdGEgPSB0aGlzLl9vcHRpb25zLmF0dGFjaFJlcXVlc3RJZChkYXRhLCByZXF1ZXN0SWQpO1xuICAgICAgdGhpcy5zZW5kUGFja2VkKGZpbmFsRGF0YSk7XG4gICAgfSwgdGltZW91dCk7XG4gIH1cblxuICAvKipcbiAgICogUGFja3MgZGF0YSB3aXRoIGBvcHRpb25zLnBhY2tNZXNzYWdlYCBhbmQgc2VuZHMgdG8gdGhlIHNlcnZlci5cbiAgICpcbiAgICogQHBhcmFtIHsqfSBkYXRhXG4gICAqL1xuICBzZW5kUGFja2VkKGRhdGEpIHtcbiAgICB0aGlzLl9hc3NlcnRQYWNraW5nSGFuZGxlcnMoKTtcbiAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5fb3B0aW9ucy5wYWNrTWVzc2FnZShkYXRhKTtcbiAgICB0aGlzLnNlbmQobWVzc2FnZSk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZHMgZGF0YSB3aXRob3V0IHBhY2tpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfEJsb2J8QXJyYXlCdWZmZXJ9IGRhdGFcbiAgICovXG4gIHNlbmQoZGF0YSkge1xuICAgIHRocm93SWYoIXRoaXMuaXNPcGVuZWQsIGBDYW4ndCBzZW5kIGRhdGEgYmVjYXVzZSBXZWJTb2NrZXQgaXMgbm90IG9wZW5lZC5gKTtcbiAgICB0aGlzLl93cy5zZW5kKGRhdGEpO1xuICAgIHRoaXMuX29uU2VuZC5kaXNwYXRjaEFzeW5jKGRhdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdhaXRzIGZvciBwYXJ0aWN1bGFyIG1lc3NhZ2UgdG8gY29tZS5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gcHJlZGljYXRlIGZ1bmN0aW9uIHRvIGNoZWNrIGluY29taW5nIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnRpbWVvdXQ9MF1cbiAgICogQHBhcmFtIHtFcnJvcn0gW29wdGlvbnMudGltZW91dEVycm9yXVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB3c3Aud2FpdFVucGFja2VkTWVzc2FnZShkYXRhID0+IGRhdGEgJiYgZGF0YS5mb28gPT09ICdiYXInKTtcbiAgICovXG4gIHdhaXRVbnBhY2tlZE1lc3NhZ2UocHJlZGljYXRlLCBvcHRpb25zID0ge30pIHtcbiAgICB0aHJvd0lmKHR5cGVvZiBwcmVkaWNhdGUgIT09ICdmdW5jdGlvbicsIGBQcmVkaWNhdGUgbXVzdCBiZSBhIGZ1bmN0aW9uLCBnb3QgJHt0eXBlb2YgcHJlZGljYXRlfWApO1xuICAgIGlmIChvcHRpb25zLnRpbWVvdXQpIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fcHJvbWlzZWRNYXAuaGFzKHByZWRpY2F0ZSkpIHtcbiAgICAgICAgICBjb25zdCBlcnJvciA9IG9wdGlvbnMudGltZW91dEVycm9yIHx8IG5ldyBFcnJvcignVGltZW91dCcpO1xuICAgICAgICAgIHRoaXMuX3Byb21pc2VkTWFwLnJlamVjdChwcmVkaWNhdGUsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSwgb3B0aW9ucy50aW1lb3V0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3Byb21pc2VkTWFwLnNldChwcmVkaWNhdGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlcyBXZWJTb2NrZXQgY29ubmVjdGlvbi4gSWYgY29ubmVjdGlvbiBhbHJlYWR5IGNsb3NlZCwgcHJvbWlzZSB3aWxsIGJlIHJlc29sdmVkIHdpdGggXCJjbG9zZSBldmVudFwiLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcj19IFtjb2RlPTEwMDBdIEEgbnVtZXJpYyB2YWx1ZSBpbmRpY2F0aW5nIHRoZSBzdGF0dXMgY29kZS5cbiAgICogQHBhcmFtIHtzdHJpbmc9fSBbcmVhc29uXSBBIGh1bWFuLXJlYWRhYmxlIHJlYXNvbiBmb3IgY2xvc2luZyBjb25uZWN0aW9uLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxFdmVudD59XG4gICAqL1xuICBjbG9zZShjb2RlLCByZWFzb24pIHsgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dlYlNvY2tldC9jbG9zZVxuICAgIHJldHVybiB0aGlzLmlzQ2xvc2VkXG4gICAgICA/IFByb21pc2UucmVzb2x2ZSh0aGlzLl9jbG9zaW5nLnZhbHVlKVxuICAgICAgOiB0aGlzLl9jbG9zaW5nLmNhbGwoKCkgPT4gdGhpcy5fd3MuY2xvc2UoY29kZSwgcmVhc29uKSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbGwgbGlzdGVuZXJzIGZyb20gV1NQIGluc3RhbmNlLiBVc2VmdWwgZm9yIGNsZWFudXAuXG4gICAqL1xuICByZW1vdmVBbGxMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5fb25PcGVuLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgIHRoaXMuX29uTWVzc2FnZS5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLl9vblVucGFja2VkTWVzc2FnZS5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLl9vblJlc3BvbnNlLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgIHRoaXMuX29uU2VuZC5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLl9vbkNsb3NlLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgIHRoaXMuX29uRXJyb3IucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gIH1cblxuICBfY3JlYXRlT3BlbmluZ0NvbnRyb2xsZXIoKSB7XG4gICAgY29uc3QgY29ubmVjdGlvblRpbWVvdXQgPSB0aGlzLl9vcHRpb25zLmNvbm5lY3Rpb25UaW1lb3V0IHx8IHRoaXMuX29wdGlvbnMudGltZW91dDtcbiAgICB0aGlzLl9vcGVuaW5nID0gbmV3IFByb21pc2VDb250cm9sbGVyKHtcbiAgICAgIHRpbWVvdXQ6IGNvbm5lY3Rpb25UaW1lb3V0LFxuICAgICAgdGltZW91dFJlYXNvbjogYENhbid0IG9wZW4gV2ViU29ja2V0IHdpdGhpbiBhbGxvd2VkIHRpbWVvdXQ6ICR7Y29ubmVjdGlvblRpbWVvdXR9IG1zLmBcbiAgICB9KTtcbiAgfVxuXG4gIF9jcmVhdGVDbG9zaW5nQ29udHJvbGxlcigpIHtcbiAgICBjb25zdCBjbG9zaW5nVGltZW91dCA9IHRoaXMuX29wdGlvbnMudGltZW91dDtcbiAgICB0aGlzLl9jbG9zaW5nID0gbmV3IFByb21pc2VDb250cm9sbGVyKHtcbiAgICAgIHRpbWVvdXQ6IGNsb3NpbmdUaW1lb3V0LFxuICAgICAgdGltZW91dFJlYXNvbjogYENhbid0IGNsb3NlIFdlYlNvY2tldCB3aXRoaW4gYWxsb3dlZCB0aW1lb3V0OiAke2Nsb3NpbmdUaW1lb3V0fSBtcy5gXG4gICAgfSk7XG4gIH1cblxuICBfY3JlYXRlQ2hhbm5lbHMoKSB7XG4gICAgdGhpcy5fb25PcGVuID0gbmV3IENoYW5uZWwoKTtcbiAgICB0aGlzLl9vbk1lc3NhZ2UgPSBuZXcgQ2hhbm5lbCgpO1xuICAgIHRoaXMuX29uVW5wYWNrZWRNZXNzYWdlID0gbmV3IENoYW5uZWwoKTtcbiAgICB0aGlzLl9vblJlc3BvbnNlID0gbmV3IENoYW5uZWwoKTtcbiAgICB0aGlzLl9vblNlbmQgPSBuZXcgQ2hhbm5lbCgpO1xuICAgIHRoaXMuX29uQ2xvc2UgPSBuZXcgQ2hhbm5lbCgpO1xuICAgIHRoaXMuX29uRXJyb3IgPSBuZXcgQ2hhbm5lbCgpO1xuICB9XG5cbiAgX2NyZWF0ZVdTKCkge1xuICAgIHRoaXMuX3dzID0gdGhpcy5fb3B0aW9ucy5jcmVhdGVXZWJTb2NrZXQodGhpcy5fdXJsKTtcbiAgICB0aGlzLl93c1N1YnNjcmlwdGlvbiA9IG5ldyBDaGFubmVsLlN1YnNjcmlwdGlvbihbXG4gICAgICB7IGNoYW5uZWw6IHRoaXMuX3dzLCBldmVudDogJ29wZW4nLCBsaXN0ZW5lcjogZSA9PiB0aGlzLl9oYW5kbGVPcGVuKGUpIH0sXG4gICAgICB7IGNoYW5uZWw6IHRoaXMuX3dzLCBldmVudDogJ21lc3NhZ2UnLCBsaXN0ZW5lcjogZSA9PiB0aGlzLl9oYW5kbGVNZXNzYWdlKGUpIH0sXG4gICAgICB7IGNoYW5uZWw6IHRoaXMuX3dzLCBldmVudDogJ2Vycm9yJywgbGlzdGVuZXI6IGUgPT4gdGhpcy5faGFuZGxlRXJyb3IoZSkgfSxcbiAgICAgIHsgY2hhbm5lbDogdGhpcy5fd3MsIGV2ZW50OiAnY2xvc2UnLCBsaXN0ZW5lcjogZSA9PiB0aGlzLl9oYW5kbGVDbG9zZShlKSB9LFxuICAgIF0pLm9uKCk7XG4gIH1cblxuICBfaGFuZGxlT3BlbihldmVudCkge1xuICAgIHRoaXMuX29uT3Blbi5kaXNwYXRjaEFzeW5jKGV2ZW50KTtcbiAgICB0aGlzLl9vcGVuaW5nLnJlc29sdmUoZXZlbnQpO1xuICB9XG5cbiAgX2hhbmRsZU1lc3NhZ2UoZXZlbnQpIHtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5fb3B0aW9ucy5leHRyYWN0TWVzc2FnZURhdGEoZXZlbnQpO1xuICAgIHRoaXMuX29uTWVzc2FnZS5kaXNwYXRjaEFzeW5jKGRhdGEpO1xuICAgIHRoaXMuX3RyeVVucGFjayhkYXRhKTtcbiAgfVxuXG4gIF90cnlVbnBhY2soZGF0YSkge1xuICAgIGlmICh0aGlzLl9vcHRpb25zLnVucGFja01lc3NhZ2UpIHtcbiAgICAgIGRhdGEgPSB0aGlzLl9vcHRpb25zLnVucGFja01lc3NhZ2UoZGF0YSk7XG4gICAgICBpZiAoaXNQcm9taXNlKGRhdGEpKSB7XG4gICAgICAgIGRhdGEudGhlbihkYXRhID0+IHRoaXMuX2hhbmRsZVVucGFja2VkRGF0YShkYXRhKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9oYW5kbGVVbnBhY2tlZERhdGEoZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZVVucGFja2VkRGF0YShkYXRhKSB7XG4gICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gdG9kbzogbWF5YmUgdHJpZ2dlciBvblVucGFja2VkTWVzc2FnZSBhbHdheXM/XG4gICAgICB0aGlzLl9vblVucGFja2VkTWVzc2FnZS5kaXNwYXRjaEFzeW5jKGRhdGEpO1xuICAgICAgdGhpcy5fdHJ5SGFuZGxlUmVzcG9uc2UoZGF0YSk7XG4gICAgfVxuICAgIHRoaXMuX3RyeUhhbmRsZVdhaXRpbmdNZXNzYWdlKGRhdGEpO1xuICB9XG5cbiAgX3RyeUhhbmRsZVJlc3BvbnNlKGRhdGEpIHtcbiAgICBpZiAodGhpcy5fb3B0aW9ucy5leHRyYWN0UmVxdWVzdElkKSB7XG4gICAgICBjb25zdCByZXF1ZXN0SWQgPSB0aGlzLl9vcHRpb25zLmV4dHJhY3RSZXF1ZXN0SWQoZGF0YSk7XG4gICAgICBpZiAocmVxdWVzdElkKSB7XG4gICAgICAgIHRoaXMuX29uUmVzcG9uc2UuZGlzcGF0Y2hBc3luYyhkYXRhLCByZXF1ZXN0SWQpO1xuICAgICAgICB0aGlzLl9yZXF1ZXN0cy5yZXNvbHZlKHJlcXVlc3RJZCwgZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3RyeUhhbmRsZVdhaXRpbmdNZXNzYWdlKGRhdGEpIHtcbiAgICB0aGlzLl9wcm9taXNlZE1hcC5mb3JFYWNoKChfLCBwcmVkaWNhdGUpID0+IHtcbiAgICAgIGxldCBpc01hdGNoZWQgPSBmYWxzZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlzTWF0Y2hlZCA9IHByZWRpY2F0ZShkYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5fcHJvbWlzZWRNYXAucmVqZWN0KHByZWRpY2F0ZSwgZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChpc01hdGNoZWQpIHtcbiAgICAgICAgdGhpcy5fcHJvbWlzZWRNYXAucmVzb2x2ZShwcmVkaWNhdGUsIGRhdGEpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZUVycm9yKGV2ZW50KSB7XG4gICAgdGhpcy5fb25FcnJvci5kaXNwYXRjaEFzeW5jKGV2ZW50KTtcbiAgfVxuXG4gIF9oYW5kbGVDbG9zZShldmVudCkge1xuICAgIHRoaXMuX29uQ2xvc2UuZGlzcGF0Y2hBc3luYyhldmVudCk7XG4gICAgdGhpcy5fY2xvc2luZy5yZXNvbHZlKGV2ZW50KTtcbiAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihgV2ViU29ja2V0IGNsb3NlZCB3aXRoIHJlYXNvbjogJHtldmVudC5yZWFzb259ICgke2V2ZW50LmNvZGV9KS5gKTtcbiAgICBpZiAodGhpcy5fb3BlbmluZy5pc1BlbmRpbmcpIHtcbiAgICAgIHRoaXMuX29wZW5pbmcucmVqZWN0KGVycm9yKTtcbiAgICB9XG4gICAgdGhpcy5fY2xlYW51cChlcnJvcik7XG4gIH1cblxuICBfY2xlYW51cFdTKCkge1xuICAgIGlmICh0aGlzLl93c1N1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fd3NTdWJzY3JpcHRpb24ub2ZmKCk7XG4gICAgICB0aGlzLl93c1N1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX3dzID0gbnVsbDtcbiAgfVxuXG4gIF9jbGVhbnVwKGVycm9yKSB7XG4gICAgdGhpcy5fY2xlYW51cFdTKCk7XG4gICAgdGhpcy5fcmVxdWVzdHMucmVqZWN0QWxsKGVycm9yKTtcbiAgfVxuXG4gIF9hc3NlcnRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBPYmplY3Qua2V5cyhvcHRpb25zIHx8IHt9KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAoIWRlZmF1bHRPcHRpb25zLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIG9wdGlvbjogJHtrZXl9YCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfYXNzZXJ0UGFja2luZ0hhbmRsZXJzKCkge1xuICAgIGNvbnN0IHsgcGFja01lc3NhZ2UsIHVucGFja01lc3NhZ2UgfSA9IHRoaXMuX29wdGlvbnM7XG4gICAgdGhyb3dJZighcGFja01lc3NhZ2UgfHwgIXVucGFja01lc3NhZ2UsXG4gICAgICBgUGxlYXNlIGRlZmluZSAnb3B0aW9ucy5wYWNrTWVzc2FnZSAvIG9wdGlvbnMudW5wYWNrTWVzc2FnZScgZm9yIHNlbmRpbmcgcGFja2VkIG1lc3NhZ2VzLmBcbiAgICApO1xuICB9XG5cbiAgX2Fzc2VydFJlcXVlc3RJZEhhbmRsZXJzKCkge1xuICAgIGNvbnN0IHsgYXR0YWNoUmVxdWVzdElkLCBleHRyYWN0UmVxdWVzdElkIH0gPSB0aGlzLl9vcHRpb25zO1xuICAgIHRocm93SWYoIWF0dGFjaFJlcXVlc3RJZCB8fCAhZXh0cmFjdFJlcXVlc3RJZCxcbiAgICAgIGBQbGVhc2UgZGVmaW5lICdvcHRpb25zLmF0dGFjaFJlcXVlc3RJZCAvIG9wdGlvbnMuZXh0cmFjdFJlcXVlc3RJZCcgZm9yIHNlbmRpbmcgcmVxdWVzdHMuYFxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBXZWJTb2NrZXRBc1Byb21pc2VkO1xuIiwiLyoqXG4gKiBEZWZhdWx0IG9wdGlvbnMuXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBPcHRpb25zXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBbY3JlYXRlV2ViU29ja2V0PXVybCA9PiBuZXcgV2ViU29ja2V0KHVybCldIC0gY3VzdG9tIGZ1bmN0aW9uIGZvciBXZWJTb2NrZXQgY29uc3RydWN0aW9uLlxuICAqXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBbcGFja01lc3NhZ2U9bm9vcF0gLSBwYWNrcyBtZXNzYWdlIGZvciBzZW5kaW5nLiBGb3IgZXhhbXBsZSwgYGRhdGEgPT4gSlNPTi5zdHJpbmdpZnkoZGF0YSlgLlxuICpcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IFt1bnBhY2tNZXNzYWdlPW5vb3BdIC0gdW5wYWNrcyByZWNlaXZlZCBtZXNzYWdlLiBGb3IgZXhhbXBsZSwgYGRhdGEgPT4gSlNPTi5wYXJzZShkYXRhKWAuXG4gKlxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gW2F0dGFjaFJlcXVlc3RJZD1ub29wXSAtIGluamVjdHMgcmVxdWVzdCBpZCBpbnRvIGRhdGEuXG4gKiBGb3IgZXhhbXBsZSwgYChkYXRhLCByZXF1ZXN0SWQpID0+IE9iamVjdC5hc3NpZ24oe3JlcXVlc3RJZH0sIGRhdGEpYC5cbiAqXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBbZXh0cmFjdFJlcXVlc3RJZD1ub29wXSAtIGV4dHJhY3RzIHJlcXVlc3QgaWQgZnJvbSByZWNlaXZlZCBkYXRhLlxuICogRm9yIGV4YW1wbGUsIGBkYXRhID0+IGRhdGEucmVxdWVzdElkYC5cbiAqXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBbZXh0cmFjdE1lc3NhZ2VEYXRhPWV2ZW50ID0+IGV2ZW50LmRhdGFdIC0gZXh0cmFjdHMgZGF0YSBmcm9tIGV2ZW50IG9iamVjdC5cbiAqXG4gKiBAcHJvcGVydHkge051bWJlcn0gdGltZW91dD0wIC0gdGltZW91dCBmb3Igb3BlbmluZyBjb25uZWN0aW9uIGFuZCBzZW5kaW5nIG1lc3NhZ2VzLlxuICpcbiAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBjb25uZWN0aW9uVGltZW91dD0wIC0gc3BlY2lhbCB0aW1lb3V0IGZvciBvcGVuaW5nIGNvbm5lY3Rpb24sIGJ5IGRlZmF1bHQgZXF1YWxzIHRvIGB0aW1lb3V0YC5cbiAqXG4gKiBAZGVmYXVsdHNcbiAqIHBsZWFzZSBzZWUgW29wdGlvbnMuanNdKGh0dHBzOi8vZ2l0aHViLmNvbS92aXRhbGV0cy93ZWJzb2NrZXQtYXMtcHJvbWlzZWQvYmxvYi9tYXN0ZXIvc3JjL29wdGlvbnMuanMpXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8qKlxuICAgKiBTZWUge0BsaW5rIE9wdGlvbnMuY3JlYXRlV2ViU29ja2V0fVxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gICAqIEByZXR1cm5zIHtXZWJTb2NrZXR9XG4gICAqL1xuICBjcmVhdGVXZWJTb2NrZXQ6IHVybCA9PiBuZXcgV2ViU29ja2V0KHVybCksXG5cbiAgLyoqXG4gICAqIFNlZSB7QGxpbmsgT3B0aW9ucy5wYWNrTWVzc2FnZX1cbiAgICpcbiAgICogQHBhcmFtIHsqfSBkYXRhXG4gICAqIEByZXR1cm5zIHtTdHJpbmd8QXJyYXlCdWZmZXJ8QmxvYn1cbiAgICovXG4gIHBhY2tNZXNzYWdlOiBudWxsLFxuXG4gIC8qKlxuICAgKiBTZWUge0BsaW5rIE9wdGlvbnMudW5wYWNrTWVzc2FnZX1cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXlCdWZmZXJ8QmxvYn0gZGF0YVxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIHVucGFja01lc3NhZ2U6IG51bGwsXG5cbiAgLyoqXG4gICAqIFNlZSB7QGxpbmsgT3B0aW9ucy5hdHRhY2hSZXF1ZXN0SWR9XG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gZGF0YVxuICAgKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHJlcXVlc3RJZFxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIGF0dGFjaFJlcXVlc3RJZDogbnVsbCxcblxuICAvKipcbiAgICogU2VlIHtAbGluayBPcHRpb25zLmV4dHJhY3RSZXF1ZXN0SWR9XG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gZGF0YVxuICAgKiBAcmV0dXJucyB7U3RyaW5nfE51bWJlcnx1bmRlZmluZWR9XG4gICAqL1xuICBleHRyYWN0UmVxdWVzdElkOiBudWxsLFxuXG4gIC8qKlxuICAgKiBTZWUge0BsaW5rIE9wdGlvbnMuZXh0cmFjdE1lc3NhZ2VEYXRhfVxuICAgKlxuICAgKiBAcGFyYW0geyp9IGV2ZW50XG4gICAqIEByZXR1cm5zIHsqfVxuICAgKi9cbiAgZXh0cmFjdE1lc3NhZ2VEYXRhOiBldmVudCA9PiBldmVudC5kYXRhLFxuXG4gIC8qKlxuICAgKiBTZWUge0BsaW5rIE9wdGlvbnMudGltZW91dH1cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgLyoqXG4gICAqIFNlZSB7QGxpbmsgT3B0aW9ucy5jb25uZWN0aW9uVGltZW91dH1cbiAgICovXG4gIGNvbm5lY3Rpb25UaW1lb3V0OiAwLFxufTtcbiIsIi8qKlxuICogQ2xhc3MgZm9yIG1hbmFnZSBwZW5kaW5nIHJlcXVlc3RzLlxuICogQHByaXZhdGVcbiAqL1xuXG5jb25zdCBQcm9taXNlQ29udHJvbGxlciA9IHJlcXVpcmUoJ3Byb21pc2UtY29udHJvbGxlcicpO1xuY29uc3QgcHJvbWlzZUZpbmFsbHkgPSByZXF1aXJlKCdwcm9taXNlLnByb3RvdHlwZS5maW5hbGx5Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUmVxdWVzdHMge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9pdGVtcyA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIG5ldyByZXF1ZXN0IGFuZCBzdG9yZXMgaXQgaW4gdGhlIGxpc3QuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gcmVxdWVzdElkXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lb3V0XG4gICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgKi9cbiAgY3JlYXRlKHJlcXVlc3RJZCwgZm4sIHRpbWVvdXQpIHtcbiAgICB0aGlzLl9yZWplY3RFeGlzdGluZ1JlcXVlc3QocmVxdWVzdElkKTtcbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlTmV3UmVxdWVzdChyZXF1ZXN0SWQsIGZuLCB0aW1lb3V0KTtcbiAgfVxuXG4gIHJlc29sdmUocmVxdWVzdElkLCBkYXRhKSB7XG4gICAgaWYgKHJlcXVlc3RJZCAmJiB0aGlzLl9pdGVtcy5oYXMocmVxdWVzdElkKSkge1xuICAgICAgdGhpcy5faXRlbXMuZ2V0KHJlcXVlc3RJZCkucmVzb2x2ZShkYXRhKTtcbiAgICB9XG4gIH1cblxuICByZWplY3RBbGwoZXJyb3IpIHtcbiAgICB0aGlzLl9pdGVtcy5mb3JFYWNoKHJlcXVlc3QgPT4gcmVxdWVzdC5pc1BlbmRpbmcgPyByZXF1ZXN0LnJlamVjdChlcnJvcikgOiBudWxsKTtcbiAgfVxuXG4gIF9yZWplY3RFeGlzdGluZ1JlcXVlc3QocmVxdWVzdElkKSB7XG4gICAgY29uc3QgZXhpc3RpbmdSZXF1ZXN0ID0gdGhpcy5faXRlbXMuZ2V0KHJlcXVlc3RJZCk7XG4gICAgaWYgKGV4aXN0aW5nUmVxdWVzdCAmJiBleGlzdGluZ1JlcXVlc3QuaXNQZW5kaW5nKSB7XG4gICAgICBleGlzdGluZ1JlcXVlc3QucmVqZWN0KG5ldyBFcnJvcihgV2ViU29ja2V0IHJlcXVlc3QgaXMgcmVwbGFjZWQsIGlkOiAke3JlcXVlc3RJZH1gKSk7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZU5ld1JlcXVlc3QocmVxdWVzdElkLCBmbiwgdGltZW91dCkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBuZXcgUHJvbWlzZUNvbnRyb2xsZXIoe1xuICAgICAgdGltZW91dCxcbiAgICAgIHRpbWVvdXRSZWFzb246IGBXZWJTb2NrZXQgcmVxdWVzdCB3YXMgcmVqZWN0ZWQgYnkgdGltZW91dCAoJHt0aW1lb3V0fSBtcykuIFJlcXVlc3RJZDogJHtyZXF1ZXN0SWR9YFxuICAgIH0pO1xuICAgIHRoaXMuX2l0ZW1zLnNldChyZXF1ZXN0SWQsIHJlcXVlc3QpO1xuICAgIHJldHVybiBwcm9taXNlRmluYWxseShyZXF1ZXN0LmNhbGwoZm4pLCAoKSA9PiB0aGlzLl9kZWxldGVSZXF1ZXN0KHJlcXVlc3RJZCwgcmVxdWVzdCkpO1xuICB9XG5cbiAgX2RlbGV0ZVJlcXVlc3QocmVxdWVzdElkLCByZXF1ZXN0KSB7XG4gICAgLy8gdGhpcyBjaGVjayBpcyBpbXBvcnRhbnQgd2hlbiByZXF1ZXN0IHdhcyByZXBsYWNlZFxuICAgIGlmICh0aGlzLl9pdGVtcy5nZXQocmVxdWVzdElkKSA9PT0gcmVxdWVzdCkge1xuICAgICAgdGhpcy5faXRlbXMuZGVsZXRlKHJlcXVlc3RJZCk7XG4gICAgfVxuICB9XG59O1xuIiwiXG5leHBvcnRzLnRocm93SWYgPSAoY29uZGl0aW9uLCBtZXNzYWdlKSA9PiB7XG4gIGlmIChjb25kaXRpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIH1cbn07XG5cbmV4cG9ydHMuaXNQcm9taXNlID0gdmFsdWUgPT4ge1xuICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09ICdmdW5jdGlvbic7XG59O1xuIiwiaW1wb3J0IFdlYlNvY2tldEFzUHJvbWlzZWQgZnJvbSBcIndlYnNvY2tldC1hcy1wcm9taXNlZFwiO1xuaW1wb3J0IFJlY29ubmVjdGluZ1dlYlNvY2tldCBmcm9tIFwicmVjb25uZWN0aW5nLXdlYnNvY2tldFwiO1xuXG5jbGFzcyBUcmFjZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLndzcCA9IG51bGw7XG4gICAgdGhpcy5yd3MgPSBudWxsO1xuICB9XG5cbiAgY29ubmVjdCh3c1VybCkge1xuICAgIGlmICh0aGlzLndzcCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy53c3AgPSBuZXcgV2ViU29ja2V0QXNQcm9taXNlZCh3c1VybCwge1xuICAgICAgICBjcmVhdGVXZWJTb2NrZXQ6ICh1cmwpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5yd3MgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMucndzID0gbmV3IFJlY29ubmVjdGluZ1dlYlNvY2tldCh1cmwpO1xuICAgICAgICAgICAgLy90aGlzLnJ3cy5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCAoKSA9PiB3c3Aub3BlbigpKTtcbiAgICAgICAgICB9XG4gIFxuICAgICAgICAgIHJldHVybiB0aGlzLnJ3cztcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLndzcC5vcGVuKCk7XG4gIH1cblxuICBkaXNjb25uZWN0KCkge1xuICAgIGlmICh0aGlzLndzcCAhPT0gbnVsbCkgdGhpcy53c3AuY2xvc2UoKTtcbiAgfVxufVxuXG5jb25zdCB0cmFjZXIgPSBuZXcgVHJhY2VyKCk7XG5cbnZhciBxdWV1ZSA9IFtdO1xudmFyIHRpbWVvdXQgPSB1bmRlZmluZWQ7XG52YXIgU0VORF9USU1FT1VUID0gNTAwO1xudmFyIFBJTkdfRVZFUlkgPSAxNjAwMDsgLy8gMTYgc2VjXG5cbnZhciBMQVNUX1BJTkcgPSBEYXRlLm5vdygpO1xudmFyIENMT1NFX1RJTUVPVVQgPSAxMDA7IC8vY29uc29sZS5sb2coXCJVVUlEXCIsIGdlbmVyYXRlVVVJRCgpKTtcblxuZnVuY3Rpb24gZ2VuZXJhdGVVVUlEKCkge1xuICAvLyBQdWJsaWMgRG9tYWluL01JVFxuICB2YXIgZCA9IERhdGUubm93KCk7IC8vVGltZXN0YW1wXG5cbiAgdmFyIGQyID1cbiAgICAodHlwZW9mIHBlcmZvcm1hbmNlICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICBwZXJmb3JtYW5jZS5ub3cgJiZcbiAgICAgIHBlcmZvcm1hbmNlLm5vdygpICogMTAwMCkgfHxcbiAgICAwOyAvL1RpbWUgaW4gbWljcm9zZWNvbmRzIHNpbmNlIHBhZ2UtbG9hZCBvciAwIGlmIHVuc3VwcG9ydGVkXG5cbiAgcmV0dXJuIFwieHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4XCIucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbiAoYykge1xuICAgIHZhciByID0gTWF0aC5yYW5kb20oKSAqIDE2OyAvL3JhbmRvbSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxNlxuXG4gICAgaWYgKGQgPiAwKSB7XG4gICAgICAvL1VzZSB0aW1lc3RhbXAgdW50aWwgZGVwbGV0ZWRcbiAgICAgIHIgPSAoZCArIHIpICUgMTYgfCAwO1xuICAgICAgZCA9IE1hdGguZmxvb3IoZCAvIDE2KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy9Vc2UgbWljcm9zZWNvbmRzIHNpbmNlIHBhZ2UtbG9hZCBpZiBzdXBwb3J0ZWRcbiAgICAgIHIgPSAoZDIgKyByKSAlIDE2IHwgMDtcbiAgICAgIGQyID0gTWF0aC5mbG9vcihkMiAvIDE2KTtcbiAgICB9XG5cbiAgICByZXR1cm4gKGMgPT09IFwieFwiID8gciA6IChyICYgMHgzKSB8IDB4OCkudG9TdHJpbmcoMTYpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc2VuZCgpIHt9XG5cbi8qZnVuY3Rpb24gc2VuZChlbnRyeSkge1xuICBxdWV1ZS5wdXNoKGVudHJ5KTtcblxuICBpZiAodGltZW91dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGltZW91dCA9IHNldFRpbWVvdXQoc2VuZFF1ZXVlLCBTRU5EX1RJTUVPVVQpO1xuICB9XG59Ki9cblxuZnVuY3Rpb24gd3NDb25uZWN0KHVybCwgZGF0YV92ZXJzaW9uLCBzZXNzaW9uX2lkKSB7XG4gIGNvbnNvbGUubG9nKFwidXJsXCIsIHVybCk7XG4gIFdTID0gbnVsbDtcbiAgV1MgPSBuZXcgV2ViU29ja2V0KFxuICAgIHVybCArIFwidHJhY2VyP3ZlcnNpb249XCIgKyBkYXRhX3ZlcnNpb24gKyBcIiZzZXNzaW9uPVwiICsgc2Vzc2lvbl9pZFxuICApO1xuXG4gIFdTLm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBlcnJvciA9IGUubWVzc2FnZTtcbiAgICBjb25zb2xlLmxvZyhcIldTIGVycm9yOiBcIiArIGVycm9yKTtcbiAgICBXUy5jbG9zZSgpO1xuICB9O1xuXG4gIFdTLm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGUuZGF0YSk7XG4gICAgY29uc29sZS5sb2coXCJtZXNzYWdlIGZyb20gV1M6IFwiLCBtZXNzYWdlKTtcbiAgfTtcblxuICBXUy5vbm9wZW4gPSBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChXUy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuT1BFTikge1xuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQoc2VuZFF1ZXVlLCBTRU5EX1RJTUVPVVQpO1xuICAgIH1cbiAgfTtcblxuICBXUy5vbmNsb3NlID0gZnVuY3Rpb24gKGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIldTIGRpc2Nvbm5lY3RlZFwiLCBlKTtcbiAgICB3c0Nvbm5lY3QodXJsLCBkYXRhX3ZlcnNpb24sIHNlc3Npb25faWQpO1xuICB9O1xufVxuXG5mdW5jdGlvbiB3c1NlbmQoZGF0YSkge1xuICBpZiAoV1MucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0Lk9QRU4pIHtcbiAgICBXUy5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gc2VuZFF1ZXVlKCkge1xuICBpZiAocXVldWUubGVuZ3RoICE9PSAwICYmIHdzU2VuZChxdWV1ZSkpIHtcbiAgICB0aW1lb3V0ID0gc2V0VGltZW91dChzZW5kUXVldWUsIFNFTkRfVElNRU9VVCk7XG4gICAgcXVldWUgPSBbXTtcbiAgfSBlbHNlIHtcbiAgICB0aW1lb3V0ID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgdmFyIE5PVyA9IERhdGUubm93KCk7XG5cbiAgaWYgKE5PVyAtIExBU1RfUElORyA+IFBJTkdfRVZFUlkpIHtcbiAgICBpZiAoXG4gICAgICB3c1NlbmQoe1xuICAgICAgICBwaW5nOiAxLFxuICAgICAgfSlcbiAgICApXG4gICAgICBMQVNUX1BJTkcgPSBOT1c7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXR0ZW1wdENsb3NlKCkge1xuICBpZiAocXVldWUubGVuZ3RoID09PSAwKSB7XG4gICAgV1MuY2xvc2UoKTtcbiAgICBzZWxmLmNsb3NlKCk7XG4gIH0gZWxzZSB7XG4gICAgc2V0VGltZW91dChhdHRlbXB0Q2xvc2UsIENMT1NFX1RJTUVPVVQpO1xuICB9XG59XG5cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcihcbiAgXCJtZXNzYWdlXCIsXG4gIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIG1lc3NhZ2UgPSBlLmRhdGE7XG4gICAgdmFyIGNtZCA9IG1lc3NhZ2UuY21kO1xuXG4gICAgaWYgKGNtZCA9PT0gXCJwb3N0XCIpIHtcbiAgICAgIC8vc2VuZChtZXNzYWdlLmVudHJ5KTtcbiAgICB9IGVsc2UgaWYgKGNtZCA9PT0gXCJjb25maWd1cmVcIikge1xuICAgICAgY29uc3QgdXJsID0gbWVzc2FnZS51cmwucmVwbGFjZSgvXmh0dHAvLCBcIndzXCIpO1xuICAgICAgdHJhY2VyLmNvbm5lY3QoYCR7dXJsfT92ZXJzaW9uPSR7bWVzc2FnZS5kYXRhX3ZlcnNpb259JnNlc3Npb249JHttZXNzYWdlLnNlc3Npb25faWR9YCk7XG4gICAgfSBlbHNlIGlmIChjbWQgPT09IFwiY2xvc2VcIikge1xuICAgICAgY29uc29sZS5sb2coXCJDTE9TRSFcIiwgbWVzc2FnZSlcbiAgICAgIC8vYXR0ZW1wdENsb3NlKCk7XG4gICAgfVxuICB9LFxuICBmYWxzZVxuKTtcbiJdfQ==
