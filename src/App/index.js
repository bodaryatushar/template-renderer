import React from "react";
import parseTemplateToComponent from './app'
import "./index.css";

function App() {
  const [template, setTemplate] = React.useState("");
  const [context, setContext] = React.useState("");
  const [reactComponent, setReactComponent] = React.useState([]);

  function getContext() {
    try {
      return JSON.parse(context);
    } catch(e) {
      return {}
    }
  }

  function doParse() {
    let components = [];
    const results = parseTemplateToComponent(template, context);  
    results.forEach(r => {
      components.push(r)
    })
    setReactComponent(components.filter(a => a !== undefined));
  }

  return (
    <div className="flex">
      <div>
        <label>Template: </label>
        <TextInput name="template" value={template} onChange={setTemplate} />
        Context: <TextInput name="context" value={context} onChange={setContext} />
        
        <button onClick={() => doParse()}>Parse</button>
      </div>
      <div style={{margin: '0px 10px   0px 10px'}}>
      Output :
      <div style={{margin: '0px 10px 0px 20px'}}>
        {
          reactComponent.length > 0 && reactComponent.map((Component,index) => 
             <Component context={getContext()} key={index}/>
          )
        }
      </div>
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