var todoistAPI = require('./todoistAPI');
var api = new todoistAPI();
var vorpal = require('vorpal')();
var inq = require('inquirer');

var alldata = {};

var colors = {
    0: vorpal.chalk.green,
    1: vorpal.chalk.red,
    2: vorpal.chalk.red,
    3: vorpal.chalk.yellow,
    4: vorpal.chalk.blue,
    5: vorpal.chalk.white,
    6: vorpal.chalk.magenta,
    7: vorpal.chalk.gray,
    8: vorpal.chalk.red,
    9: vorpal.chalk.yellow,
    10: vorpal.chalk.blue,
    11: vorpal.chalk.blue,
    12: vorpal.chalk.magenta,
    13: vorpal.chalk.red,
    14: vorpal.chalk.red,
    15: vorpal.chalk.green,
    16: vorpal.chalk.cyan,
    17: vorpal.chalk.cyan,
    18: vorpal.chalk.cyan,
    19: vorpal.chalk.cyan,
    20: vorpal.chalk.black,
    21: vorpal.chalk.gray
};

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

function projectSelection(volself, cb) {
    var listProjectsIndicator = startWaitingIndicator();
    api.projects(function(projects) {
        stopWaitingIndicator(listProjectsIndicator);

        var projlist = [];
        for (var key in projects) {
            var obj = {};
            var name = '';
            for (var i = 1; i < projects[key].indent; i++) {
                name += ' ';
            }
            name += projects[key].name;
            obj.name = colors[projects[key].color](name);
            obj.value = projects[key];
            obj.short = name;
            projlist.push(obj);

            volself.log(obj.value);
        }

        projlist.push(new inq.Separator());
        projlist.push('.. Cancel');
        projlist.push(new inq.Separator());


        volself.prompt({
            type: 'list',
            name: 'project',
            message: 'Select a project to view tasks',
            choices: projlist
        }, function(result) {
            if (result.project == '.. Cancel') {
                process.stdout.write("\u001B[2J\u001B[0;0f"); //clear output
                cb();
            } else {
                taskSelection(volself, result.project.id, cb);
            }
        });
    });
}

function taskSelection(volself, projid, cb) {
    var listTaskIndicator = startWaitingIndicator();
    api.tasks(projid, function(tasks) {
        stopWaitingIndicator(listTaskIndicator);

        var tasklist = [];
        for (var key in tasks) {
            var obj = {};
            obj.name = tasks[key].content;
            obj.value = tasks[key];
            obj.short = tasks[key].content;
            tasklist.push(obj);
        }

        tasklist.push(new inq.Separator());
        tasklist.push('.. Return to Project List');
        tasklist.push('.. Cancel');
        tasklist.push(new inq.Separator());

        volself.prompt({
            type: 'list',
            name: 'task',
            message: 'Select a task to perform an action',
            choices: tasklist
        }, function(result) {
            if (result.task == '.. Return to Project List') {
                projectSelection(volself, cb);
            } else if (result.task == '.. Cancel') {
                process.stdout.write("\u001B[2J\u001B[0;0f"); //clear output
                cb();
            } else {
                //TODO act on selected task
                volself.log('Hit endpoint\n');
                cb();
            }
        });

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
        projectSelection(volself, cb);
    });
