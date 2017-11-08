var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var gulpIf      = require('gulp-if');
var reload      = browserSync.reload;
var email       = require('gulp-mail');
var smtpInfo = {
  host: 'osmtp.utsa.edu',
  secureConnection: false,
  port: 25
};

var src = {
  html: "app/*.html"
};

gulp.task('email', function () {
  return gulp.src('./app/report-simple.txt')
    .pipe(email({
      subject: 'We are UTSA! - TESTING',
      to: [
        'john.garza@utsa.edu'
      ],
      from: 'WebTeam <webteam@utsa.edu>',
      smtp: smtpInfo
    }));
});

gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: './app',
        }
    });
    gulp.watch(src.html, reload);
    gulp.watch(src.js, reload);
});

gulp.task('default', ['serve']);
