import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'
import {sendPost} from './postoffice'
import {getPath} from './../services/pathUtils'

registerEvent('commands', 'open', (stSetter, path)=>{
  sendPost('/command/open', path, ()=>{})
})

registerEvent('commands', 'delete', (stSetter, files)=>{
  if(Array.isArray(files)){
      sendPost('/command/trash/move/multiple', files, ()=>{fireEvent('commands', 'deleted')})
      return [getPath(files[0].path)]
  } else {
      sendPost('/command/trash/move', files, ()=>{fireEvent('commands', 'deleted')})
      return [getPath(files.path)]
  }
})
registerEvent('commands', 'deleted', (stSetter)=>{})

registerEvent('commands', 'clean-trash', (stSetter)=>{
  sendPost('/command/trash/clean', null, ()=>{})
})

registerEvent('commands', 'copy', (stSetter, sourcePathsArr, targetPath)=>{
  sendPost('/command/copy', {from:sourcePathsArr, to:targetPath}, ()=>{fireEvent('commands', 'copied')})
  const result = [targetPath]
  sourcePathsArr.map(path => getPath(path)).forEach(pp => result.push(pp))
  return result
})
registerEvent('commands', 'copied', ()=>{})

registerEvent('commands', 'move', (stSetter, sourcePathsArr, targetPath)=>{
  sendPost('/command/move', {from:sourcePathsArr, to:targetPath}, ()=>{fireEvent('commands', 'moved')})
  const result = [targetPath]
  sourcePathsArr.map(path => getPath(path)).forEach(pp => result.push(pp))
  return result
})
registerEvent('commands', 'moved', ()=>{})

registerEvent('commands', 'rename', (stSetter, path, newName)=>{
  sendPost('/command/rename', {path: path, newName: newName}, ()=>fireEvent('commands', 'renamed'))
  return [getPath(path)]
})
registerEvent('commands', 'renamed', ()=>{})
