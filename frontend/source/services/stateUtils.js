import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'

export const getTrashBookmark = function(){
  return getBookmarkByName('Trash')
}

export const getBookmarkByName = function(name){
  const stateObj = chkSt('gstate', 'stateObj')
  for(var i = 0; i<stateObj.bookmarks.length; i++){
    if(stateObj.bookmarks[i].name == name){
      return stateObj.bookmarks[i]
    }
  }
  return null
}
