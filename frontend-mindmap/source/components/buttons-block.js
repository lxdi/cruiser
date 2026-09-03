import React from 'react';
import ReactDOM from 'react-dom';
import {Modal, Button, Form} from 'react-bootstrap'
import {registerObject, registerEvent, chkSt, fireEvent, registerReaction} from 'absevents'


export class ButtonsBlock extends React.Component{
  constructor(props){
    super(props)

    registerReaction('buttons-block', 'state', ['create-new', 'restore', 'delete', 'save', 'change'], ()=>this.setState({}))
    
  }

  render(){
    return (
        <table>
                <tr>
                    <td>{showUndo()? <Button id='close' onClick={()=>fireEvent('state', 'restore')} variant="outline-primary" size="sm">Undo</Button>: null} </td>
                    <td><Button id='close' onClick={()=>window.open(window.location.origin + window.location.pathname, '_blank')} variant="outline-primary" size="sm">Create new</Button></td>
                    <td>{showSave()? <Button id='close' onClick={()=>fireEvent('state', 'save')} variant="outline-primary" size="sm">Save</Button>: null}</td>
                </tr>
        </table>
    )
  }
}

const showSave = function() {
    if (window.location.search.includes("path=")){
        return chkSt('state', 'changed') == true
    } else {
        return true
    }
}

const showUndo = function() {
    return chkSt('state', 'history').length > 0
}

// const editPanelButton = function() {
//   const variant = chkSt('state', 'panel-edit') == true? 'outline-success': 'outline-secondary'
//   return <Button id='panel-edit' onClick={()=>fireEvent('state', 'panel-edit-switch')} variant={variant} size="sm">Edit</Button>
// }