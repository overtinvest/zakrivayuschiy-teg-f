import gulp from 'gulp';
import concat from 'gulp-concat-css';
import plumber from 'gulp-plumber';
import { deleteAsync } from 'del';
import browserSync from 'browser-sync';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import mediaquery from 'postcss-combine-media-query';
import cssnano from 'cssnano';
import htmlmin from 'gulp-htmlmin';
import replace from 'gulp-replace';

const browserSyncInstance = browserSync.create();

const htmlOptions = {
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  sortClassName: true,
  useShortDoctype: true,
  collapseWhitespace: true,
  minifyCSS: true,
  keepClosingSlash: true,
};

const cssLinkPattern =
  /<link\s+rel="stylesheet"\s+href="\.(?:\/styles|\/fonts)[^"]*\.css"\s*\/>\s*/g;

function serve() {
  browserSyncInstance.init({
    server: {
      baseDir: './dist',
    },
    port: 8091,
  });
}

function html() {
  let firstReplaced = false;
  return gulp
    .src('src/index.html')
    .pipe(plumber())
    .pipe(
      replace(cssLinkPattern, () => {
        if (!firstReplaced) {
          firstReplaced = true;
          return '<link rel="stylesheet" href="./bundle.css" />';
        }
        return '';
      })
    )
    .pipe(htmlmin(htmlOptions))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSyncInstance.reload({ stream: true }));
}

const cssSources = [
  'src/fonts/fonts.css',
  'src/styles/globals.css',
  'src/styles/variables.css',
  'src/styles/style.css',
  'src/styles/dark.css',
  'src/styles/light.css',
];

function css() {
  const plugins = [autoprefixer(), mediaquery(), cssnano()];
  return gulp
    .src(cssSources)
    .pipe(plumber())
    .pipe(concat('bundle.css'))
    .pipe(postcss(plugins))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSyncInstance.reload({ stream: true }));
}

function scripts() {
  return gulp
    .src('src/scripts/**/*.js', { encoding: false })
    .pipe(gulp.dest('dist/scripts'))
    .pipe(browserSyncInstance.reload({ stream: true }));
}

function fonts() {
  return gulp
    .src('src/fonts/**/*.woff', { encoding: false })
    .pipe(gulp.dest('dist/'))
    .pipe(browserSyncInstance.reload({ stream: true }));
}

function images() {
  return gulp
    .src('src/images/**/*.{jpg,png,svg,gif,ico,webp,avif}', {
      encoding: false,
    })
    .pipe(gulp.dest('dist/images'))
    .pipe(browserSyncInstance.reload({ stream: true }));
}

function clean() {
  return deleteAsync('dist');
}

function watchFiles() {
  gulp.watch('src/index.html', html);
  gulp.watch(cssSources, css);
  gulp.watch('src/scripts/**/*.js', scripts);
  gulp.watch('src/images/**/*.{jpg,png,svg,gif,ico,webp,avif}', images);
}

const build = gulp.series(
  clean,
  gulp.parallel(html, css, scripts, fonts, images)
);
const watchapp = gulp.parallel(build, watchFiles, serve);

export { html, css, scripts, fonts, images, clean, build, watchapp };
export default watchapp;
