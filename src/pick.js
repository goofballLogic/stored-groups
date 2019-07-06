module.exports = ( obj, props ) =>

    props.reduce( ( x, prop ) =>

        ( {

            ...x,
            [ prop ]: obj[ prop ]

        } ),
        {}

    );