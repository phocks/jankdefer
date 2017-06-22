/* global requestAnimationFrame */
const defaults = {
  framerateTarget: 50,
  timeout: 3000,
  threshold: 5,
  debug: false,
};

module.exports = function (callback, options) {
  options = Object.assign(defaults, options);

  const framerateTarget = options.framerateTarget;
  const timeout = options.timeout;
  const threshold = options.threshold;
  const debug = options.debug;

  var lastCheck;
  var checkCount = 0;
  const firstCheck = Date.now();
  const fpsTarget = 1000 / framerateTarget;

  function log() {
    if (debug) console.log.apply(arguments);
  }

  function checkLoad() {
    const now = Date.now();

    if (now - firstCheck > timeout) {
      log('Reached timeout '+timeout+' ms. Calling back');
      return callback();
    }

    // How many milliseconds have elapsed since the last frame?
    // Ideally this will be ${fpsTarget}, but if the page is thrashing
    // it will be much higher.
    const timeElapsed = now - lastCheck;

    // Check whether the time elapsed is within our target.
    if (lastCheck && timeElapsed < fpsTarget) {
      log('Frame within target ('+timeElapsed+' ms)');
      // increase our count
      checkCount += 1;

      // if our count exceeds the threshold, load.
      if (checkCount > threshold) {
        log('Reached threshold in '+ (now - firstCheck) +' ms. Calling back');
        return callback();
      }

      lastCheck = Date.now();
      return requestAnimationFrame(checkLoad);
    }

    log('Frame too slow ('+timeElapsed+' ms)');

    // reset everything and try again.
    checkCount = 0;
    lastCheck = Date.now();
    return requestAnimationFrame(checkLoad);
  }

  // kick off the check
  checkLoad();
};
