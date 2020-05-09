Feature: Choose a dataset
    As a user of a rendered application
    I want to be able to choose a dataset
    So that I can work with the chosen team / group / organisation

    Background: local-dev provider
        Given the app is configured to use the "local-dev" provider
        And I am logged in to the application home page

    Scenario: Home page should display datasets
        Then it should display a list of data sets "Your teams"
            | name         |
            | The Eggheads |

    Scenario: Open a dataset
        When I choose to open a dataset "The Eggheads"
        Then it should display a self-link to the opened dataset "The Eggheads"

    Scenario: Home link
        When I choose to open a dataset "The Eggheads"
        And I follow the "Home" link
        Then I should be back at the "Your teams" choosing page