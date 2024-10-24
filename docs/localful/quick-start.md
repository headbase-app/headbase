# Get Started

## Define a Schema

```ts
import z from "zod"
import {IdField} from "@headbase-app/common"
import {LocalfulWeb} from "@localful/web"

export const NoteData = z.object({
  name: z.string(),
  body: z.string(),
  tags: z.array(IdField)
}).strict()
export type NoteData = z.infer<typeof NoteData>

export const TagData = z.object({
  name: z.string(),
}).strict()
export type TagData = z.infer<typeof TagData>

export const DATA_SCHEMA = {
  notes: {
    currentSchema: 'v1.0',
    schemas: {
      'v1.0': NoteData
    },
  },
  tags: {
    currentSchema: 'v1.0',
    schemas: {
      'v1.0': TagData
    },
    useMemoryCache: true
  }
}

export const localful = new LocalfulWeb<typeof DATA_SCHEMA>({
  dataSchema: DATA_SCHEMA
})
```

## Use the Database

```ts
const newTag = await localful.db.create('tags', {
  name: "Example Tag",
})
if (!newTag.success) {
  throw new Error("Well that's not good")
}

const newNote = await localful.db.create('notes', {
  name: "Example Note",
  body: "This is an example note!",
  tags: [newTag.data.id],
})
if (!newNote.success) {
  throw new Error("Well that's also not good")
}

const allNotes = await localful.getAll('notes')
const note = await localful.get('notes', newNote.data.id)

await localful.db.update('tags', newTag.data.id, {
  name: 'Updated Tag'
})

await localful.db.delete('tags, 'newTag.data.id)
```

## Connect a Server
TODO

## Migrate Schema and Data

```ts
import z from "zod"
import {IdField} from "@headbase-app/common"
import {LocalfulWeb, MigrationData} from "@localful/web"

export const _NoteDatav1 = z.object({
  name: z.string(),
  body: z.string(),
  tags: z.array(IdField)
}).strict()
export type _NoteDatav1 = z.infer<typeof _NoteDatav1>

export const NoteData = z.object({
  title: z.string(), 
  description: z.string().optional(),
  content: z.string(),
  tags: z.array(IdField)
}).strict()
export type NoteData = z.infer<typeof NoteData>

export const TagData = z.object({
  name: z.string(),
}).strict()
export type TagData = z.infer<typeof TagData>

// data could be any old type if you migrate more than one old version!
async function noteSchemaMigrate(db: LocalfulWeb<typeof DATA_SCHEMA>, oldVersion: MigrationData, data: _Notev1): Promise<Note|undefined> {
  if (migrationData.currentVersion === '1' && migrationData.targetVersion === '2') {
    return {
      title: data.name,
      content: data.title,
      tags: data.tags
    }
  }
	
  // Returning no data means the 
}

export const DATA_SCHEMA = {
  notes: {
    currentSchema: 'v2.0',
    schemas: {
      'v1.0': _NoteDatav1
      'v2.0': NoteData
    },
    migrateSchema: noteSchemaMigrate
  },
  tags: {
    currentSchema: 'v1.0',
    schemas: {
      'v1.0': TagData
    },
    useMemoryCache: true
  }
}

export const localful = new LocalfulWeb<typeof DATA_SCHEMA>({
  dataSchema: DATA_SCHEMA
})
```
