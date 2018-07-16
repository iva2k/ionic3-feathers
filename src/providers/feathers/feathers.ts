import { Injectable } from '@angular/core';

//?import * as feathersRx from 'feathers-reactive';
import io from "socket.io-client";

//import feathers from "@feathersjs/rest-client";
//import feathers from "@feathersjs/primus-client";
//import socketio from "@feathersjs/socketio-client";
//?import feathersAuthClient from '@feathersjs/authentication-client';
import feathers from "@feathersjs/client";
import AuthManagement from 'feathers-authentication-management/lib/client';

import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { Subscription } from "rxjs/Subscription";

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
      .then( (records: any) => { // records.data: T[]
        this.dataStore.records = records.data;
        this.observer.next(this.dataStore.records);
      })
      .catch( (err) => {
        console.error('Error in FeathersService find: %o query: %o', err, query);
      })
    ;
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

  apiUrl = 'http://localhost:3030';
//  apiUrl = 'https://jsonplaceholder.example.com';

  private _feathers = feathers();
  private _socket;
  private authManagement;

  private reauth; // Stored login credentials for reauth if session fails.
  private errorHandler = (error) => {
    if (this.reauth) {
      console.log('Feathers reauthentication-error, re-authenticating...');
      this.authenticate(this.reauth);
    //} else {
    //  this.reauth = null;
    //  this._feathers.removeListener('reauthentication-error', this.errorHandler);
    //  console.log('DEBUG: Feathers reauthentication-error, but no credentials saved.');
    }
  };

  constructor() {
    // Add socket.io plugin
    this._socket = io(this.apiUrl, {
//      transports: ['websocket'],
//      forceNew: true
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
  }

  // Registered callbacks for page entry auth guard and not logged in guard
  private guardCallback: ((nav:any) => void)[];
  public setGuardCallback(cbMustLogin: (nav:any) => void, cbHasUser: (nav:any) => void) {
    this.guardCallback = [cbMustLogin, cbHasUser];
  }

  // Expose services
  public service(name: string) {
    return this._feathers.service(name);
  }

  // Expose authentication management
  public checkUnique(credentials): Promise<any> {
    return this.authManagement.checkUnique(credentials);
  }

  // Expose authentication
  public authenticate(credentials?): Promise<any> {
    this.reauth = null; // Remove stored credentials
    this._feathers.removeListener('reauthentication-error', this.errorHandler);
    if (credentials && credentials.email) {
      credentials.strategy = credentials.strategy || 'local';
    }
    let reauth;
    return this._feathers.authenticate(credentials)
      .then(response => {
        console.log('Authenticated: ', response);
        //TODO: can we use response.accessToken across server restarts? I assume it should, as its the purpose of JWT. How can we test that/verify?
        //TODO: What about accessToken limited lifetime? Does feathers client keep the tabs on storing login and renewing accessToken?? How can we test/verify that?
        //TODO: if we can't use this.reauth = response; then save user credentials with email/password. Implement encrypted persistent store.
        reauth = response; // save until JWT is verified.
        return this._feathers.passport.verifyJWT(response.accessToken);
      })
      .then(payload => {
        console.log('JWT Payload: ', payload);
        if (reauth) {
          this.reauth = reauth;
          this._feathers.on('reauthentication-error', this.errorHandler);
        }
        return this._feathers.service('users').get(payload.userId);
      })
      .then(user => {
        this._feathers.set('user', user);
        console.log('User: ', this._feathers.get('user'));
      })
    ;
  }

  // Expose registration
  public register(credentials): Promise<any> {
    if (!credentials || !credentials.email || !credentials.password) {
      return Promise.reject(new Error('No credentials'));
    }
    this.reauth = null;
    this._feathers.removeListener('reauthentication-error', this.errorHandler);
    return this._feathers.service('users').create(credentials)
      .then(() => this.authenticate(credentials))
    ;
  }

  public hasValidIdToken(): Promise<any> {
    console.log('hasValidIdToken(): checking saved auth token...');
    return this.authenticate()
      .then(() => {
        console.log('hasValidIdToken(): has valid saved auth token.');
        return true;
      })
      .catch((err) => {
        console.log('hasValidIdToken(): no valid saved auth token.');
        return Promise.reject(err);
      })
    ;
    // Use as:
    // feathersProvider.hasValidIdToken().then(() => {
    //   // show application page
    //   ...
    // }).catch(() => {
    //   // show login page
    //   ...
    // })
  }

  // Guard method for views that must be logged in (e.g. user and data)
  public enforceValidIdToken(page: string, nav: any): Promise<any> {
    console.log('enforceValidIdToken(%s): checking saved auth token...', page);
    return this.authenticate()
      .then(() => {
        // Ok
        console.log('enforceValidIdToken(%s): has valid saved auth token, ok.', page);
        return true;
      })
      .catch((err) => {
        // Force auth guard
        console.log('enforceValidIdToken(%s): no valid saved auth token, calling guard.', page);
        if (this.guardCallback && this.guardCallback[0]) {
          try { this.guardCallback[0](nav); } catch(ignore) {}
        }
        return Promise.reject(err);
      })
    ;
  }

  // Guard method for views that must be logged out (e.g. login/register)
  public enforceInvalidIdToken(page: string, nav: any): Promise<any> {
    console.log('enforceInvalidIdToken(%s): checking saved auth token...', page);
    let guard = false; // Track if guard was triggered for last .catch
    return this.authenticate()
      .then(() => {
        // Force login guard
        console.log('enforceInvalidIdToken(%s): has valid saved auth token, calling guard.', page);
        guard = true;
        if (this.guardCallback && this.guardCallback[1]) {
          try { this.guardCallback[1](nav); } catch(ignore) {}
        }
        return Promise.reject(new Error('already logged in'));
      })
      .catch((err) => {
        if (guard) {
          return err;
        }
        // Ok
        console.log('enforceInvalidIdToken(%s): no valid saved auth token, ok.', page);
        return true;
      })
    ;
  }


  public getUserInfo() {
    return this._feathers.get('user');
  }

  // Expose logout
  public logout(nav: any): Promise<any> {
    this.reauth = null;
    this._feathers.removeListener('reauthentication-error', this.errorHandler);
    return this._feathers.logout()
      .then((result) => {
        if (this.guardCallback && this.guardCallback[1]) {
          try { this.guardCallback[1](nav); } catch(ignore) {}
        }
        return result;
      })
      .catch((error) => {
        console.log(error);
        if (this.guardCallback && this.guardCallback[1]) {
          try { this.guardCallback[1](nav); } catch(ignore) {}
        }
        //return error; // Nobody cares about logout error.
      })
    ;
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
    if (!record._id) return Promise.reject('_id must be set');
    return this.service(service)
      .update(record._id, record)
    ;
  }

  public remove<T extends Record>(service: string, record: T): Promise<T> {
    if (!record._id) return Promise.reject('_id must be set');
    return this.service(service)
      .remove(record._id)
    ;
  }

}
