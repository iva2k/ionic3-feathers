import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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
    public feathersProvider: FeathersProvider,
    public navCtrl: NavController,
    public navParams: NavParams
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
    console.log(`Task "${event.item.title}" ${event.action}.`);
    // TODO: Implement Toast e.g. `Item "${event.item.title}" ${event.action}.` => 'Item "Task 1" removed.'
    //let params = {};
    this.navCtrl.pop();
  }

}
