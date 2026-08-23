import React from 'react';
import ReactDOM from 'react-dom';
import {Modal, Button, Form} from 'react-bootstrap'
import {NodeTree} from './components/node-tree'
import {NodeModal} from './components/node-modal'
import {ButtonsBlock} from './components/buttons-block'

import {registerEvent, registerObject, fireEvent, chkSt} from 'absevents'
import './service/onkeypress-handler'
import './service/state'
import './service/dragndrop'
import './service/link-opener'
import './service/clipboard'


ReactDOM.render(<div id="app" />, document.body);
const app = document.getElementById("app");
document.addEventListener("keydown", (event)=>fireEvent('key-press-handler', 'press', [event]), false)
document.addEventListener("keyup", (event)=>fireEvent('key-press-handler', 'release', [event]), false)

document.addEventListener('copy', (event) => {
    //event.preventDefault();
	fireEvent('clipboard', 'copy')
})

function rerender(){
	ReactDOM.render(
		<div>
			<ButtonsBlock/>
			<div class="nodes-main-frame" onClick={(e)=> {e.preventDefault(); fireEvent('state', 'unselect')}}>
				<NodeTree />
				<NodeModal/>
			</div>
		</div>, app);
}

rerender();
