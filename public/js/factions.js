let factionModel;

$(document).ready(function(){
  factionModel = new DataModel({
    entity: "factions",
    parentId: "factions_ul",
    columns: [
      { type: "text", name: "name", example: "New faction", default: "" },
      { type: "text", name: "x", example: "0", default: "" },
      { type: "text", name: "y", example: "0", default: "" },
    ],
  });
  factionModel.update();
});