## Template Renderer

Template renderer is utility to convert Angular.js template to React.js. it is useful when you migrate your application front end from Angular to react.
The goal of the project is to render Angular template in React.
<ul>
  <li>supposed you used Angular.js template in your application so we need to write that code in react manually and it is time consuming so that time template-renderer is useful to convert Angular.js template to React.js
  </li>

## Example
Write Angular template like

```html
<div ng-show="list.length >= 1">
    <h3 ng-if="isHeader">Users list</h3>
    <div ng-repeat="item in list track by id">
        <span><b>Name:</b> {{item.name}} {{item.lastName}}</span><br />
        <b>Company:</b> <span ng-bind="company"></span><br/>
        <b>Website:</b> <a ng-href="https://www.{{company}}.com/">XYZ</a><br/>
    </div><br />
    <button>Submit</button> <br /><br />
    <img ng-src="https://www.gravatar.com/avatar/{{image}}" />
</div>
```

Context like
<pre>
{
"list": [{"id": "1", "name": "John","lastName": "smith" }, {"id": "2", "name": "Jim","lastName": "Dowden" }],
"isHeader": true,
"company": "xyz",
"image": "205e460b479e2e5b48aec07710c08d50"
}
</pre>

## Live Demo
<a href="https://bodaryatushar.github.io/template-renderer/"> https://bodaryatushar.github.io/template-renderer/ </a>

## Prerequisite
<ul>
  <li>node >= 10.13.0</li>
  <li>yarn >= 1.12.0</li>
</ul>

### Quickstart

Run following commands from terminal:<br/>

<pre>
  $ yarn install
  $ yarn start
</pre>

### `yarn test`

Run following commands from terminal:<br/>

<pre>
  $ yarn test or
  $ yarn test --coverage
</pre>


