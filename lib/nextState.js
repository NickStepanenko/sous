/**
 * Created by admin on 01.06.2015.
 */

module.exports = function nextState(commitNum, direction) {
    var data = fs.readFileSync('patches.json').toString();
    data = JSON.parse(data);
    var newState = {};

    for(i=0; i<data.commits.length; i++) {
        if(data.commits[i].commit == commitNum) {
            if(direction == "Next") {
                newState.commit = data.commits[i+1].commit;
                newState.author = data.commits[i+1].author;
                newState.date = data.commits[i+1].date;
                newState.comment = data.commits[i+1].comment;
                newState.content = data.commits[i+1].content;
            } else if(direction == "Back") {
                newState.commit = data.commits[i-1].commit;
                newState.author = data.commits[i-1].author;
                newState.date = data.commits[i-1].date;
                newState.comment = data.commits[i-1].comment;
                newState.content = data.commits[i-1].content;
            }
        }
    }

    return newState;
};