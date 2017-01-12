var Selections = module.exports;
var inq = require('inquirer');
var api = require('./todoistAPI');
var formatter = require('./formatter');
var colorizer = require('./colorizer');
var util = require('./utilities');


//============================== LIST OPTIONS =================================
/** Generates a sorted, indented, colorized list of projects.
 * Given a data object containing all the projects from the api module.
 */
var formatProjects = (projects) => {
    return new Promise((resolve, reject) => {
        var projlist = [];
        for (var key in projects) {
            var obj = {};
            var name = '';
            for (var i = 1; i < projects[key].indent; i++) {
                name += ' ';
            }
            name += projects[key].name;
            obj.name = colorizer.project[projects[key].color](name);
            obj.value = projects[key];
            obj.short = name;
            projlist.push(obj);
        }

        projlist.sort(function(a, b) {
            return a.value.item_order - b.value.item_order;
        });
        resolve(projlist);
    });
};

/** Returns selected project by user.
 * Obtains projects via API call.
 * Colorizes projects.
 * Inserts additional options.
 * Prompts user.
 * Returns selected option (as an object).
 */
Selections.project = (volself) => {
    return new Promise((resolve, reject) => {
        var listProjectsIndicator = util.startWaitingIndicator();

        api.projects()
            .then((projects) => {
                util.stopWaitingIndicator(listProjectsIndicator);
                return formatProjects(projects);
            }).then((projlist) => {
                projlist.unshift(new inq.Separator());
                projlist.unshift('Next 7');
                projlist.unshift('Today');
                projlist.push(new inq.Separator());
                projlist.push('.. Done');
                projlist.push(new inq.Separator());

                volself.prompt({
                    type: 'list',
                    name: 'project',
                    message: 'Select a project to view tasks',
                    default: projlist[1],
                    choices: projlist
                }, function(result) {
                    return resolve(result.project);
                });

            })
            .catch((error) => {
                reject(error);
            });
    });
};

/** Returns selected task by user.
 * Obtains tasks via API call, based on the given filter.
 * Colorizes tasks by priority.
 * Sorts tasks by the given filter (think date, project order, etc)
 * Adds additional options (navigation for user)
 * Prompts user.
 * Returns selected option (as an object).
 */
Selections.task = (volself, filter, sort) => {
    return new Promise((resolve, reject) => {
        var listTaskIndicator = util.startWaitingIndicator();

        api.tasks(filter)
            .then((tasks) => {
                util.stopWaitingIndicator(listTaskIndicator);

                var nodeWidth = process.stdout.columns || 80;
                var lineWidth = Math.floor(nodeWidth * 0.55);

                var tasklist = [];
                for (var key in tasks) {
                    var obj = {};
                    var content = formatter.parseContent(lineWidth,
                        tasks[key].content,
                        tasks[key].indent,
                        tasks[key].due_date_utc);
                    obj.name = colorizer.priority[tasks[key].priority](content);
                    obj.value = tasks[key];
                    obj.short = tasks[key].content;
                    tasklist.push(obj);
                }

                tasklist.sort(sort);

                tasklist.push(new inq.Separator());
                tasklist.push('.. Return to Project List');
                tasklist.push('.. Done');
                tasklist.push(new inq.Separator());

                volself.prompt({
                    type: 'list',
                    name: 'task',
                    message: 'Select a task to perform an action',
                    choices: tasklist
                }, function(result) {
                    return resolve(result.task);
                });
            })
            .catch((error) => {
                reject(error);
            });
    });
};

/** Returns the selected action by user.
 * Marking complete, editing, moving, and deleting are supporting.
 * - Editing changes task composition - project, due date, content
 * - Moving changing order and indentation (prompt to move up/down one, right/left one)
 * - Deleting confirms before deletion.
 */
