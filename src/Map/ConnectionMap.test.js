import React from 'react';
import ReactDOM from 'react-dom';
import ConnectionMap from './Map';

it('renders without crashing', () => {
  ReactDOM.render(<ConnectionMap />, document.getElementById('mainContent'));
});
