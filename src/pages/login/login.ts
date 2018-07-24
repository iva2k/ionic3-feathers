import { Component, NgZone, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { IonicPage, Loading, LoadingController, NavController, /* NavParams, */ ToastController } from 'ionic-angular';

import { User } from "../../models/user";
import { FeathersProvider } from "../../providers/feathers/feathers";

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  animations: [
    trigger('revealY', [
      state('*', style({ 'overflow-y': 'hidden' })),
      state('void', style({ 'overflow-y': 'hidden' })),
      transition(':enter', [
        style({height: '0'}),
        animate('0.5s',
          style({height: '*'}))
      ]),
      transition(':leave', [
        style({height: '*'}),
        animate('0.5s',
          style({height: '0'}))
      ])
    ])
  ]
})
export class LoginPage {
  @ViewChild('entryFocus') entryFocus: any; // attach to element with #entryFocus property
  protected mode = 'login';
  loading: Loading;
  credentials: User = <User>{ email: '', password: '' };
  protected error: string;
  protected logins = [
    //{title: 'Facebook', name: 'facebook', icon: 'logo-facebook', url: '/auth/facebook'},
    //{title: 'Google', name: 'google', icon: 'logo-google', url: '/auth/google'},
    //{title: 'Github', name: 'github', icon: '??logo-github', url: '/auth/github'},
  ];
  constructor(
    private feathersProvider: FeathersProvider,
    private loadingController: LoadingController,
    private navCtrl: NavController,
    // navParams: NavParams,
    private ngZone: NgZone,
    private toastCtrl: ToastController
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
    let message = 'Please wait,<br/>' + activity + '...';
    if (this.loading) {
      this.ngZone.run(() => { // Update
        this.loading.setContent(message);
      });
    } else { // Create new
      this.loading = this.loadingController.create({
        content: message,
        dismissOnPageChange: true
      });
      this.loading.present();
    }
  }

  public login() {
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

  public register() {
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

  public reset() {
    this.showLoading('Resetting Password');
    this.feathersProvider.resetPasswordRequest({ email: this.credentials.email })
      .then((user) => { // sanitized user {_id, email, avatar}
        this.loading.dismiss();
        console.log('Password reset request sent to %s', user.email);
        this.toaster('Password reset request sent to ' + user.email);
      })
      .catch((err) => {
        this.presentServerError(err, 'Resetting Password', 'reset');
      })
  }

  public loginWith(social) {
    console.log('log in with ' + social.name);
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

  private toaster(text: string, time: number = 3000) {
    const toast = this.toastCtrl.create({
      message: text
    });
    toast.present();
    setTimeout(() => toast.dismiss(), time);
  }
}
