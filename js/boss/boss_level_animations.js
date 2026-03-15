function boss_exit() {       // POOLING

    const boss_data = boss_level_entities.boss;
    const distance_x = -200;
    const anim_duration = 1400;

    if (!boss_data.element || boss_data.element.length === 0) {
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
        "top": distance_x
    }, anim_duration, function () {
        $(this).hide();
        boss_data.element = null;
        boss_data.rect = null;
    });
}


const A_BOMB_REACTION_CONFIG = {
    ANIM_INITIAL_DELAY: 800, ANIM_COUNTER: 3, ANIM_INTERVAL: 190,
    ANIM_DURATION_1: 140, ANIM_DURATION_2: 100, ANIM_DURATION_HIDE: 50,
    LIGHTNING_INITIAL_WIDTH: 200, LIGHTNING_FINAL_WIDTH: 380,
    ANIM_X_RELATIVE: 45, ANIM_Y_RELATIVE: 20, A_BOMB_DAMAGE_FOR_BOSS: 25
};

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

    const { ANIM_INITIAL_DELAY, ANIM_COUNTER, ANIM_INTERVAL, ANIM_DURATION_1, ANIM_DURATION_2, ANIM_DURATION_HIDE,
        LIGHTNING_INITIAL_WIDTH, LIGHTNING_FINAL_WIDTH, ANIM_X_RELATIVE, ANIM_Y_RELATIVE, A_BOMB_DAMAGE_FOR_BOSS
    } = A_BOMB_REACTION_CONFIG;

    for (let i = 0; i < ANIM_COUNTER; i++) {
        const timeout_delay = ANIM_INITIAL_DELAY + (i * ANIM_INTERVAL);

        setTimeout(() => {
            const boss_element = validate_boss_for_movement(boss_data, "boss_a_bomb_reaktion (delayed flash)");
            if (boss_element === null) {
                return;
            }
            unified_image_loader("villam1.gif", (lightning_effect) => {
                lightning_effect.appendTo(boss_element)
                    .addClass("villam2")
                    .show()
                    .css({
                        "left": 0,
                        "top": 0,
                        "width": LIGHTNING_INITIAL_WIDTH
                    });

                lightning_effect.animate({
                    "width": LIGHTNING_FINAL_WIDTH,
                    "left": -ANIM_X_RELATIVE,
                    "top": -ANIM_Y_RELATIVE
                }, ANIM_DURATION_1)
                    .animate({
                        "width": LIGHTNING_FINAL_WIDTH,
                        "opacity": 0.5
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
    const img_dimension = 35;
    const anim_duration = 250;
    unified_image_loader('electric2.png', (shot_explosion_img) => {
        shot_explosion_img.addClass('bs_loves_explosion')
            .appendTo($("body"))
            .show()
            .css({
                "left": pos_x,
                "top": pos_y,
            });

        shot_explosion_img.animate({
            "width": img_dimension,
            "height": img_dimension
        }, anim_duration, function () {
            $(this).remove();
        });
    });
}

FIREWORKS_CONFIG = {
    IMAGE_SRC: 'fireworks1.gif',
    CLASS: 'tuzijatek',
    ANIM_DURATION: 4000,
    HIDE_DURATION: 500,
    FINAL_WIDTH: 620,
    // Positioning percentages relative to window dimensions
    LEFT_FIREWORK_OFFSET_X_PERCENT: 0.05, // 5% from left window edge
    RIGHT_FIREWORK_OFFSET_X_PERCENT: 0.95, // 5% from right window edge
    Y_OFFSET_PERCENT: 0.50, // 50% from top window edge (center)
    // RIGHT_FIREWORK_WIDTH_REFERENCE: 1 // Placeholder, to use actual width later
};
/**
 * Triggers a dual fireworks display on screen, signifying a victory
 * after defeating the boss.
 * The fireworks are positioned on the left and right sides of the screen.
 *
 * @returns {void}
 */
function final_fireworks() {
    const {
        IMAGE_SRC, CLASS, ANIM_DURATION, HIDE_DURATION, FINAL_WIDTH,
        LEFT_FIREWORK_OFFSET_X_PERCENT, RIGHT_FIREWORK_OFFSET_X_PERCENT, Y_OFFSET_PERCENT
    } = FIREWORKS_CONFIG;

    audio_play("#robbanas8");

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

function initial_lightning_effect()                       // Boss incoming lightning
{
    const timeout = 1200;
    const boss_data = boss_level_entities.boss;
    const boss_element = boss_data.element;
    if (!boss_data || boss_element.length === 0) {
        return;
    }
    unified_image_loader('villam1.gif', (incoming_lightning_img) => {
        incoming_lightning_img.addClass('villam2')
            .appendTo(boss_element)
            .show()
            .css({
                "left": 0,
                "top": 0
            });
        incoming_lightning_img.hide(timeout);
        setTimeout(() => {
            incoming_lightning_img.remove();
        }, timeout);
    });
}


const BAZIS_EXIT_CONFIG = {
    EXIT_DELAY: 3000,
    FINAL_DELAY: 4700,
    // Horizontal duration rules
    HORIZONTAL_DURATION_THRESHOLD_PERCENT: 0.25,
    HORIZONTAL_DURATION_LONG: 1250,
    HORIZONTAL_DURATION_SHORT: 900,

    // Vertical duration rules
    VERTICAL_DURATION_THRESHOLD_PERCENT: 0.75,
    VERTICAL_DURATION_LONG: 1350,
    VERTICAL_DURATION_SHORT: 900,
};

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
        HORIZONTAL_DURATION_THRESHOLD_PERCENT,
        HORIZONTAL_DURATION_LONG,
        HORIZONTAL_DURATION_SHORT,
        VERTICAL_DURATION_THRESHOLD_PERCENT,
        VERTICAL_DURATION_LONG,
        VERTICAL_DURATION_SHORT,
    } = BAZIS_EXIT_CONFIG;

    const initial_bazis_data = validate_bazis_presence();
    if (!initial_bazis_data) {
        return;
    }
    const bazis_element = initial_bazis_data.element;

    setTimeout(function () {
        const bazis_data = validate_bazis_presence();
        if (!bazis_data) {
            console.warn("Bazis disappeared before exit animation could start.");
            return;
        }

        const bazis_rect = bazis_data.rect;

        let horizontal_duration;
        let vertical_duration;
        const window_width = $(window).width();
        const window_height = $(window).height();

        // Calculate destination_x (always center)
        const destination_x = parseInt((window_width / 2) - (bazis_rect.width / 2));

        // --- Determine horizontal duration based on config rules ---
        if (bazis_rect.left < window_width * HORIZONTAL_DURATION_THRESHOLD_PERCENT ||
            bazis_rect.left > window_width * (1 - HORIZONTAL_DURATION_THRESHOLD_PERCENT)) {
            horizontal_duration = HORIZONTAL_DURATION_LONG;
        } else {
            horizontal_duration = HORIZONTAL_DURATION_SHORT;
        }

        // --- Determine vertical duration based on config rules ---
        if (bazis_rect.top > window_height * VERTICAL_DURATION_THRESHOLD_PERCENT) {
            vertical_duration = VERTICAL_DURATION_LONG;
        } else {
            vertical_duration = VERTICAL_DURATION_SHORT;
        }

        // Animation Chain (Horizontal + Vertical) ---
        bazis_element.animate({
            "left": destination_x
        }, horizontal_duration, "linear")
            .queue(function (next) {
                audio_play("#exit1");
                next();
            })
            .animate({
                top: -bazis_rect.height
            }, vertical_duration, "linear", function () {

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