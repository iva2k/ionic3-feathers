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
  @ViewChild('email') email: any;
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
    // Good UX: Move cursor to the first form field.
    setTimeout(() => {
      this.email.setFocus();
    }, 500);
  }

  showLoading() {
    this.loading = this.loadingController.create({
      content: 'Please wait...',
      dismissOnPageChange: true
    });
    this.loading.present();
    this.error = '';
  }

  login() {
    this.showLoading();
    this.feathersProvider.authenticate(this.credentials)
      .then(() => {
        //this.loading.dismiss();
        this.navCtrl.setRoot('MenuPage', {}, {animate: false});
      })
      .catch((error) => {
        this.loading.dismiss();
        console.error('User login error: ', error);
        this.error = error.message;
      })
    ;
  }

  register() {
    this.showLoading();
    this.feathersProvider.register(this.credentials)
      .then(() => {
        //this.loading.dismiss();
        console.log('User created.')
        this.navCtrl.setRoot('MenuPage', {}, {animate: false});
      })
      .catch(error => {
        this.loading.dismiss();
        console.error('User registration error: ', error)
        this.error = error.message;
      })
    ;
  }
}
