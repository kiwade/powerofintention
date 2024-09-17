// Javascript Vendor Libraries
//
// Table of Contents
//
// 1. cash
// 2. component
// 3. global
// 4. anime
// 5. parallax
// 6. collasible

// 1. cash
/*! cash-dom 1.3.5, https://github.com/kenwheeler/cash @license MIT */
(function (factory) {
  window.cash = factory();
})(function () {
  var doc = document,
    win = window,
    ArrayProto = Array.prototype,
    slice = ArrayProto.slice,
    filter = ArrayProto.filter,
    push = ArrayProto.push;

  var noop = function () {},
    isFunction = function (item) {
      // @see https://crbug.com/568448
      return typeof item === typeof noop && item.call;
    },
    isString = function (item) {
      return typeof item === typeof "";
    };

  var idMatch = /^#[\w-]*$/,
    classMatch = /^\.[\w-]*$/,
    htmlMatch = /<.+>/,
    singlet = /^\w+$/;

  function find(selector, context) {
    context = context || doc;
    var elems = classMatch.test(selector)
      ? context.getElementsByClassName(selector.slice(1))
      : singlet.test(selector)
      ? context.getElementsByTagName(selector)
      : context.querySelectorAll(selector);
    return elems;
  }

  var frag;
  function parseHTML(str) {
    if (!frag) {
      frag = doc.implementation.createHTMLDocument(null);
      var base = frag.createElement("base");
      base.href = doc.location.href;
      frag.head.appendChild(base);
    }

    frag.body.innerHTML = str;

    return frag.body.childNodes;
  }

  function onReady(fn) {
    if (doc.readyState !== "loading") {
      fn();
    } else {
      doc.addEventListener("DOMContentLoaded", fn);
    }
  }

  function Init(selector, context) {
    if (!selector) {
      return this;
    }

    // If already a cash collection, don't do any further processing
    if (selector.cash && selector !== win) {
      return selector;
    }

    var elems = selector,
      i = 0,
      length;

    if (isString(selector)) {
      elems = idMatch.test(selector)
        ? // If an ID use the faster getElementById check
          doc.getElementById(selector.slice(1))
        : htmlMatch.test(selector)
        ? // If HTML, parse it into real elements
          parseHTML(selector)
        : // else use `find`
          find(selector, context);

      // If function, use as shortcut for DOM ready
    } else if (isFunction(selector)) {
      onReady(selector);
      return this;
    }

    if (!elems) {
      return this;
    }

    // If a single DOM element is passed in or received via ID, return the single element
    if (elems.nodeType || elems === win) {
      this[0] = elems;
      this.length = 1;
    } else {
      // Treat like an array and loop through each item.
      length = this.length = elems.length;
      for (; i < length; i++) {
        this[i] = elems[i];
      }
    }

    return this;
  }

  function cash(selector, context) {
    return new Init(selector, context);
  }

  var fn =
    (cash.fn =
    cash.prototype =
    Init.prototype =
      {
        // jshint ignore:line
        cash: true,
        length: 0,
        push: push,
        splice: ArrayProto.splice,
        map: ArrayProto.map,
        init: Init,
      });

  Object.defineProperty(fn, "constructor", { value: cash });

  cash.parseHTML = parseHTML;
  cash.noop = noop;
  cash.isFunction = isFunction;
  cash.isString = isString;

  cash.extend = fn.extend = function (target) {
    target = target || {};

    var args = slice.call(arguments),
      length = args.length,
      i = 1;

    if (args.length === 1) {
      target = this;
      i = 0;
    }

    for (; i < length; i++) {
      if (!args[i]) {
        continue;
      }
      for (var key in args[i]) {
        if (args[i].hasOwnProperty(key)) {
          target[key] = args[i][key];
        }
      }
    }

    return target;
  };

  function each(collection, callback) {
    var l = collection.length,
      i = 0;

    for (; i < l; i++) {
      if (
        callback.call(collection[i], collection[i], i, collection) === false
      ) {
        break;
      }
    }
  }

  function matches(el, selector) {
    var m =
      el &&
      (el.matches ||
        el.webkitMatchesSelector ||
        el.mozMatchesSelector ||
        el.msMatchesSelector ||
        el.oMatchesSelector);
    return !!m && m.call(el, selector);
  }

  function getCompareFunction(selector) {
    return (
      /* Use browser's `matches` function if string */
      isString(selector)
        ? matches
        : /* Match a cash element */
        selector.cash
        ? function (el) {
            return selector.is(el);
          }
        : /* Direct comparison */
          function (el, selector) {
            return el === selector;
          }
    );
  }

  function unique(collection) {
    return cash(
      slice.call(collection).filter(function (item, index, self) {
        return self.indexOf(item) === index;
      })
    );
  }

  cash.extend({
    merge: function (first, second) {
      var len = +second.length,
        i = first.length,
        j = 0;

      for (; j < len; i++, j++) {
        first[i] = second[j];
      }

      first.length = i;
      return first;
    },

    each: each,
    matches: matches,
    unique: unique,
    isArray: Array.isArray,
    isNumeric: function (n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    },
  });

  var uid = (cash.uid = "_cash" + Date.now());

  function getDataCache(node) {
    return (node[uid] = node[uid] || {});
  }

  function setData(node, key, value) {
    return (getDataCache(node)[key] = value);
  }

  function getData(node, key) {
    var c = getDataCache(node);
    if (c[key] === undefined) {
      c[key] = node.dataset
        ? node.dataset[key]
        : cash(node).attr("data-" + key);
    }
    return c[key];
  }

  function removeData(node, key) {
    var c = getDataCache(node);
    if (c) {
      delete c[key];
    } else if (node.dataset) {
      delete node.dataset[key];
    } else {
      cash(node).removeAttr("data-" + name);
    }
  }

  fn.extend({
    data: function (name, value) {
      if (isString(name)) {
        return value === undefined
          ? getData(this[0], name)
          : this.each(function (v) {
              return setData(v, name, value);
            });
      }

      for (var key in name) {
        this.data(key, name[key]);
      }

      return this;
    },

    removeData: function (key) {
      return this.each(function (v) {
        return removeData(v, key);
      });
    },
  });

  var notWhiteMatch = /\S+/g;

  function getClasses(c) {
    return isString(c) && c.match(notWhiteMatch);
  }

  function hasClass(v, c) {
    return v.classList
      ? v.classList.contains(c)
      : new RegExp("(^| )" + c + "( |$)", "gi").test(v.className);
  }

  function addClass(v, c, spacedName) {
    if (v.classList) {
      v.classList.add(c);
    } else if (spacedName.indexOf(" " + c + " ")) {
      v.className += " " + c;
    }
  }

  function removeClass(v, c) {
    if (v.classList) {
      v.classList.remove(c);
    } else {
      v.className = v.className.replace(c, "");
    }
  }

  fn.extend({
    addClass: function (c) {
      var classes = getClasses(c);

      return classes
        ? this.each(function (v) {
            var spacedName = " " + v.className + " ";
            each(classes, function (c) {
              addClass(v, c, spacedName);
            });
          })
        : this;
    },

    attr: function (name, value) {
      if (!name) {
        return undefined;
      }

      if (isString(name)) {
        if (value === undefined) {
          return this[0]
            ? this[0].getAttribute
              ? this[0].getAttribute(name)
              : this[0][name]
            : undefined;
        }

        return this.each(function (v) {
          if (v.setAttribute) {
            v.setAttribute(name, value);
          } else {
            v[name] = value;
          }
        });
      }

      for (var key in name) {
        this.attr(key, name[key]);
      }

      return this;
    },

    hasClass: function (c) {
      var check = false,
        classes = getClasses(c);
      if (classes && classes.length) {
        this.each(function (v) {
          check = hasClass(v, classes[0]);
          return !check;
        });
      }
      return check;
    },

    prop: function (name, value) {
      if (isString(name)) {
        return value === undefined
          ? this[0][name]
          : this.each(function (v) {
              v[name] = value;
            });
      }

      for (var key in name) {
        this.prop(key, name[key]);
      }

      return this;
    },

    removeAttr: function (name) {
      return this.each(function (v) {
        if (v.removeAttribute) {
          v.removeAttribute(name);
        } else {
          delete v[name];
        }
      });
    },

    removeClass: function (c) {
      if (!arguments.length) {
        return this.attr("class", "");
      }
      var classes = getClasses(c);
      return classes
        ? this.each(function (v) {
            each(classes, function (c) {
              removeClass(v, c);
            });
          })
        : this;
    },

    removeProp: function (name) {
      return this.each(function (v) {
        delete v[name];
      });
    },

    toggleClass: function (c, state) {
      if (state !== undefined) {
        return this[state ? "addClass" : "removeClass"](c);
      }
      var classes = getClasses(c);
      return classes
        ? this.each(function (v) {
            var spacedName = " " + v.className + " ";
            each(classes, function (c) {
              if (hasClass(v, c)) {
                removeClass(v, c);
              } else {
                addClass(v, c, spacedName);
              }
            });
          })
        : this;
    },
  });

  fn.extend({
    add: function (selector, context) {
      return unique(cash.merge(this, cash(selector, context)));
    },

    each: function (callback) {
      each(this, callback);
      return this;
    },

    eq: function (index) {
      return cash(this.get(index));
    },

    filter: function (selector) {
      if (!selector) {
        return this;
      }

      var comparator = isFunction(selector)
        ? selector
        : getCompareFunction(selector);

      return cash(
        filter.call(this, function (e) {
          return comparator(e, selector);
        })
      );
    },

    first: function () {
      return this.eq(0);
    },

    get: function (index) {
      if (index === undefined) {
        return slice.call(this);
      }
      return index < 0 ? this[index + this.length] : this[index];
    },

    index: function (elem) {
      var child = elem ? cash(elem)[0] : this[0],
        collection = elem ? this : cash(child).parent().children();
      return slice.call(collection).indexOf(child);
    },

    last: function () {
      return this.eq(-1);
    },
  });

  var camelCase = (function () {
    var camelRegex = /(?:^\w|[A-Z]|\b\w)/g,
      whiteSpace = /[\s-_]+/g;
    return function (str) {
      return str
        .replace(camelRegex, function (letter, index) {
          return letter[index === 0 ? "toLowerCase" : "toUpperCase"]();
        })
        .replace(whiteSpace, "");
    };
  })();

  var getPrefixedProp = (function () {
    var cache = {},
      doc = document,
      div = doc.createElement("div"),
      style = div.style;

    return function (prop) {
      prop = camelCase(prop);
      if (cache[prop]) {
        return cache[prop];
      }

      var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1),
        prefixes = ["webkit", "moz", "ms", "o"],
        props = (prop + " " + prefixes.join(ucProp + " ") + ucProp).split(" ");

      each(props, function (p) {
        if (p in style) {
          cache[p] = prop = cache[prop] = p;
          return false;
        }
      });

      return cache[prop];
    };
  })();

  cash.prefixedProp = getPrefixedProp;
  cash.camelCase = camelCase;

  fn.extend({
    css: function (prop, value) {
      if (isString(prop)) {
        prop = getPrefixedProp(prop);
        return arguments.length > 1
          ? this.each(function (v) {
              return (v.style[prop] = value);
            })
          : win.getComputedStyle(this[0])[prop];
      }

      for (var key in prop) {
        this.css(key, prop[key]);
      }

      return this;
    },
  });

  function compute(el, prop) {
    return parseInt(win.getComputedStyle(el[0], null)[prop], 10) || 0;
  }

  each(["Width", "Height"], function (v) {
    var lower = v.toLowerCase();

    fn[lower] = function () {
      return this[0].getBoundingClientRect()[lower];
    };

    fn["inner" + v] = function () {
      return this[0]["client" + v];
    };

    fn["outer" + v] = function (margins) {
      return (
        this[0]["offset" + v] +
        (margins
          ? compute(this, "margin" + (v === "Width" ? "Left" : "Top")) +
            compute(this, "margin" + (v === "Width" ? "Right" : "Bottom"))
          : 0)
      );
    };
  });

  function registerEvent(node, eventName, callback) {
    var eventCache =
      getData(node, "_cashEvents") || setData(node, "_cashEvents", {});
    eventCache[eventName] = eventCache[eventName] || [];
    eventCache[eventName].push(callback);
    node.addEventListener(eventName, callback);
  }

  function removeEvent(node, eventName, callback) {
    var events = getData(node, "_cashEvents"),
      eventCache = events && events[eventName],
      index;

    if (!eventCache) {
      return;
    }

    if (callback) {
      node.removeEventListener(eventName, callback);
      index = eventCache.indexOf(callback);
      if (index >= 0) {
        eventCache.splice(index, 1);
      }
    } else {
      each(eventCache, function (event) {
        node.removeEventListener(eventName, event);
      });
      eventCache = [];
    }
  }

  fn.extend({
    off: function (eventName, callback) {
      return this.each(function (v) {
        return removeEvent(v, eventName, callback);
      });
    },

    on: function (eventName, delegate, callback, runOnce) {
      // jshint ignore:line
      var originalCallback;
      if (!isString(eventName)) {
        for (var key in eventName) {
          this.on(key, delegate, eventName[key]);
        }
        return this;
      }

      if (isFunction(delegate)) {
        callback = delegate;
        delegate = null;
      }

      if (eventName === "ready") {
        onReady(callback);
        return this;
      }

      if (delegate) {
        originalCallback = callback;
        callback = function (e) {
          var t = e.target;
          while (!matches(t, delegate)) {
            if (t === this || t === null) {
              return (t = false);
            }

            t = t.parentNode;
          }

          if (t) {
            originalCallback.call(t, e);
          }
        };
      }

      return this.each(function (v) {
        var finalCallback = callback;
        if (runOnce) {
          finalCallback = function () {
            callback.apply(this, arguments);
            removeEvent(v, eventName, finalCallback);
          };
        }
        registerEvent(v, eventName, finalCallback);
      });
    },

    one: function (eventName, delegate, callback) {
      return this.on(eventName, delegate, callback, true);
    },

    ready: onReady,

    /**
     * Modified
     * Triggers browser event
     * @param String eventName
     * @param Object data - Add properties to event object
     */
    trigger: function (eventName, data) {
      if (document.createEvent) {
        let evt = document.createEvent("HTMLEvents");
        evt.initEvent(eventName, true, false);
        evt = this.extend(evt, data);
        return this.each(function (v) {
          return v.dispatchEvent(evt);
        });
      }
    },
  });

  function encode(name, value) {
    return (
      "&" +
      encodeURIComponent(name) +
      "=" +
      encodeURIComponent(value).replace(/%20/g, "+")
    );
  }

  function getSelectMultiple_(el) {
    var values = [];
    each(el.options, function (o) {
      if (o.selected) {
        values.push(o.value);
      }
    });
    return values.length ? values : null;
  }

  function getSelectSingle_(el) {
    var selectedIndex = el.selectedIndex;
    return selectedIndex >= 0 ? el.options[selectedIndex].value : null;
  }

  function getValue(el) {
    var type = el.type;
    if (!type) {
      return null;
    }
    switch (type.toLowerCase()) {
      case "select-one":
        return getSelectSingle_(el);
      case "select-multiple":
        return getSelectMultiple_(el);
      case "radio":
        return el.checked ? el.value : null;
      case "checkbox":
        return el.checked ? el.value : null;
      default:
        return el.value ? el.value : null;
    }
  }

  fn.extend({
    serialize: function () {
      var query = "";

      each(this[0].elements || this, function (el) {
        if (el.disabled || el.tagName === "FIELDSET") {
          return;
        }
        var name = el.name;
        switch (el.type.toLowerCase()) {
          case "file":
          case "reset":
          case "submit":
          case "button":
            break;
          case "select-multiple":
            var values = getValue(el);
            if (values !== null) {
              each(values, function (value) {
                query += encode(name, value);
              });
            }
            break;
          default:
            var value = getValue(el);
            if (value !== null) {
              query += encode(name, value);
            }
        }
      });

      return query.substr(1);
    },

    val: function (value) {
      if (value === undefined) {
        return getValue(this[0]);
      }

      return this.each(function (v) {
        return (v.value = value);
      });
    },
  });

  function insertElement(el, child, prepend) {
    if (prepend) {
      var first = el.childNodes[0];
      el.insertBefore(child, first);
    } else {
      el.appendChild(child);
    }
  }

  function insertContent(parent, child, prepend) {
    var str = isString(child);

    if (!str && child.length) {
      each(child, function (v) {
        return insertContent(parent, v, prepend);
      });
      return;
    }

    each(
      parent,
      str
        ? function (v) {
            return v.insertAdjacentHTML(
              prepend ? "afterbegin" : "beforeend",
              child
            );
          }
        : function (v, i) {
            return insertElement(
              v,
              i === 0 ? child : child.cloneNode(true),
              prepend
            );
          }
    );
  }

  fn.extend({
    after: function (selector) {
      cash(selector).insertAfter(this);
      return this;
    },

    append: function (content) {
      insertContent(this, content);
      return this;
    },

    appendTo: function (parent) {
      insertContent(cash(parent), this);
      return this;
    },

    before: function (selector) {
      cash(selector).insertBefore(this);
      return this;
    },

    clone: function () {
      return cash(
        this.map(function (v) {
          return v.cloneNode(true);
        })
      );
    },

    empty: function () {
      this.html("");
      return this;
    },

    html: function (content) {
      if (content === undefined) {
        return this[0].innerHTML;
      }
      var source = content.nodeType ? content[0].outerHTML : content;
      return this.each(function (v) {
        return (v.innerHTML = source);
      });
    },

    insertAfter: function (selector) {
      var _this = this;

      cash(selector).each(function (el, i) {
        var parent = el.parentNode,
          sibling = el.nextSibling;
        _this.each(function (v) {
          parent.insertBefore(i === 0 ? v : v.cloneNode(true), sibling);
        });
      });

      return this;
    },

    insertBefore: function (selector) {
      var _this2 = this;
      cash(selector).each(function (el, i) {
        var parent = el.parentNode;
        _this2.each(function (v) {
          parent.insertBefore(i === 0 ? v : v.cloneNode(true), el);
        });
      });
      return this;
    },

    prepend: function (content) {
      insertContent(this, content, true);
      return this;
    },

    prependTo: function (parent) {
      insertContent(cash(parent), this, true);
      return this;
    },

    remove: function () {
      return this.each(function (v) {
        if (!!v.parentNode) {
          return v.parentNode.removeChild(v);
        }
      });
    },

    text: function (content) {
      if (content === undefined) {
        return this[0].textContent;
      }
      return this.each(function (v) {
        return (v.textContent = content);
      });
    },
  });

  var docEl = doc.documentElement;

  fn.extend({
    position: function () {
      var el = this[0];
      return {
        left: el.offsetLeft,
        top: el.offsetTop,
      };
    },

    offset: function () {
      var rect = this[0].getBoundingClientRect();
      return {
        top: rect.top + win.pageYOffset - docEl.clientTop,
        left: rect.left + win.pageXOffset - docEl.clientLeft,
      };
    },

    offsetParent: function () {
      return cash(this[0].offsetParent);
    },
  });

  fn.extend({
    children: function (selector) {
      var elems = [];
      this.each(function (el) {
        push.apply(elems, el.children);
      });
      elems = unique(elems);

      return !selector
        ? elems
        : elems.filter(function (v) {
            return matches(v, selector);
          });
    },

    closest: function (selector) {
      if (!selector || this.length < 1) {
        return cash();
      }
      if (this.is(selector)) {
        return this.filter(selector);
      }
      return this.parent().closest(selector);
    },

    is: function (selector) {
      if (!selector) {
        return false;
      }

      var match = false,
        comparator = getCompareFunction(selector);

      this.each(function (el) {
        match = comparator(el, selector);
        return !match;
      });

      return match;
    },

    find: function (selector) {
      if (!selector || selector.nodeType) {
        return cash(selector && this.has(selector).length ? selector : null);
      }

      var elems = [];
      this.each(function (el) {
        push.apply(elems, find(selector, el));
      });

      return unique(elems);
    },

    has: function (selector) {
      var comparator = isString(selector)
        ? function (el) {
            return find(selector, el).length !== 0;
          }
        : function (el) {
            return el.contains(selector);
          };

      return this.filter(comparator);
    },

    next: function () {
      return cash(this[0].nextElementSibling);
    },

    not: function (selector) {
      if (!selector) {
        return this;
      }

      var comparator = getCompareFunction(selector);

      return this.filter(function (el) {
        return !comparator(el, selector);
      });
    },

    parent: function () {
      var result = [];

      this.each(function (item) {
        if (item && item.parentNode) {
          result.push(item.parentNode);
        }
      });

      return unique(result);
    },

    parents: function (selector) {
      var last,
        result = [];

      this.each(function (item) {
        last = item;

        while (last && last.parentNode && last !== doc.body.parentNode) {
          last = last.parentNode;

          if (!selector || (selector && matches(last, selector))) {
            result.push(last);
          }
        }
      });

      return unique(result);
    },

    prev: function () {
      return cash(this[0].previousElementSibling);
    },

    siblings: function (selector) {
      var collection = this.parent().children(selector),
        el = this[0];

      return collection.filter(function (i) {
        return i !== el;
      });
    },
  });

  return cash;
});

