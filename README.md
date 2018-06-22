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

