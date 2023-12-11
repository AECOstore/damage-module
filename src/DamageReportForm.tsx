import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, RadioGroup, FormControlLabel, Radio, Button } from '@mui/material';

function DamageReportForm() {
    const [damageType, setDamageType] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [specification, setSpecification] = useState('');

    const handleDamageTypeChange = (event) => {
        setDamageType(event.target.value);
    };

    const handleSubcategoryChange = (event) => {
        setSubcategory(event.target.value);
    };

    const handleSpecificationChange = (event) => {
        setSpecification(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Submit logic here
        console.log({ damageType, subcategory, specification });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Damage Enrichment Module</h3>
            <p>With this module, you can specify damage information for an object using the <a href="https://w3id.org/dot#">DOT ontology</a>. Select an object through any interface (3D geometry, imagery, query ...) and assign damage data.</p>
            <FormControl fullWidth margin="normal">
                <InputLabel>Damage Type</InputLabel>
                <Select
                    value={damageType}
                    label="Damage Type"
                    onChange={handleDamageTypeChange}
                >
                    <MenuItem value="concrete damage">Concrete Damage</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
                <InputLabel>Subcategory</InputLabel>
                <Select
                    value={subcategory}
                    label="Subcategory"
                    onChange={handleSubcategoryChange}
                >
                    <MenuItem value="crack">Crack</MenuItem>
                </Select>
            </FormControl>

            <FormControl component="fieldset" margin="normal">
                <RadioGroup
                    aria-label="specification"
                    name="specification"
                    value={specification}
                    onChange={handleSpecificationChange}
                >
                    <FormControlLabel value="surface crack" control={<Radio />} label="Surface Crack" />
                    <FormControlLabel value="transverse crack" control={<Radio />} label="Transverse Crack" />
                    <FormControlLabel value="longitudinal crack" control={<Radio />} label="Longitudinal Crack" />
                    <FormControlLabel value="diagonal crack" control={<Radio />} label="Diagonal Crack" />
                </RadioGroup>
            </FormControl>
            <hr/>
            <Button fullwidth type="submit" variant="contained" color="primary">
                Submit
            </Button>
        </form>
    );
}

export default DamageReportForm;