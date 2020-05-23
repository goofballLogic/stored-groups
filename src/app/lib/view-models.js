function maybeExpand(labelTemplate, query) {
    return labelTemplate && labelTemplate.replace(/\{([^}]*)\}/, (_, path) => query.query(path));
}

function buildTenantRootURL(context) {
    const tenant = context.tenant;
    const url = new URL(location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("tenant", context.encode(tenant));
    return url;
}

const blacklist = ["save"];

function buildThisURL() {
    const url = new URL(location.href);
    blacklist.forEach(key => url.searchParams.delete(key));
    return url.toString().substring(url.origin.length);
}

function trimSearchParam(pattern, url) {
    url = new URL(url, location.href);
    blacklist.forEach(key => url.searchParams.delete(key));
    Array.from(url.searchParams.keys())
        .filter(key => pattern.test(key))
        .forEach(key => url.searchParams.delete(key));
    return url.toString();
}

const editMode = "edit";
const selectMode = "select";

export default function buildViewModels({ dataSets, choiceDataSet, tenant, shapeIndex, context }) {
    const { vocabNamespace, choicePath, returnURL } = context;
    const selectReturnURL = trimSearchParam(/^choice/, returnURL);
    const thisURL = buildThisURL();
    const tenantRootURL = buildTenantRootURL(context);
    const encodedThisURL = context.encode(thisURL);

    const choiceProps = choiceDataSet && choiceDataSet
        .properties(shapeIndex)
        .map(prop => prepareProperty(choiceDataSet, prop));

    return dataSets.map(prepareDataSet);

    function prepareDataSet(dataSet) {
        const id = dataSet.id();
        const encodedId = context.encode(id);
        const relativeId = id && tenant.relativeId(id);
        const encodedRelativeId = id && context.encode(relativeId);

        const relativeEditTarget = dataSet.editsUrl;

        const props = dataSet.properties(shapeIndex).map(prop => prepareProperty(dataSet, prop));
        const types = dataSet.types.map(t => t.replace(vocabNamespace, ""));

        return ({
            choicePath,
            encodedId,
            encodedRelativeId,
            editMode,
            encodedThisURL,
            id,
            props,
            relativeId,
            relativeEditTarget,
            returnURL,
            selectMode,
            selectReturnURL,
            tenantRootURL,
            thisURL,
            types
        });
    }

    function prepareProperty(dataSet, prop) {

        const multiValue = prop.maxCount !== 1;
        const queries = dataSet.ld.queryAll(`> ${prop.path}`);
        const digest = { prop, multiValue, editable: !prop.immutable };
        if (!queries.length)
            return digest;
        digest.label = maybeExpand(prop.labelTemplate, dataSet.ld) || prop.path;
        digest.hidden = prop.hidden;
        console.log(prop);
        digest.datatype = (prop.dataType || "string").split("#").slice(-1)[0];
        if (prop.class) {
            processClassed();
        } else {
            switch (prop.nodeKind) {
                case null:
                    processValues();
                    break;
                case "http://www.w3.org/ns/shacl#IRI":
                    processIds();
                    break;
                case "http://www.w3.org/ns/shacl#BlankNode":
                    processNestedDataSets();
                    break;
                default:
                    throw new Error("Unhandled nodeKind - " + JSON.stringify(prop));
            }
        }
        return digest;

        function processNestedDataSets() {
            const nestedDataSets = queries.map(query => dataSet.buildSubset({ query }));
            digest.viewModels = nestedDataSets.map(prepareDataSet);
        }

        function processValues() {
            if (!multiValue)
                digest.value = queries[0].query("> @value");
            else
                digest.values = queries.map(q => q.query("> @value"));
        }

        function processClassed() {
            digest.encodedChooseId = findChooseableId();
            digest.chooseMode = "select";
            digest.editable = !!digest.encodedChooseId;
            digest.encodedThisURL = context.encode(thisURL);
            digest.choosePath = prop.path;
            const ids = queries.map(buildIdHash);
            digest.ids = multiValue ? ids : ids[0];

            if (context.choice && context.choicePath === prop.path) {
                const selectionIds = buildIdHash(choiceDataSet.ld);
                if (selectionIds.id !== digest.ids.id) {
                    console.log("Dirty selection", selectionIds, "vs current", digest.ids);
                    digest.selection = choiceProps;
                    digest.label = maybeExpand(prop.labelTemplate, choiceDataSet.ld) || prop.path;
                    digest.ids = selectionIds;
                }
            }
        }

        function processIds() {
            const ids = queries.map(buildIdHash);
            digest.ids = multiValue ? ids : ids[0];
            digest.editable = false;
        }

        function buildIdHash(q) {
            // TODO: are all these needed?
            const id = (typeof q === "string") ? q : q.query("> @id");
            const relativeId = tenant.relativeId(id);
            const encodedRelativeId = context.encode(relativeId);
            const displayValue = maybeExpand(prop.valueTemplate, q);
            return { id, relativeId, encodedRelativeId, displayValue };
        }

        function findChooseableId() {
            const chooseFrom = prop.chooseFrom;
            const chooseFromId = dataSet.ld.query(`${chooseFrom} @id`);
            if (!chooseFromId) return undefined;
            return context.encode(tenant.relativeId(chooseFromId));
        }
    }
}