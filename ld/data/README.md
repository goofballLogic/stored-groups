# tenant

A tenant is represented by a folder and an index.jsonld file containing a graph of teams. Team data represented at this level is restricted to name, @id and distinguishing @type (ots:Team). This representation can be obtained at the root of the tenant's namespace in order to obtain a list of teams to select, and then follow by dereferencing the @id so that one can obtain full details of the team.

# ots:Team

A team is represented by the following attributes:

### ots:name

The distinguishing name of the document (e.g. the name of a team). Can be used for display purposes.

e.g. "The eggheads"

### ots:scoresheet

Link to an ots:Scoresheet selected for the current object (e.g. for ots:Team this is the current scoresheet being used by the team).

### ots:members
 - @type: @id

Link to a collection of team members. This can be dereferenced to return the list of team members.

### ots:scoresheets
 - @type: @id

A collection of ots:Scoresheet created by the current team. One of these will be the currently selected scoresheet, as indicated by the ots:scoresheet property.

### ots:scores
 - @type: @id

A collection of ots:Score recorded by the team against a scoresheet and goal

### ots:goals
 - @type: @id

A collection of ots:Goal that serves as a menu from which the team can select goals for the current period (iteration).


### ots:periods
 - @type: @id

A collection of ots:Period representing periods of work against which scores are registered (e.g. iterations).

# ots:Goal

A goal against which a team might create and/or nominate as a goal for a particular scoresheet. For example, the team might choose to create a goal "Don't break the build" which is then allocated to the team's current scoresheet. At the end of the period, the team can allocate scores against their chosen goals.

### ots:name

In this instance, it is the title/name of the goal e.g. "Don't break the build"

# ots:Member

A team member (person / artificial general intelligence) to whom scores can be attributed e.g. "Andrew"

### ots:name

In this instance, it is the name (or alias) of the team member e.g. "Andrew"

# ots:Period

A period of work against which performance will be measured. For example, if using a Scrum process, the period might be referred to as "Sprint 2".

### ots:name

In this case, it is the name/title of the period. For example "Sprint 2", "Release 100", "March 2018"

# ots:Score

A score allocated against a specific goal on a scoresheet, for a specified person, for a particular period. The score records an amount of points allocated (e.g. 3, -1) depending upon favourable/unfavourable outcome of the chosen goals. There is also an optional description where a narrative explaining the score can be recorded. There is also a timestamp recording when the score was created.

### ots:created
 - @type: xsd:datetime

The date when the resource was created. In this instance it explains when the score was recorded.

e.g. "2019-03-01T00:00:00Z",

### ots:member
 - @type: @id

The ots:Member associated with this resource. In this instance, it is the team member for which the score was recorded.

### ots:scoresheet
 - @type: @id

The ots:Scoresheet associated with this resource. In this instance, it is the scoresheet in use at the time this score was recorded.

### ots:goal
 - @type: @id

The ots:Goal associated with this resource. In this instance, it is the goal which was being measured to produce this score.

### ots:amount
 - @type: xsd:integer

For example 2 or -3

### ots:description
 - @type: xsd:string

A description of the current resource. In this instance it is a general narrative explaining the existance of the score. For example, it might say "Andrew broke the build 3 times on one day. Boo."

### ots:period
 - @type: @id

The ots:Period associated with this resource. In this instance it is the period for which this score was measured. For example it could indicate the Sprint for which a team is doing Retrospective analysis.
