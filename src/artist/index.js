const { discriminator, editValuesCommand } = require( "../domain/symbols" );

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

        const command = teamZero.commands.values.find(c => c[ discriminator ] === editValuesCommand );
        console.log( "\n\nHere is the command\n" );
        console.dir( command, { depth: 6 } );

        console.log( "\n\nBefore and after saving\n" );

        console.log( teamZero.values );
        const reversedName = teamZero.values.name.split( "" ).reverse().join( "" );
        await command.execute( { name: reversedName } );
        const teamZero2 = await fetch( view, x => x.name === "Team Zero" );
        console.log( teamZero2.values );
    }

};
