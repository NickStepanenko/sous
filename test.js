/**
 * Created by Nick on 18.05.2015.
 */
var async = require('async')
    , tasksIndex = [
        function (callback) {
            // Вымышленный метод который вернет 231
            var viewsNumber = models.stat.viewsNumber();
            callback(null, viewsNumber);
        }
        , function (callback) {
            // Вымышленный метод который вернет 24
            var growFactor = models.stat.growFactor();
            callback(null, growFactor);
        }
    ];

async.series(tasksIndex, function (err, results) {
    // Результат будет массивом
    console.log(results); // [231, 24]
});