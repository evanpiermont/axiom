 // The defult is to have edit boxes hidden. showEditBox will show the current box when clicked. 

var currentEdit = 0 // which para is clicked on for editing
var newparaAllowed = true


 // The defult is to have edit boxes hidden. showEditBox will show the current box when clicked. 

var currentE = "0"
 

// localChangeText renderers the currently changed text in the para box above the edit box
// it then calls renderPara which changes the text to the renderd text rather than TEX markup (and other sanitation to be added later)


  localChangeText = function(){
     $(document).on('keyup', '.edit_para', function(){
        var z = $(this).attr('id');
        var x = z.substring(0, z.length-4) + "para"
        // var value = $(this).val();
        // $('#' + x).data('norender', value);
        // if($('#' + x).hasClass('refs')){
        //   renderCite('#' + x);
        // } else {
        //   renderPara('#' + x);
        // }
        $('#' + z).siblings('.button_wrap').find('#commit').addClass('changed');
     })
 };

 textAreaResize = function(){
  $('textarea').each(function () {
  this.setAttribute('style', 'height:' + (parseInt((this.scrollHeight)) + 0) + 'px;overflow-y:hidden;');
  });
  
  $(document).on('input', 'textarea', function () {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
  //scrollBottom()
});
};

$(document).ready(localChangeText);
$(document).ready(textAreaResize);




// renderKatex is a filler function for now, it used the KATEX library to render TEX.
// Update this to make more sophisticated

renderKatex = function($id){
  $($id + '.math').each(function() {
    var texTxt = $(this).text();
    el = $(this).get(0);
    try {
      if(this.tagName == 'DIV'){
        katex.render(texTxt, el, { displayMode: true, throwOnError: false});
      }else{
        katex.render(texTxt, el, {throwOnError: false});
      }
    }
    catch(err) {
        $(this).html("<span class=err>" + texTxt + "</span>");
    }
  }); 
};

// Finds $ signs and replaces with the necesary <span> then calls KATEX render.

var eq_dict = {};
var eq_ref_dict = {};

renderPara = function(id, pop){
        pop = pop || false;
        var unRendered = $(id).data("norender");
        var Rendered = unRendered;
        var texcode = unRendered;
        
        $(id).html(Rendered)
        $(id).data('texcode', texcode)
        };


// Render ALL paragraphs at the very begining of time.


renderAll = function(){ 
  $('.contents').each(function() {
  var x = $(this).attr('id');
  renderPara('#' + x)
  });
  cite_nums()
  };

 $(document).ready(renderAll)



function serverChanges($form, formdata){
        $.post($form.attr('action'), formdata, function(json){
            if(json){
              window.location.href = window.location.origin + '/bib#cite' + json.citekey;
              window.location.reload(true) 
            }
        },'json');
        };

$(document).ready(function(){
   $(document).on('click', '#commit', function(){
      $('#content').data('eq', eq_dict);
      var $form = $(this).closest(".local_submit");
      var val = $('#addcite').val()
      json_val = renderCite(val)
      if(json_val){
        formdata =  json_val 
        formdata += '&submit=commit';
        formdata += '&texcode=' + val;
        formdata += '&old_citekey=' + $('#'+$art_id + "x0text").data('old_citekey');
        serverChanges($form, formdata);
        return false;
      } else {
        console.log("invalid bibtex")
        return false;
      }
  });
  $(document).on('click', '#discard', function(){
      var $form = $(this).closest(".local_submit");
        var formdata = $form.serialize();
        formdata = formdata + '&submit=discard'; 
        serverChanges($form, formdata);
      return false;
   });
  $(document).on('click', '#del', function(){
        var $form = $(this).closest(".local_submit");
        var formdata = $form.serialize();
        var val = $('#addcite').val()
        json_val = renderCite(val)
        if(json_val){
          formdata =  json_val 
          formdata += '&submit=delete';
          serverChanges($form, formdata);
          return false;
      }else {
        console.log("invalid bibtex")
        return false;
      };
   });
});



//Table of Contents

TOC = function(){
   $(document).on('mouseenter', '#head', function(){
    $('#sidebar').fadeIn();
});
  $(document).on('mouseleave', '#sidebar', function(){
    $('#sidebar').fadeOut();
});
};

$(document).ready(TOC);



//edit mode

var editmode = false

toggleEditMode = function(){
    if (editmode) {
      $('.click2edit').removeClass('focused');
      $('.para').removeClass('click2edit');
      editmode = false;
      $('#editbutton').html('Editing: Off')
      $('.parent4focus').hide();
    } else {
      $('.parent4focus').show();
      $('.edit_para').val("").focus()
      $('.contents').addClass('click2edit');
      editmode = true;
      $('#editbutton').html('Editing: <span class=err>On</span>')
    };
}

clickforEditMode = function(){
  $('#editbutton').click(function(){
    toggleEditMode();
  });
}

$(document).ready(clickforEditMode)

