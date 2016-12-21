var todoistAPI = require('./todoistAPI');
var api = new todoistAPI();
var vorpal = require('vorpal')();

var alldata = {};

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
        var callback = function(projects) {
            console.log(projects);
        };
        api.projects(callback, cb);
    });
