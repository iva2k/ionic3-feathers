import { Injectable } from '@angular/core';

//?import * as feathersRx from 'feathers-reactive';
import io from "socket.io-client";

//import feathers from "@feathersjs/rest-client";
//import feathers from "@feathersjs/primus-client";
//import socketio from "@feathersjs/socketio-client";
import feathers from "@feathersjs/client";

@Injectable()
export class FeathersProvider {

  const apiUrl = 'http://localhost:3030';
//  apiUrl = 'https://jsonplaceholder.example.com';

  private _feathers = feathers();
  private _socket;

  constructor() {
    // Add socket.io plugin
    this._socket = io(this.apiUrl, {
//      transports: ['websocket'],
//      forceNew: true
    });
    //this._feathers.configure(feathersSocketIOClient(this._socket));
    this._feathers.configure(feathers.socketio(this._socket));

    // Add feathers-reactive plugin
    //?this._feathers.configure(feathersRx({ idField: '_id' }));

  }

  // Expose services
  public service(name: string) {
    return this._feathers.service(name);
  }

}
