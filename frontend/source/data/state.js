import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'
import {sendGet, sendPost, sendPut, sendDelete} from './postoffice'

registerEvent('gstate', 'get', (stSetter)=>{
  sendGet('/state', (state)=>{
    fireEvent('gstate', 'got', [state])
  })
})

registerEvent('gstate', 'got', (stSetter, state)=>stSetter('stateObj', state))

registerEvent('gstate', 'update-cwd', (stSetter, name, newCwd, pos)=> {
  sendPost('/state/cwd/'+name+'/'+pos, newCwd, ()=>{})
})

fireEvent('gstate', 'get')

registerEvent('gstate', 'add-tab', (stSetter, panelName)=>{
  sendPut('/state/tab/'+panelName, null, ()=>{
    stSetter('stateObj', null)
    fireEvent('gstate', 'get')
  })
})

registerEvent('gstate', 'update-tab-pos', (stSetter, panelName, pos)=>{
  sendPost('/state/panel/'+panelName+'/tab/current/'+pos, null, ()=>{})
})

registerEvent('gstate', 'remove-tab', (stSetter, panelName, pos)=>{
  sendDelete('/state/panel/'+ panelName +'/tab/' + pos, null, ()=>{
    stSetter('stateObj', null)
    fireEvent('gstate', 'get')
  })
})
