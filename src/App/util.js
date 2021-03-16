import { parseSafe} from './parser'

export const ATTRIBUTES = {
  repeat: "ng-repeat",
  if: "ng-if",
  show: "ng-show",
  click: "ng-click",
  bind: "ng-bind",
  href: "ng-href",
  src: "ng-src",
  readonly: "ng-readonly",
  class: "ng-class"
};

const getFn = (...params) => new Function(...params); // eslint-disable-line

export const getTemplateParser = str => {
  const text1 = str.replace(/(?!(\$|\\))\{{/g, "$1${");
  const text = text1.replace(/(?!(\$|\\))\}}/g, "}");

  if (!text.includes("${")) {
    return () => text;
  }
  return parseSafe('`' + text + '`');
  // return getFn("record", "with(record) { return `" + text + "`; } ");
};

export const getExprParser = str => {
  return parseSafe(str);
  // getFn("record", "with(record) { return " + str + " ; } ");
};
  
export const isObject = v => v.startsWith("{");
export const isArray = v => v.startsWith("[");

const formatStringToCamelCase = str => {
  const splitted = str.split("-");
  if (splitted.length === 1) return splitted[0];
  return (
    splitted[0] +
    splitted
      .slice(1)
      .map(word => word[0].toUpperCase() + word.slice(1))
      .join("")
  );
};

export const getStyleObject = str => {
  const style = {};
  str.split(";").forEach(el => {
    const [property, value] = el.split(":");
    if (!property) return;

    const formattedProperty = formatStringToCamelCase(property.trim());
    style[formattedProperty] = value.trim();
  });

  return style;
};