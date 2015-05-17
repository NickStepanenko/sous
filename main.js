/**
 * Created by Nick on 16.03.2015.
 */

var fs = require('fs');

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

fs.exists('../.git', function (exists) {
    if(exists) {
        var cp = require('child_process');

        cp.exec('git diff', function(error, stdout, stderr) {
            console.log(stdout);

            //fs.writeFileSync("patches.sousp", stdout);

            if (error !== null) {
                console.log('stderr: ' + stderr);
                console.log('exec error: ' + error);
            }
        });

        cp.exec('git log', function(error, stdout, stderr) {
            //console.log(stdout);

            var authors = findData(stdout, "Author:");
            var dates = findData(stdout, "Date:");
            var comments = findComments(stdout);
            //console.log(authors);
            //console.log(comments);
            //console.log(dates);

            //fs.writeFileSync("comments.sousc", stdout);

            if (error !== null) {
                console.log('stderr: ' + stderr);
                console.log('exec error: ' + error);
            }
        });
    }
    else console.log("Error.");
});