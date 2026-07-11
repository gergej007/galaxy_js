/**
 * Iterates through a list of URLs and loads them into the browser cache.
 * @param {string[]} url_list 
 * @returns {Promise<void[]>} Resolves when all images are loaded.
 */
function preload_images(url_list) {
    const promises = url_list.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = () => {
                console.warn(`Failed to preload image: ${url}`);
                resolve(); 
            };
            img.src = url;
        });
    });
    return Promise.all(promises);
}


/**
 * Loads audio files into the browser cache.
 * @param {string[]} url_list 
 * @returns {Promise<void[]>}
 */
function preload_audio(url_list) {
    const promises = url_list.map(url => {
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.oncanplaythrough = resolve;
            audio.onerror = () => {
                console.warn(`Failed to preload audio: ${url}`);
                resolve(); 
            };
            audio.src = url;
            audio.load();
        });
    });
    return Promise.all(promises);
}

/**
 * Scans all game configuration objects to compile a comprehensive list of image URLs.
 * Extracts paths for asteroids, enemies, boss components, powerups, UI elements, 
 * and special effects using a combination of dynamic path generation and registry mapping.
 * 
 * @returns {string[]} A flattened and filtered array of raw image path strings.
 */
function get_all_image_urls() {
    const extension = ASTEROID_CONFIG.IMAGE_CONFIG.image_extension;
    const {rnd_img_seed, rnd_img_multiplier} = ASTEROID_CONFIG.IMAGE_CONFIG;
    const {rnd_img_idx_seed, rnd_img_idx_multiplier} = ASTEROID_CONFIG.DUST_CONFIG;
    const {RND_ENEMY_IDX_SEED, RND_ENEMY_IDX_MULTIPLIER} = ENEMY_SPAWN_CONFIG;

    const asteroid_base = ASTEROID_CONFIG.IMAGE_CONFIG.image_path;
    const asteroid_count = rnd_img_seed + rnd_img_multiplier;    

    const dust_img_base = ASTEROID_CONFIG.DUST_CONFIG.img_path;
    const dust_count = rnd_img_idx_seed + rnd_img_idx_multiplier;

    const enemy_base = ENEMY_SPAWN_CONFIG.IMG_SRC;
    const enemy_count = RND_ENEMY_IDX_SEED + RND_ENEMY_IDX_MULTIPLIER;    
    
    return [
        generate_path(asteroid_base, asteroid_count, extension),
        generate_path(dust_img_base, dust_count, extension),
        BOSS_SETUP_CONFIG.BOSS_IMG_SRC,
        Object.values(POWERUP_REGISTRY).map(powerup => powerup.src),
        BOUNTY_CONTAINER_CONFIG.IMG_SRC,
        generate_path(enemy_base, enemy_count, extension),
        UI_CONFIG.HUD.LEFT.IMAGE.URL,
        BAZIS_CONFIG.BAZIS_IMG_SRC,
        UI_CONFIG.WINDOW.BACKGROUND.PATH,
        BOUNTY_CONTAINER_CONFIG.DAMAGE_IMG_SRC,
        ANIMATION_CONFIG.FIREWORKS.IMAGE_SRC,
        UI_CONFIG.DIALOGS.BACKGROUND,
        UI_CONFIG.UI_IMAGES,
        SECONDARY_WEAPONS_CONFIG.HOMING_MISSILE.IMAGE.IMG_SRC,
        SECONDARY_WEAPONS_CONFIG.HOMING_MISSILE.IMPACT.IGNITION_IMG_SRC,
        DAMAGE_N_EXPLOSION.IMG_SRC,
        IMPACT_VISUALS_CONFIG.IMAGE_SRC,
        MAIN_EXPLOSION_CONFIG.IMAGE_SRC,
        ANIMATION_CONFIG.A_BOMB_REACTION_CONFIG.IMG_SRC,
        BOSS_SHOTS_CONFIG.HOMING_SHOT_EXPLOSION.IMG_SRC,
        SECONDARY_WEAPONS_CONFIG.GOD_MODE.BAZIS_IMG_GOD_MODE_SRC       
    ].flat().filter(path => !!path && typeof path === 'string');
}

/**
 * Scans all game configurations to compile a unique list of audio filenames.
 * Standardizes jQuery selectors (#) into physical file paths.
 * 
 * @returns {string[]} Array of formatted filenames (e.g., ["track1.mp3", "lazer1.mp3"])
 */
