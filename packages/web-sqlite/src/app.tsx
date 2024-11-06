import {useEffect, useState} from "react";
import {Database} from "./sqlite/database.ts";
import {WebClientAdapter} from "./sqlite/adapters/web-client-adapter.ts";
import {FieldDto} from "./sqlite/schema/tables/fields/fields.ts";
import {FIELD_TYPES} from "./sqlite/schema/tables/fields/types.ts";

export default function App() {
  const [currentDatabaseId, setCurrentDatabaseId] = useState<string>();
  const [databaseIdInput, setDatabaseIdInput] = useState<string>('testing');

  const [db, setDb] = useState<Database | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<FieldDto[]>([]);

  useEffect(() => {
    if (!currentDatabaseId) return

    console.debug('[react] creating database instance')
    const instance = new Database(currentDatabaseId, {databaseAdapter: WebClientAdapter});
    setDb(instance)

    return () => {
      console.debug('[react] closing database instance')
      instance.close()
      setDb(null)
    }
  }, [currentDatabaseId]);


  useEffect(() => {
    if (!db || !currentDatabaseId) return

    const observable = db.liveGetFields()
    const subscriber = observable.subscribe((next) => {
      if (next.status === 'success') {
        setResults(next.data)
        setIsLoading(false)
      }
      else if (next.status === 'loading') {
        setIsLoading(true)
      }
      else {
        console.error(next.error)
      }
    })

    return () => {
      subscriber.unsubscribe()
    }
  }, [db, currentDatabaseId]);

  async function addItem() {
    if (!db || !currentDatabaseId) return

    await db.createField({
      label: 'example 1',
      description: null,
      createdBy: 'testing 1',
      type: FIELD_TYPES.markdown.id,
      settings: {
        defaultLines: 5
      }
    })
  }

  return (
    <div className='bg-atom-500'>
      <label htmlFor='database-id'>Database ID</label>
      <input value={databaseIdInput || ''} onChange={(e) => setDatabaseIdInput(e.target.value)}/>
      <button onClick={() => {
        setCurrentDatabaseId(databaseIdInput)
      }}>set database
      </button>

      <p>testing</p>
      <button onClick={addItem}>add test item</button>

      {isLoading && <p>Loading...</p>}
      <ul>
        {results.map(result => (
          <li key={result.id}>{JSON.stringify(result)}</li>
        ))}
      </ul>
    </div>
  )
}
