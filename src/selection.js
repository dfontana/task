var Selections = module.exports;
var inq = require('inquirer');
var api = require('./todoistAPI');
var format = require('./formatter');
var colorizer = require('./colorizer');
var util = require('./utilities');


var promptUser = (volself, options, defaultOption, message, returnFunction) => {
    return new Promise((resolve, reject) => {
        volself.prompt({
            type: 'list',
            name: 'selected',
            message: message,
            default: defaultOption,
            choices: options
        }, returnFunction);
    });
};

//============================== LIST OPTIONS =================================
/** Returns selected project by user.
 * Obtains projects via API call.
 * Pads the list with additional options
 * Prompts the user.
 * Returns selected option.
 */
Selections.project = (volself) => {
    return new Promise((resolve, reject) => {
        var listProjectsIndicator = util.startWaitingIndicator();

        api.projects()
            .then((projects) => {
                util.stopWaitingIndicator(listProjectsIndicator);
                return format.projectList(projects);
            }).then((projlist) => {
                projlist = ['Today','Next 7', new inq.Separator()]
                            .concat(projlist)
                            .concat([new inq.Separator(), '.. Done', new inq.Separator()]);

                return promptUser(volself,projlist, projlist[0], 'Select a project to view tasks', function(result) {
                    resolve(result.selected);
                });
            })
            .catch((error) => {
                reject(error);
            });
    });
};

/** Returns selected task by user.
 * Obtains tasks via API call, based on the given filter.
 * Adds additional options (navigation for user)
 * Formats the task list (content, priority, colors).
 * Prompts user.
 * Returns selected option.
 */
Selections.task = (volself, filter, sort) => {
    return new Promise((resolve, reject) => {
        var listTaskIndicator = util.startWaitingIndicator();

        api.tasks(filter)
            .then((tasks) => {
                util.stopWaitingIndicator(listTaskIndicator);
                var pushThese = [new inq.Separator(), '.. Return to Project List', '.. Done', new inq.Separator()];
                return format.taskList(tasks, sort, null, pushThese);
            })
            .then((tasklist) => {
                return promptUser(volself,tasklist, tasklist[1], 'Select a task to perform an action', function(result) {
                    resolve(result.selected);
                });    
            })
            .catch((error) => {
                reject(error);
            });
    });
};

/** Returns the selected action by user.
 * Marking complete, editing, reordering, indenting, and deleting are supported.
 * - Completing marks a task as complete, which removes it from the list.
 * - Editing changes task composition - project, due date, content
 * - Reordering changes the position of a task.
 * - Indenting changes the indentation of a task, making it a subtask.
 * - Deleting confirms before deletion.
 */
