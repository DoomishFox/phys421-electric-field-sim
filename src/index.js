import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import FieldRenderer from './FieldRenderer';

ReactDOM.render(
  <React.StrictMode>
    <FieldRenderer />
    <div id="ui-static" className="ui-static-container">
      <button id="add-button-id" className="add-button">New Particle</button>
    </div>
    <div id="ui-dynamic" className="ui-dynamic-container">
      <label className="dynamic-label" htmlFor="charge-id">Charge: </label>
      <a id="dynamic-label-id">charge value</a>
      <a > C</a>
      <br/>
      <input type="range" id="charge-id" className="charge" name="charge" min="-2" max="2" step="0.1"/>
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
