import React from 'react';
import ReactDOM from 'react-dom';
import MapSkel from './MapSkel/MapSkel.js';
import registerServiceWorker from './registerServiceWorker';
import injectTapEventPlugin from 'react-tap-event-plugin';
import './index.css';

injectTapEventPlugin();
ReactDOM.render(<MapSkel />, document.getElementById('root'));
registerServiceWorker();