// 2. component
class Component {
  /**
   * Generic constructor for all components
   * @constructor
   * @param {Element} el
   * @param {Object} options
   */
  constructor(classDef, el, options) {
    // Display error if el is valid HTML Element
    if (!(el instanceof Element)) {
      console.error(Error(el + " is not an HTML Element"));
    }

    // If exists, destroy and reinitialize in child
    let ins = classDef.getInstance(el);
    if (!!ins) {
      ins.destroy();
    }

    this.el = el;
    this.$el = cash(el);
  }

  /**
   * Initializes components
   * @param {class} classDef
   * @param {Element | NodeList | jQuery} els
   * @param {Object} options
   */
  static init(classDef, els, options) {
    let instances = null;
    if (els instanceof Element) {
      instances = new classDef(els, options);
    } else if (!!els && (els.jquery || els.cash || els instanceof NodeList)) {
      let instancesArr = [];
      for (let i = 0; i < els.length; i++) {
        instancesArr.push(new classDef(els[i], options));
      }
      instances = instancesArr;
    }

    return instances;
  }
}

// 3. global
// Required for Meteor package, the use of window prevents export by Meteor
(function (window) {
  if (window.Package) {
    M = {};
  } else {
    window.M = {};
  }

  // Check for jQuery
  M.jQueryLoaded = !!window.jQuery;
})(window);

