const BOSS_SETUP_CONFIG= {
    LEVEL_DELAY_MS: 1200,
    OUT_OF_SCREEN_POS_X: 100,
    OUT_OF_SCREEN_POS_Y: -90,
    BOSS_WRAPPER_CLASS: 'boss_container',
    BOSS_IMG_SRC: 'boss/boss.png',
    BOSS_IMG_CLASS: 'boss_main_img',
    AUDIO_KEY: '#boss_hang4',
    INITIAL_ANIM_DURATION_MS: 2500, 
    INITIAL_ANIM_OFFSET_X: -40,
    INITIAL_ANIM_POS_Y: 40,
    BG_AUDIO_KEY: "#track1"
};

function initalize_boss_level() {     

    play_bg_music(BOSS_SETUP_CONFIG.BG_AUDIO_KEY);    
    
    progress_bar_setup();

    boss_enemy_setup();

    animate_asteroid();

    weapons.flags.dual_lazer = false;
    weapons.dual_fire_shot = true;

    setTimeout(function () {
        const active_enemies = base_level_entities.enemy_ships.filter(ship => ship.is_active);
        if (active_enemies.length > 0) {
            explode_all_spacekrafts();
        }
       
    }, BOSS_SETUP_CONFIG.LEVEL_DELAY_MS);
}

function boss_enemy_setup()
{    
    const { OUT_OF_SCREEN_POS_X, OUT_OF_SCREEN_POS_Y, BOSS_WRAPPER_CLASS, BOSS_IMG_SRC, BOSS_IMG_CLASS,
            AUDIO_KEY, INITIAL_ANIM_DURATION_MS, INITIAL_ANIM_OFFSET_X, INITIAL_ANIM_POS_Y
          } = BOSS_SETUP_CONFIG;

    const boss_frame = $(`<div class=${BOSS_WRAPPER_CLASS}></div>`);
    boss_frame.appendTo($("body"))    
    .css({
        "left": $(window).width() - boss_frame.width() - OUT_OF_SCREEN_POS_X,    
        "top": OUT_OF_SCREEN_POS_Y       
        })
    .hide();

    boss_level_entities.boss.element = boss_frame;
   
    unified_image_loader(BOSS_IMG_SRC, (boss_image_element)=> {
        if (!boss_image_element || boss_image_element.length === 0) {
            console.error("Error: Boss image failed to load or is corrupted!");
            boss_frame.remove(); 
            base_level_entities.boss = null; 
            return;
        }
        
        boss_level_entities.boss.img_element = boss_image_element;
        boss_image_element.addClass(BOSS_IMG_CLASS)
        .appendTo(boss_frame)
        .show();
        boss_frame.show();

        initial_lightning_effect();
        audio_play(AUDIO_KEY);
       
        boss_frame.animate({
            "left": $(window).width() - boss_frame.width() - INITIAL_ANIM_OFFSET_X,
            "top": INITIAL_ANIM_POS_Y
        }, INITIAL_ANIM_DURATION_MS,
            function () 
            {  
            if(base_level_entities.bazis.hp < 1 && base_level_entities.bazis.lives < 1){  
                boss_exit();
            }     
                boss_phase_scheduler(boss_level_entities.boss);                                  
        });
    });   
}