import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'

registerEvent('key-press-handler', 'press', (stSetter, event)=>{
  if(event.key=='Tab'){
    fireEvent('panels', 'switch-current', [chkSt('panel-left', 'current')==true?'panel-right':'panel-left'])
    event.preventDefault()
  }
})
