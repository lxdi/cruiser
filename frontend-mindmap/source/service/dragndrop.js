import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'
import {getChildren, removeByValue, parentCheck} from './common.js'

registerEvent('dragndrop', 'on-start', (stSetter, node) => {fireEvent('state', 'safe-point'); stSetter('node', node)})

registerEvent('dragndrop', 'on-over', (stSetter, node) => {safeBlock(() => onOverHandler(stSetter, chkSt('dragndrop', 'node'), node))})

registerEvent('dragndrop', 'on-drop', (stSetter, node) => {safeBlock(() => onDropHandler(stSetter, chkSt('dragndrop', 'node'), node))})

registerEvent('dragndrop', 'clear', (stSetter) => {stSetter('phantomHome', null); stSetter('phantomNode', null)})

//registerEvent('dragndrop', 'on-leave', (stSetter, node) => {onLeaveHandler(stSetter, chkSt('dragndrop', 'node'), node)})

const onOverHandler = function(stSetter, node, targetNode) {

    if (node == targetNode) {
        //onLeaveHandler(stSetter, node, targetNode)
        return
    }

    if (parentCheck(targetNode, node)) {
        return 
    }

    var phantom = chkSt('dragndrop', 'phantomNode')

    if (phantom == null) {
        phantom = { isPhantom: true }
        stSetter('phantomNode', phantom)
    }

    if (chkSt('dragndrop', 'phantomHome') != null) {
        removeByValue(chkSt('dragndrop', 'phantomHome'), phantom)
    }

    if (targetNode['_parent'] == null) {
        console.log(targetNode)
    }

    const targetChildren = getChildren(targetNode['_parent'], targetNode)

    stSetter('phantomHome', targetChildren)
    insertAfter(targetChildren, targetNode, phantom)
    //targetChildren.push(phantom)

}

const onDropHandler = function(stSetter, node, targetNode) {

    if (chkSt('dragndrop', 'phantomHome') == null) {
        console.log('phantomHome is null')
        return
    }

    removeByValue(getChildren(node['_parent'], node), node)
    replace(chkSt('dragndrop', 'phantomHome'), chkSt('dragndrop', 'phantomNode'), node)
    stSetter('phantomHome', null)
    fireEvent('state', 'change')
}

const onLeaveHandler = function(stSetter, node, targetNode) {

    if (chkSt('dragndrop', 'phantomHome') == null) {
        return
    }

    removeByValue(chkSt('dragndrop', 'phantomHome'), chkSt('dragndrop', 'phantomNode'))
    stSetter('phantomHome', null)
}

const safeBlock = function(block) {
    try {
        return block()
    } catch (err) {
        console.log('Error: ', err)
        fireEvent('state', 'restore')
    }
}

const replace = function(arr, old, newVal) {
    const index = arr.indexOf(old)
    
    if (index > -1) {
        arr[index] = newVal;
    }
}

const insertAfter = function(arr, afterThis, newVal) {
    const index = arr.indexOf(afterThis);

    if (index !== -1) {
        arr.splice(index + 1, 0, newVal);
    }
}