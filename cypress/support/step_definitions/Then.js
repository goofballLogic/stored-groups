import { Then } from "cypress-cucumber-preprocessor/steps";
import {
    selfLinkIsDisplayed,
    linksToObjectsAreRendered,
    linksToCollectionsAreRendered
} from "../src/assertions/links";
import {
    simplePropertyValuesAreDisplayed,
    listOfDataSetsIsDisplayed
} from "../src/assertions/property-display";

Then("it should display a link to itself", selfLinkIsDisplayed);
Then("it should show simple property values", simplePropertyValuesAreDisplayed);
Then("it should link to objects within itself - e.g. team -> current scoresheet", linksToObjectsAreRendered);
Then("it should link to collections within itself - e.g. team -> team members", linksToCollectionsAreRendered);
Then("it should display a list of data sets {string}", listOfDataSetsIsDisplayed);
Then("it should display a self-link to the opened dataset {string}", selfLinkIsDisplayed);
Then("I should be back at the {string} choosing page", listOfDataSetsIsDisplayed);