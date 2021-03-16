import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { fireEvent } from "@testing-library/dom";

import TemplateComponent from "../index";

describe("Template Renderer", () => {
  let container = null;
  let template = `<h1>Hello {{name}}</h1>`;
  let context = { name: "Tushar" };

  function onTemplateChange(template) {
    const textFields = container.querySelectorAll("textarea");
    const field = textFields[0];
    act(() => {
      fireEvent.change(field, { target: { value: template } });
    });
  }

  function onContextChange(context) {
    const textFields = container.querySelectorAll("textarea");
    const field = textFields[1];
    act(() => {
      fireEvent.change(field, { target: { value: context } });
    });
  }

  function onParse(template, context) {
    onTemplateChange(template);
    onContextChange(JSON.stringify(context));
    const parseBtn = container.querySelector("button");
    act(() => {
      fireEvent.click(parseBtn);
    });
  }

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    act(() => {
      render(<TemplateComponent />, container);
    });
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("should render textarea", () => {
    expect(container.querySelectorAll("textarea").length).toBe(2);
  });

  it("should render parse button", () => {
    expect(container.querySelectorAll("button").length).toBe(1);
  });
});
