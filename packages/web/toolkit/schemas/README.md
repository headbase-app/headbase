
## Data Structure
Tag Data
- name
- variant

Content Type Data
- Basic Data
  - name
  - description
  - icon?
  - colour?
- Content Template
  - contentNameTemplate
  - contentDescriptionTemplate
  - fields (list of ids)

Field Data
- type
- displaySettings
- validationSettings

Content Data
- name
- description
- tags (list of ids)
- fields (list of field storage data)
  - id
  - type
  - value

- Content stores field data, but uses the field id to link back to the actual field for display and validation settings
- Saving the field type allows for fallback behaviour if the actual field can't be found

View Data
- Basic Data
  - name
  - description
  - colour?
- filters
  - content types (list of ids, AND)
  - tags (list of ids, OR)
  - query
  - custom fields
- type
- settings


# Load Tag
- Load tag from `tags` table
- Load latest tag version from `tags_version` table

# Load Tags
- Load all tags from `tags` table
- For each tag, load latest version from `tags_versions` table

# Load Content
- Load content from `content` table
- Load latest content version from `content_versions` table
- Load fields
  - Load content type fields from `fields` table
  - Load latest field version from `fields_versions` table
  - Load latest content field from `content_fields_versions`

# Load View AND View Content
- Load view from `views` table
- Load latest view version from `views_versions` table
- Load all content from `content` table WHERE `contentTypeId` matches one of the types defined in the `view data`
- Load content:
  - Load latest content version from `content_versions`
  - Load content type fields from `fields` table WHERE `fieldId` matches a field to display/filter in the `view data`
  - Load latest field version from `fields_versions` table
  - Load latest content field from `content_fields_versions`
- Filter and sort the content given the criteria in the `view data`

# Save Entity
- Load entity from `entity` table
- Load latest entity version from `entity_versions` table