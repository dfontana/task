var vorpal = require('vorpal')();
var inq = require('inquirer');
var todoistAPI = require('./todoistAPI');
var formatter = require('./taskFormatter');
var colors = require('./taskColors');
var utils = require('./utilities');


var api = new todoistAPI();
var taskformatter = new formatter();
var taskcolor = new colors();
var util = new utils();

var alldata = {};

function startWaitingIndicator() {
    var frames = [' ', ' ', '…', '……', '………', '…………', '……………'];
    var i = 0;
    var intervalId = setInterval(function() {
        var frame = frames[i = ++i % frames.length];
        vorpal.ui.redraw('Hold on …' + frame);
    }, 250);
    return intervalId;
}

function stopWaitingIndicator(intervalId) {
    clearInterval(intervalId);
    vorpal.ui.redraw.done();
}

/** Returns id of selected project. */
let projectSelection = (volself) => {
    return new Promise((resolve, reject) => {
        var listProjectsIndicator = startWaitingIndicator();

        api.projects()
            .then((projects) => {
                stopWaitingIndicator(listProjectsIndicator);

                var projlist = [];

                for (var key in projects) {
                    var obj = {};
                    var name = '';
                    for (var i = 1; i < projects[key].indent; i++) {
                        name += ' ';
                    }
                    name += projects[key].name;
                    obj.name = taskcolor.colorizeProject[projects[key].color](name);
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

/** Returns the selected task */
let taskSelection = (volself, filter, sort) => {
    return new Promise((resolve, reject) => {
        var listTaskIndicator = startWaitingIndicator();

        api.tasks(filter)
            .then((tasks) => {
                stopWaitingIndicator(listTaskIndicator);

                var nodeWidth = process.stdout.columns || 80;
                var lineWidth = Math.floor(nodeWidth * 0.55);

                var tasklist = [];
                for (var key in tasks) {
                    var obj = {};
                    var content = taskformatter.parseContent(lineWidth,
                        tasks[key].content,
                        tasks[key].indent,
                        tasks[key].due_date_utc);
                    obj.name = taskcolor.priorityColor[tasks[key].priority](content);
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

/** Takes action on a given task */
function actionSelection(volself, task) {
    return new Promise((resolve, reject) => {
        //TODO fill in this endpoint
        resolve();
    });
}

vorpal
    .delimiter('Task:')
    .show();

vorpal
    .command('clear')
    .action(function(args, cb) {
        process.stdout.write("\u001B[2J\u001B[0;0f");
        cb();
    });

vorpal
    .command('list', 'Lists projects')
    .action(function(args, cb) {
        var volself = this;

        let displayProjects = () => {
            return projectSelection(volself)
                .then((project) => {
                    switch (project) {
                        case '.. Done':
                            cb();
                            break;
                        case 'Today':
                            displayTasks(filterToday, sortByTimeAndDay);
                            break;
                        case 'Next 7':
                            displayTasks(function(value) {
                                var diff = util.compareToNow(value.due_date_utc);
                                return diff < 7;
                            }, function(a, b) {
                                var Ams = Date.parse(a.value.due_date_utc);
                                var Bms = Date.parse(b.value.due_date_utc); 

                                if(Ams == Bms){
                                    return a.value.day_order > b.value.day_order;
                                }else{
                                    return Ams > Bms;
                                }
                            });
                            break;
                        default:
                            displayTasks(function(value) {
                                return value.project_id == project.id;
                            }, function(a, b) {
                                return a.value.item_order - b.value.item_order;
                            });
                    }
                })
                .catch((error) => {
                    //TODO resolve error from failure to obtain projects
                });
        };

        let displayTasks = (filter, sort) => {
            return taskSelection(volself, filter, sort)
                .then((task) => {
                    if (task == '.. Done') {
                        cb();
                    } else if (task == '.. Return to Project List') {
                        process.stdout.write("\u001B[2J\u001B[0;0f");
                        displayProjects();
                    } else {
                        displayActions(task);
                        cb();
                    }
                })
                .catch((error) => {
                    //TODO resolve error from failure to obtain tasks
                });
        };

        let displayActions = (task) => {
            return actionSelection(volself, task)
                .then(() => {
                    //TODO fill in this flow logic
                    cb();
                })
                .catch((error) => {
                    //TODO resolve error from failure to take action
                });
        };

        displayProjects();
    });
