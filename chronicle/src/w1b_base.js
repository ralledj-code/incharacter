(function (root) {
'use strict';
const C = root.__cw;
// asset base: next to the page, also when served as /chronicle (no trailing slash) or as the family page /chronicle/familie
C.BASE = function () {
  if (typeof location === 'undefined') return '';
  if (/\/familie\/?$/.test(location.pathname)) return location.origin + location.pathname.replace(/familie\/?$/, '');
  return /\/$|\.html$/.test(location.pathname) ? location.href : location.href.replace(/[?#].*$/, '') + '/';
};
})(typeof window !== 'undefined' ? window : globalThis);
