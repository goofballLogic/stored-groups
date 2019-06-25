(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
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
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./test/scratch-pad.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/idb-keyval/dist/idb-keyval.mjs":
/*!*****************************************************!*\
  !*** ./node_modules/idb-keyval/dist/idb-keyval.mjs ***!
  \*****************************************************/
/*! exports provided: Store, get, set, del, clear, keys */
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Store\", function() { return Store; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"get\", function() { return get; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"set\", function() { return set; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"del\", function() { return del; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"clear\", function() { return clear; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"keys\", function() { return keys; });\nclass Store {\r\n    constructor(dbName = 'keyval-store', storeName = 'keyval') {\r\n        this.storeName = storeName;\r\n        this._dbp = new Promise((resolve, reject) => {\r\n            const openreq = indexedDB.open(dbName, 1);\r\n            openreq.onerror = () => reject(openreq.error);\r\n            openreq.onsuccess = () => resolve(openreq.result);\r\n            // First time setup: create an empty object store\r\n            openreq.onupgradeneeded = () => {\r\n                openreq.result.createObjectStore(storeName);\r\n            };\r\n        });\r\n    }\r\n    _withIDBStore(type, callback) {\r\n        return this._dbp.then(db => new Promise((resolve, reject) => {\r\n            const transaction = db.transaction(this.storeName, type);\r\n            transaction.oncomplete = () => resolve();\r\n            transaction.onabort = transaction.onerror = () => reject(transaction.error);\r\n            callback(transaction.objectStore(this.storeName));\r\n        }));\r\n    }\r\n}\r\nlet store;\r\nfunction getDefaultStore() {\r\n    if (!store)\r\n        store = new Store();\r\n    return store;\r\n}\r\nfunction get(key, store = getDefaultStore()) {\r\n    let req;\r\n    return store._withIDBStore('readonly', store => {\r\n        req = store.get(key);\r\n    }).then(() => req.result);\r\n}\r\nfunction set(key, value, store = getDefaultStore()) {\r\n    return store._withIDBStore('readwrite', store => {\r\n        store.put(value, key);\r\n    });\r\n}\r\nfunction del(key, store = getDefaultStore()) {\r\n    return store._withIDBStore('readwrite', store => {\r\n        store.delete(key);\r\n    });\r\n}\r\nfunction clear(store = getDefaultStore()) {\r\n    return store._withIDBStore('readwrite', store => {\r\n        store.clear();\r\n    });\r\n}\r\nfunction keys(store = getDefaultStore()) {\r\n    const keys = [];\r\n    return store._withIDBStore('readonly', store => {\r\n        // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.\r\n        // And openKeyCursor isn't supported by Safari.\r\n        (store.openKeyCursor || store.openCursor).call(store).onsuccess = function () {\r\n            if (!this.result)\r\n                return;\r\n            keys.push(this.result.key);\r\n            this.result.continue();\r\n        };\r\n    }).then(() => keys);\r\n}\n\n\n\n\n//# sourceURL=webpack:///./node_modules/idb-keyval/dist/idb-keyval.mjs?");

/***/ }),

/***/ "./schema/person.jsonld":
/*!******************************!*\
  !*** ./schema/person.jsonld ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = {\"@type\":\"NodeShape\",\"targetClass\":\"Person\",\"property\":[{\"path\":\"familyName\",\"name\":\"Family name\",\"dataType\":\"xsd:string\"},{\"path\":\"givenName\",\"name\":\"First name\",\"dataType\":\"xsd:string\"},{\"path\":\"jobTitle\",\"name\":\"Job / Occupation\",\"dataType\":\"xsd:string\"},{\"path\":\"created\",\"name\":\"Created\",\"dateType\":\"xsd:dateTimeStamp\"}]}\n\n//# sourceURL=webpack:///./schema/person.jsonld?");

/***/ }),

/***/ "./schema/team.jsonld":
/*!****************************!*\
  !*** ./schema/team.jsonld ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = {\"@context\":\"devots:node-shape.jsonld\",\"@type\":\"NodeShape\",\"property\":[{\"path\":\"name\",\"name\":\"Team name\",\"dataType\":\"xsd:string\"},{\"path\":\"created\",\"name\":\"Created\",\"dateType\":\"xsd:dateTimeStamp\"}]}\n\n//# sourceURL=webpack:///./schema/team.jsonld?");

/***/ }),