showBibTexonClick = function(){
    $(document).on('click', '.click2edit', function(){
        var x = $(this).data('bibtex');
        $('.edit_para').val(x)
        el = document.getElementById('addcite')
        el.setAttribute('style', 'height:' + (parseInt((el.scrollHeight)) + 0) + 'px;overflow-y:hidden;');
        el.style.height = 'auto';
        el.style.height = (el.scrollHeight) + 'px';
     });
 };

 $(document).ready(showBibTexonClick)



window.addEventListener("hashchange", function () {
    window.scrollTo(window.scrollX, window.scrollY - 50);
});

// key manuvers

var map = {17: false, 40: false, 38: false, 13: false, 91: false, 82: false, 27: false};
    $(document).keydown(function(e) {
      if (e.keyCode in map) {
        map[e.keyCode] = true;
        if (map[27]){
          console.log(e.keyCode);
            toggleEditMode();
        } else if (editmode){
          if (map[17] && map[40]) {  
              var current_wrap = currentE.substring(0, currentE.length-4) + "wrap";
              var next_wrap = $('#' + current_wrap).next('.wrap').attr("id");
              var next_para = next_wrap.substring(0, next_wrap.length-4) + "para"
              showEditBox(next_para);
          } else if (map[17] && map[38]) { 
              var current_wrap = currentE.substring(0, currentE.length-4) + "wrap";
              var next_wrap = $('#' + current_wrap).prev('.wrap').attr("id");
              var next_para = next_wrap.substring(0, next_wrap.length-4) + "para"
              showEditBox(next_para);
          } else if (map[17] && map[13]) { 
              var current_wrap = currentE.substring(0, currentE.length-4) + "wrap";
              $('#' + current_wrap).find('#commit').click();  
              map[17] = false;
              map[13] = false; 
          } else if (map[91] && map[13]) { 
              var current_wrap = currentE.substring(0, currentE.length-4) + "wrap";
              $('#' + current_wrap).find('#commit').click();
              $('#' + current_wrap).find('#add_below').click();
              map[91] = false;
              map[13] = false;  
          } else if (map[17] && map[82]) { 
            foreign_eq_refs();
            map[91] = false;
            map[13] = false; 
          } else if (map[27]) { 
            foreign_eq_refs();
            map[91] = false;
            map[13] = false; 
          }
      }
    }
    }).keyup(function(e) {
    for (key in map) {
        map[key] = false;
       // console.log(map);
    }
});


// references
//turn BIBtex entry into a JSON string

renderCite = function(strx){
        var re1 = /@[^{]+{(?:[^{}]|{[^{}]*}|{[^{}]*{[^{}]*}[^{}]*})*}/g
        if(strx.match(re1)){
        var x = strx.match(re1)[0]
        var bibdict = {}
        var re = /{(.*?),/
        if(x.match(re)){
          json_val = '&citekey=' + x.match(re)[1];
          var title = extractBibTex(/(title\=\{)([^{}]*|[^{}]*{[^{}]*}[^{}]*)\}/, x);
          json_val += '&title=' + toTitleCase(title);
          json_val += '&author=' + extractBibTex(/(author\=\{)([^{}]*|[^{}]*{[^{}]*}[^{}]*)\}/, x);
          json_val += '&journal=' + extractBibTex(/(journal\=\{)([^{}]*|[^{}]*{[^{}]*}[^{}]*)\}/, x);
          json_val += '&year=' + extractBibTex(/(year\=\{)([^{}]*|[^{}]*{[^{}]*}[^{}]*)\}/, x);
          json_val += '&volume=' + extractBibTex(/(volume\=\{)([^{}]*|[^{}]*{[^{}]*}[^{}]*)\}/, x);
          json_val += '&number=' + extractBibTex(/(number\=\{)([^{}]*|[^{}]*{[^{}]*}[^{}]*)\}/, x);
          json_val += '&pages=' + extractBibTex(/(pages\=\{)([^{}]*|[^{}]*{[^{}]*}[^{}]*)\}/, x);
          json_val += '&link=' + extractBibTex(/(url\=\{)([^{}]*|[^{}]*{[^{}]*}[^{}]*)\}/, x);
          return json_val
        } else {
          return false;
        };
      } else {
        return false;
      };
  };

extractBibTex = function(reg, strg){
  var key = "";
  key = strg.match(reg);
    if (key) {
      key=key[2].replace(/({|})/g, "");
    } else {
      key = "";
    }
  return key;
  };

cite_nums = function(){
  var cite = 1
  $('.cite_num').each(function() {
  $(this).text('[' + cite + ']  ');
  cite += 1;
  });
};

//alhpabitize citations

sortCite = function(id){
  $divs = $(".cite")
  var alphabeticallyOrderedDivs = $divs.sort(function (a, b) {
        return $(a).text() > $(b).text();
    });
  $(id).html(alphabeticallyOrderedDivs)
};

//create title case

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){
      if (txt.length < 4) {
        return txt
      } else {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      } 
    });
}



