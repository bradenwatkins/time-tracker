import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './style.scss';
import { SheetsService } from './Services/SheetsService';

new SheetsService();

ReactDOM.render(
  <div>
    <h4>Welcome to React, Electron and Typescript</h4>
  </div>,
  document.getElementById('app')
);
