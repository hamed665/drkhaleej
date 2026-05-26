-- Phase 2.7B: center_type expansion only
ALTER TYPE center_type ADD VALUE IF NOT EXISTS 'gym';
ALTER TYPE center_type ADD VALUE IF NOT EXISTS 'fitness_center';
ALTER TYPE center_type ADD VALUE IF NOT EXISTS 'spa';
ALTER TYPE center_type ADD VALUE IF NOT EXISTS 'healthy_restaurant';
ALTER TYPE center_type ADD VALUE IF NOT EXISTS 'nutrition_center';
ALTER TYPE center_type ADD VALUE IF NOT EXISTS 'juice_bar';
ALTER TYPE center_type ADD VALUE IF NOT EXISTS 'meal_plan_provider';
ALTER TYPE center_type ADD VALUE IF NOT EXISTS 'home_healthcare';
ALTER TYPE center_type ADD VALUE IF NOT EXISTS 'optical_store';
ALTER TYPE center_type ADD VALUE IF NOT EXISTS 'medical_equipment_store';
