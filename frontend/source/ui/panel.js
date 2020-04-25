import React from 'react';
import ReactDOM from 'react-dom';
import {Button} from 'react-bootstrap'

import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'

registerEvent('panels', 'switch-current', ()=>{})

var separator = null

export class Panel extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      panelName : 'panel-' + props.name
    }
    registerObject(this.state.panelName, {'current': props.current})
    registerEvent(this.state.panelName, 'change-dir', (stSetter, newCwd) => handleChangeDir(this, stSetter, newCwd))
    registerEvent(this.state.panelName, 'back', (stSetter)=>handleBack(this, stSetter))
    registerReaction(this.state.panelName, 'panels', 'switch-current', (stSetter)=>{stSetter('current', !chkSt(this.state.panelName, 'current')); this.setState({})})
    registerReaction(this.state.panelName, 'gstate', 'got', ()=>this.setState({}))
    registerReaction(this.state.panelName, 'files-rep', 'files-received', ()=>this.setState({}))
    //fireEvent('files-rep', 'get-files-by-path', [chkSt(this.state.panelName, 'cwd')])
  }

  render(){
    if(chkSt('gstate', 'stateObj')!=null){
      return <div class='panel-main' style={{"border": chkSt(this.state.panelName, 'current')==true?"2px solid blue":"1px solid lightblue"}}>
            <div onClick={()=>fireEvent('panels', 'switch-current')}>{chkSt('gstate', 'stateObj').panels[this.props.name].cwd}</div>
            <div>{getFilesUI(this)}</div>
          </div>
    } else {
      return 'Loading...'
    }
  }

}

const handleChangeDir = function(comp, stSetter, newCwd){
  chkSt('gstate', 'stateObj').panels[comp.props.name].cwd = newCwd
  fireEvent('files-rep', 'get-files-by-path', [newCwd])
  fireEvent('gstate', 'update-cwd', [comp.props.name, newCwd])
  comp.setState({})
}

const handleBack = function(comp, stSetter){
  const cwd = chkSt('gstate', 'stateObj').panels[comp.props.name].cwd
  var newCwd = getSeparator()
  if(cwd!=getSeparator() && cwd.lastIndexOf(getSeparator())>0){
    newCwd = cwd.substring(0, cwd.lastIndexOf(getSeparator()))
    newCwd = newCwd.substring(0, newCwd.lastIndexOf(getSeparator()))+getSeparator()
  }
  chkSt('gstate', 'stateObj').panels[comp.props.name].cwd = newCwd
  fireEvent('gstate', 'update-cwd', [comp.props.name, newCwd])
  //fireEvent('files-rep', 'get-files-by-path', [newCwd])
  comp.setState({})
}

const getSeparator = function(){
  if(separator==null){
    if(chkSt('gstate', 'stateObj').system.toLowerCase().includes('windows')){
      separator = '\\'
    } else {
      separator = '/'
    }
  }
  return separator
}

const getFilesUI = function(comp){
  const files = chkSt('files-rep', chkSt('gstate', 'stateObj').panels[comp.props.name].cwd)
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
                <td></td>
              </tr>
              {dirsUI}
              {filesUI}
          </table>
  } else {
    fireEvent('files-rep', 'get-files-by-path', [chkSt('gstate', 'stateObj').panels[comp.props.name].cwd])
    return 'Loading...'
  }
}
// /onClick={()=>hanldeFileEntryClick(comp, file)}
const getFileEntryTrUI = function(comp, file){
  return <tr class='file-div' onClick={(event)=>hanldeFileEntryClick(comp, file, event)}>
            <td width='75%' style={{'paddingLeft':'3px'}}> {getFileNameUI(file)} </td>
            <td width='10%' style={{'color': getColorForSize(file)}}>{formatBytes(file.size)}</td>
            <td width='10%'>{formatDate(new Date(file.lastModified))}</td>
            <td width='5%'><a href='#' onClick={(event)=>{fireEvent('file-modal', 'open', [file]); event.preventDefault()}}>More</a></td>
        </tr>
}

const hanldeFileEntryClick = function(comp, file, event){
  if(!event.defaultPrevented){
    if(file.isDir) fireEvent(comp.state.panelName, 'change-dir', [file.path + file.name + getSeparator()])
    else fireEvent('commands', 'open', [file.path+file.name])
  }
}

const getFileNameUI = function(file){
  if(file.isDir){
    return <div class='file-link' style={{'color': 'orange'}}>[{file.name}]</div>
  } else {
    return <div class='file-link' style={{'color': 'grey'}}>{file.name} </div>
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
    if (bytes === 0) return '0 By';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['By', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
