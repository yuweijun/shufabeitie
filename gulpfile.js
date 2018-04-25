var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

var scripts = ['public/angularjs/js/app.js', 'public/angularjs/authors/authors.js', 'public/angularjs/home/home.js', 'public/angularjs/faties/faties.js', 'public/angularjs/search/search.js', 'public/angularjs/show/show.js'];
gulp.task('scripts', function() {
    return gulp.src(scripts)
        .pipe(uglify())
        .pipe(concat('all.min.js'))
        .pipe(gulp.dest('public/angularjs/js/'));
});
// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(scripts, ['scripts']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'scripts']);