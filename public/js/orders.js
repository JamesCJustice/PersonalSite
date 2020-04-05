let orderModel;

$(document).ready(function(){
  orderModel = new DataModel({
    verbose: true,
    entity: "orders",
    parentId: "orders_ul",
    columns: [
      { type: "readonly", name: "id", example: "-1", default: "" },
      { type: "text", name: "faction_id", example: "-1", default: "" },
      { type: "text", name: "user_id", example: "-1", default: "" },
      { type: "text", name: "order_type", example: "-1", default: "" },
      { type: "text", name: "order_data", example: "-1", default: "" },
      { type: "text", name: "extra_info", example: "-1", default: "" },
      { type: "text", name: "status", example: "-1", default: "" },
      { type: "readonly", name: "executed", example: "", default: "" },
      { type: "readonly", name: "created", example: "", default: "" },
    ],
  });
  orderModel.update();
});