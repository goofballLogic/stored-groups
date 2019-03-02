module.exports = function() {

    // thanks: https://gist.github.com/gordonbrander/2230317
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

};