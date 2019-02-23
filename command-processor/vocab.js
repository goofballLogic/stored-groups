const ns = "http://simple-teams.openteamspace.com/vocab#"

module.exports = {

    context: "https://raw.githubusercontent.com/goofballLogic/stored-groups/master/design/things/context.jsonld",
    commandTypes: {

        create: `${ns}CreateSeriesCommand`,
        delete: `${ns}DeleteSeriesCommand`

    }

};