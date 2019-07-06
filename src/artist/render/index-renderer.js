const {

    div,
    nav

} = require( "../inputs" );
const {

    isSystem

} = require( "../../domain/symbols" );

const renderIndex = view =>

    ( view && view.index )

        ? nav(

            Object.entries( view.index )
                .filter( ( [ key ] ) => !isSystem( key ) )
                .reduce( ( prev, [ path, childView ] ) =>

                    `${prev}
                    <a href="#${path}" class="view">
                        ${

                            childView.thumbnail
                                ? `<img class="view-thumbnail" src="${childView.thumbnail}" />`
                                : div( "view-thumbnail-initial", ( childView.name || childView.path || "?" ).substr( 0, 1 ) )

                        }<span class="name">${

                            childView.name || childView.path

                        }</span>
                    </a>`,
                    ""

                )

        )
        : "";

module.exports = {

    renderIndex

};
