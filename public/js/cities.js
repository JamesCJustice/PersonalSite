let regionsModel, citiesModel;

$(document).ready(function(){
  regionsModel = new DataModel({
    verbose: true,
    entity: "regions",
    parentId: "regions_ul",
    columns: [
      { type: "readonly", name: "id", example: "-1", default: "" },
      { type: "text", name: "name", example: "Cool Region", default: "" },
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
      { type: "text", name: "x", example: "0", default: "" },
      { type: "text", name: "y", example: "0", default: "" },
      { type: "text", name: "region", example: "ExampleRegion", default: "" },
    ],
  });
  regionsModel.update();
  citiesModel.update();
});