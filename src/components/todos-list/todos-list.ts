import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit
} from "@angular/core";
import { Subscription } from "rxjs/Subscription";

import { TodoProvider } from "../../providers/todo/todo.provider";
import { Todo } from "../../providers/todo/todo";

@Component({
  selector: 'todos-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'todos-list.html'
})
export class TodosListComponent implements OnDestroy, OnInit {
  protected todos: Todo[] = [];
  private subscription: Subscription;

  constructor(
    private todoProvider: TodoProvider,
    private ref: ChangeDetectorRef
  ) {
  }

  public ngOnInit(): void {
    this.subscription = this.todoProvider.todos$.subscribe(
      (todos: any) => {
        this.todos = todos.data;
        this.ref.markForCheck();
      },
      err => {
        console.error('Error in subscribe to TodoProvider: ', err);
      }
    );
    this.todoProvider.find({
      $sort: {createdAt: -1},
      $limit: 25
    });
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
