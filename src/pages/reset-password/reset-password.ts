import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Loading, LoadingController, NavController, NavParams, ToastController } from 'ionic-angular';

import { User } from "../../models/user";
import { FeathersProvider } from "../../providers/feathers/feathers";

@IonicPage({
  segment: 'reset-password/:vt',
  //defaultHistory: ['auth/reset'] // TODO: Implement
  priority: 'off'
})
@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html'
})
export class ResetPasswordPage {
  @ViewChild('entryFocus') entryFocus: any; // attach to element with #entryFocus property
  @ViewChild('entryFocus2') entryFocus2: any; // attach to element with #entryFocus2 property

  loading: Loading;
  credentials: User = <User>{ email: '', password: '' };
  protected verificationToken: string;
  protected error: string;
  //protected showLogin = false; //TODO: Implement link to a login page
  protected showReset = false; //TODO: Implement link to a reset page, login page

  constructor(
    private feathersProvider: FeathersProvider,
    private loadingController: LoadingController,
    private navCtrl: NavController,
    navParams: NavParams,
    private ngZone: NgZone,
    private toastCtrl: ToastController
  ) {
    this.verificationToken = <string>navParams.get('vt') || '';
  }

  // No entry guard

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResetPasswordPage, verificationToken: ' + this.verificationToken);
    // Good UX: Move cursor to the first form field (marked by #entryFocus property in template).
    setTimeout(() => {
      // If token is provided (from email URL), move straight to the 2nd field.
      if (!this.verificationToken) this.entryFocus.setFocus();
      else                         this.entryFocus2.setFocus();
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

  public resetPassword() {
    this.showLoading('Changing Password');
    this.feathersProvider.resetPassword(this.verificationToken, this.credentials)
      .then((user) => {
        //this.loading.dismiss();
        console.log('Successfully changed password, result: %o', user);
        // postpone till later: this.toaster('Successfully changed password for ' + user.email);

        // Automatically login after successful password change. That's what user is here for.
        this.showLoading('Signing in');
        user.password = this.credentials.password;
        this.feathersProvider.authenticate(user)
          .then(() => {
            //this.loading.dismiss();
            this.toaster('Successfully changed password and signed in as ' + user.email);
            this.navCtrl.setRoot('MenuPage', {}, {animate: false});
          })
          .catch((error) => {
            //this.toaster('Successfully changed password for ' + user.email);
            this.presentServerError(error, 'Signing in', 'authenticate', true);
          })
        ;
      })
      .catch((error) => {
        this.presentServerError(error, 'Changing password', 'resetPassword', false);
      })
    ;
  }

  private presentServerError(error, activity: string, command: string, changedPass: boolean) {
    this.loading.dismiss(); this.loading = null;

    // By default pass through unknown errors
    let message = error.message;

    // Translate cryptic/technical messages like 'socket timeout' to messages understandable by users, e.g. 'cannot reach server'.

    //if (command == 'resetPassword') {
    //  message = '';
    //}
    if ( error.message == 'Password reset token has expired.'
      || error.message == 'Invalid token. Get for a new one. (authManagement)'
    ) {
      message = 'Verification Code has expired. Please request a new one.';
      this.showReset = true;
    }

    if (error.name === 'Timeout' || error.message === 'Socket connection timed out') {
      message = 'Cannot reach the server. Check your connection and try again.';
    }

    if (changedPass) {
      message = 'Successfully changed password, but cannot login, error: ' + message;
      //?this.showLogin = true;
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
