# Document Database Specification - `v1`

## Terms
- **document**: A single "record" or "object" of data

## Concept
- All data is saved to a single `documents` table
- A document consists of the following data:
  - spec
  - type
  - id
  - versionId
  - previousVersionId
  - createdAt / createdBy
  - updatedAt / updatedBy
  - fields
  - blob
- The `type` may be application and/or user-defined
- Applications and/or users may decide to define a "slice" of documents they care about for a given device
- history/versions/ are tracked

## Implementation
- SQLite is used with two tables: `documents` and `history`.
- [JSON functions and operations](https://sqlite.org/json1.html) can be used to query documents based on contents of the `fields` field.
