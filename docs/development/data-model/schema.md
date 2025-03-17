# Data Model
Everything in Headbase is an "item", which can then be spit into two categories:
- "data" is "user-level" and "app-level" content
- "definitions" describe the format and behaviour of said data

This concept of building up from a simple core model type is inspired by existing implementations in the productivity space such as...
- [Notion and their 'block model'](https://www.notion.com/blog/data-model-behind-notion)
- [Standard Notes and their 'note types'](https://standardnotes.com/features)
- [Obsidian](https://obsidian.md/) and its many features and plugins, especially [Dataview](https://github.com/blacksmithgu/obsidian-dataview).

## Goals
- To have a flexible data model which is not application specific and can accommodate changes in requirements.
- To allow interoperability of data between applications via a shared specification/protocol.
- To be able to define the data stored and behaviours of an application in a way that can be self-discoverable, similar to concept like Open API/HATEOAS/Hypermedia etc.

## Other
- Experiment first, formalise second.
- JSON Schema (https://json-schema.org/) could be used for definitions and schemas
- A common JSON query syntax (like https://github.com/headbase-app/headbase/blob/main/docs/development/server/listing-params.md) could be recommended for querying.
  - JSON Pointers (https://json-schema.org/learn/glossary#json-pointer) could be used as part of defining queries.
- RRULE strings could be the recommended format for repeated events/notifications (see https://datatracker.ietf.org/doc/html/rfc5545, https://github.com/jkbrzt/rrule)

## The anatomy of an item

```json5
{
  definition: "https://example.com/path/to/definition",
  id: "00000000-0000-0000-0000-000000000000",
	meta: {
		// metadata about the item, such as version tracking information, timestamps etc
		versionId: "00000000-0000-0000-0000-000000000000",
		previousVersionId: "00000000-0000-0000-0000-000000000000",
		createdAt: "0000-00-00T00:00:00.000Z",
		updatedAt: "0000-00-00T00:00:00.000Z",
		deletedAt: null, // or "0000-00-00T00:00:00.000Z",
		createdBy: "",
		updatedBy: "",
		deletedBy: "",
	},
	data: {
		// the stored item data, depends on given "definition"
	}
}
```

### Example items

### User Note
```json5
{
  definition: "https://spec.headbase.app/v1/user/note",
	id: "d9a56301-36a7-4447-b431-81eefbf570f0",
	meta: {
		versionId: "0c2d9d1e-7091-49ef-9b95-acb7ca8d9975",
		previousVersionId: "0aa95e26-ceeb-4df0-9592-aa8615f8f61d",
		createdAt: "2025-03-16T19:35:25.000Z",
		updatedAt: "2025-03-17T08:18:49.000Z",
		deletedAt: null,
		createdBy: "phone|989fcbd2-30f7-489e-9fb1-2512e218a136",
		updatedBy: "laptop|a08dca99-b985-40ed-b9b8-ec6dab9bbe85",
		deletedBy: null
	},
	data: {
    title: "test",
    isFavorite: true,
		body: "this is some text...",
		tags: ["idea", "writing"]
	}
}
```
### User Task
```json5
{
  definition: "https://spec.headbase.app/v1/user/task",
	id: "d9a56301-36a7-4447-b431-81eefbf570f0",
  meta: {
    versionId: "0c2d9d1e-7091-49ef-9b95-acb7ca8d9975",
    previousVersionId: "0aa95e26-ceeb-4df0-9592-aa8615f8f61d",
    createdAt: "2025-03-16T19:35:25.000Z",
    updatedAt: "2025-03-17T08:18:49.000Z",
    deletedAt: null,
    createdBy: "phone|989fcbd2-30f7-489e-9fb1-2512e218a136",
    updatedBy: "laptop|a08dca99-b985-40ed-b9b8-ec6dab9bbe85",
    deletedBy: null
  },
	data: {
    title: "test",
		priority: 1,
		size: 3,
		due: "2025-03-17T08:19:51.000Z",
		reminders: ["RRULE:FREQ=WEEKLY;COUNT=30;WKST=MO"]
	}
}
```

### Headbase View
```json5
{
  definition: "https://spec.headbase.app/v1/app/view",
  id: "d9a56301-36a7-4447-b431-81eefbf570f0",
  meta: {
    versionId: "0c2d9d1e-7091-49ef-9b95-acb7ca8d9975",
    previousVersionId: "0aa95e26-ceeb-4df0-9592-aa8615f8f61d",
    createdAt: "2025-03-16T19:35:25.000Z",
    updatedAt: "2025-03-17T08:18:49.000Z",
    deletedAt: null,
    createdBy: "phone|989fcbd2-30f7-489e-9fb1-2512e218a136",
    updatedBy: "laptop|a08dca99-b985-40ed-b9b8-ec6dab9bbe85",
    deletedBy: null
  },
  data: {
    title: "test",
    isFavorite: true,
		display: {
			type: "list"
		},
		query: {
			page: {limit: 6, offset: 18},
			order: {_updatedAt: "desc"},
			filter: {
				and: [
          {tags: {$includes: "writing"}}
				]
			}
		}
  }
}
```

### View (board)
```json5
{
  definition: "https://spec.headbase.app/app/view",
  id: "d9a56301-36a7-4447-b431-81eefbf570f0",
  meta: {
    versionId: "0c2d9d1e-7091-49ef-9b95-acb7ca8d9975",
    previousVersionId: "0aa95e26-ceeb-4df0-9592-aa8615f8f61d",
    createdAt: "2025-03-16T19:35:25.000Z",
    updatedAt: "2025-03-17T08:18:49.000Z",
    deletedAt: null,
    createdBy: "phone|989fcbd2-30f7-489e-9fb1-2512e218a136",
    updatedBy: "laptop|a08dca99-b985-40ed-b9b8-ec6dab9bbe85",
    deletedBy: null
  },
  data: {
    title: "test",
    isFavorite: true,
    display: {
      type: "board",
      column: "status",
      order: ["backlog", "selected", "in-progress", "done", "removed"]
    },
    query: {
      page: {limit: 6, offset: 18},
      order: {_updatedAt: "desc"},
      filter: {
        and: [
          {tags: {$includes: "development"}}
        ]
      }
    }
  }
}
```
