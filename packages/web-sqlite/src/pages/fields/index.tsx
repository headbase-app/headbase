import {useEffect, useState} from "react";
import {Database} from "../../logic/database/database.ts";
import {FieldDto} from "../../logic/database/schema/tables/fields/fields.ts";
import {FIELD_TYPES} from "../../logic/database/schema/tables/fields/schema/types.ts";
import {Link} from "wouter";
import {WorkerAdapter} from "../../logic/database/adapters/worker-adapter.ts";


export default function FieldsPage() {
  const [currentDatabaseId, setCurrentDatabaseId] = useState<string>();
  const [databaseIdInput, setDatabaseIdInput] = useState<string>('testing');
  const [db, setDb] = useState<Database | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<FieldDto[]>([]);

  useEffect(() => {
    if (!currentDatabaseId) return

    console.debug('[react] creating database instance')
    const instance = new Database(currentDatabaseId, {databaseAdapter: WorkerAdapter});
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
      icon: null,
      createdBy: 'testing 1',
      type: FIELD_TYPES.markdown.id,
      settings: {
        defaultLines: 5
      }
    })
  }

  return (
    <div className=''>
      <div className='bg-background-f1 text-text p-6 flex gap-4 items-center justify-between'>
        <ul className='flex items-center gap-6'>
          <li><Link to='/'>Home</Link></li>
          <li><Link to='/fields'>Fields</Link></li>
          <li><Link to='/items'>Content items</Link></li>
        </ul>
        <div className='flex gap-4 items-center'>
          <div>
            <label htmlFor='database-id' className='mr-2 font-bold'>Database ID</label>
            <input
              className='bg-transparent border-md rounded-sm border-blueGrey-600 p-2 hover:border-blueGrey-300 focus:border-teal-400 focus:outline-none focus:ring-0'
              value={databaseIdInput || ''}
              onChange={(e) => setDatabaseIdInput(e.target.value)}
            />
          </div>
          <button
            className='bg-primary text-primary-text p-3 rounded-md hover:bg-primary-interaction hover:text-primary-textInteraction font-semibold'
            onClick={() => {
              setCurrentDatabaseId(databaseIdInput)
            }}>set database
          </button>
        </div>
      </div>

      <p>testing</p>
      <button onClick={addItem}>add test item</button>

      {isLoading && <p>Loading...</p>}
      <ul className='container mx-auto p-4'>
        {results.map(result => (
          <li key={result.id} className='bg-background-f1 mb-4 text-text p-4 rounded-sm'>
            <h3 className='text-text-emphasis text-lg'>{result.label}</h3>
            <p><small>{result.id} (version {result.versionId} from {result.versionCreatedBy})</small></p>
            <p>Created at: {result.createdAt}</p>
            <p>Updated at: {result.updatedAt}</p>
            {result.description && <p>{result.description}</p>}
            {JSON.stringify(result)}
          </li>
        ))}
      </ul>
    </div>
  )
}
