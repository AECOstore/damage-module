import * as React from 'react'
import Button from '@mui/material/Button';
import { Catalog} from 'consolid-daapi'
import {Session} from '@inrupt/solid-client-authn-browser'
import { PiletApi } from 'consolid-shell';
import {findReferenceRegistry, ReferenceRegistry} from 'consolid-raapi'

const App = ({piral} : {piral: PiletApi}) => {
   const constants = piral.getData("CONSTANTS")
   
  return (
    <div>
      <p>I am the damage enrichment module</p>
      {/* <Button onClick={setProject}>Set Project</Button> */}
    </div>
  )
}

export default App