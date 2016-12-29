var vorpal = require('vorpal')();
var select = require('./selection');
var util = require('./utilities');

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
            return select.project(volself)
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
            return select.task(volself, filter, sort)
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
            return select.action(volself, task)
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
