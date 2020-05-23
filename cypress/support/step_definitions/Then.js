import { Then } from "cypress-cucumber-preprocessor/steps";
import {
    selfLinkIsDisplayed,
    linksToObjectsAreRendered,
    linksToCollectionsAreRendered
} from "../src/assertions/links";
import {
    simplePropertiesAreDisplayed,
    simplePropertiesAreDisplayedWithinAList,
    listOfDataSetsIsDisplayed
} from "../src/assertions/property-display";

Then("it should display a link to itself", selfLinkIsDisplayed);
Then("it should display a link to itself with the label {string}", selfLinkIsDisplayed)
Then("it should link to objects within itself", linksToObjectsAreRendered);
Then("it should link to collections within itself", linksToCollectionsAreRendered);
Then("it should display a list of data sets {string}", listOfDataSetsIsDisplayed);
Then("it should display a self-link to the opened dataset {string}", selfLinkIsDisplayed);
Then("I should be back at the {string} choosing page", listOfDataSetsIsDisplayed);
Then("it should display the properties", simplePropertiesAreDisplayed);
Then("it should display properties within an outer list {string}", simplePropertiesAreDisplayedWithinAList);