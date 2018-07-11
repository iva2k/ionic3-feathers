import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController } from 'ionic-angular';

import { FeathersProvider } from "../../providers/feathers/feathers";

@IonicPage()
@Component({
  selector: 'page-todos-list',
  templateUrl: 'todos-list.html'
})
export class TodosListPage {

  constructor(
    private feathersProvider: FeathersProvider,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {

  }

  // Entry guard
  ionViewCanEnter(): boolean | Promise<any> {
    // Must be logged in. If not - will redirect to login page internally.
    return this.feathersProvider.enforceValidIdToken('TodosListPage', this.navCtrl);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TodosListPage');
  }

  // Edit button click
  public edit(itemId: string) {
    console.log('TodosListPage Edit button, itemId: %s', itemId); // DEBUG
    if (itemId) {
      let params = { todoId: itemId };
      this.navCtrl.push('TodoDetailPage', params);
    }
  }

  // Add button click
  public add() {
    console.log('TodosListPage Add button');
    let params = {};
    this.navCtrl.push('TodoDetailPage', params);
  }

  // Command completed
  public done(event) {
    console.log('TodosListPage command done. event: %o', event);
    this.toaster(`Task "${event.item.title}" ${event.action}.`);
  }

  private toaster(text: string, time: number = 3000) {
    const toast = this.toastCtrl.create({
      message: text
    });
    toast.present();
    setTimeout(() => toast.dismiss(), time);
  }

}
