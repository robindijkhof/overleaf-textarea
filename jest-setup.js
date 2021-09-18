if (!String.prototype.replaceAll) {
  // NodeJS does not support replaceAll
  String.prototype.replaceAll = function (target, replacement) {
    return this.split(target).join(replacement);
  };
}
