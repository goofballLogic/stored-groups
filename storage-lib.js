const util = require( "util" );
const path = require( "path" );
const fs = require( "fs" );
const readdir = util.promisify( fs.readdir );
const lstat = util.promisify( fs.lstat );
const unlink = util.promisify( fs.unlink );
const rmdir = util.promisify( fs.rmdir );

async function rmDirForce( dir ) {

    // thanks: https://stackoverflow.com/a/49006652/275501
    const files = await readdir( dir );
    await Promise.all( files.map( async file => {

        try {

            const p = path.join( dir, file );
            const stat = await lstat( p );
            if ( stat.isDirectory() ) {

                await rmDirForce( p );

            } else {

                await unlink(p);

            }

        } catch (err) {

            console.error(err);

        }

    } ) );
    await rmdir( dir );

}

module.exports = {

    rmDirForce

};