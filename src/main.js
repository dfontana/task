var todoistAPI = require('./todoistAPI');
var api = new todoistAPI();
var vorpal = require('vorpal')();
var inq = require('inquirer');

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
            for(var i = 1; i < projects[key].indent; i++){
                name += ' ';
            }
            name += projects[key].name;
            obj.name = name;
            obj.value = projects[key];
            obj.short = name;
            projlist.push(obj);
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
            var selectedProject = result.project;

            volself.log(selectedProject);

            if (selectedProject == '.. Cancel') {
                cb();
            } else {
                taskSelection(volself, selectedProject.id, cb);
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
            tasklist.push(key);
        }
        tasklist.push('.. Return to Project List');
        tasklist.push('.. Cancel');

        volself.prompt({
            type: 'rawlist',
            name: 'task',
            message: 'Select a task to perform an action',
            choices: tasklist
        }, function(result) {
            if (result.task == '.. Return to Project List') {
                projectSelection();
            } else if (result.task == '.. Cancel') {
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
