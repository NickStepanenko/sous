/**
 * Created by admin on 01.06.2015.
 */

module.exports = function findData(text, keyword) {
    var data = [];
    var splittext = text.split('\n');

    var count = 0;
    while(count < splittext.length) {
        if(splittext[count].indexOf(keyword) > -1) {
            data.push(splittext[count].slice(keyword.length+1).trim());
        }
        count++;
    }

    return data;
};