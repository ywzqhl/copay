'use strict';

angular.module('copayApp.services')
  .factory('localStorageService', function(platformInfo, $timeout) {
    var isNW = platformInfo.isNW;
    var isChromeApp = platformInfo.isChromeApp;
    var root = {};
    var ls = ((typeof window.localStorage !== "undefined") ? window.localStorage : null);

    if (isChromeApp && !isNW && !ls) {
      ls = chrome.storage.local;
    }

    if (!ls)
      throw new Error('localstorage not available');

    root.get = function(k, cb) {
      if (isChromeApp && !isNW) {
        chrome.storage.local.get(k,
          function(data) {
            //TODO check for errors
            return cb(null, data[k]);
          });
      } else {
        return cb(null, ls.getItem(k));
      }
    };

    /**
     * Same as setItem, but fails if an item already exists
     */
    root.create = function(name, value, callback) {
      root.get(name,
        function(err, data) {
          if (data) {
            return callback('EEXISTS');
          } else {
            return root.set(name, value, callback);
          }
        });
    };

    root.set = function(k, v, cb) {
      if (isChromeApp && !isNW) {
        var obj = {};
        obj[k] = v;

        chrome.storage.local.set(obj, cb);
      } else {
        ls.setItem(k, v);
        return cb();
      }

    };

    root.remove = function(k, cb) {
      if (isChromeApp && !isNW) {
        chrome.storage.local.remove(k, cb);
      } else {
        ls.removeItem(k);
        return cb();
      }

    };

    return root;
  });