/***/ "./src/artist/index.js":
/*!*****************************!*\
  !*** ./src/artist/index.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("const div = (key, label, value) => `<div class=\"value ${key}\"><span class=\"label\">${label}</span><span class=\"value\">${value}</span></div>`;\n\nconst ul = lis => `<ul>${lis.join(\"\\n\")}</ul>`;\n\nconst li = (key, content) => `<li id=\"${key}\">${content}</li>`;\n\nconst comment = text => `<!-- ${text} -->`;\n\nfunction renderValue(key, value) {\n  switch (key) {\n    case \"name\":\n      return div(key, \"Name\", value);\n\n    case \"schema\":\n      return \"\";\n\n    default:\n      if (key[0] === \"@\") return \"\";\n      return comment(`Unknown: ${key} ${JSON.stringify(value)}`);\n  }\n}\n\nfunction renderIdMapValues(values) {\n  const items = Object.entries(values).filter(([key]) => key && key[0] !== \"@\" && key !== \"schema\").map(([key, value]) => li(key, renderValues(value)));\n  return ul(items);\n}\n\nfunction renderValuesByType(values) {\n  const types = values[\"@type\"];\n  if (!(Array.isArray(types) && types.length)) return null;\n  if (types.includes(\"IdMap\")) return renderIdMapValues(values);\n  return null;\n}\n\nconst renderValuesByDefault = values => Object.entries(values).reduce((prev, [key, value]) => `${prev}${renderValue(key, value)}\\n`, \"\");\n\nconst renderValues = values => renderValuesByType(values) || renderValuesByDefault(values);\n\nconst renderViewValues = view => view && view.values ? renderValues(view.values) : \"\";\n\nconst renderIndex = view => view && view.index ? `<nav>\n            ${Object.entries(view.index).reduce((prev, [path, childView]) => `${prev}\n                <a href=\"#${path}\" class=\"view\">\n                    ${childView.thumbnail ? `<img class=\"view-thumbnail\" src=\"${childView.thumbnail}\" />` : \"\"}<span class=\"name\">${childView.name || childView.path}</span>\n                </a>`, \"\")}\n        </nav>` : \"\";\n\nfunction renderMainNav() {\n  return `\n\n        <nav class=\"main\">\n            <a href=\"#\" class=\"home\">\n                <span cass=\"name\">Home</span>\n            </a>\n        </nav>\n\n    `;\n}\n\nfunction renderView(view, render) {\n  console.log(\"Rendering\", view);\n  render([renderMainNav(), renderIndex(view), renderViewValues(view)].join(\"\\n\\n\"));\n}\n\nfunction cleanFragment(window) {\n  if (window.document.location.href.endsWith(\"#\")) {\n    history.replaceState(null, document.title, window.location.pathname + window.location.search);\n  }\n}\n\nmodule.exports = {\n  async initialize({\n    user,\n    view,\n    window\n  }) {\n    const container = window.document.querySelector(\"main\");\n\n    const render = html => container.innerHTML = html;\n\n    async function renderViewForPath() {\n      const hashPath = window.document.location.hash.substring(1);\n      cleanFragment(window);\n      const viewPath = view.path.join(\"/\");\n      if (hashPath === viewPath) return;\n      const path = hashPath.split(\"/\");\n      const targetView = await view.commands.nav.go(path);\n\n      if (!targetView) {\n        render(`<div class=\"not-found\">Not found</div>`);\n      } else {\n        view = targetView;\n        renderView(view, render);\n      }\n    }\n\n    window.addEventListener(\"hashchange\", renderViewForPath);\n    renderView(view, render);\n    renderViewForPath();\n  }\n\n};\n\n//# sourceURL=webpack:///./src/artist/index.js?");

/***/ }),

/***/ "./src/data/idb-schemaLoader.js":
/*!**************************************!*\
  !*** ./src/data/idb-schemaLoader.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const schemas = {\n  \"devots:team\": __webpack_require__(/*! ../../schema/team.jsonld */ \"./schema/team.jsonld\"),\n  \"devots:person\": __webpack_require__(/*! ../../schema/person.jsonld */ \"./schema/person.jsonld\")\n};\nmodule.exports = {\n  fetchSchemaFor: function (values) {\n    console.log(\"Asked for schema\", values.schema, schemas[values.schema]);\n    if (!values.schema) return null;\n    if (values.schema in schemas) return schemas[values.schema];\n    throw new Error(`Unrecognised schema: ${values.schema}`);\n  }\n};\n\n//# sourceURL=webpack:///./src/data/idb-schemaLoader.js?");

/***/ }),

