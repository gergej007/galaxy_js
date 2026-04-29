$.easing.easeInGentle = function (x) {   
    return Math.pow(x, 1.3); 
};

/**
 * Creates and initializes a single asteroid element (container and image).
 * It loads the image asynchronously and returns a Promise that resolves
 * with the fully prepared jQuery asteroid container element.
 *
 * @returns {Promise<JQuery<HTMLElement>>} A promise that resolves with the jQuery object of the asteroid container.
 *                                         Rejects if the image fails to load.
 */
function setup_asteroid_async() {
    return new Promise((resolve, reject) => {
      
        const asteroid_img_src = ASTEROID_CONFIG.IMAGE_CONFIG.initial_src;
        const asteroid_container = $("<div>").addClass(ASTEROID_CONFIG.IMAGE_CONFIG.container_class);

        unified_image_loader(asteroid_img_src, (asteroid_img) => {
            if (!asteroid_img || asteroid_img.length === 0) {
                console.error(`Asteroid image failed to load for ${asteroid_img_src}!`);
                asteroid_container.remove(); 
                reject(new Error("Asteroid image failed to load.")); 
                return;
            }

            asteroid_img.addClass(ASTEROID_CONFIG.IMAGE_CONFIG.image_class)
                .appendTo(asteroid_container)
                .show(); 
           
            asteroid_container.appendTo($("body"));
            resolve(asteroid_container); 
        });
    });
}

/**
 * Reuses the existing asteroid element, loading a new random image if necessary.
 * This function handles swapping the image and ensuring it's loaded.
 *
 * @param {object} asteroid_data - The global boss_level_entities.asteroid object.
 * @returns {Promise<JQuery<HTMLElement>>} A promise that resolves with the existing asteroid container element,
 *                                         after its new image is loaded and swapped. Rejects on image load error.
 */
function reuse_asteroid(asteroid_data) {
    return new Promise((resolve, reject) => {
        const {rnd_img_seed, rnd_img_multiplier, image_path, image_extension, image_class} = ASTEROID_CONFIG.IMAGE_CONFIG;
      
        const rnd_img_idx = Math.round(Math.random() * rnd_img_multiplier) + rnd_img_seed;
        const new_asteroid_img_src = image_path+rnd_img_idx+image_extension;

        if (asteroid_data.current_image_src === new_asteroid_img_src && asteroid_data.img_element) {
            // Image is already the one we want, no need to reload
            asteroid_data.element.show(); 
            resolve(asteroid_data.element);
            return;
        }

        unified_image_loader(new_asteroid_img_src, (new_img_element) => {
            if (!new_img_element || new_img_element.length === 0) {
                console.error(`Error: Asteroid image failed to load for ${new_asteroid_img_src} during reuse!`);
                reject(new Error("Asteroid image failed to load for reuse."));
                return;
            }

            // Remove the old image element if it exists
            if (asteroid_data.img_element) {
                asteroid_data.img_element.remove();
            }

            // Append the new image element
            asteroid_data.img_element = new_img_element
                .addClass(image_class)
                .appendTo(asteroid_data.element)
                .show(); 

            asteroid_data.current_image_src = new_asteroid_img_src; 
            asteroid_data.element.show(); 
            resolve(asteroid_data.element); // Resolve with the existing container element
        });
    });
}

/**
 * Orchestrates the continuous animation of a single, reusable asteroid.
 * The asteroid is configured, animated, and then hidden/reset,
 * before triggering the next animation cycle.
 */
async function animate_asteroid() {
    const asteroid_data = boss_level_entities.asteroid;
    if (!game_data.game_states.boss_flag) {
        console.log("Boss is not active, stopping asteroid animation.");
        
        if (asteroid_data.element) {
            asteroid_data.element.stop(true, false).hide(); 
        }
        return;
    }    

    await new Promise(resolve => setTimeout(resolve, ASTEROID_CONFIG.ANIMATION_CONFIG.interval)); 

    let current_asteroid_container;
    try {
        // if (!asteroid_data.element || asteroid_data.element.length === 0) {
        if ((asteroid_data.element?.length ?? 0) === 0) {
            // First time: setup the container and initial image
            current_asteroid_container = await setup_asteroid_async();
            // Store reference to the container's img_element now
            asteroid_data.img_element = current_asteroid_container
            .find(`.${ASTEROID_CONFIG.IMAGE_CONFIG.image_class}`);
        } else {
            // Subsequent times: reuse the existing container, change image
            current_asteroid_container = await reuse_asteroid(asteroid_data); 
        }
       
        // Now current_asteroid_container holds the *actual* jQuery element for the asteroid
        // This is where boss_level_entities.asteroid.element gets its value for the current cycle
        asteroid_data.element = current_asteroid_container;
        const asteroid_element = asteroid_data.element; 

        // Generate Movement Parameters - pass the currently active asteroid element
        const params = asteroid_params(asteroid_element );

        // Apply initial CSS and classes (clear previous classes first for clean reuse)
        // boss_level_entities.asteroid.element.removeClass().addClass("asteroida_container");
        asteroid_element.css({
            "width": params.rnd_width,
            "left": params.css_xpoz,
            "top": params.rnd_pozy,
            "transform": params.rotate_y
        }).show(); 

        // Update initial bounding box
        asteroid_data.rect = asteroid_element[0].getBoundingClientRect();

        // Animate the asteroid
        asteroid_element.animate({ 
            "left": params.anim_xpoz
        }, params.rnd_duration, "easeInGentle", function() {
            $(this).hide(); 
            animate_asteroid(); 
        });

    } catch (error) {
        console.error("Failed to setup or animate asteroid:", error);
        // If an asteroid setup fails, ensure the element is hidden if it exists
        if (asteroid_element) {
            asteroid_element.hide();
        }
        animate_asteroid(); 
    }
}