// AMD
if (typeof define === "function" && define.amd) {
  define("M", [], function () {
    return M;
  });

  // Common JS
} else if (typeof exports !== "undefined" && !exports.nodeType) {
  if (typeof module !== "undefined" && !module.nodeType && module.exports) {
    exports = module.exports = M;
  }
  exports.default = M;
}

M.version = "1.0.0";

M.keys = {
  TAB: 9,
  ENTER: 13,
  ESC: 27,
  ARROW_UP: 38,
  ARROW_DOWN: 40,
};

/**
 * TabPress Keydown handler
 */
M.tabPressed = false;
M.keyDown = false;
let docHandleKeydown = function (e) {
  M.keyDown = true;
  if (
    e.which === M.keys.TAB ||
    e.which === M.keys.ARROW_DOWN ||
    e.which === M.keys.ARROW_UP
  ) {
    M.tabPressed = true;
  }
};
let docHandleKeyup = function (e) {
  M.keyDown = false;
  if (
    e.which === M.keys.TAB ||
    e.which === M.keys.ARROW_DOWN ||
    e.which === M.keys.ARROW_UP
  ) {
    M.tabPressed = false;
  }
};
let docHandleFocus = function (e) {
  if (M.keyDown) {
    document.body.classList.add("keyboard-focused");
  }
};
let docHandleBlur = function (e) {
  document.body.classList.remove("keyboard-focused");
};
document.addEventListener("keydown", docHandleKeydown, true);
document.addEventListener("keyup", docHandleKeyup, true);
document.addEventListener("focus", docHandleFocus, true);
document.addEventListener("blur", docHandleBlur, true);

/**
 * Initialize jQuery wrapper for plugin
 * @param {Class} plugin  javascript class
 * @param {string} pluginName  jQuery plugin name
 * @param {string} classRef  Class reference name
 */
M.initializeJqueryWrapper = function (plugin, pluginName, classRef) {
  jQuery.fn[pluginName] = function (methodOrOptions) {
    // Call plugin method if valid method name is passed in
    if (plugin.prototype[methodOrOptions]) {
      let params = Array.prototype.slice.call(arguments, 1);

      // Getter methods
      if (methodOrOptions.slice(0, 3) === "get") {
        let instance = this.first()[0][classRef];
        return instance[methodOrOptions].apply(instance, params);
      }

      // Void methods
      return this.each(function () {
        let instance = this[classRef];
        instance[methodOrOptions].apply(instance, params);
      });

      // Initialize plugin if options or no argument is passed in
    } else if (typeof methodOrOptions === "object" || !methodOrOptions) {
      plugin.init(this, arguments[0]);
      return this;
    }

    // Return error if an unrecognized  method name is passed in
    jQuery.error(
      `Method ${methodOrOptions} does not exist on jQuery.${pluginName}`
    );
  };
};

/**
 * Automatically initialize components
 * @param {Element} context  DOM Element to search within for components
 */
M.AutoInit = function (context) {
  // Use document.body if no context is given
  let root = !!context ? context : document.body;

  let registry = {
    Autocomplete: root.querySelectorAll(".autocomplete:not(.no-autoinit)"),
    Carousel: root.querySelectorAll(".carousel:not(.no-autoinit)"),
    Chips: root.querySelectorAll(".chips:not(.no-autoinit)"),
    Collapsible: root.querySelectorAll(".collapsible:not(.no-autoinit)"),
    Datepicker: root.querySelectorAll(".datepicker:not(.no-autoinit)"),
    Dropdown: root.querySelectorAll(".dropdown-trigger:not(.no-autoinit)"),
    Materialbox: root.querySelectorAll(".materialboxed:not(.no-autoinit)"),
    Modal: root.querySelectorAll(".modal:not(.no-autoinit)"),
    Parallax: root.querySelectorAll(".parallax:not(.no-autoinit)"),
    Pushpin: root.querySelectorAll(".pushpin:not(.no-autoinit)"),
    ScrollSpy: root.querySelectorAll(".scrollspy:not(.no-autoinit)"),
    FormSelect: root.querySelectorAll("select:not(.no-autoinit)"),
    Sidenav: root.querySelectorAll(".sidenav:not(.no-autoinit)"),
    Tabs: root.querySelectorAll(".tabs:not(.no-autoinit)"),
    TapTarget: root.querySelectorAll(".tap-target:not(.no-autoinit)"),
    Timepicker: root.querySelectorAll(".timepicker:not(.no-autoinit)"),
    Tooltip: root.querySelectorAll(".tooltipped:not(.no-autoinit)"),
    FloatingActionButton: root.querySelectorAll(
      ".fixed-action-btn:not(.no-autoinit)"
    ),
  };

  for (let pluginName in registry) {
    let plugin = M[pluginName];
    plugin.init(registry[pluginName]);
  }
};

/**
 * Generate approximated selector string for a jQuery object
 * @param {jQuery} obj  jQuery object to be parsed
 * @returns {string}
 */
M.objectSelectorString = function (obj) {
  let tagStr = obj.prop("tagName") || "";
  let idStr = obj.attr("id") || "";
  let classStr = obj.attr("class") || "";
  return (tagStr + idStr + classStr).replace(/\s/g, "");
};

// Unique Random ID
M.guid = (function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return function () {
    return (
      s4() +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      s4() +
      s4()
    );
  };
})();

/**
 * Escapes hash from special characters
 * @param {string} hash  String returned from this.hash
 * @returns {string}
 */
M.escapeHash = function (hash) {
  return hash.replace(/(:|\.|\[|\]|,|=|\/)/g, "\\$1");
};

M.elementOrParentIsFixed = function (element) {
  let $element = $(element);
  let $checkElements = $element.add($element.parents());
  let isFixed = false;
  $checkElements.each(function () {
    if ($(this).css("position") === "fixed") {
      isFixed = true;
      return false;
    }
  });
  return isFixed;
};

/**
 * @typedef {Object} Edges
 * @property {Boolean} top  If the top edge was exceeded
 * @property {Boolean} right  If the right edge was exceeded
 * @property {Boolean} bottom  If the bottom edge was exceeded
 * @property {Boolean} left  If the left edge was exceeded
 */

/**
 * @typedef {Object} Bounding
 * @property {Number} left  left offset coordinate
 * @property {Number} top  top offset coordinate
 * @property {Number} width
 * @property {Number} height
 */

/**
 * Escapes hash from special characters
 * @param {Element} container  Container element that acts as the boundary
 * @param {Bounding} bounding  element bounding that is being checked
 * @param {Number} offset  offset from edge that counts as exceeding
 * @returns {Edges}
 */
M.checkWithinContainer = function (container, bounding, offset) {
  let edges = {
    top: false,
    right: false,
    bottom: false,
    left: false,
  };

  let containerRect = container.getBoundingClientRect();
  // If body element is smaller than viewport, use viewport height instead.
  let containerBottom =
    container === document.body
      ? Math.max(containerRect.bottom, window.innerHeight)
      : containerRect.bottom;

  let scrollLeft = container.scrollLeft;
  let scrollTop = container.scrollTop;

  let scrolledX = bounding.left - scrollLeft;
  let scrolledY = bounding.top - scrollTop;

  // Check for container and viewport for each edge
  if (scrolledX < containerRect.left + offset || scrolledX < offset) {
    edges.left = true;
  }

  if (
    scrolledX + bounding.width > containerRect.right - offset ||
    scrolledX + bounding.width > window.innerWidth - offset
  ) {
    edges.right = true;
  }

  if (scrolledY < containerRect.top + offset || scrolledY < offset) {
    edges.top = true;
  }

  if (
    scrolledY + bounding.height > containerBottom - offset ||
    scrolledY + bounding.height > window.innerHeight - offset
  ) {
    edges.bottom = true;
  }

  return edges;
};

