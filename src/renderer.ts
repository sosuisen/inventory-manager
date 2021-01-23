import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './modules_renderer/App';

const onready = () => {
  const domContainer = document.getElementById('react-container');

  ReactDOM.render(React.createElement(App), domContainer);
};

window.document.addEventListener('DOMContentLoaded', onready);