/***/ "./src/data/idb.js":
/*!*************************!*\
  !*** ./src/data/idb.js ***!
  \*************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var idb_keyval__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! idb-keyval */ \"./node_modules/idb-keyval/dist/idb-keyval.mjs\");\nconst {\n  initialize\n} = __webpack_require__(/*! ../domain */ \"./src/domain/index.js\");\n\nconst schemaLoader = __webpack_require__(/*! ./idb-schemaLoader */ \"./src/data/idb-schemaLoader.js\");\n\n\n\nconst makePath = (prev, step) => `${prev}/${step}`;\n\nfunction series(store, namespace = \"\") {\n  const indexPath = `${namespace}__index`;\n  const valuesPath = `${namespace}__values`;\n\n  function decorateIndex(index) {\n    Object.entries(index).forEach(([key, values]) => {\n      values.go = () => series(store, makePath(namespace, key));\n    });\n  }\n\n  const loadIndex = async () => await Object(idb_keyval__WEBPACK_IMPORTED_MODULE_0__[\"get\"])(indexPath, store);\n\n  const saveIndex = async index => {\n    await Object(idb_keyval__WEBPACK_IMPORTED_MODULE_0__[\"set\"])(indexPath, index, store);\n    return await loadIndex();\n  };\n\n  const delIndexed = async key => {\n    await Object(idb_keyval__WEBPACK_IMPORTED_MODULE_0__[\"del\"])(makePath(namespace, key), store);\n    return await loadIndex();\n  };\n\n  const loadValues = async () => await Object(idb_keyval__WEBPACK_IMPORTED_MODULE_0__[\"get\"])(valuesPath, store);\n\n  const saveValues = async values => {\n    await Object(idb_keyval__WEBPACK_IMPORTED_MODULE_0__[\"set\"])(valuesPath, values, store);\n    return await loadValues();\n  };\n\n  return {\n    async index() {\n      const index = await loadIndex();\n      if (!index) return null;\n      decorateIndex(index);\n      return index;\n    },\n\n    async addToIndex(hash) {\n      if (!(hash && typeof hash === \"object\")) throw new Error(`Invalid key-value pairs to index: ${hash}`);\n      const index = (await loadIndex()) || {};\n      Object.entries(hash).forEach(([key, value]) => {\n        if (key in index) throw new Error(`Key already exists in this index: ${key}`);\n        if (typeof value !== \"object\") throw new Error(`Index value must be an object. ${key} is of type ${typeof value}: ${value}`);\n        if (!value) throw new Error(`Index value must be truthy. ${key} is ${value}`);\n        index[key] = value;\n      });\n      const updated = await saveIndex(index);\n      decorateIndex(updated);\n      return updated;\n    },\n\n    async removeFromIndex(keys) {\n      const index = (await loadIndex()) || {};\n      if (!(keys && keys.length)) return index;\n      if (!Array.isArray(keys)) keys = Array.from(arguments);\n      await Promise.all(keys.map(async key => {\n        if (key in index) delete index[key];\n        await delIndexed(key);\n      }));\n      const updated = await saveIndex(index);\n      decorateIndex(updated);\n      return updated;\n    },\n\n    async values() {\n      const values = await loadValues();\n      return values || null;\n    },\n\n    async setValues(hash) {\n      const values = await loadValues();\n      if (!hash) return values;\n      const updated = { ...values,\n        ...hash\n      };\n      return await saveValues(updated);\n    },\n\n    async removeValues(keys) {\n      const values = await loadValues();\n      if (!values) return values || null;\n      if (!(keys && keys.length)) return values;\n      keys.forEach(key => {\n        delete values[key];\n      });\n      return await saveValues(values);\n    }\n\n  };\n}\n\nlet options;\n\nconst storeForUser = user => new idb_keyval__WEBPACK_IMPORTED_MODULE_0__[\"Store\"](`tc2-simple-teams__${user && user.username || \"shared\"}`, options.storeName || \"teams\");\n\n/* harmony default export */ __webpack_exports__[\"default\"] = ({\n  configure(overrideOptions) {\n    if (overrideOptions) {\n      options = Object.assign(options || {}, overrideOptions);\n    } else {\n      options = overrideOptions;\n    }\n  },\n\n  // test seam\n  async purgeForUser(user) {\n    const store = storeForUser(user);\n    await Object(idb_keyval__WEBPACK_IMPORTED_MODULE_0__[\"clear\"])(store);\n  },\n\n  async login(user) {\n    const store = storeForUser(user);\n    window.i = {\n      store,\n      get: idb_keyval__WEBPACK_IMPORTED_MODULE_0__[\"get\"],\n      set: idb_keyval__WEBPACK_IMPORTED_MODULE_0__[\"set\"]\n    };\n    const teamsSeries = series(store);\n    const next = options && options.initialize || initialize;\n    next({\n      user,\n      root: teamsSeries,\n      schemaLoader,\n      window: options.window\n    });\n  }\n\n});\n\n//# sourceURL=webpack:///./src/data/idb.js?");

/***/ }),

