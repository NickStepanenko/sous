/**
 * Created by admin on 01.06.2015.
 */

module.exports = function parseContent(content) {
    var currentDiffData = content.split('diff --git ');

    for(i=0; i<currentDiffData.length; i++) {
        currentDiffData[i] = currentDiffData[i].split('\n');
    }

    var files = [];

    for(i=1; i<currentDiffData.length; i++) {
        var fileData = {};

        fileData.filename =
            currentDiffData[i][0].slice(currentDiffData[i][0].indexOf(' b/')+3, currentDiffData[i][0].length);

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

            if (!isHeader && !isDataLine && record && currentDiffData[i][j].indexOf('No newline at end of file') < 0) {
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
};