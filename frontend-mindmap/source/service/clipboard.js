import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'
import {sendGet, sendPost, sendPut, sendDelete} from './postoffice'
import {getChildren, removeByValue, parentCheck, getChildrenForNode, removeSystemProps, indexContent} from './common.js'
import {doSafePoint} from './state.js'

const buffer = []

registerEvent('clipboard', 'copy', (stSetter, e) => copy(e))
registerEvent('clipboard', 'cut', (stSetter) => cut())
registerEvent('clipboard', 'paste', (stSetter) => paste())

const copy = function(e) {


    buffer.length = 0

    const selected = chkSt('state', 'selected')

    if (selected == null || selected.length == 0) {
        return
    }

    selected.forEach((node) => {
        buffer.push(structuredClone(node))
    })

    navigator.clipboard.writeText(selected.map((node) => node.name).join('\n'))

}

const cut = function() {

    doSafePoint()

    buffer.length = 0

    const selected = chkSt('state', 'selected')

    if (selected == null  || selected.length == 0) {
        return
    }

    selected.forEach((node) => {
        buffer.push(structuredClone(node))
        removeByValue(getChildren(node['_parent'], node), node)
    })

    navigator.clipboard.writeText(selected.map((node) => node.name).join('\n'))

    fireEvent('state', 'change')
}

const paste = function() {

    doSafePoint()

    const targetNodes = chkSt('state', 'selected')

    if (targetNodes == null || targetNodes.length == 0) {
        return
    }

    targetNodes.forEach((targetNode) => doPaste(targetNode))

}

const doPaste = function(targetNode) {
    const targetChildren = getChildrenForNode(targetNode)

    if (buffer.length == 0) {
        navigator.clipboard.readText().then((text) => {
            text.split(/\r?\n/).forEach((s) => createNewFromText(s, targetChildren, targetNode))
        })
    } else {

        buffer
                .filter((node) => targetNode !== node)
                .filter((node) => !parentCheck(targetNode, node))
                .forEach((node) => {
                    targetChildren.push(node)
                    node['_parent'] = targetNode
        })

        buffer.length = 0
        fireEvent('state', 'change')
    }
}

const createNewFromText = function(text, targetChildren, targetNode) {
    const newNode = {name: text}
    targetChildren.push(newNode)
    newNode['_parent'] = targetNode
    fireEvent('state', 'change')
}