import { Component, ViewChild } from '@angular/core';
import { IonicPage, Loading, LoadingController, NavController, NavParams } from 'ionic-angular';

import { User } from "../../models/user";
import { FeathersProvider } from "../../providers/feathers/feathers";

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  @ViewChild('entryFocus') entryFocus: any; // attach to element with #entryFocus property
  loading: Loading;
  credentials: User = <User>{ email: '', password: '' };
  protected error: string;

  constructor(
    private feathersProvider: FeathersProvider,
    private loadingController: LoadingController,
    private navCtrl: NavController,
    private navParams: NavParams
  ) {
  }

  // Entry guard
  ionViewCanEnter(): boolean | Promise<any> {
    // Must be NOT logged in. If logged in - will redirect to main page internally.
    return this.feathersProvider.enforceInvalidIdToken('LoginPage', this.navCtrl);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
    // Good UX: Move cursor to the first form field (marked by #entryFocus property in template).
    setTimeout(() => {
      this.entryFocus.setFocus();
    }, 500);
  }

  showLoading(activity: string) {
    this.error = ''; // Clear error
    this.loading = this.loadingController.create({
      content: activity + ', Please wait...',
      dismissOnPageChange: true
    });
    this.loading.present();
  }

  login() {
    this.showLoading('Signing in');
    this.feathersProvider.authenticate(this.credentials)
      .then(() => {
        //this.loading.dismiss();
        this.navCtrl.setRoot('MenuPage', {}, {animate: false});
      })
      .catch((error) => {
        this.presentServerError(error, 'Signing in', 'authenticate');
      })
    ;
  }

  register() {
    this.showLoading('Registering');
    this.feathersProvider.checkUnique({ email: this.credentials.email })
      .then(() => { // Email is unique
        this.feathersProvider.register(this.credentials)
          .then(() => {
            //this.loading.dismiss();
            console.log('User created.');
            this.navCtrl.setRoot('MenuPage', {}, { animate: false });
          })
          .catch(error => {
            this.presentServerError(error, 'Registering', 'register');
          })
          ;
      })
      .catch((err) => { // Email is already registered, or all other errors
        this.presentServerError(err, 'Registering', 'checkEmailUnique');
      })
      ;
  }

  private presentServerError(error, activity: string, command: string) {
    this.loading.dismiss();

    // By default pass through unknown errors 
    let message = error.message; 

    // Translate cryptic/technical messages like 'socket timeout' to messages understandable by users, e.g. 'cannot reach server'.

    if (command == 'checkEmailUnique' && error.message === 'Values already taken.') {
      message = 'Email "' + this.credentials.email + '" is already registered. Please enter your password and click "Login", or click "Forgot" to recover your password.';
    }

    if (error.name === 'Timeout' || error.message === 'Socket connection timed out') {
      message = 'Cannot reach the server. Check your connection and try again.';
    }

    console.log('translateServerMessageToHuman() result: "%s", activity: \'%s\', command: \'%s\', error: %o', message, activity, command, error);
    this.error = message;
  }

}
