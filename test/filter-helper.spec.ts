import {filter} from "../source/filter-helper";
import * as path from "path";
import * as fs from "fs";

describe('filter', function () {

  it('should be a when a', function () {
    expect(filter('a', [])).toBe('a');
    expect(filter('a', [])).not.toBe('b');
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

      expect(filter(value1, [])).toBe(expected1);
      expect(filter(value2, [])).toBe(expected2);
      expect(filter(value3, [])).toBe(expected3);
    }
  });

  it('should be able to handle simple replaces', function () {
    expect(filter('\\\\', [])).toBe('');
    expect(filter('\\%', [])).toBe('%');
    expect(filter('\\$', [])).toBe('$');
    expect(filter('\\&', [])).toBe('&');
    expect(filter('\\#', [])).toBe('#');
    expect(filter('\\_', [])).toBe('_');
    expect(filter('\\_\\_', [])).toBe('__');
  });

  it('should corectly handle a "," with cite', function () {
    expect(filter('Multi-PIE dataset \\cite{multipie}, which', [])).toBe('Multi-PIE dataset, which');
  });

  it('should corectly handle ac[s|l|f]', function () {
    expect(filter('\\acrfull{abc}', [])).toBe('abc');
    expect(filter('\\ac{abc}', [])).toBe('abc');
    expect(filter('\\acs{abc}', [])).toBe('abc');
    expect(filter('\\acl{abc}', [])).toBe('abc');
    expect(filter('\\acf{abc}', [])).toBe('abc');
  });

  it('should  corectly handle the example1 text', function () {
    const tex = fs.readFileSync(path.resolve(__dirname, "./example1.tex"), "utf8");
    const result = fs.readFileSync(path.resolve(__dirname, "./result1.txt"), "utf8");

    expect(filter(tex, [])).toBe(result);
  });

  it('should  corectly handle the example2 text', function () {
    const tex = fs.readFileSync(path.resolve(__dirname, "./example2.tex"), "utf8");
    const result = fs.readFileSync(path.resolve(__dirname, "./result2.txt"), "utf8");

    expect(filter(tex, [])).toBe(result);
  });

  it('should  corectly handle the example3 text', function () {
    const tex = fs.readFileSync(path.resolve(__dirname, "./example3.tex"), "utf8");
    const result = fs.readFileSync(path.resolve(__dirname, "./result3.txt"), "utf8");

    expect(filter(tex, [])).toBe(result);
  });

});
