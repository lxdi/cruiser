import React from 'react';
import ReactDOM from 'react-dom';
import {Button, Form} from 'react-bootstrap'
import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'
import {getPath, getName, isDir} from '../services/pathUtils'
import {getSeparator} from '../services/separator'

registerEvent('panels', 'switch-current', ()=>{})

const panelNamePrefix = 'panel-'

export class Panel extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      panelName : panelNamePrefix + props.name
    }
    registerEvent(this.state.panelName, 'change-dir', (stSetter, newCwd) => handleChangeDir(this, stSetter, newCwd))
    registerEvent(this.state.panelName, 'back', (stSetter)=>handleBack(this, stSetter))
    registerEvent(this.state.panelName, 'select', (stSetter, file)=>handleSelect(this, stSetter, file))
    registerReaction(this.state.panelName, 'panels', 'switch-current', (stSetter)=>{stSetter('current', !chkSt(this.state.panelName, 'current')); this.setState({})})
    registerReaction(this.state.panelName, 'gstate', 'got', ()=>this.setState({}))
    registerReaction(this.state.panelName, 'files-rep', 'files-received', ()=>this.setState({}))
    registerReaction(this.state.panelName, 'commands', ['deleted', 'copied', 'moved', 'renamed', 'dir-created'], (stSetter)=>{stSetter('selected', []);this.setState({})})
  }

  render(){
    if(chkSt('gstate', 'stateObj')!=null){
      const cwd = chkSt('gstate', 'stateObj').panels[this.props.name].cwd
      return <div class='panel-main' style={{"border": chkSt(this.state.panelName, 'current')==true?"2px solid blue":"1px solid lightblue"}}>
            <div onClick={()=>fireEvent('panels', 'switch-current')}>
              <span>{getPath(cwd)}</span>
              <span style={{fontWeight: 'bold'}}>{getName(cwd)}</span>
            </div>
            <div>{getFilesUI(this)}</div>
          </div>
    } else {
      return 'Loading...'
    }
  }

}

const handleChangeDir = function(comp, stSetter, newCwd){
  chkSt('gstate', 'stateObj').panels[comp.props.name].cwd = newCwd
  stSetter('selected', [])
  if(chkSt('files-rep', newCwd)==null){
    fireEvent('files-rep', 'get-files-by-path', [newCwd])
  }
  fireEvent('gstate', 'update-cwd', [comp.props.name, newCwd])
  comp.setState({})
}

const handleBack = function(comp, stSetter){
  const cwd = chkSt('gstate', 'stateObj').panels[comp.props.name].cwd
  var newCwd = getSeparator()
  if(cwd!=getSeparator() && cwd.lastIndexOf(getSeparator())>0){
    newCwd = getPath(cwd)
  }
  handleChangeDir(comp, stSetter, newCwd)
}

const handleSelect = function(comp, stSetter, file){
  const selectedArr = chkSt(comp.state.panelName, 'selected')
  if(selectedArr.includes(file)){
    selectedArr.splice(selectedArr.indexOf(file), 1)
  } else {
    selectedArr.push(file)
  }
  if(!chkSt(comp.state.panelName, 'current')){
    fireEvent('panels', 'switch-current')
  }
  comp.setState({})
}

const getFilesUI = function(comp){
  const files = chkSt('files-rep', chkSt('gstate', 'stateObj').panels[comp.props.name].cwd)
  if(files!=null){
    const dirsUI = []
    const filesUI = []//files.map(f => <div> <a href="#">{f.name} </a></div>)
    files.sort((f1, f2) => sortByLong(f1.lastModified, f2.lastModified, 'desc'))
    files.forEach(f => {
      if(isDir(f.path)){
        dirsUI.push(getFileEntryTrUI(comp, f))
      } else {
        filesUI.push(getFileEntryTrUI(comp, f))
      }
    })
    return <table style={{'width': '100%'}}>
              <tr class='file-div'>
                <td colspan='5'>
                  <div onClick={()=>{fireEvent(comp.state.panelName, 'back')}}> <a href="#" > .. </a></div>
                </td>
              </tr>
              {dirsUI}
              {filesUI}
          </table>
  } else {
    fireEvent('files-rep', 'get-files-by-path', [chkSt('gstate', 'stateObj').panels[comp.props.name].cwd])
    return 'Loading...'
  }
}

const getFileEntryTrUI = function(comp, file){
  const panelName = comp.state.panelName
  const selected = chkSt(comp.state.panelName, 'selected')
  const isSelected = selected.includes(file)
  const style = isSelected? {'background-color': 'lightBlue'}: {}
  const toModal = selected.length>0? selected: [file]
  return <tr id={getName(file.path)+isSelected} style={style} class='file-div' onClick={(event)=>hanldeFileEntryClick(comp, file, event)}>
            <td><div class='bullet' style={{'width': '15px', 'text-align':'center'}} onClick={(e)=>{fireEvent(panelName, 'select', [file]); e.preventDefault()}}>&bull;</div></td>
            <td width='75%' style={{'paddingLeft':'3px'}}> {getFileNameUI(file)} </td>
            <td width='10%' style={{'color': getColorForSize(file)}}>{formatBytes(file.size)}</td>
            <td width='10%'>{formatDate(new Date(file.lastModified))}</td>
            <td width='5%'><a href='#' onClick={(event)=>{fireEvent('file-modal', 'open', [toModal, comp.state.panelName]); event.preventDefault()}}>More</a></td>
        </tr>
}

const hanldeFileEntryClick = function(comp, file, event){
  if(!event.defaultPrevented){
    if(isDir(file.path)) fireEvent(comp.state.panelName, 'change-dir', [file.path])
    else fireEvent('commands', 'open', [file.path])
  }
}

const getFileNameUI = function(file){
  if(isDir(file.path)){
    return <div class='file-link' style={{'color': 'orange'}}>[{getName(file.path)}]</div>
  } else {
    return <div class='file-link' style={{'color': 'grey'}}>{getName(file.path)} </div>
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

export const getOppositePanelNameShort = function(currentPanelName){
  return getPanelNameShort(currentPanelName)=='left'? 'right':'left'
}

export const getPanelNameShort = function(panelName){
  return panelName.substr(panelName.lastIndexOf('-') - panelName.length+1)
}

export const getCurrentPanel = function(){
  if(chkSt('panel-left', 'current')){
    return 'panel-left'
  } else {
    return 'panel-right'
  }
}

export const getCurrentPanelShort = function(){
  return getPanelNameShort(getCurrentPanel())
}
