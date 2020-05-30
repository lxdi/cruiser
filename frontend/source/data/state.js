import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'
import {sendGet, sendPost} from './postoffice'

registerEvent('gstate', 'get', (stSetter)=>{
  sendGet('/state/get', (state)=>{
    fireEvent('gstate', 'got', [state])
  })
})

registerEvent('gstate', 'got', (stSetter, state)=>stSetter('stateObj', state))

registerEvent('gstate', 'update-cwd', (stSetter, name, newCwd, pos)=> {
  sendPost('/state/update/cwd/'+name+'/'+pos, newCwd, ()=>{})
})

fireEvent('gstate', 'get')

registerEvent('gstate', 'add-tab', (stSetter, panelName)=>{
  sendPost('/state/update/tab/new/'+panelName, null, ()=>{
    stSetter('stateObj', null)
    fireEvent('gstate', 'get')
  })
})

registerEvent('gstate', 'update-tab-pos', (stSetter, panelName, pos)=>{
  sendPost('/state/update/panel/'+panelName+'/tab/current/'+pos, null, ()=>{})
})

registerEvent('gstate', 'remove-tab', (stSetter, panelName, pos)=>{
  sendPost('/state/update/panel/'+ panelName +'/tab/remove/' + pos, null, ()=>{
    stSetter('stateObj', null)
    fireEvent('gstate', 'get')
  })
})
