//import React from 'react';
//import ReactDOM from 'react-dom';
//
//import Wowser from './components/wowser';
//
//ReactDOM.render(<Wowser />, document.querySelector('app'));

import React from 'react';
import ReactDOM from 'react-dom/client'; // Note the changed import

import Wowser from './components/wowser';

const container = document.querySelector('app');
const root = ReactDOM.createRoot(container);
root.render(<Wowser />);
