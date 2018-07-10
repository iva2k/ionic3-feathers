import {
  //ChangeDetectorRef,
  //ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit
} from "@angular/core";

import cloneDeep from "clone-deep";
import { diff } from "deep-object-diff";

import { Todo } from "../../providers/todo/todo";
import { FeathersProvider } from "../../providers/feathers/feathers";

@Component({
  //changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'todo-item',
  templateUrl: 'todo-item.html'
})
export class TodoItemComponent implements OnDestroy, OnInit {
  @Input('todoId') todoId: string;
  protected newItem: boolean; // True if opened without navParams, so it is an "Add" command.

  protected todo: Todo = <Todo>{};
  protected oldTodo: Todo; // Saved data for detecting changes
  private subscription: any; //TODO: DataSubscriber<Todo>;

  constructor(
    private feathersProvider: FeathersProvider
    //private ref: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.newItem = !this.todoId;
    console.log('ngOnInit() TodoItemComponent. todoId: %s, newItem: %s', this.todoId, this.newItem);
    if (this.newItem) {
      // Create new item
      this.todo = new Todo();
    } else {
      // Edit existing item
      this.subscription = this.feathersProvider.subscribe<Todo>('todos', {_id: this.todoId, $limit: 1},
        (todos: any) => {
          if (todos.data && todos.data[0]) {
            this.todo = <Todo>todos.data[0];
            this.oldTodo = cloneDeep(this.todo);
          } else {
            console.error('Error, did not find todo item id "%s"', this.todoId);
          }
          //this.ref.markForCheck();
        },
        err => {
          console.error('Error in subscribe to feathersProvider.subscribe(): ', err);
        });
    }
  }

  public ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  // Add button click
  public add() {
    console.log('TodoItemComponent Add button. todo: ', this.todo);
  }

  // Update button click
  public update() {
    console.log('TodoItemComponent Update button. todo: ', this.todo);
    let changes = diff(this.oldTodo, this.todo);
    // Don't save if no changes were made
    if (!!Object.keys(changes).length) {
      // Actual changes were made
      console.log('Changes: %o', changes); // DEBUG
    }
  }

  // Delete button click
  public delete() {
    console.log('TodoItemComponent Delete button. todo: ', this.todo);
  }
}
