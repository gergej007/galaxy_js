const ENEMY_VARIETY_MANAGER = {
    bag: [],

    // Fill the bag with all possible numbers in the current range
    fill_bag() {
        const { spacekraft_variance_multiplier, spacekraft_variance_seed } = current_level_config;
        this.bag = [];
        
        for (let i = 0; i < spacekraft_variance_multiplier; i++) {
            this.bag.push(i + spacekraft_variance_seed);
        }
        
        // Shuffle the bag (Fisher-Yates algorithm)
        for (let i = this.bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
    },

    // Get the next enemy index
    get_next() {
        if (this.bag.length === 0) {
            this.fill_bag();
        }
        return this.bag.pop();
    }
};

const RANDOM_PROVIDER = {
    // get_in_range(multiplier, seed) {
    //     return Math.round(Math.random() * multiplier) + seed;
    // },
   
        get_in_range(multiplier, seed = 0) { // Default seed to 0
            return Math.round(Math.random() * multiplier) + seed;
        },
  

    get_enemy_width() {
        const { ELEM_WIDTH_MULTIPLIER, ELEM_WIDTH_SEED } = ENEMY_SPAWN_CONFIG;
        return RANDOM_PROVIDER.get_in_range(ELEM_WIDTH_MULTIPLIER, ELEM_WIDTH_SEED);
    },

    /**
     * Calculates movement duration based on level speed factors and screen width.
     */
    get_enemy_duration() {
        const { level_multiplier_speed, level_seed_speed } = current_level_config;
        const window_width = $(window).width();

        return Math.round(Math.random() * level_multiplier_speed) + (level_seed_speed * window_width);
    }
};