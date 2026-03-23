function bounty_container_controller()   
{     
    if(base_level_entities.bounty.element !== null){
        return;
    }

    game_data.game_states.bounty_flag = true;  

    
    const bounty_data = base_level_entities.bounty;
    bounty_data.hp = bounty_data.max_hp;
    const new_element = get_bounty_container();
    bounty_data.element = new_element; 
    
    const direction_pattern = current_level_config.direction_pattern || 1;      

    const bounty_direction = (direction_pattern === 1) ? "right" : "left";
    if( game_data.game_states.traffic_flag ){
        animate_bounty_container( bounty_direction, bounty_data);
    }
    else console.log("Bounty container is failed due to game state");
}


function animate_bounty_container(direction, bounty_data)
{
    const delay_appearance = Math.round( Math.random() * 2500 ) + 1500;    
    setTimeout(() => 
    {    
        const bounty_element = bounty_data.element; 
        if (!bounty_element || bounty_element.length === 0) {
            console.log("Bounty animation aborted");
            return;
        }        
        bounty_element.show();
        
        const bnty_container_duration = ($(window).width() * 4.7 );       
        const hp_indicator = get_hp_indicator();
        hp_indicator.appendTo(bounty_element);
        
        const css_ypoz = bounty_container_y_poz();
        const { css_xpoz, anim_xpoz } = get_bounty_movement_data( bounty_data, direction );           
        
        bounty_element.css({
            "display" : "block",
            "left" : css_xpoz,
            "top" : css_ypoz
        });

        hp_indicator.css({
            "position": "absolute",
            "left": 16,  
            "top": -16   
        });

        bounty_element.animate({
            "left" : anim_xpoz        
        }, bnty_container_duration, "linear",
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

function bounty_container_damage(damage)
{  
    base_level_entities.bounty.hp -= damage;                

    audio_play("#electric4");        
    show_bnty_damage();
    hp_indicator_handler();     
}

/**
 * Triggers a brief electrical damage overlay on the bounty container.
 * Appends the effect directly to the container for automatic tracking.
 */
function show_bnty_damage()
{           
    const bnty_data = base_level_entities.bounty;
    if (!bnty_data.element) return;
    const bnty_element = $(bnty_data.element);

    bnty_element.find("img")
    // .css({ filter: "brightness(1.5) sepia(1) hue-rotate(180deg) saturate(5) opacity(0.8)" });
    .css({filter: "blur(1px) brightness(110%) contrast(84%) hue-rotate(275deg) opacity(100%) saturate(187%)" });
    setTimeout(() => {
        if (bnty_element.length > 0) {
            bnty_element.find("img").css({ filter: "none" });
        }
    }, 150);

    unified_image_loader("electric2.png", (damage_img)=>{
        if (!bnty_data.element) {
            damage_img.remove();
            return;
        }

        damage_img.appendTo(bnty_element).show()
        .css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "width": '95%',
            "height": '95%',
            "opacity": 1
        });                       
        damage_img.animate({
            opacity: 0
        }, 250, function() {
            $(this).remove(); 
        });
    });   
}
   

function get_bounty_container() {
   
    const bounty_frame = $("<div class='bnty_container'></div>");
    bounty_frame.hide();

    unified_image_loader("bounties/container.png", (bounty_img)=>{
        bounty_img.addClass("bnty_main_img");
        bounty_img.appendTo(bounty_frame).show();       
    });
    
    bounty_frame.appendTo($("body"));  

    return bounty_frame;
}

function bounty_container_y_poz(){
    const rnd_ypoz = Math.round(Math.random() * ($(window).height()*0.05) + $(window).height() * 0.73);
    return rnd_ypoz;
}