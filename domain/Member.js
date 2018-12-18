const memberDetailsSymbol = Symbol( "Member details" );
const memberIdSymbol = Symbol( "Member id" );

module.exports = class Member {

    constructor( id, details ) {

        this[ memberIdSymbol ] = id;
        this[ memberDetailsSymbol ] = details || {};

    }

    get id() {

        return this[ memberIdSymbol ];

    }

    get name() {

        return this[ memberDetailsSymbol ].name;

    }

    get details() {

        return { ...this[ memberDetailsSymbol ] };

    }

    toJSON() {

        return {

            ...this[ memberDetailsSymbol ],
            id: this[ memberIdSymbol ]

        };

    }

}