// -*- mode: js -*-
// -*- coding: utf-8 -*-
// @flow

/// Msg

// textfield type
export type Type =
  | 'text'
  | 'password'
  | 'number'
  | 'tel'
  | 'mail'
  | 'datetime'
  | 'date'
  | 'time'
  | 'url'
  | 'bank'
  | 'idcard'
  | 'color'
  | 'ipv4'
  | 'port'

/* Basic usage */

export const Change: 'Change' = 'Change'
export type OnChangeAction = {
  type: typeof Change,
  payload: string
}

/* Auto complete */

export const PushToAutoCompleteList: 'PushToAutoCompleteList' =
  'PushToAutoCompleteList'
export type PushToAutoCompleteListAction<T> = {
  type: typeof PushToAutoCompleteList
}

export const RemoveAutoCompleteItem: 'RemoveAutoCompleteItem' =
  'RemoveAutoCompleteItem'
export type RemoveAutoCompleteItemAction<T> = {
  type: typeof RemoveAutoCompleteItem,
  payload: T
}

export const ActiveAutoCompleteItem: 'ActiveAutoCompleteItem' =
  'ActiveAutoCompleteItem'
export type ActiveAutoCompleteItemAction<T> = {
  type: typeof ActiveAutoCompleteItem,
  payload: T
}

export type Action<T> =
  | OnChangeAction
  | PushToAutoCompleteListAction<T>
  | RemoveAutoCompleteItemAction<T>
  | ActiveAutoCompleteItemAction<T>

/// Model

export type Model<T> = {
  value: string,
  type: Type,
  name: string,
  autocompleted: boolean,
  autocompletelist: Array<T>,
  autocompletes: Array<T>,
  autocompletePushOnBlur: boolean,
  autocompleteHighLight: boolean,
  autocompleteShadow: boolean
}
