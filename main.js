/**
 * Created by Nick on 17.05.2015.
 */

var fs = require('fs');
var cp = require('child_process');
var data = [];

var async = require('async');
    /*tasks = [
        function (callback) {
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
                        "content": 'Original'
                    };

                    listOfCommits[listOfCommits.length] = commit;
                }

                data = listOfCommits.reverse();

                callback(null, data);

                if (error !== null) {
                    console.log('stderr: ' + stderr);
                    console.log('exec error: ' + error);
                }
            });
        }
    ],
    secondTasks = [
        function some_function(callback) {
            cp.exec('git diff', function(error, stdout, stderr) {
                var currentContent = stdout;

                if (error !== null) {
                    console.log('stderr: ' + stderr);
                    console.log('exec error: ' + error);
                }

                callback(null, currentContent);
            });
        }
    ];*/

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

/*function pullCommitContent(first, second) {

    cp.exec('git diff' + ' ' + first + ' ' + second, function(error, stdout, stderr) {
        var currentContent = stdout;

        if (error !== null) {
            console.log('stderr: ' + stderr);
            console.log('exec error: ' + error);
        }

        return currentContent;
    });
}*/

var commitsInfo = [];

fs.exists('.git', function (exists) {
    if(exists) {
        /*async.series(tasks, function(err, result) {
            fs.writeFileSync("patches.sousp", JSON.stringify(result));

            var data = result[0];

            /*function some_function(arg1, arg2, callback) {
                cp.exec('git diff' + ' ' + arg1 + ' ' + arg2, function(error, stdout, stderr) {
                    var currentContent = 54321;//stdout;

                    if (error !== null) {
                        console.log('stderr: ' + stderr);
                        console.log('exec error: ' + error);
                    }

                    callback(null, currentContent);
                });
            }
        });*/

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
                            "content": 'Original'
                        };
                        listOfCommits[listOfCommits.length] = commit;
                    }

                    callback(null, listOfCommits.reverse());

                    if (error !== null) {
                        console.log('stderr: ' + stderr);
                        console.log('exec error: ' + error);
                    }
                });
            },
            function getCommitsContent(commits, callback) {
                console.log(commits);
                var commitsData = commits;

                for(i=1; i<commitsData.length; i++) {
                    cp.exec('git diff' + ' ' + commitsData[i-1].commit + ' ' + commitsData[i].commit, function(error, stdout, stderr) {
                        commitsData[i].content = stdout;

                        if (error !== null) {
                            console.log('stderr: ' + stderr);
                            console.log('exec error: ' + error);
                        }
                    });
                }

                callback(null, commitsData);
            }
        ], function (err, result) {
            fs.writeFileSync("patches.sousp", result);
        });

        //commitsInfo = JSON.parse(fs.readFileSync("patches.sousp"));
        //console.log(commitsInfo);
    }
});