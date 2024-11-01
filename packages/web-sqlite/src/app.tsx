import {useEffect, useState} from "react";
import {Database} from "./sqlite/database.ts";
import {TagDto} from "./sqlite/schema/tags.ts";

export default function App() {
  const [currentDatabaseId, setCurrentDatabaseId] = useState<string>();
  const [databaseIdInput, setDatabaseIdInput] = useState<string>('testing');

  const [db, setDb] = useState<Database | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<TagDto[]>([]);

  useEffect(() => {
    if (!currentDatabaseId) return

    console.debug('[react] creating database instance')
    const instance = new Database(currentDatabaseId);
    setDb(instance)

    return () => {
      console.debug('[react] closing database instance')
      instance.close()
      setDb(null)
    }
  }, [currentDatabaseId]);


  useEffect(() => {
    if (!db || !currentDatabaseId) return

    const observable = db.liveGetTags()
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

    await db.createTag({
      name: 'example 1',
      createdBy: 'testing 1',
      colour: 'blue'
    })
  }

  async function addItemViaWorker() {
    if (!db || !currentDatabaseId) return

    db.requestWorkerCreateTag({
      name: 'example 1 - FROM WORKER',
      createdBy: 'testing 1',
      colour: 'blue'
    })
  }

  return (
    <>
      <label htmlFor='database-id'>Database ID</label>
      <input value={databaseIdInput || ''} onChange={(e) => setDatabaseIdInput(e.target.value)}/>
      <button onClick={() => {
        setCurrentDatabaseId(databaseIdInput)
      }}>set database
      </button>

      <p>testing</p>
      <button onClick={addItem}>add test item</button>
      <button onClick={addItemViaWorker}>add test item VIA WORKER LOCK</button>

      {isLoading && <p>Loading...</p>}
      <ul>
        {results.map(result => (
          <li key={result.id}>{JSON.stringify(result)}</li>
        ))}
      </ul>
    </>
  )
}
