const gulp = require('gulp');

gulp.task('default', () => {
  gulp.src('build/bundle.js')
    .pipe(gulp.dest('dist'));
  gulp.src('src/publish/publicEntities/*')
    .pipe(gulp.dest('dist'));
});
