import { Component, ViewChild } from '@angular/core';
import { Events, NavController, Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { FeathersProvider } from "../providers/feathers/feathers";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild('navCtrl') navCtrl: NavController;

  rootPage: any = 'MenuPage'; // Go to menu page first (which choses one of children pages). If not logged in, guard will redirect to login page.

  constructor(
    public events: Events,
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    feathersProvider: FeathersProvider
  ) {

    platform.ready().then(() => {
      console.log('platform.ready()');
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      if (platform.is('cordova')) {
        statusBar.styleDefault();
        splashScreen.hide();
      }
    });

    platform.resume.subscribe(() => {
      console.log('platform.resume()');
    });

    this.listenLoginEvents();
  }

  ngOnInit() {
    console.log('MyApp.ngOnInit()');
  }

  private gotoPage(page: any /* string|Component */, params: any = {}, nav: any /* NavController*/ = null, root: boolean = true ) {
    if (!nav) {
      nav = this.navCtrl; // Revert to root NavController
    }

    if (root) {
      if (nav && nav.setRoot) {
        nav.setRoot(page, params);
      } else {
        this.rootPage = page;
      }
    } else {
      //TODO: (when needed) Implement handling non-root pages here.
    }
  }

  private listenLoginEvents() {
    this.events.subscribe('user:login', (user) => {
      console.log('app got user:login');
      this.gotoPage('MenuPage');
      //this.enableMenu(true);
    });

    this.events.subscribe('user:logout', () => {
      console.log('app got user:logout');
      this.gotoPage('LoginPage');
      //this.enableMenu(false);
    });

    this.events.subscribe('user:failed', (error, activity, command) => {
      console.log('app got user:failed');
      this.gotoPage('LoginPage', { error, activity, command });
      //this.enableMenu(false);
    });

    // Guard for login pages
    this.events.subscribe('guard:logout', (page) => {
      console.log('app got guard:logout');
      //?setTimeout(() => {...
      this.gotoPage('MenuPage');
      //this.enableMenu(true);
    });

    // Guard for user & data pages
    this.events.subscribe('guard:login', (page) => {
      console.log('app got guard:login');
      //?setTimeout(() => {...
      this.gotoPage('LoginPage');
      //this.enableMenu(false);
    });

  }

}

