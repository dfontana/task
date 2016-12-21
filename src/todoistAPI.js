function todoistAPI() {
    var request = require('request');
    var user = require('../.task.json');

    var entry = 'https://todoist.com/API/v7/sync';
    var sync_token = '*';
    var alldata = {};
   
    this.projects = function(dataProcessor, cb) {
        var payload = {
            url: entry,
            form: {
                token: user.token,
                sync_token: sync_token,
                resource_types: '["projects"]'
            }
        };   

        //TODO implement the sync difference API
        request.post(payload, function(err, httpResponse, body) {
            if (!err && httpResponse.statusCode == 200) {
                var parsed = JSON.parse(body);
                //sync_token = parsed.sync_token;
                alldata.projects = parsed.projects;
                dataProcessor(alldata.projects);
                cb();
            } else {
                console.log("[projects] ERR: " + httpResponse.statusCode + "\n\t" + err + "\n");
                cb();
            }
        });
    };
}

module.exports = todoistAPI;
