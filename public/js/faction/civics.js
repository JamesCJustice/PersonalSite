class Civics{
  constructor(settings){
    let obj = this;
    this.parentId = `#${settings.parentId}`;
    this.modalId = `#${settings.modalId}`;
    this.civics = settings.data.civics;
    this.faction = settings.data;
    this.buildDiv();
  }

  buildDiv(){
    let obj = this;
    let parent = obj.parentId; 
    $(parent).empty();

    let civics = obj.civics;
    $(parent).append($('<h3>Civics</h3>'));
    $(parent).append($(`<label>Total Loyalty Dice: ${civics.totalLoyaltyBonuses}</label><br/>`).addClass('faction_item'));
    $(parent).append($(`<label>Total Loyalty: ${civics.totalLoyalty}</label><br/>`).addClass('faction_item'));
    $(parent).append($(`<label>loyal Cities: ${civics.loyalCities}</label><br/>`).addClass('faction_item'));
    $(parent).append($(`<label>Neutral Cities: ${civics.neutralCities}</label><br/>`).addClass('faction_item'));
    $(parent).append($(`<label>Unloyal Cities: ${civics.unloyalCities}</label><br/>`).addClass('faction_item'));    
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
      cityDiv.append($(`<label>${city.name} </label> `).addClass(cityClass));
      cityDiv.append($(`<label>Loyalty: ${city.loyalty} </label> `).addClass(cityClass));
      cityDiv.append($(`<label>Loyalty Dice: ${city.loyaltyBonuses.total} </label> `).addClass(cityClass));
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