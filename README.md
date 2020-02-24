# Personal Site

This site is slowly being converted into a FOSS D&D campaign management site.

## Getting started

1. Clone the repo
2. `npm install`
3. `npm run install`
4. Edit the json files in data/
5. `npm run start`

### Maps
Paper maps are easiest to create, but digital maps are easier to share.
`./data/world.json` contains a list of cells, blocks of terrain
that contain cities and have coordinates in an overworld map. The /map page displays a single cell at a time, defaulting to the cell at coords [0,0]. Each city exists somewhere inside a cell between [0,0] and [100, 100].


