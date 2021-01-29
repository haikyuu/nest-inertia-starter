var app = (function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, basedir, module) {
		return module = {
			path: basedir,
			exports: {},
			require: function (path, base) {
				return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
			}
		}, fn(module, module.exports), module.exports;
	}

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
	}

	var counter = 0;
	var seed = "M" + Math.random().toFixed(5);
	var _weakMap =
	  commonjsGlobal.WeakMap ||
	  function WeakMap() {
	    var id = seed + counter++;
	    return {
	      get: function(ref) {
	        return ref[id];
	      },
	      set: function(ref, value) {
	        ref[id] = value;
	      }
	    };
	  };

	var domData = {
	  ___vPropsByDOMNode: new _weakMap(),
	  ___vElementByDOMNode: new _weakMap(),
	  ___componentByDOMNode: new _weakMap(),
	  ___detachedByDOMNode: new _weakMap(),
	  ___keyByDOMNode: new _weakMap(),
	  ___ssrKeyedElementsByComponentId: {}
	};

	var utilBrowser = createCommonjsModule(function (module, exports) {
	var componentsByDOMNode = domData.___componentByDOMNode;
	var keysByDOMNode = domData.___keyByDOMNode;
	var vElementsByDOMNode = domData.___vElementByDOMNode;
	var vPropsByDOMNode = domData.___vPropsByDOMNode;
	var markoUID = window.$MUID || (window.$MUID = { i: 0 });
	var runtimeId = markoUID.i++;

	var componentLookup = {};

	var defaultDocument = document;
	var EMPTY_OBJECT = {};

	function getComponentForEl(el, doc) {
	  var node =
	    typeof el == "string" ? (doc || defaultDocument).getElementById(el) : el;
	  var component;
	  var vElement;

	  while (node) {
	    if (node.fragment) {
	      if (node.fragment.endNode === node) {
	        node = node.fragment.startNode;
	      } else {
	        node = node.fragment;
	        component = componentsByDOMNode.get(node);
	      }
	    } else if ((vElement = vElementsByDOMNode.get(node))) {
	      component = vElement.___ownerComponent;
	    }

	    if (component) {
	      return component;
	    }

	    node = node.previousSibling || node.parentNode;
	  }
	}

	function destroyComponentForNode(node) {
	  var componentToDestroy = componentsByDOMNode.get(node.fragment || node);
	  if (componentToDestroy) {
	    componentToDestroy.___destroyShallow();
	    delete componentLookup[componentToDestroy.id];
	  }
	}
	function destroyNodeRecursive(node, component) {
	  destroyComponentForNode(node);
	  if (node.nodeType === 1 || node.nodeType === 12) {
	    var key;

	    if (component && (key = keysByDOMNode.get(node))) {
	      if (node === component.___keyedElements[key]) {
	        if (componentsByDOMNode.get(node) && /\[\]$/.test(key)) {
	          delete component.___keyedElements[key][
	            componentsByDOMNode.get(node).id
	          ];
	        } else {
	          delete component.___keyedElements[key];
	        }
	      }
	    }

	    var curChild = node.firstChild;
	    while (curChild && curChild !== node.endNode) {
	      destroyNodeRecursive(curChild, component);
	      curChild = curChild.nextSibling;
	    }
	  }
	}

	function nextComponentId() {
	  // Each component will get an ID that is unique across all loaded
	  // marko runtimes. This allows multiple instances of marko to be
	  // loaded in the same window and they should all place nice
	  // together
	  return "c" + markoUID.i++;
	}

	function nextComponentIdProvider() {
	  return nextComponentId;
	}

	function attachBubblingEvent(
	  componentDef,
	  handlerMethodName,
	  isOnce,
	  extraArgs
	) {
	  if (handlerMethodName) {
	    var componentId = componentDef.id;
	    if (extraArgs) {
	      return [handlerMethodName, componentId, isOnce, extraArgs];
	    } else {
	      return [handlerMethodName, componentId, isOnce];
	    }
	  }
	}

	function getMarkoPropsFromEl(el) {
	  var vElement = vElementsByDOMNode.get(el);
	  var virtualProps;

	  if (vElement) {
	    virtualProps = vElement.___properties;
	  } else {
	    virtualProps = vPropsByDOMNode.get(el);
	    if (!virtualProps) {
	      virtualProps = el.getAttribute("data-marko");
	      vPropsByDOMNode.set(
	        el,
	        (virtualProps = virtualProps ? JSON.parse(virtualProps) : EMPTY_OBJECT)
	      );
	    }
	  }

	  return virtualProps;
	}

	function normalizeComponentKey(key, parentId) {
	  if (key[0] === "#") {
	    key = key.replace("#" + parentId + "-", "");
	  }
	  return key;
	}

	function addComponentRootToKeyedElements(
	  keyedElements,
	  key,
	  rootNode,
	  componentId
	) {
	  if (/\[\]$/.test(key)) {
	    var repeatedElementsForKey = (keyedElements[key] =
	      keyedElements[key] || {});
	    repeatedElementsForKey[componentId] = rootNode;
	  } else {
	    keyedElements[key] = rootNode;
	  }
	}

	// eslint-disable-next-line no-constant-condition
	{
	  var warnNodeRemoved = function(event) {
	    var fragment = event.target.fragment;
	    if (fragment) {
	      var baseError = new Error(
	        "Fragment boundary marker removed.  This will cause an error when the fragment is updated."
	      );
	      fragment.___markersRemovedError = function(message) {
	        var error = new Error(message + " Boundary markers missing.");

	        baseError.stack = baseError.stack.replace(/.*warnNodeRemoved.*\n/, "");

	        // eslint-disable-next-line no-console
	        console.warn(baseError);
	        return error;
	      };
	    }
	  };
	  exports.___startDOMManipulationWarning = function() {
	    document.addEventListener("DOMNodeRemoved", warnNodeRemoved);
	  };
	  exports.___stopDOMManipulationWarning = function() {
	    document.removeEventListener("DOMNodeRemoved", warnNodeRemoved);
	  };
	}

	exports.___runtimeId = runtimeId;
	exports.___componentLookup = componentLookup;
	exports.___getComponentForEl = getComponentForEl;
	exports.___destroyComponentForNode = destroyComponentForNode;
	exports.___destroyNodeRecursive = destroyNodeRecursive;
	exports.___nextComponentIdProvider = nextComponentIdProvider;
	exports.___attachBubblingEvent = attachBubblingEvent;
	exports.___getMarkoPropsFromEl = getMarkoPropsFromEl;
	exports.___addComponentRootToKeyedElements = addComponentRootToKeyedElements;
	exports.___normalizeComponentKey = normalizeComponentKey;
	});

	var nextComponentIdProvider = utilBrowser.___nextComponentIdProvider;

	function GlobalComponentsContext(out) {
	  this.___renderedComponentsById = {};
	  this.___rerenderComponent = undefined;
	  this.___nextComponentId = nextComponentIdProvider(out);
	}

	var GlobalComponentsContext_1 = GlobalComponentsContext;

	var ComponentsContext_1 = createCommonjsModule(function (module, exports) {


	function ComponentsContext(out, parentComponentsContext) {
	  var globalComponentsContext;
	  var componentDef;

	  if (parentComponentsContext) {
	    globalComponentsContext = parentComponentsContext.___globalContext;
	    componentDef = parentComponentsContext.___componentDef;

	    var nestedContextsForParent;
	    if (
	      !(nestedContextsForParent = parentComponentsContext.___nestedContexts)
	    ) {
	      nestedContextsForParent = parentComponentsContext.___nestedContexts = [];
	    }

	    nestedContextsForParent.push(this);
	  } else {
	    globalComponentsContext = out.global.___components;
	    if (globalComponentsContext === undefined) {
	      out.global.___components = globalComponentsContext = new GlobalComponentsContext_1(
	        out
	      );
	    }
	  }

	  this.___globalContext = globalComponentsContext;
	  this.___components = [];
	  this.___out = out;
	  this.___componentDef = componentDef;
	  this.___nestedContexts = undefined;
	  this.___isPreserved =
	    parentComponentsContext && parentComponentsContext.___isPreserved;
	}

	ComponentsContext.prototype = {
	  ___initComponents: function(doc) {
	    var componentDefs = this.___components;

	    ComponentsContext.___initClientRendered(componentDefs, doc);

	    this.___out.emit("___componentsInitialized");

	    // Reset things stored in global since global is retained for
	    // future renders
	    this.___out.global.___components = undefined;

	    return componentDefs;
	  }
	};

	function getComponentsContext(out) {
	  return out.___components || (out.___components = new ComponentsContext(out));
	}

	module.exports = exports = ComponentsContext;

	exports.___getComponentsContext = getComponentsContext;
	});

	var extend = function extend(target, source) { //A simple function to copy properties from one object to another
	    if (!target) { //Check if a target was provided, otherwise create a new empty object to return
	        target = {};
	    }

	    if (source) {
	        for (var propName in source) {
	            if (source.hasOwnProperty(propName)) { //Only look at source properties that are not inherited
	                target[propName] = source[propName]; //Copy the property
	            }
	        }
	    }

	    return target;
	};

	function ensure(state, propertyName) {
	  var proto = state.constructor.prototype;
	  if (!(propertyName in proto)) {
	    Object.defineProperty(proto, propertyName, {
	      get: function() {
	        return this.___raw[propertyName];
	      },
	      set: function(value) {
	        this.___set(propertyName, value, false /* ensure:false */);
	      }
	    });
	  }
	}

	function State(component) {
	  this.___component = component;
	  this.___raw = {};

	  this.___dirty = false;
	  this.___old = null;
	  this.___changes = null;
	  this.___forced = null; // An object that we use to keep tracking of state properties that were forced to be dirty

	  Object.seal(this);
	}

	State.prototype = {
	  ___reset: function() {
	    var self = this;

	    self.___dirty = false;
	    self.___old = null;
	    self.___changes = null;
	    self.___forced = null;
	  },

	  ___replace: function(newState) {
	    var state = this;
	    var key;

	    var rawState = this.___raw;

	    for (key in rawState) {
	      if (!(key in newState)) {
	        state.___set(
	          key,
	          undefined,
	          false /* ensure:false */,
	          false /* forceDirty:false */
	        );
	      }
	    }

	    for (key in newState) {
	      state.___set(
	        key,
	        newState[key],
	        true /* ensure:true */,
	        false /* forceDirty:false */
	      );
	    }
	  },
	  ___set: function(name, value, shouldEnsure, forceDirty) {
	    var rawState = this.___raw;

	    if (shouldEnsure) {
	      ensure(this, name);
	    }

	    if (forceDirty) {
	      var forcedDirtyState = this.___forced || (this.___forced = {});
	      forcedDirtyState[name] = true;
	    } else if (rawState[name] === value) {
	      return;
	    }

	    if (!this.___dirty) {
	      // This is the first time we are modifying the component state
	      // so introduce some properties to do some tracking of
	      // changes to the state
	      this.___dirty = true; // Mark the component state as dirty (i.e. modified)
	      this.___old = rawState;
	      this.___raw = rawState = extend({}, rawState);
	      this.___changes = {};
	      this.___component.___queueUpdate();
	    }

	    this.___changes[name] = value;

	    if (value === undefined) {
	      // Don't store state properties with an undefined or null value
	      delete rawState[name];
	    } else {
	      // Otherwise, store the new value in the component state
	      rawState[name] = value;
	    }
	  },
	  toJSON: function() {
	    return this.___raw;
	  }
	};

	var State_1 = State;

	var stackframe = createCommonjsModule(function (module, exports) {
	(function(root, factory) {
	    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

	    /* istanbul ignore next */
	    {
	        module.exports = factory();
	    }
	}(commonjsGlobal, function() {
	    function _isNumber(n) {
	        return !isNaN(parseFloat(n)) && isFinite(n);
	    }

	    function _capitalize(str) {
	        return str.charAt(0).toUpperCase() + str.substring(1);
	    }

	    function _getter(p) {
	        return function() {
	            return this[p];
	        };
	    }

	    var booleanProps = ['isConstructor', 'isEval', 'isNative', 'isToplevel'];
	    var numericProps = ['columnNumber', 'lineNumber'];
	    var stringProps = ['fileName', 'functionName', 'source'];
	    var arrayProps = ['args'];
	    var objectProps = ['evalOrigin'];

	    var props = booleanProps.concat(numericProps, stringProps, arrayProps, objectProps);

	    function StackFrame(obj) {
	        if (!obj) return;
	        for (var i = 0; i < props.length; i++) {
	            if (obj[props[i]] !== undefined) {
	                this['set' + _capitalize(props[i])](obj[props[i]]);
	            }
	        }
	    }

	    StackFrame.prototype = {
	        getArgs: function() {
	            return this.args;
	        },
	        setArgs: function(v) {
	            if (Object.prototype.toString.call(v) !== '[object Array]') {
	                throw new TypeError('Args must be an Array');
	            }
	            this.args = v;
	        },

	        getEvalOrigin: function() {
	            return this.evalOrigin;
	        },
	        setEvalOrigin: function(v) {
	            if (v instanceof StackFrame) {
	                this.evalOrigin = v;
	            } else if (v instanceof Object) {
	                this.evalOrigin = new StackFrame(v);
	            } else {
	                throw new TypeError('Eval Origin must be an Object or StackFrame');
	            }
	        },

	        toString: function() {
	            var fileName = this.getFileName() || '';
	            var lineNumber = this.getLineNumber() || '';
	            var columnNumber = this.getColumnNumber() || '';
	            var functionName = this.getFunctionName() || '';
	            if (this.getIsEval()) {
	                if (fileName) {
	                    return '[eval] (' + fileName + ':' + lineNumber + ':' + columnNumber + ')';
	                }
	                return '[eval]:' + lineNumber + ':' + columnNumber;
	            }
	            if (functionName) {
	                return functionName + ' (' + fileName + ':' + lineNumber + ':' + columnNumber + ')';
	            }
	            return fileName + ':' + lineNumber + ':' + columnNumber;
	        }
	    };

	    StackFrame.fromString = function StackFrame$$fromString(str) {
	        var argsStartIndex = str.indexOf('(');
	        var argsEndIndex = str.lastIndexOf(')');

	        var functionName = str.substring(0, argsStartIndex);
	        var args = str.substring(argsStartIndex + 1, argsEndIndex).split(',');
	        var locationString = str.substring(argsEndIndex + 1);

	        if (locationString.indexOf('@') === 0) {
	            var parts = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(locationString, '');
	            var fileName = parts[1];
	            var lineNumber = parts[2];
	            var columnNumber = parts[3];
	        }

	        return new StackFrame({
	            functionName: functionName,
	            args: args || undefined,
	            fileName: fileName,
	            lineNumber: lineNumber || undefined,
	            columnNumber: columnNumber || undefined
	        });
	    };

	    for (var i = 0; i < booleanProps.length; i++) {
	        StackFrame.prototype['get' + _capitalize(booleanProps[i])] = _getter(booleanProps[i]);
	        StackFrame.prototype['set' + _capitalize(booleanProps[i])] = (function(p) {
	            return function(v) {
	                this[p] = Boolean(v);
	            };
	        })(booleanProps[i]);
	    }

	    for (var j = 0; j < numericProps.length; j++) {
	        StackFrame.prototype['get' + _capitalize(numericProps[j])] = _getter(numericProps[j]);
	        StackFrame.prototype['set' + _capitalize(numericProps[j])] = (function(p) {
	            return function(v) {
	                if (!_isNumber(v)) {
	                    throw new TypeError(p + ' must be a Number');
	                }
	                this[p] = Number(v);
	            };
	        })(numericProps[j]);
	    }

	    for (var k = 0; k < stringProps.length; k++) {
	        StackFrame.prototype['get' + _capitalize(stringProps[k])] = _getter(stringProps[k]);
	        StackFrame.prototype['set' + _capitalize(stringProps[k])] = (function(p) {
	            return function(v) {
	                this[p] = String(v);
	            };
	        })(stringProps[k]);
	    }

	    return StackFrame;
	}));
	});

	var errorStackParser = createCommonjsModule(function (module, exports) {
	(function(root, factory) {
	    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

	    /* istanbul ignore next */
	    {
	        module.exports = factory(stackframe);
	    }
	}(commonjsGlobal, function ErrorStackParser(StackFrame) {

	    var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
	    var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
	    var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;

	    return {
	        /**
	         * Given an Error object, extract the most information from it.
	         *
	         * @param {Error} error object
	         * @return {Array} of StackFrames
	         */
	        parse: function ErrorStackParser$$parse(error) {
	            if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
	                return this.parseOpera(error);
	            } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
	                return this.parseV8OrIE(error);
	            } else if (error.stack) {
	                return this.parseFFOrSafari(error);
	            } else {
	                throw new Error('Cannot parse given Error object');
	            }
	        },

	        // Separate line and column numbers from a string of the form: (URI:Line:Column)
	        extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
	            // Fail-fast but return locations like "(native)"
	            if (urlLike.indexOf(':') === -1) {
	                return [urlLike];
	            }

	            var regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
	            var parts = regExp.exec(urlLike.replace(/[()]/g, ''));
	            return [parts[1], parts[2] || undefined, parts[3] || undefined];
	        },

	        parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
	            var filtered = error.stack.split('\n').filter(function(line) {
	                return !!line.match(CHROME_IE_STACK_REGEXP);
	            }, this);

	            return filtered.map(function(line) {
	                if (line.indexOf('(eval ') > -1) {
	                    // Throw away eval information until we implement stacktrace.js/stackframe#8
	                    line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^()]*)|(\),.*$)/g, '');
	                }
	                var sanitizedLine = line.replace(/^\s+/, '').replace(/\(eval code/g, '(');

	                // capture and preseve the parenthesized location "(/foo/my bar.js:12:87)" in
	                // case it has spaces in it, as the string is split on \s+ later on
	                var location = sanitizedLine.match(/ (\((.+):(\d+):(\d+)\)$)/);

	                // remove the parenthesized location from the line, if it was matched
	                sanitizedLine = location ? sanitizedLine.replace(location[0], '') : sanitizedLine;

	                var tokens = sanitizedLine.split(/\s+/).slice(1);
	                // if a location was matched, pass it to extractLocation() otherwise pop the last token
	                var locationParts = this.extractLocation(location ? location[1] : tokens.pop());
	                var functionName = tokens.join(' ') || undefined;
	                var fileName = ['eval', '<anonymous>'].indexOf(locationParts[0]) > -1 ? undefined : locationParts[0];

	                return new StackFrame({
	                    functionName: functionName,
	                    fileName: fileName,
	                    lineNumber: locationParts[1],
	                    columnNumber: locationParts[2],
	                    source: line
	                });
	            }, this);
	        },

	        parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
	            var filtered = error.stack.split('\n').filter(function(line) {
	                return !line.match(SAFARI_NATIVE_CODE_REGEXP);
	            }, this);

	            return filtered.map(function(line) {
	                // Throw away eval information until we implement stacktrace.js/stackframe#8
	                if (line.indexOf(' > eval') > -1) {
	                    line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ':$1');
	                }

	                if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
	                    // Safari eval frames only have function names and nothing else
	                    return new StackFrame({
	                        functionName: line
	                    });
	                } else {
	                    var functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
	                    var matches = line.match(functionNameRegex);
	                    var functionName = matches && matches[1] ? matches[1] : undefined;
	                    var locationParts = this.extractLocation(line.replace(functionNameRegex, ''));

	                    return new StackFrame({
	                        functionName: functionName,
	                        fileName: locationParts[0],
	                        lineNumber: locationParts[1],
	                        columnNumber: locationParts[2],
	                        source: line
	                    });
	                }
	            }, this);
	        },

	        parseOpera: function ErrorStackParser$$parseOpera(e) {
	            if (!e.stacktrace || (e.message.indexOf('\n') > -1 &&
	                e.message.split('\n').length > e.stacktrace.split('\n').length)) {
	                return this.parseOpera9(e);
	            } else if (!e.stack) {
	                return this.parseOpera10(e);
	            } else {
	                return this.parseOpera11(e);
	            }
	        },

	        parseOpera9: function ErrorStackParser$$parseOpera9(e) {
	            var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
	            var lines = e.message.split('\n');
	            var result = [];

	            for (var i = 2, len = lines.length; i < len; i += 2) {
	                var match = lineRE.exec(lines[i]);
	                if (match) {
	                    result.push(new StackFrame({
	                        fileName: match[2],
	                        lineNumber: match[1],
	                        source: lines[i]
	                    }));
	                }
	            }

	            return result;
	        },

	        parseOpera10: function ErrorStackParser$$parseOpera10(e) {
	            var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
	            var lines = e.stacktrace.split('\n');
	            var result = [];

	            for (var i = 0, len = lines.length; i < len; i += 2) {
	                var match = lineRE.exec(lines[i]);
	                if (match) {
	                    result.push(
	                        new StackFrame({
	                            functionName: match[3] || undefined,
	                            fileName: match[2],
	                            lineNumber: match[1],
	                            source: lines[i]
	                        })
	                    );
	                }
	            }

	            return result;
	        },

	        // Opera 10.65+ Error.stack very similar to FF/Safari
	        parseOpera11: function ErrorStackParser$$parseOpera11(error) {
	            var filtered = error.stack.split('\n').filter(function(line) {
	                return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
	            }, this);

	            return filtered.map(function(line) {
	                var tokens = line.split('@');
	                var locationParts = this.extractLocation(tokens.pop());
	                var functionCall = (tokens.shift() || '');
	                var functionName = functionCall
	                    .replace(/<anonymous function(: (\w+))?>/, '$2')
	                    .replace(/\([^)]*\)/g, '') || undefined;
	                var argsRaw;
	                if (functionCall.match(/\(([^)]*)\)/)) {
	                    argsRaw = functionCall.replace(/^[^(]+\(([^)]*)\)$/, '$1');
	                }
	                var args = (argsRaw === undefined || argsRaw === '[arguments not available]') ?
	                    undefined : argsRaw.split(',');

	                return new StackFrame({
	                    functionName: functionName,
	                    args: args,
	                    fileName: locationParts[0],
	                    lineNumber: locationParts[1],
	                    columnNumber: locationParts[2],
	                    source: line
	                });
	            }, this);
	        }
	    };
	}));
	});

	var complain_1 = createCommonjsModule(function (module) {


	var env = typeof process !== 'undefined' && process.env.NODE_ENV;
	var isDevelopment = !env || env === 'dev' || env === 'development';
	var showModuleComplains = typeof process !== 'undefined' && Boolean(process.env.SHOW_MODULE_COMPLAINS);
	var showNestedComplains = typeof process !== 'undefined' && Boolean(process.env.SHOW_NESTED_COMPLAINS);
	var logger = typeof console !== 'undefined' && console.warn && console;
	var cwd = typeof process !== 'undefined' && process.cwd() + '/' || '';
	var linebreak = typeof process !== 'undefined' && 'win32' === process.platform ? '\r\n' : '\n';
	var slice = [].slice;
	var ignoredLocation = "[ignore]";
	var hits = {};

	complain = isDevelopment ? complain : noop;
	complain.method = isDevelopment ? method : noop;
	complain.fn = isDevelopment ? fn : noopReturn;
	complain.log = log;
	complain.stream = typeof process !== 'undefined' && process.stderr;
	complain.silence = false;
	complain.color = complain.stream && complain.stream.isTTY;
	complain.colors = { warning:'\x1b[31;1m', notice:'\x1b[33;1m', message:false, location:'\u001b[90m' };
	complain.getModuleName = getModuleName;

	/* istanbul ignore next */
	if ( module.exports) {
	  module.exports = complain;
	} else if(typeof window !== 'undefined') {
	  window.complain = complain;
	}

	function complain() {
	  var options;
	  var location;
	  var locationIndex;
	  var headingColor;
	  var heading;
	  var level;
	  var args = arguments;

	  if(complain.silence) return;

	  if(typeof args[args.length-1] === 'object') {
	    options = args[args.length-1];
	    args = slice.call(args, 0, -1);
	  } else {
	    options = {};
	  }

	  level = options.level || 2;
	  heading = options.heading || (level == 2 ? "WARNING!!" : "NOTICE");
	  headingColor = options.headingColor || (level == 2 ? complain.colors.warning : complain.colors.notice);

	  // Default to the location of the call to the deprecated function
	  locationIndex = options.locationIndex == null ? 1 : options.locationIndex;

	  // When the user sets location to false,
	  // We will use the location of the call to complain()
	  // To limit the log to only occurring once
	  if(options.location === false) {
	    locationIndex = 0;
	  }

	  location = options.location || getLocation(locationIndex);
	  
	  var moduleName = complain.getModuleName(location);

	  if (moduleName && !showModuleComplains) {
	    if (!hits[moduleName]) {
	      var output = format("NOTICE", complain.colors.notice);
	      output += linebreak + format('The module ['+moduleName+'] is using deprecated features.', complain.colors.message);
	      output += linebreak + format('Run with process.env.SHOW_MODULE_COMPLAINS=1 to see all warnings.', complain.colors.message);
	      complain.log(linebreak + output + linebreak);
	      hits[moduleName] = true;
	    }
	    return;
	  }

	  /* istanbul ignore next */
	  // Location is only missing in older browsers.
	  if(location) {
	    if(hits[location] || location === ignoredLocation) return;
	    else hits[location] = true;
	  }

	  var output = format(heading, headingColor);

	  for(var i = 0; i < args.length; i++) {
	    output += linebreak + format(args[i], complain.colors.message);
	  }

	  if(options.location !== false && location) {
	    output += linebreak + format('  at '+location.replace(cwd, ''), complain.colors.location);
	  }

	  complain.log(linebreak + output + linebreak);
	}
	function method(object, methodName) {
	    var originalMethod = object[methodName];
	    var args = slice.call(arguments, 2);

	    object[methodName] = function() {
	        complain.apply(null, args);
	        return originalMethod.apply(this, arguments);
	    };
	}

	function fn(original) {
	  var args = slice.call(arguments, 1);

	  return function() {
	    complain.apply(null, args);
	    return original.apply(this, arguments);
	  }
	}

	function log(message, color) {
	  var formatted = format(message, color);
	  if(complain.stream) {
	    complain.stream.write(formatted+linebreak);
	  } else if(logger) {
	    logger.warn(formatted);
	  }
	}

	function format(message, color) {
	  return color && complain.color ? color + message + '\x1b[0m' : message;
	}

	function getLocation(locationIndex) {
	  var location = '';
	  var targetIndex = locationIndex + 2;

	  /**
	   * Stack index descriptions.
	   * 
	   * 0: In getLocation(), the call to new Error()
	   * 1: In complain(), the call to getLocation()
	   * 2: In the deprecated function, the call to complain()
	   * 3: The call to the deprecated function (THIS IS THE DEFAULT)
	   */

	  try {
	    var locations = errorStackParser.parse(new Error()).map(function(frame) {
	      return frame.fileName+':'+frame.lineNumber+':'+frame.columnNumber;
	    });
	    if (!showNestedComplains) {
	      for (var i = locations.length-1; i > targetIndex; i--) {
	        if (hits[locations[i]]) {
	          return ignoredLocation;
	        }
	      }
	    }
	    location = locations[targetIndex];
	  } catch(e) {}

	  return location;
	}

	function getModuleName(location) {
	  var locationParts = location.replace(cwd, '').split(/\/|\\/g);
	  for(var i = locationParts.length-1; i >= 0; i--) {
	    if (locationParts[i] === 'node_modules') {
	      var moduleName = locationParts[i+1];
	      return (moduleName[0] === '@') ? moduleName+'/'+locationParts[i+2] : moduleName;
	    }
	  }
	}

	function noop(){}function noopReturn(r) { return r; }});

	function insertBefore(node, referenceNode, parentNode) {
	  if (node.insertInto) {
	    return node.insertInto(parentNode, referenceNode);
	  }
	  return parentNode.insertBefore(
	    node,
	    (referenceNode && referenceNode.startNode) || referenceNode
	  );
	}

	function insertAfter(node, referenceNode, parentNode) {
	  return insertBefore(
	    node,
	    referenceNode && referenceNode.nextSibling,
	    parentNode
	  );
	}

	function nextSibling(node) {
	  var next = node.nextSibling;
	  var fragment = next && next.fragment;
	  if (fragment) {
	    return next === fragment.startNode ? fragment : null;
	  }
	  return next;
	}

	function firstChild(node) {
	  var next = node.firstChild;
	  return (next && next.fragment) || next;
	}

	function removeChild(node) {
	  if (node.remove) node.remove();
	  else node.parentNode.removeChild(node);
	}

	var ___insertBefore = insertBefore;
	var ___insertAfter = insertAfter;
	var ___nextSibling = nextSibling;
	var ___firstChild = firstChild;
	var ___removeChild = removeChild;

	var helpers = {
		___insertBefore: ___insertBefore,
		___insertAfter: ___insertAfter,
		___nextSibling: ___nextSibling,
		___firstChild: ___firstChild,
		___removeChild: ___removeChild
	};

	var destroyComponentForNode = utilBrowser.___destroyComponentForNode;
	var destroyNodeRecursive = utilBrowser.___destroyNodeRecursive;


	var insertBefore$1 = helpers.___insertBefore;
	var insertAfter$1 = helpers.___insertAfter;
	var removeChild$1 = helpers.___removeChild;

	function resolveEl(el) {
	  if (typeof el == "string") {
	    var elId = el;
	    el = document.getElementById(elId);
	    if (!el) {
	      throw Error("Not found: " + elId);
	    }
	  }
	  return el;
	}

	function beforeRemove(referenceEl) {
	  destroyNodeRecursive(referenceEl);
	  destroyComponentForNode(referenceEl);
	}

	var domInsert = function(target, getEl, afterInsert) {
	  extend(target, {
	    appendTo: function(referenceEl) {
	      referenceEl = resolveEl(referenceEl);
	      var el = getEl(this, referenceEl);
	      insertBefore$1(el, null, referenceEl);
	      return afterInsert(this, referenceEl);
	    },
	    prependTo: function(referenceEl) {
	      referenceEl = resolveEl(referenceEl);
	      var el = getEl(this, referenceEl);
	      insertBefore$1(el, referenceEl.firstChild || null, referenceEl);
	      return afterInsert(this, referenceEl);
	    },
	    replace: function(referenceEl) {
	      referenceEl = resolveEl(referenceEl);
	      var el = getEl(this, referenceEl);
	      beforeRemove(referenceEl);
	      insertBefore$1(el, referenceEl, referenceEl.parentNode);
	      removeChild$1(referenceEl);
	      return afterInsert(this, referenceEl);
	    },
	    replaceChildrenOf: function(referenceEl) {
	      referenceEl = resolveEl(referenceEl);
	      var el = getEl(this, referenceEl);

	      var curChild = referenceEl.firstChild;
	      while (curChild) {
	        var nextSibling = curChild.nextSibling; // Just in case the DOM changes while removing
	        beforeRemove(curChild);
	        curChild = nextSibling;
	      }

	      referenceEl.innerHTML = "";
	      insertBefore$1(el, null, referenceEl);
	      return afterInsert(this, referenceEl);
	    },
	    insertBefore: function(referenceEl) {
	      referenceEl = resolveEl(referenceEl);
	      var el = getEl(this, referenceEl);
	      insertBefore$1(el, referenceEl, referenceEl.parentNode);
	      return afterInsert(this, referenceEl);
	    },
	    insertAfter: function(referenceEl) {
	      referenceEl = resolveEl(referenceEl);
	      var el = getEl(this, referenceEl);
	      insertAfter$1(el, referenceEl, referenceEl.parentNode);
	      return afterInsert(this, referenceEl);
	    }
	  });
	};

	var actualCreateOut;

	function setCreateOut(createOutFunc) {
	  actualCreateOut = createOutFunc;
	}

	function createOut(globalData) {
	  return actualCreateOut(globalData);
	}

	createOut.___setCreateOut = setCreateOut;

	var createOut_1 = createOut;

	/* jshint newcap:false */
	var slice = Array.prototype.slice;

	function isFunction(arg) {
	    return typeof arg === 'function';
	}

	function checkListener(listener) {
	    if (!isFunction(listener)) {
	        throw TypeError('Invalid listener');
	    }
	}

	function invokeListener(ee, listener, args) {
	    switch (args.length) {
	        // fast cases
	        case 1:
	            listener.call(ee);
	            break;
	        case 2:
	            listener.call(ee, args[1]);
	            break;
	        case 3:
	            listener.call(ee, args[1], args[2]);
	            break;
	            // slower
	        default:
	            listener.apply(ee, slice.call(args, 1));
	    }
	}

	function addListener(eventEmitter, type, listener, prepend) {
	    checkListener(listener);

	    var events = eventEmitter.$e || (eventEmitter.$e = {});

	    var listeners = events[type];
	    if (listeners) {
	        if (isFunction(listeners)) {
	            events[type] = prepend ? [listener, listeners] : [listeners, listener];
	        } else {
	            if (prepend) {
	                listeners.unshift(listener);
	            } else {
	                listeners.push(listener);
	            }
	        }

	    } else {
	        events[type] = listener;
	    }
	    return eventEmitter;
	}

	function EventEmitter() {
	    this.$e = this.$e || {};
	}

	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype = {
	    $e: null,

	    emit: function(type) {
	        var args = arguments;

	        var events = this.$e;
	        if (!events) {
	            return;
	        }

	        var listeners = events && events[type];
	        if (!listeners) {
	            // If there is no 'error' event listener then throw.
	            if (type === 'error') {
	                var error = args[1];
	                if (!(error instanceof Error)) {
	                    var context = error;
	                    error = new Error('Error: ' + context);
	                    error.context = context;
	                }

	                throw error; // Unhandled 'error' event
	            }

	            return false;
	        }

	        if (isFunction(listeners)) {
	            invokeListener(this, listeners, args);
	        } else {
	            listeners = slice.call(listeners);

	            for (var i=0, len=listeners.length; i<len; i++) {
	                var listener = listeners[i];
	                invokeListener(this, listener, args);
	            }
	        }

	        return true;
	    },

	    on: function(type, listener) {
	        return addListener(this, type, listener, false);
	    },

	    prependListener: function(type, listener) {
	        return addListener(this, type, listener, true);
	    },

	    once: function(type, listener) {
	        checkListener(listener);

	        function g() {
	            this.removeListener(type, g);

	            if (listener) {
	                listener.apply(this, arguments);
	                listener = null;
	            }
	        }

	        this.on(type, g);

	        return this;
	    },

	    // emits a 'removeListener' event iff the listener was removed
	    removeListener: function(type, listener) {
	        checkListener(listener);

	        var events = this.$e;
	        var listeners;

	        if (events && (listeners = events[type])) {
	            if (isFunction(listeners)) {
	                if (listeners === listener) {
	                    delete events[type];
	                }
	            } else {
	                for (var i=listeners.length-1; i>=0; i--) {
	                    if (listeners[i] === listener) {
	                        listeners.splice(i, 1);
	                    }
	                }
	            }
	        }

	        return this;
	    },

	    removeAllListeners: function(type) {
	        var events = this.$e;
	        if (events) {
	            delete events[type];
	        }
	    },

	    listenerCount: function(type) {
	        var events = this.$e;
	        var listeners = events && events[type];
	        return listeners ? (isFunction(listeners) ? 1 : listeners.length) : 0;
	    }
	};

	var src = EventEmitter;

	var complain =  complain_1;

	function getComponentDefs(result) {
	  var componentDefs = result.___components;

	  if (!componentDefs) {
	    throw Error("No component");
	  }
	  return componentDefs;
	}

	function RenderResult(out) {
	  this.out = this.___out = out;
	  this.___components = undefined;
	}

	var RenderResult_1 = RenderResult;

	var proto = (RenderResult.prototype = {
	  getComponent: function() {
	    return this.getComponents()[0];
	  },
	  getComponents: function(selector) {
	    if (this.___components === undefined) {
	      throw Error("Not added to DOM");
	    }

	    var componentDefs = getComponentDefs(this);

	    var components = [];

	    componentDefs.forEach(function(componentDef) {
	      var component = componentDef.___component;
	      if (!selector || selector(component)) {
	        components.push(component);
	      }
	    });

	    return components;
	  },

	  afterInsert: function(doc) {
	    var out = this.___out;
	    var componentsContext = out.___components;
	    if (componentsContext) {
	      this.___components = componentsContext.___initComponents(doc);
	    } else {
	      this.___components = null;
	    }

	    return this;
	  },
	  getNode: function(doc) {
	    return this.___out.___getNode(doc);
	  },
	  getOutput: function() {
	    return this.___out.___getOutput();
	  },
	  toString: function() {
	    return this.___out.toString();
	  },
	  document: typeof document != "undefined" && document
	});

	Object.defineProperty(proto, "html", {
	  get: function() {
	    // eslint-disable-next-line no-constant-condition
	    {
	      complain(
	        'The "html" property is deprecated. Please use "toString" instead.'
	      );
	    }
	    return this.toString();
	  }
	});

	Object.defineProperty(proto, "context", {
	  get: function() {
	    // eslint-disable-next-line no-constant-condition
	    {
	      complain(
	        'The "context" property is deprecated. Please use "out" instead.'
	      );
	    }
	    return this.___out;
	  }
	});

	// Add all of the following DOM methods to Component.prototype:
	// - appendTo(referenceEl)
	// - replace(referenceEl)
	// - replaceChildrenOf(referenceEl)
	// - insertBefore(referenceEl)
	// - insertAfter(referenceEl)
	// - prependTo(referenceEl)
	domInsert(
	  proto,
	  function getEl(renderResult, referenceEl) {
	    return renderResult.getNode(referenceEl.ownerDocument);
	  },
	  function afterInsert(renderResult, referenceEl) {
	    var isShadow =
	      typeof ShadowRoot === "function" && referenceEl instanceof ShadowRoot;
	    return renderResult.afterInsert(
	      isShadow ? referenceEl : referenceEl.ownerDocument
	    );
	  }
	);

	var listenerTracker = createCommonjsModule(function (module, exports) {
	var INDEX_EVENT = 0;
	var INDEX_USER_LISTENER = 1;
	var INDEX_WRAPPED_LISTENER = 2;
	var DESTROY = "destroy";

	function isNonEventEmitter(target) {
	  return !target.once;
	}

	function EventEmitterWrapper(target) {
	    this.$__target = target;
	    this.$__listeners = [];
	    this.$__subscribeTo = null;
	}

	EventEmitterWrapper.prototype = {
	    $__remove: function(test, testWrapped) {
	        var target = this.$__target;
	        var listeners = this.$__listeners;

	        this.$__listeners = listeners.filter(function(curListener) {
	            var curEvent = curListener[INDEX_EVENT];
	            var curListenerFunc = curListener[INDEX_USER_LISTENER];
	            var curWrappedListenerFunc = curListener[INDEX_WRAPPED_LISTENER];

	            if (testWrapped) {
	                // If the user used `once` to attach an event listener then we had to
	                // wrap their listener function with a new function that does some extra
	                // cleanup to avoid a memory leak. If the `testWrapped` flag is set to true
	                // then we are attempting to remove based on a function that we had to
	                // wrap (not the user listener function)
	                if (curWrappedListenerFunc && test(curEvent, curWrappedListenerFunc)) {
	                    target.removeListener(curEvent, curWrappedListenerFunc);

	                    return false;
	                }
	            } else if (test(curEvent, curListenerFunc)) {
	                // If the listener function was wrapped due to it being a `once` listener
	                // then we should remove from the target EventEmitter using wrapped
	                // listener function. Otherwise, we remove the listener using the user-provided
	                // listener function.
	                target.removeListener(curEvent, curWrappedListenerFunc || curListenerFunc);

	                return false;
	            }

	            return true;
	        });

	        // Fixes https://github.com/raptorjs/listener-tracker/issues/2
	        // If all of the listeners stored with a wrapped EventEmitter
	        // have been removed then we should unregister the wrapped
	        // EventEmitter in the parent SubscriptionTracker
	        var subscribeTo = this.$__subscribeTo;

	        if (!this.$__listeners.length && subscribeTo) {
	            var self = this;
	            var subscribeToList = subscribeTo.$__subscribeToList;
	            subscribeTo.$__subscribeToList = subscribeToList.filter(function(cur) {
	                return cur !== self;
	            });
	        }
	    },

	    on: function(event, listener) {
	        this.$__target.on(event, listener);
	        this.$__listeners.push([event, listener]);
	        return this;
	    },

	    once: function(event, listener) {
	        var self = this;

	        // Handling a `once` event listener is a little tricky since we need to also
	        // do our own cleanup if the `once` event is emitted. Therefore, we need
	        // to wrap the user's listener function with our own listener function.
	        var wrappedListener = function() {
	            self.$__remove(function(event, listenerFunc) {
	                return wrappedListener === listenerFunc;
	            }, true /* We are removing the wrapped listener */);

	            listener.apply(this, arguments);
	        };

	        this.$__target.once(event, wrappedListener);
	        this.$__listeners.push([event, listener, wrappedListener]);
	        return this;
	    },

	    removeListener: function(event, listener) {
	        if (typeof event === 'function') {
	            listener = event;
	            event = null;
	        }

	        if (listener && event) {
	            this.$__remove(function(curEvent, curListener) {
	                return event === curEvent && listener === curListener;
	            });
	        } else if (listener) {
	            this.$__remove(function(curEvent, curListener) {
	                return listener === curListener;
	            });
	        } else if (event) {
	            this.removeAllListeners(event);
	        }

	        return this;
	    },

	    removeAllListeners: function(event) {

	        var listeners = this.$__listeners;
	        var target = this.$__target;

	        if (event) {
	            this.$__remove(function(curEvent, curListener) {
	                return event === curEvent;
	            });
	        } else {
	            for (var i = listeners.length - 1; i >= 0; i--) {
	                var cur = listeners[i];
	                target.removeListener(cur[INDEX_EVENT], cur[INDEX_USER_LISTENER]);
	            }
	            this.$__listeners.length = 0;
	        }

	        return this;
	    }
	};

	function EventEmitterAdapter(target) {
	    this.$__target = target;
	}

	EventEmitterAdapter.prototype = {
	    on: function(event, listener) {
	        this.$__target.addEventListener(event, listener);
	        return this;
	    },

	    once: function(event, listener) {
	        var self = this;

	        // need to save this so we can remove it below
	        var onceListener = function() {
	          self.$__target.removeEventListener(event, onceListener);
	          listener();
	        };
	        this.$__target.addEventListener(event, onceListener);
	        return this;
	    },

	    removeListener: function(event, listener) {
	        this.$__target.removeEventListener(event, listener);
	        return this;
	    }
	};

	function SubscriptionTracker() {
	    this.$__subscribeToList = [];
	}

	SubscriptionTracker.prototype = {

	    subscribeTo: function(target, options) {
	        var addDestroyListener = !options || options.addDestroyListener !== false;
	        var wrapper;
	        var nonEE;
	        var subscribeToList = this.$__subscribeToList;

	        for (var i=0, len=subscribeToList.length; i<len; i++) {
	            var cur = subscribeToList[i];
	            if (cur.$__target === target) {
	                wrapper = cur;
	                break;
	            }
	        }

	        if (!wrapper) {
	            if (isNonEventEmitter(target)) {
	              nonEE = new EventEmitterAdapter(target);
	            }

	            wrapper = new EventEmitterWrapper(nonEE || target);
	            if (addDestroyListener && !nonEE) {
	                wrapper.once(DESTROY, function() {
	                    wrapper.removeAllListeners();

	                    for (var i = subscribeToList.length - 1; i >= 0; i--) {
	                        if (subscribeToList[i].$__target === target) {
	                            subscribeToList.splice(i, 1);
	                            break;
	                        }
	                    }
	                });
	            }

	            // Store a reference to the parent SubscriptionTracker so that we can do cleanup
	            // if the EventEmitterWrapper instance becomes empty (i.e., no active listeners)
	            wrapper.$__subscribeTo = this;
	            subscribeToList.push(wrapper);
	        }

	        return wrapper;
	    },

	    removeAllListeners: function(target, event) {
	        var subscribeToList = this.$__subscribeToList;
	        var i;

	        if (target) {
	            for (i = subscribeToList.length - 1; i >= 0; i--) {
	                var cur = subscribeToList[i];
	                if (cur.$__target === target) {
	                    cur.removeAllListeners(event);

	                    if (!cur.$__listeners.length) {
	                        // Do some cleanup if we removed all
	                        // listeners for the target event emitter
	                        subscribeToList.splice(i, 1);
	                    }

	                    break;
	                }
	            }
	        } else {
	            for (i = subscribeToList.length - 1; i >= 0; i--) {
	                subscribeToList[i].removeAllListeners();
	            }
	            subscribeToList.length = 0;
	        }
	    }
	};

	exports = module.exports = SubscriptionTracker;

	exports.wrap = function(targetEventEmitter) {
	    var nonEE;
	    var wrapper;

	    if (isNonEventEmitter(targetEventEmitter)) {
	      nonEE = new EventEmitterAdapter(targetEventEmitter);
	    }

	    wrapper = new EventEmitterWrapper(nonEE || targetEventEmitter);
	    if (!nonEE) {
	      // we don't set this for non EE types
	      targetEventEmitter.once(DESTROY, function() {
	          wrapper.$__listeners.length = 0;
	      });
	    }

	    return wrapper;
	};

	exports.createTracker = function() {
	    return new SubscriptionTracker();
	};
	});

	var copyProps = function copyProps(from, to) {
	    Object.getOwnPropertyNames(from).forEach(function(name) {
	        var descriptor = Object.getOwnPropertyDescriptor(from, name);
	        Object.defineProperty(to, name, descriptor);
	    });
	};

	function inherit(ctor, superCtor, shouldCopyProps) {
	    var oldProto = ctor.prototype;
	    var newProto = ctor.prototype = Object.create(superCtor.prototype, {
	        constructor: {
	            value: ctor,
	            writable: true,
	            configurable: true
	        }
	    });
	    if (oldProto && shouldCopyProps !== false) {
	        copyProps(oldProto, newProto);
	    }
	    ctor.$super = superCtor;
	    ctor.prototype = newProto;
	    return ctor;
	}


	var inherit_1 = inherit;
	inherit._inherit = inherit;

	var setImmediate =
	  commonjsGlobal.setImmediate ||
	  (function() {
	    var queue = [];
	    var win = window;
	    var msg = "" + Math.random();
	    win.addEventListener("message", function(ev) {
	      if (ev.data === msg) {
	        var callbacks = queue;
	        queue = [];
	        for (var i = 0; i < callbacks.length; i++) {
	          callbacks[i]();
	        }
	      }
	    });
	    return function(callback) {
	      if (queue.push(callback) === 1) {
	        win.postMessage(msg, "*");
	      }
	    };
	  })();

	var updatesScheduled = false;
	var batchStack = []; // A stack of batched updates
	var unbatchedQueue = []; // Used for scheduled batched updates



	/**
	 * This function is called when we schedule the update of "unbatched"
	 * updates to components.
	 */
	function updateUnbatchedComponents() {
	  if (unbatchedQueue.length) {
	    try {
	      updateComponents(unbatchedQueue);
	    } finally {
	      // Reset the flag now that this scheduled batch update
	      // is complete so that we can later schedule another
	      // batched update if needed
	      updatesScheduled = false;
	    }
	  }
	}

	function scheduleUpdates() {
	  if (updatesScheduled) {
	    // We have already scheduled a batched update for the
	    // nextTick so nothing to do
	    return;
	  }

	  updatesScheduled = true;

	  setImmediate(updateUnbatchedComponents);
	}

	function updateComponents(queue) {
	  // Loop over the components in the queue and update them.
	  // NOTE: It is okay if the queue grows during the iteration
	  //       since we will still get to them at the end
	  for (var i = 0; i < queue.length; i++) {
	    var component = queue[i];
	    component.___update(); // Do the actual component update
	  }

	  // Clear out the queue by setting the length to zero
	  queue.length = 0;
	}

	function batchUpdate(func) {
	  // If the batched update stack is empty then this
	  // is the outer batched update. After the outer
	  // batched update completes we invoke the "afterUpdate"
	  // event listeners.
	  var batch = {
	    ___queue: null
	  };

	  batchStack.push(batch);

	  try {
	    func();
	  } finally {
	    try {
	      // Update all of the components that where queued up
	      // in this batch (if any)
	      if (batch.___queue) {
	        updateComponents(batch.___queue);
	      }
	    } finally {
	      // Now that we have completed the update of all the components
	      // in this batch we need to remove it off the top of the stack
	      batchStack.length--;
	    }
	  }
	}

	function queueComponentUpdate(component) {
	  var batchStackLen = batchStack.length;

	  if (batchStackLen) {
	    // When a batch update is started we push a new batch on to a stack.
	    // If the stack has a non-zero length then we know that a batch has
	    // been started so we can just queue the component on the top batch. When
	    // the batch is ended this component will be updated.
	    var batch = batchStack[batchStackLen - 1];

	    // We default the batch queue to null to avoid creating an Array instance
	    // unnecessarily. If it is null then we create a new Array, otherwise
	    // we push it onto the existing Array queue
	    if (batch.___queue) {
	      batch.___queue.push(component);
	    } else {
	      batch.___queue = [component];
	    }
	  } else {
	    // We are not within a batched update. We need to schedule a batch update
	    // for the nextTick (if that hasn't been done already) and we will
	    // add the component to the unbatched queued
	    scheduleUpdates();
	    unbatchedQueue.push(component);
	  }
	}

	var ___queueComponentUpdate = queueComponentUpdate;
	var ___batchUpdate = batchUpdate;

	var updateManager = {
		___queueComponentUpdate: ___queueComponentUpdate,
		___batchUpdate: ___batchUpdate
	};

	function syncBooleanAttrProp(fromEl, toEl, name) {
	  if (fromEl[name] !== toEl[name]) {
	    fromEl[name] = toEl[name];
	    if (fromEl[name]) {
	      fromEl.setAttribute(name, "");
	    } else {
	      fromEl.removeAttribute(name, "");
	    }
	  }
	}

	function forEachOption(el, fn, i) {
	  var curChild = el.___firstChild;

	  while (curChild) {
	    if (curChild.___nodeName === "option") {
	      fn(curChild, ++i);
	    } else {
	      i = forEachOption(curChild, fn, i);
	    }

	    curChild = curChild.___nextSibling;
	  }

	  return i;
	}

	// We use a JavaScript class to benefit from fast property lookup
	function SpecialElHandlers() {}
	SpecialElHandlers.prototype = {
	  /**
	   * Needed for IE. Apparently IE doesn't think that "selected" is an
	   * attribute when reading over the attributes using selectEl.attributes
	   */
	  option: function(fromEl, toEl) {
	    syncBooleanAttrProp(fromEl, toEl, "selected");
	  },
	  button: function(fromEl, toEl) {
	    syncBooleanAttrProp(fromEl, toEl, "disabled");
	  },
	  /**
	   * The "value" attribute is special for the <input> element since it sets
	   * the initial value. Changing the "value" attribute without changing the
	   * "value" property will have no effect since it is only used to the set the
	   * initial value.  Similar for the "checked" attribute, and "disabled".
	   */
	  input: function(fromEl, toEl) {
	    syncBooleanAttrProp(fromEl, toEl, "checked");
	    syncBooleanAttrProp(fromEl, toEl, "disabled");

	    if (fromEl.value != toEl.___value) {
	      fromEl.value = toEl.___value;
	    }

	    if (fromEl.hasAttribute("value") && !toEl.___hasAttribute("value")) {
	      fromEl.removeAttribute("value");
	    }
	  },

	  textarea: function(fromEl, toEl) {
	    if (toEl.___preserveTextAreaValue) {
	      return;
	    }

	    var newValue = toEl.___value;
	    if (fromEl.value != newValue) {
	      fromEl.value = newValue;
	    }

	    var firstChild = fromEl.firstChild;
	    if (firstChild) {
	      // Needed for IE. Apparently IE sets the placeholder as the
	      // node value and vise versa. This ignores an empty update.
	      var oldValue = firstChild.nodeValue;

	      if (
	        oldValue == newValue ||
	        (!newValue && oldValue == fromEl.placeholder)
	      ) {
	        return;
	      }

	      firstChild.nodeValue = newValue;
	    }
	  },
	  select: function(fromEl, toEl) {
	    if (!toEl.___hasAttribute("multiple")) {
	      var selected = 0;
	      forEachOption(
	        toEl,
	        function(option, i) {
	          if (option.___hasAttribute("selected")) {
	            selected = i;
	          }
	        },
	        -1
	      );

	      if (fromEl.selectedIndex !== selected) {
	        fromEl.selectedIndex = selected;
	      }
	    }
	  }
	};

	var specialElHandlers = new SpecialElHandlers();

	function KeySequence() {
	  this.___lookup = Object.create(null);
	}

	KeySequence.prototype.___nextKey = function(key) {
	  var lookup = this.___lookup;

	  if (lookup[key]) {
	    return key + "_" + lookup[key]++;
	  }

	  lookup[key] = 1;
	  return key;
	};

	var KeySequence_1 = KeySequence;

	/* jshint newcap:false */
	function VNode() {}

	VNode.prototype = {
	  ___VNode: function(finalChildCount, ownerComponent) {
	    this.___finalChildCount = finalChildCount;
	    this.___childCount = 0;
	    this.___firstChildInternal = null;
	    this.___lastChild = null;
	    this.___parentNode = null;
	    this.___nextSiblingInternal = null;
	    this.___ownerComponent = ownerComponent;
	  },

	  get ___firstChild() {
	    var firstChild = this.___firstChildInternal;

	    if (firstChild && firstChild.___DocumentFragment) {
	      var nestedFirstChild = firstChild.___firstChild;
	      // The first child is a DocumentFragment node.
	      // If the DocumentFragment node has a first child then we will return that.
	      // Otherwise, the DocumentFragment node is not *really* the first child and
	      // we need to skip to its next sibling
	      return nestedFirstChild || firstChild.___nextSibling;
	    }

	    return firstChild;
	  },

	  get ___nextSibling() {
	    var nextSibling = this.___nextSiblingInternal;

	    if (nextSibling) {
	      if (nextSibling.___DocumentFragment) {
	        var firstChild = nextSibling.___firstChild;
	        return firstChild || nextSibling.___nextSibling;
	      }
	    } else {
	      var parentNode = this.___parentNode;
	      if (parentNode && parentNode.___DocumentFragment) {
	        return parentNode.___nextSibling;
	      }
	    }

	    return nextSibling;
	  },

	  ___appendChild: function(child) {
	    this.___childCount++;

	    if (this.___nodeName === "textarea") {
	      if (child.___Text) {
	        var childValue = child.___nodeValue;
	        this.___valueInternal = (this.___valueInternal || "") + childValue;
	      } else if (child.___preserve || child.___preserveBody) {
	        this.___preserveTextAreaValue = true;
	      } else {
	        throw TypeError();
	      }
	    } else {
	      var lastChild = this.___lastChild;

	      child.___parentNode = this;

	      if (lastChild) {
	        lastChild.___nextSiblingInternal = child;
	      } else {
	        this.___firstChildInternal = child;
	      }

	      this.___lastChild = child;
	    }

	    return child;
	  },

	  ___finishChild: function finishChild() {
	    if (this.___childCount === this.___finalChildCount && this.___parentNode) {
	      return this.___parentNode.___finishChild();
	    } else {
	      return this;
	    }
	  }

	  // ,toJSON: function() {
	  //     var clone = Object.assign({
	  //         nodeType: this.nodeType
	  //     }, this);
	  //
	  //     for (var k in clone) {
	  //         if (k.startsWith('_')) {
	  //             delete clone[k];
	  //         }
	  //     }
	  //     delete clone._nextSibling;
	  //     delete clone._lastChild;
	  //     delete clone.parentNode;
	  //     return clone;
	  // }
	};

	var VNode_1 = VNode;

	function VDocumentFragmentClone(other) {
	  extend(this, other);
	  this.___parentNode = null;
	  this.___nextSiblingInternal = null;
	}

	function VDocumentFragment(out) {
	  this.___VNode(null /* childCount */);
	  this.___out = out;
	}

	VDocumentFragment.prototype = {
	  ___nodeType: 11,

	  ___DocumentFragment: true,

	  ___cloneNode: function() {
	    return new VDocumentFragmentClone(this);
	  },

	  ___actualize: function(doc) {
	    return doc.createDocumentFragment();
	  }
	};

	inherit_1(VDocumentFragment, VNode_1);

	VDocumentFragmentClone.prototype = VDocumentFragment.prototype;

	var VDocumentFragment_1 = VDocumentFragment;

	/* jshint newcap:false */



	var vElementByDOMNode = domData.___vElementByDOMNode;


	var ATTR_XLINK_HREF = "xlink:href";
	var xmlnsRegExp = /^xmlns(:|$)/;
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var NS_XLINK = "http://www.w3.org/1999/xlink";
	var NS_HTML = "http://www.w3.org/1999/xhtml";
	var NS_MATH = "http://www.w3.org/1998/Math/MathML";
	var NS_SVG = "http://www.w3.org/2000/svg";
	var DEFAULT_NS = {
	  svg: NS_SVG,
	  math: NS_MATH
	};

	var FLAG_SIMPLE_ATTRS = 1;
	var FLAG_CUSTOM_ELEMENT = 2;
	var FLAG_SPREAD_ATTRS = 4;

	var defineProperty = Object.defineProperty;

	var ATTR_HREF = "href";
	var EMPTY_OBJECT = Object.freeze({});

	function convertAttrValue(type, value) {
	  if (value === true) {
	    return "";
	  } else if (type == "object") {
	    if (value instanceof RegExp) {
	      return value.source;
	    }
	  }

	  return value + "";
	}

	function assign(a, b) {
	  for (var key in b) {
	    if (hasOwnProperty.call(b, key)) {
	      a[key] = b[key];
	    }
	  }
	}

	function setAttribute(el, namespaceURI, name, value) {
	  if (namespaceURI === null) {
	    el.setAttribute(name, value);
	  } else {
	    el.setAttributeNS(namespaceURI, name, value);
	  }
	}

	function removeAttribute(el, namespaceURI, name) {
	  if (namespaceURI === null) {
	    el.removeAttribute(name);
	  } else {
	    el.removeAttributeNS(namespaceURI, name);
	  }
	}

	function VElementClone(other) {
	  this.___firstChildInternal = other.___firstChildInternal;
	  this.___parentNode = null;
	  this.___nextSiblingInternal = null;

	  this.___key = other.___key;
	  this.___attributes = other.___attributes;
	  this.___properties = other.___properties;
	  this.___nodeName = other.___nodeName;
	  this.___flags = other.___flags;
	  this.___valueInternal = other.___valueInternal;
	  this.___constId = other.___constId;
	}

	function VElement(
	  tagName,
	  attrs,
	  key,
	  ownerComponent,
	  childCount,
	  flags,
	  props
	) {
	  this.___VNode(childCount, ownerComponent);

	  var constId;

	  if (props) {
	    constId = props.i;
	  }

	  this.___key = key;
	  this.___flags = flags || 0;
	  this.___attributes = attrs || EMPTY_OBJECT;
	  this.___properties = props || EMPTY_OBJECT;
	  this.___nodeName = tagName;
	  this.___valueInternal = null;
	  this.___constId = constId;
	  this.___preserve = false;
	  this.___preserveBody = false;
	}

	VElement.prototype = {
	  ___nodeType: 1,

	  ___cloneNode: function() {
	    return new VElementClone(this);
	  },

	  /**
	   * Shorthand method for creating and appending an HTML element
	   *
	   * @param  {String} tagName    The tag name (e.g. "div")
	   * @param  {int|null} attrCount  The number of attributes (or `null` if not known)
	   * @param  {int|null} childCount The number of child nodes (or `null` if not known)
	   */
	  e: function(tagName, attrs, key, ownerComponent, childCount, flags, props) {
	    var child = this.___appendChild(
	      new VElement(
	        tagName,
	        attrs,
	        key,
	        ownerComponent,
	        childCount,
	        flags,
	        props
	      )
	    );

	    if (childCount === 0) {
	      return this.___finishChild();
	    } else {
	      return child;
	    }
	  },

	  /**
	   * Shorthand method for creating and appending a static node. The provided node is automatically cloned
	   * using a shallow clone since it will be mutated as a result of setting `nextSibling` and `parentNode`.
	   *
	   * @param  {String} value The value for the new Comment node
	   */
	  n: function(node, ownerComponent) {
	    node = node.___cloneNode();
	    node.___ownerComponent = ownerComponent;
	    this.___appendChild(node);
	    return this.___finishChild();
	  },

	  ___actualize: function(doc, parentNamespaceURI) {
	    var tagName = this.___nodeName;
	    var attributes = this.___attributes;
	    var namespaceURI = DEFAULT_NS[tagName] || parentNamespaceURI || NS_HTML;

	    var flags = this.___flags;
	    var el = doc.createElementNS(namespaceURI, tagName);

	    if (flags & FLAG_CUSTOM_ELEMENT) {
	      assign(el, attributes);
	    } else {
	      for (var attrName in attributes) {
	        var attrValue = attributes[attrName];

	        if (attrValue !== false && attrValue != null) {
	          var type = typeof attrValue;

	          if (type !== "string") {
	            // Special attributes aren't copied to the real DOM. They are only
	            // kept in the virtual attributes map
	            attrValue = convertAttrValue(type, attrValue);
	          }

	          if (attrName == ATTR_XLINK_HREF) {
	            setAttribute(el, NS_XLINK, ATTR_HREF, attrValue);
	          } else {
	            el.setAttribute(attrName, attrValue);
	          }
	        }
	      }

	      if (tagName === "textarea") {
	        el.defaultValue = el.value = this.___value;
	      }
	    }

	    vElementByDOMNode.set(el, this);

	    return el;
	  },

	  ___hasAttribute: function(name) {
	    // We don't care about the namespaces since the there
	    // is no chance that attributes with the same name will have
	    // different namespaces
	    var value = this.___attributes[name];
	    return value != null && value !== false;
	  }
	};

	inherit_1(VElement, VNode_1);

	var proto$1 = (VElementClone.prototype = VElement.prototype);

	["checked", "selected", "disabled"].forEach(function(name) {
	  defineProperty(proto$1, name, {
	    get: function() {
	      var value = this.___attributes[name];
	      return value !== false && value != null;
	    }
	  });
	});

	defineProperty(proto$1, "___value", {
	  get: function() {
	    var value = this.___valueInternal;
	    if (value == null) {
	      value = this.___attributes.value;
	    }
	    return value != null && value !== false
	      ? value + ""
	      : this.___attributes.type === "checkbox" ||
	        this.___attributes.type === "radio"
	      ? "on"
	      : "";
	  }
	});

	VElement.___removePreservedAttributes = function(attrs) {
	  // By default this static method is a no-op, but if there are any
	  // compiled components that have "no-update" attributes then
	  // `preserve-attrs.js` will be imported and this method will be replaced
	  // with a method that actually does something
	  return attrs;
	};

	function virtualizeElement(node, virtualizeChildNodes, ownerComponent) {
	  var attributes = node.attributes;
	  var attrCount = attributes.length;

	  var attrs = null;
	  var props = null;

	  if (attrCount) {
	    attrs = {};
	    for (var i = 0; i < attrCount; i++) {
	      var attr = attributes[i];
	      var attrName = attr.name;
	      if (!xmlnsRegExp.test(attrName)) {
	        if (attrName === "data-marko") {
	          props = utilBrowser.___getMarkoPropsFromEl(node);
	        } else if (attr.namespaceURI === NS_XLINK) {
	          attrs[ATTR_XLINK_HREF] = attr.value;
	        } else {
	          attrs[attrName] = attr.value;
	        }
	      }
	    }
	  }

	  var tagName = node.nodeName;

	  if (node.namespaceURI === NS_HTML) {
	    tagName = tagName.toLowerCase();
	  }

	  var vdomEl = new VElement(
	    tagName,
	    attrs,
	    null /*key*/,
	    ownerComponent,
	    0 /*child count*/,
	    0 /*flags*/,
	    props
	  );

	  if (vdomEl.___nodeName === "textarea") {
	    vdomEl.___valueInternal = node.value;
	  } else if (virtualizeChildNodes) {
	    virtualizeChildNodes(node, vdomEl, ownerComponent);
	  }

	  return vdomEl;
	}

	VElement.___virtualize = virtualizeElement;

	VElement.___morphAttrs = function(fromEl, vFromEl, toEl) {
	  var removePreservedAttributes = VElement.___removePreservedAttributes;

	  var fromFlags = vFromEl.___flags;
	  var toFlags = toEl.___flags;

	  vElementByDOMNode.set(fromEl, toEl);

	  var attrs = toEl.___attributes;
	  var props = toEl.___properties;

	  if (toFlags & FLAG_CUSTOM_ELEMENT) {
	    return assign(fromEl, attrs);
	  }

	  var attrName;

	  // We use expando properties to associate the previous HTML
	  // attributes provided as part of the VDOM node with the
	  // real VElement DOM node. When diffing attributes,
	  // we only use our internal representation of the attributes.
	  // When diffing for the first time it's possible that the
	  // real VElement node will not have the expando property
	  // so we build the attribute map from the expando property

	  var oldAttrs = vFromEl.___attributes;

	  if (oldAttrs) {
	    if (oldAttrs === attrs) {
	      // For constant attributes the same object will be provided
	      // every render and we can use that to our advantage to
	      // not waste time diffing a constant, immutable attribute
	      // map.
	      return;
	    } else {
	      oldAttrs = removePreservedAttributes(oldAttrs, props);
	    }
	  }

	  var attrValue;

	  if (toFlags & FLAG_SIMPLE_ATTRS && fromFlags & FLAG_SIMPLE_ATTRS) {
	    if (oldAttrs["class"] !== (attrValue = attrs["class"])) {
	      fromEl.className = attrValue;
	    }
	    if (oldAttrs.id !== (attrValue = attrs.id)) {
	      fromEl.id = attrValue;
	    }
	    if (oldAttrs.style !== (attrValue = attrs.style)) {
	      fromEl.style.cssText = attrValue;
	    }
	    return;
	  }

	  // In some cases we only want to set an attribute value for the first
	  // render or we don't want certain attributes to be touched. To support
	  // that use case we delete out all of the preserved attributes
	  // so it's as if they never existed.
	  attrs = removePreservedAttributes(attrs, props, true);

	  var namespaceURI;

	  // Loop over all of the attributes in the attribute map and compare
	  // them to the value in the old map. However, if the value is
	  // null/undefined/false then we want to remove the attribute
	  for (attrName in attrs) {
	    attrValue = attrs[attrName];
	    namespaceURI = null;

	    if (attrName === ATTR_XLINK_HREF) {
	      namespaceURI = NS_XLINK;
	      attrName = ATTR_HREF;
	    }

	    if (attrValue == null || attrValue === false) {
	      removeAttribute(fromEl, namespaceURI, attrName);
	    } else if (oldAttrs[attrName] !== attrValue) {
	      var type = typeof attrValue;

	      if (type !== "string") {
	        attrValue = convertAttrValue(type, attrValue);
	      }

	      setAttribute(fromEl, namespaceURI, attrName, attrValue);
	    }
	  }

	  // If there are any old attributes that are not in the new set of attributes
	  // then we need to remove those attributes from the target node
	  //
	  // NOTE: We can skip this if the the element is keyed and didn't have spread attributes
	  //       because we know we already processed all of the attributes for
	  //       both the target and original element since target VElement nodes will
	  //       have all attributes declared. However, we can only skip if the node
	  //       was not a virtualized node (i.e., a node that was not rendered by a
	  //       Marko template, but rather a node that was created from an HTML
	  //       string or a real DOM node).
	  if (toEl.___key === null || fromFlags & FLAG_SPREAD_ATTRS) {
	    for (attrName in oldAttrs) {
	      if (!(attrName in attrs)) {
	        if (attrName === ATTR_XLINK_HREF) {
	          fromEl.removeAttributeNS(ATTR_XLINK_HREF, ATTR_HREF);
	        } else {
	          fromEl.removeAttribute(attrName);
	        }
	      }
	    }
	  }
	};

	var VElement_1 = VElement;

	function VText(value, ownerComponent) {
	  this.___VNode(-1 /* no children */, ownerComponent);
	  this.___nodeValue = value;
	}

	VText.prototype = {
	  ___Text: true,

	  ___nodeType: 3,

	  ___actualize: function(doc) {
	    return doc.createTextNode(this.___nodeValue);
	  },

	  ___cloneNode: function() {
	    return new VText(this.___nodeValue);
	  }
	};

	inherit_1(VText, VNode_1);

	var VText_1 = VText;

	function VComponent(component, key, ownerComponent, preserve) {
	  this.___VNode(null /* childCount */, ownerComponent);
	  this.___key = key;
	  this.___component = component;
	  this.___preserve = preserve;
	}

	VComponent.prototype = {
	  ___nodeType: 2
	};

	inherit_1(VComponent, VNode_1);

	var VComponent_1 = VComponent;

	var insertBefore$2 = helpers.___insertBefore;

	var fragmentPrototype = {
	  nodeType: 12,
	  get firstChild() {
	    var firstChild = this.startNode.nextSibling;
	    return firstChild === this.endNode ? undefined : firstChild;
	  },
	  get lastChild() {
	    var lastChild = this.endNode.previousSibling;
	    return lastChild === this.startNode ? undefined : lastChild;
	  },
	  get parentNode() {
	    var parentNode = this.startNode.parentNode;
	    return parentNode === this.detachedContainer ? undefined : parentNode;
	  },
	  get namespaceURI() {
	    return this.startNode.parentNode.namespaceURI;
	  },
	  get nextSibling() {
	    return this.endNode.nextSibling;
	  },
	  get nodes() {
	    // eslint-disable-next-line no-constant-condition
	    {
	      if (this.___markersRemovedError) {
	        throw this.___markersRemovedError("Cannot get fragment nodes.");
	      }
	    }
	    var nodes = [];
	    var current = this.startNode;
	    while (current !== this.endNode) {
	      nodes.push(current);
	      current = current.nextSibling;
	    }
	    nodes.push(current);
	    return nodes;
	  },
	  insertBefore: function(newChildNode, referenceNode) {
	    var actualReference = referenceNode == null ? this.endNode : referenceNode;
	    return insertBefore$2(
	      newChildNode,
	      actualReference,
	      this.startNode.parentNode
	    );
	  },
	  insertInto: function(newParentNode, referenceNode) {
	    this.nodes.forEach(function(node) {
	      insertBefore$2(node, referenceNode, newParentNode);
	    }, this);
	    return this;
	  },
	  remove: function() {
	    this.nodes.forEach(function(node) {
	      this.detachedContainer.appendChild(node);
	    }, this);
	  }
	};

	function createFragmentNode(startNode, nextNode, parentNode) {
	  var fragment = Object.create(fragmentPrototype);
	  var isRoot = startNode && startNode.ownerDocument === startNode.parentNode;
	  fragment.startNode = isRoot
	    ? document.createComment("")
	    : document.createTextNode("");
	  fragment.endNode = isRoot
	    ? document.createComment("")
	    : document.createTextNode("");
	  fragment.startNode.fragment = fragment;
	  fragment.endNode.fragment = fragment;
	  var detachedContainer = (fragment.detachedContainer = document.createDocumentFragment());
	  parentNode =
	    parentNode || (startNode && startNode.parentNode) || detachedContainer;
	  insertBefore$2(fragment.startNode, startNode, parentNode);
	  insertBefore$2(fragment.endNode, nextNode, parentNode);
	  return fragment;
	}

	function beginFragmentNode(startNode, parentNode) {
	  var fragment = createFragmentNode(startNode, null, parentNode);
	  fragment.___finishFragment = function(nextNode) {
	    fragment.___finishFragment = null;
	    insertBefore$2(
	      fragment.endNode,
	      nextNode,
	      parentNode || startNode.parentNode
	    );
	  };
	  return fragment;
	}

	var ___createFragmentNode = createFragmentNode;
	var ___beginFragmentNode = beginFragmentNode;

	var fragment = {
		___createFragmentNode: ___createFragmentNode,
		___beginFragmentNode: ___beginFragmentNode
	};

	var keysByDOMNode = domData.___keyByDOMNode;
	var vElementByDOMNode$1 = domData.___vElementByDOMNode;


	var createFragmentNode$1 = fragment.___createFragmentNode;

	function VFragment(key, ownerComponent, preserve) {
	  this.___VNode(null /* childCount */, ownerComponent);
	  this.___key = key;
	  this.___preserve = preserve;
	}

	VFragment.prototype = {
	  ___nodeType: 12,
	  ___actualize: function() {
	    var fragment = createFragmentNode$1();
	    keysByDOMNode.set(fragment, this.___key);
	    vElementByDOMNode$1.set(fragment, this);
	    return fragment;
	  }
	};

	inherit_1(VFragment, VNode_1);

	var VFragment_1 = VFragment;

	var parseHTML = function(html) {
	  var container = document.createElement("template");
	  parseHTML = container.content
	    ? function(html) {
	        container.innerHTML = html;
	        return container.content;
	      }
	    : function(html) {
	        container.innerHTML = html;
	        return container;
	      };

	  return parseHTML(html);
	};

	var parseHtml = function(html) {
	  return parseHTML(html).firstChild;
	};

	var defaultDocument = typeof document != "undefined" && document;
	var specialHtmlRegexp = /[&<]/;

	function virtualizeChildNodes(node, vdomParent, ownerComponent) {
	  var curChild = node.firstChild;
	  while (curChild) {
	    vdomParent.___appendChild(virtualize(curChild, ownerComponent));
	    curChild = curChild.nextSibling;
	  }
	}

	function virtualize(node, ownerComponent) {
	  switch (node.nodeType) {
	    case 1:
	      return VElement_1.___virtualize(node, virtualizeChildNodes, ownerComponent);
	    case 3:
	      return new VText_1(node.nodeValue, ownerComponent);
	    case 11:
	      var vdomDocFragment = new VDocumentFragment_1();
	      virtualizeChildNodes(node, vdomDocFragment, ownerComponent);
	      return vdomDocFragment;
	  }
	}

	function virtualizeHTML(html, doc, ownerComponent) {
	  if (!specialHtmlRegexp.test(html)) {
	    return new VText_1(html, ownerComponent);
	  }

	  var vdomFragment = new VDocumentFragment_1();
	  var curChild = parseHtml(html);

	  while (curChild) {
	    vdomFragment.___appendChild(virtualize(curChild, ownerComponent));
	    curChild = curChild.nextSibling;
	  }

	  return vdomFragment;
	}

	var Node_prototype = VNode_1.prototype;

	/**
	 * Shorthand method for creating and appending a Text node with a given value
	 * @param  {String} value The text value for the new Text node
	 */
	Node_prototype.t = function(value) {
	  var type = typeof value;
	  var vdomNode;

	  if (type !== "string") {
	    if (value == null) {
	      value = "";
	    } else if (type === "object") {
	      if (value.toHTML) {
	        vdomNode = virtualizeHTML(value.toHTML());
	      }
	    }
	  }

	  this.___appendChild(vdomNode || new VText_1(value.toString()));
	  return this.___finishChild();
	};

	Node_prototype.___appendDocumentFragment = function() {
	  return this.___appendChild(new VDocumentFragment_1());
	};

	var ___VDocumentFragment = VDocumentFragment_1;
	var ___VElement = VElement_1;
	var ___VText = VText_1;
	var ___VComponent = VComponent_1;
	var ___VFragment = VFragment_1;
	var ___virtualize = virtualize;
	var ___virtualizeHTML = virtualizeHTML;
	var ___defaultDocument = defaultDocument;

	var vdom = {
		___VDocumentFragment: ___VDocumentFragment,
		___VElement: ___VElement,
		___VText: ___VText,
		___VComponent: ___VComponent,
		___VFragment: ___VFragment,
		___virtualize: ___virtualize,
		___virtualizeHTML: ___virtualizeHTML,
		___defaultDocument: ___defaultDocument
	};

	var runtimeId = utilBrowser.___runtimeId;
	var componentLookup = utilBrowser.___componentLookup;
	var getMarkoPropsFromEl = utilBrowser.___getMarkoPropsFromEl;

	// We make our best effort to allow multiple marko runtimes to be loaded in the
	// same window. Each marko runtime will get its own unique runtime ID.
	var listenersAttachedKey = "$MDE" + runtimeId;
	var delegatedEvents = {};

	function getEventFromEl(el, eventName) {
	  var virtualProps = getMarkoPropsFromEl(el);
	  var eventInfo = virtualProps[eventName];

	  if (typeof eventInfo === "string") {
	    eventInfo = eventInfo.split(" ");
	    if (eventInfo[2]) {
	      eventInfo[2] = eventInfo[2] === "true";
	    }
	    if (eventInfo.length == 4) {
	      eventInfo[3] = parseInt(eventInfo[3], 10);
	    }
	  }

	  return eventInfo;
	}

	function delegateEvent(node, eventName, target, event) {
	  var targetMethod = target[0];
	  var targetComponentId = target[1];
	  var isOnce = target[2];
	  var extraArgs = target[3];

	  if (isOnce) {
	    var virtualProps = getMarkoPropsFromEl(node);
	    delete virtualProps[eventName];
	  }

	  var targetComponent = componentLookup[targetComponentId];

	  if (!targetComponent) {
	    return;
	  }

	  var targetFunc =
	    typeof targetMethod === "function"
	      ? targetMethod
	      : targetComponent[targetMethod];
	  if (!targetFunc) {
	    throw Error("Method not found: " + targetMethod);
	  }

	  if (extraArgs != null) {
	    if (typeof extraArgs === "number") {
	      extraArgs = targetComponent.___bubblingDomEvents[extraArgs];
	    }
	  }

	  // Invoke the component method
	  if (extraArgs) {
	    targetFunc.apply(targetComponent, extraArgs.concat(event, node));
	  } else {
	    targetFunc.call(targetComponent, event, node);
	  }
	}

	function addDelegatedEventHandler(eventType) {
	  if (!delegatedEvents[eventType]) {
	    delegatedEvents[eventType] = true;
	  }
	}

	function addDelegatedEventHandlerToDoc(eventType, doc) {
	  var body = doc.body || doc;
	  var listeners = (doc[listenersAttachedKey] = doc[listenersAttachedKey] || {});
	  if (!listeners[eventType]) {
	    body.addEventListener(
	      eventType,
	      (listeners[eventType] = function(event) {
	        var propagationStopped = false;

	        // Monkey-patch to fix #97
	        var oldStopPropagation = event.stopPropagation;

	        event.stopPropagation = function() {
	          oldStopPropagation.call(event);
	          propagationStopped = true;
	        };

	        var curNode = event.target;
	        if (!curNode) {
	          return;
	        }

	        // event.target of an SVGElementInstance does not have a
	        // `getAttribute` function in IE 11.
	        // See https://github.com/marko-js/marko/issues/796
	        curNode = curNode.correspondingUseElement || curNode;

	        // Search up the tree looking DOM events mapped to target
	        // component methods
	        var propName = "on" + eventType;
	        var target;

	        // Attributes will have the following form:
	        // on<event_type>("<target_method>|<component_id>")

	        do {
	          if ((target = getEventFromEl(curNode, propName))) {
	            delegateEvent(curNode, propName, target, event);

	            if (propagationStopped) {
	              break;
	            }
	          }
	        } while ((curNode = curNode.parentNode) && curNode.getAttribute);
	      }),
	      true
	    );
	  }
	}

	function noop() {}

	var ___handleNodeAttach = noop;
	var ___handleNodeDetach = noop;
	var ___delegateEvent = delegateEvent;
	var ___getEventFromEl = getEventFromEl;
	var ___addDelegatedEventHandler = addDelegatedEventHandler;
	var ___init = function(doc) {
	  Object.keys(delegatedEvents).forEach(function(eventType) {
	    addDelegatedEventHandlerToDoc(eventType, doc);
	  });
	};

	var eventDelegation = {
		___handleNodeAttach: ___handleNodeAttach,
		___handleNodeDetach: ___handleNodeDetach,
		___delegateEvent: ___delegateEvent,
		___getEventFromEl: ___getEventFromEl,
		___addDelegatedEventHandler: ___addDelegatedEventHandler,
		___init: ___init
	};

	var existingComponentLookup = utilBrowser.___componentLookup;
	var destroyNodeRecursive$1 = utilBrowser.___destroyNodeRecursive;
	var addComponentRootToKeyedElements =
	  utilBrowser.___addComponentRootToKeyedElements;
	var normalizeComponentKey = utilBrowser.___normalizeComponentKey;
	var VElement$1 = vdom.___VElement;
	var virtualizeElement$1 = VElement$1.___virtualize;
	var morphAttrs = VElement$1.___morphAttrs;




	var keysByDOMNode$1 = domData.___keyByDOMNode;
	var componentByDOMNode = domData.___componentByDOMNode;
	var vElementByDOMNode$2 = domData.___vElementByDOMNode;
	var detachedByDOMNode = domData.___detachedByDOMNode;

	var insertBefore$3 = helpers.___insertBefore;
	var insertAfter$2 = helpers.___insertAfter;
	var nextSibling$1 = helpers.___nextSibling;
	var firstChild$1 = helpers.___firstChild;
	var removeChild$2 = helpers.___removeChild;
	var createFragmentNode$2 = fragment.___createFragmentNode;
	var beginFragmentNode$1 = fragment.___beginFragmentNode;

	var ELEMENT_NODE = 1;
	var TEXT_NODE = 3;
	var COMMENT_NODE = 8;
	var COMPONENT_NODE = 2;
	var FRAGMENT_NODE = 12;
	var DOCTYPE_NODE = 10;

	// var FLAG_SIMPLE_ATTRS = 1;
	// var FLAG_CUSTOM_ELEMENT = 2;
	// var FLAG_SPREAD_ATTRS = 4;

	function isAutoKey(key) {
	  return key[0] !== "@";
	}

	function compareNodeNames(fromEl, toEl) {
	  return fromEl.___nodeName === toEl.___nodeName;
	}

	function caseInsensitiveCompare(a, b) {
	  return a.toLowerCase() === b.toLowerCase();
	}

	function onNodeAdded(node, componentsContext) {
	  if (node.nodeType === ELEMENT_NODE) {
	    eventDelegation.___handleNodeAttach(node, componentsContext);
	  }
	}

	function morphdom(fromNode, toNode, doc, componentsContext) {
	  var globalComponentsContext;
	  var isHydrate = false;
	  var keySequences = Object.create(null);

	  if (componentsContext) {
	    globalComponentsContext = componentsContext.___globalContext;
	    isHydrate = globalComponentsContext.___isHydrate;
	  }

	  function insertVirtualNodeBefore(
	    vNode,
	    key,
	    referenceEl,
	    parentEl,
	    ownerComponent,
	    parentComponent
	  ) {
	    var realNode = vNode.___actualize(doc, parentEl.namespaceURI);
	    insertBefore$3(realNode, referenceEl, parentEl);

	    if (
	      vNode.___nodeType === ELEMENT_NODE ||
	      vNode.___nodeType === FRAGMENT_NODE
	    ) {
	      if (key) {
	        keysByDOMNode$1.set(realNode, key);
	        (isAutoKey(key) ? parentComponent : ownerComponent).___keyedElements[
	          key
	        ] = realNode;
	      }

	      if (vNode.___nodeName !== "textarea") {
	        morphChildren(realNode, vNode, parentComponent);
	      }

	      onNodeAdded(realNode, componentsContext);
	    }
	  }

	  function insertVirtualComponentBefore(
	    vComponent,
	    referenceNode,
	    referenceNodeParentEl,
	    component,
	    key,
	    ownerComponent,
	    parentComponent
	  ) {
	    var rootNode = (component.___rootNode = insertBefore$3(
	      createFragmentNode$2(),
	      referenceNode,
	      referenceNodeParentEl
	    ));
	    componentByDOMNode.set(rootNode, component);

	    if (key && ownerComponent) {
	      key = normalizeComponentKey(key, parentComponent.id);
	      addComponentRootToKeyedElements(
	        ownerComponent.___keyedElements,
	        key,
	        rootNode,
	        component.id
	      );
	      keysByDOMNode$1.set(rootNode, key);
	    }

	    morphComponent(component, vComponent);
	  }

	  function morphComponent(component, vComponent) {
	    morphChildren(component.___rootNode, vComponent, component);
	  }

	  var detachedNodes = [];

	  function detachNode(node, parentNode, ownerComponent) {
	    if (node.nodeType === ELEMENT_NODE || node.nodeType === FRAGMENT_NODE) {
	      detachedNodes.push(node);
	      detachedByDOMNode.set(node, ownerComponent || true);
	    } else {
	      destroyNodeRecursive$1(node);
	      removeChild$2(node);
	    }
	  }

	  function destroyComponent(component) {
	    component.destroy();
	  }

	  function morphChildren(fromNode, toNode, parentComponent) {
	    var curFromNodeChild = firstChild$1(fromNode);
	    var curToNodeChild = toNode.___firstChild;

	    var curToNodeKey;
	    var curFromNodeKey;
	    var curToNodeType;

	    var fromNextSibling;
	    var toNextSibling;
	    var matchingFromEl;
	    var matchingFromComponent;
	    var curVFromNodeChild;
	    var fromComponent;

	    outer: while (curToNodeChild) {
	      toNextSibling = curToNodeChild.___nextSibling;
	      curToNodeType = curToNodeChild.___nodeType;
	      curToNodeKey = curToNodeChild.___key;

	      // Skip <!doctype>
	      if (curFromNodeChild && curFromNodeChild.nodeType === DOCTYPE_NODE) {
	        curFromNodeChild = nextSibling$1(curFromNodeChild);
	      }

	      var ownerComponent = curToNodeChild.___ownerComponent || parentComponent;
	      var referenceComponent;

	      if (curToNodeType === COMPONENT_NODE) {
	        var component = curToNodeChild.___component;
	        if (
	          (matchingFromComponent = existingComponentLookup[component.id]) ===
	          undefined
	        ) {
	          if (isHydrate === true) {
	            var rootNode = beginFragmentNode$1(curFromNodeChild, fromNode);
	            component.___rootNode = rootNode;
	            componentByDOMNode.set(rootNode, component);

	            if (ownerComponent && curToNodeKey) {
	              curToNodeKey = normalizeComponentKey(
	                curToNodeKey,
	                parentComponent.id
	              );
	              addComponentRootToKeyedElements(
	                ownerComponent.___keyedElements,
	                curToNodeKey,
	                rootNode,
	                component.id
	              );

	              keysByDOMNode$1.set(rootNode, curToNodeKey);
	            }

	            morphComponent(component, curToNodeChild);

	            curFromNodeChild = nextSibling$1(rootNode);
	          } else {
	            insertVirtualComponentBefore(
	              curToNodeChild,
	              curFromNodeChild,
	              fromNode,
	              component,
	              curToNodeKey,
	              ownerComponent,
	              parentComponent
	            );
	          }
	        } else {
	          if (matchingFromComponent.___rootNode !== curFromNodeChild) {
	            if (
	              curFromNodeChild &&
	              (fromComponent = componentByDOMNode.get(curFromNodeChild)) &&
	              globalComponentsContext.___renderedComponentsById[
	                fromComponent.id
	              ] === undefined
	            ) {
	              // The component associated with the current real DOM node was not rendered
	              // so we should just remove it out of the real DOM by destroying it
	              curFromNodeChild = nextSibling$1(fromComponent.___rootNode);
	              destroyComponent(fromComponent);
	              continue;
	            }

	            // We need to move the existing component into
	            // the correct location
	            insertBefore$3(
	              matchingFromComponent.___rootNode,
	              curFromNodeChild,
	              fromNode
	            );
	          } else {
	            curFromNodeChild =
	              curFromNodeChild && nextSibling$1(curFromNodeChild);
	          }

	          if (!curToNodeChild.___preserve) {
	            morphComponent(component, curToNodeChild);
	          }
	        }

	        curToNodeChild = toNextSibling;
	        continue;
	      } else if (curToNodeKey) {
	        curVFromNodeChild = undefined;
	        curFromNodeKey = undefined;
	        var curToNodeKeyOriginal = curToNodeKey;

	        if (isAutoKey(curToNodeKey)) {
	          if (ownerComponent !== parentComponent) {
	            curToNodeKey += ":" + ownerComponent.id;
	          }
	          referenceComponent = parentComponent;
	        } else {
	          referenceComponent = ownerComponent;
	        }

	        // We have a keyed element. This is the fast path for matching
	        // up elements
	        curToNodeKey = (
	          keySequences[referenceComponent.id] ||
	          (keySequences[referenceComponent.id] = new KeySequence_1())
	        ).___nextKey(curToNodeKey);

	        if (curFromNodeChild) {
	          curFromNodeKey = keysByDOMNode$1.get(curFromNodeChild);
	          curVFromNodeChild = vElementByDOMNode$2.get(curFromNodeChild);
	          fromNextSibling = nextSibling$1(curFromNodeChild);
	        }

	        if (curFromNodeKey === curToNodeKey) {
	          // Elements line up. Now we just have to make sure they are compatible
	          if (!curToNodeChild.___preserve) {
	            // We just skip over the fromNode if it is preserved

	            if (compareNodeNames(curToNodeChild, curVFromNodeChild)) {
	              morphEl(
	                curFromNodeChild,
	                curVFromNodeChild,
	                curToNodeChild,
	                parentComponent
	              );
	            } else {
	              // Remove the old node
	              detachNode(curFromNodeChild, fromNode, ownerComponent);

	              // Incompatible nodes. Just move the target VNode into the DOM at this position
	              insertVirtualNodeBefore(
	                curToNodeChild,
	                curToNodeKey,
	                curFromNodeChild,
	                fromNode,
	                ownerComponent,
	                parentComponent
	              );
	            }
	          }
	        } else {
	          matchingFromEl = referenceComponent.___keyedElements[curToNodeKey];
	          if (
	            matchingFromEl === undefined ||
	            matchingFromEl === curFromNodeChild
	          ) {
	            if (isHydrate === true && curFromNodeChild) {
	              if (
	                curFromNodeChild.nodeType === ELEMENT_NODE &&
	                (curToNodeChild.___preserve ||
	                  caseInsensitiveCompare(
	                    curFromNodeChild.nodeName,
	                    curToNodeChild.___nodeName || ""
	                  ))
	              ) {
	                curVFromNodeChild = virtualizeElement$1(curFromNodeChild);
	                curVFromNodeChild.___nodeName = curToNodeChild.___nodeName;
	                keysByDOMNode$1.set(curFromNodeChild, curToNodeKey);
	                referenceComponent.___keyedElements[
	                  curToNodeKey
	                ] = curFromNodeChild;

	                if (curToNodeChild.___preserve) {
	                  vElementByDOMNode$2.set(curFromNodeChild, curVFromNodeChild);
	                } else {
	                  morphEl(
	                    curFromNodeChild,
	                    curVFromNodeChild,
	                    curToNodeChild,
	                    parentComponent
	                  );
	                }

	                curToNodeChild = toNextSibling;
	                curFromNodeChild = fromNextSibling;
	                continue;
	              } else if (
	                curToNodeChild.___nodeType === FRAGMENT_NODE &&
	                curFromNodeChild.nodeType === COMMENT_NODE
	              ) {
	                var content = curFromNodeChild.nodeValue;
	                if (content == "F#" + curToNodeKeyOriginal) {
	                  var endNode = curFromNodeChild.nextSibling;
	                  var depth = 0;
	                  var nodeValue;

	                  // eslint-disable-next-line no-constant-condition
	                  while (true) {
	                    if (endNode.nodeType === COMMENT_NODE) {
	                      nodeValue = endNode.nodeValue;
	                      if (nodeValue === "F/") {
	                        if (depth === 0) {
	                          break;
	                        } else {
	                          depth--;
	                        }
	                      } else if (nodeValue.indexOf("F#") === 0) {
	                        depth++;
	                      }
	                    }
	                    endNode = endNode.nextSibling;
	                  }

	                  var fragment = createFragmentNode$2(
	                    curFromNodeChild,
	                    endNode.nextSibling,
	                    fromNode
	                  );
	                  keysByDOMNode$1.set(fragment, curToNodeKey);
	                  vElementByDOMNode$2.set(fragment, curToNodeChild);
	                  referenceComponent.___keyedElements[curToNodeKey] = fragment;
	                  removeChild$2(curFromNodeChild);
	                  removeChild$2(endNode);

	                  if (!curToNodeChild.___preserve) {
	                    morphChildren(fragment, curToNodeChild, parentComponent);
	                  }

	                  curToNodeChild = toNextSibling;
	                  curFromNodeChild = fragment.nextSibling;
	                  continue;
	                }
	              }
	            }

	            insertVirtualNodeBefore(
	              curToNodeChild,
	              curToNodeKey,
	              curFromNodeChild,
	              fromNode,
	              ownerComponent,
	              parentComponent
	            );
	            fromNextSibling = curFromNodeChild;
	          } else {
	            if (detachedByDOMNode.get(matchingFromEl) !== undefined) {
	              detachedByDOMNode.set(matchingFromEl, undefined);
	            }

	            if (!curToNodeChild.___preserve) {
	              curVFromNodeChild = vElementByDOMNode$2.get(matchingFromEl);

	              if (compareNodeNames(curVFromNodeChild, curToNodeChild)) {
	                if (fromNextSibling === matchingFromEl) {
	                  // Single element removal:
	                  // A <-> A
	                  // B <-> C <-- We are here
	                  // C     D
	                  // D
	                  //
	                  // Single element swap:
	                  // A <-> A
	                  // B <-> C <-- We are here
	                  // C     B

	                  if (
	                    toNextSibling &&
	                    toNextSibling.___key === curFromNodeKey
	                  ) {
	                    // Single element swap

	                    // We want to stay on the current real DOM node
	                    fromNextSibling = curFromNodeChild;

	                    // But move the matching element into place
	                    insertBefore$3(matchingFromEl, curFromNodeChild, fromNode);
	                  } else {
	                    // Single element removal

	                    // We need to remove the current real DOM node
	                    // and the matching real DOM node will fall into
	                    // place. We will continue diffing with next sibling
	                    // after the real DOM node that just fell into place
	                    fromNextSibling = nextSibling$1(fromNextSibling);

	                    if (curFromNodeChild) {
	                      detachNode(curFromNodeChild, fromNode, ownerComponent);
	                    }
	                  }
	                } else {
	                  // A <-> A
	                  // B <-> D <-- We are here
	                  // C
	                  // D

	                  // We need to move the matching node into place
	                  insertAfter$2(matchingFromEl, curFromNodeChild, fromNode);

	                  if (curFromNodeChild) {
	                    detachNode(curFromNodeChild, fromNode, ownerComponent);
	                  }
	                }

	                morphEl(
	                  matchingFromEl,
	                  curVFromNodeChild,
	                  curToNodeChild,
	                  parentComponent
	                );
	              } else {
	                insertVirtualNodeBefore(
	                  curToNodeChild,
	                  curToNodeKey,
	                  curFromNodeChild,
	                  fromNode,
	                  ownerComponent,
	                  parentComponent
	                );
	                detachNode(matchingFromEl, fromNode, ownerComponent);
	              }
	            } else {
	              // preserve the node
	              // but still we need to diff the current from node
	              insertBefore$3(matchingFromEl, curFromNodeChild, fromNode);
	              fromNextSibling = curFromNodeChild;
	            }
	          }
	        }

	        curToNodeChild = toNextSibling;
	        curFromNodeChild = fromNextSibling;
	        continue;
	      }

	      // The know the target node is not a VComponent node and we know
	      // it is also not a preserve node. Let's now match up the HTML
	      // element, text node, comment, etc.
	      while (curFromNodeChild) {
	        fromNextSibling = nextSibling$1(curFromNodeChild);

	        if ((fromComponent = componentByDOMNode.get(curFromNodeChild))) {
	          // The current "to" element is not associated with a component,
	          // but the current "from" element is associated with a component

	          // Even if we destroy the current component in the original
	          // DOM or not, we still need to skip over it since it is
	          // not compatible with the current "to" node
	          curFromNodeChild = fromNextSibling;

	          if (
	            !globalComponentsContext.___renderedComponentsById[fromComponent.id]
	          ) {
	            destroyComponent(fromComponent);
	          }

	          continue; // Move to the next "from" node
	        }

	        var curFromNodeType = curFromNodeChild.nodeType;

	        var isCompatible = undefined;

	        if (curFromNodeType === curToNodeType) {
	          if (curFromNodeType === ELEMENT_NODE) {
	            // Both nodes being compared are Element nodes
	            curVFromNodeChild = vElementByDOMNode$2.get(curFromNodeChild);
	            if (curVFromNodeChild === undefined) {
	              if (isHydrate === true) {
	                curVFromNodeChild = virtualizeElement$1(curFromNodeChild);

	                if (
	                  caseInsensitiveCompare(
	                    curVFromNodeChild.___nodeName,
	                    curToNodeChild.___nodeName
	                  )
	                ) {
	                  curVFromNodeChild.___nodeName = curToNodeChild.___nodeName;
	                }
	              } else {
	                // Skip over nodes that don't look like ours...
	                curFromNodeChild = fromNextSibling;
	                continue;
	              }
	            } else if ((curFromNodeKey = curVFromNodeChild.___key)) {
	              // We have a keyed element here but our target VDOM node
	              // is not keyed so this not doesn't belong
	              isCompatible = false;
	            }

	            isCompatible =
	              isCompatible !== false &&
	              compareNodeNames(curVFromNodeChild, curToNodeChild) === true;

	            if (isCompatible === true) {
	              // We found compatible DOM elements so transform
	              // the current "from" node to match the current
	              // target DOM node.
	              morphEl(
	                curFromNodeChild,
	                curVFromNodeChild,
	                curToNodeChild,
	                parentComponent
	              );
	            }
	          } else if (
	            curFromNodeType === TEXT_NODE ||
	            curFromNodeType === COMMENT_NODE
	          ) {
	            // Both nodes being compared are Text or Comment nodes
	            isCompatible = true;
	            // Simply update nodeValue on the original node to
	            // change the text value
	            if (curFromNodeChild.nodeValue !== curToNodeChild.___nodeValue) {
	              curFromNodeChild.nodeValue = curToNodeChild.___nodeValue;
	            }
	          }
	        }

	        if (isCompatible === true) {
	          // Advance both the "to" child and the "from" child since we found a match
	          curToNodeChild = toNextSibling;
	          curFromNodeChild = fromNextSibling;
	          continue outer;
	        }

	        detachNode(curFromNodeChild, fromNode, ownerComponent);
	        curFromNodeChild = fromNextSibling;
	      } // END: while (curFromNodeChild)

	      // If we got this far then we did not find a candidate match for
	      // our "to node" and we exhausted all of the children "from"
	      // nodes. Therefore, we will just append the current "to" node
	      // to the end
	      insertVirtualNodeBefore(
	        curToNodeChild,
	        curToNodeKey,
	        curFromNodeChild,
	        fromNode,
	        ownerComponent,
	        parentComponent
	      );

	      curToNodeChild = toNextSibling;
	      curFromNodeChild = fromNextSibling;
	    }

	    // We have processed all of the "to nodes".
	    if (fromNode.___finishFragment) {
	      // If we are in an unfinished fragment, we have reached the end of the nodes
	      // we were matching up and need to end the fragment
	      fromNode.___finishFragment(curFromNodeChild);
	    } else {
	      // If curFromNodeChild is non-null then we still have some from nodes
	      // left over that need to be removed
	      var fragmentBoundary =
	        fromNode.nodeType === FRAGMENT_NODE ? fromNode.endNode : null;

	      while (curFromNodeChild && curFromNodeChild !== fragmentBoundary) {
	        fromNextSibling = nextSibling$1(curFromNodeChild);

	        if ((fromComponent = componentByDOMNode.get(curFromNodeChild))) {
	          curFromNodeChild = fromNextSibling;
	          if (
	            !globalComponentsContext.___renderedComponentsById[fromComponent.id]
	          ) {
	            destroyComponent(fromComponent);
	          }
	          continue;
	        }

	        curVFromNodeChild = vElementByDOMNode$2.get(curFromNodeChild);
	        curFromNodeKey = keysByDOMNode$1.get(fromNode);

	        // For transcluded content, we need to check if the element belongs to a different component
	        // context than the current component and ensure it gets removed from its key index.
	        if (!curFromNodeKey || isAutoKey(curFromNodeKey)) {
	          referenceComponent = parentComponent;
	        } else {
	          referenceComponent =
	            curVFromNodeChild && curVFromNodeChild.___ownerComponent;
	        }

	        detachNode(curFromNodeChild, fromNode, referenceComponent);

	        curFromNodeChild = fromNextSibling;
	      }
	    }
	  }

	  function morphEl(fromEl, vFromEl, toEl, parentComponent) {
	    var nodeName = toEl.___nodeName;

	    var constId = toEl.___constId;
	    if (constId !== undefined && vFromEl.___constId === constId) {
	      return;
	    }

	    morphAttrs(fromEl, vFromEl, toEl);

	    if (toEl.___preserveBody) {
	      return;
	    }

	    if (nodeName !== "textarea") {
	      morphChildren(fromEl, toEl, parentComponent);
	    }

	    var specialElHandler = specialElHandlers[nodeName];
	    if (specialElHandler !== undefined) {
	      specialElHandler(fromEl, toEl);
	    }
	  } // END: morphEl(...)

	  // eslint-disable-next-line no-constant-condition
	  {
	    utilBrowser.___stopDOMManipulationWarning();
	  }

	  morphChildren(fromNode, toNode, toNode.___component);

	  detachedNodes.forEach(function(node) {
	    var detachedFromComponent = detachedByDOMNode.get(node);

	    if (detachedFromComponent !== undefined) {
	      detachedByDOMNode.set(node, undefined);

	      var componentToDestroy = componentByDOMNode.get(node);
	      if (componentToDestroy) {
	        componentToDestroy.destroy();
	      } else if (node.parentNode) {
	        destroyNodeRecursive$1(
	          node,
	          detachedFromComponent !== true && detachedFromComponent
	        );

	        if (eventDelegation.___handleNodeDetach(node) != false) {
	          removeChild$2(node);
	        }
	      }
	    }
	  });

	  // eslint-disable-next-line no-constant-condition
	  {
	    utilBrowser.___startDOMManipulationWarning();
	  }
	}

	var morphdom_1 = morphdom;

	/* jshint newcap:false */

	var complain$1 =  complain_1;



	var getComponentsContext = ComponentsContext_1
	  .___getComponentsContext;

	var componentLookup$1 = utilBrowser.___componentLookup;
	var destroyNodeRecursive$2 = utilBrowser.___destroyNodeRecursive;








	var componentsByDOMNode = domData.___componentByDOMNode;
	var keyedElementsByComponentId = domData.___ssrKeyedElementsByComponentId;
	var CONTEXT_KEY = "__subtree_context__";

	var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
	var slice$1 = Array.prototype.slice;

	var COMPONENT_SUBSCRIBE_TO_OPTIONS;
	var NON_COMPONENT_SUBSCRIBE_TO_OPTIONS = {
	  addDestroyListener: false
	};

	var emit = src.prototype.emit;
	var ELEMENT_NODE$1 = 1;

	function removeListener(removeEventListenerHandle) {
	  removeEventListenerHandle();
	}

	function walkFragments(fragment) {
	  var node;

	  while (fragment) {
	    node = fragment.firstChild;

	    if (!node) {
	      break;
	    }

	    fragment = node.fragment;
	  }

	  return node;
	}

	function handleCustomEventWithMethodListener(
	  component,
	  targetMethodName,
	  args,
	  extraArgs
	) {
	  // Remove the "eventType" argument
	  args.push(component);

	  if (extraArgs) {
	    args = extraArgs.concat(args);
	  }

	  var targetComponent = componentLookup$1[component.___scope];
	  var targetMethod =
	    typeof targetMethodName === "function"
	      ? targetMethodName
	      : targetComponent[targetMethodName];
	  if (!targetMethod) {
	    throw Error("Method not found: " + targetMethodName);
	  }

	  targetMethod.apply(targetComponent, args);
	}

	function resolveKeyHelper(key, index) {
	  return index ? key + "_" + index : key;
	}

	function resolveComponentIdHelper(component, key, index) {
	  return component.id + "-" + resolveKeyHelper(key, index);
	}

	/**
	 * This method is used to process "update_<stateName>" handler functions.
	 * If all of the modified state properties have a user provided update handler
	 * then a rerender will be bypassed and, instead, the DOM will be updated
	 * looping over and invoking the custom update handlers.
	 * @return {boolean} Returns true if if the DOM was updated. False, otherwise.
	 */
	function processUpdateHandlers(component, stateChanges, oldState) {
	  var handlerMethod;
	  var handlers;

	  for (var propName in stateChanges) {
	    if (hasOwnProperty$1.call(stateChanges, propName)) {
	      var handlerMethodName = "update_" + propName;

	      handlerMethod = component[handlerMethodName];
	      if (handlerMethod) {
	        (handlers || (handlers = [])).push([propName, handlerMethod]);
	      } else {
	        // This state change does not have a state handler so return false
	        // to force a rerender
	        return;
	      }
	    }
	  }

	  // If we got here then all of the changed state properties have
	  // an update handler or there are no state properties that actually
	  // changed.
	  if (handlers) {
	    // Otherwise, there are handlers for all of the changed properties
	    // so apply the updates using those handlers

	    handlers.forEach(function(handler) {
	      var propertyName = handler[0];
	      handlerMethod = handler[1];

	      var newValue = stateChanges[propertyName];
	      var oldValue = oldState[propertyName];
	      handlerMethod.call(component, newValue, oldValue);
	    });

	    component.___emitUpdate();
	    component.___reset();
	  }

	  return true;
	}

	function checkInputChanged(existingComponent, oldInput, newInput) {
	  if (oldInput != newInput) {
	    if (oldInput == null || newInput == null) {
	      return true;
	    }

	    var oldKeys = Object.keys(oldInput);
	    var newKeys = Object.keys(newInput);
	    var len = oldKeys.length;
	    if (len !== newKeys.length) {
	      return true;
	    }

	    for (var i = len; i--; ) {
	      var key = oldKeys[i];
	      if (!(key in newInput && oldInput[key] === newInput[key])) {
	        return true;
	      }
	    }
	  }

	  return false;
	}

	var componentProto;

	/**
	 * Base component type.
	 *
	 * NOTE: Any methods that are prefixed with an underscore should be considered private!
	 */
	function Component(id) {
	  src.call(this);
	  this.id = id;
	  this.___state = null;
	  this.___rootNode = null;
	  this.___subscriptions = null;
	  this.___domEventListenerHandles = null;
	  this.___bubblingDomEvents = null; // Used to keep track of bubbling DOM events for components rendered on the server
	  this.___customEvents = null;
	  this.___scope = null;
	  this.___renderInput = null;
	  this.___input = undefined;
	  this.___mounted = false;
	  this.___global = undefined;
	  this.___destroyed = false;
	  this.___updateQueued = false;
	  this.___dirty = false;
	  this.___settingInput = false;
	  this.___document = undefined;

	  var ssrKeyedElements = keyedElementsByComponentId[id];

	  if (ssrKeyedElements) {
	    this.___keyedElements = ssrKeyedElements;
	    delete keyedElementsByComponentId[id];
	  } else {
	    this.___keyedElements = {};
	  }
	}

	Component.prototype = componentProto = {
	  ___isComponent: true,

	  subscribeTo: function(target) {
	    if (!target) {
	      throw TypeError();
	    }

	    var subscriptions =
	      this.___subscriptions ||
	      (this.___subscriptions = new listenerTracker());

	    var subscribeToOptions = target.___isComponent
	      ? COMPONENT_SUBSCRIBE_TO_OPTIONS
	      : NON_COMPONENT_SUBSCRIBE_TO_OPTIONS;

	    return subscriptions.subscribeTo(target, subscribeToOptions);
	  },

	  emit: function(eventType) {
	    var customEvents = this.___customEvents;
	    var target;

	    if (customEvents && (target = customEvents[eventType])) {
	      var targetMethodName = target[0];
	      var isOnce = target[1];
	      var extraArgs = target[2];
	      var args = slice$1.call(arguments, 1);

	      handleCustomEventWithMethodListener(
	        this,
	        targetMethodName,
	        args,
	        extraArgs
	      );

	      if (isOnce) {
	        delete customEvents[eventType];
	      }
	    }

	    return emit.apply(this, arguments);
	  },
	  getElId: function(key, index) {
	    if (!key) {
	      return this.id;
	    }
	    return resolveComponentIdHelper(this, key, index);
	  },
	  getEl: function(key, index) {
	    if (key) {
	      var keyedElement = this.___keyedElements[
	        "@" + resolveKeyHelper(key, index)
	      ];

	      // eslint-disable-next-line no-constant-condition
	      {
	        if (
	          keyedElement &&
	          keyedElement.nodeType !== 1 /* Node.ELEMENT_NODE */
	        ) {
	          throw new Error(
	            "Using 'getEl(key)' to get a component instance is not supported, did you mean 'getComponent(key)'?"
	          );
	        }
	      }

	      return keyedElement;
	    } else {
	      return this.el;
	    }
	  },
	  getEls: function(key) {
	    key = key + "[]";

	    var els = [];
	    var i = 0;
	    var el;
	    while ((el = this.getEl(key, i))) {
	      els.push(el);
	      i++;
	    }
	    return els;
	  },
	  getComponent: function(key, index) {
	    var rootNode = this.___keyedElements["@" + resolveKeyHelper(key, index)];
	    // eslint-disable-next-line no-constant-condition
	    {
	      if (/\[\]$/.test(key)) {
	        throw new Error(
	          "A repeated key[] was passed to getComponent. Use a non-repeating key if there is only one of these components."
	        );
	      }
	    }

	    return rootNode && componentsByDOMNode.get(rootNode);
	  },
	  getComponents: function(key) {
	    var lookup = this.___keyedElements["@" + key + "[]"];
	    return lookup
	      ? Object.keys(lookup)
	          .map(function(key) {
	            return componentsByDOMNode.get(lookup[key]);
	          })
	          .filter(Boolean)
	      : [];
	  },
	  destroy: function() {
	    if (this.___destroyed) {
	      return;
	    }

	    var root = this.___rootNode;

	    this.___destroyShallow();

	    var nodes = root.nodes;

	    nodes.forEach(function(node) {
	      destroyNodeRecursive$2(node);

	      if (eventDelegation.___handleNodeDetach(node) !== false) {
	        node.parentNode.removeChild(node);
	      }
	    });

	    root.detached = true;

	    delete componentLookup$1[this.id];
	    this.___keyedElements = {};
	  },

	  ___destroyShallow: function() {
	    if (this.___destroyed) {
	      return;
	    }

	    this.___emitDestroy();
	    this.___destroyed = true;

	    componentsByDOMNode.set(this.___rootNode, undefined);

	    this.___rootNode = null;

	    // Unsubscribe from all DOM events
	    this.___removeDOMEventListeners();

	    var subscriptions = this.___subscriptions;
	    if (subscriptions) {
	      subscriptions.removeAllListeners();
	      this.___subscriptions = null;
	    }
	  },

	  isDestroyed: function() {
	    return this.___destroyed;
	  },
	  get state() {
	    return this.___state;
	  },
	  set state(newState) {
	    var state = this.___state;
	    if (!state && !newState) {
	      return;
	    }

	    if (!state) {
	      state = this.___state = new this.___State(this);
	    }

	    state.___replace(newState || {});

	    if (state.___dirty) {
	      this.___queueUpdate();
	    }

	    if (!newState) {
	      this.___state = null;
	    }
	  },
	  setState: function(name, value) {
	    var state = this.___state;

	    if (!state) {
	      state = this.___state = new this.___State(this);
	    }
	    if (typeof name == "object") {
	      // Merge in the new state with the old state
	      var newState = name;
	      for (var k in newState) {
	        if (hasOwnProperty$1.call(newState, k)) {
	          state.___set(k, newState[k], true /* ensure:true */);
	        }
	      }
	    } else {
	      state.___set(name, value, true /* ensure:true */);
	    }
	  },

	  setStateDirty: function(name, value) {
	    var state = this.___state;

	    if (arguments.length == 1) {
	      value = state[name];
	    }

	    state.___set(
	      name,
	      value,
	      true /* ensure:true */,
	      true /* forceDirty:true */
	    );
	  },

	  replaceState: function(newState) {
	    this.___state.___replace(newState);
	  },

	  get input() {
	    return this.___input;
	  },
	  set input(newInput) {
	    if (this.___settingInput) {
	      this.___input = newInput;
	    } else {
	      this.___setInput(newInput);
	    }
	  },

	  ___setInput: function(newInput, onInput, out) {
	    onInput = onInput || this.onInput;
	    var updatedInput;

	    var oldInput = this.___input;
	    this.___input = undefined;
	    this.___context = (out && out[CONTEXT_KEY]) || this.___context;

	    if (onInput) {
	      // We need to set a flag to preview `this.input = foo` inside
	      // onInput causing infinite recursion
	      this.___settingInput = true;
	      updatedInput = onInput.call(this, newInput || {}, out);
	      this.___settingInput = false;
	    }

	    newInput = this.___renderInput = updatedInput || newInput;

	    if ((this.___dirty = checkInputChanged(this, oldInput, newInput))) {
	      this.___queueUpdate();
	    }

	    if (this.___input === undefined) {
	      this.___input = newInput;
	      if (newInput && newInput.$global) {
	        this.___global = newInput.$global;
	      }
	    }

	    return newInput;
	  },

	  forceUpdate: function() {
	    this.___dirty = true;
	    this.___queueUpdate();
	  },

	  ___queueUpdate: function() {
	    if (!this.___updateQueued) {
	      this.___updateQueued = true;
	      updateManager.___queueComponentUpdate(this);
	    }
	  },

	  update: function() {
	    if (this.___destroyed === true || this.___isDirty === false) {
	      return;
	    }

	    var input = this.___input;
	    var state = this.___state;

	    if (this.___dirty === false && state !== null && state.___dirty === true) {
	      if (processUpdateHandlers(this, state.___changes, state.___old)) {
	        state.___dirty = false;
	      }
	    }

	    if (this.___isDirty === true) {
	      // The UI component is still dirty after process state handlers
	      // then we should rerender

	      if (this.shouldUpdate(input, state) !== false) {
	        this.___scheduleRerender();
	      }
	    }

	    this.___reset();
	  },

	  get ___isDirty() {
	    return (
	      this.___dirty === true ||
	      (this.___state !== null && this.___state.___dirty === true)
	    );
	  },

	  ___reset: function() {
	    this.___dirty = false;
	    this.___updateQueued = false;
	    this.___renderInput = null;
	    var state = this.___state;
	    if (state) {
	      state.___reset();
	    }
	  },

	  shouldUpdate: function() {
	    return true;
	  },

	  ___scheduleRerender: function() {
	    var self = this;
	    var renderer = self.___renderer;

	    if (!renderer) {
	      throw TypeError();
	    }

	    var input = this.___renderInput || this.___input;

	    updateManager.___batchUpdate(function() {
	      self.___rerender(input, false).afterInsert(self.___document);
	    });

	    this.___reset();
	  },

	  ___rerender: function(input, isHydrate) {
	    var doc = this.___document;
	    var globalData = this.___global;
	    var rootNode = this.___rootNode;
	    var renderer = this.___renderer;
	    var createOut = renderer.createOut || createOut_1;
	    var out = createOut(globalData);
	    out.sync();
	    out.___document = this.___document;
	    out[CONTEXT_KEY] = this.___context;

	    var componentsContext = getComponentsContext(out);
	    var globalComponentsContext = componentsContext.___globalContext;
	    globalComponentsContext.___rerenderComponent = this;
	    globalComponentsContext.___isHydrate = isHydrate;

	    renderer(input, out);

	    var result = new RenderResult_1(out);

	    var targetNode = out.___getOutput().___firstChild;

	    morphdom_1(rootNode, targetNode, doc, componentsContext);

	    return result;
	  },

	  ___detach: function() {
	    var root = this.___rootNode;
	    root.remove();
	    return root;
	  },

	  ___removeDOMEventListeners: function() {
	    var eventListenerHandles = this.___domEventListenerHandles;
	    if (eventListenerHandles) {
	      eventListenerHandles.forEach(removeListener);
	      this.___domEventListenerHandles = null;
	    }
	  },

	  get ___rawState() {
	    var state = this.___state;
	    return state && state.___raw;
	  },

	  ___setCustomEvents: function(customEvents, scope) {
	    var finalCustomEvents = (this.___customEvents = {});
	    this.___scope = scope;

	    customEvents.forEach(function(customEvent) {
	      var eventType = customEvent[0];
	      var targetMethodName = customEvent[1];
	      var isOnce = customEvent[2];
	      var extraArgs = customEvent[3];

	      finalCustomEvents[eventType] = [targetMethodName, isOnce, extraArgs];
	    });
	  },

	  get el() {
	    return walkFragments(this.___rootNode);
	  },

	  get els() {
	    // eslint-disable-next-line no-constant-condition
	    {
	      complain$1(
	        'The "this.els" attribute is deprecated. Please use "this.getEls(key)" instead.'
	      );
	    }
	    return (this.___rootNode ? this.___rootNode.nodes : []).filter(function(
	      el
	    ) {
	      return el.nodeType === ELEMENT_NODE$1;
	    });
	  },

	  ___emit: emit,
	  ___emitCreate(input, out) {
	    this.onCreate && this.onCreate(input, out);
	    this.___emit("create", input, out);
	  },

	  ___emitRender(out) {
	    this.onRender && this.onRender(out);
	    this.___emit("render", out);
	  },

	  ___emitUpdate() {
	    this.onUpdate && this.onUpdate();
	    this.___emit("update");
	  },

	  ___emitMount() {
	    this.onMount && this.onMount();
	    this.___emit("mount");
	  },

	  ___emitDestroy() {
	    this.onDestroy && this.onDestroy();
	    this.___emit("destroy");
	  }
	};

	componentProto.elId = componentProto.getElId;
	componentProto.___update = componentProto.update;
	componentProto.___destroy = componentProto.destroy;

	// Add all of the following DOM methods to Component.prototype:
	// - appendTo(referenceEl)
	// - replace(referenceEl)
	// - replaceChildrenOf(referenceEl)
	// - insertBefore(referenceEl)
	// - insertAfter(referenceEl)
	// - prependTo(referenceEl)
	domInsert(
	  componentProto,
	  function getEl(component) {
	    return component.___detach();
	  },
	  function afterInsert(component) {
	    return component;
	  }
	);

	inherit_1(Component, src);

	var Component_1 = Component;

	/* jshint newcap:false */





	var defineComponent = function defineComponent(def, renderer) {
	  if (def.___isComponent) {
	    return def;
	  }

	  var ComponentClass = function() {};
	  var proto;

	  var type = typeof def;

	  if (type == "function") {
	    proto = def.prototype;
	  } else if (type == "object") {
	    proto = def;
	  } else {
	    throw TypeError();
	  }

	  ComponentClass.prototype = proto;

	  // We don't use the constructor provided by the user
	  // since we don't invoke their constructor until
	  // we have had a chance to do our own initialization.
	  // Instead, we store their constructor in the "initComponent"
	  // property and that method gets called later inside
	  // init-components-browser.js
	  function Component(id) {
	    Component_1.call(this, id);
	  }

	  if (!proto.___isComponent) {
	    // Inherit from Component if they didn't already
	    inherit_1(ComponentClass, Component_1);
	  }

	  // The same prototype will be used by our constructor after
	  // we he have set up the prototype chain using the inherit function
	  proto = Component.prototype = ComponentClass.prototype;

	  // proto.constructor = def.constructor = Component;

	  // Set a flag on the constructor function to make it clear this is
	  // a component so that we can short-circuit this work later
	  Component.___isComponent = true;

	  function State(component) {
	    State_1.call(this, component);
	  }
	  inherit_1(State, State_1);
	  proto.___State = State;
	  proto.___renderer = renderer;

	  return Component;
	};

	var win = typeof window !== "undefined" ? window : commonjsGlobal;
	var NOOP = win.$W10NOOP = win.$W10NOOP || function () {};

	var constants = {
		NOOP: NOOP
	};

	var isArray = Array.isArray;

	function resolve(object, path, len) {
	    var current = object;
	    for (var i=0; i<len; i++) {
	        current = current[path[i]];
	    }

	    return current;
	}

	function resolveType(info) {
	    if (info.type === 'Date') {
	        return new Date(info.value);
	    } else if (info.type === 'NOOP') {
	        return constants.NOOP;
	    } else {
	        throw new Error('Bad type');
	    }
	}

	var finalize = function finalize(outer) {
	    if (!outer) {
	        return outer;
	    }

	    var assignments = outer.$$;
	    if (assignments) {
	        var object = outer.o;
	        var len;

	        if (assignments && (len=assignments.length)) {
	            for (var i=0; i<len; i++) {
	                var assignment = assignments[i];

	                var rhs = assignment.r;
	                var rhsValue;

	                if (isArray(rhs)) {
	                    rhsValue = resolve(object, rhs, rhs.length);
	                } else {
	                    rhsValue = resolveType(rhs);
	                }

	                var lhs = assignment.l;
	                var lhsLast = lhs.length-1;

	                if (lhsLast === -1) {
	                    object = outer.o = rhsValue;
	                    break;
	                } else {
	                    var lhsParent = resolve(object, lhs, lhsLast);
	                    lhsParent[lhs[lhsLast]] = rhsValue;
	                }
	            }
	        }

	        assignments.length = 0; // Assignments have been applied, do not reapply

	        return object == null ? null : object;
	    } else {
	        return outer;
	    }

	};

	var finalize$1 = finalize;

	var constants$1 = constants;

	var complain$2 =  complain_1;
	var w10Noop = constants$1.NOOP;

	var attachBubblingEvent = utilBrowser.___attachBubblingEvent;
	var addDelegatedEventHandler$1 = eventDelegation
	  .___addDelegatedEventHandler;


	var EMPTY_OBJECT$1 = {};

	var FLAG_WILL_RERENDER_IN_BROWSER = 1;
	var FLAG_HAS_RENDER_BODY = 2;

	/**
	 * A ComponentDef is used to hold the metadata collected at runtime for
	 * a single component and this information is used to instantiate the component
	 * later (after the rendered HTML has been added to the DOM)
	 */
	function ComponentDef(component, componentId, componentsContext) {
	  this.___componentsContext = componentsContext; // The AsyncWriter that this component is associated with
	  this.___component = component;
	  this.id = componentId;

	  this.___domEvents = undefined; // An array of DOM events that need to be added (in sets of three)

	  this.___isExisting = false;

	  this.___renderBoundary = false;
	  this.___flags = 0;

	  this.___nextIdIndex = 0; // The unique integer to use for the next scoped ID
	  this.___keySequence = null;
	}

	ComponentDef.prototype = {
	  ___nextKey: function(key) {
	    return (
	      this.___keySequence || (this.___keySequence = new KeySequence_1())
	    ).___nextKey(key);
	  },

	  /**
	   * This helper method generates a unique and fully qualified DOM element ID
	   * that is unique within the scope of the current component.
	   */
	  elId: function(nestedId) {
	    var id = this.id;

	    if (nestedId == null) {
	      return id;
	    } else {
	      if (typeof nestedId !== "string") {
	        // eslint-disable-next-line no-constant-condition
	        {
	          complain$2("Using non strings as keys is deprecated.");
	        }

	        nestedId = String(nestedId);
	      }

	      if (nestedId.indexOf("#") === 0) {
	        id = "#" + id;
	        nestedId = nestedId.substring(1);
	      }

	      return id + "-" + nestedId;
	    }
	  },
	  /**
	   * Returns the next auto generated unique ID for a nested DOM element or nested DOM component
	   */
	  ___nextComponentId: function() {
	    return this.id + "-c" + this.___nextIdIndex++;
	  },

	  d: function(eventName, handlerMethodName, isOnce, extraArgs) {
	    addDelegatedEventHandler$1(eventName);
	    return attachBubblingEvent(this, handlerMethodName, isOnce, extraArgs);
	  },

	  get ___type() {
	    return this.___component.___type;
	  }
	};

	ComponentDef.prototype.nk = ComponentDef.prototype.___nextKey;

	ComponentDef.___deserialize = function(o, types, global, registry) {
	  var id = o[0];
	  var typeName = types[o[1]];
	  var input = o[2] || null;
	  var extra = o[3] || EMPTY_OBJECT$1;

	  var state = extra.s;
	  var componentProps = extra.w;
	  var flags = extra.f;
	  var component = registry.___createComponent(typeName, id);

	  // Prevent newly created component from being queued for update since we area
	  // just building it from the server info
	  component.___updateQueued = true;

	  if (flags & FLAG_HAS_RENDER_BODY) {
	    (input || (input = {})).renderBody = w10Noop;
	  }

	  if (flags & FLAG_WILL_RERENDER_IN_BROWSER) {
	    if (component.onCreate) {
	      component.onCreate(input, { global: global });
	    }
	    if (component.onInput) {
	      input = component.onInput(input, { global: global }) || input;
	    }
	  } else {
	    if (state) {
	      var undefinedPropNames = extra.u;
	      if (undefinedPropNames) {
	        undefinedPropNames.forEach(function(undefinedPropName) {
	          state[undefinedPropName] = undefined;
	        });
	      }
	      // We go through the setter here so that we convert the state object
	      // to an instance of `State`
	      component.state = state;
	    }

	    if (componentProps) {
	      extend(component, componentProps);
	    }
	  }

	  component.___input = input;

	  if (extra.b) {
	    component.___bubblingDomEvents = extra.b;
	  }

	  var scope = extra.p;
	  var customEvents = extra.e;
	  if (customEvents) {
	    component.___setCustomEvents(customEvents, scope);
	  }

	  component.___global = global;

	  return {
	    id: id,
	    ___component: component,
	    ___domEvents: extra.d,
	    ___flags: extra.f || 0
	  };
	};

	var ComponentDef_1 = ComponentDef;

	var complain$3 =  complain_1;


	var win$1 = window;
	var defaultDocument$1 = document;
	var createFragmentNode$3 = fragment
	  .___createFragmentNode;

	var componentLookup$2 = utilBrowser.___componentLookup;
	var addComponentRootToKeyedElements$1 =
	  utilBrowser.___addComponentRootToKeyedElements;



	var keyedElementsByComponentId$1 = domData.___ssrKeyedElementsByComponentId;
	var componentsByDOMNode$1 = domData.___componentByDOMNode;
	var serverComponentRootNodes = {};
	var serverRenderedMeta = {};

	var DEFAULT_RUNTIME_ID = "M";
	var FLAG_WILL_RERENDER_IN_BROWSER$1 = 1;
	// var FLAG_HAS_RENDER_BODY = 2;

	function indexServerComponentBoundaries(node, runtimeId, stack) {
	  var componentId;
	  var ownerId;
	  var ownerComponent;
	  var keyedElements;
	  var nextSibling;
	  var runtimeLength = runtimeId.length;
	  stack = stack || [];

	  node = node.firstChild;
	  while (node) {
	    nextSibling = node.nextSibling;
	    if (node.nodeType === 8) {
	      // Comment node
	      var commentValue = node.nodeValue;
	      if (commentValue.slice(0, runtimeLength) === runtimeId) {
	        var firstChar = commentValue[runtimeLength];

	        if (firstChar === "^" || firstChar === "#") {
	          stack.push(node);
	        } else if (firstChar === "/") {
	          var endNode = node;
	          var startNode = stack.pop();
	          var rootNode;

	          if (startNode.parentNode === endNode.parentNode) {
	            rootNode = createFragmentNode$3(startNode.nextSibling, endNode);
	          } else {
	            rootNode = createFragmentNode$3(
	              endNode.parentNode.firstChild,
	              endNode
	            );
	          }

	          componentId = startNode.nodeValue.substring(runtimeLength + 1);
	          firstChar = startNode.nodeValue[runtimeLength];

	          if (firstChar === "^") {
	            var parts = componentId.split(/ /g);
	            var key = parts[2];
	            ownerId = parts[1];
	            componentId = parts[0];
	            if ((ownerComponent = componentLookup$2[ownerId])) {
	              keyedElements = ownerComponent.___keyedElements;
	            } else {
	              keyedElements =
	                keyedElementsByComponentId$1[ownerId] ||
	                (keyedElementsByComponentId$1[ownerId] = {});
	            }
	            addComponentRootToKeyedElements$1(
	              keyedElements,
	              key,
	              rootNode,
	              componentId
	            );
	          }

	          serverComponentRootNodes[componentId] = rootNode;

	          startNode.parentNode.removeChild(startNode);
	          endNode.parentNode.removeChild(endNode);
	        }
	      }
	    } else if (node.nodeType === 1) {
	      // HTML element node
	      var markoKey = node.getAttribute("data-marko-key");
	      var markoProps = utilBrowser.___getMarkoPropsFromEl(node);
	      if (markoKey) {
	        var separatorIndex = markoKey.indexOf(" ");
	        ownerId = markoKey.substring(separatorIndex + 1);
	        markoKey = markoKey.substring(0, separatorIndex);
	        if ((ownerComponent = componentLookup$2[ownerId])) {
	          keyedElements = ownerComponent.___keyedElements;
	        } else {
	          keyedElements =
	            keyedElementsByComponentId$1[ownerId] ||
	            (keyedElementsByComponentId$1[ownerId] = {});
	        }
	        keyedElements[markoKey] = node;
	      }
	      if (markoProps) {
	        Object.keys(markoProps).forEach(function(key) {
	          if (key.slice(0, 2) === "on") {
	            eventDelegation.___addDelegatedEventHandler(key.slice(2));
	          }
	        });
	      }
	      indexServerComponentBoundaries(node, runtimeId, stack);
	    }

	    node = nextSibling;
	  }
	}

	function invokeComponentEventHandler(component, targetMethodName, args) {
	  var method = component[targetMethodName];
	  if (!method) {
	    throw Error("Method not found: " + targetMethodName);
	  }

	  method.apply(component, args);
	}

	function addEventListenerHelper(el, eventType, isOnce, listener) {
	  var eventListener = listener;
	  if (isOnce) {
	    eventListener = function(event) {
	      listener(event);
	      el.removeEventListener(eventType, eventListener);
	    };
	  }

	  el.addEventListener(eventType, eventListener, false);

	  return function remove() {
	    el.removeEventListener(eventType, eventListener);
	  };
	}

	function addDOMEventListeners(
	  component,
	  el,
	  eventType,
	  targetMethodName,
	  isOnce,
	  extraArgs,
	  handles
	) {
	  var removeListener = addEventListenerHelper(el, eventType, isOnce, function(
	    event
	  ) {
	    var args = [event, el];
	    if (extraArgs) {
	      args = extraArgs.concat(args);
	    }

	    invokeComponentEventHandler(component, targetMethodName, args);
	  });
	  handles.push(removeListener);
	}

	function initComponent(componentDef, doc) {
	  var component = componentDef.___component;

	  component.___reset();
	  component.___document = doc;

	  var isExisting = componentDef.___isExisting;

	  if (isExisting) {
	    component.___removeDOMEventListeners();
	  }

	  var domEvents = componentDef.___domEvents;
	  if (domEvents) {
	    var eventListenerHandles = [];

	    domEvents.forEach(function(domEventArgs) {
	      // The event mapping is for a direct DOM event (not a custom event and not for bubblign dom events)

	      var eventType = domEventArgs[0];
	      var targetMethodName = domEventArgs[1];
	      var eventEl = component.___keyedElements[domEventArgs[2]];
	      var isOnce = domEventArgs[3];
	      var extraArgs = domEventArgs[4];

	      addDOMEventListeners(
	        component,
	        eventEl,
	        eventType,
	        targetMethodName,
	        isOnce,
	        extraArgs,
	        eventListenerHandles
	      );
	    });

	    if (eventListenerHandles.length) {
	      component.___domEventListenerHandles = eventListenerHandles;
	    }
	  }

	  if (component.___mounted) {
	    component.___emitUpdate();
	  } else {
	    component.___mounted = true;
	    component.___emitMount();
	  }
	}

	/**
	 * This method is used to initialized components associated with UI components
	 * rendered in the browser. While rendering UI components a "components context"
	 * is added to the rendering context to keep up with which components are rendered.
	 * When ready, the components can then be initialized by walking the component tree
	 * in the components context (nested components are initialized before ancestor components).
	 * @param  {Array<marko-components/lib/ComponentDef>} componentDefs An array of ComponentDef instances
	 */
	function initClientRendered(componentDefs, doc) {
	  // Ensure that event handlers to handle delegating events are
	  // always attached before initializing any components
	  eventDelegation.___init(doc);

	  doc = doc || defaultDocument$1;
	  var len = componentDefs.length;
	  var componentDef;
	  var i;

	  for (i = len; i--; ) {
	    componentDef = componentDefs[i];
	    trackComponent(componentDef);
	  }

	  for (i = len; i--; ) {
	    componentDef = componentDefs[i];
	    initComponent(componentDef, doc);
	  }
	}

	/**
	 * This method initializes all components that were rendered on the server by iterating over all
	 * of the component IDs.
	 */
	function initServerRendered(renderedComponents, doc) {
	  var type = typeof renderedComponents;
	  var globalKey = "$";
	  var runtimeId;

	  if (type !== "object") {
	    if (type === "string") {
	      runtimeId = renderedComponents;
	      globalKey += runtimeId + "_C";
	    } else {
	      globalKey += (runtimeId = DEFAULT_RUNTIME_ID) + "C";
	    }

	    renderedComponents = win$1[globalKey];

	    var fakeArray = (win$1[globalKey] = {
	      r: runtimeId,
	      concat: initServerRendered
	    });

	    if (renderedComponents && renderedComponents.forEach) {
	      renderedComponents.forEach(function(renderedComponent) {
	        fakeArray.concat(renderedComponent);
	      });
	    }

	    return fakeArray;
	  }

	  var isFromSerializedGlobals = this.concat === initServerRendered;
	  renderedComponents = finalize$1(renderedComponents);

	  if (isFromSerializedGlobals) {
	    runtimeId = this.r;
	    doc = defaultDocument$1;
	  } else {
	    runtimeId = renderedComponents.r || DEFAULT_RUNTIME_ID;
	    doc = doc || defaultDocument$1;

	    // eslint-disable-next-line no-constant-condition
	    {
	      complain$3(
	        "Passing serialized data to `require('marko/components).init` is deprecated. Instead set '$global.runtimeId' and provide the 'runtimeId' option to your Marko bundler plugin."
	      );
	    }
	  }

	  // eslint-disable-next-line no-constant-condition
	  {
	    if (doc !== defaultDocument$1) {
	      complain$3(
	        "Passing a document other than the current document to `require('marko/components).init` is deprecated."
	      );
	    }
	  }

	  var prefix = renderedComponents.p || "";
	  var meta = serverRenderedMeta[prefix];
	  var isLast = renderedComponents.l;

	  if (meta) {
	    if (isLast) {
	      delete serverRenderedMeta[prefix];
	    }
	  } else {
	    meta = {};

	    if (!isLast) {
	      serverRenderedMeta[prefix] = meta;
	    }
	  }

	  // Ensure that event handlers to handle delegating events are
	  // always attached before initializing any components
	  indexServerComponentBoundaries(doc, runtimeId);
	  eventDelegation.___init(doc);

	  if (renderedComponents.g) {
	    meta.___globals = renderedComponents.g;
	  }

	  if (renderedComponents.t) {
	    meta.___types = meta.___types
	      ? meta.___types.concat(renderedComponents.t)
	      : renderedComponents.t;
	  }

	  // hydrate components top down (leaf nodes last)
	  // and return an array of functions to mount these components
	  var deferredDefs;
	  (renderedComponents.w || [])
	    .map(function(componentDef) {
	      componentDef = ComponentDef_1.___deserialize(
	        componentDef,
	        meta.___types,
	        meta.___globals,
	        registryBrowser
	      );

	      var mount = hydrateComponentAndGetMount(componentDef, doc);

	      if (!mount) {
	        // hydrateComponentAndGetMount will return false if there is not rootNode
	        // for the component.  If this is the case, we'll wait until the
	        // DOM has fully loaded to attempt to init the component again.
	        if (deferredDefs) {
	          deferredDefs.push(componentDef);
	        } else {
	          deferredDefs = [componentDef];
	          doc.addEventListener("DOMContentLoaded", function() {
	            indexServerComponentBoundaries(doc, runtimeId);
	            deferredDefs
	              .map(function(componentDef) {
	                return hydrateComponentAndGetMount(componentDef, doc);
	              })
	              .reverse()
	              .forEach(tryInvoke);
	          });
	        }
	      }

	      return mount;
	    })
	    .reverse()
	    .forEach(tryInvoke);

	  return this;
	}

	function hydrateComponentAndGetMount(componentDef, doc) {
	  var componentId = componentDef.id;
	  var component = componentDef.___component;
	  var rootNode = serverComponentRootNodes[componentId];
	  var renderResult;

	  if (rootNode) {
	    delete serverComponentRootNodes[componentId];

	    component.___rootNode = rootNode;
	    componentsByDOMNode$1.set(rootNode, component);

	    if (componentDef.___flags & FLAG_WILL_RERENDER_IN_BROWSER$1) {
	      component.___document = doc;
	      renderResult = component.___rerender(component.___input, true);
	      trackComponent(componentDef);
	      return function mount() {
	        renderResult.afterInsert(doc);
	      };
	    } else {
	      trackComponent(componentDef);
	    }

	    return function mount() {
	      initComponent(componentDef, doc);
	    };
	  }
	}

	function trackComponent(componentDef) {
	  var component = componentDef.___component;
	  if (component) {
	    componentLookup$2[component.id] = component;
	  }
	}

	function tryInvoke(fn) {
	  if (fn) fn();
	}

	var ___initClientRendered = initClientRendered;
	var ___initServerRendered = initServerRendered;

	var initComponentsBrowser = {
		___initClientRendered: ___initClientRendered,
		___initServerRendered: ___initServerRendered
	};

	ComponentsContext_1.___initClientRendered =
	  initComponentsBrowser.___initClientRendered;

	utilBrowser.___getComponentForEl;
	window.$initComponents = initComponentsBrowser.___initServerRendered;

	var registered = {};
	var loaded = {};
	var componentTypes = {};

	function register(componentId, def) {
	  registered[componentId] = def;
	  delete loaded[componentId];
	  delete componentTypes[componentId];
	  return componentId;
	}

	function load(typeName) {
	  var target = loaded[typeName];
	  if (!target) {
	    target = registered[typeName];

	    if (target) {
	      target = target();
	    }

	    if (!target) {
	      throw Error("Component not found: " + typeName);
	    }

	    loaded[typeName] = target;
	  }

	  return target;
	}

	function getComponentClass(typeName) {
	  var ComponentClass = componentTypes[typeName];

	  if (ComponentClass) {
	    return ComponentClass;
	  }

	  ComponentClass = load(typeName);

	  ComponentClass = ComponentClass.Component || ComponentClass;

	  if (!ComponentClass.___isComponent) {
	    ComponentClass = defineComponent(ComponentClass, ComponentClass.renderer);
	  }

	  // Make the component "type" accessible on each component instance
	  ComponentClass.prototype.___type = typeName;

	  // eslint-disable-next-line no-constant-condition
	  {
	    var classNameMatch = /\/([^/]+?)(?:\/index|\/template|)(?:\.marko|\.component(?:-browser)?|)$/.exec(
	      typeName
	    );
	    var className = classNameMatch ? classNameMatch[1] : "AnonymousComponent";
	    className = className.replace(/-(.)/g, function(g) {
	      return g[1].toUpperCase();
	    });
	    className = className
	      .replace(/\$\d+\.\d+\.\d+$/, "")
	      .replace(/^[^a-z$_]/i, "_$&")
	      .replace(/[^0-9a-z$_]+/gi, "_");
	    className = className[0].toUpperCase() + className.slice(1);
	    // eslint-disable-next-line no-unused-vars
	    try {
	      var OldComponentClass = ComponentClass;
	      eval(
	        "ComponentClass = function " +
	          className +
	          "(id, doc) { OldComponentClass.call(this, id, doc); }"
	      );
	      ComponentClass.prototype = OldComponentClass.prototype;
	    } catch (e) {
	      /** ignore error */
	    }
	  }

	  componentTypes[typeName] = ComponentClass;

	  return ComponentClass;
	}

	function createComponent(typeName, id) {
	  var ComponentClass = getComponentClass(typeName);
	  return new ComponentClass(id);
	}

	var r = register;
	var ___createComponent = createComponent;

	var registryBrowser = {
		r: r,
		___createComponent: ___createComponent
	};

	var beginComponentBrowser = function beginComponent(
	  componentsContext,
	  component,
	  key,
	  ownerComponentDef
	) {
	  var componentId = component.id;
	  var componentDef = (componentsContext.___componentDef = new ComponentDef_1(
	    component,
	    componentId,
	    componentsContext
	  ));
	  componentsContext.___globalContext.___renderedComponentsById[
	    componentId
	  ] = true;
	  componentsContext.___components.push(componentDef);

	  var out = componentsContext.___out;
	  out.bc(component, key, ownerComponentDef && ownerComponentDef.___component);
	  return componentDef;
	};

	var endComponentBrowser = function endComponent(out) {
	  out.ee(); // endElement() (also works for VComponent nodes pushed on to the stack)
	};

	var componentLookup$3 = utilBrowser.___componentLookup;


	var getComponentsContext$1 = ComponentsContext_1.___getComponentsContext;


	var isServer = utilBrowser.___isServer === true;



	var COMPONENT_BEGIN_ASYNC_ADDED_KEY = "$wa";

	function resolveComponentKey(key, parentComponentDef) {
	  if (key[0] === "#") {
	    return key.substring(1);
	  } else {
	    return parentComponentDef.id + "-" + parentComponentDef.___nextKey(key);
	  }
	}

	function trackAsyncComponents(out) {
	  if (out.isSync() || out.global[COMPONENT_BEGIN_ASYNC_ADDED_KEY]) {
	    return;
	  }

	  out.on("beginAsync", handleBeginAsync);
	  out.on("beginDetachedAsync", handleBeginDetachedAsync);
	  out.global[COMPONENT_BEGIN_ASYNC_ADDED_KEY] = true;
	}

	function handleBeginAsync(event) {
	  var parentOut = event.parentOut;
	  var asyncOut = event.out;
	  var componentsContext = parentOut.___components;

	  if (componentsContext !== undefined) {
	    // We are going to start a nested ComponentsContext
	    asyncOut.___components = new ComponentsContext_1(asyncOut, componentsContext);
	  }
	  // Carry along the component arguments
	  asyncOut.c(
	    parentOut.___assignedComponentDef,
	    parentOut.___assignedKey,
	    parentOut.___assignedCustomEvents
	  );
	}

	function handleBeginDetachedAsync(event) {
	  var asyncOut = event.out;
	  handleBeginAsync(event);
	  asyncOut.on("beginAsync", handleBeginAsync);
	  asyncOut.on("beginDetachedAsync", handleBeginDetachedAsync);
	}

	function createRendererFunc(
	  templateRenderFunc,
	  componentProps,
	  renderingLogic
	) {
	  var onInput = renderingLogic && renderingLogic.onInput;
	  var typeName = componentProps.t;
	  var isSplit = componentProps.s === true;
	  componentProps.i === true;

	  var shouldApplySplitMixins = renderingLogic && isSplit;

	  // eslint-disable-next-line no-constant-condition
	  {
	    if (!componentProps.d) {
	      throw new Error(
	        "Component was compiled in a different NODE_ENV than the Marko runtime is using."
	      );
	    }
	  }

	  return function renderer(input, out) {
	    trackAsyncComponents(out);

	    var componentsContext = getComponentsContext$1(out);
	    var globalComponentsContext = componentsContext.___globalContext;

	    var component = globalComponentsContext.___rerenderComponent;
	    var isRerender = component !== undefined;
	    var id;
	    var isExisting;
	    var customEvents;
	    var parentComponentDef = componentsContext.___componentDef;
	    var ownerComponentDef = out.___assignedComponentDef;
	    var ownerComponentId = ownerComponentDef && ownerComponentDef.id;
	    var key = out.___assignedKey;

	    if (component) {
	      // If component is provided then we are currently rendering
	      // the top-level UI component as part of a re-render
	      id = component.id; // We will use the ID of the component being re-rendered
	      isExisting = true; // This is a re-render so we know the component is already in the DOM
	      globalComponentsContext.___rerenderComponent = null;
	    } else {
	      // Otherwise, we are rendering a nested UI component. We will need
	      // to match up the UI component with the component already in the
	      // DOM (if any) so we will need to resolve the component ID from
	      // the assigned key. We also need to handle any custom event bindings
	      // that were provided.
	      if (parentComponentDef) {
	        // console.log('componentArgs:', componentArgs);
	        customEvents = out.___assignedCustomEvents;

	        if (key != null) {
	          id = resolveComponentKey(key.toString(), parentComponentDef);
	        } else {
	          id = parentComponentDef.___nextComponentId();
	        }
	      } else {
	        id = globalComponentsContext.___nextComponentId();
	      }
	    }

	    if (isServer) {
	      // If we are rendering on the server then things are simplier since
	      // we don't need to match up the UI component with a previously
	      // rendered component already mounted to the DOM. We also create
	      // a lightweight ServerComponent
	      component = registryBrowser.___createComponent(
	        renderingLogic,
	        id,
	        input,
	        out,
	        typeName,
	        customEvents,
	        ownerComponentId
	      );

	      // This is the final input after running the lifecycle methods.
	      // We will be passing the input to the template for the `input` param
	      input = component.___updatedInput;
	    } else {
	      if (!component) {
	        if (
	          isRerender &&
	          (component = componentLookup$3[id]) &&
	          component.___type !== typeName
	        ) {
	          // Destroy the existing component since
	          component.destroy();
	          component = undefined;
	        }

	        if (component) {
	          isExisting = true;
	        } else {
	          isExisting = false;
	          // We need to create a new instance of the component
	          component = registryBrowser.___createComponent(typeName, id);

	          if (shouldApplySplitMixins === true) {
	            shouldApplySplitMixins = false;

	            var renderingLogicProps =
	              typeof renderingLogic == "function"
	                ? renderingLogic.prototype
	                : renderingLogic;

	            copyProps(renderingLogicProps, component.constructor.prototype);
	          }
	        }

	        // Set this flag to prevent the component from being queued for update
	        // based on the new input. The component is about to be rerendered
	        // so we don't want to queue it up as a result of calling `setInput()`
	        component.___updateQueued = true;

	        if (customEvents !== undefined) {
	          component.___setCustomEvents(customEvents, ownerComponentId);
	        }

	        if (isExisting === false) {
	          component.___emitCreate(input, out);
	        }

	        input = component.___setInput(input, onInput, out);

	        if (isExisting === true) {
	          if (
	            component.___isDirty === false ||
	            component.shouldUpdate(input, component.___state) === false
	          ) {
	            // We put a placeholder element in the output stream to ensure that the existing
	            // DOM node is matched up correctly when using morphdom. We flag the VElement
	            // node to track that it is a preserve marker
	            out.___preserveComponent(component);
	            globalComponentsContext.___renderedComponentsById[id] = true;
	            component.___reset(); // The component is no longer dirty so reset internal flags
	            return;
	          }
	        }
	      }

	      component.___global = out.global;
	      component.___emitRender(out);
	    }

	    var componentDef = beginComponentBrowser(
	      componentsContext,
	      component,
	      key,
	      ownerComponentDef);

	    componentDef.___isExisting = isExisting;

	    // Render the template associated with the component using the final template
	    // data that we constructed
	    templateRenderFunc(
	      input,
	      out,
	      componentDef,
	      component,
	      component.___rawState
	    );

	    endComponentBrowser(out);
	    componentsContext.___componentDef = parentComponentDef;
	  };
	}

	var renderer = createRendererFunc;

	var classValue = function classHelper(arg) {
	  switch (typeof arg) {
	    case "string":
	      return arg || null;
	    case "object":
	      var result = "";
	      var sep = "";

	      if (Array.isArray(arg)) {
	        for (var i = 0, len = arg.length; i < len; i++) {
	          var value = classHelper(arg[i]);
	          if (value) {
	            result += sep + value;
	            sep = " ";
	          }
	        }
	      } else {
	        for (var key in arg) {
	          if (arg[key]) {
	            result += sep + key;
	            sep = " ";
	          }
	        }
	      }

	      return result || null;

	    default:
	      return null;
	  }
	};

	var camelToDashLookup = Object.create(null);
	var dashToCamelLookup = Object.create(null);

	/**
	 * Helper for converting camelCase to dash-case.
	 */
	var ___camelToDashCase = function camelToDashCase(name) {
	  var nameDashed = camelToDashLookup[name];
	  if (!nameDashed) {
	    nameDashed = camelToDashLookup[name] = name
	      .replace(/([A-Z])/g, "-$1")
	      .toLowerCase();

	    if (nameDashed !== name) {
	      dashToCamelLookup[nameDashed] = name;
	    }
	  }

	  return nameDashed;
	};

	/**
	 * Helper for converting dash-case to camelCase.
	 */
	var ___dashToCamelCase = function dashToCamelCase(name) {
	  var nameCamel = dashToCamelLookup[name];
	  if (!nameCamel) {
	    nameCamel = dashToCamelLookup[name] = name.replace(
	      /-([a-z])/g,
	      matchToUpperCase
	    );

	    if (nameCamel !== name) {
	      camelToDashLookup[nameCamel] = name;
	    }
	  }

	  return nameCamel;
	};

	function matchToUpperCase(_, char) {
	  return char.toUpperCase();
	}

	var _changeCase = {
		___camelToDashCase: ___camelToDashCase,
		___dashToCamelCase: ___dashToCamelCase
	};

	/**
	 * Helper for generating the string for a style attribute
	 */
	var styleValue = function styleHelper(style) {
	  if (!style) {
	    return null;
	  }

	  var type = typeof style;

	  if (type !== "string") {
	    var styles = "";

	    if (Array.isArray(style)) {
	      for (var i = 0, len = style.length; i < len; i++) {
	        var next = styleHelper(style[i]);
	        if (next) styles += next + (next[next.length - 1] !== ";" ? ";" : "");
	      }
	    } else if (type === "object") {
	      for (var name in style) {
	        var value = style[name];
	        if (value != null) {
	          if (typeof value === "number" && value) {
	            value += "px";
	          }

	          styles += _changeCase.___camelToDashCase(name) + ":" + value + ";";
	        }
	      }
	    }

	    return styles || null;
	  }

	  return style;
	};

	/**
	 * Helper for processing dynamic attributes
	 */
	var attrs = function(attributes) {
	  if (attributes != null) {
	    // eslint-disable-next-line no-constant-condition
	    {
	      if (typeof attributes !== "object") {
	        throw new Error(
	          "A non object was passed as a dynamic attributes value."
	        );
	      }
	    }

	    var newAttributes = {};

	    for (var attrName in attributes) {
	      var val = attributes[attrName];
	      if (attrName === "renderBody") {
	        continue;
	      }

	      if (attrName === "class") {
	        val = classValue(val);
	      } else if (attrName === "style") {
	        val = styleValue(val);
	      }

	      newAttributes[attrName] = val;
	    }

	    return newAttributes;
	  }

	  return attributes;
	};

	var VElement$2 = vdom.___VElement;
	var VDocumentFragment$1 = vdom.___VDocumentFragment;
	var VText$1 = vdom.___VText;
	var VComponent$1 = vdom.___VComponent;
	var VFragment$1 = vdom.___VFragment;
	var virtualizeHTML$1 = vdom.___virtualizeHTML;

	var defaultDocument$2 = vdom.___defaultDocument;



	var EVENT_UPDATE = "update";
	var EVENT_FINISH = "finish";

	function State$1(tree) {
	  this.___events = new src();
	  this.___tree = tree;
	  this.___finished = false;
	}

	function AsyncVDOMBuilder(globalData, parentNode, parentOut) {
	  if (!parentNode) {
	    parentNode = new VDocumentFragment$1();
	  }

	  var state;

	  if (parentOut) {
	    state = parentOut.___state;
	  } else {
	    state = new State$1(parentNode);
	  }

	  this.___remaining = 1;
	  this.___lastCount = 0;
	  this.___last = null;
	  this.___parentOut = parentOut;

	  this.data = {};
	  this.___state = state;
	  this.___parent = parentNode;
	  this.global = globalData || {};
	  this.___stack = [parentNode];
	  this.___sync = false;
	  this.___vnode = undefined;
	  this.___components = null;

	  this.___assignedComponentDef = null;
	  this.___assignedKey = null;
	  this.___assignedCustomEvents = null;
	}

	var proto$2 = (AsyncVDOMBuilder.prototype = {
	  ___isOut: true,
	  ___document: defaultDocument$2,

	  bc: function(component, key, ownerComponent) {
	    var vComponent = new VComponent$1(component, key, ownerComponent);
	    return this.___beginNode(vComponent, 0, true);
	  },

	  ___preserveComponent: function(component, key, ownerComponent) {
	    var vComponent = new VComponent$1(component, key, ownerComponent, true);
	    this.___beginNode(vComponent, 0);
	  },

	  ___beginNode: function(child, childCount, pushToStack) {
	    this.___parent.___appendChild(child);
	    if (pushToStack === true) {
	      this.___stack.push(child);
	      this.___parent = child;
	    }
	    return childCount === 0 ? this : child;
	  },

	  element: function(tagName, attrs, key, component, childCount, flags, props) {
	    var element = new VElement$2(
	      tagName,
	      attrs,
	      key,
	      component,
	      childCount,
	      flags,
	      props
	    );
	    return this.___beginNode(element, childCount);
	  },

	  ___elementDynamic: function(tagName, attrs$1, key, componentDef, props) {
	    return this.element(
	      tagName,
	      attrs(attrs$1),
	      key,
	      componentDef.___component,
	      0,
	      0,
	      props
	    );
	  },

	  n: function(node, component) {
	    // NOTE: We do a shallow clone since we assume the node is being reused
	    //       and a node can only have one parent node.
	    var clone = node.___cloneNode();
	    this.node(clone);
	    clone.___ownerComponent = component;

	    return this;
	  },

	  node: function(node) {
	    this.___parent.___appendChild(node);
	    return this;
	  },

	  text: function(text, ownerComponent) {
	    var type = typeof text;

	    if (type != "string") {
	      if (text == null) {
	        return;
	      } else if (type === "object") {
	        if (text.toHTML) {
	          return this.h(text.toHTML(), ownerComponent);
	        }
	      }

	      text = text.toString();
	    }

	    this.___parent.___appendChild(new VText$1(text, ownerComponent));
	    return this;
	  },

	  html: function(html, ownerComponent) {
	    if (html != null) {
	      var vdomNode = virtualizeHTML$1(
	        html,
	        this.___document || document,
	        ownerComponent
	      );
	      this.node(vdomNode);
	    }

	    return this;
	  },

	  beginElement: function(
	    tagName,
	    attrs,
	    key,
	    component,
	    childCount,
	    flags,
	    props
	  ) {
	    var element = new VElement$2(
	      tagName,
	      attrs,
	      key,
	      component,
	      childCount,
	      flags,
	      props
	    );
	    this.___beginNode(element, childCount, true);
	    return this;
	  },

	  ___beginElementDynamic: function(tagName, attrs$1, key, componentDef, props) {
	    return this.beginElement(
	      tagName,
	      attrs(attrs$1),
	      key,
	      componentDef.___component,
	      0,
	      0,
	      props
	    );
	  },

	  bf: function(key, component, preserve) {
	    var fragment = new VFragment$1(key, component, preserve);
	    this.___beginNode(fragment, null, true);
	    return this;
	  },

	  ef: function() {
	    this.endElement();
	  },

	  endElement: function() {
	    var stack = this.___stack;
	    stack.pop();
	    this.___parent = stack[stack.length - 1];
	  },

	  end: function() {
	    this.___parent = undefined;

	    var remaining = --this.___remaining;
	    var parentOut = this.___parentOut;

	    if (remaining === 0) {
	      if (parentOut) {
	        parentOut.___handleChildDone();
	      } else {
	        this.___doFinish();
	      }
	    } else if (remaining - this.___lastCount === 0) {
	      this.___emitLast();
	    }

	    return this;
	  },

	  ___handleChildDone: function() {
	    var remaining = --this.___remaining;

	    if (remaining === 0) {
	      var parentOut = this.___parentOut;
	      if (parentOut) {
	        parentOut.___handleChildDone();
	      } else {
	        this.___doFinish();
	      }
	    } else if (remaining - this.___lastCount === 0) {
	      this.___emitLast();
	    }
	  },

	  ___doFinish: function() {
	    var state = this.___state;
	    state.___finished = true;
	    state.___events.emit(EVENT_FINISH, this.___getResult());
	  },

	  ___emitLast: function() {
	    var lastArray = this._last;

	    var i = 0;

	    function next() {
	      if (i === lastArray.length) {
	        return;
	      }
	      var lastCallback = lastArray[i++];
	      lastCallback(next);

	      if (!lastCallback.length) {
	        next();
	      }
	    }

	    next();
	  },

	  error: function(e) {
	    try {
	      this.emit("error", e);
	    } finally {
	      // If there is no listener for the error event then it will
	      // throw a new Error here. In order to ensure that the async fragment
	      // is still properly ended we need to put the end() in a `finally`
	      // block
	      this.end();
	    }

	    return this;
	  },

	  beginAsync: function(options) {
	    if (this.___sync) {
	      throw Error(
	        "Tried to render async while in sync mode. Note: Client side await is not currently supported in re-renders (Issue: #942)."
	      );
	    }

	    var state = this.___state;

	    if (options) {
	      if (options.last) {
	        this.___lastCount++;
	      }
	    }

	    this.___remaining++;

	    var documentFragment = this.___parent.___appendDocumentFragment();
	    var asyncOut = new AsyncVDOMBuilder(this.global, documentFragment, this);

	    state.___events.emit("beginAsync", {
	      out: asyncOut,
	      parentOut: this
	    });

	    return asyncOut;
	  },

	  createOut: function() {
	    return new AsyncVDOMBuilder(this.global);
	  },

	  flush: function() {
	    var events = this.___state.___events;

	    if (events.listenerCount(EVENT_UPDATE)) {
	      events.emit(EVENT_UPDATE, new RenderResult_1(this));
	    }
	  },

	  ___getOutput: function() {
	    return this.___state.___tree;
	  },

	  ___getResult: function() {
	    return this.___result || (this.___result = new RenderResult_1(this));
	  },

	  on: function(event, callback) {
	    var state = this.___state;

	    if (event === EVENT_FINISH && state.___finished) {
	      callback(this.___getResult());
	    } else if (event === "last") {
	      this.onLast(callback);
	    } else {
	      state.___events.on(event, callback);
	    }

	    return this;
	  },

	  once: function(event, callback) {
	    var state = this.___state;

	    if (event === EVENT_FINISH && state.___finished) {
	      callback(this.___getResult());
	    } else if (event === "last") {
	      this.onLast(callback);
	    } else {
	      state.___events.once(event, callback);
	    }

	    return this;
	  },

	  emit: function(type, arg) {
	    var events = this.___state.___events;
	    switch (arguments.length) {
	      case 1:
	        events.emit(type);
	        break;
	      case 2:
	        events.emit(type, arg);
	        break;
	      default:
	        events.emit.apply(events, arguments);
	        break;
	    }
	    return this;
	  },

	  removeListener: function() {
	    var events = this.___state.___events;
	    events.removeListener.apply(events, arguments);
	    return this;
	  },

	  sync: function() {
	    this.___sync = true;
	  },

	  isSync: function() {
	    return this.___sync;
	  },

	  onLast: function(callback) {
	    var lastArray = this._last;

	    if (lastArray === undefined) {
	      this._last = [callback];
	    } else {
	      lastArray.push(callback);
	    }

	    return this;
	  },

	  ___getNode: function(doc) {
	    var node = this.___vnode;
	    if (!node) {
	      var vdomTree = this.___getOutput();
	      // Create the root document fragment node
	      doc = doc || this.___document || document;
	      this.___vnode = node = vdomTree.___actualize(doc, null);
	      morphdom_1(node, vdomTree, doc, this.___components);
	    }
	    return node;
	  },

	  toString: function(doc) {
	    var docFragment = this.___getNode(doc);
	    var html = "";

	    var child = docFragment.firstChild;
	    while (child) {
	      var nextSibling = child.nextSibling;
	      if (child.nodeType != 1) {
	        var container = docFragment.ownerDocument.createElement("div");
	        container.appendChild(child.cloneNode());
	        html += container.innerHTML;
	      } else {
	        html += child.outerHTML;
	      }

	      child = nextSibling;
	    }

	    return html;
	  },

	  then: function(fn, fnErr) {
	    var out = this;
	    var promise = new Promise(function(resolve, reject) {
	      out.on("error", reject).on(EVENT_FINISH, function(result) {
	        resolve(result);
	      });
	    });

	    return Promise.resolve(promise).then(fn, fnErr);
	  },

	  catch: function(fnErr) {
	    return this.then(undefined, fnErr);
	  },

	  isVDOM: true,

	  c: function(componentDef, key, customEvents) {
	    this.___assignedComponentDef = componentDef;
	    this.___assignedKey = key;
	    this.___assignedCustomEvents = customEvents;
	  }
	});

	proto$2.e = proto$2.element;
	proto$2.be = proto$2.beginElement;
	proto$2.ee = proto$2.___endElement = proto$2.endElement;
	proto$2.t = proto$2.text;
	proto$2.h = proto$2.w = proto$2.write = proto$2.html;

	var AsyncVDOMBuilder_1 = AsyncVDOMBuilder;

	function safeRender(renderFunc, finalData, finalOut, shouldEnd) {
	  try {
	    renderFunc(finalData, finalOut);

	    if (shouldEnd) {
	      finalOut.end();
	    }
	  } catch (err) {
	    var actualEnd = finalOut.end;
	    finalOut.end = function() {};

	    setImmediate(function() {
	      finalOut.end = actualEnd;
	      finalOut.error(err);
	    });
	  }
	  return finalOut;
	}

	var renderable = function(target, renderer) {
	  var renderFunc =
	    renderer && (renderer.renderer || renderer.render || renderer);
	  var createOut = target.createOut || renderer.createOut || createOut_1;

	  return extend(target, {
	    createOut: createOut,

	    renderToString: function(data, callback) {
	      var localData = data || {};
	      var render = renderFunc || this._;
	      var globalData = localData.$global;
	      var out = createOut(globalData);

	      out.global.template = this;

	      if (globalData) {
	        localData.$global = undefined;
	      }

	      if (callback) {
	        out
	          .on("finish", function() {
	            callback(null, out.toString(), out);
	          })
	          .once("error", callback);

	        return safeRender(render, localData, out, true);
	      } else {
	        out.sync();
	        render(localData, out);
	        return out.toString();
	      }
	    },

	    renderSync: function(data) {
	      var localData = data || {};
	      var render = renderFunc || this._;
	      var globalData = localData.$global;
	      var out = createOut(globalData);
	      out.sync();

	      out.global.template = this;

	      if (globalData) {
	        localData.$global = undefined;
	      }

	      render(localData, out);
	      return out.___getResult();
	    },

	    /**
	     * Renders a template to either a stream (if the last
	     * argument is a Stream instance) or
	     * provides the output to a callback function (if the last
	     * argument is a Function).
	     *
	     * Supported signatures:
	     *
	     * render(data)
	     * render(data, out)
	     * render(data, stream)
	     * render(data, callback)
	     *
	     * @param  {Object} data The view model data for the template
	     * @param  {AsyncStream/AsyncVDOMBuilder} out A Stream, an AsyncStream/AsyncVDOMBuilder instance, or a callback function
	     * @return {AsyncStream/AsyncVDOMBuilder} Returns the AsyncStream/AsyncVDOMBuilder instance that the template is rendered to
	     */
	    render: function(data, out) {
	      var callback;
	      var finalOut;
	      var finalData;
	      var globalData;
	      var render = renderFunc || this._;
	      var shouldBuffer = this.___shouldBuffer;
	      var shouldEnd = true;

	      if (data) {
	        finalData = data;
	        if ((globalData = data.$global)) {
	          finalData.$global = undefined;
	        }
	      } else {
	        finalData = {};
	      }

	      if (out && out.___isOut) {
	        finalOut = out;
	        shouldEnd = false;
	        extend(out.global, globalData);
	      } else if (typeof out == "function") {
	        finalOut = createOut(globalData);
	        callback = out;
	      } else {
	        finalOut = createOut(
	          globalData, // global
	          out, // writer(AsyncStream) or parentNode(AsyncVDOMBuilder)
	          undefined, // parentOut
	          shouldBuffer // ignored by AsyncVDOMBuilder
	        );
	      }

	      if (callback) {
	        finalOut
	          .on("finish", function() {
	            callback(null, finalOut.___getResult());
	          })
	          .once("error", callback);
	      }

	      globalData = finalOut.global;

	      globalData.template = globalData.template || this;

	      return safeRender(render, finalData, finalOut, shouldEnd);
	    }
	  });
	};

	// helpers provide a core set of various utility methods
	// that are available in every template



	/**
	 * Method is for internal usage only. This method
	 * is invoked by code in a compiled Marko template and
	 * it is used to create a new Template instance.
	 * @private
	 */
	var t = function createTemplate(path) {
	  return new Template(path);
	};

	function Template(path, func) {
	  this.path = path;
	  this._ = func;
	  this.meta = undefined;
	}

	function createOut$1(globalData, parent, parentOut) {
	  return new AsyncVDOMBuilder_1(globalData, parent, parentOut);
	}

	var Template_prototype = (Template.prototype = {
	  createOut: createOut$1
	});

	renderable(Template_prototype);

	createOut_1.___setCreateOut(createOut$1);

	const _marko_template = t();

	const _marko_componentType = r("src/view/template.marko", () => _marko_template),
	      _marko_component = {};

	_marko_template._ = renderer(function (input, out, _component, component, state) {
	  out.be("h1", null, "0", component, null, 0);
	  out.t("Hello World", component);
	  out.ee();
	}, {
	  t: _marko_componentType,
	  i: true,
	  d: true
	}, _marko_component);
	_marko_template.Component = defineComponent(_marko_component, _marko_template._);

	return _marko_template;

}());