Selections.action = (volself) => {
    return new Promise((resolve, reject) => {
        var actionlist = [{
            name: colorizer.action.complete("Mark Complete"),
            value: 0,
            short: colorizer.action.complete("Mark Complete")
        }, {
            name: colorizer.action.edit("Edit Task"),
            value: 1,
            short: colorizer.action.edit("Edit Task")
        }, {
            name: colorizer.action.reorder("Reorder"),
            value: 2,
            short: colorizer.action.reorder("Reorder")
        }, {
            name: colorizer.action.reindent("Set indentation"),
            value: 3,
            short: colorizer.action.reindent("Set indentation")
        }, {
            name: colorizer.action.del("Delete Task"),
            value: 4,
            short: colorizer.action.del("Delete Task")
        }, new inq.Separator(),{
            name: '..Done',
            value: -1,
            short: '.. Done'
        }, new inq.Separator()];
        
        return promptUser(volself,actionlist, actionlist[0], 'Select an action to perform on this task', function(result) {
            resolve(result.selected);
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
                return ((input.trim() === '') ? false : true);
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

        return promptUser(volself,priolist, priolist[3], 'Task Priority:', function(result) {
            hash.priority = result.selected;
            resolve(hash);
        });
    });
};

var obtainProject = (volself, hash) => {
    return new Promise((resolve, reject) => {
        api.projects()
            .then((projects) => {
                return format.projectList(projects);
            }).then((projlist) => {
                projlist.push(new inq.Separator());
                
                return promptUser(volself,projlist, projlist[1], 'Select a project to put task in', function(result) {
                    hash.project = result.selected;
                    resolve(hash);
                });
            })
            .catch((error) => {
                reject(error);
            });
    });
};

/** Controls flow for adding a task, returns task content
 * The hash is passed between promises and built upon as the user answers
 * each prompt, ultimately resulting in all the content for the new task stored
 * in a siungular object to be given to the api.
 */
Selections.taskContent = (volself) => {
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

//============================== DELETE TASK ==================================
/** Deletes a task, with confirmation.
 * Confirms with a yes or no prompt, which with permission, then deletes the task.
 */
Selections.deleteTask = (volself, taskID) => {
    return new Promise((resolve, reject) => {
        volself.prompt({
            type: 'confirm',
            name: 'del',
            message: 'Are you sure you want to delete this task?',
            default: false
        }, function(result) {
            if (result.del) {
                return api.deleteTask(taskID);
            }
        }).then(() => {
            resolve();
        })
        .catch((error) => {
            reject(error);
        });
    });
};

//============================== REORDER TASK =================================
//Prompts user for ordering
var obtainNewOrder = (volself, task) => {
    return new Promise((resolve, reject) => {
        var listTaskIndicator = util.startWaitingIndicator();

        var filter = function(value) {
            return value.project_id == task.project_id && value.id != task.id;
        };

        var sort = function(a, b) {
            return a.value.item_order - b.value.item_order;
        };

        var globalTasks;
        api.tasks(filter)
            .then((tasks) => {
                util.stopWaitingIndicator(listTaskIndicator);
                globalTasks = tasks;
                var unshiftThese = [{
                    name: '<First Item>',
                    value: {
                        item_order: 0
                    },
                    short: '<First Item>'
                }];
                return format.taskList(tasks, sort, unshiftThese, null);
            })
            .then((tasklist) => {
                return promptUser(volself,tasklist, tasklist[0], 'Move task after which task?', function(result) {
                    resolve({
                        tasks: globalTasks,
                        newOrder: result.selected.item_order
                    });
                });
            })
            .catch((error) => {
                reject(error);
            });
    });
};

/** Generates a normalized ordering of tasks based on the new order (position) of the task being updated.
 * @param  tasks        entire list of tasks being normalized, except the task being updated
 * @param  taskToUpdate task object that is being updated
 * @param  newOrder     new position of the task being updated.
 */
var updateOrders = (tasks, taskToUpdate, newOrder) => {
    return new Promise((resolve, reject) => {
        //Correct Off by one when moving items lower
        if (taskToUpdate.item_order < newOrder) {
            newOrder -= 1;
        }

        //Sort the tasks
        tasks.sort(function(a, b) {
            return a.item_order - b.item_order;
        });

        //Insert updated task
        if (newOrder <= 0) {
            tasks.unshift(taskToUpdate);
        } else {
            tasks.splice(newOrder, 0, taskToUpdate);
        }

        //Normalize the orders
        for (var i = 0; i < tasks.length; i++) {
            tasks[i].item_order = i + 1;
        }

        //Generate api object
        var taskOrders = {};
        tasks.forEach((item) => {
            var ary = [];
            ary.push(item.item_order);
            ary.push(item.indent);
            taskOrders[item.id] = ary;
        });
        
        resolve(taskOrders);
    });
};

/** Reorders the selected task to the selected position within a project.
 * Prompts the user for where to place the task.
 * Regenerates the project's task ordering.
 * Calls the api with the new orders, updating all of them.
 */
Selections.reorderTask = (volself, task) => {
    return new Promise((resolve, reject) => {
        obtainNewOrder(volself, task)
            .then((orderBundle) => {
                return updateOrders(orderBundle.tasks, task, orderBundle.newOrder);
            })
            .then((taskOrders) => {
                api.updateItemOrders(taskOrders);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

//============================== MAKE SUBTASK =================================
/** Updates indentation of a task.
 * Prompts user for amount (none, once, twice, three times). 
 * Calls API to update the task's indent value with number between 1 & 4.
 */
var getIndentLevel = (volself) => {
    return new Promise((resolve, reject) => {
        var options = [{
            name: 'None',
            value: 1,
            short: 'None'
        }, {
            name: 'Once',
            value: 2,
            short: 'Once'
        }, {
            name: 'Twice',
            value: 3,
            short: 'Twice'
        }, {
            name: 'Three times',
            value: 4,
            short: 'Three times'
        }];

        return promptUser(volself,options, options[0], 'Indent how much?', function(result) {
            resolve(result.selected);
        });
    });
};

Selections.updateIndent = (volself, task) => {
    return new Promise((resolve, reject) => {
        getIndentLevel(volself)
            .then((indentLevel) => {
                api.setIndentLevel(task.id, indentLevel);
                resolve();
            })
            .catch((error) => {
                reject(error);
            });
    });
};

//============================== EDIT TASK ====================================
/** Changes task's content, due date, and project.
 * Default prompt values are the current task's values.
 */
Selections.editTask = (volself, task) => {
    return new Promise((resolve, reject) => {

    });
};
