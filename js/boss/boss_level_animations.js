function boss_exit() {       

    const boss_data = boss_level_entities.boss;
    const {DISTANCE_Y, ANIM_DURTION} = ANIMATION_CONFIG.BOSS_EXIT;

    if (!is_entity_valid(boss_data)) {
        return;
    }
    const boss_element = $(boss_data.element);

    $(progress_bar).progressbar("destroy");
    game_data.game_states.boss_flag = false;

    boss_level_entities.boss_shots.filter(boss_shot_data => boss_shot_data.is_active)
        .forEach(boss_shot_data => {
            return_boss_shot_to_pool(boss_shot_data);
        });

    boss_element.animate({
        "top": DISTANCE_Y
    }, ANIM_DURTION, function () {
        $(this).hide();
        boss_data.element = null;
        boss_data.rect = null;
    });
}


/**
* Triggers a visual reaction animation (e.g., lightning flashes) on the boss
* when hit by a specific attack (like an A-bomb).
* The flashes are timed to create a repeated effect, with the lightning
* positioned relative to the boss element itself.
*/
function boss_a_bomb_reaction() {
    const boss_data = boss_level_entities.boss;
    const initial_boss_element = validate_boss_for_movement(boss_data, "boss_a_bomb_reaktion (initial call)");
    if (initial_boss_element === null) {
        return;
    }

    const { IMG_SRC, IMG_CLASS, ANIM_OPACITY, ANIM_INITIAL_DELAY, ANIM_COUNTER, ANIM_INTERVAL, ANIM_DURATION_1, ANIM_DURATION_2, ANIM_DURATION_HIDE,
        LIGHTNING_INITIAL_WIDTH, LIGHTNING_FINAL_WIDTH, ANIM_X_RELATIVE, ANIM_Y_RELATIVE, A_BOMB_DAMAGE_FOR_BOSS
    } =ANIMATION_CONFIG.A_BOMB_REACTION_CONFIG;

    for (let i = 0; i < ANIM_COUNTER; i++) {
        const timeout_delay = ANIM_INITIAL_DELAY + (i * ANIM_INTERVAL);

        setTimeout(() => {
            const boss_element = validate_boss_for_movement(boss_data, "boss_a_bomb_reaktion (delayed flash)");
            if (boss_element === null) {
                return;
            }
            unified_image_loader(IMG_SRC, (lightning_effect) => {
                lightning_effect.appendTo(boss_element)
                    .addClass(IMG_CLASS)
                    .show()
                    .css({
                        "left": 0,
                        "top": 0,
                        "width": LIGHTNING_INITIAL_WIDTH
                    });

                lightning_effect.animate({
                    "width": LIGHTNING_FINAL_WIDTH,
                    "left": - ANIM_X_RELATIVE,
                    "top": - ANIM_Y_RELATIVE
                }, ANIM_DURATION_1)
                    .animate({
                        "width": LIGHTNING_FINAL_WIDTH,
                        "opacity":ANIM_OPACITY
                    }, ANIM_DURATION_2, function () {
                        $(this).hide(ANIM_DURATION_HIDE, function () {
                            $(this).remove();
                        });
                    });
            });

        }, timeout_delay);
    }
    boss_damage(null, boss_data, A_BOMB_DAMAGE_FOR_BOSS);
}


function shots_explosion_lightning(pos_x, pos_y) {
    
    const { ANIM_SIZE_PX, ANIM_DURATION} = ANIMATION_CONFIG.SHOTS_EXPLOSION;
    unified_image_loader('electric2.png', (shot_explosion_img) => {
        shot_explosion_img.addClass('bs_loves_explosion')
            .appendTo($("body"))
            .show()
            .css({
                "left": pos_x,
                "top": pos_y,
            });

        shot_explosion_img.animate({
            "width": ANIM_SIZE_PX,
            "height": ANIM_SIZE_PX
        }, ANIM_DURATION, function () {
            $(this).remove();
        });
    });
}

/**
 * Triggers a dual fireworks display on screen, signifying a victory
 * after defeating the boss.
 * The fireworks are positioned on the left and right sides of the screen.
 *
 * @returns {void}
 */
