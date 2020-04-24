import React from 'react';
import ReactDOM from 'react-dom';
// import Modal from 'react-modal';
import {Modal, Button} from 'react-bootstrap'

import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'

//props: title, isOpen, okHandler, cancelHandler, styleClass
export class FileModal extends React.Component{
  constructor(props){
    super(props)

    registerObject('file-modal', {isOpen: false})
    registerEvent('file-modal', 'open', (stSetter, current)=>{
      stSetter('current', current)
      stSetter('isOpen', true)
      this.setState({})
    })
    registerEvent('file-modal', 'close', (stSetter)=>{
      stSetter('current', null)
      stSetter('isOpen', false)
      this.setState({})
    })
  }

  render(){
    const file = chkSt('file-modal', 'current')
    return (
      <Modal show={chkSt('file-modal', 'isOpen')} dialogClassName='file-modal-style'>
            <Modal.Header>
              <Modal.Title>File details {file!=null? file.name :''}</Modal.Title>
            </Modal.Header>
            <div style={{margin:'5px'}}>
              TODO
            </div>
            <Modal.Footer>
              <Button onClick={()=>fireEvent('file-modal', 'close')} bsStyle="primary">Close</Button>
            </Modal.Footer>
      </Modal>
    )
  }
}
