import { When } from "cypress-cucumber-preprocessor/steps";
import {
    linkByName,
    toTenantHome
} from "../src/navigate";

When("I navigate to a dataset {string}", linkByName);
When("I choose to open a dataset {string}", linkByName);
When("I follow the {string} link", linkByName);