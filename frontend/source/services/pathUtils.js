import {getSeparator} from './separator'

export const getName = function(path){
  if(isDir(path)){
    const aligned = path.substring(0, path.length-1)
    return aligned.substr(aligned.lastIndexOf(getSeparator())-aligned.length+1)
  } else {
    return path.substr(path.lastIndexOf(getSeparator()) - path.length+1)
  }
}

export const getPath = function(path){
  if(isDir(path)){
    const aligned = path.substring(0, path.length-1)
    return aligned.substr(0, aligned.lastIndexOf(getSeparator())) + getSeparator()
  } else {
    return path.substring(0, path.lastIndexOf(getSeparator())) + getSeparator()
  }
}

export const isDir = function(path){
  return path.lastIndexOf(getSeparator()) == path.length-1
}
