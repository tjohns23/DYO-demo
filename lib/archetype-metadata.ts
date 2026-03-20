import { ArchetypeSlug, ArchetypeProfile } from '@/lib/actions/assessment';

/**
 * Archetype metadata
 * Tone: "Supportive but Firm" — honest about the pattern, warm about the person.
 * Max score per dimension = 25 (5 questions × 5 points).
 */
export const ARCHETYPE_METADATA: Record<
  ArchetypeSlug,
  Pick<ArchetypeProfile, 'name' | 'tagline' | 'description'>
> = {
  optimizer: {
    name: 'The Optimizer',
    tagline: 'Excellence is your standard — done is your superpower.',
    description:
      'You have exceptional standards. While others ship "good enough," you see the gap between what exists and what could be. This isn\'t pickiness—it\'s genuine care for craft. You iterate because you can see the better version, and you can\'t unsee it.\n\nYour work, when it finally ships, is excellent. The problem isn\'t quality—it\'s knowing when excellent becomes the enemy of done. You refine the pitch deck one more time. You rewrite the email again. You tweak the design just a little more. Each iteration feels productive, but somewhere along the way, "making it better" became a way to avoid the vulnerability of calling it finished.\n\nYou don\'t ship bad work. You ship almost nothing, because almost nothing feels ready. The world needs your craft—but it needs you to stop polishing and press send.',
  },
  strategist: {
    name: 'The Strategist',
    tagline: 'You see the system. Now press start before you see everything.',
    description:
      'You think in systems, not steps. Before you start, you need to see how the pieces connect—the architecture, the dependencies, the long-term implications. This is your superpower. While others build blindly, you design for coherence.\n\nBut here\'s where it gets tricky: understanding the full system can become a reason to never start building it. You research. You map. You analyze. You consider edge cases and second-order effects. All of this feels like progress—and intellectually, it is. But the plan is now so well-architected that actually executing it feels almost redundant.\n\nYou\'re not avoiding the work because it\'s hard. You\'re avoiding it because starting means accepting that you\'ll never have perfect information. The system will never be fully clear. And for you, that\'s harder than the work itself.',
  },
  visionary: {
    name: 'The Visionary',
    tagline: 'Ideas multiply beautifully. Shipping multiplies faster.',
    description:
      'You see possibilities others miss. While they execute on the obvious, you\'re three moves ahead, connecting dots that haven\'t been drawn yet. This is why people come to you for ideas. You generate momentum just by talking about what\'s possible.\n\nThe problem is you generate ideas faster than you close loops. You start the project, get excited about the next evolution, add features mid-build, and suddenly you\'re working on three different versions of the same thing. Or worse—you\'ve moved on to an entirely new idea because this one started feeling too defined, too constrained, too… done.\n\nYou don\'t lack follow-through because you\'re lazy. You lack it because finishing feels like killing the possibility of what it could still become. But the world doesn\'t need your best idea. It needs your finished idea.',
  },
  advocate: {
    name: 'The Advocate',
    tagline: 'Meaning matters most — but perfect meaning never comes.',
    description:
      'You don\'t just want to build things—you want to build things that matter. Your work has to connect to something larger: a mission, a community, a set of values you actually believe in. When it does, you\'ll work harder than anyone. When it doesn\'t, you can barely start.\n\nThis isn\'t entitlement. It\'s integrity. You physically can\'t bring yourself to execute on something that feels misaligned, extractive, or meaningless. Other people can compartmentalize. You can\'t. If the work doesn\'t serve something you care about, your body just… stops.\n\nThe challenge is that meaning isn\'t always clear upfront. Sometimes you have to ship version one to discover what version two should serve. But you stall in the uncertainty, waiting for the purpose to reveal itself—when the purpose might only become clear through the act of finishing.',
  },
  politician: {
    name: 'The Politician',
    tagline: 'You move mountains with people. Move anyway.',
    description:
      'You build through relationships. While others work in isolation, you energize through collaboration, feedback, and visibility. You\'re not performing—you\'re genuinely fueled by connection. Ideas become real when you talk them through. Execution feels possible when others are watching.\n\nThe flip side: when you\'re working alone, your momentum dies. The project that felt exciting in the team meeting becomes a slog at your desk. You tell yourself you\'ll get to it, but without an audience, without feedback, without someone to build with, the work just… sits there.\n\nYou\'re not dependent on validation—you\'re dependent on energy exchange. And in a world that romanticizes the solo grind, that can feel like a weakness. It\'s not. You just need to design your execution around how you\'re actually wired: ship with witnesses, build in public, make solo work social.',
  },
  empath: {
    name: 'The Empath',
    tagline: 'Depth is your gift — vulnerability is the delivery.',
    description:
      'You feel things others miss. You sense the emotional undercurrents in a room, the unspoken tension in a message, the weight of how your work might land. This makes you an incredible creator—your work has depth because you care deeply about how it affects people.\n\nBut that same sensitivity can become your prison. Shipping work means exposing it to judgment, and exposure feels like being unprotected. You can handle the work itself—it\'s the vulnerability of being seen that freezes you. So you delay. You soften. You hide behind "not ready yet" because not ready feels safer than not good enough.\n\nYou don\'t lack courage. You lack permission to ship something that might not land perfectly. But here\'s the truth: the people you\'re creating for would rather have your imperfect work than your protected silence.',
  },
  builder: {
    name: 'The Builder',
    tagline: 'Structure makes you strong. Build the scaffolding yourself.',
    description:
      'You\'re an execution machine—when the system is clear. Give you defined inputs, success criteria, and a process to follow, and you\'ll build it flawlessly. You don\'t need motivation; you need structure. Once you have it, you\'re unstoppable.\n\nThe problem is what happens when the structure isn\'t there. When the project is ambiguous, the inputs are messy, or the definition of "done" keeps shifting, you freeze. Not because you can\'t handle the work—but because you can\'t execute without knowing what "good" looks like.\n\nOther people can start messy and figure it out as they go. You need the rails before you can run. And in early-stage work, creative work, self-directed work—the rails don\'t exist yet. That\'s not a flaw in you. That\'s a mismatch between your wiring and the ask. You don\'t need to learn to be comfortable with ambiguity. You need to build the minimum structure required to start.',
  },
  stabilizer: {
    name: 'The Stabilizer',
    tagline: 'Clarity settles you — but you\'ll never have it all upfront.',
    description:
      'You\'re dependable. When the expectations are clear, you deliver—consistently, reliably, without drama. You don\'t need glory; you need clarity. Tell you what success looks like, and you\'ll get there.\n\nBut when things are unclear—when priorities shift, when the goalposts move, when you\'re expected to self-direct without guidance—you freeze. Not because you\'re incapable, but because ambiguity feels like walking into a test you didn\'t study for. You\'re not afraid of the work. You\'re afraid of doing it wrong.\n\nOther people seem comfortable just starting and figuring it out. For you, that feels reckless. So you wait for clarity that might never come. You hesitate. You check in too many times. You stall—not out of laziness, but out of a deep need to do it right.\n\nYou don\'t need to become comfortable with chaos. You need missions so clear that "right" is obvious.',
  },
};
