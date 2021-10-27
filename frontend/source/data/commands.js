import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'
import {sendPost, sendDownload, sendPut} from './postoffice'
import {getPath, getName} from './../services/pathUtils'

registerEvent('commands', 'open', (stSetter, path)=>{
  sendPost('/command/open', path, ()=>{})
})

registerEvent('commands', 'delete', (stSetter, files)=>{
  fireEvent('spinner', 'display')
  if(Array.isArray(files)){
      sendPost('/command/trash/move/multiple', files, ()=>{fireEvent('commands', 'deleted')})
      return [getPath(files[0].path)]
  } else {
      sendPost('/command/trash/move', files, ()=>{fireEvent('commands', 'deleted')})
      return [getPath(files.path)]
  }
})
registerEvent('commands', 'deleted', (stSetter)=>{fireEvent('spinner', 'hide')})

registerEvent('commands', 'clean-trash', (stSetter)=>{
  sendPost('/command/trash/clean', null, ()=>{})
})

registerEvent('commands', 'copy', (stSetter, sourcePathsArr, targetPath)=>{
  fireEvent('spinner', 'display')
  sendPost('/command/copy', {from:sourcePathsArr, to:targetPath}, ()=>{fireEvent('commands', 'copied')})
  const result = [targetPath]
  sourcePathsArr.map(path => getPath(path)).forEach(pp => result.push(pp))
  return result
})
registerEvent('commands', 'copied', ()=>{fireEvent('spinner', 'hide')})

registerEvent('commands', 'move', (stSetter, sourcePathsArr, targetPath)=>{
  fireEvent('spinner', 'display')
  sendPost('/command/move', {from:sourcePathsArr, to:targetPath}, ()=>{fireEvent('commands', 'moved')})
  const result = [targetPath]
  sourcePathsArr.map(path => getPath(path)).forEach(pp => result.push(pp))
  return result
})
registerEvent('commands', 'moved', ()=>{fireEvent('spinner', 'hide')})

registerEvent('commands', 'rename', (stSetter, path, newName)=>{
  sendPost('/command/rename', {path: path, newName: newName}, ()=>fireEvent('commands', 'renamed'))
  return [getPath(path)]
})
registerEvent('commands', 'renamed', ()=>{})

registerEvent('commands', 'create-new-dir', (stSetter, path)=>{
  sendPut('/command/dir', path, ()=>fireEvent('commands', 'dir-created'))
  return [getPath(path)]
})
registerEvent('commands', 'dir-created', ()=>{})

registerEvent('commands', 'download', (stSetter, file)=>{
  sendDownload('/command/download', file.path, (data)=>{
    const url = window.URL.createObjectURL(new Blob([data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', getName(file.path))
    document.body.appendChild(link)
    link.click()
    link.remove();
    window.URL.revokeObjectURL(url)
  })
})
