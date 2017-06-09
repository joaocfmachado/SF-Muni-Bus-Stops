import React from 'react';
import ReactDOM from 'react-dom';
import ConnectionMap from './ConnectionMap.js';

it('renders without crashing', () => {
  ReactDOM.render(<ConnectionMap />, document.getElementById('mapContent'));
});
