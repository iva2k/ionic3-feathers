import { IonicModule } from 'ionic-angular';
import { TodoComponent } from './todo.component';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [
    TodoComponent
  ],
  imports: [
    IonicModule
  ],
  exports: [
    TodoComponent
  ]
})
export class TodoComponentModule {}