Selections.action = (volself) => {
    return new Promise((resolve, reject) => {
        var actionlist = [{
            name: colorizer.action.complete("Mark Complete"),
            value: 0,
            short: colorizer.action.complete("Complete")
        },{
            name: colorizer.action.edit("Edit Task"),
            value: 1,
            short: colorizer.action.edit("Edit")
        },{
            name: colorizer.action.reorder("Move/Indent"),
            value: 2,
            short: colorizer.action.reorder("Move/Indent")
        }, {
            name: colorizer.action.del("Delete Task"),
            value: 3,
            short: colorizer.action.del("Delete")
        }];        

        actionlist.push(new inq.Separator());
        actionlist.push({
            name: '..Done',
            value: -1,
            short: '.. Done'
        });
        actionlist.push(new inq.Separator());

        volself.prompt({
            type: 'list',
            name: 'action',
            message: 'Select an action to perform on this task',
            choices: actionlist
        }, function(result) {
            return resolve(result.action);
        });
    });
};

/** Confirms task deletion.
 * Prompts user for yes no, when deleting a task is the selected action.
 * Then performs their requested operation.
 */
Selections.deleteTask = (volself, taskID) => {
    return new Promise((resolve, reject) => {
        volself.prompt({
            type: 'confirm',
            name: 'del',
            message: 'Are you sure you want to delete this task?',
            default: false
        }, function(result) {
            if(result.del){
                api.deleteTask(taskID)
                    .then((result) =>{
                        return resolve();
                    })
                    .catch((error) => {
                        return reject(error);
                    });
            }else{
                return resolve();
            }
        });
    });
};

//============================== ADD TASK =====================================
var obtainContent = (volself, hash) => {
    return new Promise((resolve, reject) => {
        volself.prompt({
            type: 'input',
            name: 'content',
            message: 'Task Content: ',
            validate: function(input) {
                if (input.trim() === '') {
                    return false;
                }
                return true;
            }
        }, function(result) {
            hash.content = result.content;
            resolve(hash);
        });
    });
};

var obtainDate = (volself, hash) => {
    return new Promise((resolve, reject) => {
        volself.prompt({
            type: 'input',
            name: 'date',
            message: 'Task Due (Enter to skip): '
        }, function(result) {
            hash.date = result.date;
            resolve(hash);
        });
    });
};

var obtainPriority = (volself, hash) => {
    return new Promise((resolve, reject) => {
        var priolist = [{
            name: colorizer.priority[4]('High'),
            value: 4,
            short: 'High'
        }, {
            name: colorizer.priority[3]('Medium'),
            value: 3,
            short: 'Medium'
        }, {
            name: colorizer.priority[2]('Low'),
            value: 2,
            short: 'Low'
        }, {
            name: colorizer.priority[1]('None'),
            value: 1,
            short: 'None'
        }];

        volself.prompt({
                type: 'list',
                name: 'priority',
                message: 'Task Priority:',
                default: priolist[3],
                choices: priolist
            },
            function(result) {
                hash.priority = result.priority;
                resolve(hash);
            });
    });
};

var obtainProject = (volself, hash) => {
    return new Promise((resolve, reject) => {
        api.projects()
            .then((projects) => {
                return formatProjects(projects);
            }).then((projlist) => {
                projlist.push(new inq.Separator());
                volself.prompt({
                    type: 'list',
                    name: 'project',
                    message: 'Select a project to put task in',
                    default: projlist[1],
                    choices: projlist
                }, function(result) {
                    hash.project = result.project;
                    resolve(hash);
                });
            })
            .catch((error) => {
                reject(error);
            });
    });
};

Selections.addTask = (volself) => {
    return new Promise((resolve, reject) => {
        var hash = {};
        obtainContent(volself, hash)
            .then((contentHash) => {
                return obtainDate(volself, contentHash);
            }).then((dateHash) => {
                return obtainPriority(volself, dateHash);
            }).then((priorityHash) => {
                return obtainProject(volself, priorityHash);
            }).then((finalHash) => {
                resolve(finalHash);
            }).catch((error) => {
                reject(error);
            });
    });
};

//============================== TASK ACTIONS =================================

