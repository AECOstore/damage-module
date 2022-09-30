import * as React from 'react'
import Button from '@mui/material/Button';
import { Catalog} from 'consolid-daapi'
import {Session} from '@inrupt/solid-client-authn-browser'
import { PiletApi } from 'consolid-shell';
import {findReferenceRegistry, ReferenceRegistry} from 'consolid-raapi'

const App = ({piral} : {piral: PiletApi}) => {
   const constants = piral.getData("CONSTANTS")

  React.useEffect(() => {
    setProject()
  }, [])

  async function setProject() {
    piral.setDataGlobal(constants.ACTIVE_PROJECT, constants.ACTIVE_PROJECT_INSTANCE)
    const refRegUrl = await findReferenceRegistry(constants.ACTIVE_PROJECT_INSTANCE)
    piral.setDataGlobal(constants.REFERENCE_REGISTRY, refRegUrl)
  }

  return (
    <div>
      <p>I am the project manager module</p>
      {/* <Button onClick={setProject}>Set Project</Button> */}
    </div>
  )
}

export default App