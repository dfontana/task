# Task
## The Todoist command line interface.

Welcome to task, a simple Node.JS command line interface for Todoist. Task aims to be two things: simple and quick - and not in just the performance sense of the term. The goal is to easily add and complete tasks for todoist from the CLI, which I came to desire after repeatedly needing to tab out of my work just to view or complete my tasks. 

Task is built using the Vorpal.JS library, which takes advantage of other Javascript libraries such as Inquierer.js and Chalk. I also take advantage of Requests to interact with the Todoist API.

## What's Left?
- [x] List Projects
  - [x] Navigate in and out of projects
  - [x] Colorize output based on project color
- [x] List tasks within a selected project
  - [ ] Indent sub-tasks like Projects are handled.
  - [x] Colorize output based on priority
  - [ ] Mark tasks completed
  - [ ] Edit tasks (due date, content, project)
    - [ ] (Later) Implement label usage and display
- [ ] List tasks for next 7 days, today (include overdue)
  - [ ] Implement prompt to 'list' command, asking which view. Alternatively add command line parameter to specify view.
- [ ] Create a new task
  - [ ] Set project
  - [ ] Set content
  - [ ] Set due date
  - [ ] Set labels (later)
- [ ] Manage View
  - [ ] Projects
    - [ ] Add
    - [ ] Delete
    - [ ] (Later) Edit Name, Color?
    - [ ] Labels (later: list, edit, add, delete)
- [ ] Correct coloring schema to be terminal independent (also fix your personal terminal color scheme at this step...)

