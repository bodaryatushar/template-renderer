export const ATTRIBUTES = {
    repeat: 'ng-repeat',
    if: 'ng-if',
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