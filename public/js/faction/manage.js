let finances, military, civics, market, research, canvas, strategyMap, orders;
function initDashboard(data){
  let ordersData = {
    all: [
      { 
        id: 1, 
        faction_id: 1, 
        user_id: 1, 
        order_type: "something", 
        order_data: '{ "cool":1 }', 
        extra_info: "Do not feed after midnight",
        status: "PENDING",
        executed: null,
        created: "Yesterday, I guess"
      }
    ]
  };
  data.orders = ordersData;
  console.log("InitDashboard" + JSON.stringify(data));
  finances = new Finances({
    parentId: 'finances_div',
    modalId: 'dashboard_modal',
    data: data
  });
  military = new Military({
    parentId: 'military_div',
    modalId: 'dashboard_modal',
    data: data
  });
  civics = new Civics({
    parentId: 'civics_div',
    modalId: 'dashboard_modal',
    data: data
  });
  market = new Market({
    parentId: 'market_div',
    modalId: 'dashboard_modal',
    data: data
  });
  research = new Research({
    parentId: 'research_div',
    modalId: 'dashboard_modal',
    data: data
  });
  orders = new Orders({
    parentId: 'orders_div',
    modalId: 'dashboard_modal',
    data: data
  });
  canvas = new Canvas('faction_canvas', 1000, 1000);
  strategyMp = new StrategyMap(canvas);
}

$(document).ready(function(){
  let factionId = $("#faction_div").text();
  $.ajax({
    type: 'GET',
    url: `/faction/dashboard/${factionId}`,
    contentType: "application/json; charset=utf-8",
    success: initDashboard,
    error: function(error){
        console.log(error);
    }
  });
});