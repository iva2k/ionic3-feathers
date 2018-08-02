import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';

import io from "socket.io-client";

//import feathers from "@feathersjs/rest-client";
//import feathers from "@feathersjs/primus-client";
//import socketio from "@feathersjs/socketio-client";
//?import feathersAuthClient from '@feathersjs/authentication-client';
import feathers from "@feathersjs/client";
import AuthManagement from 'feathers-authentication-management/lib/client';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';

import hello from 'hellojs';

import { User } from '../../models/user';

// Base type for all record data types, used by DataSubscriber.
export interface Record {
    _id: string;
}

export class DataSubscriber<T extends Record> {
  private dataStore:{
    records: T[];
  };
  private records$: Observable<T[]>;
  private observer: Observer<T[]>;
  private feathersService: any;
  private subscription: Subscription;
  //protected query: {};

  constructor(feathersService: any, cbData: (records: any) => void, cbErr: (err: any) => void) {
    this.feathersService = feathersService;
    this.feathersService.on('created', record => this.onCreated(record));
    this.feathersService.on('updated', record => this.onUpdated(record));
    this.feathersService.on('removed', record => this.onRemoved(record));

    this.records$ = new Observable(observer => (this.observer = observer));
    this.dataStore = { records: [] };
    this.subscription = this.records$.subscribe(cbData, cbErr);
  }

  public find(query) {
    //this.query = query;
    return this.feathersService.find({ query: query })
      .then((records: any) => { // records.data: T[]
        this.dataStore.records = records.data;
        this.observer.next(this.dataStore.records);
      })
      .catch((err) => {
        console.error('[FeathersService] Error in find: %o query: %o', err, query);
      });
  }

  public unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  private getIndex(id: string): number {
    let foundIndex = -1;

    for (let i = 0; i < this.dataStore.records.length; i++) {
      if (this.dataStore.records[i]._id === id) {
        foundIndex = i;
      }
    }

    return foundIndex;
  }

  private onCreated(record: T) {
    this.dataStore.records.push(record);
    this.observer.next(this.dataStore.records);
  }

  private onUpdated(record: T) {
    const index = this.getIndex(record._id);
    if (index >= 0) {
      this.dataStore.records[index] = record;
      this.observer.next(this.dataStore.records);
    }
  }

  private onRemoved(record: T) {
    const index = this.getIndex(record._id);
    if (index >= 0) {
      this.dataStore.records.splice(index, 1);
      this.observer.next(this.dataStore.records);
    }
  }

}

@Injectable()
export class FeathersProvider {

  apiUrl = 'http://localhost:3030'; //TODO: Implement correct API address for dev, production, testing.
//  apiUrl = 'https://jsonplaceholder.example.com';

  private _feathers = feathers();
  private _socket;
  private authManagement;

  private loginState: boolean; // undefined=initial, true=loggedin, false=loggedout
  private reauth; // Stored login credentials for reauth if session fails.
  private errorHandler = (error) => {
    if (this.reauth) {
      console.log('[FeathersService] authentication error, re-authenticating...');
      this._authenticate(this.reauth)
        // .then( (user) => {})
        ;
    } else {
      // this.reauth = null;
      // this._feathers.removeListener('reauthentication-error', this.errorHandler);
      console.log('[FeathersService] authentication error, but no credentials saved.');
    }
  };

  constructor(
    public events: Events
  ) {
    // Add socket.io plugin
    this._socket = io(this.apiUrl, {
      // transports: ['websocket'],
      // forceNew: true
    });
    //this._feathers.configure(feathersSocketIOClient(this._socket));
    this._feathers.configure(feathers.socketio(this._socket));

    // Add authentication plugin
    //?this._feathers.configure(feathersAuthClient({
    this._feathers.configure(feathers.authentication({
      storage: window.localStorage
    }));

    // Add feathers-reactive plugin
    //?this._feathers.configure(feathersRx({ idField: '_id' }));

    this.authManagement = new AuthManagement(this._feathers);

    this.initHello();

    this.loginState = false;
  }

  // Expose services
  public service(name: string) {
    return this._feathers.service(name);
  }

  // Expose authentication management - check if credentials.email is not registered
  public checkUnique(credentials): Promise<any> {
    return this.authManagement.checkUnique(credentials);
  }

  // Expose authentication management - request password reset for credentials.email
  public resetPasswordRequest(credentials): Promise<any> {
    let options = { preferredComm: 'email' }; // passed to options.notifier, e.g. {preferredComm: 'email'}
    return this.authManagement.sendResetPwd(credentials, options);
  }

