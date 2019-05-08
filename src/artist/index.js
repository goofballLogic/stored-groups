async function fetch( view, indexPredicate ) {

    if ( !( view && view.index ) ) return undefined;
    const item = Object.values( view.index ).find( indexPredicate );
    return ( item && item.go ) ? await item.go() : undefined;

}

module.exports = {

    async initialize( { user, view } ) {

        console.log( user );
        const teamZero = await fetch( view, x => x.name === "Team Zero" );

        console.log( "\n\nHere is Team Zero\n" );
        console.dir( teamZero, { depth: 6 } );

        // const members = await fetch( teamZero, x => x.name === "Members" );
        // console.log( "\n\nHere are the members\n" );
        // console.dir( members, { depth: 4 } );

    }

};
