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
    registerEvent('file-modal', 'close', (stSetter)=>doClose(this, stSetter))
    registerReaction('file-modal', 'commands', 'deleted', (stSetter)=>doClose(this, stSetter))
  }

  render(){
    const current = chkSt('file-modal', 'current')
    return (
      <Modal show={chkSt('file-modal', 'isOpen')} dialogClassName='file-modal-style'>
            <Modal.Header>
              <Modal.Title>File(s) details</Modal.Title>
            </Modal.Header>
            <div style={{margin:'5px'}}>
              {getModalBody(current)}
            </div>
            <Modal.Footer>
              <Button onClick={()=>fireEvent('commands', 'delete', [current])} variant="danger">Delete</Button>
              <Button onClick={()=>fireEvent('file-modal', 'close')} variant="primary">Close</Button>
            </Modal.Footer>
      </Modal>
    )
  }
}

const doClose = function(comp, stSetter){
  stSetter('current', null)
  stSetter('isOpen', false)
  comp.setState({})
}

const getModalBody = function(current){
  if(current==null){
    return 'TODO'
  }
  if(Array.isArray(current)){
    return getFilesIU(current)
  } else {
    return current.name
  }
}

const getFilesIU = function(current){
  const result = []
  current.forEach(f=>result.push(<div>{f.name}</div>))
  return <div>{result}</div>
}
