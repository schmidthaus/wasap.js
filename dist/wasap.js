(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.wasap = factory());
}(this, (function () {

var RE_SELECTOR = /([.#]?[^\s#.]+)/;

var WHATSAPP_API_PROTOCOL = 'whatsapp://send';
var WHATSAPP_API_URL = 'https://api.whatsapp.com/api/send';

var defaults = {
  enableIf: /android|iphone|ipad/i,
  protocolIf: /android|iphone|ipad/i,
  uaString: window.navigator.userAgent,
  openCallback: null,
  elementCallback: null,
  newNodeSelector: 'a.whatsapp-link',
};

function checkIfCallback(value, config) {
  if (value instanceof RegExp) {
    return value.test(config.uaString);
  }

  if (typeof value === 'function') {
    return value();
  }

  return !!value;
}

function assign(target) {
  var arguments$1 = arguments;

  var loop = function ( i ) {
    if (arguments$1[i]) {
      Object.keys(arguments$1[i]).forEach(function (key) {
        target[key] = arguments$1[i][key];
      });
    }
  };

  for (var i = 1; i < arguments.length; i += 1) loop( i );

  return target;
}

function buildLink(config, baseURI) {
  var params = [];

  Object.keys(config).forEach(function (prop) {
    if (config[prop]) {
      params.push((prop + "=" + (encodeURIComponent(config[prop]))));
    }
  });

  return ("" + baseURI + (params.length ? ("?" + (params.join('&'))) : ''));
}

function setupLink(node, newEl, config) {
  var baseURI = checkIfCallback(config.protocolIf, config)
    ? WHATSAPP_API_PROTOCOL
    : WHATSAPP_API_URL;

  var options = {
    text: node.dataset.whatsappMessage,
    phone: node.dataset.whatsapp,
  };

  if (newEl.tagName === 'A') {
    newEl.href = buildLink(options, baseURI);
  }

  if (typeof config.elementCallback === 'function') {
    config.elementCallback(node, function (params) {
      if (typeof params === 'string') {
        params = { text: params };
      }

      var url = buildLink(assign({}, options, params), baseURI);
      var open = config.openCallback || window.open;

      open(url);
    });
  }
}

function makeEl(config) {
  var parts = config.newNodeSelector
    .split(RE_SELECTOR)
    .filter(Boolean);

  var target = document.createElement(parts[0]);

  for (var i = 1; i < parts.length; i += 1) {
    if (parts[i]) {
      if (parts[i].charAt() === '.') {
        target.classList.add(parts[i].substr(1));
      }

      if (parts[i].charAt() === '#') {
        target.id = parts[i].substr(1);
      }
    }
  }

  return target;
}

function append(node, config) {
  var newEl = makeEl(config);
  var body = node.innerHTML;

  node.innerHTML = '';
  node.appendChild(newEl);

  newEl.innerHTML = body;

  setupLink(node, newEl, config);
}

function init(options) {
  var config = assign({}, defaults, options);
  var isEnabled = checkIfCallback(config.enableIf, config);

  if (isEnabled) {
    var matchedElements = document.querySelectorAll('[data-whatsapp]');

    for (var i = 0; i < matchedElements.length; i += 1) {
      append(matchedElements[i], config);
    }
  }
}

var wasap = {
  init: init,
};

return wasap;

})));