# Exposed Fields
Data in Localful is encrypted at rest and split between an entity and version table, which
makes for some challenges when trying to query the data.  

The encrypted data can't be queried via indexes and can't be decrypted
on-the-fly while iterating over a cursor, because decryption is an async operation
and you can't do none-IndexDB async operations during a transaction.  
This means that without additional functionality, the only way to query data would be to
load everything into memory - either all at once or in chunks - and then query it there.
This is not a very performant solution, especially once your dealing with a significant amount of data.

In order to facilitate more performant queries that utilise native IndexDB features, Localful
implements a feature called "exposed fields" which allows select data fields to be added directly to the
local entity (not the version) ⚠️ **unencrypted** ⚠️. This allows those fields to be indexed
by IndexDB and included in cursor-level filters, before all the data needs to be decrypted
in memory.

Exposed fields can be one of two types, `indexed` or `plain`. Indexed fields are used to create an IndexDB index and `plain`
fields are simply saved unencrypted.

## Query Stages
Localful queries have three stages, which happen in the following order:

**1. Index Selection**  
By default, Localful will use the built-in `isDeleted` index to load all data that isn't deleted.  
It is possible to specify that one of the exposed fields indexes should be used instead, and define what query should be used too.

This is the most important stage of the query, as it has the ability to dramatically reduce the data that needs
to be iterated over and processed.

**2. Cursor-level Query**  
Once an index and query is selected, a cursor is opened and iterated over.
While iterating over this cursor it is possible to run logic against the exposed fields saved to each entity,
which means that an initial round of filtering can be run before having to fetch and decrypt the actual version data.

**3. Data Query**  
Once an initial set of results are found using index and cursor-level querying, data-level queries can be run if required.  
The initial set of results are split into chunks, which allows for version data to be loaded in batches
to balance the amount of data loaded into memory at a given time, with the performance impact of loading
data from IndexDB in lots of separate transactions.  

If a page size is defined for the query and there is no custom ordering applied, 
then once the page size is reached data can start being returned before all batches are complete, 
which helps speed up the end user experience.
