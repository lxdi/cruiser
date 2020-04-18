import React from 'react';
import ReactDOM from 'react-dom';
import {Button} from 'react-bootstrap'

import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'

export class Panel extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      panelName : 'panel ' + props.name
    }
    registerObject(this.state.panelName, {'cwd':'/'})
    registerEvent(this.state.panelName, 'change-dir', (stSetter, file) => handleChangeDir(this, stSetter, file))
    registerEvent(this.state.panelName, 'back', (stSetter)=>handleBack(this, stSetter))
    registerReaction(this.state.panelName, 'files-rep', 'files-received', ()=>this.setState({}))
    fireEvent('files-rep', 'get-files-by-path', [chkSt(this.state.panelName, 'cwd')])
  }

  render(){
    return <div class='panel-main'>
            <div>{chkSt(this.state.panelName, 'cwd')}</div>
            <div>{getFilesUI(this)}</div>
          </div>
  }

}

const handleChangeDir = function(comp, stSetter, file){
  const newCwd = file.path + file.name
  stSetter('cwd', newCwd)
  fireEvent('files-rep', 'get-files-by-path', [newCwd])
  comp.setState({})
}

const handleBack = function(comp, stSetter){
  const cwd = chkSt(comp.state.panelName, 'cwd')
  var newCwd = '/'
  if(cwd!='/' && cwd.lastIndexOf('/')>0){
    newCwd = cwd.substring(0, cwd.lastIndexOf('/'))
  }
  stSetter('cwd', newCwd)
  //fireEvent('files-rep', 'get-files-by-path', [newCwd])
  comp.setState({})
}

const getFilesUI = function(comp){
  const files = chkSt('files-rep', chkSt(comp.state.panelName, 'cwd'))
  if(files!=null){
    const dirsUI = []
    const filesUI = []//files.map(f => <div> <a href="#">{f.name} </a></div>)
    files.sort((f1, f2) => sortByLong(f1.lastModified, f2.lastModified, 'desc'))
    files.forEach(f => {
      if(f.isDir){
        dirsUI.push(getFileEntryTrUI(comp, f))
      } else {
        filesUI.push(getFileEntryTrUI(comp, f))
      }
    })
    return <table style={{'width': '100%'}}>
              <tr class='file-div'>
                <td>
                  <div onClick={()=>fireEvent(comp.state.panelName, 'back')}> <a href="#" > .. </a></div>
                </td>
                <td></td>
                <td></td>
              </tr>
              {dirsUI}
              {filesUI}
          </table>
  } else {
    return 'Loading...'
  }
}

const getFileEntryTrUI = function(comp, file){
  return <tr class='file-div' onClick={()=>{if(file.isDir)fireEvent(comp.state.panelName, 'change-dir', [file])}}>
            <td width='70%' style={{'paddingLeft':'3px'}}> {getFileNameUI(file)} </td>
            <td width='20%' style={{'color': getColorForSize(file)}}>{formatBytes(file.size)}</td>
            <td width='10%'>{formatDate(new Date(file.lastModified))}</td>
        </tr>
}

const getFileNameUI = function(file){
  if(file.isDir){
    return <div style={{'color': 'orange'}}> [{file.name}]</div>
  } else {
    return <div style={{'color': 'grey'}}> {file.name}</div>
  }
}

const getColorForSize = function(file){
  if(file.size < 1024) return 'blue'
  if(file.size < 1024000) return 'green'
  if(file.size < 1024000000) return 'orange'
  if(file.size < 1024000000000) return 'red'
  return 'black'
}

const formatDate = function(date){
  var day = date.getDate()
  var month=date.getMonth();
  month=month+1;
  if(day<10) day='0'+day;
  if(month<10) month='0'+month;
  return day+ '.' + month + '.' + date.getFullYear();
}

const sortByLong = function(val1, val2, order){
  if(val1===val2){
    return 0
  }
  if(val1>val2){
    return order=='desc'? -1: 1
  } else {
    return order=='desc'? 1: -1
  }
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
