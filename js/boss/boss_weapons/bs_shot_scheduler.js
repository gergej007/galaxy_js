function schedule_boss_attacks(boss_data, attack_plans_array) {
    if (!boss_data || !boss_data.attack_timeout_ids) {
        console.warn("Boss data missing for scheduling attacks.");
        return;
    }

    // Clear any previous attack timeouts from this sequence
    if (boss_data.attack_timeout_ids.length > 0) {
        boss_data.attack_timeout_ids.forEach(id => clearTimeout(id));
        boss_data.attack_timeout_ids = [];
    }

    attack_plans_array.forEach(plan => {
      
        const timeoutId = setTimeout(() => {
            
            if (!game_data.game_states.boss_flag || !boss_data) {
                console.log("Boss deactivated during attack delay, cancelling fire.");
                return;
            }

            switch( plan.type) {
                case 'cone_shots' : 
                    boss_cone_shooting( plan.shots, plan.spread_dist, plan.speed, plan.type_key, plan.audio);
                break;
                case 'homing_shots' : 
                    boss_homing_shooting(plan.shots, plan.speed, plan.audio, plan.interval_ms, plan.type_key);
                break;
                case 'lazer_shots' : 
                    boss_lazer_shooting(plan.shots, plan.speed, plan.audio,plan.interval_ms, plan.type_key);
                break;
                default:
                    console.warn(`Unknown boss attack plan type: ${plan.type}`);
            }           
        }, plan.delay_ms);

        boss_data.attack_timeout_ids.push(timeoutId); // Store ID for potential clearing
    });
}      