M.checkPossibleAlignments = function (el, container, bounding, offset) {
  let canAlign = {
    top: true,
    right: true,
    bottom: true,
    left: true,
    spaceOnTop: null,
    spaceOnRight: null,
    spaceOnBottom: null,
    spaceOnLeft: null,
  };

  let containerAllowsOverflow =
    getComputedStyle(container).overflow === "visible";
  let containerRect = container.getBoundingClientRect();
  let containerHeight = Math.min(containerRect.height, window.innerHeight);
  let containerWidth = Math.min(containerRect.width, window.innerWidth);
  let elOffsetRect = el.getBoundingClientRect();

  let scrollLeft = container.scrollLeft;
  let scrollTop = container.scrollTop;

  let scrolledX = bounding.left - scrollLeft;
  let scrolledYTopEdge = bounding.top - scrollTop;
  let scrolledYBottomEdge = bounding.top + elOffsetRect.height - scrollTop;

  // Check for container and viewport for left
  canAlign.spaceOnRight = !containerAllowsOverflow
    ? containerWidth - (scrolledX + bounding.width)
    : window.innerWidth - (elOffsetRect.left + bounding.width);
  if (canAlign.spaceOnRight < 0) {
    canAlign.left = false;
  }

  // Check for container and viewport for Right
  canAlign.spaceOnLeft = !containerAllowsOverflow
    ? scrolledX - bounding.width + elOffsetRect.width
    : elOffsetRect.right - bounding.width;
  if (canAlign.spaceOnLeft < 0) {
    canAlign.right = false;
  }

  // Check for container and viewport for Top
  canAlign.spaceOnBottom = !containerAllowsOverflow
    ? containerHeight - (scrolledYTopEdge + bounding.height + offset)
    : window.innerHeight - (elOffsetRect.top + bounding.height + offset);
  if (canAlign.spaceOnBottom < 0) {
    canAlign.top = false;
  }

  // Check for container and viewport for Bottom
  canAlign.spaceOnTop = !containerAllowsOverflow
    ? scrolledYBottomEdge - (bounding.height - offset)
    : elOffsetRect.bottom - (bounding.height + offset);
  if (canAlign.spaceOnTop < 0) {
    canAlign.bottom = false;
  }

  return canAlign;
};

M.getOverflowParent = function (element) {
  if (element == null) {
    return null;
  }

  if (
    element === document.body ||
    getComputedStyle(element).overflow !== "visible"
  ) {
    return element;
  }

  return M.getOverflowParent(element.parentElement);
};

/**
 * Gets id of component from a trigger
 * @param {Element} trigger  trigger
 * @returns {string}
 */
M.getIdFromTrigger = function (trigger) {
  let id = trigger.getAttribute("data-target");
  if (!id) {
    id = trigger.getAttribute("href");
    if (id) {
      id = id.slice(1);
    } else {
      id = "";
    }
  }
  return id;
};

/**
 * Multi browser support for document scroll top
 * @returns {Number}
 */
