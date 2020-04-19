import React from 'react';
import ReactDOM from 'react-dom';

import {Panel} from './ui/panel.js'
import {ControlPanel} from './ui/control-panel'

import './data/files'
import './data/state'
import './data/commands'


ReactDOM.render(<div id="app" />, document.body);
const app = document.getElementById("app");

function rerender(){
	ReactDOM.render(
		<div style={{margin:'5px'}}>
			<table class='main-table'>
				<tr>
					<td class='conpanel-td'><ControlPanel/></td>
					<td class='panel-td'><Panel name='left'/></td>
					<td class='panel-td'><Panel name='right'/></td>
				</tr>
			</table>
		</div>, app);
}

rerender();
