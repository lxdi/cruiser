
import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'

var separator = null

export const getSeparator = function(){
  if(separator==null){
    if(chkSt('gstate', 'stateObj').system.toLowerCase().includes('windows')){
      separator = '\\'
    } else {
      separator = '/'
    }
  }
  return separator
}
