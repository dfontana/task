var vorpal = require('vorpal')();
var select = require('./selection');
var util = require('./utilities');
var api = require('./todoistAPI');

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

        var displayProjects = () => {
            return select.project(volself)
                .then((project) => {
                    switch (project) {
                        case '.. Done':
                            cb();
                            break;
                        case 'Today':
                            displayTasks(function(value) {
                                var diff = util.compareToNow(value.due_date_utc);
                                return diff <= 0;
                            }, function(a, b) {
                                return util.sortByDate(a.value, b.value);
                            });
                            break;
                        case 'Next 7':
                            displayTasks(function(value) {
                                var diff = util.compareToNow(value.due_date_utc);
                                return diff < 7;
                            }, function(a, b) {
                                return util.sortByDate(a.value, b.value);
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
                    volself.log(vorpal.chalk.red('Error ' + error.status + ': ' + error.error));
                    cb();
                });
        };

        var displayTasks = (filter, sort) => {
            return select.task(volself, filter, sort)
                .then((task) => {
                    if (task == '.. Done') {
                        cb();
                    } else if (task == '.. Return to Project List') {
                        process.stdout.write("\u001B[2J\u001B[0;0f");
                        displayProjects();
                    } else {
                        displayActions(task, filter, sort);
                    }
                })
                .catch((error) => {
                    volself.log(vorpal.chalk.red('Error ' + error.status + ': ' + error.error));
                    cb();
                });
        };

        let displayActions = (task, filter, sort) => {
            return select.action(volself)
                .then((action) => {
                    switch (action) {
                        case -1:
                            return Promise.resolve(-1);
                        case 0:
                            return api.completeTask(task.id);
                        case 1:
                            return select.editTask(volself, task);
                        case 2:
                            return select.reorderTask(volself, task);
                        case 3:
                            return select.reindentTask(volself, task);
                        case 4:
                            return select.deleteTask(volself, task.id);
                    }
                })
                .then((resolve) => {
                    displayTasks(filter, sort);
                })
                .catch((error) => {
                    volself.log(vorpal.chalk.red('Error ' + error.status + ': ' + error.error));
                    cb();
                });
        };

        displayProjects();
    });

vorpal
    .command('create', 'Make a task')
    .action(function(args, cb) {
        var volself = this;

        select.addTask(volself)
            .then((answers) => {
                api.addTask(answers.project.project_id,
                        answers.date,
                        answers.priority,
                        null,
                        answers.content)
                    .then(function() {
                        volself.log(vorpal.chalk.green('Task added.'));
                        cb();
                    })
                    .catch((error) => {
                        volself.log(vorpal.chalk.red('ERROR: ' + error.status + ' - ' + error.error));
                        cb();
                    });
            }).catch((error) => {
                volself.log(vorpal.chalk.red('ERROR: ' + error.status + ' - ' + error.error));
                cb();
            });
    });
