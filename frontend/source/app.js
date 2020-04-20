import React from 'react';
import ReactDOM from 'react-dom';

import {Panel} from './ui/panel.js'
import {ControlPanel} from './ui/control-panel'

import {fireEvent} from 'absevents'

import './data/files'
import './data/state'
import './data/commands'
import './services/onkeypress-handler'


ReactDOM.render(<div id="app" />, document.body);
const app = document.getElementById("app");
document.addEventListener("keydown", (event)=>fireEvent('key-press-handler', 'press', [event]), false);

function rerender(){
	ReactDOM.render(
		<div style={{margin:'5px'}}>
			<table class='main-table'>
				<tr>
					<td class='conpanel-td'><ControlPanel/></td>
					<td class='panel-td'><Panel name='left' current={true}/></td>
					<td class='panel-td'><Panel name='right' current={false}/></td>
				</tr>
			</table>
		</div>, app);
}

rerender();
