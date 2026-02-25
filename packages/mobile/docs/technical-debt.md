# Technical Debt
A record of know technical debt, code smells, and temporary/workaround solutions that may need to be revisited in the future.

### `lucide-solid` - the app doesn't load at all and/or is very slow in dev mode
Vite does not tree-shake by default in dev mode and so ALL icons from `lucide-solid` are loaded.
This in itself causes a massive slowdown, but to add even more fun this includes loading the `fingerprint` icon which
can be caught by ad blocking software as a tracking script and blocked, breaking the entire app!

Thanks to https://christopher.engineering/en/blog/lucide-icons-with-vite-dev-server for a solution which fixes both
these issues, which is to configure custom path aliases for `lucide-solid` so icons can be individually imported.

References:
- https://github.com/lucide-icons/lucide/issues/2398
- https://github.com/vitejs/vite/issues/8237
- https://github.com/lucide-icons/lucide/issues/2398

### SolidJS - Uses of `createStore`/`createMultable` don't seem to work correctly, leaking unrelated content between them.
This issue is caused by internal implementation details of Solid where `createStore`/`createMutable` proxy handlers are exclusively bound to an object reference.
That means that if you use the same object reference across multiple create calls, the same underlying proxy is used which screws up all your expectations and isn't caught by typing.

If you want to share the same object reference, such as a default loading state exported from some shared utility, you can
use something like `structuredClone` to ensure you get a unique object reference.

References:
- https://github.com/solidjs/solid/issues/1396

### SolidJS - Type narrowing discriminating unions in `Show`/`Match`
Solid uses accessor functions like `signal()` and control flow primitives in JSX like `Show` and `Match`, for example:

```tsx
function Example() {
	const query = useQuery()

	return (
		<Switch fallback={<p>Loading...</p>}>
			<Match when={query().status === "loading"}>
				<p>Loading...</p>
			</Match>
			<Match when={query().status === "error"}>
				// ISSUE: Typescript can't narrow to error status, as seperate function call is used to access signal.
				<p>Error: ${query().error}</p>
			</Match>
			// ISSUE: keyed allows types to narrow, but still doesn't work when having to re-use accessor function.
			<Match when={query().status === "success" && query().result} keyed>
				{(result) => {
					<p>Result: ${result}</p>
				}}
			</Match>
		</Switch>
	)
}
```

There are lots of discussions about this, but I've personally not found a solution which appears to work nicely.
The "best" solution I've found so far is to use `keyed` with an IIFE so that the accessor can be called once and all logic
and types can be narrowed correctly from the function return:

```tsx
function Example() {
	const query = useQuery()

	return (
		<Switch fallback={<p>Loading...</p>}>
			<Match when={query().status === "loading"}>
				<p>Loading...</p>
			</Match>
			<Match when={(() => {const q = query(); return query?.status === 'error' ? query.errors : false})()} keyed>
				{(error) => {
					<p>Error: ${error}</p>
				}}
			</Match>
			<Match when={(() => {const q = query(); return query?.status === 'success' ? query.result : false})()} keyed>
				{(result) => {
					<p>Result: ${result}</p>
				}}
			</Match>
		</Switch>
	)
}
```

I'm still too new to Solid to understand if there are any performance or other considerations to bear in mind with this
approach, and I remain convinced that there must be a cleaner way to handle these cases.
Perhaps relying on props/children components so the signal can be "unwrapped" in the parent and the child doesn't have
to worry about the type issues on narrowing the accessor.

References:
- https://github.com/solidjs/solid/discussions/1527
- https://github.com/solidjs/solid/discussions/1575

### 'CapacitorSQLite not implemented on iOS'
This looks to be caused by https://github.com/capacitor-community/sqlite/issues/568 (see also https://github.com/capacitor-community/sqlite/issues/679).

The solution may be to move to using CocoaPods for iOS package management, although it looks like this is no longer supported or the suggested way in Capacitor.
The other solution may be to simply wait for https://github.com/capacitor-community/sqlite/issues/568 to be resolved.
