import React from 'react';
import ReactDOM from 'react-dom';
import MapSkel from './MapSkel/MapSkel.js';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

ReactDOM.render(<MapSkel />, document.getElementById('root'));
registerServiceWorker();
