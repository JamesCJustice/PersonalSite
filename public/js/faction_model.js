// Handles updating and saving factions in a list.
class DataModel{
  constructor(settings){
    this.entity = settings.entity
    this.parentId = settings.parentId;
    this.rows = [];
    this.columns = settings.columns;
  }

  update(){
    let obj = this;
    $.ajax({
      type: 'GET',
      url: `/${obj.entity}/data`,
      contentType: "application/json; charset=utf-8",
      success: obj._finishUpdate.bind(obj),
      error: function(error){
          console.log(error);
      }
    });
  }

  _finishUpdate(data){
    let obj = this;
    obj.rows = Array.isArray(data) ? data : [];
    obj._renderRows();
  }

  _renderRows(){
    let obj = this;
    $("#" + obj.parentId).empty();
    
    let emptyRow = { id: -1};
    for(let i in obj.columns){
      let col = obj.columns[i];
      emptyRow[col.name] = col.example;
    }
    obj.rows.unshift(emptyRow);

    for(let i in obj.rows){
      let row = obj.rows[i];
      
      let html = obj._buildRowHtml(row);
      $("#" + obj.parentId).append(html);
      $(`#${obj.entity}_${row.id}_delete`).click(function(){
        let deleteRow = obj._deleteRow.bind(obj);
        deleteRow(row.id);
      });
      $(`#${obj.entity}_${row.id}_update`).click(function(){
        let updateRow = obj._updateRow.bind(obj);
        updateRow(row.id);
      });
    }
  }

  _buildRowHtml(row){
    let obj = this;
    let html = `<div id="${obj.entity}_${row.id}_div">`;
    html += `<button id="${obj.entity}_${row.id}_delete">X</button>`
    for(let i in obj.columns){
      let col = obj.columns[i];
      col.val = row[col.name] == 0 ? row[col.name] : row[col.name] || col.default;
      html += obj._buildColHtml(col);
    }
    html += `<button id="${obj.entity}_${row.id}_update">Update</button>`;
    html += "</div>";
    return html;
  }

  _buildColHtml(col){
    if(col.type === "text"){
      return `<label>${col.name}</label><input type="text" name="${col.name}" value="${col.val}"></input>`;
    }
  }

  _updateRow(id){
    let obj = this;
    let data = {
      id: id
    };
    for(let i in obj.columns){
      let col = obj.columns[i];
      data[col.name] = $(`#${obj.entity}_${id}_div`)
      .children(`input[name="${col.name}"]`).val();
    }
    console.log(JSON.stringify(data));
    $.ajax({
        type: 'POSt',
        url: `/${obj.entity}/${id}/update`,
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        success: obj.update.bind(obj),
        error: function(error){
            console.log(error);
        }
    });
  }

  _deleteRow(id){
    let obj = this;
    $.ajax({
        type: 'POST',
        url: `/${obj.entity}/${id}/delete`,
        contentType: "application/json; charset=utf-8",
        success: obj.update.bind(obj),
        error: function(error){
            console.log(error);
        }
    }); 
  }
}

let factionModel;

$(document).ready(function(){
  factionModel = new FactionModel({
    entity: "factions",
    parent_id: "factions_ul",
    columns: [
      { type: "text", name: "name", example: "New faction", default: "" },
      { type: "text", name: "x", example: "0", default: "" },
      { type: "text", name: "y", example: "0", default: "" },
    ],
  });
  factionModel.update();
});