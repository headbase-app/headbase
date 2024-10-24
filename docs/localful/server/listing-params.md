# Listing Query Parameters
All API endpoints which return a list of data (such as `/users [GET]`, `/items [GET]` etc) support the same methods
for filtering, ordering and pagination.

## Formatting
All query parameters use the same formatting for objects and arrays, which can be defined by using `[key]` and `[0]` for
array indexes.  
For example `parameter[level1][level2][0]=test` would result in the JSON object:

```json5
{
  "parameter": {
    "level1": {
      "level2": ['test']
    }
  }
}
```

This documentation includes examples using query parameters, JSON objects and an SQL-like pseudocode.  
When constructing queries on a client, it's recommended to define them using JSON and convert them 
to query parameters using a library like [qs](https://www.npmjs.com/package/qs).

## Filtering
All filtering is done via the `filter` query parameter where you can define conditions and can then group these conditions using and/or if required.

### Conditions
A condition is a single statement that the data must meet to be included in the results.  
The data format of a filter condition is as follows:

```json5
{
  "filter": {
    "field": {
      "operator": "value"
    },
  },
}
```
```
filter[field][operator]=value
```

Where `field` is a field of the resource being queried, `value` is the data to filter against and `operator` is the type of condition.

#### Fields
There is no guarantee that you will be able to filter and sort using all fields of a resource.  
The fields available will depend on the implementation of that resource, and the operators available will then depend
on the data type of that field.

#### Operators
The available operators for filter conditions are as follows: 

| Operator         | Description              |
|------------------|--------------------------|
| `$equal`         | Equal to                 |
| `$not_equal`     | Not equal to             |
| `$in`            | Includes                 |
| `$not_in`        | Doesn't include          |
| `$starts`        | Starts with              |
| `$ends`          | Ends with                |
| `$not_starts`    | Doesn't start with       |
| `$not_ends`      | Doesn't end with         |
| `$less`          | Less than                |
| `$less_equal`    | Less than or equal to    |
| `$greater`       | Greater than             |
| `$greater_equal` | Greater than or equal to |

#### Values
The `value` of a condition could either be a value (of the matching type) or a list of values if using the `$in` or `$not_in` operators.  
The available operators will depend on the data type of the field in the condition, for example:

| Data Type | Available operators                                                                            |
|-----------|------------------------------------------------------------------------------------------------|
| boolean   | `$equal`, `$not_equal`                                                                         |
| string    | `$equal`, `$not_equal`, `$in`, `$not_in`, `$starts`, `$ends`, `$not_starts`, `$not_ends`       |
| number    | `$equal`, `$not_equal`, `$in`, `$not_in`, `$less`, `$less_equal`, `$greater`, `$greater_equal` |
| timestamp | `$equal`, `$not_equal`, `$in`, `$not_in`, `$less`, `$less_equal`, `$greater`, `$greater_equal` |
| uuid      | `$equal`, `$not_equal`, `$in`, `$not_in`                                                       |
| enum      | `$equal`, `$not_equal`, `$in`, `$not_in`                                                       |

#### Combining conditions
Conditions defined at the same level will be logically combined using "and", for example:

```json5
{
  "filter": {
    "name": {
      "$in": "testing",
      "$not_equal": "testing2"
    }
  },
}
```
```
filter[name][$in]=testing&filter[name][$not_equal]=testing2
```
```
WHERE "testing" in name AND name != "testing2"  
```

### Groups
Basic filtering can be done by just adding conditions, however if you wish to add multiple conditions for a field
using the same operator or add custom and/or logic then you can achieve this using groups.

Groups are defined by using either `$and` or `$or` which can then contain an array of conditions and other nested groups, for example:

```json5
{
  "$or": [
    {"name": {"$equal": "testing"}},
    {"name": {"$equal": "testing2"}}
  ],
}
```
```
filter[$or][0][name][$equal]=testing&filter[$or][1][name][$equal]=testing2
```

Note that specific server instances and resources may choose to limit the number of conditions and nesting level
allowed in a request to protect the server from overly expensive and complex queries.

## Ordering
Ordering is defined via the `order` query parameter by defining `order[field]=direction` for example:

```json5
{
  "order": {
    "field": "direction",
  }
}
```
```
order[createdAt]=asc
```

The direction can either be `asc` or `desc`.  
There can only be one order defined at a time, so a query including `order[createdAt]=asc&order[updatedAt]=desc` would be rejected.

## Pagination
Pagination is defined via the `page` query parameter by defining `page[offset]` and `page[limit]`, for example:

```json5
{
  "page": {
    "offset": 6,
    "limit": 20
  }
}
```
```
page[limit]=20&page[offset]=6
```

The response of all queries includes metadata which provides clients with details about their current pagination
state and the total number of available results, which can then be used to infer if more results are available.

Here is an example of metadata in a query response:
```json5
{
  "meta": {
    "results": 6,
    "total": 42,
    "limit": 6,
    "offset": 18
  },
  "data": [
    // a list of results
  ]
}
```

## Example Query
Here is an example of a complex query demonstrating how the query params and the JSON formatted representation work.

```
WHERE (name = "testing" OR name = "testing2" OR ("the answer" in description AND "42" in description)) AND status = "published"
ORDER BY updatedAt DESC
LIMIT 6 OFFSET 18
```
```json5
{
  "page": {
    "limit": 6,
    "offset": 18,
  },
  "order": {
    "updatedAt": "desc"
  },
  "filter": {
    "$or": [
      {"name": {"$equal": "testing"}},
      {"name": {"$equal": "testing2"}},
      {"$and": [
        {"description":  {"$in": "the answer"}},
        {"description":  {"$in": "42"}}
      ]}
    ],
    "$and": [
      {"status": {"$equal": "published"}}
    ]
  },
}
```
```
filter[$or][0][name][$equal]=testing&filter[$or][1][name][$equal]=testing2
&filter[$or][2][$and][0][description][in]=wtf&filter[$or][2][$and][1][description][in]=42
&filter[$and][0][status][$equal]=published
$page[limit]=6&page[offset]=18&order[updatedAt]=desc
```