function final_fireworks() {
    const {
        IMAGE_SRC, CLASS, ANIM_DURATION, HIDE_DURATION, FINAL_WIDTH, AUDIO_KEY,
        LEFT_FIREWORK_OFFSET_X_PERCENT, RIGHT_FIREWORK_OFFSET_X_PERCENT, Y_OFFSET_PERCENT
    } = ANIMATION_CONFIG.FIREWORKS;

    audio_play(AUDIO_KEY);

    const create_and_animate_firework = (x_offset_percent, is_right_side) => {

        unified_image_loader(IMAGE_SRC, (firework_img) => {
            const firework_container = $(`<div class="${CLASS}"></div>`);;
            firework_img.appendTo(firework_container);
            firework_container.hide();
            firework_container.appendTo($("body"));

            let target_left_x = $(window).width() * x_offset_percent;
            const target_top_y = $(window).height() * Y_OFFSET_PERCENT;

            if (is_right_side) {
                target_left_x -= firework_container.width();
            }

            firework_container.css({
                "top": target_top_y,
                "left": target_left_x,
            });
            firework_container.show();
            firework_img.show();
            firework_container.animate({
                "width": FINAL_WIDTH
            }, ANIM_DURATION, "linear", function () {
                // Fade out and remove the firework after animation
                $(this).hide(HIDE_DURATION, function () {
                    $(this).remove();
                });
            });
        });
    };
    create_and_animate_firework(LEFT_FIREWORK_OFFSET_X_PERCENT, false);
    create_and_animate_firework(RIGHT_FIREWORK_OFFSET_X_PERCENT, true);
}

function initial_lightning_effect() {                      // Boss incoming lightning
    
    const {DURATION, IMG_SRC,IMG_CLASS,IMG_WIDTH} = ANIMATION_CONFIG.INITIAL_LIGHTNING;
    const boss_data = boss_level_entities.boss;
    if (!is_entity_valid(boss_data)) {
        return;
    }
    const boss_element = boss_data.element;

    unified_image_loader(IMG_SRC, (incoming_lightning_img) => {
        incoming_lightning_img.addClass(IMG_CLASS)
            .appendTo(boss_element)
            .show()
            .css({
                "width": IMG_WIDTH,
                "left": 0,
                "top": 0
            });
        incoming_lightning_img.hide(DURATION);
        setTimeout(() => {
            incoming_lightning_img.remove();
        }, DURATION);
    });
}


/**
 * Initiates the Bazis's exit sequence from the screen, in the case of victory.
 * The Bazis first moves horizontally to the center of the screen, and then
 * moves vertically off-screen upwards. The durations of these movements are
 * dynamically determined based on the Bazis's initial position on the screen
 * and configured thresholds.
 *
 * @returns {void}
 */
function bazis_exit() {
    game_data.game_states.exit_flag = true;

    const { EXIT_DELAY, FINAL_DELAY,       
        ANIM_EASING, AUDIO_KEY
    } = ANIMATION_CONFIG.BAZIS_EXIT;
      

    setTimeout(function () {
        const bazis_data = base_level_entities.bazis;
        if (!is_entity_valid(bazis_data)) {
            console.warn("Bazis disappeared before exit animation could start.");
            return;
        }
        const bazis_element = bazis_data.element;
        const bazis_rect = bazis_data.rect;

        const { horizontal_duration, vertical_duration } = get_bazis_exit_durations(
            bazis_data.rect,            
            ANIMATION_CONFIG.BAZIS_EXIT
        );
       
        const destination_x = ($(window).width() / 2) - (bazis_rect.width / 2);
      
        bazis_element.animate({
            "left": destination_x
        }, horizontal_duration, ANIM_EASING)
            .queue(function (next) {
                audio_play(AUDIO_KEY);
                next();
            })
            .animate({
                top: -bazis_rect.height
            }, vertical_duration, ANIM_EASING, function () {

                $(this).remove();
                base_level_entities.bazis.element = null;
                base_level_entities.bazis.rect = null;

            });
    }, EXIT_DELAY, final_fireworks());
    setTimeout(
        () => {
            show_scores_table();
        }, FINAL_DELAY);
}

/**
 * Calculates dynamic durations for the exit animation based on screen position.
 * @returns {Object} An object containing horizontal_duration and vertical_duration.
 */
function get_bazis_exit_durations(bazis_rect, config) {
    let horizontal_duration;
    let vertical_duration;
    const window_width = $(window).width();
    const window_height = $(window).height();

    // Determine horizontal duration
    if (bazis_rect.left < window_width * config.HORIZONTAL_DURATION_THRESHOLD_PERCENT ||
        bazis_rect.left > window_width * (1 - config.HORIZONTAL_DURATION_THRESHOLD_PERCENT)) {
        horizontal_duration = config.HORIZONTAL_DURATION_LONG;
    } else {
        horizontal_duration = config.HORIZONTAL_DURATION_SHORT;
    }

    // Determine vertical duration
    if (bazis_rect.top > window_height * config.VERTICAL_DURATION_THRESHOLD_PERCENT) {
        vertical_duration = config.VERTICAL_DURATION_LONG;
    } else {
        vertical_duration = config.VERTICAL_DURATION_SHORT;
    }

    return { horizontal_duration, vertical_duration };
}