import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'
import {sendGet, sendPost} from './postoffice'

registerEvent('gstate', 'get', (stSetter)=>{
  sendGet('/state/get', (state)=>{
    fireEvent('gstate', 'got', [state])
  })
})

registerEvent('gstate', 'got', (stSetter, state)=>stSetter('stateObj', state))

registerEvent('gstate', 'update-cwd', (stSetter, name, newCwd)=> {
  sendPost('/state/update/cwd/'+name, newCwd, ()=>{})
})

fireEvent('gstate', 'get')
