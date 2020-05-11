 // The defult is to have edit boxes hidden. showEditBox will show the current box when clicked. 

var currentEdit = 0 // which para is clicked on for editing
var newparaAllowed = true



// renderKatex is a filler function for now, it used the KATEX library to render TEX.
// Update this to make more sophisticated

// Finds $ signs and replaces with the necesary <span> then calls KATEX render.

  // renderPara = function(id){
  //       var unRendered = $(id).data("norender");
  //       var Rendered = unRendered.replace(/\$(.*?)\$/g, function myFunction(x){
  //           var nodollar = x.substring(1, x.length-1);
  //           return "<span class=math>" + nodollar + "</span>"
  //           });
  //       $(id).html(Rendered) 
  //       renderKatex()
  //};

 // The defult is to have edit boxes hidden. showEditBox will show the current box when clicked. 

var currentE = "0"

showEditBox = function(x){

  if (editmode) {
         $('.click2edit').removeClass('focused');
         $('.para').show()
         if (currentE != x){
        //commit changes
         var current_id = currentE.substring(0, currentE.length-4);
         //console.log(para, val)
         comBut = $('#' + current_id+ "wrap").find('#commit');
         if (comBut.hasClass('changed')){
            val = $('#' + current_id+ "edit").find('.edit_para').val()
            para = $('#' + current_id+ "para").data('norender', val);
            renderPara('#' + current_id+ "para")
            comBut.click();
        };
         currentE = x;
         paraId = x.substring(0, x.length-4);
         var y = paraId + "edit"
         var z = paraId + "text"
         $('#' + x).addClass('focused');
         var paraContent = $('#' + x).data('norender');
         $('.parent4focus').hide(0, function() {
                $('#' + x).hide();
                $('#' + y).show();
                $('#' + z).val(paraContent);
                textAreaResize();
                location.href = "#"+x;
                $('#' + z).focus();
                
        });
        
         // } else {
         //   $('.parent4focus').hide();
         //   $('.deleteverify').addClass('hidden')
         //   currentE = "0";
         // };
        };
      };
 };


showEditBoxOnClick = function(){
    $(document).on('click', '.click2edit', function(){
         var x = $(this).attr('id');
         showEditBox(x)
     });
    $(document).on('click', '#content', function(){

        if(event.target.id=="content"){ 
        var current_id = currentE.substring(0, currentE.length-4);
        comBut = $('#' + current_id+ "wrap").find('#commit');
         if (comBut.hasClass('changed')){
            val = $('#' + current_id+ "edit").find('.edit_para').val()
            para = $('#' + current_id+ "para").data('norender', val);
            renderPara('#' + current_id+ "para")
            comBut.click();
        };
        $('.click2edit').removeClass('focused');
        $('.para').show()      
        $('.parent4focus').hide();
        $('.deleteverify').addClass('hidden')
        currentE = "0";
       };
     });
 };

