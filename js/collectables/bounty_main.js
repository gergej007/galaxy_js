function bounty_container_controller()   
{     
    if( base_level_entities.bounty?.element?.length > null){   
        return;
    }
    const { RIGHT_DIRECTION, LEFT_DIRECTION} = BOUNTY_CONTAINER_CONFIG;

    game_data.game_states.bounty_flag = true;  

    
    const bounty_data = base_level_entities.bounty;
    bounty_data.hp = bounty_data.max_hp;
    const new_element = get_bounty_container();
    bounty_data.element = new_element; 
    
    const direction_pattern = current_level_config.direction_pattern || 1;      

    const bounty_direction = (direction_pattern === 1) ? RIGHT_DIRECTION : LEFT_DIRECTION;
    bounty_data.direction = bounty_direction;    
    if( game_data.game_states.traffic_flag ){
        animate_bounty_container( bounty_data );   
    }
    else console.log("Bounty container is failed due to game state");
}


function animate_bounty_container(bounty_data)
{
    const { RND_DELAY_MULTIPLIER, RND_DELAY_SEED, DURATION_MULTIPLIER, HP_INDICATOR_POSITION_PX,
            ANIMATION_EASING } = BOUNTY_CONTAINER_CONFIG;

    const delay_appearance = Math.round( Math.random() * RND_DELAY_MULTIPLIER ) + RND_DELAY_SEED;    
    setTimeout(() => 
    {    
        const bounty_element = bounty_data.element; 
        // if (!bounty_element || bounty_element.length === 0) {
        if ( !bounty_element?.length) {
            console.log("Bounty animation aborted");
            return;
        }        
        bounty_element.show();
        
        const bnty_container_duration = ($(window).width() * DURATION_MULTIPLIER );       
        const hp_indicator = get_hp_indicator();
        hp_indicator.appendTo(bounty_element);
        // Get Bounty css and animation positions
        const initial_y_poz = calculate_container_y();
        const { initial_x_poz, anim_x_poz } = calculate_container_x( bounty_data);           

        bounty_element.css({
            "display" : "block",
            "left" : initial_x_poz,
            "top" : initial_y_poz
        });

        hp_indicator.css({
            "position": "absolute",
            "left": HP_INDICATOR_POSITION_PX,  
            "top": -HP_INDICATOR_POSITION_PX   
        });

        bounty_element.animate({
            "left" : anim_x_poz        
        }, bnty_container_duration, ANIMATION_EASING,
        function()
        {                                                       //  container goes off-screen 
            $(this).remove(); 
            if ( game_data.game_states.bounty_flag && base_level_entities.bounty.hp > 1 
                && !base_level_entities.powerup.element )
            {   
              reset_bounty_data(bounty_data);           
              game_data.game_states.bounty_flag = false;           
            }         
        });     

    }, delay_appearance);   
}



function get_bounty_container() {
    const { CONTAINER_CLASS, IMG_SRC, IMG_CLASS} = BOUNTY_CONTAINER_CONFIG;
   
    const bounty_frame = $(`<div class=${CONTAINER_CLASS}></div>`);
    bounty_frame.hide();

    unified_image_loader( IMG_SRC, (bounty_img)=>{
        bounty_img.addClass(IMG_CLASS);
        bounty_img.appendTo(bounty_frame).show();       
    });
    
    bounty_frame.appendTo($("body"));  

    return bounty_frame;
}

