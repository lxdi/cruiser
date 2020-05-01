import React from 'react';
import ReactDOM from 'react-dom';
import {Modal, Button, Form} from 'react-bootstrap'
import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'
import {getCurrentPanelShort} from './../panel'
import {getSeparator} from './../../services/separator'

export class CreateNewModal extends React.Component{
  constructor(props){
    super(props)
    this.state = {newName:''}
    registerObject('create-new-modal', {isOpen: false})
    registerEvent('create-new-modal', 'open', ()=>this.setState({isOpen:true, newName: ''}))
    registerEvent('create-new-modal', 'close', ()=>this.setState({isOpen:false}))
    registerReaction('create-new-modal', 'commands', 'dir-created', ()=>this.setState({isOpen:false}))
  }

  render(){
    return (
      <Modal show={this.state.isOpen} dialogClassName='file-modal-style'>
            <Modal.Header>
              <Modal.Title>Create New</Modal.Title>
            </Modal.Header>
            <div style={{margin:'5px'}}>
              <Form.Control
                  type="text"
                  value={this.state.newName}
                  placeholder={"Enter placeholder"}
                  onChange={(e)=>changeNameHandler(this, e)}/>
            </div>
            <Modal.Footer>
              <Button id='copy' onClick={()=>fireEvent('commands', 'create-new-dir', [chkSt('gstate', 'stateObj').panels[getCurrentPanelShort()].cwd + this.state.newName])} variant="success">Ok</Button>
              <Button id='copy' onClick={()=>fireEvent('create-new-modal', 'close')} variant="danger">Cancel</Button>
            </Modal.Footer>
      </Modal>
    )
  }
}

const changeNameHandler = function(comp, e){
  const newName = e.target.value
  if(newName.includes(getSeparator())){
    return
  }
  comp.setState({newName: newName})
}
