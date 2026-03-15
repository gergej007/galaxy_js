function initalize_boss_level() {     

    main_title_track();     
    
    progress_bar_setup();

    boss_enemy_setup();

    animate_asteroid();

    weapons.dual_fire_shot = true;

    const explosion_delay = 1200;
    setTimeout(function () {
        if( base_level_entities.enemy_ships.element && $(base_level_entities.enemy_ships.element).length > 0){

            explode_all_spacekrafts();
        }
    }, explosion_delay);
}



function boss_enemy_setup()
{
    const initial_distance_x = 100;
    const initial_distance_y = -90;

    const boss_frame = $("<div class='boss_container'></div>");
    boss_frame.appendTo($("body"))    
    .css({
        "left": $(window).width() - boss_frame.width() - initial_distance_x,    
        "top": initial_distance_y        
        })
    .hide();

    boss_level_entities.boss.element = boss_frame;
   
    unified_image_loader('boss/boss.png', (boss_image_element)=> {
        if (!boss_image_element || boss_image_element.length === 0) {
            console.error("Error: Boss image failed to load or is corrupted!");
            boss_frame.remove(); 
            base_level_entities.boss = null; 
            return;
        }
        
        boss_level_entities.boss.img_element = boss_image_element;
        boss_image_element.addClass('boss_main_img')
        .appendTo(boss_frame)
        .show();
        boss_frame.show();

        initial_lightning_effect();
        audio_play("#boss_hang4");

        const anim_duration = 2500;
        const final_distance_x = -40;
        const final_distance_y = 40;
        boss_frame.animate({
            "left": $(window).width() - boss_frame.width() - final_distance_x,
            "top": final_distance_y
        }, anim_duration, "swing",
            function () 
            {  
            if(base_level_entities.bazis.hp < 1 && base_level_entities.bazis.lives < 1){  
                boss_exit();
            }     
                boss_phase_scheduler(boss_level_entities.boss);                                  
        });
    });   
}