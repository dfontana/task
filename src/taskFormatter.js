/**
 * Check the due_date_utc, if null there is no due date
 * Convert due_date_utc to current time zone
 * Check if day is before today, if so set date to Overdue
 * Check if day is today, if so set it to today
 * Check if day is tomorrow, set it to tomorrow
 * Compute Date difference to determine if it is within the week:
 *      Make two date objects, if year is given then specify that over the current year
 *      Subtract the results of .getTime() (Math.abs() to make it unsigned)
 *      divide by (1000*3600*24) to convert from milliseconds to days
 *  If diff > 7, the format is "3LetterMonth Day"
 *  If diff <= 7, replace the "3LetterMonth Day" with just the day: Thursay, Friday...
 *  Return the parsed date string
 **/
function tasktime() {
    var numToDay = {
        0: 'Sunday',
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday'
    };

    //aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa     111111111111111

    /**
     * Returns 15 characters worth of date. If the date is empty, then it's 15 spaces.
     */
    this.parseDate = function(dateString) {
        if (dateString === null) {
            return ' '.repeat(15);
        }

        var nowutc = new Date();
        var offset = nowutc.getTimezoneOffset() * 60 * 1000; //timezone diff in ms

        var due = new Date(Date.parse(dateString) - offset);
        var now = new Date(nowutc.getTime() - offset);

        //Compare differences in days since Epoch.
        var diff = Math.trunc(due.getTime() / 86400000) - Math.trunc(now.getTime() / 86400000);
        switch (diff) {
            case 0:
                return 'Today' + ' '.repeat(10);
            case 1:
                return 'Tomorrow' + ' '.repeat(7);
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
                var longstr = numToDay[due.getDay()];
                longstr += ' '.repeat(15 - longstr.length);
                return longstr;
            default:
                if (diff < 0) {
                    //Overdue
                    return 'Overdue' + ' '.repeat(8);
                }
                var abvstr = numToDay[due.getDay()].substring(0, 3);
                abvstr += ' ' + due.getDate();
                abvstr += ' '.repeat(15 - abvstr.length);
                return abvstr;
        }
    };


    /**
     * Returns 50 characters worth of content. If content is longer than 50, truncates to 47 and adds ellipse.
     */
    this.parseContent = function(contentString, dateString) {
        var content = '';
        if (contentString.length < 50) {
            content += contentString;
            content += ' '.repeat(50 - contentString.length);
            content += '     ' + dateString;
        } else if (contentString.length == 50) {
            content = contentString.slice(0);
            content += '     ' + dateString;
        } else {
            var words = contentString.split(' ');
            for (var i = 0; i < words.length; i++) {
                if (words[i].length >= 50) {
                    words[i] = words[i].substring(0, 46) + '... ';
                } else {
                    words[i] = words[i] + ' ';
                }
            }

            var firstLine = true;
            var lineSize = 0;
            var currentWord = 0;
            while (currentWord != words.length) {
                if (lineSize + words[currentWord].length > 50) {
                    content += ' '.repeat(50 - lineSize);

                    //line done.
                    if (firstLine) {
                        content += ('     ' + dateString + '\n    ');
                    } else {
                        content += '\n    ';
                    }
                    firstLine = false;
                    lineSize = 2;
                } else {
                    //add word
                    lineSize += words[currentWord].length;
                    content += words[currentWord++];
                }
            }
        }
        return content;
    };
}

module.exports = tasktime;