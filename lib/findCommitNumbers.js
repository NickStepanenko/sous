/**
 * Created by admin on 01.06.2015.
 */

module.exports = function findCommitNumbers(text) {
    var commits = [];
    var splittext = text.split('\n');
    var count = 0;

    while(count < splittext.length) {
        if(splittext[count].slice(0, 6) == "commit") {
            commits[commits.length] = splittext[count].slice(6).trim();
        }
        count++;
    }

    return commits;
};