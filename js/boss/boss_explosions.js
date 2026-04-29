/**
 * Triggers a main, central explosion effect when Boss dies.
 * This function typically orchestrates a single, large explosion
 * at or near the center of the boss's final position, using configuration
 * defined in `MAIN_EXPLOSION_CONFIG`.
 *
 * @param {DOMRect} boss_rect - The DOMRect object representing the current position and dimensions of the boss.
 *                              This is used to calculate the absolute coordinates for the explosion.
 * @returns {void}
 */
function boss_dies_main_explosion(boss_rect) {
    if( !boss_rect){
        return;
    }

    const {IMAGE_SRC, IMAGE_CLASS,
           ANIM_DURATION, HIDE_DURATION ,ANIM_EASING,                  /* Animation timings*/   
           HORIZONTAL_CORRECTION, VERTICAL_CORRECTION, HEIGHT,       /* Initial positioning corrections*/
           FINAL_HEIGHT, FINAL_RADIUS,                              /* Final dimensions*/
           FINAL_HORIZONTAL_CORRECTION, FINAL_VERTICAL_CORRECTION  /* Final positioning corrections*/      
    } = MAIN_EXPLOSION_CONFIG
    const boss_x = boss_rect.left;
    const boss_y = boss_rect.top;
    
    unified_image_loader(IMAGE_SRC, (boss_main_explosion_img)=> {
        boss_main_explosion_img.addClass(IMAGE_CLASS)
        .appendTo($("body"))
        .show()
        .css({
            "left" : boss_x + HORIZONTAL_CORRECTION,
            "top" : boss_y - VERTICAL_CORRECTION,
            "height" : HEIGHT,
            });

        boss_main_explosion_img.animate({
            "height": FINAL_HEIGHT,
            "border-radius": FINAL_RADIUS,
            "top": boss_y - FINAL_VERTICAL_CORRECTION,
            "left": boss_x - FINAL_HORIZONTAL_CORRECTION
        }, ANIM_DURATION, ANIM_EASING) 
            .animate({"opacity": 0}, 
            function () {
                $(this).hide(HIDE_DURATION, function(){
                    $(this).remove();
                });               
        });
    });
}

/**
 * Triggers a visual explosion effect at the sides of the boss,
 * typically used as part of a boss death sequence.
 * These explosions are positioned relative to the boss's bounding rectangle
 * and animated according to predefined configuration.
 *
 * @param {DOMRect} boss_rect - The DOMRect object representing the current position and dimensions of the boss.
 *                              This is used to calculate the absolute coordinates of the explosions.
 * @returns {void}
 */
function boss_dies_side_explosion(boss_rect) {
    if( !boss_rect){
        return;
    }

    const {IMAGE_SRC, IMAGE_CLASS, HORIZONTAL_START_PERCENT, HORIZONTAL_END_PERCENT, WIDTH, FINAL_WIDTH,
        VERTICAL_CORRECTION, ANIM_DURATION } = SIDE_EXPLOSION_CONFIG;
    const boss_x = boss_rect.left;
    const boss_y = boss_rect.top + boss_rect.height / 2;
    const boss_width = boss_rect.width;

    const explosion_positions_x_percent = [
        HORIZONTAL_START_PERCENT, // Left side
        HORIZONTAL_END_PERCENT    // Right side
    ]; 
   
    explosion_positions_x_percent.forEach(x_offset_percent => 
    {
        const explosion_left = boss_x + (boss_width * x_offset_percent);        

        unified_image_loader(IMAGE_SRC, (side_explosion_img)=>{
            side_explosion_img.addClass(IMAGE_CLASS)
            .appendTo($("body"))            
            .css({
                "left": explosion_left,
                "top": boss_y,
                "width": WIDTH,
                "position" : "absolute"
            })
            .show();                                 
            side_explosion_img.animate({
                "width": FINAL_WIDTH,
                "top" : boss_y - VERTICAL_CORRECTION               
            }, ANIM_DURATION, function () {
                $(this).hide(0, function() {  
                    $(this).remove();
                });
            });
        });     
    });   
}