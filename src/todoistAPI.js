function todoistAPI(){
    var request = require('request');
    var user    = require('../.task.json');

    var entry   = 'https://todoist.com/API/v7/sync';

    this.printdata = function() {
        var alldata = {
            url: entry, 
            form: {
                token: user.token,
                sync_token: '*',
                resource_types: '["all"]'
            }
        };  

        request.post(alldata, function(err, httpResponse, body){
                if(err){
                    console.log(err);
                }else{
                    console.log('\n\n===== HTTP ====\n'+httpResponse);
                    console.log('\n\n===== BODY ====\n'+body);
                }
            }
        );
    };
}

module.exports = todoistAPI;
