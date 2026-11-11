// Runs inline at the end of <body>. Images marked data-fade sit on a placeholder colour (see base.css)
// and fade in once they have loaded.
(() => {
  const done = (img) => img.setAttribute('data-loaded', '');
  document.querySelectorAll('img[data-fade]').forEach((img) => {
    if (img.complete) return done(img);
    img.addEventListener('load', () => done(img), { once: true });
    img.addEventListener('error', () => done(img), { once: true });
  });
})();
