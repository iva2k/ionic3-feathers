import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { TodosListPage } from './todos-list';

import { TodoComponentModule } from '../../providers/todo/todo.component.module';

@NgModule({
  declarations: [
    TodosListPage,
  ],
  imports: [
    TodoComponentModule,
    IonicPageModule.forChild(TodosListPage),
  ],
  exports: [
    TodosListPage
  ]
})
export class TodosListPageModule { }
