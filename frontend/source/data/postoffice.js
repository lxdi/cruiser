import axios from 'axios'

export const sendGet = function(url, callback){
  axios.get(url).then((data)=>callback(data.data))
}

export const sendGetExt = function(url, data, callback){
  sendWithData(url, data, callback, 'GET')
}

export const sendPut = function(url, sendData, callback){
  sendWithData(url, sendData, callback, 'PUT')
}

export const sendPost = function(url, sendData, callback){
  sendWithData(url, sendData, callback, 'POST')
}

export const sendDelete = function(url, callback){
  axios({
    method: 'DELETE',
    url: url,
  }).then((data)=>callback(data.data));
}

export const sendDownload = function(url, sendData, callback){
  axios({
    contentType: 'application/json',
    headers: {
      'Content-type': 'application/json'
    },
    responseType: 'blob',
    method: 'POST',
    url: url,
    data: sendData,
  }).then((data)=>callback(data.data));
}

const sendWithData = function(url, sendData, callback, type){
  axios({
    contentType: 'application/json',
    headers: {
      'Content-type': 'application/json'
    },
    method: type,
    url: url,
    data: sendData,
  }).then((data)=>callback(data.data));
}

export const loadScript = function(url, callback){
  // axios({
  //   contentType: 'script',
  //   url: '/'+url,
  // }).then((data)=>{
  //   eval(data.data.toString())
  //   callback()
  // });

  var script = document.createElement('script');
  script.onload = function () {
      callback()
  };
  script.src = url
  document.head.appendChild(script)
}
