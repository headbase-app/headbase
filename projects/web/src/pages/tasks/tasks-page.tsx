import {useLFBApplication} from "../../utils/lfb-context";
import React, {useMemo} from "react";
import {replaceParam, routes} from "../../routes";
import {JButtonLink} from "@ben-ryder/jigsaw-react";
import {Link} from "react-router-dom";
import {Helmet} from "react-helmet-async";
import {InternalLink} from "../../patterns/components/internal-link";
import {TaskForm} from "./task-form";
import {v4 as createUUID} from "uuid";
import {AthenaDatabase, TaskEntity} from "../../state/features/database/athena-database";

export function TasksPage() {
  const {document} = useLFBApplication();
  const {makeChange} = useLFBApplication();

  const tasks = useMemo(() => {
    return document.tasks.content.ids.map(id => document.tasks.content.entities[id])
  }, [document]);

  return (
    <>
      <Helmet>
        <title>Tasks | Athena</title>
      </Helmet>
      <div className="">
        <h1 className="">Tasks</h1>
      </div>

      <TaskForm
        submitText="Add Task"
        onSubmit={async (taskContent) => {
          const id = createUUID();
          const timestamp = new Date().toISOString();

          const task: TaskEntity = {
            id,
            createdAt: timestamp,
            updatedAt: timestamp,
            ...taskContent
          }

          await makeChange((doc: AthenaDatabase) => {
            doc.tasks.content.ids.push(task.id);
            doc.tasks.content.entities[task.id] = task;
          });


        }}
      />

      {tasks.length === 0 && <p>no tasks found</p>}

      <div>
        {tasks.map(task =>
          <div key={task.id}>
            <h2>{task.name}</h2>
            <p className="text-br-whiteGrey-200">{task.description?.substring(0, 100) + "..."}</p>
            <Link className="absolute w-full h-full top-0 left-0" to={replaceParam(routes.content.tasks.edit, ":id", task.id)}>{`view task`}</Link>
          </div>
        )}
      </div>
    </>
  )
}