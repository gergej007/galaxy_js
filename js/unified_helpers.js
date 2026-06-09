/**
 * Generic guard to check if a game entity has its required components.
 * @param {Object} entity_data - The object to check (enemy, bazis, bounty, etc.)
 * @returns {boolean} True if the entity is valid and ready for use.
 */
function is_entity_valid(entity_data) {
    // Returns true only if the data exists AND has both an element and a rect
    return !!(entity_data?.element && entity_data?.rect);
}

const SCORE_PROVIDER = {
    /**
     * Calculates the score gained from a standard enemy hit/kill based on level config.
     * @returns {number} The randomized score value.
     */
    get_hit_score() {
        const { hit_score_multiplier, hit_score_seed } = current_level_config;
        
        const mult = hit_score_multiplier || 0;
        const seed = hit_score_seed || 0;

        return Math.ceil(Math.random() * mult) + seed;
    }
};