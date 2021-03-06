/*
 * Orangevolt Ampere Framework
 *
 * http://github.com/lgersman
 * http://www.orangevolt.com
 *
 * Copyright 2012, Lars Gersmann <lars.gersmann@gmail.com>
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

/**
 * Debugging / namespacing support
 */
;(jQuery.ov && jQuery.ov.namespace) || (function( $) {
	$.ov = $.ov || {};
	
	$.ov.namespace = function( namespace) {
		namespace || (namespace='');
		if( $.ov.namespace[namespace]) {
			return $.ov.namespace[ namespace];
		} else {
			if( this instanceof $.ov.namespace) {
				this._namespace = namespace;
				return $.ov.namespace[ namespace] = this;
			} else {
				return new $.ov.namespace( namespace);
			}
		}
	};
		/*
		 * can be used to prevent output
		 * 
		 * @param type 'debug', 'warn' etc.
		 * @param namespace the namespace trying to output something
		 * 
		 * @return undefined or an expression evaluating to true to accept output
		 */
	$.ov.namespace.filter = function( severity, namespace) {
	};
	
	function join() {
		var message = "";
		for( var i=0; i<arguments.length; i++) {
			var arg = $.isFunction( arguments[i]) ? arguments[i].name || "function() {...}" : arguments[i];

			if( arg && arg.jquery) {
				message += '<jQuery>';
				arg = arg.get();
				arg = arg.length==1 ? arg[0] : arg;
			}

			if( arg && arg.nodeType) {		// -> dom element : append ist symbolic name
				message += $.ov.json.stringify( arg, $.ov.json.stringify.COMPACT);
			} else if( arg===null || arg===undefined || typeof arg=='object') {		// -> js object : append its jsonized form
				message += $.ov.json.stringify( arg, $.ov.json.stringify.COMPACT);
			} else {
				message += arg;						// -> other : append its toString() value
			}
		}
		
		return message;
	}
	
	function getConsole( type) {
		var map = {};
		var consoleFn = $.noop;
		if( window.console) {
			consoleFn = window.console[ type] || window.console.log || $.noop;
		}
		return map[ consoleFn] || (map[ consoleFn]=consoleFn===$.noop ? $.noop : $.proxy( consoleFn, window.console));
	}
	
	$.ov.namespace.prototype = {
		debug : function() {
			var isEnabled = $.ov.namespace.filter( 'debug', this._namespace);
			if( isEnabled!==undefined && !isEnabled) {
				return;
			}
			
			var args = $.makeArray( arguments);
			args.unshift( '#DEBUG: ');
			args.unshift( this._namespace);
			getConsole( 'debug').call( this, join.apply( this, args));
			return this;
		},
		error : function() {
			var isEnabled = $.ov.namespace.filter( 'error', this._namespace);
			if( isEnabled!==undefined && !isEnabled) {
				return;
			}
			
			var args = $.makeArray( arguments);
			args.unshift( '#ERROR: ');
			args.unshift( this._namespace);
			getConsole( 'error').call( this, join.apply( this, args));
			return this;
		},
		warn : function() {
			var isEnabled = $.ov.namespace.filter( 'warn', this._namespace);
			if( isEnabled!==undefined && !isEnabled) {
				return;
			}
			
			var args = $.makeArray( arguments);
			args.unshift( '#WARN: ');
			args.unshift( this._namespace);
			getConsole( 'warn').call( this, join.apply( this, args));
			return this;
		},
		assert : function( condition/*condition, args* */) {
			var args = $.makeArray( arguments);
			args.shift();
			
			if( !condition) {
				args.length || args.push( 'assertion failed');
				args.unshift( '#ASSERT: ');
				args.unshift( this._namespace);
				
				var message = join.apply( this, args);
				//getConsole( 'error').call( this,  message);
				throw new Error( message);
			}
			return this;
		},
		raise : function() {
			var args = $.makeArray( arguments);
			args.unshift( '#ERROR: ');
			args.unshift( this._namespace);
			throw new Error( join.apply( this, args));
		},
		attempt : function( _function /*, message* */) {
			var args = $.makeArray( arguments);
			args.shift();
			
			this.assert( $.isFunction( _function), 'first argument expected to be a function');
			
			var result;
			try {
				result = _function.call( this);
			} catch( ex) {
				args.length || args.push( 'problem executing function ' + _function.name);
				
				args.push( ' : ' + (ex.message || ex));
				args.unshift( '#ATTEMPT: ');
				args.unshift( this._namespace);
				
				var message = join.apply( this, args);
				//getConsole( 'error').call( this,  message);
				throw new Error( message);
			}
			return this;
		}
	};
})( jQuery);