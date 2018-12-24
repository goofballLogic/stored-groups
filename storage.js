const { join, basename, extname } = require( "path" );
const util = require( "util" );
const fs = require( "fs" );
const writeFile = util.promisify( fs.writeFile );
const mkdir = util.promisify( fs.mkdir );
const readdir = util.promisify( fs.readdir );
const readFile = util.promisify( fs.readFile );
const unlink = util.promisify( fs.unlink );
const { rmDirForce } = require( "./storage-lib" );

class Thing {

    constructor( path, props ) {

        this.path = path;
        this.name = decodeURIComponent( basename( path, extname( path ) ) );
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

        if ( !data ) {

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

    async replacePropertyValue( propName, value ) {

        const data = await this.content() || {};
        data[ propName ] = value;
        await this.content( data );

    }

}

class Bucket extends Thing {

    async items() {

        const items = await readdir( this.path, { withFileTypes: true } );
        return items.filter( item => item.isFile() ).map( item => new Item( join( this.path, item.name ), this ) );

    }

    async buckets() {

        const items = await readdir( this.path, { withFileTypes: true } );
        return items.filter( item => item.isDirectory() ).map( item => new Bucket( join( this.path, item.name ) ) );

    }

    async bucket( name ) {

        return new Bucket( join( this.path, encodeURIComponent( name ) ) );

    }

    async item( name ) {

        return new Item( join( this.path, `${encodeURIComponent( name )}.json` ), this );

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

module.exports = rootPath => {

    const root = new Bucket( rootPath );
    return {

        items: root.items.bind( root ),
        item: root.item.bind( root ),
        buckets: root.buckets.bind( root ),
        bucket: root.bucket.bind( root )

    };

};