M.getDocumentScrollTop = function () {
  return (
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
};

/**
 * Multi browser support for document scroll left
 * @returns {Number}
 */
M.getDocumentScrollLeft = function () {
  return (
    window.pageXOffset ||
    document.documentElement.scrollLeft ||
    document.body.scrollLeft ||
    0
  );
};

/**
 * @typedef {Object} Edges
 * @property {Boolean} top  If the top edge was exceeded
 * @property {Boolean} right  If the right edge was exceeded
 * @property {Boolean} bottom  If the bottom edge was exceeded
 * @property {Boolean} left  If the left edge was exceeded
 */

/**
 * @typedef {Object} Bounding
 * @property {Number} left  left offset coordinate
 * @property {Number} top  top offset coordinate
 * @property {Number} width
 * @property {Number} height
 */

/**
 * Get time in ms
 * @license https://raw.github.com/jashkenas/underscore/master/LICENSE
 * @type {function}
 * @return {number}
 */
let getTime =
  Date.now ||
  function () {
    return new Date().getTime();
  };

/**
 * Returns a function, that, when invoked, will only be triggered at most once
 * during a given window of time. Normally, the throttled function will run
 * as much as it can, without ever going more than once per `wait` duration;
 * but if you'd like to disable the execution on the leading edge, pass
 * `{leading: false}`. To disable execution on the trailing edge, ditto.
 * @license https://raw.github.com/jashkenas/underscore/master/LICENSE
 * @param {function} func
 * @param {number} wait
 * @param {Object=} options
 * @returns {Function}
 */
M.throttle = function (func, wait, options) {
  let context, args, result;
  let timeout = null;
  let previous = 0;
  options || (options = {});
  let later = function () {
    previous = options.leading === false ? 0 : getTime();
    timeout = null;
    result = func.apply(context, args);
    context = args = null;
  };
  return function () {
    let now = getTime();
    if (!previous && options.leading === false) previous = now;
    let remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(context, args);
      context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

// 4. anime
/*
 v2.2.0
 2017 Julian Garnier
 Released under the MIT license
*/
var $jscomp={scope:{}};$jscomp.defineProperty="function"==typeof Object.defineProperties?Object.defineProperty:function(e,r,p){if(p.get||p.set)throw new TypeError("ES3 does not support getters and setters.");e!=Array.prototype&&e!=Object.prototype&&(e[r]=p.value)};$jscomp.getGlobal=function(e){return"undefined"!=typeof window&&window===e?e:"undefined"!=typeof global&&null!=global?global:e};$jscomp.global=$jscomp.getGlobal(this);$jscomp.SYMBOL_PREFIX="jscomp_symbol_";
$jscomp.initSymbol=function(){$jscomp.initSymbol=function(){};$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)};$jscomp.symbolCounter_=0;$jscomp.Symbol=function(e){return $jscomp.SYMBOL_PREFIX+(e||"")+$jscomp.symbolCounter_++};
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var e=$jscomp.global.Symbol.iterator;e||(e=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator"));"function"!=typeof Array.prototype[e]&&$jscomp.defineProperty(Array.prototype,e,{configurable:!0,writable:!0,value:function(){return $jscomp.arrayIterator(this)}});$jscomp.initSymbolIterator=function(){}};$jscomp.arrayIterator=function(e){var r=0;return $jscomp.iteratorPrototype(function(){return r<e.length?{done:!1,value:e[r++]}:{done:!0}})};
$jscomp.iteratorPrototype=function(e){$jscomp.initSymbolIterator();e={next:e};e[$jscomp.global.Symbol.iterator]=function(){return this};return e};$jscomp.array=$jscomp.array||{};$jscomp.iteratorFromArray=function(e,r){$jscomp.initSymbolIterator();e instanceof String&&(e+="");var p=0,m={next:function(){if(p<e.length){var u=p++;return{value:r(u,e[u]),done:!1}}m.next=function(){return{done:!0,value:void 0}};return m.next()}};m[Symbol.iterator]=function(){return m};return m};
$jscomp.polyfill=function(e,r,p,m){if(r){p=$jscomp.global;e=e.split(".");for(m=0;m<e.length-1;m++){var u=e[m];u in p||(p[u]={});p=p[u]}e=e[e.length-1];m=p[e];r=r(m);r!=m&&null!=r&&$jscomp.defineProperty(p,e,{configurable:!0,writable:!0,value:r})}};$jscomp.polyfill("Array.prototype.keys",function(e){return e?e:function(){return $jscomp.iteratorFromArray(this,function(e){return e})}},"es6-impl","es3");var $jscomp$this=this;
(function(r){M.anime=r()})(function(){function e(a){if(!h.col(a))try{return document.querySelectorAll(a)}catch(c){}}function r(a,c){for(var d=a.length,b=2<=arguments.length?arguments[1]:void 0,f=[],n=0;n<d;n++)if(n in a){var k=a[n];c.call(b,k,n,a)&&f.push(k)}return f}function p(a){return a.reduce(function(a,d){return a.concat(h.arr(d)?p(d):d)},[])}function m(a){if(h.arr(a))return a;
h.str(a)&&(a=e(a)||a);return a instanceof NodeList||a instanceof HTMLCollection?[].slice.call(a):[a]}function u(a,c){return a.some(function(a){return a===c})}function C(a){var c={},d;for(d in a)c[d]=a[d];return c}function D(a,c){var d=C(a),b;for(b in a)d[b]=c.hasOwnProperty(b)?c[b]:a[b];return d}function z(a,c){var d=C(a),b;for(b in c)d[b]=h.und(a[b])?c[b]:a[b];return d}function T(a){a=a.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,function(a,c,d,k){return c+c+d+d+k+k});var c=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);
a=parseInt(c[1],16);var d=parseInt(c[2],16),c=parseInt(c[3],16);return"rgba("+a+","+d+","+c+",1)"}function U(a){function c(a,c,b){0>b&&(b+=1);1<b&&--b;return b<1/6?a+6*(c-a)*b:.5>b?c:b<2/3?a+(c-a)*(2/3-b)*6:a}var d=/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(a)||/hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(a);a=parseInt(d[1])/360;var b=parseInt(d[2])/100,f=parseInt(d[3])/100,d=d[4]||1;if(0==b)f=b=a=f;else{var n=.5>f?f*(1+b):f+b-f*b,k=2*f-n,f=c(k,n,a+1/3),b=c(k,n,a);a=c(k,n,a-1/3)}return"rgba("+
255*f+","+255*b+","+255*a+","+d+")"}function y(a){if(a=/([\+\-]?[0-9#\.]+)(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(a))return a[2]}function V(a){if(-1<a.indexOf("translate")||"perspective"===a)return"px";if(-1<a.indexOf("rotate")||-1<a.indexOf("skew"))return"deg"}function I(a,c){return h.fnc(a)?a(c.target,c.id,c.total):a}function E(a,c){if(c in a.style)return getComputedStyle(a).getPropertyValue(c.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase())||"0"}function J(a,c){if(h.dom(a)&&
u(W,c))return"transform";if(h.dom(a)&&(a.getAttribute(c)||h.svg(a)&&a[c]))return"attribute";if(h.dom(a)&&"transform"!==c&&E(a,c))return"css";if(null!=a[c])return"object"}function X(a,c){var d=V(c),d=-1<c.indexOf("scale")?1:0+d;a=a.style.transform;if(!a)return d;for(var b=[],f=[],n=[],k=/(\w+)\((.+?)\)/g;b=k.exec(a);)f.push(b[1]),n.push(b[2]);a=r(n,function(a,b){return f[b]===c});return a.length?a[0]:d}function K(a,c){switch(J(a,c)){case "transform":return X(a,c);case "css":return E(a,c);case "attribute":return a.getAttribute(c)}return a[c]||
0}function L(a,c){var d=/^(\*=|\+=|-=)/.exec(a);if(!d)return a;var b=y(a)||0;c=parseFloat(c);a=parseFloat(a.replace(d[0],""));switch(d[0][0]){case "+":return c+a+b;case "-":return c-a+b;case "*":return c*a+b}}function F(a,c){return Math.sqrt(Math.pow(c.x-a.x,2)+Math.pow(c.y-a.y,2))}function M(a){a=a.points;for(var c=0,d,b=0;b<a.numberOfItems;b++){var f=a.getItem(b);0<b&&(c+=F(d,f));d=f}return c}function N(a){if(a.getTotalLength)return a.getTotalLength();switch(a.tagName.toLowerCase()){case "circle":return 2*
Math.PI*a.getAttribute("r");case "rect":return 2*a.getAttribute("width")+2*a.getAttribute("height");case "line":return F({x:a.getAttribute("x1"),y:a.getAttribute("y1")},{x:a.getAttribute("x2"),y:a.getAttribute("y2")});case "polyline":return M(a);case "polygon":var c=a.points;return M(a)+F(c.getItem(c.numberOfItems-1),c.getItem(0))}}function Y(a,c){function d(b){b=void 0===b?0:b;return a.el.getPointAtLength(1<=c+b?c+b:0)}var b=d(),f=d(-1),n=d(1);switch(a.property){case "x":return b.x;case "y":return b.y;
case "angle":return 180*Math.atan2(n.y-f.y,n.x-f.x)/Math.PI}}function O(a,c){var d=/-?\d*\.?\d+/g,b;b=h.pth(a)?a.totalLength:a;if(h.col(b))if(h.rgb(b)){var f=/rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(b);b=f?"rgba("+f[1]+",1)":b}else b=h.hex(b)?T(b):h.hsl(b)?U(b):void 0;else f=(f=y(b))?b.substr(0,b.length-f.length):b,b=c&&!/\s/g.test(b)?f+c:f;b+="";return{original:b,numbers:b.match(d)?b.match(d).map(Number):[0],strings:h.str(a)||c?b.split(d):[]}}function P(a){a=a?p(h.arr(a)?a.map(m):m(a)):[];return r(a,
function(a,d,b){return b.indexOf(a)===d})}function Z(a){var c=P(a);return c.map(function(a,b){return{target:a,id:b,total:c.length}})}function aa(a,c){var d=C(c);if(h.arr(a)){var b=a.length;2!==b||h.obj(a[0])?h.fnc(c.duration)||(d.duration=c.duration/b):a={value:a}}return m(a).map(function(a,b){b=b?0:c.delay;a=h.obj(a)&&!h.pth(a)?a:{value:a};h.und(a.delay)&&(a.delay=b);return a}).map(function(a){return z(a,d)})}function ba(a,c){var d={},b;for(b in a){var f=I(a[b],c);h.arr(f)&&(f=f.map(function(a){return I(a,
c)}),1===f.length&&(f=f[0]));d[b]=f}d.duration=parseFloat(d.duration);d.delay=parseFloat(d.delay);return d}function ca(a){return h.arr(a)?A.apply(this,a):Q[a]}function da(a,c){var d;return a.tweens.map(function(b){b=ba(b,c);var f=b.value,e=K(c.target,a.name),k=d?d.to.original:e,k=h.arr(f)?f[0]:k,w=L(h.arr(f)?f[1]:f,k),e=y(w)||y(k)||y(e);b.from=O(k,e);b.to=O(w,e);b.start=d?d.end:a.offset;b.end=b.start+b.delay+b.duration;b.easing=ca(b.easing);b.elasticity=(1E3-Math.min(Math.max(b.elasticity,1),999))/
1E3;b.isPath=h.pth(f);b.isColor=h.col(b.from.original);b.isColor&&(b.round=1);return d=b})}function ea(a,c){return r(p(a.map(function(a){return c.map(function(b){var c=J(a.target,b.name);if(c){var d=da(b,a);b={type:c,property:b.name,animatable:a,tweens:d,duration:d[d.length-1].end,delay:d[0].delay}}else b=void 0;return b})})),function(a){return!h.und(a)})}function R(a,c,d,b){var f="delay"===a;return c.length?(f?Math.min:Math.max).apply(Math,c.map(function(b){return b[a]})):f?b.delay:d.offset+b.delay+
b.duration}function fa(a){var c=D(ga,a),d=D(S,a),b=Z(a.targets),f=[],e=z(c,d),k;for(k in a)e.hasOwnProperty(k)||"targets"===k||f.push({name:k,offset:e.offset,tweens:aa(a[k],d)});a=ea(b,f);return z(c,{children:[],animatables:b,animations:a,duration:R("duration",a,c,d),delay:R("delay",a,c,d)})}function q(a){function c(){return window.Promise&&new Promise(function(a){return p=a})}function d(a){return g.reversed?g.duration-a:a}function b(a){for(var b=0,c={},d=g.animations,f=d.length;b<f;){var e=d[b],
k=e.animatable,h=e.tweens,n=h.length-1,l=h[n];n&&(l=r(h,function(b){return a<b.end})[0]||l);for(var h=Math.min(Math.max(a-l.start-l.delay,0),l.duration)/l.duration,w=isNaN(h)?1:l.easing(h,l.elasticity),h=l.to.strings,p=l.round,n=[],m=void 0,m=l.to.numbers.length,t=0;t<m;t++){var x=void 0,x=l.to.numbers[t],q=l.from.numbers[t],x=l.isPath?Y(l.value,w*x):q+w*(x-q);p&&(l.isColor&&2<t||(x=Math.round(x*p)/p));n.push(x)}if(l=h.length)for(m=h[0],w=0;w<l;w++)p=h[w+1],t=n[w],isNaN(t)||(m=p?m+(t+p):m+(t+" "));
else m=n[0];ha[e.type](k.target,e.property,m,c,k.id);e.currentValue=m;b++}if(b=Object.keys(c).length)for(d=0;d<b;d++)H||(H=E(document.body,"transform")?"transform":"-webkit-transform"),g.animatables[d].target.style[H]=c[d].join(" ");g.currentTime=a;g.progress=a/g.duration*100}function f(a){if(g[a])g[a](g)}function e(){g.remaining&&!0!==g.remaining&&g.remaining--}function k(a){var k=g.duration,n=g.offset,w=n+g.delay,r=g.currentTime,x=g.reversed,q=d(a);if(g.children.length){var u=g.children,v=u.length;
if(q>=g.currentTime)for(var G=0;G<v;G++)u[G].seek(q);else for(;v--;)u[v].seek(q)}if(q>=w||!k)g.began||(g.began=!0,f("begin")),f("run");if(q>n&&q<k)b(q);else if(q<=n&&0!==r&&(b(0),x&&e()),q>=k&&r!==k||!k)b(k),x||e();f("update");a>=k&&(g.remaining?(t=h,"alternate"===g.direction&&(g.reversed=!g.reversed)):(g.pause(),g.completed||(g.completed=!0,f("complete"),"Promise"in window&&(p(),m=c()))),l=0)}a=void 0===a?{}:a;var h,t,l=0,p=null,m=c(),g=fa(a);g.reset=function(){var a=g.direction,c=g.loop;g.currentTime=
0;g.progress=0;g.paused=!0;g.began=!1;g.completed=!1;g.reversed="reverse"===a;g.remaining="alternate"===a&&1===c?2:c;b(0);for(a=g.children.length;a--;)g.children[a].reset()};g.tick=function(a){h=a;t||(t=h);k((l+h-t)*q.speed)};g.seek=function(a){k(d(a))};g.pause=function(){var a=v.indexOf(g);-1<a&&v.splice(a,1);g.paused=!0};g.play=function(){g.paused&&(g.paused=!1,t=0,l=d(g.currentTime),v.push(g),B||ia())};g.reverse=function(){g.reversed=!g.reversed;t=0;l=d(g.currentTime)};g.restart=function(){g.pause();
g.reset();g.play()};g.finished=m;g.reset();g.autoplay&&g.play();return g}var ga={update:void 0,begin:void 0,run:void 0,complete:void 0,loop:1,direction:"normal",autoplay:!0,offset:0},S={duration:1E3,delay:0,easing:"easeOutElastic",elasticity:500,round:0},W="translateX translateY translateZ rotate rotateX rotateY rotateZ scale scaleX scaleY scaleZ skewX skewY perspective".split(" "),H,h={arr:function(a){return Array.isArray(a)},obj:function(a){return-1<Object.prototype.toString.call(a).indexOf("Object")},
pth:function(a){return h.obj(a)&&a.hasOwnProperty("totalLength")},svg:function(a){return a instanceof SVGElement},dom:function(a){return a.nodeType||h.svg(a)},str:function(a){return"string"===typeof a},fnc:function(a){return"function"===typeof a},und:function(a){return"undefined"===typeof a},hex:function(a){return/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a)},rgb:function(a){return/^rgb/.test(a)},hsl:function(a){return/^hsl/.test(a)},col:function(a){return h.hex(a)||h.rgb(a)||h.hsl(a)}},A=function(){function a(a,
d,b){return(((1-3*b+3*d)*a+(3*b-6*d))*a+3*d)*a}return function(c,d,b,f){if(0<=c&&1>=c&&0<=b&&1>=b){var e=new Float32Array(11);if(c!==d||b!==f)for(var k=0;11>k;++k)e[k]=a(.1*k,c,b);return function(k){if(c===d&&b===f)return k;if(0===k)return 0;if(1===k)return 1;for(var h=0,l=1;10!==l&&e[l]<=k;++l)h+=.1;--l;var l=h+(k-e[l])/(e[l+1]-e[l])*.1,n=3*(1-3*b+3*c)*l*l+2*(3*b-6*c)*l+3*c;if(.001<=n){for(h=0;4>h;++h){n=3*(1-3*b+3*c)*l*l+2*(3*b-6*c)*l+3*c;if(0===n)break;var m=a(l,c,b)-k,l=l-m/n}k=l}else if(0===
n)k=l;else{var l=h,h=h+.1,g=0;do m=l+(h-l)/2,n=a(m,c,b)-k,0<n?h=m:l=m;while(1e-7<Math.abs(n)&&10>++g);k=m}return a(k,d,f)}}}}(),Q=function(){function a(a,b){return 0===a||1===a?a:-Math.pow(2,10*(a-1))*Math.sin(2*(a-1-b/(2*Math.PI)*Math.asin(1))*Math.PI/b)}var c="Quad Cubic Quart Quint Sine Expo Circ Back Elastic".split(" "),d={In:[[.55,.085,.68,.53],[.55,.055,.675,.19],[.895,.03,.685,.22],[.755,.05,.855,.06],[.47,0,.745,.715],[.95,.05,.795,.035],[.6,.04,.98,.335],[.6,-.28,.735,.045],a],Out:[[.25,
.46,.45,.94],[.215,.61,.355,1],[.165,.84,.44,1],[.23,1,.32,1],[.39,.575,.565,1],[.19,1,.22,1],[.075,.82,.165,1],[.175,.885,.32,1.275],function(b,c){return 1-a(1-b,c)}],InOut:[[.455,.03,.515,.955],[.645,.045,.355,1],[.77,0,.175,1],[.86,0,.07,1],[.445,.05,.55,.95],[1,0,0,1],[.785,.135,.15,.86],[.68,-.55,.265,1.55],function(b,c){return.5>b?a(2*b,c)/2:1-a(-2*b+2,c)/2}]},b={linear:A(.25,.25,.75,.75)},f={},e;for(e in d)f.type=e,d[f.type].forEach(function(a){return function(d,f){b["ease"+a.type+c[f]]=h.fnc(d)?
d:A.apply($jscomp$this,d)}}(f)),f={type:f.type};return b}(),ha={css:function(a,c,d){return a.style[c]=d},attribute:function(a,c,d){return a.setAttribute(c,d)},object:function(a,c,d){return a[c]=d},transform:function(a,c,d,b,f){b[f]||(b[f]=[]);b[f].push(c+"("+d+")")}},v=[],B=0,ia=function(){function a(){B=requestAnimationFrame(c)}function c(c){var b=v.length;if(b){for(var d=0;d<b;)v[d]&&v[d].tick(c),d++;a()}else cancelAnimationFrame(B),B=0}return a}();q.version="2.2.0";q.speed=1;q.running=v;q.remove=
function(a){a=P(a);for(var c=v.length;c--;)for(var d=v[c],b=d.animations,f=b.length;f--;)u(a,b[f].animatable.target)&&(b.splice(f,1),b.length||d.pause())};q.getValue=K;q.path=function(a,c){var d=h.str(a)?e(a)[0]:a,b=c||100;return function(a){return{el:d,property:a,totalLength:N(d)*(b/100)}}};q.setDashoffset=function(a){var c=N(a);a.setAttribute("stroke-dasharray",c);return c};q.bezier=A;q.easings=Q;q.timeline=function(a){var c=q(a);c.pause();c.duration=0;c.add=function(d){c.children.forEach(function(a){a.began=
!0;a.completed=!0});m(d).forEach(function(b){var d=z(b,D(S,a||{}));d.targets=d.targets||a.targets;b=c.duration;var e=d.offset;d.autoplay=!1;d.direction=c.direction;d.offset=h.und(e)?b:L(e,b);c.began=!0;c.completed=!0;c.seek(d.offset);d=q(d);d.began=!0;d.completed=!0;d.duration>b&&(c.duration=d.duration);c.children.push(d)});c.seek(0);c.reset();c.autoplay&&c.restart();return c};return c};q.random=function(a,c){return Math.floor(Math.random()*(c-a+1))+a};return q});


// 5. parallax
/*!
 * simpleParallax - simpleParallax is a simple JavaScript library that gives your website parallax animations on any images or videos, 
 * @date: 20-08-2020 14:0:14, 
 * @version: 5.6.2,
 * @link: https://simpleparallax.com/
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("simpleParallax", [], factory);
	else if(typeof exports === 'object')
		exports["simpleParallax"] = factory();
	else
		root["simpleParallax"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, "default", function() { return /* binding */ simpleParallax_SimpleParallax; });

