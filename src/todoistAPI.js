var request = require('request');
var user = require('../.task.json');
var uuid = require('uuid');

var TodoistAPI = module.exports;

var entry = 'https://todoist.com/API/v7/sync';
var sync_token = '*';
var alldata = {};

/** Obtains project list from Todoist.
 * That is, all projects from Todoist in their detailed object format 
 * (see todoist api on 'projects').
 */
TodoistAPI.projects = () => {
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

/** Returns all tasks, or optionally just the tasks of the given filter.
 * @param filter - filter function to apply when determining which tasks
 * to return. Default is no filter, all tasks. [optional] 
 */
TodoistAPI.tasks = (filter) => {
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

/** Adds a task with the given parameters.
 * Only supports adding to a project, a due date, a priority, and labels.
 * Indent and order specific components are part of the editTask function.
 * @param project_id    [Optional] ID of project to add to or defaults to inbox if omitted.
 * @param date_string   [Optional] Date of the task, in todoist's free form text.
 * @param priority      [Optional] 4 through 1, 4 is highest.
 * @param labels        [Optional] An array of label ids to apply to the task
 * @param content       [Required] the content of the task.
 *
 * To omit any optional fields, pass null in its place.
 *
 * The object returned from the server will have an object with:
 *      temp_id_mapping: an object which maps temp_id's to actual ids (not yet needed)
 *      sync_status:     'ok' if all is well, or an error object w/ error_code and error
 */
TodoistAPI.addTask = (project_id, date_string, priority, labels, content) => {
    return new Promise((resolve, reject) => {
        var task_uuid = uuid.v1();
        var temp_id = uuid.v1();
        var payload = {
            url: entry,
            form: {
                token: user.token,
                commands: JSON.stringify([{
                    "type": "item_add",
                    "temp_id": temp_id,
                    "uuid": task_uuid,
                    "args": {
                        "project_id": project_id,
                        "date_string": date_string,
                        "priority": priority,
                        "labels": labels,
                        "content": content
                    }
                }]),

            }
        };

        request.post(payload, function(err, httpResponse, body) {
            if (!err && httpResponse.statusCode == 200) {
                var parsed = JSON.parse(body);

                if (parsed.sync_status[task_uuid] != 'ok') {
                    reject({
                        "status": parsed.sync_status[task_uuid].error_code,
                        "error": parsed.sync_status[task_uuid].error
                    });
                } else {
                    resolve();
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

/** Marks the given task completed.
 * Consumes a task id, marking it complete, and writing to server.
 */
TodoistAPI.completeTask = (taskID) => {
    return new Promise((resolve, reject) => {
        var task_uuid = uuid.v1();
        var payload = {
            url: entry,
            form: {
                token: user.token,
                commands: JSON.stringify([{
                    "type": "item_close",
                    "uuid": task_uuid,
                    "args": {
                        "id": taskID,
                    }
                }]),

            }
        };

        request.post(payload, function(err, httpResponse, body) {
            if (!err && httpResponse.statusCode == 200) {
                var parsed = JSON.parse(body);

                if (parsed.sync_status[task_uuid] != 'ok') {
                    reject({
                        "status": parsed.sync_status[task_uuid].error_code,
                        "error": parsed.sync_status[task_uuid].error
                    });
                } else {
                    resolve();
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
