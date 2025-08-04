
Editors - read, write and display files
App/UI - provide functionality, UI etc (search, file explorer, history explorer etc)
Actions - expose actions a user can perform (search, rename/move, create etc)
Theme

workspace
views
blocks
modals, context menus
displays
actions
tabs
shelf
panels
nodes

workspace - is main area use opens content too
shelf - positioned over the workspace, is where menus/tools are accessed from
panel - item added to the workspace, can have children tabs (BETTER WORD LINKED TO PHYSICAL WORLD?: node, block, item)
tabs - opened within a panel



- think about mvc style (or at least mc & v) of app
- plugins could extend/implement a base class? seems best way of handling 

- editor/plugin is one global instance?
- plugin is global, but registers editors via inherited method?
- editors are global 