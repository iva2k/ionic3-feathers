import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from "@angular/core";

import cloneDeep from "clone-deep";
import { diff } from "deep-object-diff";

import { Todo } from "../../providers/todo/todo";
import { FeathersProvider } from "../../providers/feathers/feathers";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'todo-item',
  templateUrl: 'todo-item.html'
})
export class TodoItemComponent implements OnDestroy, OnInit {
  @Input('todoId') todoId: string;
  protected newItem: boolean; // True if opened without navParams, so it is an "Add" command.
  @Output('done') doneEvent = new EventEmitter<{action: string, item: Todo}>();

  protected todo: Todo = <Todo>{};
  protected oldTodo: Todo; // Saved data for detecting changes
  private subscription: any; //TODO: DataSubscriber<Todo>;

  constructor(
    private feathersProvider: FeathersProvider,
    private ref: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.newItem = !this.todoId;
    console.log('ngOnInit() TodoItemComponent. todoId: %s, newItem: %s', this.todoId, this.newItem);
    if (this.newItem) {
      // Create new item
      this.todo = new Todo();
    } else {
      // Edit existing item
      this.subscription = this.feathersProvider.subscribe<Todo>('todos', {
          _id: this.todoId,
          $limit: 1
        },
        (todos: Todo[]) => {
          // This callback will be called every time data is changed on the server.
          if (todos.length == 1 && todos[0]) { // exact query returned
            this.todo = todos[0];
            this.oldTodo = cloneDeep(this.todo);
          } else if (todos.length == 0) { // 'remove' happened
            this.todo = new Todo(); // remove record
            this.oldTodo = null;
          } else if (todos.length > 1) { // 'create' happened
          //  console.error('Error, did not find todo item id "%s"', this.todoId); // DEBUG
          }
          this.ref.markForCheck();
        },
        err => {
          console.error('Error in FeathersProvider.subscribe(): ', err);
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
    this.feathersProvider.create<Todo>('todos', this.todo)
      .then(res => {
        console.log('FeathersProvider.create result: %o', res); // DEBUG
        this.doneEvent.emit({action: 'added', item: res});
      })
      .catch(err => {
        console.error('Error in FeathersProvider.create: %o', err);
      });
  }

  // Update button click
  public update() {
    console.log('TodoItemComponent Update button. todo: ', this.todo);
    let changes = diff(this.oldTodo, this.todo);
    // Don't save if no changes were made
    if (!!Object.keys(changes).length) {
      // Actual changes were made
      console.log('Changes: %o', changes); // DEBUG
      this.feathersProvider.update<Todo>('todos', this.todo)
        .then(res => {
          console.log('FeathersProvider.update result: %o', res); // DEBUG
          this.doneEvent.emit({action: 'updated', item: res});
        })
        .catch(err => {
          console.error('Error in FeathersProvider.update: %o', err);
        });
    } else {
      // No changes made, emit "not updated", so page can return to master
      this.doneEvent.emit({action: 'updated (no changes made)', item: this.todo});
    }
  }

  // Delete button click
  public remove() {
    console.log('TodoItemComponent Delete button. todo: ', this.todo);
    this.feathersProvider.remove<Todo>('todos', this.todo)
      .then(res => {
        console.log('FeathersProvider.remove result: %o', res); // DEBUG
        this.doneEvent.emit({action: 'removed', item: res});
      })
      .catch(err => {
        console.error('Error in FeathersProvider.remove: %o', err);
      });
  }
}
