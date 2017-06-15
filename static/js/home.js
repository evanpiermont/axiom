 // The defult is to have edit boxes hidden. showEditBox will show the current box when clicked. 

var currentEdit = 0 // which para is clicked on for editing
var newparaAllowed = true



// renderKatex is a filler function for now, it used the KATEX library to render TEX.
// Update this to make more sophisticated

renderKatex = function(){
  $('.intromath').each(function() {
    var texTxt = $(this).text();
    el = $(this).get(0);
    try {
      if(this.tagName == 'DIV'){
        katex.render(texTxt, el, { displayMode: true, throwOnError: false, errorColor: "red"});
      }else{
        katex.render(texTxt, el, {throwOnError: false, errorColor: "red"});
      }
    }
    catch(err) {
        $(this).html("<span class=err>" + texTxt + "</span>");
    }
  }); 
};

$(document).ready(renderKatex)








