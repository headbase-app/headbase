import {useEffect, useState} from "react";
import {Database} from "./sqlite/database.ts";

export default function App() {
  const [databaseId, setDatabaseId] = useState<string>('testing');
  const [db, setDb] = useState<Database | null>(null);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const instance = new Database();
    setDb(instance)

    return () => {
      instance.closeAll()
    }
  }, []);


  useEffect(() => {
    if (!db || !databaseId) return

    const observable = db.liveQuery(databaseId, 'select * from tags order by created_at desc')
    const subscriber = observable.subscribe((next) => {
      console.debug(next)
      if (next.status === 'loading') {
        setResults([])
      }
      else {
        setResults(next.results)
      }
    })

    return () => {
      subscriber.unsubscribe()
    }
  }, [db, databaseId]);

  async function addItem() {
    if (!db || !databaseId) return

    const tag = {
      id: window.crypto.randomUUID(),
      created_at: new Date().toISOString(),
      is_deleted: 0,
      hbv: '1.0'
    }

    await db.query(
      databaseId,
      'insert into tags(id, created_at, is_deleted, hbv) values(?, ?, ?, ?)',
      [tag.id, tag.created_at, tag.is_deleted, tag.hbv],
    )
  }

  return (
    <>
      <input value={databaseId || ''} onChange={(e) => setDatabaseId(e.target.value)}/>
      <p>testing</p>
      <button onClick={addItem}>add test item</button>
      <ul>
        {results.map(result => (
          <li key={result.id}>{JSON.stringify(result)}</li>
        ))}
      </ul>
    </>
  )
}
