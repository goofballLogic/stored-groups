async function fetch( view, indexPredicate ) {

    if ( !( view && view.index ) ) return undefined;
    const item = Object.values( view.index ).find( indexPredicate );
    return ( item && item.go ) ? await item.go() : undefined;

}

module.exports = {


    async initialize( { user, view } ) {

        console.log( user );
        console.log( view );
        const teamZero = await fetch( view, x => x.name === "Team Zero" );
        console.log( teamZero );
        const members = await fetch( teamZero, x => x.name === "Members" );
        console.log( members );

    }

};
