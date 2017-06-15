

// this code will initilize the screen, font sizes, colors etc. keep colors
// here for easy changing.
//


$cBG = "white";
$cHBG = "lightgray";
$cHT = "#4a0000";


fontsize = function () {
    var x = $(window).width() * 0.10; // 10% of container width
    var y = $(window).height() * 0.10; // 10% of container height
    var fontSize = Math.min(x,y);
    $("body").css('font-size', fontSize);
};

colors = function(){
    $("body").css('background', $cBG);
    $("#head").css('color', $cHT);
    $("#foot").css('background-color', $cHBG);
};



$(window).resize(fontsize);
$(document).ready(colors);
$(document).ready(fontsize);








