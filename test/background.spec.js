chrome = {
  runtime: {
    onInstalled: {
      addListener: (x) => {
        x();
      }
    }
  },
  declarativeContent: {
    onPageChanged: {
      removeRules: (_, x) => {
        x();
      },
      addRules: jest.fn()
    },
    PageStateMatcher: jest.fn(),
    ShowPageAction: jest.fn()
  }
}


require('../src/background');


describe('oninstall', function () {
  it('should load for certain urls', () => {
    const matcher = chrome.declarativeContent.PageStateMatcher.mock.calls[0][0].pageUrl.urlMatches;
    const regex = new RegExp(matcher);
    expect(regex.test('https://de.overleaf.com/project/asda')).toBeTruthy()
    expect(regex.test('https://overleaf.com/project/asda')).toBeTruthy();
    expect(regex.test('https://www.de.overleaf.com/project/asda')).toBeTruthy();
    expect(regex.test('https://www.overleaf.com/project/asda')).toBeTruthy();
    expect(regex.test('http://de.overleaf.com/project/asda')).toBeTruthy()
    expect(regex.test('http://overleaf.com/project/asda')).toBeTruthy();
    expect(regex.test('http://www.de.overleaf.com/project/asda')).toBeTruthy();
    expect(regex.test('http://www.overleaf.com/project/asda')).toBeTruthy();
  });

  it('should not load for certain urls', () => {
    const matcher = chrome.declarativeContent.PageStateMatcher.mock.calls[0][0].pageUrl.urlMatches;
    const regex = new RegExp(matcher);
    expect(regex.test('www.google.nl')).toBeFalsy();
    expect(regex.test('http://www.ovearleaf.com/project/asda')).toBeFalsy();
  });

});
