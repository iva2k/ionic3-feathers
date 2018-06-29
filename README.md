# ionic3-feathers app

Demo of Ionic 3 app with FeathersJS backend services. 

## Features

 - A simple list of todo items stored on a backend server
 - Uses Ionic 3 for the app that can be delivered on multiple platforms: 
   - Webserver 
   - iOS native app
   - Android native app
   - Windows/MacOS/Linux desktop app (with addition of Electron, not covered here)
 - Uses FeathersJS for a NodeJS backend server and a client in the app
 - Debugging in VSCode (both the app and server back-end)
 - Automated tests of the server code

There are two ways to get started:

1. get the code from Github
2. follow step-by-step instructions (and get the relevant code from the Github)

# Get Started - Get complete code

Get complete code from Github: [github.com/iva2k/ionic3-feathers](https://github.com/iva2k/ionic3-feathers)

# Get Started - Step-by-Step Instructions

Create an app from scratch following these steps. See source code edits as you go on Github: [github.com/iva2k/ionic3-feathers](https://github.com/iva2k/ionic3-feathers)

## Step 1. Blank Ionic 3 app
From https://ionicframework.com/getting-started

First, install [NodeJS](http://nodejs.org/). Then in a terminal / command line:

```bash
$ sudo npm install -g ionic
$ sudo npm install -g cordova
$ ionic start ionic3-feathers blank
$ cd ionic3-feathers
```

Fix an error when running without cordova, in src/app/app.component.ts add guard ```if (platform.is('cordova')) { ... }``` around statusBar.styleDefault() and splashScreen.hide().

### VSCode

To debug Ionic 3 app using **VSCode**, see [this link](http://www.damirscorner.com/blog/posts/20161122-DebuggingIonic2AppsInChromeFromVisualStudioCode.html). In summary, add to package.json:

```
"config" : {
  "ionic_source_map": "source-map"
},
```

Create ```launch.json``` file for VSCode project in the app directory (use VSCode shortcuts in Debug ribbon):

```
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch in Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:8100",
      "sourceMaps": true,
      "webRoot": "${workspaceRoot}/www"
    }
  ]
}
```

For debugging, first, run in the VSCode terminal:

```
ionic serve -b
```

Alternatively see Github for setup in tasks.json file that launches ionic app.

Next, start debug with "Launch in Chrome" configuration.

For debugging on Android emulator, see [this link](http://www.damirscorner.com/blog/posts/20170113-DebugIonic2AppsInVsEmulatorForAndroid.html), it uses [Microsoft's Android Emulator](https://visualstudio.microsoft.com/vs/msft-android-emulator/).

### Summary

We created minimum functionality Ionic 3 app.

## Step 2. Add Feathers Client to Ionic 3

Inspired by https://berndsgn.ch/posts/observables-with-angular-and-feathersjs/

```bash
$ npm install --save @feathersjs/client
$ npm install --save socket.io-client @types/socket.io-client
```

Note: What in Angular is called a "service", In Ionic is called a "provider", otherwise they are the same.

```bash
$ ionic generate provider Todo
```

Add files to folder ./src/providers/todo/ (see code on Github):

 * todo.component.html
 * todo.component.ts
 * todo.provider.ts
 * todo.ts 

Modify src/app/app.module.ts to load the provider and component (see code on Github).

Modify src/pages/home.html to use <app-todos/> component (see code on Github).

### Summary

With all the source code in place, but no server running, the app will fill a few dummy items into the Todo list. This will be changed in the next section.

## Step 3. Create Feathers server

From Feathers guide https://docs.feathersjs.com/guides/chat/readme.html

```bash
$ npm install @feathersjs/cli -g
$ mkdir api
$ cd api
$ feathers generate app
```

Answer some questions:

```
? Project name: api
? Description:  Feather server
? What folder should the source files live in? server
? Which package manager are you using (has to be installed globally)? npm
? What type of API are you making? REST, Realtime via Socket.io
```

To start server:

```bash
$ npm start
```

To run tests:

```bash
$ npm test
```

Now let's create a backend service using Feathers to respond to the client in the Ionic app. Call the command and answer some questions:

```bash
$ feathers generate service
  ? What kind of service is it? NeDB
  ? What is the name of the service? todos
  ? Which path should the service be registered on? /todos
  ? What is the database connection string? nedb://../data
```

(Skip authentication service in the guide for now)

Add hooks to check and fulfill the incoming data:

```bash
$ feathers generate hook
  ? What is the name of the hook? process-todo
  ? What kind of hook should it be? before
  ? What service(s) should this hook be for (select none to add it yourself)? todos
  ? What methods should the hook be for (select none to add it yourself)? create
```

Edit the generated files (see code on Github).

### VSCode

To debug Feathers server code using VSCode, one issue has to be solved - see [VSCode#43093](https://github.com/Microsoft/vscode/issues/43093).

In package.json, make a copy and change the start script (to allow VSCode launch.json configuration to insert debug parameter):

```
    "start:dev"        : "cross-env NODE_ENV=development node server/",
    "start:dev:vscode" : "cross-env NODE_ENV=development node",
```

Create ```launch.json``` file for VSCode project in the app's /api directory (use VSCode shortcuts in Debug ribbon):

```
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch via NPM",
            "type": "node",
            "request": "launch",
            "runtimeExecutable": "npm",
            "runtimeArgs": [
                "run",
                "start:dev:vscode",
                "--"
            ],
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen",
            "stopOnEntry": false,
            "sourceMaps": true,
            "args": [
                "server/"
            ]
        },

```

The final dash-dash "--" in ```runtimeArgs``` is important - it allows the command that VSCode composes to pass the debugger argument to node. Notice how the "server/" - location for the files to run in node - has moved from the package.json script to "args" part of launch.json configuration. It is appended after the VSCode debug command (which is "--inspect-brk=..."), making node honor it properly.

To debug mocha tests in VSCode, use the following configuration:

in package.json script:

```
    "test:debug": "npm run clean && cross-env NODE_ENV=test mocha test/ --recursive --exit",
```

in launch.json:

```
{
    "version": "0.2.0",
    "configurations": [
    ...
        {
            "name": "Test All",
            "type": "node",
            "request": "launch",
            "runtimeExecutable": "npm",
            "runtimeArgs": [
                "run",
                "test:debug",
                "--"
            ],
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen",
            "stopOnEntry": false,
            "sourceMaps": true,
            "timeout": 120000
        },
```

Mocha does not have the hiccup on the appended "--inspect-brk" parameter, so no "args" trick is needed.

### Fix tests

Implement some tests and improve how tests are performed.

Use in-memory DB:

```bash
$ npm install feathers-memory --save-dev
```

See its use in: https://docs.feathersjs.com/guides/chat/testing.html

Note: feathers-memory service uses 'id' field name by default, while database-backed services typically use '_id' field name. It creates bugs in tests with in-memory services. Good practice is to force all services to use the same id field, '_id' is preferred in this project.

More test goodies:

```bash
$ npm install shx cross-env --save-dev
```

Test Coverage:

```bash
$ npm install nyc --save-dev
```

Change scripts in package.json to:

- wipe out data
- measure code coverage with nyc

### Add data seeder for development

```bash
$ npm install --save feathers-seeder
```

See file api/server/index.js on Github for the seeder code.

### Summary

With all the added source code in place, the app will fetch some todo items from the server. These items are auto-generated by the seeder, which will be changed in the next sections.

## Step 4. Create user registration and authentication on the server side

From the Feathers guide https://docs.feathersjs.com/guides/chat/authentication.html

Now let's create a backend authentication service using Feathers to respond to the client in the Ionic app. Call the command and answer some questions:

```bash
$ feathers generate authentication
  ? What authentication providers do you want to use? Other PassportJS strategies not in this list can still be configured manually. Username + Password (Local), Google, Facebook
  ? What is the name of the user (entity) service? users
  ? What kind of service is it? NeDB
```

Start the server in one terminal:

```bash
$ npm run start:dev
```

In another terminal create the user:

```bash
$ curl "http://localhost:3030/users/" -H "Content-Type: application/json" --data-binary "{ \"email\": \"feathers@example.com\", \"password\": \"secret\" }"
```

Then get JWT token:

```bash
$ curl "http://localhost:3030/authentication/" -H "Content-Type: application/json" --data-binary "{ \"strategy\": \"local\", \"email\": \"feathers@example.com\", \"password\": \"secret\" }"
```

The server will respond with "accessToken". It is just a demo of how it works.

Now we need to secure existing services (e.g. 'todos'). In api/server/services/todos/todos.hooks.js add/change these lines:

```js
const { authenticate } = require('@feathersjs/authentication').hooks;

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
```

All source are provided on Github, see below summary of changes at the end of this section.
 
### Add a user avatar (using Gravatar)

From the Feathers guide https://docs.feathersjs.com/guides/chat/processing.html

```bash
$ feathers generate hook
  ? What is the name of the hook? gravatar
  ? What kind of hook should it be? before
  ? What service(s) should this hook be for (select none to add it yourself)? users
  ? What methods should the hook be for (select none to add it yourself)? create
```

Copy the code from Github to api/server/hooks/gravatar.js and api/test/hooks/gravatar.test.js


### Populate the Todo Creator

```bash
$ feathers generate hook
  ? What is the name of the hook? populate-user
  ? What kind of hook should it be? after
  ? What service(s) should this hook be for (select none to add it yourself)? todos
  ? What methods should the hook be for (select none to add it yourself)? all
```

Copy the code from Github to api/server/hooks/populate-user.js and api/test/services/populate-user.test.js


### Fix / Add More Tests

See the sources in Github. The changes add tests and improve generated code.

### Summary

There is a lot of small edits that the generator does:

 - api/config/default.json
 - api/package.json
 - api/server/app.js
 - api/server/services/index.js
 
Generator also creates new files:

 - api/server/authentication.js
 - api/server/models/users.model.js
 - api/server/services/users/users.hooks.js
 - api/server/services/users/users.service.js
 - api/tests/services/users.test.js

Also review these existing files and add user authentication code:

 - api/server/channels.js
 - api/server/index.js
 - api/server/hooks/process-todo.js
 - api/server/services/todos/todos.hooks.js
 - api/server/services/todos/todos.service.js
 - api/tests/hooks/process-todo.test.js
 - api/tests/services/todos.test.js
 
With all the added source code in place, the server will have authentication service, covered by automatic tests. Some users are auto-generated by the seeder. The services will be connected to the app in the next sections.
 
## Step 5. Create User Login in the app

To be continued...

## Step 6. Create todo items from the app

To be continued...

# CHECKLIST

For all additions:

 * [_] All services must be enforced to use '_id' (set in the options).
 * [_} All service tests should check that '_id' field is created, e.g. by assert() on created records.
 * [_] All hook tests should use service hooks file, not direct instantiation of a single hook (to verify subtle inter-dependencies).
 * [_] All hook tests should use app.hooks (to verify inter-dependencies, and increase coverage).
 * [_] All tests produced by ```feathers generate``` should be converted from '() => {...}' to 'function() {...}' in describe() and it() functions (Mocha requirement and feathers bug, causes done() race conditions).
 
# TODO:

 * Implement Feathers authentication in the app.
 * Vulnerability - Apply security fix when available, track https://github.com/ionic-team/ionic-app-scripts/issues/1425 https://github.com/sass/node-sass/issues/2355
 * Unify eslint/tslint between Ionic and Feathers server parts.
 * Tests for Ionic app.

##END