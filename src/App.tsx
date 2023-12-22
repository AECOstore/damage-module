import * as React from 'react'
import Button from '@mui/material/Button';
import { Catalog, getRoot } from 'consolid-daapi'
import { Session } from '@inrupt/solid-client-authn-browser'
import { PiletApi } from 'consolid-shell';
import { findReferenceRegistry, ReferenceRegistry } from 'consolid-raapi'
import { DCAT } from '@inrupt/vocab-common-rdf'
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, FormGroup, Switch } from '@mui/material'
import DamageReportForm from './DamageReportForm'

const QueryEngineLT = require('@comunica/query-sparql-link-traversal').QueryEngine;

const rdfContentTypes = [
  "https://www.iana.org/assignments/media-types/text/turtle"
]


const App = ({ piral, setPiral}: { piral: PiletApi, setPiral: any }) => {
  const constants = piral.getData("CONSTANTS")
  const [selection, setSelection] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [allowedResources, setAllowedResources] = React.useState([])
  const [allowedConcepts, setAllowedConcepts] = React.useState([])
  const [activeConcept, setActiveConcept] = React.useState(0)
  const [enrichedConcepts, setEnrichedConcepts] = React.useState([])
  const [projectMediaTypes, setProjectMediaTypes] = React.useState([])

  // React.useEffect(() => {
  //   getAllAllowedSources()
  // }, [])


  piral.on('store-data', ({ name, value }) => {
    if (name === constants.SELECTED_CONCEPTS) {
      setSelection(value)
    }
  });

  async function getAllAllowedSources() {
    setLoading(true)
    try {
      const project = piral.getData(constants.ACTIVE_PROJECT)
      let f = ``
      for (const [index, contentType] of rdfContentTypes.entries()) {
        f += `{?resource <${DCAT.mediaType}> <${contentType}>}`
        if (index < rdfContentTypes.length - 1) {
          f += " UNION "
        }
      }
      const all = await piral.getResourcesByFilter(project, f)
      for (const res of all) {
        const concepts = await piral.getAssociatedConcepts(res.resource.value, project)
        setAllowedResources(prev => { return { ...prev, [res.resource.value]: concepts } })
      }
    } catch (error) {
      console.log('error :>> ', error);
    }
    setLoading(false)
  }

  function isUrl(str) {
    // regular expression to check if str matches a valid URL pattern
    const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

    return urlPattern.test(str);
  }

  async function propagate(r, vars) {
    const p = piral.getData(constants.ACTIVE_PROJECT)
    const preQuery = {}
    Object.keys(allowedResources).map(i => allowedResources[i]).forEach(item => { Object.assign(preQuery, item) })
    const flatRes = Object.keys(r).map(i => r[i].results.bindings).flat()
    const ids = extractIdentifiers(flatRes, vars)
    const concepts = await piral.getAllReferences(preQuery, ids, p)
    return concepts
  }

  function extractIdentifiers(bindings, vars) {
    const identifiers = []
    for (const v of vars) {

      for (const b of bindings)
        identifiers.push(b[v].value)

    }
    return identifiers
  }

  function makeActiveConcept(concept, i) {
    setActiveConcept(i)
    piral.setDataGlobal(constants.SELECTED_CONCEPTS, [concept])
  }

  // async function setDamage() {
  //   // what is the selected element?

  //   // register new reference

  //   // enrich the reference with the damage data
  // }

  async function getDamage() {

    const project = piral.getData(constants.ACTIVE_PROJECT)
    const query1 = `
    PREFIX dot: <https://w3id.org/dot#>
    SELECT ?damage ?element WHERE {
    ?element dot:hasDamageArea ?damage
    }`

    const query2 = `
    PREFIX dot: <https://w3id.org/dot#>
    SELECT ?damage ?element WHERE {
    ?element dot:hasDamage ?damage
    }`

    const results = {
      head: { vars: [] },
      results: { bindings: [] }
    }

    const r = {}

    for (const partial of project) {
      const results = {
        head: { vars: ["damage", "element"] },
        results: { bindings: [] }
      }

      for (const query of [query1, query2]) {
        const res = await piral.querySatellite(query, partial.endpoint, "FROM NAMED").then(i => i.json())
        for (const result of res.results.bindings) results.results.bindings.push(result)

      }
      r[partial.referenceRegistry] = results
    }

    const concepts = await propagate(r, ["element"])
    if (concepts.length) {
      const knowledge = await getAdditionalKnowledge(concepts)
      setEnrichedConcepts(knowledge)
      makeActiveConcept(concepts[0], 0)
    }
  }

  async function getAdditionalKnowledge(concepts) {
    const project = piral.getData(constants.ACTIVE_PROJECT)
    const knowledge = []
    for (const concept of concepts) {
      const c = concept
      const results = {
        head: { vars: [] },
        results: { bindings: [] }
      }

      for (const repr of concept.references) {
        if (isUrl(repr.identifier)) {
          const q = `SELECT ?o 
          FROM <${repr.document}> 
          WHERE {<${repr.identifier}> a ?o}`
          const root = getRoot(repr.document)
          for (const partial of project) {
            if (partial.pod.includes(root)) {
              const extraKnowledge = await piral.querySatellite(q, partial.endpoint).then(i => i.json())
              for (const v of extraKnowledge.head.vars) if (!results.head.vars.includes(v)) results.head.vars.push(v)
              for (const b of extraKnowledge.results.bindings) results.results.bindings.push(b)
            }
          }
        }
      }
      c.semantics = results
      knowledge.push(c)
    }
    return knowledge
  }

  function setActiveMediaType(item) {
    
  }

  async function queryMediaTypes() {
    const query = `SELECT DISTINCT ?type WHERE {
      ?resource <${DCAT.mediaType}> ?type
    }`
    const results = await piral.queryProject(piral, query)
    const mediaTypes = results.map(i => i.get("type").id).filter(i => !i.includes("text/turtle"))
    setProjectMediaTypes(mediaTypes)
  }

  async function queryStoresForConfigurations(e) {
    // console.log('e :>> ', e);
    // console.log('e.target.value :>> ', e.target.value);
    const store = "https://raw.githubusercontent.com/AECOstore/RESOURCES/main/stores/root.ttl"

    const t = "https://www.iana.org/assignments/media-types/model/gltf+json"
    const myEngine = new QueryEngineLT()
    const query = `
    prefix dcat: <http://www.w3.org/ns/dcat#>
    prefix mfe: <http://w3id.org/mifesto#>
    prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    prefix pav: <http://purl.org/pav/> 
    prefix doap: <http://usefulinc.com/ns/doap#>

    SELECT DISTINCT ?code ?label ?module ?revision WHERE {
      ?store dcat:dataset+ ?module .
      ?module a mfe:Manifest ;
        rdfs:label ?label ;
        pav:hasVersion ?version .
      ?version mfe:code ?code ;
        doap:revision ?revision ;
        mfe:compatibleMedia <${t}> .
    }`

    const results = await myEngine.queryBindings(query, { sources: [store], lenient: true })
    const modules = await results.toArray()
    const newModule = {
      revision: modules[0].get('revision').id,
      label: modules[0].get('label').id,
      code: modules[0].get('code').id,
      module: modules[0].get('module').id,
      compatibleMedia: t
    }
    await injectModule(newModule)
  }

async function injectModule(m) {
  // const current = await fetch(piral.getData("FEEDURL")).then(i => i.text())
  const {revision, label, code, module, compatibleMedia} = m
  const injection =     {
      "@id": module,
      "spec": revision.replace(/"/g, ''),
      "link": code,
      "initialColumns": "4",
      "initialRows": "10",
      "type": "http://w3id.org/mifesto#Component",
      "name": label.replace(/"/g, ''),
      compatibleMedia 
    }
    const config = piral.getData("CONFIGURATION")
    config.items.push(injection)
    config.items.forEach(item => {
      if (item.name === "Demo") {
        item.hosts = [item.hosts]
        item.hosts.push(module)
      }
    })
    piral.setData(constants.FEEDURL, config)
}

  return (
    <div style={{ margin: 20 }}>
      <h3>Store Query Module</h3>
      <p>This module allows to query the AECOStore to find an enrichment interface that is compatible with the resources in the current project: </p>
      <Button disabled={loading} fullWidth variant={"contained"} onClick={queryStoresForConfigurations}>Get Project Media Types</Button>
      <div style={{marginTop: 5}}>
        <FormGroup key={"mediatypesdamage"}>
          <FormLabel component="legend">Available Media Types:</FormLabel>
          <RadioGroup
    aria-labelledby="demo-radio-buttons-group-label"
    name="radio-buttons-group"
    onChange={(e) => queryStoresForConfigurations(e.target.value)}
  >
            {projectMediaTypes.map((item, index) => (
                  <FormControlLabel
                    key={item}
                    value={item}
                    control={<Radio/>}
                    label={item}
                  />
            ))}    
      </RadioGroup>
        </FormGroup>

        <hr/>
        <hr/>
        <DamageReportForm/>
      </div>


      {/* <Button style={buttonStyle} disabled={loading} fullWidth variant={"contained"} onClick={getDamage}>Get Damages</Button> */}
      {/* <Button style={buttonStyle} disabled={loading} fullWidth variant={"contained"} onClick={setDamage}>Set Damage</Button> */}
      {/* <Button onClick={uploadImage}>Upload Image</Button> */}
      {/* {(enrichedConcepts.length) ? (
        <div>
          <p>Element {activeConcept + 1} of a total of {enrichedConcepts.length}:</p>
          <ElementData element={enrichedConcepts[activeConcept]} makeActiveConcept={makeActiveConcept} index={activeConcept} length={enrichedConcepts.length}/>
        </div>
      ) : (
        <></>
      )} */}
    </div>
  )
}

const ElementData = ({ element, makeActiveConcept, index, length }) => {
  return (
    <div style={{ position: "relative", height: 200 }}>
      <p>This element is said to have the following types:</p>
      <ul style={{ marginBottom: 20 }}>
        {element.semantics.results.bindings.map((el, i) => {
          return <li key={i}>{el["o"].value}</li>
        })}
      </ul>

      <Button style={{ position: "absolute", bottom: 10, left: 10 }} variant="contained" disabled={!index} onClick={() => makeActiveConcept(element, index - 1)}>PREVIOUS</Button>
      <Button style={{ position: "absolute", bottom: 10, right: 10 }} variant="contained" disabled={index === length - 1} onClick={() => makeActiveConcept(element, index + 1)}>NEXT</Button>
    </div>
  )
}

const buttonStyle = { marginTop: 10, marginBottom: 50 }

export default App 