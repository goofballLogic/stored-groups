export const simplePropertiesAreDisplayed = table =>
    table.hashes().forEach(hash => simplePropertyIsDisplayed(cy, hash));

export const simplePropertiesAreDisplayedWithinAList = (outerList, table) =>
    cy.contains(".property .label", outerList).parent().within(() =>
        table.hashes().forEach(hash => {
            const li = cy.get(`> .property-value > ol > li:nth-of-type(${hash.order})`);
            simplePropertyIsDisplayed(li, hash);
        })
    );

const simplePropertyIsDisplayed = (container, spec) => {
    const { type, label, value, list } = spec;
    container
        .contains(".property .label", label)
        .parent()
        .within(() =>
            (list && list !== "no")
                ? listAssertion(cy.get(`.property-value ol.${type}-values`), spec)
                : cy.contains(`.property-value .${type}-value`, value)
        );
};

const listAssertion = (container, spec) => {
    const { value, ["item count"]: itemCount } = spec;
    if (itemCount)
        container.find("> li").should("have.length", itemCount);

    container.within(() => {
        if (value) {
            const values = value.split(",").map(x => x.trim());
            for (var i = 1; i <= itemCount; i++) {
                cy.contains(`li:nth-of-type(${i})`, values[i - 1]);
            }
        }
    });

};

export const listOfDataSetsIsDisplayed = (listName, expected) =>
    cy
        .contains(".property .label", "List")
        .parent()
        .contains(".property-value", listName)
        .parent()
        .parent()
        .contains(".property .label", "Items")
        .parent()
        .find(".property-value ul")
        .then(list =>
            expected && expected.hashes().forEach(item =>
                cy.get(list).contains("li .property a", item.name)
            )
        );