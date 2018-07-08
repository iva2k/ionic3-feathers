import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit
} from "@angular/core";
import { Subscription } from "rxjs/Subscription";

import { TodoProvider } from "./todo.provider";
import { Todo } from "./todo";

@Component({
  selector: "app-todos",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "todo.component.html"
})
export class TodoComponent implements OnDestroy, OnInit {
  protected todos: Todo[] = [];
  private subscription: Subscription;

  constructor(
    private todoProvider: TodoProvider,
    private ref: ChangeDetectorRef
  ) {}

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
