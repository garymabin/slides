## Tech Overview
---
### Base Framework
@ul
- *React.js*.
- *ES6+* with *Babel*. 
- *react-router* for routing.
- *JQuery.ajax* as http client.
@ulend
---
### Data Framework
@snap[mid-point]
<a class="nav-home" >
    <img class="nav-logo" src="https://facebook.github.io/flux/img/flux_logo.svg" width="50" height="50">Flux</a>
@snapend
- ~~Reflux~~.
- *Redux*.
---
### Work Flow
+++
#### Testing
@ul
- *Mocha*/*Chai*/*Enzyme* for **React unit testing**.
- *Backstop.js*/*Storybook.js* for **UI testing**.
- *Nightwatch.js* for **e2e testing**.
@ulend
+++
#### Code Check
@ul
- *eslint* for JavaScript check.
- *sass-lint* for CSS check.
- *Flow* for static type checking.
- *Sonarqube* for static code scan and code quality trends tracking.
- *veracode* for security code scan.
@ulend
+++
#### Sonarqube Results
![](assets/SonarQube.png)
---
### Development Patterns
@ul
- Testing pattern.
- Form pattern.
- HoC pattern.
- Interceptors pattern.
@ulend
---
### Build & Infrastructure
@ul
- *Webpack.js* for building.
- *dyson* as json based mock server.
- *jenkins* with pipeline plugin.
- *Pipeline as code*.
@ulend
