import React from 'react';
import ReactDOM from 'react-dom';

import {Button} from 'react-bootstrap'

import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'

export class ControlPanel extends React.Component {
  constructor(props){
    super(props)

    registerReaction('control-panel', 'gstate', 'got', ()=>this.setState({}))
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
          <Button variant='warning' size='sm' onClick={()=>fireEvent('commands', 'clean-trash')}>Clean trash</Button>
        </div>
}

const getDeviderUI = function(){
  return <div style={{'borderBottom': '1px solid lightgrey', 'margin': '5px'}}> </div>
}

const getCurrentPanel = function(){
  if(chkSt('panel-left', 'current')){
    return 'panel-left'
  } else {
    return 'panel-right'
  }
}
