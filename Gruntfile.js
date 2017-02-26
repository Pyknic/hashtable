module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        'closure-compiler': {
            hastable: {
                closurePath  : '/home/pyknic/closure_compiler',
                js           : 'src/hashtable.js',
                jsOutputFile : 'dist/hashtable.min.js',
                maxBuffer    : 500,
                files : {
                    'dist/hashtable.min.js': ['src/**/*.js']
                },
                options      : {
                    manage_closure_dependencies : true,
                    compilation_level : 'ADVANCED_OPTIMIZATIONS',
                    language_in       : 'ECMASCRIPT6_STRICT',
                    create_source_map : 'dist/hashtable.min.js.map',
                    output_wrapper    : '(function(){\n%output%\n}).call(this)\n//# sourceMappingURL=hashtable.min.js.map'
                }
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-closure-compiler');
};