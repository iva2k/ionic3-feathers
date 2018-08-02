import { Component, NgZone, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { IonicPage, Loading, LoadingController, NavController, NavParams, ToastController } from 'ionic-angular';

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
  protected logins = [];
  constructor(
    private feathersProvider: FeathersProvider,
    private loadingController: LoadingController,
    private navCtrl: NavController,
    navParams: NavParams,
    private ngZone: NgZone,
    private toastCtrl: ToastController
  ) {
    this.logins = this.feathersProvider.getSocialLogins();
    let error    = navParams.get('error'); // If past login attempt failed, we will get an error.
    let activity = navParams.get('activity') || '';
    let command  = navParams.get('command')  || '';
    if (error) {
      this.presentServerError(error, activity, command);
    }
  }

  private onLoginSuccess(user) {
    console.log('User %s loggeed in.', user.email);
    this.hideLoading();
    // The app will switch pages via Events from provider.
    // e.g. this.navCtrl.setRoot('MenuPage', {}, {animate: false});
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

  private showLoading(activity: string) {
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
  private hideLoading() {
    if (this.loading) this.loading.dismiss();
  }

  public login() {
    this.showLoading('Signing in');
    this.feathersProvider.authenticate(this.credentials)
      .then((user) => {
        this.onLoginSuccess(user);
      })
      .catch((error) => {
        this.presentServerError(error, 'Signing in', 'authenticate');
      });
  }

  public register() {
    this.showLoading('Registering');
    this.feathersProvider.checkUnique({ email: this.credentials.email })
      .then(() => { // Email is unique
        this.feathersProvider.register(this.credentials)
          .then((user) => {
            console.log('User created.');
            this.onLoginSuccess(user);
          })
          .catch(error => {
            this.presentServerError(error, 'Registering', 'register');
          });
      })
      .catch((err) => { // Email is already registered, or all other errors
        this.presentServerError(err, 'Registering', 'checkEmailUnique');
      });
  }

  public reset() {
    this.showLoading('Resetting Password');
    this.feathersProvider.resetPasswordRequest({ email: this.credentials.email })
      .then((user) => { // sanitized user {_id, email, avatar}
        this.hideLoading();
        console.log('Password reset request sent to %s', user.email);
        this.toaster('Password reset request sent to ' + user.email);
      })
      .catch((err) => {
        this.presentServerError(err, 'Resetting Password', 'reset');
      });
  }

  public loginWith(social) {
    this.showLoading('Signing in with ' + social.title);
    console.log('log in with ' + social.title);
    this.feathersProvider.loginWith(social)
      .then(() => {
        this.showLoading('Registering app with ' + social.title);
        // Login will complete in a callback, possibly even with app reload. Event will be delivered to the app, which will switch pages or open us with an error info.
      })
      .catch((error) => {
        this.presentServerError(error, 'Signing in with ' + social.title, 'authenticate');
      });
  }

  /**
   * Post error message on UI
   * @param error Error object
   * @param activity 'Signing in ...' and similar text, suitable for showing in UI.
   * @param command 'authenticate', 'validate', 'register', 'reset', 'checkEmailUnique'
   */
  private presentServerError(error, activity: string, command: string) {
    this.hideLoading();

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
