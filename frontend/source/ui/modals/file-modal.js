import React from 'react';
import ReactDOM from 'react-dom';
import {Modal, Button, Form} from 'react-bootstrap'
import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'
import {getName, getPath, isDir} from '../../services/pathUtils'
import {getSeparator} from '../../services/separator'
import {getOppositePanelNameShort} from './../panel'

export class FileModal extends React.Component{
  constructor(props){
    super(props)

    registerObject('file-modal', {isOpen: false})
    registerEvent('file-modal', 'open', (stSetter, files, panelName)=>doOpen(this, stSetter, files, panelName))
    registerEvent('file-modal', 'close', (stSetter)=>doClose(this, stSetter))
    registerReaction('file-modal', 'commands', ['deleted', 'copied', 'moved', 'updated'], (stSetter)=>doClose(this, stSetter))
    registerReaction('file-modal', 'files-rep', ['file-content-received'], (stSetter)=>this.setState({}))
  }

  render(){
    const files = chkSt('file-modal', 'files')
    return (
      <Modal show={chkSt('file-modal', 'isOpen')} dialogClassName='file-modal-style'>
            <Modal.Header>
              <Modal.Title>File(s) details</Modal.Title>
            </Modal.Header>
            <div style={{margin:'5px'}}>
              {getModalBody(this, files)}
            </div>
            <Modal.Footer>
              {chkSt('file-modal', 'isOpen')? getFooterButtonsUI(this, files):''}
            </Modal.Footer>
      </Modal>
    )
  }
}

const doOpen = function(comp, stSetter, files, panelName){
  stSetter('files', files)
  stSetter('panelName', panelName)
  stSetter('isOpen', true)
  if(files!=null && files.length==1){
    comp.setState({newName: getName(files[0].path)})
  }
  comp.setState({})
}

const doClose = function(comp, stSetter){
  stSetter('current', null)
  stSetter('files', null)
  stSetter('isOpen', false)
  comp.setState({changed: null, newName: null})
}

const getModalBody = function(comp, files){
  if(files==null){
    return ''
  }
  if(files.length>1){
    return getFilesIU(files)
  } else {
    return getSingleFileIU(comp, files[0])
  }
}

const getSingleFileIU = function(comp){
  const file = chkSt('file-modal', 'files')[0]
  return <div>
          <div>
              <Form.Control
                  type="text"
                  value={comp.state.newName}
                  placeholder={"Enter placeholder"}
                  onChange={(e)=>changeNameHandler(comp, e)}/>
          </div>
          <div>
            {getContentUI(comp, file.path)}
          </div>
      </div>
}

const getContentUI = function(comp, path){
  const content = chkSt('files-rep', path)

  if(content == null){
    fireEvent('files-rep', 'get-file-content', [path])
    return null
  }

  if(content.content == null){
    return null
  }

  return <Form.Control as="textarea" size='sm' rows={20} value={content.content}
                        onChange={(e)=>changeContentHandler(comp, content, e)} />

}

const changeNameHandler = function(comp, e){
  const newName = e.target.value
  if(newName.includes(getSeparator())){
    return
  }
  comp.setState({changed: true, newName: newName})
}

const changeContentHandler = function(comp, content, e){
  content.content = e.target.value
  comp.setState({changed: true})
}

const getFilesIU = function(files){
  const result = []
  files.forEach(f=>result.push(<div>{getName(f.path)}</div>))
  return <div>{result}</div>
}

const getFooterButtonsUI = function(comp, files){
  const oppositePanel = chkSt('gstate', 'stateObj').panels[getOppositePanelNameShort(chkSt('file-modal', 'panelName'))]
  const oppositePanelCwd = oppositePanel.tabs[oppositePanel.current]
  const filesPaths = []
  files.forEach(f => filesPaths.push(f.path))

  return [
    comp.state.changed==true? <Button id='update' onClick={()=>fireEvent('commands', 'update', [files[0].path, comp.state.newName, chkSt('files-rep', files[0].path)])} variant="info">Save</Button>:null,
    files.length==1 && !isDir(files[0].path)? <Button id='download' onClick={()=>fireEvent('commands', 'download', [files[0]])} variant="primary">Download</Button>:null,
    <Button id='copy' onClick={()=>fireEvent('commands', 'copy', [filesPaths, oppositePanelCwd])} variant="success">Copy</Button>,
    <Button id='move' onClick={()=>fireEvent('commands', 'move', [filesPaths, oppositePanelCwd])} variant="warning">Move</Button>,
    <Button id='delete' onClick={()=>fireEvent('commands', 'delete', [files])} variant="danger">Delete</Button>,
    <Button id='close' onClick={()=>fireEvent('file-modal', 'close')} variant="primary">Close</Button>
  ]
}
