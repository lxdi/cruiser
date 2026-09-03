import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'
import {sendGet, sendPost, sendPut, sendDelete} from './postoffice'
import {getChildren, removeByValue, indexContent, indexNode, removeSystemPropsForContent, generateUUID} from './common.js'

const defaultName = 'Subtopic '
var counter = 1
var counterRoot = 1
var history = []

// var content = {
// 	name: "Root",
// 	left: [],
// 	right: []
// }

registerObject('state', {'selected': [], 'history': history})

registerEvent('state', 'get', (stSetter)=>{
  sendGet('/content' + window.location.search, (content)=>{
    const name = window.location.search.substring(window.location.search.lastIndexOf('/') + 1)
    document.title = name
    content = migrateToPanels(content)
    fireEvent('state', 'got', [content])
  })
})

registerEvent('state', 'got', (stSetter, content)=>{ stSetter('content', content); stSetter('current-root', findCurrentPanel(content))})
registerEvent('state', 'change', (stSetter)=>stSetter('changed', true))

registerEvent('state', 'save', (stSetter)=> {

    if (window.location.search.includes("path=")){
        sendPost('/content' + window.location.search, preparedForSave(), ()=>{stSetter('changed', false)})
        stSetter('changed', false)
        return
    }

    const prepared = preparedForSave()
    downloadObjectAsJson(prepared, prepared.name + '.mm')
    stSetter('changed', false)

})

registerEvent('state', 'select', (stateSetter, node) => selectNode(node))
registerEvent('state', 'unselect', (stateSetter) => selectNode(null))
registerEvent('state', 'multiple-select-on', (stateSetter) => stateSetter("multiple-select", true))
registerEvent('state', 'multiple-select-off', (stateSetter) => stateSetter("multiple-select", false))
registerEvent('state', 'safe-point', (stateSetter) => doSafePoint())
//registerEvent('state', 'panel-edit-switch', (stateSetter) => stateSetter("panel-edit", !chkSt('state', 'panel-edit')))

registerEvent('state', 'create-new', (stateSetter) => {

    const parentNode = chkSt('state', 'selected').at(-1)

    if (parentNode == null) {
        console.log('need to select a node')
        return
    }

    var newNode = createChildForParent(parentNode)
    newNode.version = parentNode.version
    indexNode(newNode, parentNode, false)
    selectNode(newNode)
    stateSetter('changed', true)
})

registerEvent('state', 'delete', (stateSetter) => {

    const node = chkSt('state', 'selected').at(-1)

    if (chkSt('state', 'current-root') == node) {
        return
    }

    doSafePoint()
    removeByValue(getChildren(node['_parent'], node), node)
    stateSetter('changed', true)
})

registerEvent('state', 'restore', (stateSetter) => {

    if (history.length < 1) {
        console.log('history is empty')
        return
    }

    const restored = history.pop()
    indexContent(restored, true)
    stateSetter('content', restored)
    stateSetter('current-root', restored.panels[0])
    fireEvent('dragndrop', 'clear')
    stateSetter('changed', true)
})


registerEvent('state', 'create-panel', (stateSetter) => {
    const content = chkSt('state', 'content')
    const newNode = createNewNode(true)
    
    for (const i in content.panels) {
        content.panels[i].isCurrent = false
    }

    newNode.isCurrent = true
    content.panels.push(newNode)
    stateSetter('current-root', findCurrentPanel(content))
    stateSetter('changed', true)
})

registerEvent('state', 'change-panel', (stateSetter, panel) => {
    const content = chkSt('state', 'content')

    for (const i in content.panels) {
        content.panels[i].isCurrent = false
    }

    panel.isCurrent = true
    stateSetter('current-root', findCurrentPanel(content))
})

registerEvent('state', 'panel-move', (stateSetter, panel, direction) => {
    const content = chkSt('state', 'content')

    const curIndex = content.panels.indexOf(panel)
    doSafePoint()

    if (direction == 'right') {
        if (curIndex + 1 >= content.panels.length ) {
            return
        }

        content.panels.splice(curIndex, 1)
        content.panels.splice(curIndex + 1 , 0, panel)
    }

    if (direction == 'left') {
        if (curIndex - 1 < 0 ) {
            return
        }

        content.panels.splice(curIndex, 1)
        content.panels.splice(curIndex - 1 , 0, panel)
    }

    stateSetter('current-root', findCurrentPanel(content))
    stateSetter('changed', true)
})

