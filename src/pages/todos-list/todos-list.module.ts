import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { TodosListPage } from './todos-list';

import { TodosListComponentModule } from '../../components/todos-list/todos-list.module';

@NgModule({
  declarations: [
    TodosListPage,
  ],
  imports: [
    TodosListComponentModule,
    IonicPageModule.forChild(TodosListPage),
  ],
})
export class TodosListPageModule { }
