import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App, AppProps } from './App';

const onready = () => {
  const domContainer = document.getElementById('react-container');

  const props: AppProps = {
    title: 'Kecho',
    author: 'Kyoka Izumi',
  };
  ReactDOM.render(React.createElement(App, props), domContainer);
};

window.document.addEventListener('DOMContentLoaded', onready);
