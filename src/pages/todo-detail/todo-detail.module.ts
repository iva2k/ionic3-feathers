import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { TodoDetailPage } from './todo-detail';

import { TodoItemComponentModule } from '../../components/todo-item/todo-item.module';

@NgModule({
  declarations: [
    TodoDetailPage,
  ],
  imports: [
    TodoItemComponentModule,
    IonicPageModule.forChild(TodoDetailPage),
  ],
})
export class TodoDetailPageModule {}
