import { Given } from "cypress-cucumber-preprocessor/steps";
import { configure as configureProvider } from "../src/providers";
import { 
    toTenantHome
} from "../src/navigate";

Given("the app is configured to use the {string} provider", configureProvider);
Given("I am logged in to the application home page", toTenantHome);