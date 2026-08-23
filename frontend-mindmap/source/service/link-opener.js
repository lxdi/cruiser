import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'
import {sendGet, sendPost, sendPut, sendDelete} from './postoffice'


registerEvent('link-opener', 'open', (stSetter, link) => openLink(link))

const openLink = function(link) {

    console.log('link to open: ' + link)

    if (link.startsWith("file:") && link.endsWith('.mm.json')) {
        console.log('open in new tab')
        var path = link.replace("file:", "")

        var parentPath = getPathPreset()

        if (parentPath != null) {
            path = parentPath + '/' + path
        }

        window.open(window.location.origin + window.location.pathname + '?path=' + path, '_blank');
        return
    }

    if (link.startsWith("file:")) {
        var path = link.replace("file:", "")
        var parentPath = getPathPreset()

        if (parentPath != null) {
            path = parentPath + '/' + path
        }

        sendPost('/file/open?path=' + path, null, () => {})
        return
    }

    if (link.startsWith("http")) {
        window.open(link, '_blank');
        return
    }
}

const getPathPreset = function () {
    const pathWithFile = window.location.search.replaceAll("?path=", "")

    if (!pathWithFile.includes('/')) {
        return null
    }

    return pathWithFile.slice(0, pathWithFile.lastIndexOf('/'))
}