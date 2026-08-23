import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'

registerEvent('dragndrop', 'on-start', (stSetter, node) => {stSetter('node', node)})

registerEvent('dragndrop', 'on-over', (stSetter, node) => {onOverHandler(chkSt('dragndrop', 'node'), node)})

const onOverHandler = function(node, targetNode) {

    console.log(node.name + ' on over ' + targetNode.name)

    if (node == targetNode) {
        return
    }

    if (parentCheck(targetNode, node)) {
        console.log('parent check failed')
        return 
    }

    if (targetNode['_parent'] == null) {
        console.log('targetNode has no link to parent: ' + targetNode.name)
        return
    }

    if (node['_parent'] == null) {
        console.log('node has no link to parent: ' + node.name)
        return
    }

    const childrenTarget = getChildren(targetNode['_parent'], targetNode) 
    const childrenNode = getChildren(node['_parent'], node) 

    if (childrenTarget== null) {
        targetNode['_parent'].children = []
    }

    if (childrenTarget == childrenNode) {
        swap(childrenTarget, targetNode, node)
    } else {
        insertAfter(childrenTarget, targetNode, node)
        removeByValue(childrenNode, node)
    }

    node['_parent'] = targetNode['_parent']

}

const insertAfter = function(arr, afterThis, newVal) {
    const index = arr.indexOf(afterThis);

    if (index !== -1) {
        arr.splice(index + 1, 0, newVal);
    }
}

const removeByValue = function(arr, value) {
    const index = arr.indexOf(value);

    if (index > -1) {
        arr.splice(index, 1);
    }
}

const swap = function(arr, val1, val2) {
    const index = arr.indexOf(val1);
    const index2 = arr.indexOf(val2);

    if (index < index2) {
        return
    }

    // arr[index] = val2
    // arr[index2] = val1

    [arr[index], arr[index2]] = [arr[index2], arr[index]]

    console.log('swap ' + index + ' and ' + index2)
    console.log('swap ', arr)
}

const getChildren = function(parent, child) {

    if (parent.children != null && parent.children.includes(child)) {
        return parent.children
    }

    if (parent.left != null && parent.left.includes(child)) {
        return parent.left
    }

    if (parent.right != null && parent.right.includes(child)) {
        return parent.right
    }
}

const parentCheck = function(targetNode, node) {
    var currentNode = targetNode

    while(currentNode != null && currentNode != node) {
        currentNode = currentNode['_parent'] 
    }

    return currentNode != null

}