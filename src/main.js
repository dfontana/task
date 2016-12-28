var vorpal = require('vorpal')();
var inq = require('inquirer');
var todoistAPI = require('./todoistAPI');
var formatter = require('./taskFormatter');
var colors = require('./taskColors');
var api = new todoistAPI();
var taskformatter = new formatter();
var taskcolor = new colors();

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
            obj.name = taskcolor.colorizeProject[projects[key].color](name);
            obj.value = projects[key];
            obj.short = name;
            projlist.push(obj);
        }

        projlist.sort(function(a, b) {
            return a.value.item_order - b.value.item_order;
        });

        projlist.push(new inq.Separator());
        projlist.push('.. Done');
        projlist.push(new inq.Separator());


        volself.prompt({
            type: 'list',
            name: 'project',
            message: 'Select a project to view tasks',
            choices: projlist
        }, function(result) {
            if (result.project == '.. Done') {
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

        tasklist.sort(function(a, b) {
            return a.value.item_order - b.value.item_order;
        });

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
            if (result.task == '.. Return to Project List') {
                projectSelection(volself, cb);
            } else if (result.task == '.. Done') {
                process.stdout.write("\u001B[2J\u001B[0;0f"); //clear output
                cb();
            } else {
                //TODO act on selected task
                //consider a bottom bar to lists available tasks
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
