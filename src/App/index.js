import React from "react";
import { useReactParser } from "./app";
import "./index.css";

function App() {
  const [template, setTemplate] = React.useState("");
  const [context, setContext] = React.useState("");
  const [parse, setParse] = React.useState(false);
  const TemplateComponent = useReactParser(template);

  function getContext() {
    try {
      const ctx = JSON.parse(context);
      return { ...ctx, __date: e => e, __uppercase: e => e.toUpperCase(), __t: e => e,$fmt: key => {
        const value = ctx[key];
        if (value === undefined || value === null) {
        return '';
        }
        return value;
        }};
    } catch (e) {
      return {};
    }
  }

  function doParse() {
    setParse(true);
  }

  return (
    <div className="flex">
      <div>
        <label>Template: </label>
        <TextInput
          name="template"
          value={template}
          onChange={setTemplate}
          doParse={setParse}
        />
        Context:{" "}
        <TextInput
          name="context"
          value={context}
          onChange={setContext}
          doParse={setParse}
        />
        <button onClick={() => doParse()}>Parse</button>
      </div>
      <div style={{ margin: "0px 10px   0px 10px" }}>
        Output :
        <div style={{ margin: "0px 10px 0px 20px" }}>
          {parse && <TemplateComponent context={getContext()} />}
        </div>
      </div>
    </div>
  );
}

function TextInput({ name, value, onChange, doParse }) {
  React.useEffect(() => {
    onChange(localStorage.getItem(name) || "");
  }, [name, onChange]);

  React.useEffect(() => {
    localStorage.setItem(name, value);
  }, [name, value]);

  function handleChange(e) {
    doParse(false);
    onChange(e.target.value);
  }
  return <textarea spellCheck="false" value={value} onChange={handleChange} />;
}

export default App;