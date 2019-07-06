module.exports = {

    node( root, buildViewForPathAndNode ) {

        return {

            async go( path ) {

                path = Array.isArray( path ) ? [ ...path ] : [ path ];
                let step = null;
                let node = root;
                const newPath = [];
                while( step = path.shift() ) {

                    const index = await node.index();
                    const indexStep = index[ step ];
                    if ( !indexStep ) return undefined;
                    node = await indexStep.go();
                    newPath.push( step );

                }
                return await buildViewForPathAndNode( newPath, node );

            }

        }

    },

    entry( value, buildViewForPathAndNode ) {

        return {

            async go() {

                const newNode = await value.go();
                return await buildViewForPathAndNode( [ ...path, key ], newNode );

            }

        };

    }


}
