import {createReducer} from "@reduxjs/toolkit";

import {createTaskList, deleteTaskList, updateTaskList} from "./task-lists-actions";
import {taskListsAdapter} from "./task-lists-adapter";
import {TaskListsState} from "./task-lists-interface";

export const initialTaskLists: TaskListsState = {
  entities: {},
  ids: []
};

export const taskListsReducer = createReducer(
  initialTaskLists,
  (builder) => {
    builder.addCase(createTaskList, taskListsAdapter.addOne)
    builder.addCase(updateTaskList, taskListsAdapter.updateOne);
    builder.addCase(deleteTaskList, taskListsAdapter.removeOne);
  }
);