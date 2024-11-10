import {default as promiserFactory} from "../lib/sqlite/sqlite3-worker1-promiser.mjs";
import {useEffect} from "react";


async function setup() {
	const promiserConfig = {
		debug: 1 ? undefined : (...args)=>console.debug('worker debug',...args),
		onunhandled: function(ev){
			console.error("Unhandled worker message:",ev.data);
		},
		onerror: function(ev){
			console.error("worker1 error:",ev);
		}
	};

	const promiser = await promiserFactory(promiserConfig)
		.then((func)=>{
			//globalThis.sqlite3TestModule.setStatus(null)/*hide the HTML-side is-loading spinner*/;
			return func;
		});

	const configResponse = await promiser('config-get', {});
	console.log(`[sqlite] SQLite WASM loaded at version ${configResponse.result.version.libVersion}`);

	const dbOpenResponse = await promiser('open', {
		filename: 'file:headbase-enc.sqlite3?vfs=multipleciphers-opfs',
	});
	const dbId = dbOpenResponse.dbId;
	const dbFilename = dbOpenResponse.result.filename.replace(/^file:(.*?)\?vfs=multipleciphers-opfs$/, '$1');
	console.log(`[sqlite] OPFS available, created persisted database at ${dbFilename}`);

	const result = await promiser('exec', {
		dbId,
		sql: "PRAGMA key = 'raw:54686973206973206D792076657279207365637265742070617373776F72642E2'",
		returnValue: 'resultRows',
	});
	console.log(result);

	const result2 = await promiser('exec', {
		dbId,
		sql: 'SELECT * FROM sqlite_master;',
		returnValue: 'resultRows',
	});
	console.log(result2);

	await promiser('exec', { dbId, sql: `
        create table if not exists tags (
          id uuid primary key,
          name text not null
        );
    ` });
	console.log('[sqlite test] Creating tags table if note exists...');

	console.log("[sqlite test] Insert data into tags using exec()...");
	// const tag = {
	// 	id: window.crypto.randomUUID(),
	// 	name: `tag`,
	// }
	// await promiser('exec', {
	// 	dbId,
	// 	sql: 'INSERT INTO tags(id, name) VALUES (?, ?)',
	// 	bind: [tag.id, tag.name],
	// });

	console.log('[sqlite test] query data with exec()');
	const queryResponse = await promiser('exec', {
		dbId,
		sql: 'SELECT * FROM tags ORDER BY name',
		returnValue: 'resultRows',
	});
	console.debug(queryResponse.result.resultRows);

}

setup()

export function EncryptionTests() {
	useEffect(() => {

	}, []);

	return (
		<div>
			<h1>Encryption Test</h1>
		</div>
	)
}