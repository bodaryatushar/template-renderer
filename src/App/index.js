import React from "react";
import parseTemplateToComponent from './app'
import "./index.css";

function App() {
  const [template, setTemplate] = React.useState("");
  const [context, setContext] = React.useState("");
  const [ReactComponent, setReactComponent] = React.useState(null);

  function getContext() {
    try {
      return JSON.parse(context);
    } catch(e) {
      return {}
    }
  }

  function doParse() {
    const output = parseTemplateToComponent(template, context);
    setReactComponent(() => output);
  }

  return (
    <div className="flex">
      <div>
        <TextInput name="template" value={template} onChange={setTemplate} />
        <TextInput name="context" value={context} onChange={setContext} />
        <button onClick={() => doParse()}>Parse</button>
      </div>
      <div>
        {
          ReactComponent &&
          <ReactComponent context={getContext()} />
        }
      </div>
    </div>
  );
}

function TextInput({ name, value, onChange }) {
  React.useEffect(() => {
    onChange(localStorage.getItem(name) || "");
  }, [name, onChange]);

  React.useEffect(() => {
    localStorage.setItem(name, value);
  }, [name, value]);

  function handleChange(e) {
    onChange(e.target.value);
  }
  return <textarea spellCheck="false" value={value} onChange={handleChange} />;
}

export default App;