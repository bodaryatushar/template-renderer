import React from "react";
import parse5 from "parse5";
import { get, isEmpty } from "lodash";
import { ATTRIBUTES, HTML_ATTRIBUTES } from "./util";
import { getTemplateParser, getExprParser, getStyleObject,isObject,isArray,stringToObject } from "./util";
import classNames from "classnames";

const REACT_COMPONENTS = [];

function reactComponent(element, _props = {}, _component) {
  const { tagName } = element;
  const props = Object.assign({}, _props);
  const compName = _component || tagName.toLowerCase();
  return React.createElement(compName, props);
}

function evaluateObject(val) {
 let classes = stringToObject(val)
      const parser = getTemplateParser(JSON.stringify(classes));
      return context => {
        const result = parser(context);
        classes = JSON.parse(result)
        let temp = {}
        for (const item in classes) {
          const name = item.replace('\'','').replace('\'','')
          temp[name] = classes[item] === "true" ? true : false
        }
        return classNames(temp);
      };
}

export const ATTR_EVALUATOR = {
  [ATTRIBUTES.if]: val => {
    const parser = getExprParser(val);
    return context => {
      return parser(context);
    };
  },
  [ATTRIBUTES.show]: val => {
    const parser = getExprParser(val);
    return context => {
      const show = parser(context);
      if (!show) return "hide";
      else return "";
    };
  },
  [ATTRIBUTES.click]: val => {
    return context => val;
  },
  [ATTRIBUTES.bind]: val => {
    return context => {
      const value = get(context, val);
      return value;
    };
  },
  [ATTRIBUTES.href]: val => {
    const parser = getTemplateParser(val);
    return context => {
      return parser(context);
    };
  },
  [ATTRIBUTES.src]: val => {
    const parser = getTemplateParser(val);
    return context => {
      return parser(context);
    };
  },
  [ATTRIBUTES.readonly]: val => {
    const parser = getExprParser(val);
    return context => {
      return parser(context);
    };
  },
  [ATTRIBUTES.class]: val => {
    if(isObject(val)) {
      return evaluateObject(val)
    } else if(isArray(val.trim())) {
      const classes = val.replace('[','').replace(']','').split(',');
      const parsers = classes.map(c => {
        if(isObject(c.trim())) {
          return evaluateObject(c.trim())
        }
        return () => c
      })
      return context => {
        return parsers.map(parser => parser(context));
      }     
    }
    const parser = getTemplateParser(val);
    return context => {
      return parser(context);
    };
  },
  [ATTRIBUTES.bindHTML]: val => {
    const parser = getExprParser(val);
    return context => {
      return parser(context);
    };
  },
  [HTML_ATTRIBUTES.href]: val => {
    const parser = getTemplateParser(val);
    return context => {
      return parser(context);
    };
  },
  [HTML_ATTRIBUTES.src]: val => {
    const parser = getTemplateParser(val);
    return context => {
      return parser(context);
    };
  },
  [HTML_ATTRIBUTES.data]: val => {
    const parser = getTemplateParser(val);
    return context => {
      return parser(context);
    };
  }
};

function resolveFilter(match) {
  let arr = match
    .replace("{{", "")
    .replace("}}", "")
    .split("|");
  let code = arr.shift();
  arr.forEach(a => {
    let [filterName, value] = a.split(":");
    if (value) {
      code = `__${filterName.trim()}(${code},${value})`;
    } else {
      code = `__${filterName.trim()}(${code})`;
    }
  });
  return "{{" + code + "}}";
}