/**
 * Calculates and returns various parameters for an asteroid's animation and positioning.
 * These parameters include animation duration, width, vertical position, and initial/final horizontal positions
 * and rotation based on a random direction.
 *
 * @param {jQuery} asteroid_element - A jQuery object representing the asteroid's element, used to get its width.
 *                                  It is expected to have a `width()` method.
 * @returns {object} An object containing the calculated parameters:
 * @returns {number} return.rnd_duration - The calculated animation duration in milliseconds.
 * @returns {number} return.rnd_width - The calculated random width for the asteroid.
 * @returns {number} return.rnd_pozy - The calculated random vertical position (y-coordinate) for the asteroid.
 * @returns {number} [return.anim_xpoz] - The initial horizontal position (x-coordinate) for the animation, relative to the window.
 * @returns {number} [return.css_xpoz] - The CSS `left` property value for the asteroid's initial position.
 * @returns {string} [return.rotate_y] - The CSS `transform` value for Y-axis rotation (e.g., "rotateY(0deg)" or "rotateY(180deg)").
 */
function asteroid_params(asteroid_element){
    const { rnd_duration_seed, rnd_duration_multiplier, rnd_pozy_seed, 
        rnd_pozy_multiplier, rnd_width_seed, rnd_width_multiplier, rotation_0_deg, rotation_180_deg}
        =ASTEROID_CONFIG.ANIMATION_CONFIG;
    const win_width = $(window).width();
    const win_height = $(window).height();    
    const rnd_duration = Math.round( Math.random() * rnd_duration_multiplier)+ win_width * rnd_duration_seed;
    const direction_selection = Math.round( Math.random());
    const rnd_pozy = Math.round(Math.random() * (win_height * rnd_pozy_multiplier) + win_height * rnd_pozy_seed);
    const rnd_width = Math.round(Math.random() * rnd_width_multiplier) + rnd_width_seed;

    let pars = {
        rnd_duration : rnd_duration,
        rnd_width : rnd_width,
        rnd_pozy : rnd_pozy,       
    };

    if( direction_selection === 0){ 
        pars.anim_xpoz = $(window).width();
        pars.css_xpoz = 0 - asteroid_element.width();
        pars.rotate_y = rotation_0_deg;
    }
    else if( direction_selection === 1){
        pars.anim_xpoz = 0 - rnd_width;
        pars.css_xpoz = $(window).width();
        pars.rotate_y = rotation_180_deg;
    }
    return pars;
}

/**
 * Creates a dust animation effect at the point of a boss shot collision with an asteroid.
 * This function handles the visual effect of "dust" appearing and animating away.
 * It includes validation for input parameters and leverages configuration settings for appearance and behavior.
 *
 * @param {object} shot_data - Data object for the boss shot.
 * @param {HTMLElement | jQuery | object} shot_data.element - The DOM element or jQuery object representing the boss shot.
 * @param {object} asteroid_rect - The bounding client rectangle of the asteroid.
 * @returns {void}
 */
function dust_animation( shot_data, asteroid_rect)
{
    if( !shot_data || !shot_data.element || shot_data.element.length === 0 || !asteroid_rect){
        console.warn('Dust animation called with invalid param(s). Animation cancelled!');
        return;
    }
    const {boss_shot_types, rnd_img_idx_seed, rnd_img_idx_multiplier, rnd_height_seed, 
           rnd_height_multiplier, edge_safe_zone_px, anim_pozy_offset_px, anim_duration_ms, img_class,
           base_height, img_path, image_extension} 
        = ASTEROID_CONFIG.DUST_CONFIG; 

    const poz_x = shot_data.rect.left;
    let poz_y = shot_data.rect.top;                  
    
    const valid_shot_types = boss_shot_types;
    if (valid_shot_types.includes(shot_data.type)) {
        poz_y = asteroid_rect.top;
    }
   
    const rnd_height = Math.round( Math.random() * rnd_height_multiplier) + rnd_height_seed;
    const rnd_idx = Math.round( Math.random() * rnd_img_idx_multiplier) + rnd_img_idx_seed;

    unified_image_loader( img_path+rnd_idx+image_extension, (dust_img)=>{
        dust_img.addClass(img_class)
        .appendTo($("body"))
        .css({
            "position": "absolute",       
            "height": base_height, 
            "left" : poz_x,
            "top" : poz_y 
        })
        .show();

        if( poz_x < asteroid_rect.left + edge_safe_zone_px || poz_x > asteroid_rect.right - edge_safe_zone_px){
            dust_img.remove();
        }

        dust_img.animate({           
            "height" : rnd_height,
            "top" : poz_y - anim_pozy_offset_px
        }, anim_duration_ms, function(){
            $(this).remove();
        });
    });    
}        