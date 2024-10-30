import { sqlite3Worker1Promiser } from '@sqlite.org/sqlite-wasm';

const initializeSQLite = async () => {
  try {
    const promiser = await new Promise((resolve) => {
      const _promiser = sqlite3Worker1Promiser({
        onready: () => {
          resolve(_promiser);
        },
      });
    });
    const configResponse = await promiser('config-get', {});
    console.log(`[sqlite] SQLite WASM loaded at version ${configResponse.result.version.libVersion}`);

    const dbOpenResponse = await promiser('open', {
      filename: 'file:headbase.sqlite3?vfs=opfs',
    });
    const dbId = dbOpenResponse.dbId;
    const dbFilename = dbOpenResponse.result.filename.replace(/^file:(.*?)\?vfs=opfs$/, '$1');
    console.log(`[sqlite] OPFS available, created persisted database at ${dbFilename}`);

    const tables = await promiser('exec', {
      dbId,
      sql: 'PRAGMA table_info([tags])',
      returnValue: 'resultRows',
    });
    console.log(tables);

    await promiser('exec', { dbId, sql: `
        create table if not exists tags (
          id uuid primary key,
          name text not null,
          colour text
        );
    ` });
    console.log('[sqlite test] Creating tags table if note exists...');

    console.log("[sqlite test] Insert data into tags using exec()...");
    for (let i = 20; i <= 25; ++i) {
      const tag = {
        id: window.crypto.randomUUID(),
        name: `tag ${i}`,
      }

      await promiser('exec', {
        dbId,
        sql: 'INSERT INTO tags(id, name) VALUES (?, ?)',
        bind: [tag.id, tag.name],
      });
    }

    console.log('[sqlite test] query data with exec()');
    const queryResponse = await promiser('exec', {
      dbId,
      sql: 'SELECT * FROM tags ORDER BY name',
      returnValue: 'resultRows',
    });
    console.debug(queryResponse)

    await promiser('close', { dbId });
  } catch (err) {
    if (!(err instanceof Error)) {
      err = new Error(err.result.message);
    }
    console.error(err.name, err.message);
  }
};

initializeSQLite();


export default function App() {

  async function exportFile() {
    console.debug('export file')
  }

  return (
    <>
     <p>testing</p>
      <button onClick={exportFile}>export sqlite file</button>
    </>
  )
}
