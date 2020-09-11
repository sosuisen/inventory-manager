import * as React from 'react';
import './App.css';

export interface AppProps {
  title: string;
  author: string;
}

export const App = (props: AppProps) => {
  return (
    <div styleName='app'>
      {props.title}, {props.author}
    </div>
  );
};
