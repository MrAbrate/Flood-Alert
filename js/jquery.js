$(document).ready(function (){
  var width = $(window).width();
  //Assuming X=550
  if(width <= 550){
    $('#map').css('float','none');
    $('#map').css('width','100%');
    $('#description').css('float','none');
    $('#description').css('position','initial');
  }
  else{
    $('#map').css('float','left');
    $('#map').css('width','83vh');
    $('#description').css('float','right');
    $('#description').css('position','absolute');
  }
  $(window).resize(function(){
   var width = $(window).width();
   //Assuming X=550
   if(width <= 550){
     $('#map').css('float','none');
     $('#map').css('width','100%');
     $('#description').css('float','none');
     $('#description').css('position','initial');
   }
   else{
     $('#map').css('float','left');
     $('#map').css('width','83vh');
     $('#description').css('float','right');
     $('#description').css('position','absolute');
   }
  })
});
