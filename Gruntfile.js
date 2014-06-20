module.exports = function (grunt) {
    'use strict';
    // Project configuration.
    grunt.initConfig({
        sync: {
            main: {
                files:[{
                    src: [
                        'C:\\Users\\goyalvik\\wmcm_moe\\moe-app\\src\\main\\resources\\**\\*.*',
                        '!C:\\Users\\goyalvik\\wmcm_moe\\moe-app\\src\\main\\resources\\coverage\\**',
                        '!C:\\Users\\goyalvik\\wmcm_moe\\moe-app\\src\\main\\resources\\buildinfo.txt'
                    ],
                    dest: ''
                }, {
                    src: ['C:\\Users\\goyalvik\\wmcm_moe\\moe-app\\src\\test\\**\\*.*'],
                    dest: ''
                }],
                verbose: true
            }
        },
        watch: {
            options: {
                livereload: false,
                atBegin: true,
                debounceDelay: 100
            },
            less: {
                files: [
                    'C:\\Users\\goyalvik\\wmcm_moe\\moe-app\\src\\main\\resources\\assets\\style\\css\\threed.css',
                    'C:\\Users\\goyalvik\\wmcm_moe\\moe-app\\src\\main\\resources\\application\\shared\\core\\extensions\\templates.js',
                    'C:\\Users\\goyalvik\\wmcm_moe\\moe-app\\src\\main\\resources\\application\\shared\\core\\extensions\\handlebars-templates.js'
                ],
                tasks: ['sync']
            }
        }
    });

    function execGitCommand(command, cwd, callback) {
        var ps = grunt.util.spawn({
            cmd  : 'git',
            args : command,
            opts : {
                cwd : cwd
            }
        }, callback);

        ps.stdout.on('data', function (data) {
            grunt.log.write(data);
        });

        ps.stderr.on('data', function (data) {
            grunt.log.write(data);
        });
    }

    grunt.loadNpmTasks('grunt-sync');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-gitinfo');

    grunt.registerTask('saveGitVersion', function () {
        var done = this.async(),
            versionFilePath = './gitversion.txt';

        execGitCommand(["rev-parse","--abbrev-ref","HEAD"], '../wmcm_moe', function (err, result) {
            if (err) {
                grunt.log.error("Error occurred while trying to get current git branch");
            } else {
                if (!grunt.file.exists(versionFilePath) || grunt.file.read(versionFilePath) !== result.stdout) {
                    grunt.file.write(versionFilePath, result.stdout);
                    grunt.config('branchName', result.stdout);
                    grunt.task.run('cleanRemote');
                } else {
                    grunt.task.run('sync');
                }
                grunt.log.write('Current git branch name is: ' + result.stdout);
            }
            done();
        });
    });
    grunt.registerTask('cleanRemote', function () {
        var done = this.async(),
            branchName = grunt.config.get('branchName'),
            async = require('async'),
            commands = [
                ["clean", "-ffdx"],
                ["reset", "--hard", "HEAD"],
                ["checkout", "-f",  branchName],
                ["pull", "fork", branchName]
            ];
        async.eachSeries(commands, function (command, callback) {
            grunt.log.writeln('*-----------------------------*');
            grunt.log.writeln('executing: git ' + command.toString().replace(/,/g, ' '));
            execGitCommand(command, 'Z:\\wmcm_moe\\moe-app', callback);
        }, function () {
            grunt.task.run('sync');
            done();
        });
    });
    grunt.registerTask('remoteSync', function () {
        grunt.task.run('saveGitVersion');
    });
    grunt.registerTask('default', 'remoteSync');
};