  // Expose authentication management - reset password to credentials.password using resetToken, received following resetPasswordRequest()
  public resetPassword(resetToken, credentials): Promise<any> {
    return this.authManagement.resetPwdLong(resetToken, credentials.password);
  }

  // Expose authentication management - reset password to credentials.password using short resetToken, received following TODO: resetPasswordRequest()??
  public resetPasswordShort(resetToken, credentials): Promise<any> {
    return this.authManagement.resetPwdShort(resetToken, { email: credentials.email}, credentials.password);
  }

  // Internal authentication implementation. Does not track this.loginState, caller must do it.
  private _authenticate(credentials?): Promise<any|User> {
    this.reauth = null; // Remove stored credentials
    this._feathers.removeListener('reauthentication-error', this.errorHandler);
    if (credentials && credentials.email) {
      credentials.strategy = credentials.strategy || 'local';
    }
    let reauth;
    return this._feathers.authenticate(credentials)
      .then(response => {
        console.log('[FeathersService] _authenticate() - authenticate response: ', response);
        //TODO: (soon) can we use response.accessToken across server restarts? I assume it should, as its the purpose of JWT. How can we test that/verify?
        //TODO: (soon) What about accessToken limited lifetime? Does feathers client keep the tabs on storing login and renewing accessToken?? How can we test/verify that?
        //TODO: (soon) if we can't use this.reauth = response; then save user credentials with email/password. Implement encrypted persistent store.
        reauth = response; // save until JWT is verified.
        return this._feathers.passport.verifyJWT(response.accessToken);
      })
      .then(payload => {
        console.log('[FeathersService] _authenticate() - JWT payload: ', payload);
        if (reauth) {
          this.reauth = reauth;
          this._feathers.on('reauthentication-error', this.errorHandler);
        }
        return this._feathers.service('users').get(payload.userId);
      })
      .then(user => {
        this._feathers.set('user', user);
        console.log('[FeathersService] _authenticate() - User: ', this._feathers.get('user'));
        return Promise.resolve(user);
      })
    ;
  }

  // Expose authentication
  public authenticate(credentials?): Promise<any|User> {
    if (this.loginState) {
      return Promise.resolve(this._feathers.get('user'));
    }
    return this._authenticate(credentials)
      .then( (user) => {
        // if (!this.loginState) {
        this.events.publish('user:login', user);
        this.loginState = true;
        // }
        return Promise.resolve(user);
      });
  }

  // Expose registration
  public register(credentials): Promise<any|User> {
    if (this.loginState) {
      return Promise.reject(new Error('Already logged in'));
    }
    if (!credentials || !credentials.email || !credentials.password) {
      return Promise.reject(new Error('No credentials'));
    }
    this.reauth = null;
    this._feathers.removeListener('reauthentication-error', this.errorHandler);
    return this._feathers.service('users').create(credentials)
      .then(() => {
        return this._authenticate(credentials)
          .then((user) => {
            this.events.publish('user:login', user);
            this.loginState = true;
            return Promise.resolve(user);
          });
      })
    ;
  }

  // UNUSED
  // public hasValidIdToken(): Promise<any> {
  //   console.log('[FeathersService] hasValidIdToken(): checking saved auth token...');
  //   return this._authenticate()
  //     .then((user) => {
  //       console.log('[FeathersService] hasValidIdToken(): has valid saved auth token.');
  //       // this.events.publish('user:login', user); // caller is responsible to post proper events
  //       return true;
  //     })
  //     .catch((err) => {
  //       console.log('[FeathersService] hasValidIdToken(): no valid saved auth token.');
  //       return Promise.reject(err);
  //     })
  //   ;
  //   // Use as:
  //   // feathersProvider.hasValidIdToken().then(() => {
  //   //   // show application page
  //   //   ...
  //   // }).catch(() => {
  //   //   // show login page
  //   //   ...
  //   // })
  // }

  //TODO: (soon) Provide socialLogins from server (single point of authority), including client_id.
  private socialLogins = [
    {title: 'Google Hello', name: 'google'     , icon: 'logo-google'  , url: ''              , client_id: '411586170471-ijmn4j0hoaote48id4pami5tr3u24t8d.apps.googleusercontent.com' }, // Use local Hello.js method (client_id)
  ];
  public getSocialLogins(): any[] {
    return this.socialLogins;
  }