function get_all_audio_urls() {
    const AUDIO_EXT = PRELOAD_CONFIG.AUDIO_EXT;

    const rawSources = [
        // Numbered Sequences (Pre-formatted by generate_path)
        generate_path(AUDIO_CONFIG.EXPLOSIONS.PREFIX.replace('#', ''), AUDIO_CONFIG.EXPLOSIONS.EXPLOSION_COUNT, AUDIO_EXT),
        generate_path(AUDIO_CONFIG.IMPACTS.PREFIX.replace('#', ''), AUDIO_CONFIG.IMPACTS.IMPACT_COUNT, AUDIO_EXT),
        generate_path(AUDIO_CONFIG.LAZERS.PREFIX.replace('#', ''), AUDIO_CONFIG.LAZERS.LAZER_COUNT, AUDIO_EXT),

        // Standard Tracks & System FX
        Object.values(AUDIO_CONFIG.TRACKS),
        BAZIS_CONFIG.EXPLOSION.AUDIO_KEY,
        CORE_CONFIG.LEVEL_UP_AUDIO_KEY,

        // Weapon Systems
        Object.values(BAZIS_SHOTS_CONFIG).map(shot => shot.AUDIO_KEY),
        SECONDARY_WEAPONS_CONFIG.HOMING_MISSILE.IMPACT.AUDIO_KEY,
        SECONDARY_WEAPONS_CONFIG.TRACKING_LAZER.AUDIO_KEY,
        SECONDARY_WEAPONS_CONFIG.GOD_MODE.AUDIO_ACTIVATE_KEY,
        SECONDARY_WEAPONS_CONFIG.A_BOMB.AUDIO_KEYS,

        // Boss & Animation Systems
        BOSS_SETUP_CONFIG.AUDIO_KEY,
        Object.values(BOSS_BEHAVIOR_CONFIG.MOVEMENT_PHASES).map(p => p.audio_key),
        BOSS_ATTACK_CONFIG.PHASE_1.map(a => a.audio),
        BOSS_ATTACK_CONFIG.PHASE_2.map(a => a.audio),
        BOSS_DIES_CONFIG.AUDIO_KEYS,
        BOSS_DIES_CONFIG.LAZER_SOUND,
        BOSS_SHOTS_CONFIG.EMP_SHAKE.AUDIO_KEY,
        ANIMATION_CONFIG.FIREWORKS.AUDIO_KEY,
        ANIMATION_CONFIG.BAZIS_EXIT.AUDIO_KEY,

        BOUNTY_CONTAINER_CONFIG.AUDIO_KEY,
        POWERUP_SPAWN_CONFIG.AUDIO_KEY,
        DAMAGE_N_EXPLOSION.AUDIO_KEY
    ];

    //  Flatten nested arrays, filter invalid entries, and deduplicate
    return [...new Set(rawSources.flat())]
        .filter(item => item && typeof item === 'string' && item !== BOSS_SETUP_CONFIG.BG_AUDIO_KEY) // Ignore track1 as requested
        .map(item => {
            if (item.startsWith('#')) return item.replace('#', '') + AUDIO_EXT;
            return item;
        });
}


/**
 * Main orchestrator for pre-game asset synchronization. 
 * Gathers, standardizes, and caches all image and audio resources 
 * before revealing the game start interface.
 * 
 * @async
 * @returns {Promise<void>} Resolves when all assets are processed and the UI is updated.
 */
async function initialize_game_assets() {
    update_center_display("LOADING ASSETS...");

    const IMAGE_FOLDER = PRELOAD_CONFIG.MAIN_IMG_FOLDER;
    const AUDIO_FOLDER = PRELOAD_CONFIG.MAIN_AUDIO_FOLDER;
    
    const images = get_all_image_urls().map(p => p.startsWith(IMAGE_FOLDER) ? p : IMAGE_FOLDER + p);
    const audio = get_all_audio_urls().map(p => `${AUDIO_FOLDER}${p}`);

    try {
        await Promise.all([
            preload_images(images),
            preload_audio(audio)
        ]);
        console.log(`Preload Success: ${images.length} images, ${audio.length} sounds.`);
    } catch (err) {
        console.warn("Preload encountered issues, starting anyway.", err);
    }
    game_data.game_states.initialize_flag = false;
    show_start_panel();
}

/**
 * Helper to generate numbered asset paths.
 */
const generate_path = (base, count, ext) => 
    Array.from({ length: count }, (_, i) => `${base}${i + 1}${ext}`);
