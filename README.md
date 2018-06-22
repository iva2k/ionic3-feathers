# ionic3-feathers app
Demo of Ionic 3 with FeathersJS.
## Step 1. Blank Ionic 3 app
```bash
$ sudo npm install -g ionic
$ sudo npm install -g cordova
$ ionic start ionic3-feathers blank
```

Fix error when running without cordova, in src/app/app.component.ts add guard "if (platform.is('cordova')) { ... }" around statusBar and splashScreen.

## Step 2. Add Feathers to Ionic 3
https://berndsgn.ch/posts/observables-with-angular-and-feathersjs/

```bash
$ npm install --save @feathersjs/client
$ npm install --save socket.io-client @types/socket.io-client
```

```bash
$ ionic generate provider Todo
```
add files ./src/providers/todo/:  todo.component.html, todo.component.ts, todo.service.ts, todo.ts
modify src/app/app.modue.ts to load todo provider and component
modify src/pages/home.html to use <app-todos/> component

## Step 3. Create Feathers server
https://docs.feathersjs.com/guides/chat/readme.html

```bash
$ npm install @feathersjs/cli -g
$ mkdir api
$ cd api
$ feathers generate app
```

Answer some questions:
? Project name api
? Description
? What folder should the source files live in? server
? Which package manager are you using (has to be installed globally)? npm
? What type of API are you making? REST, Realtime via Socket.io

Start server:
```bash
$ npm start
```

Run tests:
```bash
$ npm test
```

Now let's create a service to respond to the client in the Ionic app:
```bash
$ feathers generate service
```
? What kind of service is it? NeDB
? What is the name of the service? todos
? Which path should the service be registered on? /todos
? What is the database connection string? nedb://../data

(Skip authentication for now)

```bash
$ feathers generate hook
```
? What is the name of the hook? process-todo
? What kind of hook should it be? before
? What service(s) should this hook be for (select none to add it yourself)?
 todos
? What methods should the hook be for (select none to add it yourself)? create

### Fix tests
Use in-memory DB:
```bash
$ npm install feathers-memory --save-dev
```
see use in: https://docs.feathersjs.com/guides/chat/testing.html

More test goodies
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


