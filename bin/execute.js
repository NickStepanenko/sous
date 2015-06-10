#!/usr/bin/env node

/**
 * Created by Nick on 17.05.2015.
 */

var fs = require('fs');
var cp = require('child_process');
var async = require('async');
var findComments = require('../lib/findComments');
var findCommitNumbers = require('../lib/findCommitNumbers');
var findData = require('../lib/findData');
var parseContent = require('../lib/parseContent');

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
                var count = 1;

                while(count < commitsData.length) {
                    commitsData[count].content = parseContent(cp.execSync(
                        'git diff' + ' ' + commitsData[count-1].commit + ' ' + commitsData[count].commit
                    ).toString('utf8'));

                    count++;
                }

                callback(null, commitsData);
            }
        ], function (err, result) {
            var data = [];

            for(i=0; i<result.length; i++) {
                data[i] = JSON.stringify(result[i]);
            }

            var dataObject = "var data = { \"name\": \"Commits Data\", \"commits\": [" + data + "] };";

            fs.readFile(__dirname + '/indexHeader.html', function (err, data1) {
                fs.readFile(__dirname + '/indexFooter.html', function (err, data2) {
                    fs.writeFileSync(process.cwd() + "/index.html", data1.toString() + dataObject + data2.toString());
                });
            });
        });
    } else {
        console.error("Directory .git did not found at " + process.cwd());
    }
});
