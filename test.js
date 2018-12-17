const { join } = require( "path" );
const assert = require( "assert" );
const data = join( __dirname, "test-data" );
const { items, buckets, bucket, item } = require( "./storage" )( data );

function runTests( fixtureName, fixture ) {

    console.log( fixtureName, "\n" );
    Object.keys( fixture )
        .filter( x => typeof fixture[ x ] === "function" )
        .forEach( async key => {

            try {

                await fixture[ key ]();
                console.log( `OK ${key}` );

            } catch( err ) {

                console.error( `ERROR ${key}\n${err.stack}` );

            }

        });
}

runTests( "Storage tests", {

    async listItems() {

        const actual = ( await items() ).map( item => item.name );
        assert.deepStrictEqual( actual, [ "names" ] );

    },

    async listBuckets() {

        const actual = ( await buckets() ).map( bucket => bucket.name ).filter( maybeF => maybeF !== "f" );
        assert.deepStrictEqual( actual, [ "a" ] );

    },

    async listItemsInBucket() {

        const bucketA = ( await buckets() ).find( bucket => bucket.name === "a" );
        const actual = await bucketA.items();
        assert.deepStrictEqual( actual.map( item => item.name ), [ "b" ] );

    },

    async listBucketsInBucket() {

        const bucketA = ( await buckets() ).find( bucket => bucket.name === "a" );
        const actual = await bucketA.buckets();
        assert.deepStrictEqual( actual.map( bucket => bucket.name ), [ "b", "e" ] );

    },

    async listItemsInBucketInBucket() {

        const bucketA = ( await buckets() ).find( bucket => bucket.name === "a" );
        const bucketB = ( await bucketA.buckets() ).find( bucket => bucket.name === "b" );
        const actual = await bucketB.items();
        assert.deepStrictEqual( actual.map( bucket => bucket.name ), [ "c", "d" ] );

    },

    async fetchContentInItemInBucket() {

        const bucketA = ( await buckets() ).find( bucket => bucket.name === "a" );
        const itemB = ( await bucketA.items() ).find( item => item.name === "b" );
        const actual = await itemB.content();
        assert.deepStrictEqual( actual, [ "I am b" ] );

    },

    async makeBucket() {

        const actual = await bucket( "f" );
        assert.deepStrictEqual( actual.name, "f" );

    },

    async makeItemInBucketInBucket() {

        const bucketF = await bucket( "f" );
        await bucketF.delete();
        const bucketG = await bucketF.bucket( "g" );
        const itemH = await bucketG.item( "h" );
        await itemH.content( { "hello": "world" } );
        const actual = await itemH.content();
        assert.deepStrictEqual( actual, { "hello": "world" } );
        await bucketF.delete();

    },

    async deleteItem() {

        const itemI = await item( "i" );
        await itemI.content( "Hello from item i" );
        const created = ( await items() ).map( item => item.name );
        assert( created.includes( "i" ) );
        await itemI.delete();
        const deleted = ( await items() ).map( item => item.name );
        assert( !deleted.includes( "i" ) );

    }

} );