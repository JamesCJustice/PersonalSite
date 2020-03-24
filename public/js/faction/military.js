class Military{
  constructor(settings){
    let obj = this;
    this.parentId = `#${settings.parentId}`;
    this.modalId = `#${settings.modalId}`;
    this.military = settings.data.military;
    this.faction = settings.data;
    this.buildDiv();
  }

  buildDiv(){
    let obj = this;
    let parent = obj.parentId; 
    $(parent).empty();

    let military = obj.military;
    $(parent).append($('<h3>Military</h3>'));
    $(parent).append($(`<label>Defending Forces: ${military.defendingForces}<br/>&#9(${military.defendingUnits} Units)</label><br/>`).addClass('faction_item'));
    $(parent).append($(`<label>Mobilized Forces: ${military.mobilizedForces}<br/>&#9(${military.mobilizedUnits} Units)</label>`).addClass('faction_item'));
    $(parent).click(obj.openModal.bind(obj));
  }

  openModal(){
    let obj = this;
    $(obj.modalId).empty();

    let closeButton = $("<span>&times;</span>").addClass('faction_dashboard_close');
    closeButton.click(obj.closeModal.bind(obj));

    let contentDiv = $('<div></div>').addClass('faction_dashboard_modal_content');
    contentDiv.append(closeButton);

    let forcesList = $('<li></li>');
    let forceClass = 'faction_item';
    obj.faction.forces.forEach(function(force){
      let forceDiv = $('<div></div>');
      let mobility = `${force.name} has ${force.units.length} units mobilized.`;
      if(force.city_id != -1 && typeof force.city !== 'undefined'){
        let unitText = force.units.length == 1 ? "unit" : "units";
        mobility = `${force.name} has ${force.units.length} ${unitText} defending ${force.city}.`;
      }
      forceDiv.append($(`<label>${mobility}</label>`).addClass(forceClass));
      forcesList.append(forceDiv);
    });

    contentDiv.append(forcesList);

    $(obj.modalId).append(contentDiv);

    $(obj.modalId).show();
  }

  closeModal(){
    let obj = this;
    $(obj.modalId).hide();
  }

}