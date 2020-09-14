Feature: View an object
    As a user of a rendered application
    I want to be able to view a data object in read-only mode
    So that I can view information

    Background: local-dev provider
        Given the app is configured to use the "local-dev" provider
        And I am logged in to the application home page
        And I navigate to a dataset "The Eggheads"

    Scenario: Render a dataset home screen with links to various areas
        Then it should display a link to itself
        And it should link to objects within itself
            | name               |
            | Current scoresheet |
        And it should link to collections within itself
            | name            |
            | Team members    |
            | Scoresheets     |
            | Scores          |
            | Goals           |
            | Scoring periods |

    Scenario: Render an object with a complex label template
        When I navigate to "Current scoresheet"
        Then it should display a link to itself with the label "Score sheet: January 1st, 2019"

    Scenario: Render a date property
        When I navigate to "Current scoresheet"
        Then it should display the properties
            | type     | label   | value                |
            | dateTime | Created | 2019-01-01T00:00:00Z |

    Scenario: Render a list of nested objects
        When I navigate to "Current scoresheet"
        Then it should display the properties
            | type   | label      | list | item count |
            | object | Score menu | yes  | 2          |

    @only
    Scenario: Render properties in a list of nested objects
        When I navigate to "Current scoresheet"
        Then it should display properties within an outer list "Score menu"
            | order | type    | label | value                                                                         | list | item count |
            | 1     | integer | Range | -3, 5                                                                         | yes  | 2          |
            | 1     | string  | Test  | Was the build broken by new code added this sprint?                           | no   |            |
            | 2     | integer | Range | -2, 0                                                                         | yes  | 2          |
            | 2     | string  | Test  | Were bugs found in production (only ones introduced during the last release)? | no   |            |