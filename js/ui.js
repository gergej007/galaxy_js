// KEZDO PANEL DIALOG 
function kezdo_panel(score) {
    game_data.game_states.dialog_flag=true;  
    game_data.game_states.traffic_flag = false; 
    stop_base_level_enemies();   

    var kezdo_panel_keret = $("<div class='kezdo_panel'>");

    kezdo_panel_keret.dialog({
        title: "Galaxy JS",
        resizable: false,
        draggable: false,
        modal: false,
        width: 600,
        height: 530,
        closeOnEscape: false,
        open: function () {
            $.get("tpl/menu.tpl", function (visszatemp) {
                var tempobj = $().add(visszatemp);
                tempobj.appendTo(kezdo_panel_keret);
                $("#progress_keret").html(`Reach score <span class='kijelzo_color'>${game_data.limits.boss_limit}</span> to face the Boss!`); 
                                             
            });           
        },
        close:function(){
            game_data.game_states.dialog_flag=false;            
            $("#progress_keret").html("");
            
           }    
    });   
       $(document).keydown(
                function (e) {
                    if (e.keyCode == 32 && game_data.game_states.dialog_flag && !game_data.game_states.exit_flag) {    //space - start game
                        kezdo_panel_keret.dialog("close");                        
                        play_bg_music("#track2");
                        //   if (game_data.counters.score <= GAME_CONSTANTS.GLOBAL_BOSS_SCORE_LIMIT) {
                          if (!game_data.game_states.boss_flag) {
                            game_data.game_states.traffic_flag = true; 
                              
                            schedule_next_enemy_spawn_attempt(100, current_level_config.direction_pattern); 
                          }                            
                    }
                }
            );
}
// PAUSE GAME
$(document).keydown(function (e) {
    if (e.keyCode == 27 && !game_data.game_states.boss_flag 
        && !game_data.game_states.exit_flag && game_data.game_states.traffic_flag && !game_data.game_states.bounty_flag ) 
        {        
        kezdo_panel();
        flag = false;  
    
        return;        
    }    
});

function stop_base_level_enemies() {
    if (!game_data.game_states.traffic_flag) {
        clearTimeout(spacekraft_spawn_timeout);           
        update_right_display();

        base_level_entities.enemy_ships.filter( enemy_data => 
            enemy_data.is_active).forEach(
                enemy_data => {
                    return_enemy_to_pool(enemy_data);
                }); 

       base_level_entities.enemy_shots.filter( enemy_shot_data => 
        enemy_shot_data.is_active).forEach(
            enemy_shot_data => {
                return_enemy_shot_to_pool(enemy_shot_data)
            });                   
    }  
}

// JOBB FELSŐ KIJELZŐ UPDATE
function update_right_display()
{
    $(".eredmeny_keret").html("SCORE: &nbsp<span class='kijelzo_color'>" + game_data.counters.score + "</span> &nbsp&nbsp KILLED: &nbsp " + game_data.counters.killed + "&nbsp /&nbsp " + game_data.counters.enemies);
}

// KÖZÉPSÖ KIJELZÖ UPDATE
function update_center_display(txt)
{   
    setTimeout(function()    
    {
    var center_text = $("#progress_keret").html(txt);    
    center_text.animate({
        fontSize: "32px",
        letterSpacing: "2px"
    }, 1400, function(){       
    });  
   }, 500);

var flares_gif = $("<img src='kepek/flares1.gif' class='flares_gif_1'>");
    flares_gif.appendTo($("body"));
    flares_gif.css({ "left": parseInt($("#progress_keret").position().left),
                     "top": 12, 
                     'opacity':0.7
      });
    flares_gif.animate({       
       "width":420, 
       "left": parseInt($("#progress_keret").position().left)-17
     
    },1250, function()
    {                
     $(this).remove(); 
     
     $("#progress_keret").empty();
});      
}

// PROGRESS BAR
var progress_bar;

function progress_bar_setup() {
    setTimeout(function () {
        progress_bar = $("#progress_keret").progressbar({
            max: 1000,
            min: 0,
            value: 1000
        });
    }, 1300);
}

function update_progressbar(boss_health) {
    if( $(boss_level_entities.boss.element).length > 0 && boss_health > 0){
        $(progress_bar).progressbar("value", boss_health);
    }

    if (boss_health <= 1) {
       
        //$(progress_bar).progressbar("destroy");
        $(progress_bar).remove();

        var victory_text = $("#progress_keret").html("VICTORY!");
        victory_text.addClass("victory_text");
        victory_text.animate({
            fontSize: "34px",
            letterSpacing: "2px"
        }, 1200, function(){        

            check_for_life_bonus();
        });
    }

    else if (boss_health < 150) {
        $(".ui-progressbar-value").css({
            background: "rgb(255, 24, 24)"
        });
    }

    else if (boss_health < 600) {
        $(".ui-progressbar-value").css({
            background: "rgb(255, 175, 26)"
        });
    }
    else
        $(".ui-progressbar-value").css({
            background: "rgb(37, 255, 48)"
        });
}

