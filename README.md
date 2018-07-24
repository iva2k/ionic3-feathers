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

Note: Make sure to setup private info (passwords, API keys, etc.) in file api/config/private.env before starting server ```npm start```.

```bash
$ sudo npm install -g ionic cordova
$ git clone https://github.com/iva2k/ionic3-feathers
$ cd ionic3-feathers
$ npm i
$ cd api
$ npm i
$ cp /config/private.env.template config/private.env
$ npm start
```

and in a separate terminal run:

```bash
$ ionic serve
```

# Get Started - Step-by-Step Instructions

Create an app from scratch following these steps. See source code edits (you can check out commit for the current step) as you go on Github: [github.com/iva2k/ionic3-feathers](https://github.com/iva2k/ionic3-feathers)

## Step 1. Blank Ionic 3 app

_From https://ionicframework.com/getting-started ._

First, install [NodeJS](http://nodejs.org/). Then in a terminal / command line:

```bash
$ sudo npm install -g ionic cordova
$ ionic start ionic3-feathers blank
$ cd ionic3-feathers
```

Fix an error when running without cordova, in src/app/app.component.ts add guard ```if (platform.is('cordova')) { ... }``` around statusBar.styleDefault() and splashScreen.hide().

### VSCode

To debug Ionic 3 app using **VSCode**, see [this link](http://www.damirscorner.com/blog/posts/20161122-DebuggingIonic2AppsInChromeFromVisualStudioCode.html). In summary, add to package.json:

```json
"config" : {
  "ionic_source_map": "source-map"
},
```

Create ```launch.json``` file for VSCode project in the app directory (use VSCode shortcuts in Debug ribbon):

```json
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

```bash
$ ionic serve -b
```

Alternatively see Github for setup in tasks.json file that launches ionic app.

Next, start debug with "Launch in Chrome" configuration.

For debugging on Android emulator, see [this link](http://www.damirscorner.com/blog/posts/20170113-DebugIonic2AppsInVsEmulatorForAndroid.html), it uses [Microsoft's Android Emulator](https://visualstudio.microsoft.com/vs/msft-android-emulator/).

### Summary

We created minimum functionality Ionic 3 app.

## Step 2. Add Feathers Client to Ionic 3

_Inspired by https://berndsgn.ch/posts/observables-with-angular-and-feathersjs/ ._

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

_From Feathers guide https://docs.feathersjs.com/guides/chat/readme.html ._

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

```json
    "start:dev"        : "cross-env NODE_ENV=development node server/",
    "start:dev:vscode" : "cross-env NODE_ENV=development node",
```

Create ```launch.json``` file for VSCode project in the app's /api directory (use VSCode shortcuts in Debug ribbon):

```json
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

```json
    "test:debug": "npm run clean && cross-env NODE_ENV=test mocha test/ --recursive --exit",
```

in launch.json:

```json
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

_From the Feathers guide https://docs.feathersjs.com/guides/chat/authentication.html ._

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

_From the Feathers guide https://docs.feathersjs.com/guides/chat/processing.html ._

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

```ts
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

(Check Github commits for changesets)

 1. [UX] Convert "Add" button on TodosListPage to material style FAB (floating action button)
 2. [UX] Add "Delete" button to TodosListPage items
 3. [UX] Implement Toast for completed actions/commands
 4. [UX] Move buttons on TodosListPage into slide drawers / swipe
 5. [UX] Show created  date/time on TasksListPage
 6. [UX] Show avatar on TasksListPage items, on TaskDetailPage (implemented in underlying components)
 7. [UX] Rearrange and align column widths in TodosListPage items (use ion-col)
 8. [UX] Rearrange and align elements on TodoDetailPage items
 9. [UX] Make Update button on TodoDetailsPage return to the list if entries are unchanged
 10. [UX] Close slide drawer upon transition to next view (so the drawer is closed upon returning)
 11. [Misc] Organize models (move from src/providers/todo/todo.ts to /src/models/), create src/models/user.ts
 12. [UX] Annotate input fields for keyboard domain (e.g. type="email", "password", "tel", "date", etc.)
 13. [UX] Focus on first form field upon entry (LoginPage, TodoDetailPage, added #entryFocus)
 14. [UX] Add icons to fields on LoginPage
 15. [UX] Add validators and polish to LoginPage, TodoDetailPage, also fixed form buttons not activated upon load.
 16. [UX] Form default button on TodoDetailPage
 17. [Server] Reorganize config files, use dotenv to load api/config/private.env (copy and customize private.env.template, do not store private.env in git!), see https://codingsans.com/blog/node-config-best-practices
 18. [Server] Add Gravatar configuration parameters

## Step 8. Authentication Management

_Based on https://blog.feathersjs.com/how-to-setup-email-verification-in-feathersjs-72ce9882e744 ._

Modern apps and services require management of user authentication. Some of the necessary features:

 - Confirm email
 - Reset forgotten password
 - Change account information
 - Two-factor authentication (2FA)

Just sending emails requires some of the biggest items for any app:

 - Email service
 - Email sender
 - Email formatter
 - Email templates system
 - Email styling
 - Dealing with security restrictions and serious HTML/CSS limitations of all email clients

We will use as much of existing solutions as possible, simplifying the massive job: 

 - SMTP service provider (relying on standard protocol to allow widest variety of email services, with Gmail as default)
 - Feathers-mailer (Nodemailer based) email sender with SMTP transport
 - Pug email template files with pug engine (former Jade)
 - Juice for converting CSS to inline (to support variety of email clients)
 - Optionally we could use something like ```npm install postcss-css-variables --save-dev``` and setting up build process to convert modern CSS to more compatible older versions

First we will setup a feathers service for SMTP email transport on the backend:

```bash
$ cd api/
$ npm install --save feathers-mailer nodemailer-smtp-transport
$ feathers generate service
  ? What kind of service is it? A custom service
  ? What is the name of the service? emails
  ? Which path should the service be registered on? /emails
  ? Does the service require authentication? No
```

Edit the generated files (see code on Github).

Get app password, e.g. for Gmail see https://myaccount.google.com/apppasswords

Enter Gmail login info into api/config/private.env file:

```bash
$ DEV_EMAIL_SERVICE="gmail"
$ DEV_EMAIL_LOGIN="<youraccount>@gmail.com"
$ DEV_EMAIL_PASSWORD="<yourapppassword>"
$ DEV_EMAIL_REPORTS="<youraccount>@gmail.com"
```

(Do the same for PROD_ and TEST_, note that it allows using different accounts while developing and testing)

When the server is started with NODE_ENV=development, server will send an email to DEV_EMAIL_REPORTS, helping to verify email transport.

Next, let's install and configure backend authentication management, and implement email templating solution:

```bash
$ cd api/
$ npm install --save feathers-authentication-management feathers-hooks-common
$ feathers generate service
  ? What kind of service is it? A custom service
  ? What is the name of the service? authManagement
  ? Which path should the service be registered on? /authManagement
     create server\services\auth-management\auth-management.service.js
      force server\services\index.js
     create server\services\auth-management\auth-management.class.js
     create server\services\auth-management\auth-management.hooks.js
     create test\services\auth-management.test.js
```

Note: path "/authManagement" is hardcoded in feathers-authentication-management client, so we can't use feathers's proposed "/auth-managaement" or any other path.

Modify auth-management code to load feathers-authentication-management (see full code on Github).

We will add pug email templates and a separate styling CSS file (to keep pug templates clean of styling) in api/server/email-templates/account/, 
and api/server/serviices/auth-management/notifier.js which ties email sending part to auth-management service.

Layout in emails by CSS is very bad, each client has unique limitations, so the main recommendation is to use HTML tables for layout and CSS only for spacing, colors and fonts. See https://www.campaignmonitor.com/dev-resources/guides/coding/

Also, modern CSS (e.g. with variables) won't work in most email clients. We could use CSS processing, but leave it out of this app for now.

```bash
$ cd api/
$ npm install --save pug juice
```

See added code on Github.


Finally, let's add client side features to use authentication management. 

In project top directory install feathers-authentication-management in order to use its lib/client for client side:

```bash
$ npm install --save feathers-authentication-management
```

First use of authentication management is to check if email is already registered.

Though it is possible to just try to create a new account every time a user clicks "Register", and rely on server returning an error, we will explicitly do a check just to demonstrate authentication management client. Also this feature will be useful on client-side in password recovery.

See code on Github for few edits to src/providers/feathers/feathers.ts and src/pages/login/login.ts.

Next we will implement a "reset password" button on the LoginPage in the app. 

The page will be modified to have tabs (using Ionic segments) for Sign Up / Sign In / Reset, and a bit of animation.

We can make some transition animations in pure CSS, and some (where elements are removed from DOM) in Angular.

Reset code will only send request for password reset email, but no hookup to actually reset the password yet (it will need a separate page and a new route).

We will also add code for displaying buttons for external login, but no implementation yet.

See the code on Github for few edits:

 - src/pages/login/login.* files (Sign Up / Sign In / Reset, Login with ...)
 - src/providers/feathers/feathers.ts (using feathers-authentication-management client)
 - app.module.ts (use Angular animations)
 - src/models/user.ts (couple fields added to the user model)


To complete the password reset, we need one last piece - a deep-linked page that 
will take the token from email URL and provide a form to enter a new password.

We will start with a separate page, so it can be deep-linked from email URL.

```bash
$ ionic generate page ResetPassword
```

The ResetPasswordPage is very similar to the LoginPage, though it does not 
need segments to select different modes and animations to transition between 
modes, and the fields are slightly different (no Email but Verification Code).

We will use @IonicPage 'segment' to deliver the token to the page in the app 
from URL link in an email. There is no other way to navigate to that page in 
the app, which may be needed to deal with situations when links are not 
working.

See code on Github for the edits of generated src/pages/reset-password/ files.

### Summary

With all the added source code in place, the app has all functions, including minimal account management.

Some thoughts on the features developed in this step:

 - ResetPasswordPage error handling could be smoother for UX, e.g. navigating to login/reset if verification code was rejected.
 - Though from technical implementation perspective it makes sense to have ResetPasswordPage separate from LoginPage, the workflow would be much smoother from UX perspective if it was done on a single page with segment selector. However, it will be much more convoluted design with need to hide segments depending on logged in state, and managing page layout.


## Step 9. Login with Social Accounts

Social logins are a must of modern apps. Let's implement "login with".


To be continued...



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
 * [ ] All UI input fields should be annotated for correct keyboard domain (e.g. type="email", "password", "tel", "date", etc.)
 
# RANDOM

## Use feathers-plus CLI

Instead of @feathersjs/cli, use @feathers-plus/cli. Adds GraphQL endpoint, TypeScript, roundtrip generator, JSON schema.

```bash
npm install -g @feathers-plus/cli
mkdir feathers-app
cd feathers-app
feathers-plus generate options
# choose all defaults, except "Generate TypeScript code?" Yes

feathers-plus generate app
# choose all defaults, except enter 'server' folder for source files

```

Then:

```
npm start
# Runs ok

npm test
# Executes tests, all pass

feathers-plus generate authentication
# choose all defaults, may adjust authentication providers: Username+Password(Local), Google, Facebook (and Github if so desired)
```

Edit src/services/users/users.schema.?s file, add fields to ```required:``` and ```properties:```

```js
// Define the model using JSON-schema
let schema = {
  // !<DEFAULT> code: schema_header
  title: 'Users',
  description: 'Users database.',
  // !end
  // !code: schema_definitions // !end

  // Required fields.
  required: [
    // !code: schema_required
    'email',
    //'firstName',
    //'lastName',
    //'roleId'
    // !end
  ],
  // Fields with unique values.
  uniqueItemProperties: [
    // !code: schema_unique
    '_id'
    // !end
  ],

  // Fields in the model.
  properties: {
    // !code: schema_properties
    _id: { type: 'ID' },
    email: {},
    //firstName: {},
    //lastName: {},
    password: {},
    //roleId: { type: 'ID' }
    // !end
  },
  // !code: schema_more // !end
};
```

Run re-generator:

```bash
feathers-plus generate service 
# Then type in the name of the service "users".
# or:
feathers-plus generate all 
# Answer 'Yes' to "Regenerate the entire application?" question.
```

Any time it is possible to regenerate secret for the authentication:
```
feathers-plus generate secret
```
(Need to copy-paste it into config/default.json by hand). Also makes sense to remove it from config/default.json and place into .env (not tracked in git) using ```npm i --save nodenv```


See:

 * https://github.com/feathers-plus/cli
 * https://generator.feathers-plus.com/


## GraphQL

GraphQL counterpoints: https://apihandyman.io/and-graphql-for-all-a-few-things-to-think-about-before-blindly-dumping-rest-for-graphql/

 - cannot join queries like join tables in SQL
 - cannot select sub-properties or flatten objects
 - cannot predict names for mutations - have to dig in the documentation to find out, possible different naming conventions
 - handling errors - no systematic way / no standard
 - how to cache data?
 - GraphQL does not ease API provider job 
 - GraphQL may have unexpected side effects on data volumes and server usage
 
## Consider Swagger

Swagger is RESTful API description format and set of tools.

Alternatives: OpenAPI/Swagger, Blueprint or RAML specification

See:

 * https://github.com/feathersjs-ecosystem/feathers-swagger
 * https://www.npmjs.com/package/feathers-swagger
 * https://github.com/yarax/swagger-to-graphql
 
It is possible to have RESTful API, Swagger and add GraphQL endpoint later.


## Need a single schema definition [Holy Grail]

Need a single schema definition that would be auto-translated into:

 - Swagger (API docs)
 - GraphQL (single endpoint API)
 - Feathers services
 - Feathers hooks - server
 - Feathers client (client validation)
 - ajv (JSON Schema validator)

Looks like most promising path should end in JSON Schema (can use ajv, and there are packages like e.g. feathers-nedb-ajv)


Contenders:

- OpenAPI (Swagger)
- Joi (from HapiJS)
- typeorm
- RESTyped https://github.com/rawrmaan/restyped
- loopback.io


## Classical signup / registration process with email confirmation

Steps needed in a classical signup / registration process with email verification:

1. Create an account with an email and password
2. Open Email client (browser or app)
3. Locate confirmation email (sometimes wait for its arrival for few minutes, go and do something else, return to step #2 later)
4. Read the Thank you message: "Please confirm your account", locate where to click
5. Click the "Confirm your email"
6. Get redirected, read the Thank you message: "Please sign in"
7. Sign in with email and password

You still there? Now you can actually start using the app...

Summary of annoying inefficiencies:

 - Enter email and password up to 3 times
 - Open the app at least twice
 - Open an email client and search for email at least once
 - If email is delayed, spin through the step or hang waiting

All that adds to a lot of bad UX, and deters users from using the app.

## Signup / registration process without email confirmation

1. Create an account with email and password
2. ... there's no step 2!

... just start using the app.

But truthfully, email confirmation is just delayed until it is really needed, and user has reasons to confirm the email (e.g. access limited features), so reason is understood.

See https://visible.vc/engineering/signup-flow-without-email-confirmation/

In addition to the linked article, the process can be streamlined without email confirmation, with added lazy confirmation (email is sent anyway, more like a "welcome email" with link to confirm for using advanced / limited features), and forced confirmation when user tries to use limited features.

# TODO:

 * Post host IP address from server to app - help Ionic DevApp, as well as server deployment.
 * forgot password
 * Goolge/FB login?
 
 * Revisit: save login persistently (app, browser, desktop)
 * Detect and reconnect Feathers client if connection fails, keep retrying.
 * If persistent login is saved but rejected, show appropriate message (e.g. re-login)
 * Login should survive server restart. Save JWT to DB? Reissue JWT?
 * Figure out disappearing menu when navigating to .../#/menu/home (not anymore? after changing to setRoot instead of reassigning rootPage)
 * Add :id URL/route for detail page; Add add URL/route for detail page; Redirect to master page when linking to detail page without :id/add URL. WHen no router stack in detail page, use setRoot();
 * [UX] Undo (e.g. Toast: task removed -> undo button). May need to allow "create" with same ID. Or undo on DB backend?
 * Vulnerability - Apply security fix when available, track https://github.com/ionic-team/ionic-app-scripts/issues/1425 and https://github.com/sass/node-sass/issues/2355
 * Unify eslint/tslint between Ionic and Feathers server parts.
 * Tests for Ionic app.
 * Reorganize folders and scripts so that Ionic app (cordova browser) is built into Feathers api/public folder.
 * Phone logins, SMS verification. See https://medium.com/@hcbh96/the-how-and-why-of-2fa-using-twilio-and-feathers-js-simple-2fa-tutorial-e64a930a57a8

##END