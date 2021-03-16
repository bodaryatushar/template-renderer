export const ATTRIBUTES = {
    repeat: 'ng-repeat',
    if: 'ng-if',
    show: 'ng-show',
    click: 'ng-click',
    bind: 'ng-bind',
    href: 'ng-href',
    src: 'ng-src',
    readonly: 'ng-readonly',
  };

  const getFn = (...params) => new Function(...params); // eslint-disable-line

export const getTemplateParser = str => {
  const text1 = str.replace(/(?!(\$|\\))\{{/g, "$1${");
  const text = text1.replace(/(?!(\$|\\))\}}/g, "}");
 
  if (!text.includes('${')) {
    return () => text;
  }
  return getFn("record", "with(record) { return `" + text + "`; } ");
}

export const getExprParser = str =>
  getFn("record", "with(record) { return " + str + " ; } ");