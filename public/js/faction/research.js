class Research{
  constructor(settings){
    let obj = this;
    this.parentId = `#${settings.parentId}`;
    this.modalId = `#${settings.modalId}`;
    this.faction = settings.data;
    this.buildDiv();
  }

  buildDiv(){
    let obj = this;
    let parent = obj.parentId; 
    $(parent).empty();

    $(parent).append($('<h3>Research</h3>'));
    $(parent).click(obj.openModal.bind(obj));
  }

  openModal(){

  }

  closeModal(){
    let obj = this;
    $(obj.modalId).hide();
  }  
}