

export const removeByValue = function(arr, value) {
    const index = arr.indexOf(value);

    if (index > -1) {
        arr.splice(index, 1);
    }
}

export const getChildren = function(parent, child) {

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

//checks if targetNode is descendant from node
export const parentCheck = function(targetNode, node) {
    var currentNode = targetNode

    while(currentNode != null && currentNode != node) {
        currentNode = currentNode['_parent'] 
    }

    return currentNode != null

}

export const getChildrenForNode = function(node) {

    if (node.left != null) {
        if (node.left.length > node.right.length) {
            return node.right
        } else {
            return node.left
        }
    }

    if (node.children == null) {
        node.children = []
    }

    return node.children
}

export const indexContent = function(curNode, parentNode, isNewVersion) {

    if (isNewVersion) {
        if (curNode.version == null ) {
            curNode.version = 1
        } else {
            curNode.version = curNode.version + 1
        }
    }

    if (curNode.id == null) {
        curNode.id = crypto.randomUUID()
    }

    if (parentNode != null) {
        curNode['_parent'] = parentNode
    }

    if (curNode.left != null) {
        curNode.left.forEach(child => indexContent(child, curNode, isNewVersion));
    }

    if (curNode.right != null) {
        curNode.right.forEach(child => indexContent(child, curNode, isNewVersion));
    }

    if (curNode.children != null) {
        curNode.children.forEach(child => indexContent(child, curNode, isNewVersion));
    }
}

export const removeSystemProps = function(curNode) {

    if (curNode['_parent'] != null) {
        delete curNode['_parent']
    }

    if (curNode.left != null) {
        curNode.left.forEach(child => removeSystemProps(child));
    }

    if (curNode.right != null) {
        curNode.right.forEach(child => removeSystemProps(child));
    }

    if (curNode.children != null) {
        curNode.children.forEach(child => removeSystemProps(child));
    }
}