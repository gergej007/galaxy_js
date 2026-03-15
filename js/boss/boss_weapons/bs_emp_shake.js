/**
 * Animates a visual EMP effect on the Boss when the Bazis
 * approaches it closely. This function triggers corresponding visual and audio effects on the Boss
 * and initiates a downward animation for the Bazis, simulating an EMP strike impact.
 *
 * @param {object} boss_data - The data object representing the Boss entity. 
 * @param {object} bazis_data - The data object representing the Bazis entity. 
 * @returns {void} This function does not return a value.
 */
function boss_emp_shake(boss_data, bazis_data)                 
{
    
    if(! boss_data || !boss_data.rect || boss_data.element.length === 0
        || !bazis_data || !bazis_data.rect || bazis_data.element.length === 0) {
            console.warn("EMP attack cancelled due to incorrect boss_data or bazis_data passed");
            return;
        }

    const bazis_element = bazis_data.element;
    const bazis_rect = bazis_data.rect;
    const boss_element = boss_data.element;
    const boss_rect = boss_data.rect; 
    
    const {ANIM_WIDTH, ANIM_TOP, ANIM_LEFT_MULTIPLIER,  ANIM_DURATION, HIDE_DURATION, KICK_BACK_AMMOUNT, KICK_BACK_DURATION } = BOSS_SHOTS_CONFIG.EMP_SHAKE

    audio_play("#electric1");

    unified_image_loader('villam1.gif', (emp_strike_img)=> {
        emp_strike_img.addClass('villam3')
        .appendTo(boss_element)        
        .css({
            "left" : 0,
            "top" : 0
             })      
        .show();     

        emp_strike_img.animate({
            "width" : ANIM_WIDTH , 
            "left" : - boss_rect.width * ANIM_LEFT_MULTIPLIER,
            "top" : ANIM_TOP
            },ANIM_DURATION, function(){
                $(this).hide(HIDE_DURATION);
                $(this).remove();
            }); 
            
        bazis_element.animate({                                 // Bazis kicked back
            "top" : bazis_rect.top + KICK_BACK_AMMOUNT
        },KICK_BACK_DURATION);   
    });
}