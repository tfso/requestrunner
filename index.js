var fs = require('fs');
var async = require('async');
var request = require('request');
var extend = require('extend');

var RequestRunner = function (configFile, options) {
    this.loadActions(configFile, options || 'utf8');
};

RequestRunner.prototype = {
    loadActions: function (configFile, options) {
        var config = JSON.parse(fs.readFileSync(configFile, options)),
            defaults = config.defaults;
        this.actions = config.actions.map((action)=> extend(true, {}, defaults, action));
    },
    run: function (options, callback) {
        var start = new Date();
        async.map(this.actions, this.runner.bind(this), (err, results)=> {
            var errors = results.filter((action) =>!!action.err),
                result = {actions: results, elapsedTime: new Date() - start, failedActionsCount: errors.length};
            if (options && !!options.asError)
                callback(errors.length ? errors : null, result);
            else
                callback(err, result);
        });
    },

    runner: function (action, callback) {
        var me = this,
            start = new Date();

        var doRequest = function (id, callback) {
            request({
                url: action.url,
                method: action.method,
                headers: action.headers,
                auth: action.auth,
                timeout: action.timeout
            }, callback);
        };
        if (!action.text)
            action.text = action.url;

        async.times(action.times || 1,
            (n, next) =>
                doRequest(n,
                    (err, res) => next(err, res)),
            (err, res) => me.actionCallback(err, res.pop(), new Date() - start, action, callback)
        );
    },

    actionCallback: function (err, res, elapsedTime, action, callback) {
        if (err) {
            callback(null, extend({}, action, {err: err}));
        } else {
            if (res.statusCode != action.expectStatusCode)
                err = new Error('expected status ' + action.expectStatusCode + ', got ' + res.statusCode);
            callback(null, extend({}, action, {err: err, res: res, elapsedTime: elapsedTime}));
        }
    }
};

function requestrunner(path, options) {
    return new RequestRunner(path, options);
}
requestrunner.RequestRunner = RequestRunner;
module.exports = requestrunner;
