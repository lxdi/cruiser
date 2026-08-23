import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'

registerEvent('key-press-handler', 'press', (stSetter, event)=>{

  if(event.key=='Control' ||  event.key =='Meta'){
    fireEvent('state', 'multiple-select-on')
  }

  if(event.key=='Tab' && isSelectedNotEmpty()){
    event.preventDefault()
    fireEvent('state', 'create-new')
  }

  if (event.key == 'Backspace' && isSelectedNotEmpty()) {
    fireEvent('state', 'delete')
  }

  const isModifierPressed = event.ctrlKey || event.metaKey

  if (isModifierPressed && event.code === 'KeyX' && isSelectedNotEmpty()) {
    fireEvent('clipboard', 'cut')
  }

  if (isModifierPressed && event.code === 'KeyV' && isSelectedNotEmpty()) {
    fireEvent('clipboard', 'paste')
  }

  if (isModifierPressed && event.code === 'KeyS') {
    event.preventDefault()
    fireEvent('state', 'save')
  }

  if (isModifierPressed && event.code === 'KeyZ') {
    event.preventDefault()
    fireEvent('state', 'restore')
  }

})

registerEvent('key-press-handler', 'release', (stSetter, event)=>{

  if(event.key=='Control' ||  event.key =='Meta'){
    fireEvent('state', 'multiple-select-off')
  }
})

const isSelectedNotEmpty = function() {
  return chkSt('state', 'selected') != null && chkSt('state', 'selected').length > 0
}