// CONCATENATED MODULE: ./src/helpers/isSupportedBrowser.js
// need closest support
// https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
// need Intersection Observer support
// https://github.com/w3c/IntersectionObserver/tree/master/polyfill
var isSupportedBrowser = function isSupportedBrowser() {
  return Element.prototype.closest && 'IntersectionObserver' in window;
};

/* harmony default export */ var helpers_isSupportedBrowser = (isSupportedBrowser);
// CONCATENATED MODULE: ./src/helpers/viewport.js
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Viewport = /*#__PURE__*/function () {
  function Viewport() {
    _classCallCheck(this, Viewport);

    this.positions = {
      top: 0,
      bottom: 0,
      height: 0
    };
  }

  _createClass(Viewport, [{
    key: "setViewportTop",
    value: function setViewportTop(container) {
      // if this is a custom container, user the scrollTop
      this.positions.top = container ? container.scrollTop : window.pageYOffset;
      return this.positions;
    }
  }, {
    key: "setViewportBottom",
    value: function setViewportBottom() {
      this.positions.bottom = this.positions.top + this.positions.height;
      return this.positions;
    }
  }, {
    key: "setViewportAll",
    value: function setViewportAll(container) {
      // if this is a custom container, user the scrollTop
      this.positions.top = container ? container.scrollTop : window.pageYOffset; // if this is a custom container, get the height from the custom container itself

      this.positions.height = container ? container.clientHeight : document.documentElement.clientHeight;
      this.positions.bottom = this.positions.top + this.positions.height;
      return this.positions;
    }
  }]);

  return Viewport;
}();

var viewport = new Viewport();

// CONCATENATED MODULE: ./src/helpers/convertToArray.js
// check whether the element is a Node List, a HTML Collection or an array
// return an array of nodes
var convertToArray = function convertToArray(elements) {
  if (NodeList.prototype.isPrototypeOf(elements) || HTMLCollection.prototype.isPrototypeOf(elements)) return Array.from(elements);
  if (typeof elements === 'string' || elements instanceof String) return document.querySelectorAll(elements);
  return [elements];
};

/* harmony default export */ var helpers_convertToArray = (convertToArray);
// CONCATENATED MODULE: ./src/helpers/cssTransform.js
// Detect css transform
var cssTransform = function cssTransform() {
  var prefixes = 'transform webkitTransform mozTransform oTransform msTransform'.split(' ');
  var transform;
  var i = 0;

  while (transform === undefined) {
    transform = document.createElement('div').style[prefixes[i]] !== undefined ? prefixes[i] : undefined;
    i += 1;
  }

  return transform;
};

/* harmony default export */ var helpers_cssTransform = (cssTransform());
// CONCATENATED MODULE: ./src/helpers/isImageLoaded.js
// check if media is fully loaded
var isImageLoaded = function isImageLoaded(media) {
  // if the media is a video, return true
  if (media.tagName.toLowerCase() !== 'img' && media.tagName.toLowerCase() !== 'picture') {
    return true;
  } // check if media is set as the parameter


  if (!media) {
    return false;
  } // check if media has been 100% loaded


  if (!media.complete) {
    return false;
  } // check if the media is displayed


  if (typeof media.naturalWidth !== 'undefined' && media.naturalWidth === 0) {
    return false;
  }

  return true;
};

/* harmony default export */ var helpers_isImageLoaded = (isImageLoaded);
// CONCATENATED MODULE: ./src/instances/parallax.js
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function parallax_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function parallax_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function parallax_createClass(Constructor, protoProps, staticProps) { if (protoProps) parallax_defineProperties(Constructor.prototype, protoProps); if (staticProps) parallax_defineProperties(Constructor, staticProps); return Constructor; }





