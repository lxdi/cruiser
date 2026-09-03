import React from 'react';
import ReactDOM from 'react-dom';
import {Button, Form, Tabs, Tab} from 'react-bootstrap'
import {registerEvent, registerReaction, fireEvent, chkSt, registerObject} from 'absevents'
import {NodeTree} from './node-tree'
import {ButtonsBlock} from './buttons-block'


export class Panels extends React.Component {
	constructor(props){
		super(props);
		this.state = { content: chkSt('state', 'content') }

		registerReaction('panels-ui', 'state', ['select', 'create-new', 'unselect', 'restore', 'delete', 'got', 'change', 'create-panel', 'change-panel'], ()=>this.setState({content: chkSt('state', 'content')}))
		registerReaction('root-node-ui', 'node-modal', ['close'], ()=>this.setState({}))
		registerReaction('root-node-ui', 'dragndrop', ['on-over', 'on-drop'], ()=>this.setState({content: chkSt('state', 'content')}))
		registerReaction('root-node-ui', 'clipboard', ['cut', 'paste'], ()=>this.setState({content: chkSt('state', 'content')}))

    //registerObject('main-ui', {'three-frames':true})
	}

	render() {

		if (this.state.content == null) {
			fireEvent('state', 'get')
			return 'Loading...'
		}

		const panel = chkSt('state', 'current-root')
		const activeKey = calcKey(panel)
		const tabs = this.state.content.panels.map(panel => tabUI(panel))

		return (
			<div key = {calcKey(panel)} class="panels">
				<Tabs activeKey={activeKey} >
					<Tab eventKey = "buttons-block" title={<ButtonsBlock/>} />
					{tabs}
					<Tab eventKey="add-new-panel" title={plusTabTitle()}/>
				</Tabs>
			</div>
		)
	}
}

const tabUI = function(panel) {
	return 	<Tab eventKey = {calcKey(panel)} title={tabTitleUI(panel)}>
				<div class="panel">
					<NodeTree root = {panel} />
				</div>
			</Tab>
}

const plusTabTitle = function() {
	return <div onClick={()=> fireEvent('state', 'create-panel')}>+</div>
}

const tabTitleUI = function(panel) {
	return <div onClick={() => fireEvent('state', 'change-panel', [panel])}>{panel.name}</div>
}

const calcKey = function(panel) {
	return panel.id + '-' + panel.version
}