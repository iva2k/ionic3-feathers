import { Injectable } from '@angular/core';

import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";

import { FeathersProvider } from "../../providers/feathers/feathers";

import { Todo } from "./todo";

@Injectable()
export class TodoProvider {

  public todos$: Observable<Todo[]>;
  private todosObserver: Observer<Todo[]>;
  private feathersService: any;
  private dataStore: {
    todos: Todo[];
  };

  constructor(
    feathersProvider: FeathersProvider
  ) {
    console.log('Hello from TodoProvider');
    //super();
    this.feathersService = feathersProvider.service("todos");

    this.feathersService.on("created", todo => this.onCreated(todo));
    this.feathersService.on("updated", todo => this.onUpdated(todo));
    this.feathersService.on("removed", todo => this.onRemoved(todo));

    this.todos$ = new Observable(observer => (this.todosObserver = observer));
    this.dataStore = { todos: [] };
  }


//  getTodos() {
//    return new Promise(resolve => {
//      this.http.get(this.apiUrl+'/todos').subscribe(data => {
//        resolve(data);
//      }, err => {
//        console.log(err);
//      });
//    });
//  }
//
//  addTodo(data) {
//    return new Promise((resolve, reject) => {
//      this.http.post(this.apiUrl+'/todos', JSON.stringify(data))
//        .subscribe(res => {
//          resolve(res);
//        }, (err) => {
//          reject(err);
//        });
//    });
//  }

//?  public addTodo(data: Todo) {
//    this.feathersService.create(data);
//  }

  public find() {
    this.feathersService.find({
      query: {}
    })
    .then( (todos: Todo[]) => {
      this.dataStore.todos = todos;
      this.todosObserver.next(this.dataStore.todos);
    })
    .catch( (err) => {
      this.dataStore.todos = [{ id: '1qwe', title: "Task1", notes: "Oxo numa lupaer hicka" }, { id: '2wer', title: "Task2", notes: "Didal vensi minaf wisa" }, { id: '3ert', title: "Task3", notes: "Plofer dular mendi fiser" } ]; this.todosObserver.next(this.dataStore.todos); // DEBUG only
      console.error(err);
    });
  }

  private getIndex(id: string): number {
    let foundIndex = -1;

    for (let i = 0; i < this.dataStore.todos.length; i++) {
      if (this.dataStore.todos[i].id === id) {
        foundIndex = i;
      }
    }

    return foundIndex;
  }

  private onCreated(todo: Todo) {
    this.dataStore.todos.push(todo);
    this.todosObserver.next(this.dataStore.todos);
  }

  private onUpdated(todo: Todo) {
    const index = this.getIndex(todo.id);

    this.dataStore.todos[index] = todo;
    this.todosObserver.next(this.dataStore.todos);
  }

  private onRemoved(todo) {
    const index = this.getIndex(todo.id);

    this.dataStore.todos.splice(index, 1);
    this.todosObserver.next(this.dataStore.todos);
  }

}