  // Hello.js Integration
  private initHello() {
    //let loc = window.location.href.split('#')[0];
    let socials = this.getSocialLogins();
    let client_ids = {};
    for (let social of socials) {
      if (social.client_id) {
        client_ids[social.name] = social.client_id;
      }
    }
    hello.init(client_ids, {
      //redirect_uri: loc, // 'http://localhost:8000', // TODO: (later) real URL for the client (or the server??), lightweight auth entry page
    });
    hello.on('auth.login', (auth) => { this.onHelloLogin.call(this, auth); } );
    hello.on('auth.logout', (data) => { this.onHelloLogout.call(this, data); } );
  }
  private onHelloLogin(auth) {
    console.log('[FeathersService] onHelloLogin() auth: ', auth);
    // get social token, user's social id and user's email
    const socialToken = auth.authResponse.access_token;
    //TODO: (later) For OAuth1 (twitter,dropbox,yahoo), it could be socialToken = auth.authResponse.oauth_token; let secret = auth.authResponse.oauth_token_secret;

    // To get some info (synchronous):
    // let session = hello(auth.network).getAuthResponse(); let { access_token, expires } = session;
    return hello(auth.network).api('me').then(userInfo => {
      console.log('[FeathersService] onHelloLogin() userInfo: ', userInfo);

      // Avoid repeating login
      if (this.loginState) {
        console.log('[FeathersService] onHelloLogin() already logged in, skipping re-authentication');
        return; //TODO: (now) what shall we return from onHelloLogin()? return Promise.resolve();
      }

      // Send the info to the backend for authentication
      const userId = userInfo.id;
      const userEmail = userInfo.email;
      return this._authenticate({
        strategy    : 'social_token',
        network     : auth.network,
        email       : userEmail,
        socialId    : userId,
        socialToken : socialToken
      }).then( (user) => {
        // This completes the login - server got validation and issued us JWT.
        console.log('[FeathersService] onHelloLogin() auth user=%o', user);
        if (!this.loginState) {
          this.events.publish('user:login', user);
          this.loginState = true;
        }
        this.loginHelloDispose( { name: auth.network } ).catch(() => {});
      }).catch(error => {
        console.log('[FeathersService] onHelloLogin() auth error=%o', error);
        this.events.publish('user:failed', error, /* activity: */ 'Signing in with ' + auth.network /*TODO: (later) find social(.name == auth.network), use social.title */, /* command: */ 'validate');
        this.loginState = false;
      });
    }, error => {
      console.log('[FeathersService] onHelloLogin() api error=%o', error);
      this.events.publish('user:failed', error, /* activity: */ 'Signing in with ' + auth.network /*TODO: (later) find social(.name == auth.network), use social.title */, /* command: */ 'authenticate');
      this.loginState = false;
  });
  }
  private onHelloLogout(data) {
    console.log('[FeathersService] onHelloLogout() data: ', data);
  }

  private loginHello(social, display: hello.HelloJSDisplayType = 'popup'): Promise<any> {
    return new Promise((resolve, reject) => {
      hello(social.name).login({
        scope: 'email',
        display: display, // 'popup' (default), 'page' or 'none' ('none' to refresh access_token in background, useful for reauth)
        // redirect_uri: 'http://localhost:8000', // Can customize app integration here. Hello.js adds its state to the query and will retrieve its data from query part from the redirect_uri upon reentry.
        //
        // Sends to oauth2 provider, e.g.:
        // https://accounts.google.com/o/oauth2/auth
        //  ?client_id=<YOUR_CLIENT_ID>
        //  &response_type=token
        //  &redirect_uri=http%3A%2F%2Flocalhost%3A8000%2F&amp;state=%7B%22client_id%22%3A%22<YOUR_CLIENT_ID>%22%2C%22network%22%3A%22google%22%2C%22display%22%3A%22popup%22%2C%22callback%22%3A%22_hellojs_2bgwc1py%22%2C%22state%22%3A%22%22%2C%22redirect_uri%22%3A%22http%3A%2F%2Flocalhost%3A8000%2F%22%2C%22scope%22%3A%22basic%2Cemail%22%7D
        //  &scope=https://www.googleapis.com/auth/plus.me%20profile%20email
    }).then(() => {
        console.log('[FeathersService] loginHello() callback');
        // We are not done yet, this.onHelloLogin() will be called from Hello.js upon receipt of server confirmation (possible app reload)
        // this.events.publish('user:login', user); // (if successful) will be called from this.onHelloLogin().
        resolve();
      }, (details) => {
        console.log('[FeathersService] loginHello() error, details: %o', details);
        this.events.publish('user:failed', details.error, 'Signing in with ' + social.title, 'authenticate');
        this.loginState = false;
        reject(details.error);
      });
    });
  }
  private loginHelloDispose(social): Promise<any> {
    // Remove session (but keep logged in with provider).
    return new Promise((resolve, reject) => {
      hello(social.name).logout().then(() => {
        console.log('[FeathersService] loginHelloDispose() callback');
        resolve();
      }, (details) => {
        console.log('[FeathersService] loginHelloDispose() error, details: %o', details);
        reject(details.error);
      });
    });
  }

