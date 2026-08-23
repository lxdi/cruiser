import React from 'react';
import ReactDOM from 'react-dom';
import {registerEvent, registerReaction, fireEvent, chkSt, registerObject} from 'absevents'
import {ChildNode} from './child-node'


export class NodeTree extends React.Component {
	constructor(props){
		super(props);
		this.state = { root: chkSt('state', 'content') }
		this.nodeRef = React.createRef();

		registerReaction('root-node-ui', 'state', ['select', 'create-new', 'unselect', 'restore', 'delete', 'got', 'change'], ()=>this.setState({root: chkSt('state', 'content')}))
		registerReaction('root-node-ui', 'node-modal', ['close'], ()=>this.setState({}))
		registerReaction('root-node-ui', 'dragndrop', ['on-over', 'on-drop'], ()=>this.setState({root: chkSt('state', 'content')}))
		registerReaction('root-node-ui', 'clipboard', ['cut', 'paste'], ()=>this.setState({root: chkSt('state', 'content')}))

    //registerObject('main-ui', {'three-frames':true})
	}

	render() {

		if (this.state.root == null) {
			fireEvent('state', 'get')
			return 'Loading...'
		}

		var leftNodes = []
		var rightNodes = []

		if (this.state.root.left != null) {
			leftNodes = this.state.root.left
		}

		if (this.state.root.right != null) {
			rightNodes = this.state.root.right
		}

		var style = 'node-root node-common' 

		if (chkSt('state', 'selected').includes(this.state.root)) {
			style = style + ' node-selected'
		}

		return (
			<div>
                <table class='main-table'>
                    <tr>
						<td>
							{leftNodes.map(node => <div key = {node.name + '-' + node.version}><ChildNode node = {node} isLeft = {true} refParent = {this.nodeRef} isLevel1 = {true} /> </div>)}
						</td>
                        <td>
							<div style={{position: 'relative'}} onClick={(e)=>{e.stopPropagation(); fireEvent('state', 'select', [this.state.root])}}>
								<div style={{position: 'absolute', width:'100%', height: '100%', display: 'flex', zIndex: '-1'}}>
									<div style = {{width:'50%', height: '100%'}}></div>
									<div style = {{width:'50%', height: '100%'}}></div>
								</div>
								<div ref = {this.nodeRef} class={style}>
									<a href="#" style={{textDecoration:'none'}}  onClick={(e)=>{e.stopPropagation(); fireEvent('node-modal', 'open', [this.state.root])}}>
										{this.state.root.name}
									</a>
									
								</div>
							</div>
						</td>
						<td>
							{rightNodes.map(node => <div key = {node.name  + '-' + node.version}><ChildNode id = {node.name} node = {node} refParent = {this.nodeRef} isLevel1 = {true} /> </div>)}
						</td>
                    </tr>
                </table>
			</div>
		)
	}
}