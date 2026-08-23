import React from 'react';
import ReactDOM from 'react-dom';
import {registerEvent, registerReaction, fireEvent, chkSt, registerObject} from 'absevents'


export class ChildNode extends React.Component {
	constructor(props){
		super(props);
		this.state = { node: props.node, isLeft: props.isLeft, parentRef: props.refParent, nodeRef: React.createRef()}


		registerReaction('child-node-ui-' + this.state.node.name, 'state', ['select', 'create-new'], ()=>this.setState({}))
		registerReaction('child-node-ui-' + this.state.node.name, 'dragndrop', ['on-over', 'on-drop'], ()=>this.setState({}))

    //registerObject('main-ui', {'three-frames':true})
	}

	  componentDidMount() {
		// Run initial calculation after the components mount to the DOM
		// this.calculateLine();

		// Attach native window event listeners
		// window.addEventListener('resize', this.calculateLine);
		// window.addEventListener('scroll', this.calculateLine);
		this.setState({})
  	}

	componentWillUnmount() {
		// Clean up event listeners to prevent severe memory leaks
		// window.removeEventListener('resize', this.calculateLine);
		// window.removeEventListener('scroll', this.calculateLine);
		this.setState({})
	}

	render() {

		var position = this.props.isLevel1? 'center': this.state.isLeft? 'left': 'right'
		var parentCord = calculateSidePoint(this.state.parentRef, position)
		var nodeCord = calculateSidePoint(this.state.nodeRef, !this.state.isLeft? 'left': 'right')

		var styleCls = this.props.isLevel1? 'node-level1': this.state.isLeft? 'node-child-left': 'node-child-right'

		if (chkSt('state', 'selected').includes(this.state.node)) {
			styleCls = 'node-selected ' + styleCls 
		}

		var tableStyle = {}

		if (this.state.isLeft) {
			tableStyle = {marginLeft: 'auto'}
		}

		if (this.state.node.isPhantom) {
			return getPhantomUI(this.state.nodeRef, getLineUI(nodeCord, parentCord), getSideMargin(this.state.isLeft))
		}

		var nodeSetCls = this.props.isLevel1? 'node-set-level1': 'node-set'

		return (
			<div class = {nodeSetCls} style = {getSideMargin(this.state.isLeft)}>
                <table class='child-table' style={tableStyle}>
                    <tr>
						<td>{getChildrenUI(this.state, this.state.isLeft)}</td>
                        <td>

							<div style={{position: 'relative'}}>
								<div style={{position: 'absolute', width:'100%', height: '100%', zIndex: '-1'}}>
									<div style = {{width:'100%', height: '50%'}} 
										onMouseEnter={() => console.log("enter")} 
      									onMouseLeave={() => console.log("leave")}></div>
									<div style = {{width:'100%', height: '50%'}}></div>
								</div>
								<div ref = {this.state.nodeRef} class={'node-common ' + styleCls} onClick={(e)=>{e.stopPropagation(); fireEvent('state', 'select', [this.state.node])}}
									draggable = {true}
									onDragStart={(e)=>{fireEvent('dragndrop', 'on-start', [this.state.node])}}
									onDragOver={(e)=>{fireEvent('dragndrop', 'on-over', [this.state.node])}}
									onDragEnd={(e)=>{e.preventDefault();   fireEvent('dragndrop', 'on-drop', [this.state.node])}}>

									{!isEmpty(this.state.node.marker)? <img src={"img/"+this.state.node.marker + ".svg"} alt="Link"></img>: null}
									<a href="#" style={{textDecoration:'none'}} onClick={(e)=> {e.stopPropagation(); e.preventDefault(); modalOpenHandler(this.state.node)}}>
										{this.state.node.name}
										{!isEmpty(this.state.node.note)? <img src="img/note.svg" alt="Link"></img>: null}
									</a>

									{this.state.node.link != null? 
									<a href="#" onClick={(e) => {e.stopPropagation(); fireEvent('link-opener', 'open', [this.state.node.link])}}>
										<img src={getImgByPath(this.state.node.link)} alt="Link"></img>
									</a>: null }
								</div>
							</div>
						</td>
						<td>{getChildrenUI(this.state, !this.state.isLeft)}</td>
                    </tr>
                </table>
				{getLineUI(nodeCord, parentCord)}
			</div>
		)
	}
}

