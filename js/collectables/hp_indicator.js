function hp_indicator_handler() {
    const hp_indicator_container = $(".bnty_hp_indicator");
    const current_hp = base_level_entities.bounty.hp;
    const max_hp =  base_level_entities.bounty.max_hp; 
    
    const hp_fill = hp_indicator_container.find(".bnty_hp_fill");     
    
    const hp_percentage = (current_hp / max_hp) * 100;
    
    hp_fill.css({
        "width": hp_percentage + '%'
    });

    hp_fill.removeClass('low-health critical-health'); 
    if (hp_percentage <= 25) {
        hp_fill.addClass('critical-health'); 
    } else if (hp_percentage <= 50) {
        hp_fill.addClass('low-health'); 
    } else {
        // Default green 
    }

    if (current_hp <= 0) { 
        hp_fill.css({ opacity: 0 }); 

        const bounty_data = base_level_entities.bounty;
        if (!bounty_data || bounty_data.rect === null) {
            return; 
        }         

        spawn_actual_powerup(bounty_data );       
        explode_spacekraft( bounty_data );
    }
}

function get_hp_indicator(){                 
    const local_hp_indicator = $(              
        "<div class = 'bnty_hp_indicator'>" +      
        "<div class='bnty_hp_fill'></div>"+
        "</div>"
    );   
    return local_hp_indicator;
}