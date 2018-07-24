import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';

import { FeathersProvider } from "../../providers/feathers/feathers";

@IonicPage()
@Component({
  selector: 'page-todo-detail',
  templateUrl: 'todo-detail.html',
})
export class TodoDetailPage {
  protected newItem: boolean; // True if opened without navParams, so it is an "Add" command.
  protected todoId: string;

  constructor(
    private feathersProvider: FeathersProvider,
    private navCtrl: NavController,
    navParams: NavParams,
    private toastCtrl: ToastController
  ) {
    this.todoId = <string>navParams.get('todoId') || '';
    this.newItem = !this.todoId;
    console.log('TodoDetailPage got todoId: %s (newItem: %s)', this.todoId, this.newItem); //DEBUG
  }

  // Entry guard
  ionViewCanEnter(): boolean | Promise<any> {
    // Must be logged in. If not - will redirect to login page internally.
    return this.feathersProvider.enforceValidIdToken('TodoDetailPage', this.navCtrl);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TodoDetailPage');
  }

  // Command completed
  public done(event) {
    console.log('TodoDetailPage command done. event: %o', event);
    this.toaster(`Task "${event.item.title}" ${event.action}.`);
    this.navCtrl.pop();
  }

  private toaster(text: string, time: number = 3000) {
    const toast = this.toastCtrl.create({
      message: text
    });
    toast.present();
    setTimeout(() => toast.dismiss(), time);
  }

}
