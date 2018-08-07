// Import JQeury before this.
// Appends a header to "header_div"
var header = {};

header.link_href = function(){
    return [
        "/",
        "/login"
    ];
}

header.link_text = function(){
    return [
        "Home",
        "Login"
    ];
}

header.populate = function(){
    var header_html = "<ul>";
    var link_text = header.link_text();
    var link_href = header.link_href();
    for(var i = 0; i < link_text.length; i++){
        header_html += "<li>";
        header_html += '<a href="' + link_href[i] + '">';
        header_html += link_text[i];
        header_html += "</a>";
        header_html += "</li>";
    }
    header_html += "</ul>";
    
    $("#header_div").html(header_html);
};