/***/ "./src/domain/commands.js":
/*!********************************!*\
  !*** ./src/domain/commands.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const {\n  discriminator,\n  editValuesCommand\n} = __webpack_require__(/*! ./symbols */ \"./src/domain/symbols.js\");\n\nasync function editValues(_, node, schemaLoader, values) {\n  const {\n    fetchSchemaFor\n  } = schemaLoader;\n  const schema = await fetchSchemaFor(values);\n  return {\n    [discriminator]: editValuesCommand,\n    schema,\n    execute: async values => await node.setValues(values)\n  };\n}\n\nmodule.exports = {\n  async values(path, node, schemaLoader, values) {\n    if (!values) return [];\n    return [await editValues(path, node, schemaLoader, values)];\n  }\n\n};\n\n//# sourceURL=webpack:///./src/domain/commands.js?");

/***/ }),

/***/ "./src/domain/index.js":
/*!*****************************!*\
  !*** ./src/domain/index.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const artist = __webpack_require__(/*! ../artist */ \"./src/artist/index.js\");\n\nconst {\n  values: valuesCommands\n} = __webpack_require__(/*! ./commands */ \"./src/domain/commands.js\");\n\nconst symbols = __webpack_require__(/*! ./symbols */ \"./src/domain/symbols.js\");\n\nconst {\n  discriminator\n} = symbols;\nmodule.exports = {\n  symbols,\n\n  async initialize({\n    user,\n    root,\n    schemaLoader,\n    window\n  }) {\n    const view = await buildView([], root, root, schemaLoader);\n    artist.initialize({\n      user,\n      view,\n      window\n    });\n  }\n\n};\n\nconst buildKey = bits => bits.join(\"/\");\n\nasync function buildView(path, node, root, schemaLoader) {\n  const values = await node.values();\n  const rawIndex = await node.index();\n\n  function entryKey(key) {\n    return buildKey([...path, key]);\n  }\n\n  function entryValue(key, value) {\n    return { ...value,\n      [discriminator]: key,\n      go: async function () {\n        const newNode = await value.go();\n        return buildView([...path, key], newNode, root, schemaLoader);\n      }\n    };\n  }\n\n  const index = rawIndex ? Object.entries(rawIndex).reduce((prev, [key, value]) => ({ ...prev,\n    [entryKey(key)]: entryValue(key, value)\n  }), {}) : null;\n  const commands = {\n    nav: {\n      go: async function (path) {\n        path = path ? Array.isArray(path) ? path : [path] : [];\n        let step = null;\n        let node = root;\n        const newPath = [];\n\n        while (step = path.shift()) {\n          const index = await node.index();\n          const indexStep = index[step];\n          if (!indexStep) return undefined;\n          node = await indexStep.go();\n          newPath.push(step);\n        }\n\n        return await buildView(newPath, node, root, schemaLoader);\n      }\n    },\n    values: await valuesCommands(path, node, schemaLoader, values)\n  };\n  return {\n    path,\n    values,\n    index,\n    commands\n  };\n}\n\n//# sourceURL=webpack:///./src/domain/index.js?");

/***/ }),

/***/ "./src/domain/symbols.js":
/*!*******************************!*\
  !*** ./src/domain/symbols.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = {\n  discriminator: Symbol(\"discriminator\"),\n  editValuesCommand: Symbol(\"edit-values-command\")\n};\n\n//# sourceURL=webpack:///./src/domain/symbols.js?");

/***/ }),

/***/ "./src/identity/static-idb.js":
/*!************************************!*\
  !*** ./src/identity/static-idb.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _data_idb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../data/idb */ \"./src/data/idb.js\");\n\n/* harmony default export */ __webpack_exports__[\"default\"] = ({\n  run(storeName = \"static-idb\") {\n    const user = {\n      id: \"test-user\"\n    };\n    const options = {\n      storeName,\n      window\n    };\n    console.log(options);\n    _data_idb__WEBPACK_IMPORTED_MODULE_0__[\"default\"].configure(options);\n    _data_idb__WEBPACK_IMPORTED_MODULE_0__[\"default\"].login(user);\n  }\n\n});\n\n//# sourceURL=webpack:///./src/identity/static-idb.js?");

/***/ }),

/***/ "./test/scratch-pad.js":
/*!*****************************!*\
  !*** ./test/scratch-pad.js ***!
  \*****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _src_identity_static_idb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../src/identity/static-idb */ \"./src/identity/static-idb.js\");\n\n_src_identity_static_idb__WEBPACK_IMPORTED_MODULE_0__[\"default\"].run(\"scratch-pad\");\n\n//# sourceURL=webpack:///./test/scratch-pad.js?");

/***/ })

/******/ });
});