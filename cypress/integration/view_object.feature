Feature: View an object
    As a user of a rendered application
    I want to be able to view a data object in read-only mode
    So that I can view information

    Background: local-dev provider
        Given the app is configured to use the "local-dev" provider
        And I am logged in to the application home page

    Scenario: Render the app
        When I navigate to a dataset "The Eggheads"
        Then it should display a link to itself
        And it should show simple property values
        And it should link to objects within itself - e.g. team -> current scoresheet
        And it should link to collections within itself - e.g. team -> team members