registerEvent('state', 'panel-remove', (stateSetter, panel) => {
    const content = chkSt('state', 'content')

    if (content.panels.length <= 1) {
        console.log('1 panel left, cannot be removed')
        return 
    }

    doSafePoint()

    const curIndex = content.panels.indexOf(panel)
    content.panels.splice(curIndex, 1)

    if (curIndex - 1 >= 0) {
        content.panels[curIndex - 1].isCurrent = true
    } else {
        content.panels[0].isCurrent = true
    }

    stateSetter('current-root', findCurrentPanel(content))
    stateSetter('changed', true)
})

export const doSafePoint = function() {
    const content = chkSt('state', 'content')
    removeSystemPropsForContent(content)
    const clone = JSON.parse(JSON.stringify(content)) // structuredClone(chkSt('state', 'content'))
    history.push(clone)
    indexContent(content, false)
}

const selectNode = function(node) {

    var selectStorage = chkSt('state', 'selected')

    if (!(chkSt('state', 'multiple-select') == true)) {
        selectStorage.length = 0
    }

    if (node == null) {
        selectStorage.length = 0
    } else {
        selectStorage.push(node)
    }
}

const createChildForParent = function(parent) {
    const newNode = createNewNode()
    var children = null

    if (parent.left != null || parent.right != null) {
        if (parent.left.length > parent.right.length) {
            children = parent.right
        } else {
            children = parent.left
        }
    } else {

        if (parent.children == null) {
            parent.children = []
        }

        children = parent.children
    }

    children.push(newNode)
    return newNode
}

const createNewNode = function(isRoot) {
    const res =  { 
        id: generateUUID(),
     }

     if (isRoot == true) {
        res.left = []
        res.right = []
        res.name = "Topic " + counterRoot++
     } else {
        res.name = defaultName + counter++
     }

     return res
}

const preparedForSave = function(node) {
    const content = chkSt('state', 'content')
    removeSystemPropsForContent(content)
    const clone = JSON.parse(JSON.stringify(content)) // structuredClone(chkSt('state', 'content'))
    indexContent(content, false)
    return clone
}

function downloadObjectAsJson(exportObj, exportName) {
  // 1. Pack the data into a formatted JSON string (2 spaces indent for readability)
  const dataStr = JSON.stringify(exportObj, null, 2);
  
  // 2. Create a Blob object with the JSON data and proper MIME type
  const dataBlob = new Blob([dataStr], { type: "application/json;charset=utf-8;" });
  
  // 3. Create a temporary URL pointing to the Blob object
  const url = URL.createObjectURL(dataBlob);
  
  // 4. Create a temporary hidden anchor element
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", url);
  downloadAnchor.setAttribute("download", exportName + ".json");
  downloadAnchor.style.display = 'none';
  
  // 5. Append to the DOM, trigger the click, and remove it immediately
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.removeChild(downloadAnchor);
  
  // 6. Clean up the URL state to free up memory
  URL.revokeObjectURL(url);
}

const migrateToPanels = function(content) {
    if (content.panels != null) {
        return content
    }

    content.isCurrent = true

    return {
        panels: [content]
    }
}

const findCurrentPanel = function(content) {
    for(const i in content.panels) {
        if (content.panels[i].isCurrent == true) {
            return content.panels[i]
        }
    }
    content.panels[0].isCurrent = true
    return content.panels[0]
}



// var content = {
// 	name: "Root default",
// 	left: [
// 		{
// 			name: "Child left 1",
// 			children: [
// 				{
// 					name: "Child child left 1"
// 				},
// 				{
// 					name: "Child child left 2"
// 				}
// 			]
// 		},
//         {
// 					name: "Child left 2"
// 		}
// 	],
// 	right: [
// 		{
// 			name: "Child right 1"
// 		},
// 		{
// 			name: "Child right 2",
// 			children: [
// 				{
// 					name: "Child child right 1 super long title very"
// 				},
// 								{
// 					name: "Child child right 2",
// 					children: [
// 						{
// 							name: "Child child child right 1"
// 						}
// 					]
// 				},
// 				{
// 					name: "Child child right 3"
// 				}
// 			]
// 		},
// 		{
// 			name: "Child right 3"
// 		},
// 	]
// }
