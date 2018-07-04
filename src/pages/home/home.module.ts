import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { HomePage } from './home';

import { TodoComponentModule } from '../../providers/todo/todo.component.module';

@NgModule({
  declarations: [
    HomePage,
  ],
  imports: [
    TodoComponentModule,
    IonicPageModule.forChild(HomePage),
  ],
  exports: [
    HomePage
  ]
})
export class HomePageModule { }
