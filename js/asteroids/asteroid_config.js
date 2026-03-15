const ASTEROID_CONFIG = {
    IMAGE_CONFIG : { initial_src: 'asteroids/asteroid1.png', image_path: 'asteroids/asteroid', 
                     image_extension: '.png', container_class: "asteroida_container", 
                     image_class: "asteroid_img", rnd_img_seed: 1, rnd_img_multiplier: 3},
    ANIMATION_CONFIG : { interval: 500, rnd_duration_seed: 8, rnd_duration_multiplier: 2000, 
                         rnd_pozy_seed: 0.50, rnd_pozy_multiplier: 0.20, rnd_width_seed: 180, 
                         rnd_width_multiplier: 70, rotation_0_deg: "rotateY(0deg)", rotation_180_deg: "rotateY(180deg)"},
    DUST_CONFIG : { boss_shot_types : ['Boss Shot 1', 'Boss Shot 3', 'Boss Shot Homing', 'Boss Twin Lazer'],
                    rnd_img_idx_seed: 1, rnd_img_idx_multiplier: 2, rnd_height_seed: 50, 
                    rnd_height_multiplier: 20, edge_safe_zone_px: 40, anim_pozy_offset_px: 20,
                    anim_duration_ms: 200, img_class: 'por_felho', base_height: 10,
                    img_path: "asteroids/dust", image_extension: ".png" }                                      
    }