function process(root) {
  function processElement(element) {
    if (element === undefined) return;
    const { value = "", tagName, attrs = [], childNodes } = element;
    let props = {};
    let classes = [];

    const remainingAttr = attrs.filter(
      ({ name, value }) => !ATTR_EVALUATOR[name]
    );
    remainingAttr.forEach(({ name, value }) => {
      if (name === HTML_ATTRIBUTES.class) {
        classes.push(value);
      } else if (name === HTML_ATTRIBUTES.style) {
        props[name] = getStyleObject(value);
      } else if(name === ATTRIBUTES.translate) {
        return false;
      } else {
        props[name] = value;
      }
    });

    const attrEvals = attrs
      .filter(({ name, value }) => ATTR_EVALUATOR[name])
      .map(({ name, value }) => ({
        attr: name,
        eval: ATTR_EVALUATOR[name](value)
      }));

    let renderProps = () => ({});

    if (childNodes && childNodes.length) {
      const childs = [];
      for (let i = 0; i < childNodes.length; i++) {
        const child = processElement(childNodes[i]);
        child && childs.push(child);
      }

      renderProps = context => ({
        children: childs.map((ChildComponent, i) => (
          <ChildComponent key={i} context={context} />
        ))
      });
    } else {
      const content = value;
      let code = content.replace(/\{\{(.*?)\}\}/g, resolveFilter);
      const parser = content ? getTemplateParser(code) : null;
      renderProps = context => (parser ? { children: parser(context) } : {});
    }

    const ReactComponent = (() => {
      function HTMLComponent({ context }) {
        let ngClasses = [];
        let showIf = true;

        attrEvals.forEach(attrEval => {
          const { attr, eval: evaluate } = attrEval;
          let result = "";
          if (!isEmpty(context)) {
            result = evaluate(context);
          }
          if (attr === ATTRIBUTES.if && (showIf = result) === false) {
            return;
          } else if (attr === ATTRIBUTES.show) {
            ngClasses.push(result);
          } else if (attr === ATTRIBUTES.click) {
            props.onClick = () => result;
          } else if (attr === ATTRIBUTES.bind) {
            if (tagName === "input") {
              props.defaultValue = result;
            } else {
              props.children = result;
            }
          } else if (attr === ATTRIBUTES.href || attr === HTML_ATTRIBUTES.href) {
            props.href = result;
          } else if (attr === ATTRIBUTES.src || attr === HTML_ATTRIBUTES.src) {
            props.src = result;
          } else if (attr === ATTRIBUTES.readonly) {
            props.readOnly = result;
          } else if (attr === ATTRIBUTES.class) {
            ngClasses.push(result);
          } else if(attr === ATTRIBUTES.bindHTML) {
              props.dangerouslySetInnerHTML = { __html: result };
          } else if(attr === HTML_ATTRIBUTES.data) {
            props.data = result;
          }
        });
        let allClasses = (classes.concat(ngClasses)).filter(a => a !== '');
        if (allClasses.length > 0) {
          props.className = classNames(allClasses);
        }

        return showIf
          ? reactComponent(
              element,
              { ...renderProps(context), ...props },
              (REACT_COMPONENTS.includes(tagName) || !tagName) && React.Fragment
            )
          : null;
      }
      return HTMLComponent;
    })();

    // for ng-repeat
    const index = attrs && attrs.findIndex(a => a.name === ATTRIBUTES.repeat);
    if (index >= 0) {
      const [, itemKey, itemsKey, , key] = attrs[index].value.match(
        /([^\s]+)\s+in\s+([^\s]+)(\s+track\s+by\s+([^\s]+))?/
      );
      function List({ context }) {
        const data = get(context, itemsKey, []);
        return (
          <React.Fragment>
            {data.map((item, i) => (
              <ReactComponent
                key={key ? item[key] : i}
                context={{
                  ...context,
                  [itemKey]: item,
                  $index: i
                }}
              />
            ))}
          </React.Fragment>
        );
      }
      return List;
    }
    return ReactComponent;
  }
  return processElement(root);
}

function generateTree(root) {
  function processElement({ value, tagName, attrs, childNodes = [] },isTranslate) {
    const translatetAttr = attrs && attrs.filter(a => a.name === 'x-translate')
    if (value === "\n") return;
    if(value) {
      if(isTranslate) {
        const isExpression = value && value.trim().startsWith('{{')
        const val = isExpression ? `{{__t(${value.replace('{{','').replace('}}','')})}}` : `{{__t('${value}')}}` ;
        return {value: val}
      }
      return value;
    }
    return {
      tagName,
      attrs,
      childNodes: childNodes.map(c => processElement(c,translatetAttr.length > 0)).filter(c => c)
    };
  }
  return processElement(root);
}

function replaceTag(str){
  let closingTag = '',tag = ''
  const arr = str.split(' ')[0].match(/<([^/>]+)\/>/g)
  if(arr) {
    closingTag = arr[0]
  } else {
    tag = str.replace(/\/>/g,'>')
    closingTag = str.split(' ')[0].replace(/</g,'</') + '>';
  }
  return tag + closingTag;
}

function parseTemplate(template) {
    const newTemplate = template.replace(/<([^/>]+)\/>/g, replaceTag);
    const { childNodes = [] } = parse5.parseFragment(newTemplate);
    const tree = generateTree({
      tagName: "",
      attrs: [],
      childNodes
    });
    return process(tree);
}

export function useReactParser(template) {
  const [ReactComponent, setReactComponent] = React.useState(() => () => null);
  React.useEffect(() => {
    if (template) {
      try {
        const result = parseTemplate(template.trim());
        setReactComponent(() => result);
      } catch (err) {
        setReactComponent(
          () =>
            function({ context = {} }) {
              return (
                <div>
                  {" "}
                  <h4> Record: {context.record.id} </h4>{" "}
                </div>
              );
            }
        );
        console.log("template parse", err);
      }
    }
  }, [template]);
  return ReactComponent;
}
