# Task
## The Todoist command line interface.

Welcome to task, a simple Node.JS command line interface for Todoist. Task aims to be two things: simple and quick - and not in just the performance sense of the term. The goal is to easily add and complete tasks for todoist from the CLI, which I came to desire after repeatedly needing to tab out of my work just to view or complete my tasks. 

Task is built using the Vorpal.JS library, which takes advantage of other Javascript libraries such as Inquierer.js and Chalk. I also take advantage of Requests to interact with the Todoist API.

## What's Left?
### Commands
- [x] List
  - [x] Navigate in and out of projects
  - [x] Colorize output based on project color
  - [x] Add options: Today, Next 7 (overdue bundled with each)
  - [x] Display time, not just day. If time is not 11:59, need to list as well. (Wed 02:15pm vs Wednesday vs Wed 15)
- [x] List tasks within a selected project
  - [x] Colorize output based on priority
  - [x] Indent sub-tasks like Projects are handled.
- [ ] Take action on task: 
  - [x] Complete a task
  - [ ] Edit a task (project, content, due) (Will need to use item-move if project diff)
  - [x] Change order of tasks 
  - [x] Change indent of task
  - [x] Delete a task
  - [x] Colorize the action list (green: complete, yellow: edit, magenta: change order, red: delete);
- [x] Create a new task
  - [x] Set project, content, due date / time
  - [x] Validate content
  - [x] Colorize priority selection
  - [ ] Confirm task before creation by displaying what they inputted and doing y/N. If N, cancel.

### Defects
- [ ] After adjusting indentation, tasks are displayed before the server finishes updating the indentation
- [ ] The first item in a list can have it's indentation set (whereas the web client does not allow this)
- [ ] Error not handled properly on internet loss (crashes)
- [ ] Reordering a task with subtasks does not move the whole group.

### Refactoring Goals
- [ ] Reduce number of times you establish prompt content and call volself.prompt
- [ ] Reduce duplication inside the API

### Stretch
- [ ] Manage
  - [ ] Projects (Create, edit (name, color, indent, order), delete, ..Go back)
- [ ] Correct project coloring schema to be terminal independent (also fix personal terminal colors at this step...)
- [ ] Optional params to 'list', jump straight to a view (ie. 'list 7days')
- [ ] Create: add ability to parse args into a new task, instead of prompting each field
- [ ] Labels:
  - [ ] Optional params to 'manage', jump straight to a view (ie. 'manage projects')
  - [ ] Create, edit, or delete a label from the manage command
  - [ ] Add an existing or new label when *editing* a task
  - [ ] Add an existing or new label when *creating* a task
   
