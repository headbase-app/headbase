# `@headbase-app/lib-josn-query`
A placeholder package for a "JSON query" library for querying, mapping and aggregating JSON data.

Headbase currently uses [@jsonquerylang/jsonquery](https://jsonquerylang.org) to filter data which strikes a good
balance between being user editable and easy to implement, but it lacks advanced features for things like data aggregation
and requires users to learn a custom syntax.

Longer-term as the UI is developed, it will be worth looking at alternative options as hopefully there is no need for users to manually edit.
One such option is [JSONata](https://jsonata.org/) which has more advanced features, however a UI could allow
developing a custom JSON-based library which doesn't have to be as user-friendly to type.

An example of this custom library could look like this:

```ts
const data = [
	{
		type: "task",
		priority: 3,
		tags: ["development"],
		body: "Content here..."
	},
	{
		type: "task",
		priority: 1,
		tags: ["idea"],
		body: "Content here..."
	},
	// more data here, the query library doesn't care how this is loaded...
]

const query = {
	order: {
		updatedAt: "desc"
	},
	where: {
		type: {
			$equal: "task"
		},
		priority: {
			$lessEqual: 2
		},
		$or: [
			{
				tags: {
					$includes: "development"
				}
			},
			{
				tags: {
					$includes: "dev"
				}
			}
		],
	},
}

const result = jsonQuery(data, query)
```
