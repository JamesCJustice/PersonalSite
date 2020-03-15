let regionsModel, citiesModel;

$(document).ready(function(){
  regionsModel = new DataModel({
    verbose: true,
    entity: "regions",
    parentId: "regions_ul",
    columns: [
      { type: "readonly", name: "id", example: "-1", default: "" },
      { type: "text", name: "name", example: "New faction", default: "" },
      { type: "text", name: "x", example: "0", default: "" },
      { type: "text", name: "y", example: "0", default: "" },
    ],
  });
  citiesModel = new DataModel({
    verbose: true,
    entity: "cities",
    parentId: "cities_ul",
    columns: [
      { type: "readonly", name: "id", example: "-1", default: "" },
      { type: "text", name: "name", example: "Coolsville", default: "" },
      { type: "text", name: "description", example: "Coolest city", default: "" },
      { type: "text", name: "population", example: "1000", default: "" },
      { type: "text", name: "x", example: "0", default: "" },
      { type: "text", name: "y", example: "0", default: "" },
      { type: "text", name: "gdp", example: "1000", default: "" },
      { type: "text", name: "tax_rate", example: "5", default: "" },
      { type: "text", name: "loyalty", example: "3", default: "" },
      { type: "text", name: "faction_id", example: "-1", default: "" },
      { type: "text", name: "region_id", example: "-1", default: "" },
      { type: "text", name: "researchers", example: "5", default: "" },
      { type: "text", name: "research_goal", example: "Owner's Username", default: "" },
    ],
  });
  regionsModel.update();
  citiesModel.update();
});