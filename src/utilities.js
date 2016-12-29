function utilities() {
    this.compareToNow = function(dateString) {
        var nowutc = new Date();
        var offset = nowutc.getTimezoneOffset() * 60 * 1000; //timezone diff in ms

        var due = new Date(Date.parse(dateString) - offset);
        var now = new Date(nowutc.getTime() - offset);

        //Compare differences in days since Epoch. 
        return Math.trunc(due.getTime() / 86400000) - Math.trunc(now.getTime() / 86400000);
    };
}

module.exports = utilities;