var parallax_ParallaxInstance = /*#__PURE__*/function () {
  function ParallaxInstance(element, options) {
    var _this = this;

    parallax_classCallCheck(this, ParallaxInstance);

    // set the element & settings
    this.element = element;
    this.elementContainer = element;
    this.settings = options;
    this.isVisible = true;
    this.isInit = false;
    this.oldTranslateValue = -1;
    this.init = this.init.bind(this);
    this.customWrapper = this.settings.customWrapper && this.element.closest(this.settings.customWrapper) ? this.element.closest(this.settings.customWrapper) : null; // check if images has not been loaded yet

    if (helpers_isImageLoaded(element)) {
      this.init();
    } else {
      this.element.addEventListener('load', function () {
        // timeout to ensure the image is fully loaded into the DOM
        setTimeout(function () {
          _this.init(true);
        }, 50);
      });
    }
  }

  parallax_createClass(ParallaxInstance, [{
    key: "init",
    value: function init(asyncInit) {
      var _this2 = this;

      // for some reason, <picture> are init an infinite time on windows OS
      if (this.isInit) return;

      if (asyncInit) {
        // in case the image is lazy loaded, the rangemax should be cleared
        // so it will be updated in the next getTranslateValue()
        this.rangeMax = null;
      } // check if element has not been already initialized with simpleParallax


      if (this.element.closest('.simpleParallax')) return;

      if (this.settings.overflow === false) {
        // if overflow option is set to false
        // wrap the element into a div to apply overflow
        this.wrapElement(this.element);
      } // apply the transform style on the image


      this.setTransformCSS(); // get the current element offset

      this.getElementOffset(); // init the Intesection Observer

      this.intersectionObserver(); // get its translated value

      this.getTranslateValue(); // apply its translation even if not visible for the first init

      this.animate(); // if a delay has been set

      if (this.settings.delay > 0) {
        // apply a timeout to avoid buggy effect
        setTimeout(function () {
          // apply the transition style on the image
          _this2.setTransitionCSS(); //add isInit class


          _this2.elementContainer.classList.add('simple-parallax-initialized');
        }, 10);
      } else {
        //add isInit class
        this.elementContainer.classList.add('simple-parallax-initialized');
      } // for some reason, <picture> are init an infinite time on windows OS


      this.isInit = true;
    } // if overflow option is set to false
    // wrap the element into a .simpleParallax div and apply overflow hidden to hide the image excedant (result of the scale)

  }, {
    key: "wrapElement",
    value: function wrapElement() {
      // check is current image is in a <picture> tag
      var elementToWrap = this.element.closest('picture') || this.element; // create a .simpleParallax wrapper container
      // if there is a custom wrapper
      // override the wrapper with it

      var wrapper = this.customWrapper || document.createElement('div');
      wrapper.classList.add('simpleParallax');
      wrapper.style.overflow = 'hidden'; // append the image inside the new wrapper

      if (!this.customWrapper) {
        elementToWrap.parentNode.insertBefore(wrapper, elementToWrap);
        wrapper.appendChild(elementToWrap);
      }

      this.elementContainer = wrapper;
    } // unwrap the element from .simpleParallax wrapper container

  }, {
    key: "unWrapElement",
    value: function unWrapElement() {
      var wrapper = this.elementContainer; // if there is a custom wrapper, we jusy need to remove the class and style

      if (this.customWrapper) {
        wrapper.classList.remove('simpleParallax');
        wrapper.style.overflow = '';
      } else {
        wrapper.replaceWith.apply(wrapper, _toConsumableArray(wrapper.childNodes));
      }
    } // apply default style on element

  }, {
    key: "setTransformCSS",
    value: function setTransformCSS() {
      if (this.settings.overflow === false) {
        // if overflow option is set to false
        // add scale style so the image can be translated without getting out of its container
        this.element.style[helpers_cssTransform] = "scale(".concat(this.settings.scale, ")");
      } // add will-change CSS property to improve perfomance


      this.element.style.willChange = 'transform';
    } // apply the transition effet

  }, {
    key: "setTransitionCSS",
    value: function setTransitionCSS() {
      // add transition option
      this.element.style.transition = "transform ".concat(this.settings.delay, "s ").concat(this.settings.transition);
    } // remove style of the element

  }, {
    key: "unSetStyle",
    value: function unSetStyle() {
      // remove will change inline style
      this.element.style.willChange = '';
      this.element.style[helpers_cssTransform] = '';
      this.element.style.transition = '';
    } // get the current element offset

  }, {
    key: "getElementOffset",
    value: function getElementOffset() {
      // get position of the element
      var positions = this.elementContainer.getBoundingClientRect(); // get height

      this.elementHeight = positions.height; // get offset top

      this.elementTop = positions.top + viewport.positions.top; // if there is a custom container

      if (this.settings.customContainer) {
        // we need to do some calculation to get the position from the parent rather than the viewport
        var parentPositions = this.settings.customContainer.getBoundingClientRect();
        this.elementTop = positions.top - parentPositions.top + viewport.positions.top;
      } // get offset bottom


      this.elementBottom = this.elementHeight + this.elementTop;
    } // build the Threshold array to cater change for every pixel scrolled

  }, {
    key: "buildThresholdList",
    value: function buildThresholdList() {
      var thresholds = [];

      for (var i = 1.0; i <= this.elementHeight; i++) {
        var ratio = i / this.elementHeight;
        thresholds.push(ratio);
      }

      return thresholds;
    } // create the Intersection Observer

  }, {
    key: "intersectionObserver",
    value: function intersectionObserver() {
      var options = {
        root: null,
        threshold: this.buildThresholdList()
      };
      this.observer = new IntersectionObserver(this.intersectionObserverCallback.bind(this), options);
      this.observer.observe(this.element);
    } // Intersection Observer Callback to set the element at visible state or not

  }, {
    key: "intersectionObserverCallback",
    value: function intersectionObserverCallback(entries) {
      var _this3 = this;

      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          _this3.isVisible = true;
        } else {
          _this3.isVisible = false;
        }
      });
    } // check if the current element is visible in the Viewport
    // for browser that not support Intersection Observer API

  }, {
    key: "checkIfVisible",
    value: function checkIfVisible() {
      return this.elementBottom > viewport.positions.top && this.elementTop < viewport.positions.bottom;
    } // calculate the range between image will be translated

  }, {
    key: "getRangeMax",
    value: function getRangeMax() {
      // get the real height of the image without scale
      var elementImageHeight = this.element.clientHeight; // range is calculate with the image height by the scale

      this.rangeMax = elementImageHeight * this.settings.scale - elementImageHeight;
    } // get the percentage and the translate value to apply on the element

  }, {
    key: "getTranslateValue",
    value: function getTranslateValue() {
      // calculate the % position of the element comparing to the viewport
      // rounding percentage to a 1 number float to avoid unn unnecessary calculation
      var percentage = ((viewport.positions.bottom - this.elementTop) / ((viewport.positions.height + this.elementHeight) / 100)).toFixed(1); // sometime the percentage exceeds 100 or goes below 0

      percentage = Math.min(100, Math.max(0, percentage)); // if a maxTransition has been set, we round the percentage to that number

      if (this.settings.maxTransition !== 0 && percentage > this.settings.maxTransition) {
        percentage = this.settings.maxTransition;
      } // sometime the same percentage is returned
      // if so we don't do aything


      if (this.oldPercentage === percentage) {
        return false;
      } // if not range max is set, recalculate it


      if (!this.rangeMax) {
        this.getRangeMax();
      } // transform this % into the max range of the element
      // rounding translateValue to a non float int - as minimum pixel for browser to render is 1 (no 0.5)


      this.translateValue = (percentage / 100 * this.rangeMax - this.rangeMax / 2).toFixed(0); // sometime the same translate value is returned
      // if so we don't do aything

      if (this.oldTranslateValue === this.translateValue) {
        return false;
      } // store the current percentage


      this.oldPercentage = percentage;
      this.oldTranslateValue = this.translateValue;
      return true;
    } // animate the image

  }, {
    key: "animate",
    value: function animate() {
      var translateValueY = 0;
      var translateValueX = 0;
      var inlineCss;

      if (this.settings.orientation.includes('left') || this.settings.orientation.includes('right')) {
        // if orientation option is left or right
        // use horizontal axe - X axe
        translateValueX = "".concat(this.settings.orientation.includes('left') ? this.translateValue * -1 : this.translateValue, "px");
      }

      if (this.settings.orientation.includes('up') || this.settings.orientation.includes('down')) {
        // if orientation option is up or down
        // use vertical axe - Y axe
        translateValueY = "".concat(this.settings.orientation.includes('up') ? this.translateValue * -1 : this.translateValue, "px");
      } // set style to apply to the element


      if (this.settings.overflow === false) {
        // if overflow option is set to false
        // add the scale style
        inlineCss = "translate3d(".concat(translateValueX, ", ").concat(translateValueY, ", 0) scale(").concat(this.settings.scale, ")");
      } else {
        inlineCss = "translate3d(".concat(translateValueX, ", ").concat(translateValueY, ", 0)");
      } // add style on the element using the adequate CSS transform


      this.element.style[helpers_cssTransform] = inlineCss;
    }
  }]);

  return ParallaxInstance;
}();

/* harmony default export */ var parallax = (parallax_ParallaxInstance);
// CONCATENATED MODULE: ./src/simpleParallax.js
function simpleParallax_toConsumableArray(arr) { return simpleParallax_arrayWithoutHoles(arr) || simpleParallax_iterableToArray(arr) || simpleParallax_unsupportedIterableToArray(arr) || simpleParallax_nonIterableSpread(); }

function simpleParallax_nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function simpleParallax_iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function simpleParallax_arrayWithoutHoles(arr) { if (Array.isArray(arr)) return simpleParallax_arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || simpleParallax_unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function simpleParallax_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return simpleParallax_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return simpleParallax_arrayLikeToArray(o, minLen); }

function simpleParallax_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function simpleParallax_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function simpleParallax_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function simpleParallax_createClass(Constructor, protoProps, staticProps) { if (protoProps) simpleParallax_defineProperties(Constructor.prototype, protoProps); if (staticProps) simpleParallax_defineProperties(Constructor, staticProps); return Constructor; }





var isInit = false;
var instances = [];
var frameID;
var resizeID;

