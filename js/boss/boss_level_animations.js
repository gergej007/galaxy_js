/**
 * Orchestrates the removal of the boss entity and its associated components from the game.
 * 
 * This function handles the players defeat phase of a boss encounter. It stops boss-specific 
 * audio, destroys the health HUD, deactivates the boss game state, recycles all remaining 
 * boss projectiles, and executes an animation to move the boss off-screen before clearing references.
 * 
 * @function boss_exit
 * @returns {void}
 * 
 * @description
 * 1. Validates the existence of the boss entity.
 * 2. Manages audio transitions by stopping the boss theme and playing the death/defeat track.
 * 3. Destroys the jQuery UI progress bar widget used for boss health.
 * 4. Disables the `boss_flag` to stop boss-related game loop logic.
 * 5. Iterates through all active boss projectiles and returns them to the object pool.
 * 6. Animates the boss element vertically to an "off-screen" position.
 * 7. On animation completion: hides the element and nullifies state references to the boss.
 * 
 * @see {@link return_boss_shot_to_pool} For the projectile recycling logic.
 * @see {@link is_entity_valid} For the initial validation guard.
 */
function boss_exit() {       

    const boss_data = boss_level_entities.boss;
    const {DISTANCE_Y, ANIM_DURATION, FINAL_DELAY} = ANIMATION_CONFIG.BOSS_EXIT;

    if (!is_entity_valid(boss_data)) {
        return;
    }
    audio_stop(AUDIO_CONFIG.TRACKS.BOSS);
    audio_play(AUDIO_CONFIG.TRACKS.DEATH);

    const boss_element = $(boss_data.element);

    const $p_bar = $(UI_CONFIG.HUD.CENTER.PROGRESS_BAR.SELECTOR);
    if ($p_bar.length && $p_bar.data("ui-progressbar")) {
        $p_bar.progressbar("destroy");
    }

    game_data.game_states.boss_flag = false;

    boss_level_entities.boss_shots.filter(boss_shot_data => boss_shot_data.is_active)
        .forEach(boss_shot_data => {
            return_boss_shot_to_pool(boss_shot_data);
        });

        setTimeout(() => {
            boss_element.animate({
            "top": DISTANCE_Y
        }, ANIM_DURATION, function () {
          $(this).hide();
          boss_data.element = null;
          boss_data.rect = null;

          handle_victory_display(BAZIS_CONFIG.DAMAGE.GAME_OVER_TEXT);
        });
    }, FINAL_DELAY);    
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

/**
 * Triggers an electrical explosion effect at a specific coordinate.
 * 
 * This function dynamically loads an electrical burst sprite, positions it at 
 * the point of impact, and executes a scaling animation before removing the 
 * element from the DOM. It is primarily used for projectile clashing effects.
 * 
 * @function shots_explosion_lightning
 * @param {number} pos_x - The horizontal (left) pixel coordinate for the effect.
 * @param {number} pos_y - The vertical (top) pixel coordinate for the effect.
 * @returns {void}
 * 
 * @description
 * 1. Retrieves animation parameters (size and duration) from `ANIMATION_CONFIG.SHOTS_EXPLOSION`.
 * 2. Invokes `unified_image_loader` to asynchronously fetch 'electric2.png'.
 * 3. On successful load:
 *    - Applies the 'bs_loves_explosion' CSS class for base styling.
 *    - Positions the element at the (x, y) origin.
 *    - Animates both width and height to `ANIM_SIZE_PX` to create an expansion effect.
 *    - Completely removes the element from the DOM upon animation completion to prevent memory leaks.
 * 
 * @see {@link unified_image_loader} For the asset loading pattern.
 * @see {@link boss_shot_bazis_shot_collision_detection} A common trigger for this effect.
 */
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
        IMAGE_SRC, CLASS, ANIM_DURATION, HIDE_DURATION, FINAL_WIDTH, AUDIO_KEY, ANIM_EASING,
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
                target_left_x -= FINAL_WIDTH / 2;
            }

            firework_container.css({
                "top": target_top_y,
                "left": target_left_x,
            });
            firework_container.show();
            firework_img.show();
            firework_container.animate({
                "width": FINAL_WIDTH
            }, ANIM_DURATION, ANIM_EASING, function () {
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

/**
 * Triggers a localized lightning visual effect over the boss entity upon its arrival.
 * 
 * This function loads a specific lightning sprite (usually a GIF) and overlays it 
 * directly onto the boss container. The effect is timed to coincide with the boss's 
 * introductory animation, providing visual flair before being removed from the DOM.
 * 
 * @function initial_lightning_effect
 * @returns {void}
 * 
 * @description
 * 1. Retrieves configuration (duration, source, styling) from `ANIMATION_CONFIG.INITIAL_LIGHTNING`.
 * 2. Validates that the boss entity and its DOM element are ready via `is_entity_valid`.
 * 3. Invokes `unified_image_loader` to fetch the lightning asset.
 * 4. On successful load:
 *    - Appends the lightning sprite directly to the `boss_element`.
 *    - Sets the initial width and anchors the effect to the top-left (0,0) of the boss container.
 *    - Uses jQuery `.hide(DURATION)` to perform a timed fade-out.
 * 5. Uses a `setTimeout` to ensure the element is physically removed from the DOM after the animation.
 * 
 * @see {@link boss_enemy_setup} The function that typically triggers this intro effect.
 * @see {@link unified_image_loader} For the asynchronous asset fetching logic.
 */
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
 * Calculates adaptive animation durations for the player ship's exit sequence based on screen position.
 * 
 * This utility function evaluates how far the player is from the screen edges and returns 
 * longer or shorter durations. This ensures that the exit animation feels consistent 
 * regardless of whether the ship has a long or short distance to travel.
 * 
 * @function get_bazis_exit_durations
 * @param {DOMRect} bazis_rect - The current bounding box of the player ship.
 * @param {Object} config - Configuration object containing timing and threshold values.
 * @param {number} config.HORIZONTAL_DURATION_THRESHOLD_PERCENT - Percentage of screen width used as a boundary.
 * @param {number} config.HORIZONTAL_DURATION_LONG - Duration in ms for long horizontal travel.
 * @param {number} config.HORIZONTAL_DURATION_SHORT - Duration in ms for short horizontal travel.
 * @param {number} config.VERTICAL_DURATION_THRESHOLD_PERCENT - Percentage of screen height used as a boundary.
 * @param {number} config.VERTICAL_DURATION_LONG - Duration in ms for long vertical travel.
 * @param {number} config.VERTICAL_DURATION_SHORT - Duration in ms for short vertical travel.
 * @returns {Object} An object containing the calculated { horizontal_duration, vertical_duration }.
 * 
 * @description
 * 1. Measures current window dimensions via jQuery.
 * 2. Compares the ship's `left` position against horizontal thresholds:
 *    - Uses 'LONG' duration if near the left or right screen edges.
 *    - Uses 'SHORT' duration if centrally located.
 * 3. Compares the ship's `top` position against the vertical threshold:
 *    - Uses 'LONG' duration if deep in the lower half of the screen.
 *    - Uses 'SHORT' duration if already near the top.
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