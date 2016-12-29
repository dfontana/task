function todoistAPI() {
    var request = require('request');
    var user = require('../.task.json');

    var entry = 'https://todoist.com/API/v7/sync';
    var sync_token = '*';
    var alldata = {};

    /**
     * Obtains project list from Todoist, afterwhich passing it to the given dataProcessor callback.
     * @param dataProcessor - callback that handles the finalized data set
     */
    this.projects = () => {
        return new Promise((resolve, reject) => {
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
                    resolve(alldata.projects);
                } else {
                    reject({
                        "status": httpResponse.statusCode,
                        "error": err
                    });
                }
            });
        });
    };

    /**
     * Returns all tasks, or optionally just the tasks of the given filter.
     * @param filter - filter function. [optional]
     * @param dataProcessor - callback that processes the final task data set 
     */
    this.tasks = (filter) => {
        return new Promise((resolve, reject) => {
            var payload = {
                url: entry,
                form: {
                    token: user.token,
                    sync_token: sync_token,
                    resource_types: '["items"]'
                }
            };

            //TODO implement the sync difference API
            request.post(payload, function(err, httpResponse, body) {
                if (!err && httpResponse.statusCode == 200) {
                    var parsed = JSON.parse(body);
                    //sync_token = parsed.sync_token;
                    alldata.items = parsed.items;
                    if (filter) {
                        var filteredItems = alldata.items.filter(filter);
                        resolve(filteredItems);
                    } else {
                        resolve(alldata.items);
                    }
                } else {
                    reject({
                        "status": httpResponse.statusCode,
                        "error": err
                    });
                }
            });
        });
    };
}

module.exports = todoistAPI;
