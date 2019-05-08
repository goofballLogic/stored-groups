const del = require( "del" );
const { readFile, writeFile, rmdir, mkdir } = require( "fs" ).promises;
const { parse } = require( "path" );


async function acceptErrCode( code, returnValue, wrapped ) {

    try {

        return await wrapped();

    } catch( err ) {

        if ( err && err.code === code ) return returnValue;
        throw err;

    }

}

module.exports = {

    async load( path ) {

        return await acceptErrCode( "ENOENT", null, async () => {

            const data = await readFile( path );
            return JSON.parse( data.toString() );

        } );

    },

    async save( obj, path ) {

        const { dir } = parse( path );
        await mkdir( dir, { recursive: true } );
        const data = JSON.stringify( obj, null, 1 );
        await writeFile( path, data );
        return JSON.parse( data );

    },

    async purgeFolder( path ) {

        await acceptErrCode( "ENOENT", undefined, async () => {

            await del( path );

        } );

    }

};