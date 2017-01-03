var Selections = module.exports;
var inq = require('inquirer');
var api = require('./todoistAPI');
var formatter = require('./formatter');
var colorizer = require('./colorizer');
var util = require('./utilities');


//============================== LIST TASK ==================================
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

/** Takes action on a given task 
 * Edit, etc
 */
Selections.action = (volself, task) => {
    return new Promise((resolve, reject) => {
        //TODO fill in this endpoint
        resolve();
    });
};

//============================== ADD TASK ===================================
Selections.addTask = (volself) => {
    return new Promise((resolve, reject) => {
        var hash = {};

        volself.prompt({
            type: 'input',
            name: 'content',
            message: 'Task Content: ',

        }, function(result) {
            hash.content = result.content;
        }).then(function() {
            volself.prompt({
                type: 'input',
                name: 'date',
                message: 'Task Due (Enter to skip): '
            }, function(result) {
                hash.date = result.date;
            }).then(function() {
                volself.prompt({
                    type: 'list',
                    name: 'priority',
                    default: 'None',
                    message: 'Task Priority:',
                    choices: ['High', 'Medium', 'Low', 'None'],
                    filter: function(val) {
                        switch (val) {
                            case 'High':
                                return (4);
                            case 'Medium':
                                return (3);
                            case 'Low':
                                return (2);
                            default:
                                return (1);
                        }
                    }
                }, function(result) {
                    hash.priority = result.priority;
                }).then(function() {
                    api.projects()
                        .then((projects) => {

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


                            volself.prompt({
                                type: 'list',
                                name: 'project',
                                message: 'Select a project to put task in',
                                default: projlist[1],
                                choices: projlist
                            }, function(result) {
                                hash.project = result.project;
                            }).then(function() {
                                resolve(hash);
                            });
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            });
        });
    });
};
