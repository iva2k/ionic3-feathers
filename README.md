# ionic3-feathers app
Demo of Ionic 3 app with FeathersJS backend services. Implements a simple list of todo items.

# Get complete code

Get complete app code on Github: [github.com/iva2k/ionic3-feathers](https://github.com/iva2k/ionic3-feathers)

# Step-by-Step Instructions

Create app from scratch following step-by-step. See source code edits as you go on Github: [github.com/iva2k/ionic3-feathers](https://github.com/iva2k/ionic3-feathers)

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

## Step 2. Add Feathers to Ionic 3
Inspired by https://berndsgn.ch/posts/observables-with-angular-and-feathersjs/

```bash
$ npm install --save @feathersjs/client
$ npm install --save socket.io-client @types/socket.io-client
```

```bash
$ ionic generate provider Todo
```

Add files to folder ./src/providers/todo/ (see code on Github):

 * todo.component.html
 * todo.component.ts
 * todo.service.ts
 * todo.ts 

Modify src/app/app.module.ts to load the provider and component (see code on Github).

Modify src/pages/home.html to use <app-todos/> component (see code on Github).

## Step 3. Create Feathers server
From https://docs.feathersjs.com/guides/chat/readme.html

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

Now let's create a service to respond to the client in the Ionic app, answer some questions:

```bash
$ feathers generate service
  ? What kind of service is it? NeDB
  ? What is the name of the service? todos
  ? Which path should the service be registered on? /todos
  ? What is the database connection string? nedb://../data
```

(Skip authentication service for now)

Add hooks to check and fulfill the incoming data:

```bash
$ feathers generate hook
  ? What is the name of the hook? process-todo
  ? What kind of hook should it be? before
  ? What service(s) should this hook be for (select none to add it yourself)? todos
  ? What methods should the hook be for (select none to add it yourself)? create
```

Edit the files (see code on Github).

### Fix tests

Implement some tests and improve how tests are performed.

Use in-memory DB:

```bash
$ npm install feathers-memory --save-dev
```

See its use in: https://docs.feathersjs.com/guides/chat/testing.html

More test goodies:

```bash
$ npm install shx cross-env --save-dev
$ npm install istanbul@1.1.0-alpha.1 --save-dev
```

- change scripts to wipe out data
- measure code coverage

### Add data seeder for development

```bash
$ npm install --save feathers-seeder
```

# TODO:
 * Cleanup Ionic provider vs. Angular service
 * Remove seeder in production, establish consistent Environment settings (dev/prod/staging)
 * Implement authentication
 * Apply security fix when available, track https://github.com/ionic-team/ionic-app-scripts/issues/1425 https://github.com/sass/node-sass/issues/2355
 
##END