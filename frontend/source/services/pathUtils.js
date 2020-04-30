
export const getName = function(path, separator){
  if(isDir(path, separator)){
    const aligned = path.substring(0, path.length-1)
    return aligned.substr(aligned.lastIndexOf(separator)-aligned.length+1)
  } else {
    return path.substr(path.lastIndexOf(separator) - path.length+1)
  }
}

export const getPath = function(path, separator){
  if(isDir(path, separator)){
    const aligned = path.substring(0, path.length-1)
    return aligned.substr(0, aligned.lastIndexOf(separator)) + separator
  } else {
    return path.substring(0, path.lastIndexOf(separator)) + separator
  }
}

export const isDir = function(path, separator){
  return path.lastIndexOf(separator) == path.length-1
}
