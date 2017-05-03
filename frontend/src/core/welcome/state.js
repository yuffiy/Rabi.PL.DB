// -*- mode: js -*-
// -*- coding: utf-8 -*-
// @flow


import { compose } from 'redux'

import {
  Connect,
  ConnectSuccess,
  ConnectFailure,
} from './types'

import type {
  Model,
  Action,
  ConnectObject,
  ConnectAction,
  ConnectSuccessAction,
  ConnectFailureAction,
  
  ThunkAction
} from './types'



/// Update


export const initConnectObject: ConnectObject = {
  host     : '127.0.0.1',
  port     : 3306,
  user     : 'root',
  pass     : 'root',
  database : null,
  ssl      : 'disabled'
}

export const initModel: Model = {
  connected:  false,
  connecting: false,
  error:      null,
  connect:    initConnectObject
}

export function update(model: Model = initModel, action: ?Action): Model  {

  if(!action) return model
  
  switch(action.type) {
    
  case Connect:
    
    if(process.env.NODE_ENV === 'development') {
      console.info('Connecting database ...')
    }
    
    return Object.assign({}, model, {
      connected:  false,
      connecting: true
    })

    
  case ConnectSuccess:

    if(process.env.NODE_ENV === 'development') {
      console.info('Connecting database Success.')
    }

    return Object.assign({}, model, {
      connected:  true,
      connecting: false
    })


  case ConnectFailure:

    if(process.env.NODE_ENV === 'development') {
      console.info('Connecting database Failure.')
    }

    return Object.assign({}, model, {
      connected:  true,
      connecting: false,
      error: {
        code: action.payload.code,
        message: action.payload.message
      } 
    })

    
  default:
    return model
  }
}



/// Action


export function connect(conn: ConnectObject): ThunkAction<Action> {
  return dispatch => {
    
    dispatch({ type: Connect })

    const composedConnectSuccess = compose(dispatch, connectSuccess)
    const composedConnectFailure = compose(dispatch, connectFailure)

    return fetch('http://localhost/api/v1/connect', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(conn)
    }).then(response => response.json())
      .then(composedConnectSuccess, composedConnectFailure)
  }
}


function connectSuccess(): ConnectSuccessAction {
  return {
    type: ConnectSuccess,
    payload: null
  }
}


function connectFailure(error): ConnectFailureAction {
  return {
    type: ConnectFailure,
    payload: {
      code:    error.code,
      message: error.message
    }
  }
}
