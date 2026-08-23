import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'
import {sendGet, sendPost, sendPut, sendDelete} from './postoffice'
import {getChildren, removeByValue, removeSystemProps, indexContent} from './common.js'

const defaultName = 'Subtopic '
var counter = 1
var history = []

// var content = {
// 	name: "Root",
// 	left: [],
// 	right: []
// }

registerObject('state', {'selected': [], 'history': history})

registerEvent('state', 'get', (stSetter)=>{
  sendGet('/content' + window.location.search, (content)=>{
    if(content.name != null) {
        document.title = content.name
    }
    fireEvent('state', 'got', [content])
  })
})

registerEvent('state', 'got', (stSetter, content)=>stSetter('content', content))
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

registerEvent('state', 'create-new', (stateSetter) => {

    const parentNode = chkSt('state', 'selected').at(-1)

    if (parentNode == null) {
        console.log('need to select a node')
        return
    }

    var newNode = null

    if (parentNode != chkSt('state', 'content')) {
        newNode = createChildNode(parentNode)
    } else {
        newNode = createChildForRoot()
    }

    newNode.version = parentNode.version

    indexContent(newNode, parentNode, false)
    selectNode(newNode)
    stateSetter('changed', true)
})

registerEvent('state', 'delete', (stateSetter) => {

    const node = chkSt('state', 'selected').at(-1)

    if (chkSt('state', 'content') == node) {
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
    indexContent(restored, null, true)
    stateSetter('content', restored)
    fireEvent('dragndrop', 'clear')
    stateSetter('changed', true)
})

export const doSafePoint = function() {
    const content = chkSt('state', 'content')
    removeSystemProps(content)
    const clone = JSON.parse(JSON.stringify(content)) // structuredClone(chkSt('state', 'content'))
    history.push(clone)
    indexContent(content, null, false)
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

const createChildNode = function(parentNode) {
    const newNode = createNewNode()

    if (parentNode.children != null) {
        parentNode.children.push(newNode)
    } else {
        parentNode.children = [newNode]
    }

    return newNode
}

const createChildForRoot = function() {
    const newNode = createNewNode()
    const root = chkSt('state', 'content')
    var children = null

    if (root.left.length > root.right.length) {
        children = root.right
    } else {
        children = root.left
    }

    children.push(newNode)
    return newNode
}

const createNewNode = function() {
    return { 
        id: crypto.randomUUID(),
        name: defaultName  + counter++,
     }
}

const preparedForSave = function(node) {
    const content = chkSt('state', 'content')
    removeSystemProps(content)
    const clone = JSON.parse(JSON.stringify(content)) // structuredClone(chkSt('state', 'content'))
    indexContent(content, null, false)
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