var simpleParallax_SimpleParallax = /*#__PURE__*/function () {
  function SimpleParallax(elements, options) {
    simpleParallax_classCallCheck(this, SimpleParallax);

    if (!elements) return; // check if the browser support simpleParallax

    if (!helpers_isSupportedBrowser()) return;
    this.elements = helpers_convertToArray(elements);
    this.defaults = {
      delay: 0,
      orientation: 'up',
      scale: 1.3,
      overflow: false,
      transition: 'cubic-bezier(0,0,0,1)',
      customContainer: '',
      customWrapper: '',
      maxTransition: 0
    };
    this.settings = Object.assign(this.defaults, options);

    if (this.settings.customContainer) {
      var _convertToArray = helpers_convertToArray(this.settings.customContainer);

      var _convertToArray2 = _slicedToArray(_convertToArray, 1);

      this.customContainer = _convertToArray2[0];
    }

    this.lastPosition = -1;
    this.resizeIsDone = this.resizeIsDone.bind(this);
    this.refresh = this.refresh.bind(this);
    this.proceedRequestAnimationFrame = this.proceedRequestAnimationFrame.bind(this);
    this.init();
  }

  simpleParallax_createClass(SimpleParallax, [{
    key: "init",
    value: function init() {
      var _this = this;

      viewport.setViewportAll(this.customContainer);
      instances = [].concat(simpleParallax_toConsumableArray(this.elements.map(function (element) {
        return new parallax(element, _this.settings);
      })), simpleParallax_toConsumableArray(instances)); // update the instance length
      // instancesLength = instances.length;
      // only if this is the first simpleParallax init

      if (!isInit) {
        // init the frame
        this.proceedRequestAnimationFrame();
        window.addEventListener('resize', this.resizeIsDone);
        isInit = true;
      }
    } // wait for resize to be completely done

  }, {
    key: "resizeIsDone",
    value: function resizeIsDone() {
      clearTimeout(resizeID);
      resizeID = setTimeout(this.refresh, 200);
    } // animation frame

  }, {
    key: "proceedRequestAnimationFrame",
    value: function proceedRequestAnimationFrame() {
      var _this2 = this;

      // get the offset top of the viewport
      viewport.setViewportTop(this.customContainer);

      if (this.lastPosition === viewport.positions.top) {
        // if last position if the same than the curent one
        // callback the animationFrame and exit the current loop
        frameID = window.requestAnimationFrame(this.proceedRequestAnimationFrame);
        return;
      } // get the offset bottom of the viewport


      viewport.setViewportBottom(); // proceed with the current element

      instances.forEach(function (instance) {
        _this2.proceedElement(instance);
      }); // callback the animationFrame

      frameID = window.requestAnimationFrame(this.proceedRequestAnimationFrame); // store the last position

      this.lastPosition = viewport.positions.top;
    } // proceed the element

  }, {
    key: "proceedElement",
    value: function proceedElement(instance) {
      var isVisible = false; // if this is a custom container
      // use old function to check if element visible

      if (this.customContainer) {
        isVisible = instance.checkIfVisible(); // else, use response from Intersection Observer API Callback
      } else {
        isVisible = instance.isVisible;
      } // if element not visible, stop it


      if (!isVisible) return; // if percentage is equal to the last one, no need to continue

      if (!instance.getTranslateValue()) {
        return;
      } // animate the image


      instance.animate();
    }
  }, {
    key: "refresh",
    value: function refresh() {
      // re-get all the viewport positions
      viewport.setViewportAll(this.customContainer);
      instances.forEach(function (instance) {
        // re-get the current element offset
        instance.getElementOffset(); // re-get the range if the current element

        instance.getRangeMax();
      }); // force the request animation frame to fired

      this.lastPosition = -1;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this3 = this;

      var instancesToDestroy = []; // remove all instances that need to be destroyed from the instances array

      instances = instances.filter(function (instance) {
        if (_this3.elements.includes(instance.element)) {
          // push instance that need to be destroyed into instancesToDestroy
          instancesToDestroy.push(instance);
          return false;
        }

        return instance;
      });
      instancesToDestroy.forEach(function (instance) {
        // unset style
        instance.unSetStyle();

        if (_this3.settings.overflow === false) {
          // if overflow option is set to false
          // unwrap the element from .simpleParallax wrapper container
          instance.unWrapElement();
        }
      }); // if no instances left, remove the raf and resize event = simpleParallax fully destroyed

      if (!instances.length) {
        // cancel the animation frame
        window.cancelAnimationFrame(frameID); // detach the resize event

        window.removeEventListener('resize', this.refresh); // Reset isInit

        isInit = false;
      }
    }
  }]);

  return SimpleParallax;
}();



/***/ })
/******/ ])["default"];
});

// 6. collasible
(function ($, anim) {
  "use strict";

  let _defaults = {
    accordion: true,
    onOpenStart: undefined,
    onOpenEnd: undefined,
    onCloseStart: undefined,
    onCloseEnd: undefined,
    inDuration: 300,
    outDuration: 300,
  };

  /**
   * @class
   *
   */
  class Collapsible extends Component {
    /**
     * Construct Collapsible instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Collapsible, el, options);

      this.el.M_Collapsible = this;

      /**
       * Options for the collapsible
       * @member Collapsible#options
       * @prop {Boolean} [accordion=false] - Type of the collapsible
       * @prop {Function} onOpenStart - Callback function called before collapsible is opened
       * @prop {Function} onOpenEnd - Callback function called after collapsible is opened
       * @prop {Function} onCloseStart - Callback function called before collapsible is closed
       * @prop {Function} onCloseEnd - Callback function called after collapsible is closed
       * @prop {Number} inDuration - Transition in duration in milliseconds.
       * @prop {Number} outDuration - Transition duration in milliseconds.
       */
      this.options = $.extend({}, Collapsible.defaults, options);

      // Setup tab indices
      this.$headers = this.$el.children("li").children(".collapsible-header");
      this.$headers.attr("tabindex", 0);

      this._setupEventHandlers();

      // Open first active
      let $activeBodies = this.$el
        .children("li.active")
        .children(".collapsible-body");
      if (this.options.accordion) {
        // Handle Accordion
        $activeBodies.first().css("display", "block");
      } else {
        // Handle Expandables
        $activeBodies.css("display", "block");
      }
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Collapsible;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.el.M_Collapsible = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleCollapsibleClickBound =
        this._handleCollapsibleClick.bind(this);
      this._handleCollapsibleKeydownBound =
        this._handleCollapsibleKeydown.bind(this);
      this.el.addEventListener("click", this._handleCollapsibleClickBound);
      this.$headers.each((header) => {
        header.addEventListener("keydown", this._handleCollapsibleKeydownBound);
      });
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener("click", this._handleCollapsibleClickBound);
      this.$headers.each((header) => {
        header.removeEventListener(
          "keydown",
          this._handleCollapsibleKeydownBound
        );
      });
    }

    /**
     * Handle Collapsible Click
     * @param {Event} e
     */
    _handleCollapsibleClick(e) {
      let $header = $(e.target).closest(".collapsible-header");
      if (e.target && $header.length) {
        let $collapsible = $header.closest(".collapsible");
        if ($collapsible[0] === this.el) {
          let $collapsibleLi = $header.closest("li");
          let $collapsibleLis = $collapsible.children("li");
          let isActive = $collapsibleLi[0].classList.contains("active");
          let index = $collapsibleLis.index($collapsibleLi);

          if (isActive) {
            this.close(index);
          } else {
            this.open(index);
          }
        }
      }
    }

    /**
     * Handle Collapsible Keydown
     * @param {Event} e
     */
    _handleCollapsibleKeydown(e) {
      if (e.keyCode === 13) {
        this._handleCollapsibleClickBound(e);
      }
    }

    /**
     * Animate in collapsible slide
     * @param {Number} index - 0th index of slide
     */
    _animateIn(index) {
      let $collapsibleLi = this.$el.children("li").eq(index);
      if ($collapsibleLi.length) {
        let $body = $collapsibleLi.children(".collapsible-body");

        anim.remove($body[0]);
        $body.css({
          display: "block",
          overflow: "hidden",
          height: 0,
          paddingTop: "",
          paddingBottom: "",
        });

        let pTop = $body.css("padding-top");
        let pBottom = $body.css("padding-bottom");
        let finalHeight = $body[0].scrollHeight;
        $body.css({
          paddingTop: 0,
          paddingBottom: 0,
        });

        anim({
          targets: $body[0],
          height: finalHeight,
          paddingTop: pTop,
          paddingBottom: pBottom,
          duration: this.options.inDuration,
          easing: "easeInOutCubic",
          complete: (anim) => {
            $body.css({
              overflow: "",
              paddingTop: "",
              paddingBottom: "",
              height: "",
            });

            // onOpenEnd callback
            if (typeof this.options.onOpenEnd === "function") {
              this.options.onOpenEnd.call(this, $collapsibleLi[0]);
            }
          },
        });
      }
    }

    /**
     * Animate out collapsible slide
     * @param {Number} index - 0th index of slide to open
     */
    _animateOut(index) {
      let $collapsibleLi = this.$el.children("li").eq(index);
      if ($collapsibleLi.length) {
        let $body = $collapsibleLi.children(".collapsible-body");
        anim.remove($body[0]);
        $body.css("overflow", "hidden");
        anim({
          targets: $body[0],
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          duration: this.options.outDuration,
          easing: "easeInOutCubic",
          complete: () => {
            $body.css({
              height: "",
              overflow: "",
              padding: "",
              display: "",
            });

            // onCloseEnd callback
            if (typeof this.options.onCloseEnd === "function") {
              this.options.onCloseEnd.call(this, $collapsibleLi[0]);
            }
          },
        });
      }
    }

    /**
     * Open Collapsible
     * @param {Number} index - 0th index of slide
     */
    open(index) {
      let $collapsibleLi = this.$el.children("li").eq(index);
      if (
        $collapsibleLi.length &&
        !$collapsibleLi[0].classList.contains("active")
      ) {
        // onOpenStart callback
        if (typeof this.options.onOpenStart === "function") {
          this.options.onOpenStart.call(this, $collapsibleLi[0]);
        }

        // Handle accordion behavior
        if (this.options.accordion) {
          let $collapsibleLis = this.$el.children("li");
          let $activeLis = this.$el.children("li.active");
          $activeLis.each((el) => {
            let index = $collapsibleLis.index($(el));
            this.close(index);
          });
        }

        // Animate in
        $collapsibleLi[0].classList.add("active");
        this._animateIn(index);
      }
    }

    /**
     * Close Collapsible
     * @param {Number} index - 0th index of slide
     */
    close(index) {
      let $collapsibleLi = this.$el.children("li").eq(index);
      if (
        $collapsibleLi.length &&
        $collapsibleLi[0].classList.contains("active")
      ) {
        // onCloseStart callback
        if (typeof this.options.onCloseStart === "function") {
          this.options.onCloseStart.call(this, $collapsibleLi[0]);
        }

        // Animate out
        $collapsibleLi[0].classList.remove("active");
        this._animateOut(index);
      }
    }
  }

  M.Collapsible = Collapsible;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Collapsible, "collapsible", "M_Collapsible");
  }
})(cash, M.anime);
