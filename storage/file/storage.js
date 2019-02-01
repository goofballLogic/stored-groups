const { join, basename, extname } = require( "path" );
const util = require( "util" );
const fs = require( "fs" );
const writeFile = util.promisify( fs.writeFile );
const mkdir = util.promisify( fs.mkdir );
const readdir = util.promisify( fs.readdir );
const readFile = util.promisify( fs.readFile );
const unlink = util.promisify( fs.unlink );
const access = util.promisify( fs.access )
const { rmDirForce } = require( "./storage-lib" );

class Thing {

    constructor( path, props ) {

        this.path = path;
        this.name = decodeURIComponent( basename( path, extname( path ) ) );
        Object.assign( this, props );
        Object.freeze( this );

    }

    async exists() {

        try {

            await access( this.path, fs.constants.F_OK );
            return true;

        } catch( err ) {

            if ( err.code === "ENOENT" ) return false;
            throw err;

        }

    }

}

class Item extends Thing {

    constructor( path, bucket ) {

        if ( !path ) throw new Error( "No path specified" );
        super( path, { bucket } );

    }

    // delete this item
    async delete() {

        try {

            await unlink( this.path );

        } catch( err ) {

            if ( err.code !== "ENOENT" ) throw err;

        }

    }

    // retrieve or store content
    async content( data ) {

        if ( typeof data === "undefined" ) {

            try {

                return JSON.parse( await readFile( this.path ) );

            } catch( err ) {

                if ( err.code === "ENOENT" ) return undefined;

            }

        } else {

            await this.bucket.ensureExists();
            await writeFile( this.path, JSON.stringify( data ) );

        }

    }

    // retrieve update a property and store content
    async replacePropertyValue( propName, value ) {

        const data = await this.content() || {};
        data[ propName ] = value;
        await this.content( data );

    }

}

class Bucket extends Thing {

    // list of Items in this bucket (but not buckets contained within this bucket)
    async items() {

        const items = await readdir( this.path, { withFileTypes: true } );
        return items.filter( item => item.isFile() ).map( item => new Item( join( this.path, item.name ), this ) );

    }

    // list of Buckets in this bucket
    async buckets() {

        const items = await readdir( this.path, { withFileTypes: true } );
        return items.filter( item => item.isDirectory() ).map( item => new Bucket( join( this.path, item.name ) ) );

    }

    // create a named bucket within this bucket
    async bucket( name ) {
return null;
        return new Bucket( join( this.path, encodeURIComponent( name ) ) );

    }

    // create a named item within this bucket
    async item( name ) {

        return new Item( join( this.path, `${encodeURIComponent( name )}.json` ), this );

    }

    // ensure that this bucket exists
    async ensureExists() {

        await mkdir( this.path, { recursive: true } );

    }

    // delete this bucket
    async delete() {

        try {

            await rmDirForce( this.path );

        } catch( err ) {

            if ( err.code !== "ENOENT" ) throw err;

        }

    }

}

// the module exposts a bucket representing the root of the storage container
module.exports = rootPath => {

    const root = new Bucket( rootPath );
    return {

        items: root.items.bind( root ),
        item: root.item.bind( root ),
        buckets: root.buckets.bind( root ),
        bucket: root.bucket.bind( root )

    };

};