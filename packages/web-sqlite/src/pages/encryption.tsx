/**
 *
 * 	const dbOpenResponse = await promiser('open', {
 * 		filename: 'file:headbase-enc.sqlite3?vfs=multipleciphers-opfs',
 * 	});
 * 	const dbId = dbOpenResponse.dbId;
 * 	const dbFilename = dbOpenResponse.result.filename.replace(/^file:(.*?)\?vfs=multipleciphers-opfs$/, '$1');
 * 	console.log(`[sqlite] OPFS available, created persisted database at ${dbFilename}`);
 *
 * 	const result = await promiser('exec', {
 * 		dbId,
 * 		sql: "PRAGMA key = 'raw:54686973206973206D792076657279207365637265742070617373776F72642E2'",
 * 		returnValue: 'resultRows',
 * 	});
 * 	console.log(result);
 *
 */