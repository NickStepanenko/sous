#!/usr/bin/env node

/**
 * Created by Nick on 17.05.2015.
 */

var fs = require('fs');
var cp = require('child_process');

var async = require('async');

function nextState(commitNum, direction) {
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
}

function findData(text, keyword) {
    var data = [];
    var splittext = text.split('\n');

    for(i=0; i<splittext.length; i++) {
        if(splittext[i].indexOf(keyword) > -1) {
            data[data.length] = splittext[i].slice(keyword.length+1).trim();
        }
    }

    return data;
}

function findComments(text) {
    var comments = [];
    var splittext = text.split('\n\n');

    for(i=1; i<splittext.length; i+=2) {
        comments[comments.length] = splittext[i].trim();
    }

    return comments;
}

function findCommitNumbers(text) {
    var commits = [];
    var splittext = text.split('\n');

    for(i=0; i<splittext.length; i++) {
        if(splittext[i].slice(0, 6) == "commit") {
            commits[commits.length] = splittext[i].slice(6).trim();
        }
    }

    return commits;
}

function parseContent(content) {
    var currentDiffData = content.split('diff --git ');

    for(i=0; i<currentDiffData.length; i++) {
        currentDiffData[i] = currentDiffData[i].split('\n');
    }

    var files = [];

    for(i=1; i<currentDiffData.length; i++) {
        var fileData = {};

        fileData.filename = currentDiffData[i][0].slice(currentDiffData[i][0].indexOf('b/')+2, currentDiffData[i][0].length);

        if(currentDiffData[i][1].indexOf('deleted file mode') > -1) {
            fileData.status = "Deleted";
        } else
        if (currentDiffData[i][1].indexOf('new file mode') > -1) {
            fileData.status = "Created";
        } else {
            fileData.status = "Modified";
        }

        var changes = [];

        var isHeader = true;
        var isDataLine = false;
        var record = false;
        var localChanges = {};
        var changesCode = "";

        for(j=1; j<currentDiffData[i].length; j++) {
            if(currentDiffData[i][j].indexOf('@@') == 0 && isHeader) {
                localChanges.changesStartLine = currentDiffData[i][j].slice(4, currentDiffData[i][j].indexOf(','));
                isHeader = false;
                isDataLine = true;
                record = true;
            } else
            if(currentDiffData[i][j].indexOf('@@') == 0 && record) {
                localChanges.changesCode = changesCode;
                changes[changes.length] = localChanges;

                localChanges = {};
                changesCode = "";
                localChanges.changesStartLine = currentDiffData[i][j].slice(4, currentDiffData[i][j].indexOf(','));
                isDataLine = true;
            } else {
                isDataLine = false;
            }

            if (!isHeader && !isDataLine && record) {
                changesCode += currentDiffData[i][j] + '\n';
            }

            if(j == currentDiffData[i].length-1) {
                localChanges.changesCode = changesCode;
                changes[changes.length] = localChanges;
            }
        }

        fileData.changes = changes;
        files[files.length] = fileData;
    }

    return files;
}



fs.exists(process.cwd() + '/.git', function (exists) {
    if(exists) {
        async.waterfall([
            function getCommitsInfo(callback) {
                cp.exec('git log', function(error, stdout, stderr) {
                    var listOfCommits = [];
                    var authors = findData(stdout, "Author:");
                    var dates = findData(stdout, "Date:");
                    var comments = findComments(stdout);
                    var commitNumbers = findCommitNumbers(stdout);

                    for(i=0; i<authors.length; i++) {
                        var commit = {
                            "commit": commitNumbers[i],
                            "author": authors[i],
                            "date": dates[i],
                            "comment": comments[i],
                            "content": []
                        };
                        listOfCommits[listOfCommits.length] = commit;
                    }

                    var commitsData = listOfCommits.reverse();

                    callback(null, commitsData);

                    if (error !== null) {
                        console.log('stderr: ' + stderr);
                        console.log('exec error: ' + error);
                    }
                });
            },
            function getCommitsContent(commits, callback) {
                var commitsData = commits;

                for(i=1; i<commitsData.length; i++) {
                    commitsData[i].content =
                        parseContent(cp.execSync(
                            'git diff' + ' ' + commitsData[i-1].commit + ' ' + commitsData[i].commit
                        ).toString('utf8'));
                }

                callback(null, commitsData);
            }
        ], function (err, result) {
            var data = [];

            for(i=0; i<result.length; i++) {
                data[i] = JSON.stringify(result[i]);
            }

            jsonHeader = "{ \"name\": \"Commits Data\", \"commits\": [";
            jsonFooter = "] }";

            fs.writeFileSync(process.cwd() + "/patches.json", jsonHeader + data + jsonFooter);
        });
    } else {
        console.error("Directory .git did not found at " + process.cwd());
    }
});
