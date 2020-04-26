import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'
import {sendPost} from './postoffice'

registerEvent('commands', 'open', (stSetter, path)=>{
  sendPost('/command/open', path, ()=>{})
})

registerEvent('commands', 'delete', (stSetter, files)=>{
  if(Array.isArray(files)){
      sendPost('/command/trash/move/multiple', files, ()=>{fireEvent('commands', 'deleted')})
      return files[0].path
  } else {
      sendPost('/command/trash/move', files, ()=>{fireEvent('commands', 'deleted')})
      return files.path
  }
})

registerEvent('commands', 'deleted', (stSetter)=>{})

registerEvent('commands', 'clean-trash', (stSetter)=>{
  sendPost('/command/trash/clean', null, ()=>{})
})
