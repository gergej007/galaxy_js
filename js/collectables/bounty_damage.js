function bounty_container_damage(damage)
{  
    base_level_entities.bounty.hp -= damage;                

    audio_play(BOUNTY_CONTAINER_CONFIG.AUDIO_KEY);        
    show_bnty_damage();
    hp_indicator_handler();     
}

/**
 * Triggers a brief electrical damage overlay on the bounty container.
 * Appends the effect directly to the container for automatic tracking.
 */
function show_bnty_damage() {    
    const { CSS_FILTER, FILTER_DURATION, DAMAGE_IMG_SRC, DAMAGE_STYLE, DAMAGE_ANIM_DURATION} = BOUNTY_CONTAINER_CONFIG;
    
    const bnty_data = base_level_entities.bounty;
    if (!bnty_data.element) return;
    const bnty_element = $(bnty_data.element);

    bnty_element.find("img")
    .css({filter: CSS_FILTER});
    setTimeout(() => {
        if (bnty_element.length > 0) {
            bnty_element.find("img").css({ filter: "none" });
        }
    }, FILTER_DURATION);

    unified_image_loader( DAMAGE_IMG_SRC, (damage_img)=>{
        if (!bnty_data.element) {
            damage_img.remove();
            return;
        }

        damage_img.appendTo(bnty_element).show()
        .css( DAMAGE_STYLE); 
        
        void damage_img[0].offsetHeight;
        
        damage_img.animate({
            opacity: 0
        }, DAMAGE_ANIM_DURATION, function() {
            $(this).remove(); 
        });
    });   
}
   