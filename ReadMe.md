# Task
## The Todoist command line interface.

Welcome to task, a simple Node.JS command line interface for Todoist. Task aims to be two things: simple and quick - and not in just the performance sense of the term. The goal is to easily add and complete tasks for todoist from the CLI, which I came to desire after repeatedly needing to tab out of my work just to view or complete my tasks. 

Task is built using the Vorpal.JS library, which takes advantage of other Javascript libraries such as Inquierer.js and Chalk. I also take advantage of Requests to interact with the Todoist API.

## Setup
1. Clone this repo
2. Run an `npm install`
3. Define the file `.task.json`. Inside is a simple JSON object with your TodoistAPI token. Here's a made up example:
```JSON
{
  "token": "sjdhfurhflksjdlfjsdfsdjhg23"
}
```
4. Now you should be able to run `node src/main.js`
5. For a list of commands you can run, type `help` after starting the application

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
  - [ ] Change indent of task
  - [x] Delete a task
  - [x] Colorize the action list (green: complete, yellow: edit, magenta: change order, red: delete);
- [x] Create a new task
  - [x] Set project, content, due date / time
  - [x] Validate content
  - [x] Colorize priority selection
  - [ ] DEFECT: All tasks get added to Inbox, reguardless of selection
  - [ ] Confirm task before creation by displaying what they inputted and doing y/N. If N, cancel.

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
   
