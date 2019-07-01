import identity from "../src/identity/static-idb";
import template from "../templates/team.jsonld";
identity.run( {

    storeName: "scratch-pad2",
    template

} );