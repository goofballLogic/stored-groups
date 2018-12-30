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
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = function() {

    // thanks: https://gist.github.com/gordonbrander/2230317
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {const Group = __webpack_require__( 3 );
const dateid = __webpack_require__( 0 );

module.exports = storage => {

    const { buckets, bucket } = storage;

    async function listGroups() {

        const groupBuckets = await buckets();
        return Promise.all( groupBuckets.map( Group.load ) );

    }

    async function createGroup( options ) {

        let { id, name } = options;
        if ( !name ) throw new Error( "No name specified" );
        id = id || dateid();
        const groupBucket = await bucket( id );
        const creating = new Group( groupBucket, options );
        await creating.saveCommand.invoke();
        return await Group.load( groupBucket );

    }

    return {

        listGroups,
        createGroup

    };

};
console.log( module );
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(2)(module)))

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

const Command = __webpack_require__( 4 );
const dateid = __webpack_require__( 0 );

const groupDetailsSymbol = Symbol( "Group details" );
const persistedGroupDetailsSymbol = Symbol( "Group details persisted" );

const clone = x => JSON.parse( JSON.stringify( x ) );

function createNamedMapItem( site, mapName, details ) {

    const { name } = details;
    if ( !name ) throw new Error( "No name specified" );
    const id = details.id || dateid();
    const item = { ...details };
    delete item.id;
    const map = site[ mapName ] || {};
    site[ mapName ] = map;
    if ( id in map ) throw new Error( "Item already exists" );
    map[ id ] = item;
    return { ...item, id };

}

module.exports = class Group {

    constructor( bucket, details, isPersisted = false ) {

        this.bucket = bucket;
        this[ groupDetailsSymbol ] = details || {};
        this[ persistedGroupDetailsSymbol ] = isPersisted ? clone( details ) : {};

    }

    createSeries( details ) {

        return createNamedMapItem( this[ groupDetailsSymbol ], "series", details );

    }

    createMember( details ) {

        return createNamedMapItem( this[ groupDetailsSymbol ], "members", details );

    }

    async updateTimeSeries( series, when, details ) {

        when = Number( when );
        const { id } = series;
        const { series: seriesMap } = this[ persistedGroupDetailsSymbol ];
        if ( !( seriesMap && id in seriesMap ) )
            throw new Error( "Series doesn't exist. Did you forget to save the Group first?" );
        const year = ( new Date( when ) ).getUTCFullYear();
        const item = await this.bucket.item( `${id}_${year}` );
        await item.replacePropertyValue( when, details );
        return ( await item.content() )[ when ];

    }

    async queryTimeSeries( series, min, max ) {

        const { id } = series;
        const { series: seriesMap } = this[ persistedGroupDetailsSymbol ];
        if ( !( seriesMap && id in seriesMap ) )
            return undefined;
        const minYear = ( new Date( min ) ).getUTCFullYear();
        const maxYear = ( new Date( max ) ).getUTCFullYear();
        const items = [];
        for( var year = minYear; year <= maxYear; year++ ) {

            items.push( this.bucket.item( `${id}_${year}` ) );

        }
        const yearItems = await Promise.all( items );
        const yearData = await Promise.all( yearItems.map( item => item.content() ) );
        const results = {};
        for( var year of yearData ) {

            for( var when in year ) {

                when = Number( when );
                if ( when < min ) continue;
                if ( when > max ) continue;
                results[ when ] = year[ when ];

            }

        }
        return results;

    }

    get id() {

        return this.bucket.name;

    }

    get name() {

        return this[ groupDetailsSymbol ].name;

    }

    setValue( key, value ) {

        const details = this[ groupDetailsSymbol ];
        details.values = { ...details.values, [ key ]: value };

    }

    getValue( key ) {

        const details = this[ groupDetailsSymbol ];
        return details.values && details.values[ key ];

    }

    get members() {

        return clone( this[ groupDetailsSymbol ].members || {} );

    }

    get deleteCommand() {

        return new Command( "DELETE_TEAM", `Delete team: ${this.name}`, async () => {

            this.bucket.delete();

        } );

    }

    get saveCommand() {

        return new Command( "SAVE_TEAM", `Save team: ${this.name}`, async () => {

            const details = await this.bucket.item( "details" );
            await details.content( this[ groupDetailsSymbol ] );
            this[ groupDetailsSymbol ] = await details.content();
            this[ persistedGroupDetailsSymbol ] = clone( this[ groupDetailsSymbol ] );

        } );

    }

    static async load( bucket ) {

        let content;
        try {

            const details = await bucket.item( "details" );
            content = await details.content();

        } catch( err ) {

            console.warn( `Error loading group ${bucket.name}: ${err.stack}` );
            content = {};

        }
        return new Group( bucket, content, true );

    }

};

/***/ }),
/* 4 */
/***/ (function(module, exports) {

const strategySymbol = Symbol( "Strategy" );

module.exports = class Command {

    constructor( id, name, strategy ) {

        this.id = id;
        this.name = name;
        this.invoke = async () => {

            const result = await strategy();
            return {

                completed: Date.now(),
                command: this,
                result

            };

        };

    }

}

/***/ })
/******/ ]);
});