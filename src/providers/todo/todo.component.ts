import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit
} from "@angular/core";
import { Subscription } from "rxjs/Subscription";

import { TodoProvider } from "./todo.service";
import { Todo } from "./todo";

@Component({
  selector: "app-todos",
  providers: [TodoProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "todo.component.html"
})
export class TodoComponent implements OnDestroy, OnInit {
  private todos: Todo[] = [];
  private subscription: Subscription;

  constructor(
    private todoProvider: TodoProvider,
    private ref: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.subscription = this.todoProvider.todos$.subscribe(
      (todos) => {
        this.todos = todos.data;
        this.ref.markForCheck();
      },
      err => {
        console.error(err);
      }
    );
    this.todoProvider.find();
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
