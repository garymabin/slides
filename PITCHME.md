## Tech Overview
---
### Base Framework
- *React.js*.
- *ES6+* with *Babel*. 
- *react-router* for routing.
- *JQuery.ajax* as http client.
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
- *Mocha*/*Chai*/*Enzyme* for **React unit testing**.
- *Backstop.js*/*Storybook.js* for **UI testing**.
- *Nightwatch.js* for **e2e testing**.
+++
#### Code Check
- *eslint* for Javascript check.
- *sass-lint* for CSS check.
- *Flow* for static type checking.
- *Sonarqube* for static code scan and code quality trends tracking.
- *veracode* for security code scan.
---
### Development Patterns
- Testing pattern.
- Form pattern.
- HoC pattern.
- Interceptors pattern.
---
### Build & Infrastructure
- *Webpack.js* for building.
- *dyson* as json based mock server.
- *jenkins* with pipeline plugin.
- *Pipeline as code*.
