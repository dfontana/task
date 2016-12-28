# Task
## The Todoist command line interface.

Welcome to task, a simple Node.JS command line interface for Todoist. Task aims to be two things: simple and quick - and not in just the performance sense of the term. The goal is to easily add and complete tasks for todoist from the CLI, which I came to desire after repeatedly needing to tab out of my work just to view or complete my tasks. 

Task is built using the Vorpal.JS library, which takes advantage of other Javascript libraries such as Inquierer.js and Chalk. I also take advantage of Requests to interact with the Todoist API.

## What's Left?
### Commands
- [x] List
  - [x] Navigate in and out of projects
  - [x] Colorize output based on project color
  - [ ] Add options: Today, Next 7 (overdue bundled with each)
- [x] List tasks within a selected project
  - [x] Colorize output based on priority
  - [x] Indent sub-tasks like Projects are handled.
  - [ ] Take action on task: complete, edit(project, content, due, indent, order), delete, cancel.
- [ ] Create a new task
  - [ ] Set project
  - [ ] Set content
  - [ ] Set due date
- [ ] Manage
  - [ ] Projects (Create, edit (name, color, indent, order), delete, ..Go back)
- [ ] Correct coloring schema to be terminal independent (also fix your personal terminal color scheme at this step...)

### Stretch
- [ ] Optional params to 'list', jump straight to a view (ie. 'list 7days')
- [ ] Optional params to 'manage', jump straight to a view (ie. 'manage projects')
- [ ] Add an existing or new label when *editing* a task
- [ ] Add an existing or new label when *creating* a task
- [ ] Create, edit, or delete a label from the manage command
