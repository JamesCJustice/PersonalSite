class Finances{
  constructor(settings){
    this.parentId = `#${settings.parentId}`;
    this.modalId = `#${settings.modalId}`;
    this.finances = settings.data.finances;
    this.faction = settings.data;
    this.buildDom();
  }

  buildDom(){
    let obj = this;
    let parent = obj.parentId; 
    $(parent).empty();

    let html =  '<h3>Finances</h3>';
    html += `<label class="faction_item">Revenue: ${obj.finances.revenue}GP/month</label><br>`;
    html += `<label class="faction_item">Upkeep: ${obj.finances.upkeep}GP/month</label><br>`;
    html += `<label class="faction_item">Net: ${obj.finances.net}GP/month</label><br>`;
    $(parent).html(html);
    $(parent).click(obj.openModal.bind(obj));
  }

  openModal(){
    let obj = this;
    $(obj.modalId).empty();

    let closeButton = $("<span>&times;</span>").addClass('faction_dashboard_close');
    closeButton.click(obj.closeModal.bind(obj));
    
    let contentDiv = $('<div></div>').addClass('faction_dashboard_modal_content');
    contentDiv.append(closeButton);
    let citiesList = $('<li></li>');
    let cityClass = "faction_item";
    obj.faction.cities.forEach(function(city){
      let cityDiv = $('<div></div>');
      cityDiv.append($(`<label>${city.name} </label>`).addClass(cityClass));
      cityDiv.append($(`<label>Revenue: ${city.finances.revenue}GP/month </label>`).addClass(cityClass));
      cityDiv.append($(`<label>Upkeep: ${city.finances.upkeep}GP/month </label>`).addClass(cityClass));
      let netLabel = $(`<label>Net: ${city.finances.net}GP/month </label>`).addClass(cityClass);
      if(city.finances.net < 0){
        netLabel.css("color", "red");
      }
      else{
        netLabel.css("color", "green");
      }
      cityDiv.append(netLabel);
      citiesList.append(cityDiv);
    });

    contentDiv.append(citiesList);

    $(obj.modalId).append(contentDiv);

    $(obj.modalId).show();
  }

  closeModal(){
    let obj = this;

    $(obj.modalId).hide();
  }


}