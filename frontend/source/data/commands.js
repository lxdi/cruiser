import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'
import {sendPost} from './postoffice'

registerEvent('commands', 'open', (stSetter, path)=>{
  sendPost('/command/open', path, ()=>{})
})

registerEvent('commands', 'delete', (stSetter, path)=>{
  sendPost('/command/trash/move', path, ()=>{fireEvent('commands', 'deleted')})
})
registerEvent('commands', 'deleted', (stSetter)=>{})

registerEvent('commands', 'clean-trash', (stSetter)=>{
  sendPost('/command/trash/clean', null, ()=>{})
})
