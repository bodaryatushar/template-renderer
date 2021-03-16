import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { fireEvent } from "@testing-library/dom";

import { useReactParser } from "../app";

describe("Template Renderer", () => {
  let container = null;
  let template = `<h1>Hello {{name}}</h1>`;
  let context = { name: "Tushar" };
  let dateFormatter, uppercase, fmt, translate, toggleClick;

  function getContext(ctx) {
    try {
      return {
        ...ctx,
        __date: dateFormatter,
        __uppercase: uppercase,
        __t: translate,
        $fmt: fmt
      };
    } catch (e) {
      return {};
    }
  }

  function TemplateRenderer({ template, context }) {
    const TemplateComponent = useReactParser(template);
    return <TemplateComponent context={getContext(context)} />;
  }

  beforeEach(() => {
    dateFormatter = jest.fn();
    uppercase = jest.fn();
    fmt = jest.fn();
    translate = jest.fn();
    toggleClick = jest.fn();
    container = document.createElement("div");
    document.body.appendChild(container);

    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("should render template component", () => {
    const output = container.querySelectorAll("h1");
    expect(output.length).toBe(1);
    expect(output[0].textContent).toBe("Hello Tushar");
  });

  it("should render template when ng-show is true", () => {
    template = `<h1 ng-show='isGreeting'>Hello {{name}}</h1>`;
    context = { name: "Tushar", isGreeting: true };

    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    let output = container.querySelectorAll("h1");
    expect(output.length).toBe(1);
    expect(output[0].className).toBe("");

    context = { name: "Tushar", isGreeting: false };
    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    output = container.querySelectorAll("h1");
    expect(output[0].className).toBe("hide");
  });

  it("should render template when ng-if is true", () => {
    template = `<h1 ng-if='hasName'>Hello {{name}}</h1>`;
    context = { name: "Tushar", hasName: true };
    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    let output = container.querySelectorAll("h1");
    expect(output.length).toBe(1);

    context = { name: "Tushar", hasName: false };
    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    output = container.querySelectorAll("h1");
    expect(output.length).toBe(0);
  });

  it("should render template element when ng-repeat", () => {
    template =
      " <div ng-repeat='item in list track by id'> " +
      "<h3>{{item.name}}</h3>" +
      "</div>";

    context = {
      list: [
        { id: "1", name: "John" },
        { id: "2", name: "Smith" }
      ]
    };

    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });

    expect(container.querySelectorAll("h3").length).toBe(context.list.length);
  });

  it("should render template element when ng-class", () => {
    // for object of class
    template = `<span class="dl-horizontal" ng-class="{'hilite-danger-text': record.statusSelect == 2, 'hilite-info-text': record.statusSelect == 3}">Status Select</span>`;
    context = {
      record: {
        statusSelect: 2
      }
    };
    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    expect(container.querySelector("span").className).toBe(
      "dl-horizontal hilite-danger-text"
    );

    context = {
      record: {
        statusSelect: 3
      }
    };
    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    expect(container.querySelector("span").className).toBe(
      "dl-horizontal hilite-info-text"
    );

    // for array of class
    context = {
      record: {
        warning: true
      }
    };
    template = `<p ng-class="[style1 style2 style3]">Using Array Syntax</p>`;
    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    expect(container.querySelector("p").className).toBe("style1 style2 style3");

    //for simple class
    template = `<p ng-class="style1">Simple class</p>`;
    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    expect(container.querySelector("p").className).toBe("style1");
  });

  it("should render template when ng-href", () => {
    template = `<a ng-href="https://www.{{company}}.com/">Axelor</a><br/>`;
    context = { company: "axelor" };

    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    expect(container.querySelectorAll("a").length).toBe(1);
    expect(container.querySelector("a").href).toBe(
      `https://www.${context.company}.com/`
    );
  });

  it("should render template when ng-src", () => {
    template = `<img ng-src="https://www.gravatar.com/avatar/{{image}}" />`;
    context = { image: "205e460b479e2e5b48aec07710c08d50" };

    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    expect(container.querySelectorAll("img").length).toBe(1);
    expect(container.querySelector("img").src).toBe(
      `https://www.gravatar.com/avatar/${context.image}`
    );
  });

  it("should render template when ng-bind", () => {
    template = `<input ng-bind="company" />`;
    context = { company: "Axelor" };

    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    expect(container.querySelectorAll("input").length).toBe(1);
    expect(container.querySelector("input").value).toBe(context.company);

    template = `<span ng-bind="company" />`;
    context = { company: "Axelor" };
    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    expect(container.querySelectorAll("span").length).toBe(1);
    expect(container.querySelector("span").textContent).toBe(context.company);
  });

  it("should render template when href", () => {
    template = `<a href="https://www.{{company}}.com/">Axelor</a><br/>`;
    context = { company: "axelor" };

    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    expect(container.querySelectorAll("a").length).toBe(1);
    expect(container.querySelector("a").href).toBe(
      `https://www.${context.company}.com/`
    );
  });

  it("should render template when src", () => {
    template = `<img src="https://www.gravatar.com/avatar/{{image}}" />`;
    context = { image: "205e460b479e2e5b48aec07710c08d50" };

    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    expect(container.querySelectorAll("img").length).toBe(1);
    expect(container.querySelector("img").src).toBe(
      `https://www.gravatar.com/avatar/${context.image}`
    );
  });

  it("should render template when ng-bind-html", () => {
    template = `<span ng-bind-html="record.greeting" ></span>`;
    context = {
      record: {
        greeting: `<h1>Hello</h1>`
      }
    };
    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    expect(container.querySelectorAll("h1").length).toBe(1);
    expect(container.querySelector("h1").textContent).toBe("Hello");
  });

  it("should render template when ng-readonly is true", () => {
    template = `<input ng-readonly="checked" />`;
    context = {
      checked: false
    };
    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    expect(container.querySelectorAll("input").length).toBe(1);
    expect(container.querySelector("input").readOnly).toBe(context.checked);
  });

  it("should render template when angular filter defined", () => {
    template = `<span>{{record.fullName | uppercase}}</span>`;
    context = {
      record: {
        fullName: "Tushar Bodara"
      }
    };
    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    expect(uppercase).toHaveBeenCalled();

    template = `<span>{{record.dob | date: 'dd/mm/yyyy'}}</span>`;
    context = {
      record: {
        dob: new Date()
      }
    };
    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    expect(dateFormatter).toHaveBeenCalled();
  });

  it("should render template when x-translate", () => {
    template = `<span x-translate>{{record.company}}</span>`;
    context = {
      record: {
        company: "Axelor"
      }
    };
    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    expect(translate).toHaveBeenCalled();
  });

  it("should render template when html attribute", () => {
    template = `<span style="color:blue" class="company" x-translate>{{record.company}}</span>`;
    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    expect(container.querySelector("span").style.color).toBe("blue");
    expect(container.querySelector("span").className).toBe("company");
  });

  it("should render template when ng-click", () => {
    template = `<span ng-click="toggle()" class="toggle">{{record.company}}</span>`;
    context = {
      toggle: toggleClick
    };
    act(() => {
      render(
        <TemplateRenderer template={template} context={context} />,
        container
      );
    });
    act(() => {
      fireEvent.click(container.querySelector(".toggle"));
    });
    expect(toggleClick).toHaveBeenCalled();
  });

  // it("should render template when throw error", () => {
  //   template = `<span>{{record->company}}</span>`;
  //   context = {
  //     record: {
  //       id: 1,
  //       company: "Axelor"
  //     }
  //   };
  //   act(() => {
  //     render(
  //       <TemplateRenderer template={template} context={context} />,
  //       container
  //     );
  //   });
  //   expect(container.querySelectorAll("h4").length).toBe(1);
  //   expect(container.querySelector("h4").textContent).toBe(
  //     ` Record: ${context.record.id} `
  //   );
  // });
});
