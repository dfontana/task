var util = require('./utilities');

var Formatter = module.exports;

var numToDay = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
};

/** Returns 15 characters worth of date. 
 * If the date is empty, then it's 15 spaces. */
var parseDate = function(dateString) {
    if (dateString === null) {
        return ' '.repeat(15);
    }

    var due = new Date(Date.parse(dateString));
    var diff = util.compareToNow(dateString); 
    var time = due.toTimeString().substring(0,5);
    if (due.getHours() == 23 && due.getMinutes() == 59 && due.getSeconds() == 59) {
        time = ''; //Allday Task
    }

    switch (diff) {
        case 0:
            var today = 'Today' + ' ' + time;
            today += ' '.repeat(15-today.length);
            return today;
        case 1:
            var tomorrow = 'Tomorrow' + ' ' + time;
            tomorrow += ' '.repeat(15-tomorrow.length);
            return tomorrow;
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
            var longstr = numToDay[due.getDay()];
            longstr += ' '+time;
            longstr += ' '.repeat(15 - longstr.length);
            return longstr;
        default:
            if (diff < 0) {
                //Overdue
                return 'Overdue' + ' '.repeat(8);
            }
            var abvstr = numToDay[due.getDay()].substring(0, 3);
            abvstr += ' ' + due.getDate();
            abvstr += ' ' + time;
            abvstr += ' '.repeat(15 - abvstr.length);
            return abvstr;
    }
};

/** Returns contentWidth characters worth of content.
 * Runs the given UTC format date string through the date parser, to append to the end of the content string.
 * Then determines content:
 *      If content is <= contentWidth, pads the content with spaces until it is equal to contentWidth.
 *      If content is > contentWidth, it is truncated and an ellipse is added. 
 * The parsed date is then appended to the end before returning.
 */
Formatter.parseContent = function(lineWidth, rawContent, indent, rawDate) {
    var date = '     ' + parseDate(rawDate);
    var contentWidth = lineWidth - date.length - indent;
    var content = '';
    content += ' '.repeat(indent);
    if (rawContent.length <= contentWidth) {
        content += rawContent;
        content += ' '.repeat(contentWidth - rawContent.length);
    } else {
        content += rawContent.substring(0, (contentWidth - 4)) + '... ';
    }
    content += date;
    return content;
};

/** Generates a sorted, indented, colorized list of projects.
 * Given a data object containing all the projects from the api module.
 */
Formatter.projectList = (projects) => {
    return new Promise((resolve, reject) => {
        var projlist = [];
        for (var key in projects) {
            var obj = {};
            var name = '';
            for (var i = 1; i < projects[key].indent; i++) {
                name += ' ';
            }
            name += projects[key].name;
            obj.name = colorizer.project[projects[key].color](name);
            obj.value = projects[key];
            obj.short = name;
            projlist.push(obj);
        }

        projlist.sort(function(a, b) {
            return a.value.item_order - b.value.item_order;
        });
        resolve(projlist);
    });
};
