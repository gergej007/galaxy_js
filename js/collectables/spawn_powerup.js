
function spawn_actual_powerup( bounty_data) {     
    if( !bounty_data){
        console.warn("spawn powerup failed due to missing bounty_data!");
        return;
    }
        
    const { powerup_img_src, powerup_img_id } = select_actual_powerup();
    const spawn_data = extract_powerup_spawn_data(bounty_data);    
    const bounty_direction = spawn_data.direction;
    let poz_x = spawn_data.left + 15;
    let poz_y = spawn_data.top + 15;
                                                       // Powerup stays in screen when appears close to edges
     if( bounty_direction == "left" && poz_x < 15 )            
        { poz_x = 15; }                                  
    else if( bounty_direction == "right" && poz_x > $(window).width() - 30)
        { poz_x = $(window).width() - 60; }   

    unified_image_loader(powerup_img_src, (powerup_img_element) => {

        if (!powerup_img_element || powerup_img_element.length === 0) { 
            console.warn("image was not find or corrupted!");
            return; }

        powerup_img_element.addClass("bnty_img").attr("id", powerup_img_id); 
        base_level_entities.powerup.element = powerup_img_element;
        powerup_img_element.appendTo($("body")); 

        if (!spawn_data || !spawn_data.element) {
            console.warn("image position is 0 or undefined!");
            $(powerup_img_element).remove();
            return;
        }
        powerup_img_element.css({
        "width" : 50,
        "height" : 50,
        "position" : "absolute",
        "left" : poz_x, 
        "top" : poz_y
    });   
    powerup_img_element.show();                   
    animate_powerup(powerup_img_element);  
    });
}

let powerup_animation_duration;
function animate_powerup(powerup_element){ 

    function pulse_animation_loop(){
        $(powerup_element).animate({
            height : 68,
            width: 68
        }, 1500, "linear")
        .animate({
            height : 60,
            width: 60
        },1500 , "linear", function() 
        { 
            if($(this).length > 0){
                pulse_animation_loop();
            }
            else return;
            
            if (powerup_animation_duration) {
                clearTimeout(powerup_animation_duration);
            }

            powerup_animation_duration = setTimeout(() => { 
                
            if ($(this).length === 0) {
                return; // Element was removed already
            }
                $(this).animate({ opacity : .1,
                                  height : 68,
                                  width: 68
                }, 1500, "linear", function(){
                      $(this).remove();
                      
                      base_level_entities.powerup.element = null;
                      base_level_entities.powerup.rect = null;

                      if (game_data.game_states.bounty_flag  && bounty_element.length === 0 )  
                         { 
                         game_data.game_states.bounty_flag = false;
                         }
                });
            }, base_level_entities.powerup.duration );      
         });
    }
    pulse_animation_loop();
}


function extract_powerup_spawn_data( bounty_data){
    if( !bounty_data || !bounty_data.rect || !bounty_data.element){
        console.warn("extract_bounty_animation_data: Invalid bounty data provided.");
        return { 
            left: 0, top: 0, direction: null, element: null
        };
    }
    return {
        left : bounty_data.rect.left,
        top : bounty_data.rect.top,
        direction : bounty_data.direction,
        element : bounty_data.element
    };
}