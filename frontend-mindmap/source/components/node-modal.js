import React from 'react';
import ReactDOM from 'react-dom';
import {Modal, Button, Form} from 'react-bootstrap'
import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'


export class NodeModal extends React.Component{
  constructor(props){
    super(props)

    this.state = {isOpen: false}
    //registerObject('node-modal', {isOpen: false})
    registerEvent('node-modal', 'open', (stSetter, node) => this.setState({isOpen: true, node: node}))
    registerEvent('node-modal', 'close', (stSetter)=>this.setState({isOpen:false, node: null}))
    
  }

  render(){
    return (
      <Modal show={this.state.isOpen} dialogClassName='node-modal-style'>
            <Modal.Header>
              <Modal.Title>Node details</Modal.Title>
            </Modal.Header>
            <div style={{margin:'5px'}}>
              {getModalBody(this)}
            </div>
            <Modal.Footer>
              {this.state.isOpen? getFooterButtonsUI():''}
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
                <Form.Control as="textarea" size='sm' rows={20} value={comp.state.node.note} onChange={(e)=>changeNoteHandler(comp, e)} />
                <Form.Control placeholder = 'Link' type="text" value={comp.state.node.link} onChange={(e)=>changeLinkHandler(comp, e)}/>
                <Form.Control placeholder = 'Marker' type="text" value={comp.state.node.marker} onChange={(e)=>changeMarkerHandler(comp, e)}/>
              </div>
          </div>
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

const getFooterButtonsUI = function() {
    return <Button id='close' onClick={()=>fireEvent('node-modal', 'close')} variant="primary">Close</Button>
}