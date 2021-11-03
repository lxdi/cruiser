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
    registerEvent('create-new-modal', 'open', (stSetter, isFolder)=>this.setState({isOpen:true, newName: '', isFolder: isFolder, content: ''}))
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
                  placeholder={"Enter name"}
                  onChange={(e)=>changeNameHandler(this, e)}/>
            </div>
            <div>
              {contentUI(this)}
            </div>
            <Modal.Footer>
              {this.state.newName!=''?<Button id='copy' onClick={()=>okHandler(this)} variant="success">Ok</Button>:null}
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

const contentUI = function(comp){
  if(!comp.state.isFolder){
    return <Form.Control as="textarea" size='sm' rows={20} value={comp.state.content}
                          onChange={(e)=>comp.setState({content: e.target.value})} />
  }
}

const okHandler = function(comp){
  const panel = chkSt('gstate', 'stateObj').panels[getCurrentPanelShort()]
  if(comp.state.isFolder){
    fireEvent('commands', 'create-new-dir', [panel.tabs[panel.current] + comp.state.newName])
  } else {
    fireEvent('commands', 'create-new-file-txt', [panel.tabs[panel.current] + comp.state.newName, comp.state.content])
  }

}
