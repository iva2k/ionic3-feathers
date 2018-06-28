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
 - Debugging in VSCode

There are two ways to get started:

1. get the code from Github
2. follow step-by-step instructions (and get the relevant code from the Github)

# Get Started - Get complete code

Get complete code from Github: [github.com/iva2k/ionic3-feathers](https://github.com/iva2k/ionic3-feathers)

# Get Started - Step-by-Step Instructions

Create app from scratch following these step by step. See source code edits as you go on Github: [github.com/iva2k/ionic3-feathers](https://github.com/iva2k/ionic3-feathers)

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

Create ```launch.json``` file for VSCode (use VSCode shortcuts in Debug ribbon):

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

Next, start debug with "Launch in Chrome" configuration.

For debugging on Android emulator, see [this link](http://www.damirscorner.com/blog/posts/20170113-DebugIonic2AppsInVsEmulatorForAndroid.html), it uses [Microsoft's Android Emulator](https://visualstudio.microsoft.com/vs/msft-android-emulator/).


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

With all the source code in place, but no server running, the app will fill few dummy items into the Todo list. This will be changed in the next section.

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

With all the added source code in place, the app will fetch some todo items from the server. These items are auto-generated, which will be changed in the next sections.

## Step 4. Create user registration and authentication

To be continued...


## Step 5. Create todo items from the app

To be continued...


# TODO:

 * Remove seeder in production
 * Implement Feathers authentication
 * Vulnerability - Apply security fix when available, track https://github.com/ionic-team/ionic-app-scripts/issues/1425 https://github.com/sass/node-sass/issues/2355
 * Unify eslint/tslint between Ionic and Feathers server parts.

##END