import React from 'react';
import ReactDOM from 'react-dom';

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
            <a href='#' onClick={()=>fireEvent('panel-left', 'change-dir', [b.path])}>{b.name}</a>
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
          <div> -/- </div>
          {fileBookmarks}
        </div>
}
