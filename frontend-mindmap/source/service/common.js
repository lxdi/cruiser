

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

export const indexContent = function(content, isNewVersion) {
    content.panels.forEach(panel => indexNode(panel, null, isNewVersion))
}

export const indexNode = function(curNode, parentNode, isNewVersion) {

    if (isNewVersion) {
        if (curNode.version == null ) {
            curNode.version = 1
        } else {
            curNode.version = curNode.version + 1
        }
    }

    if (curNode.id == null) {
        curNode.id = generateUUID()
    }

    if (parentNode != null) {
        curNode['_parent'] = parentNode
    }

    if (curNode.left != null) {
        curNode.left.forEach(child => indexNode(child, curNode, isNewVersion));
    }

    if (curNode.right != null) {
        curNode.right.forEach(child => indexNode(child, curNode, isNewVersion));
    }

    if (curNode.children != null) {
        curNode.children.forEach(child => indexNode(child, curNode, isNewVersion));
    }
}

export const removeSystemPropsForContent = function(content) {
    content.panels.forEach(panel => removeSystemProps(panel))
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

export const generateUUID = function() {
    let d = new Date().getTime();
    let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;
    
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16;
        if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}