function  check_for_life_bonus(){
    if(base_level_entities.bazis.lives > 1){
        setTimeout( function()
        {        
        $("#progress_keret").html("");
        var lifebonus=( base_level_entities.bazis.lives -1 ) *5000;

        var left_display=$("<div class=life_kijelzo>").appendTo($("#progress_keret"));
        var right_display=$("<div class=bonus_kijelzo>").appendTo($("#progress_keret"));
        
        left_display.html("Life bonus :");
        var bonus_counter=100;
    
        // Timeout function
        const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        (async () => {  
        while(bonus_counter <= lifebonus)
            {   
            right_display.html(bonus_counter);
            bonus_counter += 100;
            
            await timeout(35);
        }
        })();          
        game_data.counters.score += lifebonus;
        update_right_display(); 
    },3500);       
    }
   
}
// SCORE PANEL DIALOG                                           Ez duplán tud megjelenni !!!
function show_scores_table(){
    var score_panel_keret = $("<div class='kezdo_panel vegso_panel'>");
    score_panel_keret.dialog({
        title: "High Scores:",
        resizable: false,
        draggable: false,
        modal: false,
        width: 600,
        height: 530,
        closeOnEscape: false,
        open: function () {    
       
            load_template(score_panel_keret);
            game_data.game_states.dialog_flag = true;     
            game_data.game_states.exit_flag = true;   
            game_data.game_states.traffic_flag = false;  
        }
    });
}

function load_template(score_panel_keret){

    $.get("tpl/high_scores.tpl", function (visszatemp) {
        var tempobj = $().add(visszatemp);
        tempobj.appendTo(score_panel_keret);

    $.ajax({
        type: "post",
        url: "modulok/read_high_scores.php",
        data: {},
        dataType: "json",
        success: function (valasz) {
            var pos = 1;
            var templines = [];

           $.each(valasz, function(idx, item){
               template_line=tempobj.find(".score_records").clone(true,true);                       

               template_line.data("score", item.score);             

               template_line.find("#position").html(pos);
               template_line.find("#name").html(item.name);
               template_line.find("#score").html(item.score);
               template_line.find("#killed").html(item.killed);
               
               template_line.appendTo($(".vegso_panel"));
             
               templines[pos]=template_line;
               pos++;               
             
            });
            tempobj.find(".score_records").remove();   

            var also_instrukcio_sav = tempobj.find(".instrukciok_panel_also");

            if( game_data.counters.score >= templines[10].data("score")){

            for(var i=1;i <= templines.length; i++){
              
                if( game_data.counters.score >= templines[i].data("score")){                       
                    
                    var uj_eredmeny= $('<div class="score_records uj_record"><div id="position" class="scores_mezo">'+i+
                                                                  '</div><div id="name" class="scores_mezo"><input type="text" id="uj_nev" placeholder="_ _ _ _ _ _ _ _ _ _"/></div>'+
                                                                  '<div id="score" class="scores_mezo">'+game_data.counters.score+
                                                                  '</div><div id="killed" class="scores_mezo">'+game_data.counters.score+'</div></div>');
                        uj_eredmeny.insertBefore(templines[i]);                               
                        $( "#uj_nev" ).focus(); 
                                           
                        templines[10].remove();                
                                        
                     break;                                                        
                    }                                  
                    }  
                    var data_to_post = {};
                    var new_templines = $(".score_records");

                for(var i=0; i<new_templines.length; i++){
                    $(new_templines[i]).find("#position").html(i+1);                    

                    data_to_post[i] = {
                        "class": $(new_templines[i]).attr("class"),
                        "name" : $(new_templines[i]).find("#name").html(),
                        "score" : $(new_templines[i]).find("#score").html(),
                        "killed" : $(new_templines[i]).find("#killed").html()
                    }                          
                }    
                also_instrukcio_sav.insertAfter(new_templines[9]);
                also_instrukcio_sav.html("Type your name and press enter!");
                
                $(document).keydown(function(e){                    
                     if(e.keyCode == 13)
                        {                           
                        if(($("#uj_nev").val()).trim() != "")
                            {                          
                           $("#uj_nev").prop('disabled', true);
                           $("#uj_nev").css({
                            background: "rgba(0,0,0,0)",
                            color: "aliceblue"
                           });
                           $.each(data_to_post, function(idx, item){
                                if(item.class == "score_records uj_record"){
                                    item.name = $("#uj_nev").val().trim();
                                }
                           }); 

                           recordok_ment(data_to_post);
                           
                           also_instrukcio_sav.html("Press space to proceed!");

                           close_scores_dialog(score_panel_keret);
                        }
                     }   
                });
                               
        var ertekeles = tempobj.find(".instrukciok_panel").html("Congratulations!  You have a TOP 10 score!");            
        ertekeles.insertBefore(tempobj.find(".headline"));   
        }
        else
        {
         
        var ertekeles = tempobj.find(".instrukciok_panel").html("Congratulations!  Your score: "+game_data.counters.score);            
        ertekeles.insertBefore(tempobj.find(".headline"));
        also_instrukcio_sav.insertAfter(templines[10]);
        also_instrukcio_sav.html("Press space to proceed!");
        close_scores_dialog(score_panel_keret);        
        }
    }
    });
    }); 
}


function recordok_ment(data_to_post){
    $.ajax({
        type: "post",
        url: "modulok/save_high_scores.php",
        data: data_to_post,
        dataType: "JSON",
        success: function (response) {
            console.log(response);
         }
    });    
}

function close_scores_dialog(score_panel_keret)
    {
    $(document).keydown(
        function (e) {
            if (e.keyCode == 32 ) {               
                score_panel_keret.dialog("close");
                window.location.reload(true);             
            }
        }
    );
}