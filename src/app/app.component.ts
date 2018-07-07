import { Component, ViewChild } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
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
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    feathersProvider: FeathersProvider
  ) {

    // Register callback for failing guard checks:
    feathersProvider.setGuardCallback(
      (nav:any) => { // Guard for user & data pages
        setTimeout(() => {
          this.rootPage = 'LoginPage';
          if (!nav) {
            nav = this.navCtrl; // Revert to root NavController
          }
          if (nav && nav.setRoot) {
            nav.setRoot(this.rootPage);
          }
        }, 0);
      },
      (nav:any) => { // Guard for login pages
        setTimeout(() => {
          this.rootPage = 'MenuPage';
          if (!nav) {
            nav = this.navCtrl; // Revert to root NavController
          }
          if (nav && nav.setRoot) {
            nav.setRoot(this.rootPage);
          }
        }, 0);
      },
    );

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      if (platform.is('cordova')) {
        statusBar.styleDefault();
        splashScreen.hide();
      }
    });
  }

  ngOnInit() {
    console.log('MyApp.ngOnInit()');
  }
}

