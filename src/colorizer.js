var vorpal = require('vorpal')();

Colorizer = module.exports;

Colorizer.project = {
    0: vorpal.chalk.green,
    1: vorpal.chalk.red,
    2: vorpal.chalk.red,
    3: vorpal.chalk.yellow,
    4: vorpal.chalk.blue,
    5: vorpal.chalk.white,
    6: vorpal.chalk.magenta,
    7: vorpal.chalk.gray,
    8: vorpal.chalk.red,
    9: vorpal.chalk.yellow,
    10: vorpal.chalk.blue,
    11: vorpal.chalk.blue,
    12: vorpal.chalk.magenta,
    13: vorpal.chalk.red,
    14: vorpal.chalk.red,
    15: vorpal.chalk.green,
    16: vorpal.chalk.cyan,
    17: vorpal.chalk.cyan,
    18: vorpal.chalk.cyan,
    19: vorpal.chalk.cyan,
    20: vorpal.chalk.black,
    21: vorpal.chalk.gray
};

Colorizer.priority = {
    4: vorpal.chalk.red,
    3: vorpal.chalk.green,
    2: vorpal.chalk.magenta,
    1: vorpal.chalk.blue
};
