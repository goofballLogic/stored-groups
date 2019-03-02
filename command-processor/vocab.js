const ns = "http://vocab.simple-teams.openteamspace.com/"

module.exports = {

    context: "https://raw.githubusercontent.com/goofballLogic/stored-groups/master/design/things/context.jsonld",
    simpleTeamsVocab: ns,
    batchKeys: {

        commands: `${ns}commands`,
        series: `${ns}series`,
        props: `${ns}props`,
        keys: `${ns}keys`,
        base: `${ns}base`,
        values: `${ns}values`,
        items: `${ns}items`,
        options: `${ns}options`,
        type: `${ns}type`,
        ns: `${ns}ns`

    },
    commandTypes: {

        create: `${ns}CreateSeriesCommand`,
        delete: `${ns}DeleteSeriesCommand`,
        setValues: `${ns}SetValuesCommand`,
        deleteValues: `${ns}DeleteValuesCommand`,
        setItems: `${ns}SetItemsCommand`

    }

};