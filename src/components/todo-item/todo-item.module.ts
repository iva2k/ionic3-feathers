import { IonicModule } from 'ionic-angular';
import { TodoItemComponent } from './todo-item';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [
    TodoItemComponent
  ],
  imports: [
    IonicModule
  ],
  exports: [
    TodoItemComponent
  ]
})
export class TodoItemComponentModule {}
