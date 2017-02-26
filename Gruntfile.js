module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        'closure-compiler': {
            security: {
                closurePath  : '/home/pyknic/closure_compiler',
                js           : 'src/hashtable.js',
                jsOutputFile : 'dist/hashtable.min.js',
                maxBuffer    : 500,
                options      : {
                    compilation_level : 'ADVANCED_OPTIMIZATIONS',
                    language_in       : 'ECMASCRIPT6_STRICT'
                }
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-closure-compiler');
};
