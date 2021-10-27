import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'
import {sendPost} from './postoffice'

import {getTrashBookmark} from '../services/stateUtils'

registerObject('files-rep', {})

registerEvent('files-rep', 'get-files-by-path', (stateSetter, path)=>{
  sendPost('/file/get/all', path, (files) => fireEvent('files-rep', 'files-received', [path, files]))
})

registerEvent('files-rep', 'files-received', (stSetter, path, files)=>{
  stSetter(path, files)
})

registerEvent('files-rep', 'get-file-content', (stateSetter, path)=>{
  sendPost('/file/get/content', path, (content) => fireEvent('files-rep', 'file-content-received', [path, content]))
})

registerEvent('files-rep', 'file-content-received', (stSetter, path, content)=>{
  if(content == null){
    return
  }
  stSetter(path, content)
})

registerReaction('files-rep', 'commands', ['delete', 'copy', 'move', 'update', 'create-new-dir'], (stSetter, paths)=>{
  paths.forEach(path => stSetter(path, null))
  stSetter(getTrashBookmark().path, null)
})
