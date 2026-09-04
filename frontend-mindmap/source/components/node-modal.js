import React from 'react';
import ReactDOM from 'react-dom';
import {Modal, Button, Form} from 'react-bootstrap'
import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'
import {Editor, EditorState, RichUtils, convertFromRaw, convertToRaw, ContentState} from 'draft-js'

const colorStyleMap = {
  RED: { color: '#ff0000' },
  BLUE: { color: '#0000ff' },
  GREEN: { color: 'green' },
};

export class NodeModal extends React.Component{
  constructor(props){
    super(props)

    this.state = {isOpen: false, editorState: EditorState.createEmpty()}
    //registerObject('node-modal', {isOpen: false})
    registerEvent('node-modal', 'open', (stSetter, node) => this.setState({isOpen: true, node: node, editorState: deserializeContent(node.note)}))
    registerEvent('node-modal', 'close', (stSetter)=>this.setState({isOpen:false, node: null}))

    this.onChange = editorState => {this.setState({editorState})}
    this.handleKeyCommand = this.handleKeyCommand.bind(this)
    
  }


  handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      this.onChange(newState);
      return 'handled';
    }

    return 'not-handled';
  }

  _onStyleClick(style) {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, style));
  }

  render(){
    return (
      <Modal show={this.state.isOpen} dialogClassName='node-modal-style'>
            <Modal.Header>
              <Modal.Title>{this.state.node != null? this.state.node.name: null}</Modal.Title>
            </Modal.Header>
            <div style={{margin:'5px'}}>
              {getModalBody(this)}
            </div>
            <Modal.Footer>
              {this.state.isOpen? getFooterButtonsUI(this.state.node, this.state.editorState):''}
            </Modal.Footer>
      </Modal>
    )
  }
}

const getModalBody = function(comp) {

    if (comp.state.node == null) {
        return ''
    }

    return <div>
              <div>
                <Form.Control type="text" value={comp.state.node.name} onChange={(e)=>changeNameHandler(comp, e)} onFocus={(e) => e.target.select()}/>
                <div class="editor">
                  <div class="editor-buttons">
                    <Button id='bold' onClick={comp._onStyleClick.bind(comp, 'BOLD')} variant="outline-secondary" size="sm" style={{marginRight: '3px'}}>B</Button>
                    <Button id='bold' onClick={comp._onStyleClick.bind(comp, 'RED')} variant="outline-danger" size="sm" style={{marginRight: '3px'}}>Red</Button>
                    <Button id='bold' onClick={comp._onStyleClick.bind(comp, 'BLUE')} variant="outline-primary" size="sm" style={{marginRight: '3px'}}>Blue</Button>
                    <Button id='bold' onClick={comp._onStyleClick.bind(comp, 'GREEN')} variant="outline-success" size="sm" style={{marginRight: '3px'}}>Green</Button>
                  </div>
                  <div class="editor-text">
                    <Editor editorState={comp.state.editorState} 
                      onChange={comp.onChange} 
                      handleKeyCommand={comp.handleKeyCommand}
                      customStyleMap={colorStyleMap} 
                    />
                  </div>
              </div>
                <Form.Control placeholder = 'Link' type="text" value={comp.state.node.link} onChange={(e)=>changeLinkHandler(comp, e)}/>
                <Form.Control placeholder = 'Marker' type="text" value={comp.state.node.marker} onChange={(e)=>changeMarkerHandler(comp, e)}/>
              </div>
          </div>
}

//                <Form.Control as="textarea" size='sm' rows={20} value={comp.state.node.note} onChange={(e)=>changeNoteHandler(comp, e)} />

const serializeContent = function(editorState) {
  const contentState = editorState.getCurrentContent();
  const rawData = convertToRaw(contentState);
  return JSON.stringify(rawData);
}

const deserializeContent = function(note) {
  if (note != null) {
    var contentState = null

    try {
      const rawData = JSON.parse(note);
      contentState = convertFromRaw(rawData);
    } catch (e) {
      contentState = ContentState.createFromText(note)
    }

    return EditorState.createWithContent(contentState);
  } else {
    return EditorState.createEmpty();
  }
}

const changeNameHandler = function(comp, e){
  comp.state.node.name = e.target.value
  comp.setState({})
  fireEvent('state', 'change')
}

const changeLinkHandler = function(comp, e){
  comp.state.node.link = e.target.value
  comp.setState({})
  fireEvent('state', 'change')
}

const changeNoteHandler = function(comp, e){
  comp.state.node.note = e.target.value
  comp.setState({})
  fireEvent('state', 'change')
}

const changeMarkerHandler = function(comp, e){
  comp.state.node.marker = e.target.value
  comp.setState({})
  fireEvent('state', 'change')
}

const getFooterButtonsUI = function(node, editorState) {
    const showDelete = node.left != null && node.right != null
    return <div>
        {showDelete? <Button id='close' onClick={()=>{fireEvent('state', 'panel-remove', [node]); fireEvent('node-modal', 'close')}} variant="danger" style={{marginRight:'5px'}} >Delete</Button>: null}
        <Button id='close' onClick={()=>closeButtonHandler(node, editorState)} variant="primary">Close</Button>
    </div>
}

const closeButtonHandler = function(node, editorState) {
  const initNote = node.note
  node.note = serializeContent(editorState)

  if (initNote != node.note) {
    fireEvent('state', 'change')
  }

  fireEvent('node-modal', 'close')
}