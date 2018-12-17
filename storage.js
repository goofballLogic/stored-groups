const { join, basename, extname } = require( "path" );
const util = require( "util" );
const fs = require( "fs" );
const writeFile = util.promisify( fs.writeFile );
const mkdir = util.promisify( fs.mkdir );
const readdir = util.promisify( fs.readdir );
const readFile = util.promisify( fs.readFile );
const unlink = util.promisify( fs.unlink );
const { rmDirForce } = require( "./storage-lib" );

const data = join( __dirname, "data" );

class Thing {

    constructor( path, props ) {

        this.path = path;
        this.name = basename( path, extname( path ) );
        Object.assign( this, props );
        Object.freeze( this );

    }

}

class Item extends Thing {

    constructor( path, bucket ) {

        if ( !path ) throw new Error( "No path specified" );
        super( path, { bucket } );

    }

    async delete() {

        try {

            await unlink( this.path );

        } catch( err ) {

            if ( err.code !== "ENOENT" ) throw err;

        }

    }

    async content( data ) {

        if ( !data )
            return JSON.parse( await readFile( this.path ) );
        else {

            await this.bucket.ensureExists();
            await writeFile( this.path, JSON.stringify( data ) );

        }

    }

}

class Bucket extends Thing {

    constructor( path ) {

        super( path || data );

    }

    async items() {

        const items = await readdir( this.path, { withFileTypes: true } );
        return items.filter( item => item.isFile() ).map( item => new Item( join( this.path, item.name ), this ) );

    }

    async buckets() {

        const items = await readdir( this.path, { withFileTypes: true } );
        return items.filter( item => item.isDirectory() ).map( item => new Bucket( join( this.path, item.name ) ) );

    }

    async bucket( name ) {

        return new Bucket( join( this.path, name ) );

    }

    async item( name ) {

        return new Item( join( this.path, `${name}.json` ), this );

    }

    async ensureExists() {

        await mkdir( this.path, { recursive: true } );

    }

    async delete() {

        try {

            await rmDirForce( this.path );

        } catch( err ) {

            if ( err.code !== "ENOENT" ) throw err;

        }

    }

}

const root = new Bucket( "" );

module.exports = {

    items: root.items.bind( root ),
    item: root.item.bind( root ),
    buckets: root.buckets.bind( root ),
    bucket: root.bucket.bind( root )

};