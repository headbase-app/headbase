# Queries
The local database method `query` can be used to query entites, and includes basic support for filters, groups and ordering.

## Basics
Queries are written like so:

```ts
localful.db.query({
  select: "notes",
  where: [
    {field: "tags", operation: "includes", value: "tag1"},
    {field: "tags", operation: "includes", value: "tag2"},
    [
      {field: "name", operation: "like", value: "test"},
      {field: "name", operation: "like", value: "example"},
    ]
  ],
  orderBy: "createdAt",
})
```

The where clause of this query translates as: 
```
where tags includes tag1 AND tags includes tag2 AND (name like test OR name like example)
```

## Operations
The following operations are supported:
- `equal` - Directly compare using Javascript's built in equality checks (`===`).
- `like` - Use a "weak" comparison:
  - For strings, this means a case-insentitive "includes" check
  - For primitive types such as boolean, number etc this acts the same as `equal`
  - For arrays, this will check that there are no differences. For example `[1 ,2, 3]` is like `[3, 1, 2]`. This uses `a.filter(x => b.includes(x)).length === 0`
  - All other types such as objects currently still behave like `equal`, but this may change in the future. 
- `includes` - Uses direct comparison (like `equal`) to check if the field includes the given value
- `greaterThan` - Use Javascript's greater than functionality (`>`) to compare the given value to the field
- `lessThan` -  Use Javascript's less than functionality (`<`) to compare the given value to the field

## Observable Queries
The `observableQuery` method can be used to return an observable version of your query which will update as required based on content being created, updates and deleted.
