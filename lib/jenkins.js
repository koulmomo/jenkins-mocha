'use strict';

/*global __dirname, process, require, module */
var shell = require('shelljs'),
    path = require('path'),
    whichLocal = require('npm-which')(path.resolve(__dirname, '..')),
    whichCwd = require('npm-which')(process.cwd()),
    directories = {};

shell.config.fatal = true;

/**
 * Get the file location of this node_module binary
 * @method getBin
 * @param  {string} filename Bin you are looking for
 * @return {string}          Full path to the file
 */
function getBin(filename) {
    try {
        return whichLocal.sync(filename);
    } catch (unused) {
        return whichCwd.sync(filename);
    }
}

/**
 * Executes istanbul and mocha and sends all the output to the right location
 * @param  {Object} args Mocha arguments
 */
module.exports = function (args) {
    directories.artifacts = shell.env.ARTIFACTS_DIR || path.join(process.cwd(), 'artifacts');
    directories.coverage = shell.env.COVERAGE_DIR || path.join(directories.artifacts, 'coverage');
    directories.tests = shell.env.TEST_DIR || path.join(directories.artifacts, 'test');
    directories.base = path.join(__dirname, '..', 'node_modules');

    // Make sure directories exist
    Object.keys(directories).forEach(function (name) {
        shell.mkdir('-p', directories[name]);
    });

    // Set Xunit file
    shell.env.XUNIT_FILE = path.join(directories.tests, 'xunit.xml');

    if (args.indexOf('--no-colors') === -1) {
        args.unshift('--colors');
    }

    // Trigger istanbul and mocha
    shell.exit(shell.exec(
        getBin('istanbul') + ' cover --dir ' + directories.coverage + ' -- ' +
        getBin('_mocha') + ' --reporter ' + path.resolve(directories.base, 'spec-xunit-file') + ' ' +
        args.join(' ')
    ).code);
};
