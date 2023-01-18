import * as React from 'react';
import { PiletApi } from 'consolid-shell';
import Icon from '@mui/icons-material/BugReport';
import App from './App'

export function setup(app: PiletApi) {
  const constants = app.getData("CONSTANTS")

  const connect = app.makeState(app, constants)
  const Module = connect(({state, actions}) => app.withState(App, {app, state, actions}))
  app.showNotification(`Hello from ${app.meta.name} Pilet!`, {
    autoClose: 2000,
  });
  app.registerExtension(app.meta["link"], Module)
  app.registerExtension(`${app.meta["link"]}/icon`, () => <Icon/>)
}
