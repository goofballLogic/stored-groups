const Command = require( "./Command" );
const dateid = require( "./dateid" );

const groupDetailsSymbol = Symbol( "Group details" );

const clone = x => JSON.parse( JSON.stringify( x ) );

module.exports = class Group {

    constructor( bucket, details ) {

        this.bucket = bucket;
        this[ groupDetailsSymbol ] = details || {};

    }

    createMember( details ) {

        const { name } = details;
        if ( !name ) throw new Error( "No name specified" );
        const id = details.id || dateid();
        const member = { ...details };
        delete member.id;
        const { members = {} } = this[ groupDetailsSymbol ];
        this[ groupDetailsSymbol ].members = members;
        if ( id in members ) throw new Error( "Member already exists" );
        members[ id ] = member;
        return member;

    }

    get id() {

        return this.bucket.name;

    }

    get name() {

        return this[ groupDetailsSymbol ].name;

    }

    get members() {

        return clone( this[ groupDetailsSymbol ].members || {} );

    }

    get deleteCommand() {

        return new Command( "DELETE_TEAM", `Delete team: ${this.name}`, () => this.bucket.delete() );

    }

    get saveCommand() {

        return new Command( "SAVE_TEAM", `Save team: ${this.name}`, async () => {

            const details = await this.bucket.item( "details" );
            await details.content( this[ groupDetailsSymbol ] );
            this[ groupDetailsSymbol ] = await details.content();

        } );

    }

    static async load( bucket ) {

        let content;
        try {

            const details = await bucket.item( "details" );
            content = await details.content();

        } catch( err ) {

            console.warn( `Error loading group ${bucket.name}: ${err.stack}` );
            content = {};

        }
        return new Group( bucket, content );

    }

};