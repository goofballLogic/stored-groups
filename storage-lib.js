const { promisify } = require( "util" );
const path = require( "path" );
const fs = require( "fs" );
const readdir = promisify( fs.readdir );
const lstat = promisify( fs.lstat );
const unlink = promisify( fs.unlink );
const rmdir = promisify( fs.rmdir );

async function rmDirForce( dir ) {

    // thanks: https://stackoverflow.com/a/49006652/275501
    const files = await readdir( dir );
    await Promise.all( files.map( async file => {

        const p = path.join( dir, file );
        const stat = await lstat( p );
        if ( stat.isDirectory() ) {

            await rmDirForce( p );

        } else {

            await unlink(p);

        }

    } ) );
    await rmdir( dir );

}

module.exports = {

    rmDirForce

};