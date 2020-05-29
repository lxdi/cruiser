import React from 'react';
import ReactDOM from 'react-dom';
import {Button, Form, Tabs, Tab} from 'react-bootstrap'
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
      const panel = chkSt('gstate', 'stateObj').panels[this.props.name]
      const tabPaths = panel.tabs
      const currentPath = tabPaths[panel.current]
      const tabsUI = tabPaths.map((path, idx)=><Tab eventKey={idx} title={getName(path)}>{getTabContent(this, path)}</Tab>)
      return <div class={'panel-main ' + (chkSt(this.state.panelName, 'current')==true?'panel-current':'panel-non-current')}>
                <Tabs activeKey={panel.current} onSelect={(e)=>handleSelectTab(this, e, panel)}>
                    {tabsUI}
                    <Tab eventKey="add" title="+ Add">
                      Hello
                    </Tab>
                  </Tabs>
            </div>
    } else {
      return 'Loading...'
    }
  }

}

const handleChangeDir = function(comp, stSetter, newCwd){
  const panelFromState = chkSt('gstate', 'stateObj').panels[comp.props.name]
  panelFromState.tabs[panelFromState.current] = newCwd
  stSetter('selected', [])
  if(chkSt('files-rep', newCwd)==null){
    fireEvent('files-rep', 'get-files-by-path', [newCwd])
  }
  fireEvent('gstate', 'update-cwd', [comp.props.name, newCwd, panelFromState.current])
  comp.setState({})
}

const handleBack = function(comp, stSetter){
  const panelFromState = chkSt('gstate', 'stateObj').panels[comp.props.name]
  const cwd = panelFromState.tabs[panelFromState.current]
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

const handleSelectTab = function(comp, e, panel){
  if(e!=='add'){
    panel.current = e
    comp.setState({})
  }
}

const getTabContent = function(comp, cwd){
  return <div>
            <div onClick={()=>fireEvent('panels', 'switch-current')}>
              <span>{getPath(cwd)}</span>
              <span style={{fontWeight: 'bold'}}>{getName(cwd)}</span>
            </div>
            <div>{getFilesUI(comp, cwd)}</div>
          </div>
}

const getFilesUI = function(comp, cwd){
  const files = chkSt('files-rep', cwd)
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
    fireEvent('files-rep', 'get-files-by-path', [cwd])
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
            <td width='10%' class={getStyleForSize(file)}>{formatBytes(file.size)}</td>
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
    return <div class={'file-link ' + getClassForFile(file)}>[{getName(file.path)}]</div>
  } else {
    return <div class={'file-link '+ getClassForFile(file)}>{getName(file.path)} </div>
  }
}

const getClassForFile = function(file){
  const defaultClass = 'file-name-default'
  if(file==null || file.mime==null) return defaultClass
  if(file.mime == 'dir') return 'file-name-dir'
  if(file.mime.includes('pdf')) return 'file-name-pdf'
  if(file.mime.includes('video')) return 'file-name-video'
  if(file.mime.includes('image')) return 'file-name-image'
  return defaultClass
}

const getStyleForSize = function(file){
  if(file.size < 1024) return 'file-size-bt'
  if(file.size < 1024000) return 'file-size-kb'
  if(file.size < 1024000000) return 'file-size-mb'
  if(file.size < 1024000000000) return 'file-size-gb'
  return 'file-size-dt'
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
