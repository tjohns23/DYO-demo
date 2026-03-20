-- Migration: Add Archetype Metadata Columns and Seed New Archetypes
-- Purpose: Add slug, name, and tagline columns to support ArchetypeProfile queries
-- and seed the 8 new archetypes

ALTER TABLE IF EXISTS public.archetypes
  ADD COLUMN IF NOT EXISTS slug text UNIQUE NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tagline text NOT NULL DEFAULT '';

-- Remove defaults after adding (these were just for existing rows)
ALTER TABLE IF EXISTS public.archetypes
  ALTER COLUMN slug DROP DEFAULT,
  ALTER COLUMN name DROP DEFAULT,
  ALTER COLUMN tagline DROP DEFAULT;

-- Delete old archetypes (if any exist) to recreate with new structure
DELETE FROM public.archetypes WHERE slug IN ('perfectionist', 'avoider', 'overthinker', 'scope_creeper', '');

-- Insert the 8 new archetypes
INSERT INTO public.archetypes (id, slug, title, name, tagline, description, strategy_hint)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'optimizer', 'The Optimizer', 'The Optimizer',
   'Excellence is your standard — done is your superpower.',
   'You have exceptional standards. While others ship "good enough," you see the gap between what exists and what could be. This isn''t pickiness—it''s genuine care for craft. You iterate because you can see the better version, and you can''t unsee it. Your work, when it finally ships, is excellent. The problem isn''t quality—it''s knowing when excellent becomes the enemy of done. You refine the pitch deck one more time. You rewrite the email again. You tweak the design just a little more. Each iteration feels productive, but somewhere along the way, "making it better" became a way to avoid the vulnerability of calling it finished. You don''t ship bad work. You ship almost nothing, because almost nothing feels ready. The world needs your craft—but it needs you to stop polishing and press send.',
   'Use time-boxing to force "done" over "perfect"'),
  
  ('00000000-0000-0000-0000-000000000002', 'strategist', 'The Strategist', 'The Strategist',
   'You see the system. Now press start before you see everything.',
   'You think in systems, not steps. Before you start, you need to see how the pieces connect—the architecture, the dependencies, the long-term implications. This is your superpower. While others build blindly, you design for coherence. But here''s where it gets tricky: understanding the full system can become a reason to never start building it. You research. You map. You analyze. You consider edge cases and second-order effects. All of this feels like progress—and intellectually, it is. But the plan is now so well-architected that actually executing it feels almost redundant. You''re not avoiding the work because it''s hard. You''re avoiding it because starting means accepting that you''ll never have perfect information. The system will never be fully clear. And for you, that''s harder than the work itself.',
   'Constrain decisions with clear criteria'),
  
  ('00000000-0000-0000-0000-000000000003', 'visionary', 'The Visionary', 'The Visionary',
   'Ideas multiply beautifully. Shipping multiplies faster.',
   'You see possibilities others miss. While they execute on the obvious, you''re three moves ahead, connecting dots that haven''t been drawn yet. This is why people come to you for ideas. You generate momentum just by talking about what''s possible. The problem is you generate ideas faster than you close loops. You start the project, get excited about the next evolution, add features mid-build, and suddenly you''re working on three different versions of the same thing. Or worse—you''ve moved on to an entirely new idea because this one started feeling too defined, too constrained, too… done. You don''t lack follow-through because you''re lazy. You lack it because finishing feels like killing the possibility of what it could still become. But the world doesn''t need your best idea. It needs your finished idea.',
   'Version 1 beats nothing'),
  
  ('00000000-0000-0000-0000-000000000004', 'advocate', 'The Advocate', 'The Advocate',
   'Meaning matters most — but perfect meaning never comes.',
   'You don''t just want to build things—you want to build things that matter. Your work has to connect to something larger: a mission, a community, a set of values you actually believe in. When it does, you''ll work harder than anyone. When it doesn''t, you can barely start. This isn''t entitlement. It''s integrity. You physically can''t bring yourself to execute on something that feels misaligned, extractive, or meaningless. Other people can compartmentalize. You can''t. If the work doesn''t serve something you care about, your body just… stops. The challenge is that meaning isn''t always clear upfront. Sometimes you have to ship version one to discover what version two should serve. But you stall in the uncertainty, waiting for the purpose to reveal itself—when the purpose might only become clear through the act of finishing.',
   'Find your core why and lock it in'),
  
  ('00000000-0000-0000-0000-000000000005', 'politician', 'The Politician', 'The Politician',
   'You move mountains with people. Move anyway.',
   'You build through relationships. While others work in isolation, you energize through collaboration, feedback, and visibility. You''re not performing—you''re genuinely fueled by connection. Ideas become real when you talk them through. Execution feels possible when others are watching. The flip side: when you''re working alone, your momentum dies. The project that felt exciting in the team meeting becomes a slog at your desk. You tell yourself you''ll get to it, but without an audience, without feedback, without someone to build with, the work just… sits there. You''re not dependent on validation—you''re dependent on energy exchange. And in a world that romanticizes the solo grind, that can feel like a weakness. It''s not. You just need to design your execution around how you''re actually wired: ship with witnesses, build in public, make solo work social.',
   'Ship with an audience'),
  
  ('00000000-0000-0000-0000-000000000006', 'empath', 'The Empath', 'The Empath',
   'Depth is your gift — vulnerability is the delivery.',
   'You feel things others miss. You sense the emotional undercurrents in a room, the unspoken tension in a message, the weight of how your work might land. This makes you an incredible creator—your work has depth because you care deeply about how it affects people. But that same sensitivity can become your prison. Shipping work means exposing it to judgment, and exposure feels like being unprotected. You can handle the work itself—it''s the vulnerability of being seen that freezes you. So you delay. You soften. You hide behind "not ready yet" because not ready feels safer than not good enough. You don''t lack courage. You lack permission to ship something that might not land perfectly. But here''s the truth: the people you''re creating for would rather have your imperfect work than your protected silence.',
   'Ship and let others decide'),
  
  ('00000000-0000-0000-0000-000000000007', 'builder', 'The Builder', 'The Builder',
   'Structure makes you strong. Build the scaffolding yourself.',
   'You''re an execution machine—when the system is clear. Give you defined inputs, success criteria, and a process to follow, and you''ll build it flawlessly. You don''t need motivation; you need structure. Once you have it, you''re unstoppable. The problem is what happens when the structure isn''t there. When the project is ambiguous, the inputs are messy, or the definition of "done" keeps shifting, you freeze. Not because you can''t handle the work—but because you can''t execute without knowing what "good" looks like. Other people can start messy and figure it out as they go. You need the rails before you can run. And in early-stage work, creative work, self-directed work—the rails don''t exist yet. That''s not a flaw in you. That''s a mismatch between your wiring and the ask. You don''t need to learn to be comfortable with ambiguity. You need to build the minimum structure required to start.',
   'Design the constraints yourself'),
  
  ('00000000-0000-0000-0000-000000000008', 'stabilizer', 'The Stabilizer', 'The Stabilizer',
   'Clarity settles you — but you''ll never have it all upfront.',
   'You''re dependable. When the expectations are clear, you deliver—consistently, reliably, without drama. You don''t need glory; you need clarity. Tell you what success looks like, and you''ll get there. But when things are unclear—when priorities shift, when the goalposts move, when you''re expected to self-direct without guidance—you freeze. Not because you''re incapable, but because ambiguity feels like walking into a test you didn''t study for. You''re not afraid of the work. You''re afraid of doing it wrong. Other people seem comfortable just starting and figuring it out. For you, that feels reckless. So you wait for clarity that might never come. You hesitate. You check in too many times. You stall—not out of laziness, but out of a deep need to do it right. You don''t need to become comfortable with chaos. You need missions so clear that "right" is obvious.',
   'Accept 80% clarity and commit')
ON CONFLICT (slug) DO NOTHING;

-- Documentation:
-- slug: Unique identifier used for queries (e.g., 'optimizer', 'strategist')
-- name: Display name (e.g., "The Optimizer")
-- tagline: One-line supportive message 
-- strategy_hint: Strategy recommendation for missions