$(document).ready(showEditBoxOnClick);
 

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
  $($id).find('.math').each(function() {
    var texTxt = $(this).text();
    el = $(this).get(0);
    //console.log(el, 'katex')
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
        var texcode = unRendered;
        var sec = false;
        var thm = false;
        var ex = false;
        var cap = false;
        var eq_num = false;
        var f_eq_num = false;
        var eq_ref = false;
        var sec_ref = false;
        var fn_num = false;
        var thm_ref = false;
        var ex_ref = false;
        var cite_ref = false;
        var Rendered = ""
        Rendered += unRendered
        //escape chars
        Rendered = Rendered.replace(/\\\$/g, `&#36;`);
        Rendered = Rendered.replace(/\\\{/g, `&#123;`);
        Rendered = Rendered.replace(/\\\}/g, `&#125;`);
        //footnotes
        Rendered = Rendered.replace(/(\\footnote\{)(.*?)\}/g, function myFunction(x){
            var fntext = x.substring(10, x.length-1);
            fn_num = true;
            return `<span><span class=fn_num><sup></sup></span><span class=arrow_box data-fntext='`+fntext+`'></span></span>`;
            });
        //link to different page, using [[brackets with name of page]]
        Rendered = Rendered.replace(/\[\[(.*?)\]\]/g, function myFunction(x){
            var nobrak = x.substring(2, x.length-2);
            var url = nobrak.replace(/[^\w\s]/g, '');
            url = url.replace(/\s+/g, '-').toLowerCase();
            texcode = texcode.replace(x, '\\href{' + window.location.origin + '/' + url +'}{' + nobrak + '}')
            if (pop) { //in popup, do not have links create new popups
            return '<span><a data-url='+url+' href=/' + url + '>' + nobrak + "</a><span class=arrow_box >...</span></span>"
            } else{
            return '<span><a class=hl data-url='+url+' href=/' + url + '>' + nobrak + "</a><span class=arrow_box >...</span></span>"
            }
            });
         Rendered = Rendered.replace(/\$\$(.*?)\$\$(?:\[(.*?)\])?/g, function myFunction(x){
            var re = /(\[(.*?)\])/
            var eqlabel = x.match(re)
            if (eqlabel) {
              var realeqlabel = eqlabel[1].slice(1,-1);
              var labellen = realeqlabel.length + 2;
              var nodollar = x.substring(2, x.length- labellen - 2);
            }else{
              var labellen = 0;
              var realeqlabel = '';
              var nodollar = x.substring(2, x.length- labellen - 2);
            }
            texcode = texcode.replace(x, '\n \\begin{equation} \\label{eq:'+realeqlabel+'} \n ' + nodollar + '\n \\end{equation}')
            if(!(pop)){
            eq_num = true
            return `<div class=eq_wrap><div class='math' data-eqtext="`+nodollar+`"`+">" + nodollar + "</div><div class=eq id="+realeqlabel+"></div></div>"
            } else {
            f_eq_num = true
            return `<div class=eq_wrap><div class='math' data-eqtext="`+nodollar+`"`+">" + nodollar + "</div><div class=f_eq id="+realeqlabel+"></div></div>"
            }
            });
         Rendered = Rendered.replace(/\$(.*?)\$/g, function myFunction(x){
            var nodollar = x.substring(1, x.length-1);
            return "<span class=math>" + nodollar + "</span>"
            });
          Rendered = Rendered.replace(/(\\ref\{eq\:)(.*?)\}/g, function myFunction(x){
            var eqlabel = '#' + x.substring(8, x.length-1);
            eq_ref = true;
            texcode = texcode.replace(x, '\\eqref{eq:' + eqlabel.slice(1) + '}')
            return '<span><a class=eq_ref href=/'+$art_name_url+eqlabel+' data-eqlabel='+eqlabel+'>(??)</a><span class=arrow_box data-eqlabel='+eqlabel+'>...</span></span>';
            });
          Rendered = Rendered.replace(/(\\ref\{\*eq\:)(.*?)\}/g, function myFunction(x){
            var re1 = /(\[(.*?)\])/
            var labelTxt = x.match(re1)
            var defultlable = false
            if (labelTxt) {
              var reallabelTxt = labelTxt[1].slice(1,-1);
              var labellen = reallabelTxt.length + 2;
            }else{
              var labellen = 0;
              var reallabelTxt = '(render:[CMD+R])';
              defultlable = true;
            }
            x = x.substring(9, x.length-labellen-1)
            var re = /.+?(?=\;)/
            var foreign_art_id = x.match(re)
            var eqlabel = '#' + x.substring(foreign_art_id[0].length+1, x.length);
            return '<span><a class=foreign_eq_ref href=/'+foreign_art_id+eqlabel+' data-defultlable='+defultlable+' data-eqlabel='+eqlabel+' data-artlabel='+foreign_art_id+'>'+reallabelTxt+'</a><span class=arrow_box data-eqlabel='+eqlabel+'>...</span></span>';
            });
         Rendered = Rendered.replace(/(\\ref\{sec\:)(.*?)\}/g, function myFunction(x){
            var seclabel = '#' + x.substring(9, x.length-1);
            sec_ref = true;
            texcode = texcode.replace(x, 'Section \\ref{sec:' + seclabel.slice(-1) + '}');
            return '<a class=sec_ref href=/'+$art_name_url+seclabel+' data-seclabel='+seclabel+'>(??)</a>'
            });
         Rendered = Rendered.replace(/(\\ref\{thm\:)(.*?)\}/g, function myFunction(x){
            var envlabel = '#' + x.substring(9, x.length-1);
            thm_ref = true;
            texcode = texcode.replace(x, 'Theorem \\ref{thm:' + envlabel.slice(-1) + '}');
            return '<a class=thm_ref href=/'+$art_name_url+envlabel+' data-envlabel='+envlabel+'>(??)</a>'
            });
          Rendered = Rendered.replace(/(\\ref\{ex\:)(.*?)\}/g, function myFunction(x){
            var envlabel = '#' + x.substring(8, x.length-1);
            ex_ref = true;
            texcode = texcode.replace(x, 'Example \\ref{ex:' + envlabel.slice(-1) + '}');
            return '<a class=ex_ref href=/'+$art_name_url+envlabel+' data-envlabel='+envlabel+'>(??)</a>'
            }); 
          Rendered = Rendered.replace(/(\\cite\{)(.*?)\}/g, function myFunction(x){
            var citekey = x.substring(6, x.length-1);
            cite_ref = true;
            texcode = texcode.replace(x, '\\cite{' + citekey + '}');
            keylist = citekey.split(",")
            citehtml = ""
            for (i = 0; i < keylist.length; i++) {
                 if(i==0){
                 citehtml += '<span><a class=cite_ref href=/'+$art_name_url+'#cite'+keylist[i]+' data-citekey='+keylist[i]+'>??</a><span class=arrow_box>...</span></span>';
                 } else {
                 citehtml += '; <span><a class=cite_ref href=/'+$art_name_url+'#cite'+keylist[i]+' data-citekey='+keylist[i]+'>??</a><span class=arrow_box>...</span></span>';                  
                }
             } 
            if (pop){
            return citehtml
            } else {
            return citehtml
            }
            });  
            Rendered = Rendered.replace(/(\\citep\{)(.*?)\}/g, function myFunction(x){
            var citekey = x.substring(7, x.length-1);
            cite_ref = true;
            texcode = texcode.replace(x, '\\cite{' + citekey + '}');
            keylist = citekey.split(",")
            citehtml = "("
            for (i = 0; i < keylist.length; i++) {
                 if(i==0){
                 citehtml += '<span><a class="cite_ref paren" href=/'+$art_name_url+'#cite'+keylist[i]+' data-citekey='+keylist[i]+'>??</a><span class=arrow_box>...</span></span>';
                 } else {
                 citehtml += '; <span><a class="cite_ref paren" href=/'+$art_name_url+'#cite'+keylist[i]+' data-citekey='+keylist[i]+'>??</a><span class=arrow_box>...</span></span>';                  
                }
             } 
            citehtml += ")"
            if (pop){
            return citehtml
            } else {
            return citehtml
            }
            }); 
         Rendered = Rendered.replace(/(\\textcolor\{)(.*?)\}(?:\{(.*?)\})?/g, function myFunction(x){
            var re = /(\{(.*?)\})/g
            var color = x.match(re)
            if(color.length == 2){
              col = color[0].slice(1,-1)
              ctext = color[1].slice(1,-1)
              if(col[0]=="#"){
                texcode = texcode.replace(x, '\\definecolor{'+col.slice(1)+'}{HTML}{'+col.slice(1)+'} \n \\textcolor{'+col.slice(1)+'}{'+ctext+'}');
              }else{
              texcode = texcode.replace(x, '\\textcolor{'+col+'}{'+ctext+'}');
              };
            return `<span style="color:`+ col + `">` + ctext + "</span>";
            }
            });
         // for enviornments
        if(Rendered.startsWith("\\example")){
            var re1 = /(\\example)(?:\[(.*?)\])?/g //get \\section[label]
            x = Rendered.match(re1)[0]
            realenvlabel = envLableText(x,Rendered).realenvlabel
            inner_text = envLableText(x,Rendered).inner_text
            ex = true;
            ex_ref = true;
            texcode = '\\begin{ex}\\label{ex:'+realenvlabel+'} \n '+ inner_text + '\n \\end{ex}';
            Rendered = "<span class=ex id ="+realenvlabel+"><span class=ex_num></span>" + inner_text + "</span>";

        };
        if(Rendered.startsWith("\\section")){
            var re1 = /(\\section)(?:\[(.*?)\])?/g //get \\section[label]
            x = Rendered.match(re1)[0]
            realenvlabel = envLableText(x,Rendered).realenvlabel
            inner_text = envLableText(x,Rendered).inner_text
            sec = true;
            texcode = '\\section{'+inner_text+'} \n \\label{sec:'+realenvlabel+'}';
            Rendered = "<div class=section id ="+realenvlabel+"><span class=section_num></span>" + inner_text + "</div>";
        }
        if(Rendered.startsWith("\\theorem")){
            var re1 = /(\\theorem)(?:\[(.*?)\])?/g //get \\section[label]
            x = Rendered.match(re1)[0]
            realenvlabel = envLableText(x,Rendered).realenvlabel
            inner_text = envLableText(x,Rendered).inner_text
            thm = true;
            thm_ref = true
            texcode = '\\begin{thm}\\label{thm:'+realenvlabel+'} \n '+ inner_text + '\n \\end{thm}';
            Rendered =  "<span class=thm id ="+realenvlabel+"><span class=thm_num></span>" + inner_text + "</span>";
        };
        if(Rendered.startsWith("\\proof")){
            var re1 = /(\\proof)(?:\[(.*?)\])?/g //get \\section[label]
            x = Rendered.match(re1)[0]
            realenvlabel = envLableText(x,Rendered).realenvlabel
            inner_text = envLableText(x,Rendered).inner_text
            texcode = '\\begin{proof}\\label{proof:'+realenvlabel+'} \n '+ inner_text + '\n \\end{proof}';
            Rendered =  "<span class=proof id ="+realenvlabel+">Proof. </span>" + inner_text + "<div class='qed'>&#9632;</div>";
        };
        if(Rendered.startsWith("\\img")){
            var re1 = /(\\img)(?:\[(.*?)\])?/g //get \\section[label]
            x = Rendered.match(re1)[0]
            url = envLableText(x,Rendered).realenvlabel
            caption = envLableText(x,Rendered).inner_text.trim()
            if(caption.startsWith("\\caption")){
              var re1 = /(\\caption)(?:\[(.*?)\])?/g //get \\section[label]
              x = Rendered.match(re1)[0]
              realenvlabel = envLableText(x,caption).realenvlabel
              caption_text = envLableText(x,caption).inner_text
              cap = true
              texcode = "%%% IMG NOT AVAIBLE USE CONTEX";
              Rendered =  "<img class=img_center src="+url+"><div class=caption id="+realenvlabel+"><span class=cap_num></span>" + caption_text + "</div>";
            } else {
              texcode = "%%% IMG NOT AVAIBLE USE CONTEX";
              Rendered =  "<img class=img_center src="+url+">";
            };
        };
        $(id).html(Rendered)
        $(id).data('texcode', texcode)
        eq_dict = {};
        if (!(pop)) { // do not relable section number, eq number, when in popup
        if (sec){
          sections();
          sec = false;
        }
        if (eq_num){
          eq_nums();
          eq_num = false;
        } 
        if (eq_ref){
          eq_refs();
          eq_ref = false;
        }
        if (sec_ref){
          sec_refs();
          sec_ref = false;
        }
        if (fn_num){
          fn_nums();
          fn_num = false;
        }
        if (thm){
          thms();
          thm = false;
        }
        if (ex){
          exs();
          ex = false;
        }
        if (cap){
          caps();
          cap = false;
        }
        if (thm_ref){
          thm_refs();
          thm_ref = false;
        }
        if (ex_ref){
          ex_refs();
          ex_ref = false;
        }
        if (cite_ref){
          cite_refs();
          render_refs();
          cite_ref = false;
        }

        }
        if (f_eq_num){
          f_eq_nums();
          f_eq_num = false;
        } 
        renderKatex(id)
  };

envLableText = function(x, y){
  //x is a \\enviorment[lable] regex capture
  //y is the entire text
  var re = /(\[(.*?)\])/
  var envlabel = x.match(re)
  if (envlabel) {
    var realenvlabel = envlabel[1].slice(1,-1);
    var labellen = realenvlabel.length + 2;
  }else{
    var labellen = 0;
    var realenvlabel = '';
  }
  inner_text = y.slice(x.length)
  if(inner_text[0] == " "){
    inner_text = inner_text.slice(1);
  }
  return {
        inner_text: inner_text,
        realenvlabel: realenvlabel,
    };
};

makeNewPara = function($para_id, $para_order, $prev_para){
       $($prev_para).after(`
      <div class=wrap id=` + $para_id + `wrap>
      <div id=` + $para_id + "para" + ` class="para contents click2edit" data-norender=''>
      </div>
      <div id=` + $para_id + "edit" + ` class="para parent4focus hidden">
        <form method='POST' enctype='multipart/form-data' class=local_submit action='/_update/` + $art_name_url +'/' + $para_order + `'>
        <textarea autocomplete="off" autofocus="autofocus"
        name=` + $para_id + "text" + ` id=` + $para_id + "text" + ` class="edit_para">
        </textarea>
              <div class=button_wrap>
              <div class='fakebutton' id=commit>Commit</div>
              <div class='fakebutton' id=discard>Undo</div>
              <div class='fakebutton' id=add_below>Add &#x2193</div>
              <div class='fakebutton deletebutton'>Delete</div>
              <div class='deleteverify hidden'> Are you sure you would like to delete this section? 
                <input type="submit" value="Delete" class='local_submit' name=delete id=delete>
                <div class='fakebutton undeletebutton'>Cancel</div>
              </div>
              </div>
      </form>
    </div>
    </div>
            `);
         showEditBox($para_id + "para");
};



// Render ALL paragraphs at the very begining of time.


renderAll = function(){ 
  $('.para').each(function() {
  var x = $(this).attr('id');
  renderPara('#' + x)
  if($('#' + x).hasClass('refs')){
    renderCite('#' + x);
  }
  });
  foreign_eq_refs();
  render_refs();
 };

 $(document).ready(renderAll)



function serverChanges($form, formdata){
        $.post($form.attr('action'), formdata, function(json){
            //console.log(json);
            var z = json.para.substring(0, json.para.length-4) + "text";
            $('#' + z).val(json.para_contents);
            $('#' + json.para).data('norender', json.para_contents);
            $('#' + z).siblings('.button_wrap').find('#commit').removeClass('changed');
            //renderPara('#' + json.para);
              if($('#' + json.para).hasClass('refs')){
                renderCite('#' + json.para);
              }
        },'json');
        };

$(document).ready(function(){
   $(document).on('click', '#commit', function(){
      $('#content').data('eq', eq_dict);
      var $form = $(this).closest(".local_submit");
        var formdata = $form.serialize();
        formdata = formdata + '&submit=commit';
        para = $(this).closest('.wrap').find('.para')
        var texcode = JSON.stringify(para.data('texcode'));
        formdata =formdata + '&texcode=' + texcode;
        var eq = JSON.stringify($('#content').data('eq'));
        formdata = formdata + '&eq=' + eq;
        var wrap = $form.closest('.wrap');
        if (wrap.find(".section").length > 0){   //check if section
        formdata = formdata + '&issec=' + true;
        } else {
        formdata = formdata + '&issec=' + false;
        }
        serverChanges($form, formdata);
        renderPara(para.attr('id'))
        foreign_eq_refs();
      return false;
  });
  $(document).on('click', '#discard', function(){
      var $form = $(this).closest(".local_submit");
        var formdata = $form.serialize();
        formdata = formdata + '&submit=discard'; 
        serverChanges($form, formdata);
      return false;
   });
  $(document).on('click', '#add_below', function(){
        var $form = $(this).closest(".local_submit");
        var formdata = $form.serialize();
        formdata = formdata + '&submit=add_below'; 
        $.post($form.attr('action'), formdata, function(json){
          var v = '#' + json.prev_para + "wrap";
          makeNewPara(json.new_para, json.para_order, v);
        }, 'json');
      return false;
   });
  $(document).on('click', '#del', function(){
        var $form = $(this).closest(".local_submit");
        var formdata = $form.serialize();
        formdata = formdata + '&submit=delete'; ; 
        $.post($form.attr('action'), formdata, function(json){
            console.log('cc', json)
            var u = json.para.substring(0, json.para.length-4) + "wrap";
            $('#' + u).remove();
            sections();
            eq_nums();
        },'json');
      return false;
   });
});


//section numbers

sections = function(){
  $('#ToC').html('')
  var sec = 1
  $('.section').each(function() {
  $(this).children('.section_num').text(("0"+sec+": ").slice(-4));
  var anchor = $(this).parent('.para').attr('id');
  var sec_text = $(this).text();
  $('#ToC').append('<a href=#' + anchor+ '>' + sec_text + '</a><br>');
  sec += 1;
  });
};

thms = function(){
  var thm = 1
  //thm += '0' + thm
  //thm = thm.slice(-2);
  $('.thm').each(function() {
  $(this).children('.thm_num').text("Theorem "+thm+". ");
  thm += 1;
  });
};

caps = function(){
  var cap = 1
  $('.caption').each(function() {
  $(this).children('.cap_num').text("Figure "+cap+". ");
  cap += 1;
  });
};

exs = function(){
  var ex = 1
  $('.ex').each(function() {
  $(this).children('.ex_num').text("Example "+ex+". ");
  ex += 1;
  });
};

//eq_nums numbers

eq_nums = function(){
  var eq = 1
  $('.eq').each(function() {
  $(this).text('(' + eq + ')');
  var label = $(this).attr('id');
  var eqtext = $(this).siblings('.math').data('eqtext')
  eq_dict[label] = [eqtext, eq];
  eq += 1;
  });
  $('#content').data('eq', eq_dict);
};

//forign eq numbers within popup

f_eq_nums = function(){
  var eq = 1
  $('.f_eq').each(function() {
  $(this).text('('+eq+')');
  eq += 1;
  });
};

//eq references (enumerates over page, is totally local)

eq_refs = function(){
  eq_num = 1;
  $('.eq_ref').each(function() {
  var eqlabel = $(this).data("eqlabel");
  $(this).siblings('.arrow_box').attr("id", "popup" + eq_num)
  var eqname = $(eqlabel).text();
  if (eqname){
      $(this).text(eqname)
      var texTxt = $(eqlabel).siblings('.math').data('eqtext');
      var el = $(this).siblings('.arrow_box');
      el.data('eqtext', texTxt);
  } else {
      $(this).text('(??)').addClass('err');
  }
  eq_num += 1;
  });
};

foreign_eq_refs = function(){
  $('.foreign_eq_ref').each(function() {
      var el = $(this);
      var eqlabel = el.data("eqlabel").slice(1);
      var foreign_art_id = el.data("artlabel");
      var defultlable = el.data('defultlable');
      if(defultlable){
        $.getJSON('/_getEQ', {
          eqlabel: eqlabel,
          foreign_art_id: foreign_art_id
        }, function(json) {
          if (json.eq_text){
            el.text('(' + foreign_art_id + '.' + json.eq_number + ')');
          }else{
            el.text('(??)');
          }
        });  
      };
  });
};

sec_refs = function(){
  $('.sec_ref').each(function() {
  var seclabel = $(this).data("seclabel");
  var secname = $(seclabel).text();
  if (secname){
      $(this).text('Section ' + secname)
  } else {
      $(this).text('(??)').addClass('err');
  }
  });
};

cite_refs = function(){
  keylist = []
  $('.cite_ref').each(function() {
  el = $(this)
  current_key = el.data("citekey")
  keylist.push(current_key);
  });
  keylist = JSON.stringify(keylist);
  $.getJSON('/_getREFS', {
          keylist: keylist,
        }, function(json) {
          //console.log(json)
          keydict = json['json_key_list']
          keydict = JSON.parse(keydict)
          ref_html = ""
          for(citekey in keydict){
            if(keydict[citekey]){
            ref_html += `<div class=cite id=cite`+citekey+`><span class=cite_num></span>` +
              keydict[citekey]['author'] +'. ' + keydict[citekey]['year']  +'. ' +  keydict[citekey]['title'] +'.  <em>' + keydict[citekey]['journal'] + '</em>' + keydict[citekey]['volume'] + keydict[citekey]['number'] + keydict[citekey]['pages'] +'.'
            + `</div>`
          };
          };
          $('#xrpara').html(ref_html)
          sortCite('#xrpara')
          //cite_nums() no need for numbers
          $('#xRwrap').fadeIn();
        });
};

render_refs = function(){
  $('.cite_ref').each(function() {
  el = $(this)
  render_refs_local(el);
    });
};


render_refs_local = function(el){
  current_key = el.data("citekey")
  $.getJSON('/_getCITETEXT', {
          current_key: current_key,
        }, function(json) {
          if(json){
            if (el.hasClass('paren')){
              el.text(json.cite_text + ', ' + json.year);
            } else {
            el.text(json.cite_text + ' (' + json.year + ")");
            };
          };
        });
    };


thm_refs = function(){
  $('.thm_ref').each(function() {
  var envlabel = $(this).data("envlabel");
  var thmname = $(envlabel).children('.thm_num').text();
  if (thmname){
      $(this).text(thmname.slice(0, -2))
  } else {
      $(this).text('(??)').addClass('err');
  }
  });
};


ex_refs = function(){
  $('.ex_ref').each(function() {
  var envlabel = $(this).data("envlabel");
  var exname = $(envlabel).children('.ex_num').text();
  if (exname){
      $(this).text(exname.slice(0, -2))
  } else {
      $(this).text('(??)').addClass('err');
  }
  });
};


//fn_nums numbers

fn_nums = function(){
  var fn = 1
  $('.fn_num').each(function() {
  $(this).html('<sup>'+fn+'</sup>');
  $(this).siblings('.arrow_box').attr('id', 'fn'+fn);
  fn += 1;
  });
};


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


// rendering popup boxes

popup = function(){
     $(document).on('mouseenter', '.eq_ref', function(){
      var el = $(this).siblings('.arrow_box').get(0);
      var stupidel = $(this)
      stupidel.siblings('.arrow_box').width('50%')
      window.onmousemove = function (e) {
          var z = stupidel.siblings('.arrow_box').width();
          var v = stupidel.siblings('.arrow_box').height();
          mouseX = e.clientX;
          mouseY = e.clientY;
          el.style.top = (mouseY - v - 30) + 'px';
          el.style.left = (mouseX - z/2) + 'px';
        };
      var texTxt = $(this).siblings('.arrow_box').data('eqtext');
       $(this).siblings('.arrow_box').fadeIn(function(id){
         katex.render(texTxt, el, {throwOnError: false});
         });
    });
    $(document).on('mouseleave', '.eq_ref', function(){
       $(this).siblings('.arrow_box').hide();
     })
 };

$(document).ready(popup);

popup_foreign = function(){
     $(document).on('mouseenter', '.foreign_eq_ref', function(){
      var texTxt = 'dd';
      var el = $(this);
      var el2 = el.siblings('.arrow_box').get(0);
      var eqlabel = el.data("eqlabel").slice(1);
      var foreign_art_id = el.data("artlabel");
      $(this).siblings('.arrow_box').width('50%')
      window.onmousemove = function (e) {
          var z = el.siblings('.arrow_box').width();
          var v = el.siblings('.arrow_box').height();
          mouseX = e.clientX;
          mouseY = e.clientY;
          el2.style.top = (mouseY - v - 30) + 'px';
          el2.style.left = (mouseX - z/2) + 'px';
        };
      $.getJSON('/_getEQ', {
        eqlabel: eqlabel,
        foreign_art_id: foreign_art_id
      }, function(json) {
        if (json.eq_text){
          texTxt = json.eq_text;
          el.siblings('.arrow_box').fadeIn(function(id){
          katex.render(texTxt, el2, {throwOnError: false});
         });
        } else{
          el.siblings('.arrow_box').text('ERR: Undefined Label').fadeIn();
        }
      });
    });
    $(document).on('mouseleave', '.foreign_eq_ref', function(){
       $(this).siblings('.arrow_box').hide();
     })
 };

$(document).ready(popup_foreign);

popup_fn = function(){
     $(document).on('mouseenter', '.fn_num', function(){
      var el = $(this).siblings('.arrow_box').get(0);
      $(this).siblings('.arrow_box').width('50%');
      var el2 = $(this).siblings('.arrow_box');
      var fntext = el2.data('fntext');
      el2.html(fntext);
      window.onmousemove = function (e) {
          var z = el2.width();
          var v = el2.height();
          mouseX = e.clientX;
          mouseY = e.clientY;
          el.style.top = (mouseY - v - 30) + 'px';
          el.style.left = (mouseX - z/2) + 'px';
        };
       el2.fadeIn(function(id){
         renderKatex('#' + el2.attr('id'));
         });
    });
    $(document).on('mouseleave', '.fn_num', function(){
       $(this).siblings('.arrow_box').hide();
     })
 };

 $(document).ready(popup_fn);



// overview boxes on internal hyperlinks

var mouseX = 0;
var mouseY = 0;

ov_popup = function(){
     $(document).on('mouseenter', '.hl', function(){
      var el = $(this);
      var el2 = el.siblings('.arrow_box').get(0);
      window.onmousemove = function (e) {
          var z = el.siblings('.arrow_box').width();
          var v = el.siblings('.arrow_box').height();
          mouseX = e.clientX;
          mouseY = e.clientY;
          el2.style.top = (mouseY - v - 30) + 'px';
          el2.style.left = (mouseX - z/2) + 'px';
        };
      var foreign_art_id = el.data("url");
      $.getJSON('/_getOV', {
        foreign_art_id: foreign_art_id
      }, function(json) {
        if (json.ov_text){
          texTxt = json.ov_text;
            el.siblings('.arrow_box').html('');
            el.siblings('.arrow_box').append(`<div class=para><span class=section>`+foreign_art_id+`</span></div>`);
            for (var i = 0; i < json.ov_text.length; i++) {
              el.siblings('.arrow_box').append(`<div class=para id=`+foreign_art_id + `_popup` + i + ` data-norender='`+json.ov_text[i]+`'></div>`);
            }
            for (var i = 0; i < json.ov_text.length; i++) {
            preRenderPop('#' + foreign_art_id + '_popup' + i, foreign_art_id);
            renderPara('#' + foreign_art_id + '_popup' + i, true);
            foreign_eq_refs();
            $('#' + foreign_art_id + '_popup' + i).find('.cite_ref').each(function() {
            elCite = $(this)
            render_refs_local(elCite);
            });
            }
            var z = el.siblings('.arrow_box').width();
            var v = el.siblings('.arrow_box').height();
            el2.style.top = (mouseY - v - 30) + 'px';
            el2.style.left = (mouseX - z/2) + 'px';
            el.siblings('.arrow_box').fadeIn();
        } else{
          el.siblings('.arrow_box').text('ERR: Undefined Link').fadeIn();
        }
      });
    });
    $(document).on('mouseleave', '.hl', function(){
       $(this).siblings('.arrow_box').hide();
     })
 };

 popup_cite = function(){
     $(document).on('mouseenter', '.cite_ref', function(){
      var el = $(this).siblings('.arrow_box').get(0);
      var stupidel = $(this)
      citekey = $(this).data('citekey')
      stupidel.siblings('.arrow_box').width('50%')
      window.onmousemove = function (e) {
          var z = stupidel.siblings('.arrow_box').width();
          var v = stupidel.siblings('.arrow_box').height();
          mouseX = e.clientX;
          mouseY = e.clientY;
          el.style.top = (mouseY - v - 30) + 'px';
          el.style.left = (mouseX - z/2) + 'px';
        };
       box = $(this).siblings('.arrow_box')
       box.html($('#cite' + citekey).html())
       box.fadeIn();

    });
    $(document).on('mouseleave', '.cite_ref', function(){
       $(this).siblings('.arrow_box').hide();
     })
 };

  $(document).ready(popup_cite);

 // helper function: makes forign lables out of local lables for ov popup

 preRenderPop = function(id, art_name){
        var unRendered = $(id).data("norender");

          preRendered = unRendered.replace(/(\\ref\{eq\:)(.*?)\}(?:\{(.*?)\})?/g, function myFunction(x){
            var eqlabel = x.substring(8, x.length-1);
            eq_ref = true;
            return '\\ref{*eq:'+art_name+';'+eqlabel+'}';
            });

          $(id).data("norender", preRendered);
  };

 //movement of popups with mouse



$(document).ready(ov_popup);

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
      $('#new_para').removeClass('hidden');
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

// toggleDelete = function(){
//    $(document).on('click', '.deletebutton', function(){
//     $(this).siblings('.deleteverify').removeClass('hidden')
// });
//   $(document).on('click', '.undeletebutton', function(){
//     $(this).parents('.deleteverify').addClass('hidden')
// });
// };


// $(document).ready(toggleDelete)

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

// renderCite = function(id){
//         var unRendered = $(id).data("norender");
//         var texcode = unRendered;
//         var Rendered = unRendered.replace(/@[^{]+{(?:[^{}]|{[^{}]*}|{[^{}]*{[^{}]*}[^{}]*})*}/g, function myFunction(x){
//             var title=""
//             var author=""
//             var journal=""
//             var year =""
//             var pages =""
//             var volume = ""
//             var link = ""
//             var re = /{(.*?),/
//             var key = x.match(re)[1]
//             title = extractBibTex(/(title\=\{)([^{}]*|[^{}]*{[^{}]*}[^{}]*)\}/, x);
//             title = toTitleCase(title);
//             author = extractBibTex(/(author\=\{)([^{}]*|[^{}]*{[^{}]*}[^{}]*)\}/, x);
//             journal = extractBibTex(/(journal\=\{)([^{}]*|[^{}]*{[^{}]*}[^{}]*)\}/, x);
//             year = extractBibTex(/(year\=\{)([^{}]*|[^{}]*{[^{}]*}[^{}]*)\}/, x);
//             volume = extractBibTex(/(volume\=\{)([^{}]*|[^{}]*{[^{}]*}[^{}]*)\}/, x);
//             pages = extractBibTex(/(pages\=\{)([^{}]*|[^{}]*{[^{}]*}[^{}]*)\}/, x);
//             link = extractBibTex(/(url\=\{)([^{}]*|[^{}]*{[^{}]*}[^{}]*)\}/, x);

//             if (volume){
//               volume = volume + ":"
//             }
//             if (pages){
//               pages = pages + ", "
//             }
//             if (!(journal)){
//               journal = "Working Paper"
//             }
//             if (link){
//             return "<div class=cite id=cite"+key+"><span class=cite_num></span><a href="+link+">" + author + ". " + title + ". <em>" + journal + "</em>, " + volume + pages + year + ". </a></div>";
//             } else {
//             return "<div class=cite id=cite"+key+"><span class=cite_num></span>" + author + ". " + title + ". <em>" + journal + "</em>, " + volume + pages + year + ". </div>";
//             }
//             });

//         $(id).html(Rendered)
//         $(id).data('texcode', texcode)
//         sortCite(id);
//         cite_nums(); 
//   };

// extractBibTex = function(reg, strg){
//   var key = "";
//   key = strg.match(reg);
//     if (key) {
//       key=key[2].replace(/({|})/g, "");
//     } else {
//       key = "";
//     }
//   return key;
//   };

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



