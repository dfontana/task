var vorpal = require('vorpal')();

var Utilities = module.exports;

/** Starts a status indicator */
Utilities.startWaitingIndicator = function() {
    var frames = [' ', ' ', '…', '……', '………', '…………', '……………'];
    var i = 0;
    var intervalId = setInterval(function() {
        var frame = frames[i = ++i % frames.length];
        vorpal.ui.redraw('Hold on …' + frame);
    }, 250);
    return intervalId;
};

/** Used to stop the active status indicator */
Utilities.stopWaitingIndicator = function(intervalId) {
    clearInterval(intervalId);
    vorpal.ui.redraw.done();
};

/** Compares given date to current time;
 * Returns number of days the given event is from today. Can be negative if in the past.
 */
Utilities.compareToNow = function(dateString) {
    var nowutc = new Date();
    var offset = nowutc.getTimezoneOffset() * 60 * 1000; //timezone diff in ms

    var due = new Date(Date.parse(dateString) - offset);
    var now = new Date(nowutc.getTime() - offset);

    //Compare differences in days since Epoch. 
    return Math.trunc(due.getTime() / 86400000) - Math.trunc(now.getTime() / 86400000);
};

/** Sort function for tasks, by due date and day order.
 * Returns true if A comes after B.
 */
Utilities.sortByDate = function(taskA, taskB) {
    var Ams = Date.parse(taskA.due_date_utc);
    var Bms = Date.parse(taskB.due_date_utc);

    if (Ams == Bms) {
        return taskA.day_order > taskB.day_order;
    } else {
        return Ams > Bms;
    }

};
