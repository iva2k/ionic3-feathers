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
 - Uses slick DataSubscriber wrapper on top of Feathers that streamlines views and components code
 - Debugging in VSCode (both the app and server back-end)
 - Automated tests of the server code

There are two ways to get started (Assuming node/npm and git is already installed, if not, google it):

1. Get the complete code from Github
2. Follow step-by-step instructions (and get the relevant code from the Github)

# Get Started - Get complete code

Get complete code from Github: [github.com/iva2k/ionic3-feathers](https://github.com/iva2k/ionic3-feathers)

```bash
$ sudo npm install -g ionic cordova
$ git clone https://github.com/iva2k/ionic3-feathers
$ cd ionic3-feathers
$ npm i
$ cd api
$ npm i
$ npm start
```

and in a separate terminal run:

```bash
$ ionic serve
```

# Get Started - Step-by-Step Instructions

Create an app from scratch following these steps. See source code edits as you go on Github: [github.com/iva2k/ionic3-feathers](https://github.com/iva2k/ionic3-feathers)

## Step 1. Blank Ionic 3 app

_From https://ionicframework.com/getting-started_

First, install [NodeJS](http://nodejs.org/). Then in a terminal / command line:

```bash
$ sudo npm install -g ionic cordova
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

_Inspired by https://berndsgn.ch/posts/observables-with-angular-and-feathersjs/_

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

With all the source code in place, but no server running, the app fills a few dummy items into the Todo list. This will be changed in the next section.

## Step 3. Create Feathers server

_From Feathers guide https://docs.feathersjs.com/guides/chat/readme.html_

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

To debug Feathers server code using VSCode, one issue has to be resolved - see [VSCode#43093](https://github.com/Microsoft/vscode/issues/43093).

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

Let's implement some additional tests and improve how tests are performed. 

The referenced guide provides unit tests, expanding the tests created by the generator. 

Though they are good to test individual isolated hooks, the effort is almost wasted, as there are hook inter-dependencies and hook insertion that is not tested.

We could create system/integration tests for the same hooks, keeping the unit tests as proposed, or we could pull in most of the system into the unit tests, drastically increasing code coverage and making more robust regression tests. 

Making system/integration hook tests is chosen here as most practical and high ROI change. Also we fix some issues between feathers generate and Mocha.

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

With all the added source code in place, the app fetches some todo items from the server. These items are auto-generated by the seeder, which will be changed in the next sections.

## Step 4. Create user registration and authentication on the server side

_From the Feathers guide https://docs.feathersjs.com/guides/chat/authentication.html_

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

_From the Feathers guide https://docs.feathersjs.com/guides/chat/processing.html_

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

See the sources on Github. The changes add tests and improve generated code.

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
 
With all the added source code in place, the server now has authentication service, covered by automatic tests. Some users are auto-generated by the seeder. The app is refused connection due to lack of authentication. The services will be connected to the app in the next sections.
 
## Step 5. Create User Login in the app

First we will modify Home page and Todo component to lazy-loading modules, showing how all pages and components will be done for faster app responsiveness:

  - Add file src/pages/home/home.module.ts
  - Add ```@IonicPage()``` and related import from ionic-angular to src/pages/home/home.ts
  - Change usages of HomePage component to string 'HomePage' and remove all imports of HomePage.
  
Do the same for Todo component, import it in home.module.ts and list in its "imports" section.

Next we will create a side menu, similar to "super" and "sidemenu" ionic templates. We will implement it in a separate menu page, and wire it for both navigation and actions using a data table.

```bash
$ ionic generate page menu
```

See code on Github for the edits of generated src/pages/menu/ files and changes to existing files:

 - src/app/app.component.ts (change rootPage to the new 'MenuPage')
 - src/app/app.module.ts (add menuType)
 - src/pages/*/*.html (add menu button to all HTML pages)

Next we will refactor todos provider - move Feathers client into a new provider, so a single service / API connection is used by all various services we will need from Feathers backend.

```bash
$ ionic generate provider Feathers
```

See code on Github for the edits of generated src/providers/feathers/feathers.ts file and changes to existing files:

 - src/app/app.module.ts (added provider by ionic generate)
 - src/providers/todo/todo.provider.ts (refactored to use Feathersprovider)

Finally, we will create login/registration page and use Feathers client authentication. 
We will also add some guards to redirect pages that require auth to login page.

Note that Ionic 3 NavController has very limited guarding functionality, see discussion in [ionic#11459](https://github.com/ionic-team/ionic/issues/11459).
Using ionViewCanEnter() in Ionic 3 is very unreliable, and does not support redirects. Ionic 4 will be using Angular router with robust guard system, but it is not yet released.
To solve this issue we use postponed redirects with setTimeout() in guard functions and move guard logic into FeathersProvider to have streamlined guards code.

```bash
$ ionic generate page login
```

See code on Github for the edits of generated src/pages/login/ files and changes to existing files:

 - config.xml (added <preference name="KeyboardDisplayRequiresUserAction" value="false" /> to allow keyboard)
 - package.json and package-lock.json (cordova plugins)
 - src/app/app.component.ts (guard redirect calback functions)
 - src/app/app.html (added #navCtrl for app.component.ts NavController)
 - src/pages/home/home.ts (added ionViewCanEnter() with auth guard)
 - src/pages/menu/menu.ts (logout implementation)
 - src/providers/feathers/feathers.ts (login and registration functionality)

### Summary

With all the added source code in place, the app is using the backend authentication service - login and registration functions. The app will show all todos by all users. The todos create and edit functions will be added to the app in the next sections.

## Step 6. Create todo items from the app and update todos list dynamically

First we will refactor a bit:

 1. Rename 'HomePage' to 'TodosListPage' class and file names and all related strings in the code.
 2. Rename src/providers/todo/todo.component files and move to components/todos-list/todos-list.

Next we will implement new features to view, edit and add todo items:

```bash
$ npm install --save clone-deep deep-object-diff
$ ionic generate component TodoItem
$ ionic generate page TodoDetail
```

See code on Github for the edits of generated src/components/todo-item and src/pages/todo-detail/ files and changes to existing files:

 - src/components/todos-list/todos-list.html, src/components/todos-list/todos-list.ts ("Edit" button)
 - src/pages/todos-list/todos-list.html, src/pages/todos-list/todos-list.ts ("Add" button and "Edit" button click)
 - src/providers/feathers/feathers.ts (Implemented DataSubscriber)

### DataSubscriber

DataSubscriber is added to FeathersProvider - it is a very powerful wrapper on top of Feathers client. It makes a breeze to use Feathers in list and detail components and views.

To showcase DataSubscriber, we will refactor TodosListComponent to use DataSubscriber instead of TodoProvider. It will illustrate how much simpler the code becomes, mostly due to no need to generate more custom providers like TodoProvider for each service, instead using in essence a provider factory. See the below code snippet and full code of DataSubscriber in src/providers/feathers/feathers.ts on Github.

First, we will remove TodoProvider, and avoid all further individual providers that we might need if we continue using the pattern like TodoProvider.

Next we will modify TodosListComponent code to look like this:

```
  ...
  public ngOnInit(): void {
    this.subscription = this.feathersProvider.subscribe<Todo>('todos', {
        $sort: {createdAt: -1},
        $limit: 25
      },
      (todos: Todo[]) => { // cbData
        this.todos = todos;
        this.ref.markForCheck();
      },
      err => { // cbErr
        console.error('Error in FeathersProvider.subscribe(): ', err);
      });
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
```

FeathersProvider.subscribe() takes:

 * data model type, e.g. \<Todo>,
 * the name of the service (e.g. 'todos'), and 
 * a query object (anything that Feathers accepts),
  
and it creates:

 * a provider on the fly,
 * subscribes to its observable, and 
 * connects it to our callbacks (cbData and cbErr),
 
All that is done in few lines of code in ```ngOnInit()```.

And ```ngOnDestroy()``` makes sure that subscription is properly removed.

List views and detail views can both use this simple pattern. Though we still
have individual components for todos-list and todo-detail, it is possible to
create two universal components (list and detail) based on this pattern, and
customize them for any data table / service through their parameters. This is left as an exercise to keep this project small.

### Performance

We should be always mindful about the app performance. We already use IOnic's lazy loading, so only smaller chunks of the app are downloaded from the server as needed.

We also utilized "ChangeDetectionStrategy.OnPush" with explicit calls to ChangeDetectorRef.markForCheck() in the components, so we instruct Angular engine that it does not need to scan for changes upon every network activity, but instead each component issues data update calls only when necessary.

These performance improvements are cumulative and will be more noticeable as the app grows in size.

### Wrapping up

We only wired few command buttons so far, but did not complete the worker code. We will wrap up few things, like saving updated and created todo items, and deleting them. See the code on Github for final changes.


### Summary

With all the added source code in place, the app has all functions to create, edit and delete todo items, once the user registers or logs in.

## Step 7. Improvements

We can make a lot of small and big improvements. Not in any particular order...

 a. [UX] Convert "Add" button on TodosListPage to material style FAB (floating action button)
 b. [UX] Add "Delete" button to TodosListPage items
 c. [UX] Implement Toast for completed actions/commands
 d. [UX] Move buttons on TodosListPage into slide drawers / swipe
 e. [UX] Show created  date/time on TasksListPage
 f. [UX] Show avatar on TasksListPage items, on TaskDetailPage (implemented in underlying components)
 g. [UX] Rearrange and align column widths in TodosListPage items (use ion-col)
 h. [UX] Rearrange and align elements on TodoDetailPage items
 i. [UX] Make Update button on TodoDetailsPage return to the list if entries are unchanged
 j. [UX] Close slide drawer upon transition to next view (so the drawer is closed upon returning)
 
 
# CHECKLIST

This checklist was created while working on this app code as a guidance for continuing development of the app.

For all additions:

 * [ ] All services must be enforced to use '_id' (set in the options).
 * [ ] All service tests should check that '_id' field is created, e.g. by assert() on created records.
 * [ ] All hook tests should use service hooks file, not direct instantiation of a single hook (to verify subtle inter-dependencies).
 * [ ] All hook tests should use app.hooks (to verify inter-dependencies, and increase coverage).
 * [ ] All tests produced by ```feathers generate``` should be converted from '() => {...}' to 'function() {...}' in describe() and it() functions (Mocha requirement and feathers bug, causes done() race conditions).
 * [ ] All new pages should be converted to lazy-loading modules (add file src/pages/XX/XX.module.ts, add ```import {IonicPage} from 'ionic-angular';``` and decorator ```@IonicPage()``` before @Component in src/pages/XX/XX.ts file, and change all usages of component XX to string 'XX', remove all imports of XX component).
 * [ ] All new components should be converted to lazy-loading modules (add file .../XX.module.ts, add import of XXComponentModule to each page module that uses it and remove all imports of XX component).
 * [ ] All new components should use ChangeDetectionStrategy.OnPush and invoke ChangeDetectorRef.markForCheck() on mutated data.
 
# TODO:

 * Organize models (move from src/providers/todo/todo.ts to /src/models/)
 * forgot password
 * Goolge/FB login?
 * [UX] Annotate input fields for keyboard domain (e.g. email, password, title->capitalize words, etc.)
 * [UX] Forms should have default button (Enter on keyboard, done on mobile pop up keyboard)
 * [UX] TodoDetailsPage form buttons are not activated upon load.
 
 * Revisit: save login persistently (app, browser, desktop)
 * Detect and reconnect Feathers client if connection fails, keep retrying.
 * If persistent login is saved but rejected, show appropriate message (e.g. re-login)
 * Figure out disappearing menu when navigating to .../#/menu/home (not anymore? after changing to setRoot instead of reassigning rootPage)
 * Add :id URL/route for detail page; Add add URL/route for detail page; Redirect to master page when linking to detail page without :id/add URL. WHen no router stack in detail page, use setRoot();
 * [UX] Undo (e.g. Toast: task removed -> undo button). May need to allow "create" with same ID. Or undo on DB backend?
 * Vulnerability - Apply security fix when available, track https://github.com/ionic-team/ionic-app-scripts/issues/1425 and https://github.com/sass/node-sass/issues/2355
 * Unify eslint/tslint between Ionic and Feathers server parts.
 * Tests for Ionic app.
 * Reorganize folders and scripts so that Ionic app (cordova browser) is built into Feathers api/public folder.

##END