  public loginWith(social): Promise<any> {
    console.log('[FeathersService] loginWith() social: %o', social);
    if (social.client_id) {
      return this.loginHello(social);
    }
    if (social.login) {
      return social.login.call(this, social);
    }
    if (social.url) {
      //TODO: (soon) return this.openWebpage(social.url);
    }
    return Promise.reject(new Error('Bad argument'));
  }

  // Guard method for views that must be logged in (e.g. user and data)
  public enforceValidIdToken(page: string, nav: any): Promise<any> {
    console.log('[FeathersService] enforceValidIdToken(%s): checking saved auth token...', page);
    return this._authenticate()
      .then((user) => {
        // Ok
        console.log('[FeathersService] enforceValidIdToken(%s): has valid saved auth token, ok.', page);
        return true;
      })
      .catch((err) => {
        // Force auth guard
        console.log('[FeathersService] enforceValidIdToken(%s): no valid saved auth token, calling guard:login.', page);
        this.events.publish('guard:login', page); // must login, then can go to page
        return Promise.reject(err);
      })
    ;
  }

  // Guard method for views that must be logged out (e.g. login/register)
  public enforceInvalidIdToken(page: string, nav: any): Promise<any> {
    console.log('[FeathersService] enforceInvalidIdToken(%s): checking saved auth token...', page);
    let guard = false; // Track if guard was triggered for last .catch
    return this._authenticate()
      .then((user) => {
        // Force login guard
        console.log('[FeathersService] enforceInvalidIdToken(%s): has valid saved auth token, calling guard:logout.', page);
        guard = true;
        this.events.publish('guard:logout', page); // must logout, then can go to page
        return Promise.reject(new Error('Already logged in'));
      })
      .catch((err) => {
        if (guard) {
          return err;
        }
        // Ok
        console.log('[FeathersService] enforceInvalidIdToken(%s): no valid saved auth token, ok.', page);
        return true;
      })
    ;
  }


  public getUserInfo() {
    return this._feathers.get('user');
  }

  // Internal logout worker
  private _logout(): Promise<any> {
    console.log('[FeathersService] _logout()');
    // this.reauth = null;
    // this._feathers.removeListener('reauthentication-error', this.errorHandler);
    return this._feathers.logout()
      .then((result) => {
        this.events.publish('user:logout');
        this.loginState = false;
        return result;
      })
      .catch((error) => {
        console.log('[FeathersService] _logout() error: %o', error);
        this.events.publish('user:logout'); // We even report loout to the app. most likely server did not respond, but we wiped out our tokens.
        this.loginState = false;
        //return error; // Nobody cares about logout error. Consider being logged out.
      });
  }

  // Expose logout
  public logout(): Promise<any> {
    console.log('[FeathersService] logout()');
    this.reauth = null;
    this._feathers.removeListener('reauthentication-error', this.errorHandler);
    return this._logout();
  }

  // Observable Service API
  // Usage:
  //  import { FeathersProvider, DataSubscriber } from "../../providers/feathers/feathers";
  //  ...
  //  class ... {
  //    private subscription: DataSubscriber;
  //    constructor(feathersProvider: FeathersProvider) {} ...
  //    ngOninit() {
  //      this.subscription = this.feathersProvider.subscribe<Todo>('todos', query,
  //        (records: Todo[]) => {
  //          this.records = records;
  //          this.ref.markForCheck();
  //        },
  //        err => {
  //          console.error('Error in subscribe to feathersProvider.subscribe(): ', err);
  //        });
  //    }
  //    ngOnDestroy() {
  //      if (this.subscription) this.subscription.unsubscribe();
  //    }
  //  }

  //?private subscribers[]: DataSubscriber<any>[];
  public subscribe<T extends Record>(service: string, query: any, cbData: (records: any) => void, cbErr: (err: any) => void): any {
    let subscriber = new DataSubscriber<T>(this.service(service), cbData, cbErr);
    subscriber.find(query)
      .catch(err => { cbErr(err); })
    ;
    //?this.subscribers.push(subscriber);
    return subscriber;
  }

  public create<T extends Record>(service: string, record: T): Promise<T> {
    record._id = null; // Create should not try to set _id.
    return this.service(service)
      .create(record)
    ;
  }

  public update<T extends Record>(service: string, record: T): Promise<T> {
    if (!record._id) return Promise.reject(new Error('_id must be set'));
    return this.service(service)
      .update(record._id, record)
    ;
  }

  public remove<T extends Record>(service: string, record: T): Promise<T> {
    if (!record._id) return Promise.reject(new Error('_id must be set'));
    return this.service(service)
      .remove(record._id)
    ;
  }

}
