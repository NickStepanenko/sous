/**
 * Created by admin on 01.06.2015.
 */

module.exports = function findComments(text) {
    var comments = [];
    var splittext = text.split('\n\n');

    var count = 1;
    while(count < splittext.length) {
        comments.push(splittext[count].trim());
        count+=2;
    }

    return comments;
};