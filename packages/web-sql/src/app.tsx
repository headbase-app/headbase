import { sqlite3Worker1Promiser } from '@sqlite.org/sqlite-wasm';

/**
 * Links:
 * https://sqlite.org/wasm/doc/trunk/api-worker1.md#promiser.v2
 * https://sqlite.org/wasm/doc/trunk/api-oo1.md#db-exec
 * https://sqlite.org/lang.html
 * https://developer.chrome.com/blog/sqlite-wasm-in-the-browser-backed-by-the-origin-private-file-system/
 * https://github.com/sqlite/sqlite-wasm/issues/53
 * https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system
 *
 * todo:
 * - look at dev tools for debugging databases (at schema and data level)
 *  - add export functionality for user to download sqlite file from opfs. Likely via loading file and creating file blob to download
 *  - how to manage schemas? Could define or copy externally from JS to allow integrations with IDE, debugging tools and native sqlite tooling outside web browser?
 * - look at how to manage db init, resuming from previous db, handling migrations etc
 * - look at how to detect and handle OPFS and/or WASM not being available in users browser
 * - test performance with lots of rows and large data fields.
 * - look at ability to handle multiple databases, and how cross tab and cross window can work together
 * - look at accessing sqlite from within custom shared worker, which would be required for reading & writing during network sync
 */

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
