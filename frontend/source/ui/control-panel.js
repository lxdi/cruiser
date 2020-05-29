import React from 'react';
import ReactDOM from 'react-dom';
import {Button} from 'react-bootstrap'
import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'
import {getOppositePanelNameShort, getCurrentPanel} from './panel'

import {SpinnerWrapper} from './spinner'

const buttonStyle = {marginTop:'3px', width: '100px'}

export class ControlPanel extends React.Component {
  constructor(props){
    super(props)

    registerReaction('control-panel', 'gstate', 'got', ()=>this.setState({}))
    registerReaction('control-panel', 'panel-left', 'select', ()=>this.setState({}))
    registerReaction('control-panel', 'panel-right', 'select', ()=>this.setState({}))
    registerReaction('control-panel', 'panels', 'switch-current', ()=>this.setState({}))
    registerReaction('control-panel', 'commands', ['deleted', 'copied', 'moved', 'renamed'], ()=>this.setState({}))
  }

  render(){
    return <div class = 'control-panel-main'>
            <div style = {{'padding': '3px'}}>
              {getBookmarksUI(this)}
            </div>
          </div>
  }
}

const getBookmarksUI = function(comp){
  const dirBookmarks = []
  const fileBookmarks = []
  const stateObj = chkSt('gstate', 'stateObj')
  if(stateObj!=null && stateObj.bookmarks!=null && stateObj.bookmarks.length>0){
    stateObj.bookmarks.forEach((b)=>{
      if(b.type == 'dir'){
        dirBookmarks.push(<div>
            <a href='#' onClick={()=>fireEvent(getCurrentPanel(), 'change-dir', [b.path])}>{b.name}</a>
          </div>)
      } else {
        fileBookmarks.push(<div>
            <a href='#' onClick={()=>fireEvent('commands', 'open', [b.path])}>{b.name}</a>
          </div>)
      }
    })
  }
  return <div>
          {dirBookmarks}
          {getDeviderUI()}
          {fileBookmarks}
          {getDeviderUI()}
          <div>
            <div style={buttonStyle}><Button variant='info' size='sm' block onClick={()=>fireEvent('create-new-modal', 'open')}>Create Dir</Button></div>
            <div style={buttonStyle}><Button variant='warning' size='sm' block onClick={()=>fireEvent('commands', 'clean-trash')}>Clean trash</Button></div>
          </div>
          {getDeviderUI()}
          {getPanelSpecificControlsUI()}
          {getDeviderUI()}
          <SpinnerWrapper/>
        </div>
}

const getDeviderUI = function(){
  return <div style={{'borderBottom': '1px solid lightgrey', 'margin': '5px'}}> </div>
}

const getPanelSpecificControlsUI = function(){
  const selected = chkSt(getCurrentPanel(), 'selected')
  if(selected!=null && selected.length>0){
    const oppositePanelCwd = chkSt('gstate', 'stateObj').panels[getOppositePanelNameShort(getCurrentPanel())].tabs[0]
    const filesPaths = []
    selected.forEach(f => filesPaths.push(f.path))
    return <div>
              <div style={buttonStyle}><Button variant='success' size='sm' block onClick={()=>fireEvent('commands', 'copy', [filesPaths, oppositePanelCwd])}>Copy</Button></div>
              <div style={buttonStyle}><Button variant='warning' size='sm' block onClick={()=>fireEvent('commands', 'move', [filesPaths, oppositePanelCwd])}>Move</Button></div>
              <div style={buttonStyle}><Button variant='danger' size='sm' block onClick={()=>fireEvent('commands', 'delete', [selected])}>Delete</Button></div>
          </div>
  }
}
