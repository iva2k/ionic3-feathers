import { IonicModule } from 'ionic-angular';
import { TodosListComponent } from './todosList.component';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [
    TodosListComponent
  ],
  imports: [
    IonicModule
  ],
  exports: [
    TodosListComponent
  ]
})
export class TodosListComponentModule {}
