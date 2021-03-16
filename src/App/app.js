import React from "react";
import parse5 from "parse5";
import { get, isEmpty } from "lodash";
import { ATTRIBUTES } from "./util";
import { getTemplateParser, getExprParser, getStyleObject } from "./util";
import classNames from "classnames";

const REACT_COMPONENTS = [];

function reactComponent(element, _props = {}, _component) {
  const { tagName } = element;
  const props = Object.assign({}, _props);
  const compName = _component || tagName.toLowerCase();
  return React.createElement(compName, props);
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
    const parser = getExprParser(val);
    return context => {
      return parser(context);
    };
  }
};

function process(root) {
  function processElement(element) {
    if(element === undefined) return;
    const { value = "", tagName, attrs = [], childNodes } = element;
    let props = {};
    let classes= [];

    const remainingAttr = attrs.filter(({ name, value }) => !ATTR_EVALUATOR[name]);
    remainingAttr.forEach(({name,value}) => {
      if(name === 'class') {
        classes.push(value);
      } else if(name === 'style') {
        props[name] = getStyleObject(value)
      } else {
        props[name]= value;
      }
    })
    
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
      const content = value.trim();
      const parser = content ? getTemplateParser(content) : null;
      renderProps = context => (parser ? { children: parser(context) } : {});
    }

    const ReactComponent = (() => {
      function HTMLComponent({ context }) {
        let ngClasses = []
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
            result && ngClasses.push(result);
          } else if (attr === ATTRIBUTES.click) {
            props.onClick = () => result;
          } else if (attr === ATTRIBUTES.bind) {
            if (tagName === "input") {
              props.value = result;
            } else {
              props.children = result;
            }
          } else if (attr === ATTRIBUTES.href) {
            props.href = result;
          } else if (attr === ATTRIBUTES.src) {
            props.src = result;
          } else if (attr === ATTRIBUTES.readonly) {
            props.readOnly = result;
          } else if (attr === ATTRIBUTES.class) {
            ngClasses.push(result);
          }
        });

        let allClasses = classes.concat(ngClasses);
        if (allClasses.length > 0) props.className = classNames(allClasses);

        return showIf
          ? reactComponent(
              element,
              { ...renderProps(context), ...props},
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
                  $index: i,
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
  function processElement({ value, tagName, attrs, childNodes = [] }) {
    if (value == "\n") return;
    if (value) return { value };
    return {
      tagName,
      attrs,
      childNodes: childNodes.map(c => processElement(c)).filter(c => c)
    };
  }
  return processElement(root);
}
export default function(template, context) {
  const { childNodes = [] } = parse5.parseFragment(template);
  const tree = generateTree({
    tagName: '',
    attrs: [],
    childNodes
  });
  return process(tree);
}