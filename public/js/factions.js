let factionModel;

$(document).ready(function(){
  factionModel = new DataModel({
    verbose: true,
    entity: "factions",
    parentId: "factions_ul",
    columns: [
      { type: "readonly", name: "id", example: "-1", default: "" },
      { type: "text", name: "name", example: "New faction", default: "" },
      { type: "text", name: "user", example: "Owner's Username", default: "" },
    ],
  });
  factionModel.update();
});