const modalOpenHandler = function(node) {

	if (!chkSt('state', 'selected').includes(node)) {
		fireEvent('state', 'select', [node])
		return
	}

	fireEvent('node-modal', 'open', [node])
}

const getSideMargin = function(isLeft) {
		var sideMargin = {}

		if (isLeft) {
			sideMargin.marginRight = '15px'
		} else {
			sideMargin.marginLeft = '15px'
		}

		return sideMargin
} 

const getChildrenUI = function(state, isRender) {

	if (!isRender || state.node.children == null) {
		return null
	}

	return state.node.children.map(child => <div key = {child.id + '-' + child.name + '-' + child.version}><ChildNode node = {child} isLeft = {state.isLeft} refParent = {state.nodeRef}/></div>)
}

const calculateSidePoint = function(ref, position) {
	var node = ref.current

	if (!node) return null

	const rect = node.getBoundingClientRect();

	if (position == 'left') {
		return { x: rect.left + window.scrollX, y: rect.top + rect.height / 2 + window.scrollY }
	}

	if (position == 'right') {
		return { x: rect.right + window.scrollX, y: rect.top + rect.height / 2 + window.scrollY }
	}

	if (position == 'center') {
		return { x: rect.left + rect.width / 2 + window.scrollX, y: rect.top + rect.height / 2 + window.scrollY }
	}
}

const getLineUI = function(cord1, cord2) {

	if (cord1 == null || cord2 == null) {
		return null
	}

	const x1 = cord1.x; const y1 = cord1.y; const x2 = cord2.x; const y2 = cord2.y;

	const pointX = x1 - (x1-x2)*0.8
	const pointY = y1

	const coords = "M "+ x1 + "," + y1 + " Q " + pointX + "," + pointY + " " + x2 + "," + y2


	return <svg key = {x1 + y1 + x2 + y2}
          style={{ 
            position: 'absolute', top: 0, left: 0, 
            width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1 
          }}
        >

		    
  			<path d={coords} fill="none" stroke="dimgrey" stroke-width="1" />	
        </svg>
}

const getPhantomUI = function(ref, linesUI, style) {
	return 	<div style = {style} ref = {ref} class={'node-common node-phantom'}>
		{linesUI}
	</div>
}

const isEmpty = function(str) {
	if (str == null) {
		return true
	}

	if (str.trim() == '') {
		return true
	}

	return false
}

const getImgByPath = function(path) {

	if (path.endsWith(".pdf")) {
		return "img/pdf.svg" 
	}

	if (path.endsWith(".mm.json")) {
		return "img/mindmap2.svg" 
	}

	if (path.startsWith("http")) {
		return "img/globe.svg" 
	}

	return "img/google-link.svg" 
}

//<!-- M = Start (20,100) | Q = Control (100,20), End (180,100) -->
//<path d="M 20,100 Q 100,20 180,100" fill="none" stroke="dimgrey" stroke-width="1" />

//        	<line x1={x1} y1={y1} x2={x2} y2={y2} stroke="dimgrey" strokeWidth="1" />

// calculateLine() {
//     // Access DOM nodes via .current
//     const node1 = this.div1Ref.current;
//     const node2 = this.div2Ref.current;

//     if (!node1 || !node2) return;

//     const rect1 = node1.getBoundingClientRect();
//     const rect2 = node2.getBoundingClientRect();

//     this.setState({
//       x1: rect1.left + rect1.width / 2 + window.scrollX,
//       y1: rect1.top + rect1.height / 2 + window.scrollY,
//       x2: rect2.left + rect2.width / 2 + window.scrollX,
//       y2: rect2.top + rect2.height / 2 + window.scrollY,
//     });
//   }