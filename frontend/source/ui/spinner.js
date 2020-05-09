import React from 'react';
import ReactDOM from 'react-dom';
import {Spinner} from 'react-bootstrap'
import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'

export class SpinnerWrapper extends React.Component{
  constructor(props){
    super(props)
    this.state = {display:false}
    registerEvent('spinner', 'display', ()=>this.setState({display:true}))
    registerEvent('spinner', 'hide', ()=>this.setState({display:false}))

  }

  render(){
    if(this.state.display){
      return <Spinner animation="border" variant="primary" />
    } else {
      return null
    }
  }
}
