const gulp = require('gulp');

gulp.task('default', () => {
  gulp.src('src/publish/publicEntities/*')
    .pipe(gulp.dest('dist'));
});
