userFilters = [];
const functions = require('../src/functions');
const fs = require('fs');
const path = require("path");


describe('filter', function () {

  it('should be a when a', function () {
    expect(functions.filter('a')).toBe('a');
    expect(functions.filter('a')).not.toBe('b');
  });

  it('should be able to handles cite, citep, citeal[], citealp[]', function () {
    const cites = ['\\cite{overleaf}', '\\citep{overleaf}', '\\citeal[]{overleaf}', '\\citealp[]{overleaf}']
    for (let i = 0; i < cites.length; i++) {
      const value1 = `The dog chased the cat ${cites[i]} and the mouse.`
      const expected1 = `The dog chased the cat and the mouse.`

      const value2 = `The dog chased the cat${cites[i]} and the mouse.`
      const expected2 = `The dog chased the cat and the mouse.`

      const value3 = `The dog chased the cat${cites[i]}.`
      const expected3 = `The dog chased the cat.`

      expect(functions.filter(value1)).toBe(expected1);
      expect(functions.filter(value2)).toBe(expected2);
      expect(functions.filter(value3)).toBe(expected3);
    }
  });

  it('should be able to handle simple replaces', function () {
    expect(functions.filter('\\\\')).toBe('');
    expect(functions.filter('\\%')).toBe('%');
    expect(functions.filter('\\$')).toBe('$');
    expect(functions.filter('\\&')).toBe('&');
    expect(functions.filter('\\#')).toBe('#');
    expect(functions.filter('\\_')).toBe('_');
    expect(functions.filter('\\_\\_')).toBe('__');
  });

  it('should corectly handle a "," with cite', function () {
    expect(functions.filter('Multi-PIE dataset \\cite{multipie}, which')).toBe('Multi-PIE dataset, which');
  });

  it('should  corectly handle the example1 text', function () {
    const tex = fs.readFileSync(path.resolve(__dirname, "./example1.tex"), "utf8");
    const result = fs.readFileSync(path.resolve(__dirname, "./result1.txt"), "utf8");

    expect(functions.filter(tex)).toBe(result);
  });

  it('should  corectly handle the example2 text', function () {
    const tex = fs.readFileSync(path.resolve(__dirname, "./example2.tex"), "utf8");
    const result = fs.readFileSync(path.resolve(__dirname, "./result2.txt"), "utf8");

    expect(functions.filter(tex)).toBe(result);
  });

});
