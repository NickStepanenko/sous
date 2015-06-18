#!/usr/bin/env node

/**
 * Created by Nick on 17.05.2015.
 */

var fs = require('fs');
var fsextra = require('node-fs-extra');
var cp = require('child_process');
var async = require('async');

var findComments = require('../lib/findComments');
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
                    var commitNumbers = findData(stdout, "commit");
                    var comments = findComments(stdout);
                    var commit = {};

                    for(i=0; i<authors.length; i++) {
                        commit = {
                            "commit": commitNumbers[i],
                            "author": authors[i],
                            "date": dates[i],
                            "comment": comments[i],
                            "content": []
                        };
                        listOfCommits[listOfCommits.length] = commit;
                        commit = {};
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
            var dataObject = "var dataObject = { \n" +
                "\"name\": \"Commits Data\", \n" +
                "\"commits\": [\n";

            for(i=0; i<result.length; i++) {
                if(i != result.length-1) {
                    dataObject += JSON.stringify(result[i]) + ",\n";
                } else {
                    dataObject += JSON.stringify(result[i]) + "\n";
                }
            }

            dataObject += "] };";
            fs.mkdir(process.cwd() + '/sous', function(err) { });

            fsextra.copy(__dirname + '/src', process.cwd() + '/sous/src', function (err) {
                if (err) {
                    console.error(err);
                }
            });

            fs.readFile(__dirname + '/index.html', function (err, data) {
                fs.writeFileSync(process.cwd() + "/sous/sous_patches.json", dataObject);
                fs.writeFileSync(process.cwd() + "/sous/sous_presentation.html", data.toString());
            });
        });
    } else {
        console.error(
            "Directory .git did not found at " + process.cwd()
        );
    }
});
