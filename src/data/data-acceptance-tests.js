const assert = polyfill( require( "assert" ) );

module.exports = async function( store ) {

    console.log( "\n", new Date(), "\n" );

    let testContext = null;
    store.configure( { initialize: x => { testContext = x; } } );

    console.log( " - Given login, test context user should equal \"dat-user\"" );
    await store.login( { username: "dat-user" } );
    assert.deepStrictEqual( testContext.user, { username: "dat-user" } );

    const { root } = testContext;

    console.log( " - Index should return null" );
    assert.strictEqual( await root.index(), null );

    console.log( " - Add to index with non-object value should throw" );
    await assert.rejects( () => root.addToIndex( { aboolean: false } ) );

    console.log( " - Add to index with null object should throw" );
    await assert.rejects( () => root.addToIndex( { anull: null } ) );

    console.log( " - Add item to index, then index should return item" );
    const a = await root.addToIndex( { ASG: { name: "andrew" } } );
    assert.strictEqual( a.ASG.name, "andrew" );
    const b = await root.index();
    assert.deepStrictEqual( Object.keys( b ), [ "ASG" ] );

    console.log( " - Add item to index should return an index with navigable entries" );
    const o = await a.ASG.go();
    const o1 = await o.index();
    assert.strictEqual( o1, null );

    console.log( " - Add duplicate item to index should throw" );
    await assert.rejects( () => root.addToIndex( { ASG: { oops: "eee" } } ) );

    console.log( " - Remove item from index, then index should no longer return item" );
    const l = await root.index();
    await root.addToIndex( { AMG: { name: "fomo" } } );
    const l1 = await root.index();
    assert.deepStrictEqual( Object.keys( l1 ).sort(), [ "ASG", "AMG" ].sort() );
    const l2 = await root.removeFromIndex( "AMG" );
    assert.deepStrictEqual( Object.keys( l2 ), [ "ASG" ] );
    const l3 = await root.index();
    assert.deepStrictEqual( Object.keys( l2 ), Object.keys( l3 ) );

    console.log( " - Remove item from index, returned index should contain navigable entries" );
    const n = await l2.ASG.go();
    const n1 = await n.index();
    assert.strictEqual( n1, null );

    console.log( " - Values should return null" );
    assert.strictEqual( await root.values(), null );

    console.log( " - Remove values when there are no values should just return null" );
    const m = await root.removeValues( "oops" );
    assert.strictEqual( m, null );

    console.log( " - Add item to values, then values should return item" );
    const c = await root.setValues( { hello: "world" } );
    assert.deepStrictEqual( c, { hello: "world" } );
    const d = await root.values();
    assert.deepStrictEqual( d, { hello: "world" } );

    console.log( " - Add another item to values, then values should return merged item" );
    const e = await root.setValues( { goodbye: "heaven" } );
    assert.deepStrictEqual( e, { hello: "world", goodbye: "heaven" } );
    const f = await root.values();
    assert.deepStrictEqual( f, { hello: "world", goodbye: "heaven" } );

    console.log( " - Set values with nothing should just return values" );
    const q = await root.setValues( undefined );
    assert.deepStrictEqual( q, f );

    console.log( " - Remove values should remove entries from the values" );
    const g0 = await root.setValues( { x: "y" } );
    assert.deepStrictEqual( g0, { hello: "world", goodbye: "heaven", x: "y" } );
    const g = await root.removeValues( [ "hello", "x" ] );
    assert.deepStrictEqual( g, { goodbye: "heaven" } );

    console.log( " - Remove values with no keys specified should just return the values" );
    const r = await root.removeValues();
    assert.deepStrictEqual( r, g );

    console.log( " - Navigate to indexed item" );
    const h0 = await root.index();
    const h = await h0.ASG.go();
    const i = await h.values();
    const j0 = await h.setValues( { x: 1 } );
    const j = await h.values();
    assert.deepStrictEqual( j0, j );
    const k0 = await h.addToIndex( { JBG: { name: "Jonathan" }, SJ: { name: "Sarah-Jane" } } );
    const k = await h.index();
    assert.deepStrictEqual( { JBG: { name: k0.JBG.name } }, { JBG: { name: k.JBG.name } } );
    assert.deepStrictEqual( Object.keys( k ), Object.keys( k0 ) );

}

function polyfill( maybeWebpackAssert ) {

    // polyfill for webpack
    maybeWebpackAssert.rejects = maybeWebpackAssert.rejects || async function( func ) {

        try { await func(); } catch( err ) { return err; }
        throw new Error( "No exception was thrown" );

    };
    return maybeWebpackAssert;

}