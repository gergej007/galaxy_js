/**
 * Animates a visual EMP effect on the Boss when the Bazis
 * approaches it closely. This function triggers corresponding visual and audio effects on the Boss
 * and initiates a downward animation for the Bazis, simulating an EMP strike impact.
 *
 * @param {object} boss_data - The data object representing the Boss entity. 
 * @param {object} bazis_data - The data object representing the Bazis entity. 
 * @returns {void} This function does not return a value.
 */
function boss_emp_shake(boss_data, bazis_data) {  

    if(! is_entity_valid(boss_data) || !is_entity_valid(bazis_data)) {
            console.warn("EMP attack cancelled due to incorrect boss_data or bazis_data passed");
            return;
        }

    const bazis_element = bazis_data.element;    

    const boss_element = boss_data.element;
    
    const {AUDIO_KEY, IMG_SRC, IMG_CLASS, INITIAL_WIDTH, INITIAL_OFFSET_X, ANIM_WIDTH, ANIM_OFFSET_Y, 
           ANIM_OFFSET_X, ANIM_DURATION, HIDE_DURATION, KICK_BACK_AMMOUNT, KICK_BACK_DURATION } 
        = BOSS_SHOTS_CONFIG.EMP_SHAKE

    audio_play(AUDIO_KEY);

    unified_image_loader(IMG_SRC, (emp_strike_img)=> {
        emp_strike_img.addClass(IMG_CLASS)
        .appendTo(boss_element)        
        .css({ 
            "width": INITIAL_WIDTH,
            "left" : INITIAL_OFFSET_X,
            "top" : 0
             })      
        .show();     

        emp_strike_img.animate({
            "width" : ANIM_WIDTH , 
            "left" : - ANIM_OFFSET_X,
            "top" : - ANIM_OFFSET_Y
            },ANIM_DURATION, function(){
                $(this).hide(HIDE_DURATION);
                $(this).remove();
            }); 
        
        if(!is_entity_valid(bazis_data)) return; 
        const bazis_top = bazis_data.rect.top;

        bazis_element.stop(true, false).animate({                                 // Bazis kicked back
            "top" : bazis_top + KICK_BACK_AMMOUNT
        },KICK_BACK_DURATION);   
    });
}