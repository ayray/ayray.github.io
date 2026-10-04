// Who Raymond is and what he does, in the order the site presents it (PORTFOLIO DEC-011):
// 1. Raymond as a person; 2. what he makes (projects, from the content collection); 3. his professional foundation;
// 4. what he is doing now. A job title is context, never identity: it appears only inside the Background text and in
// the About record. Each piece lists the claim register IDs it rests on.

export const identity = {
  lines: ["I'm Raymond Sy.", 'I make things.'],
  claims: ['CLM-062'],
};

export const now = [
  { label: 'Professionally', text: 'Building software since 2017, across engineering, product, and systems.', claims: ['CLM-063'] },
  { label: 'Independently', text: 'Currently building', link: { label: 'rbrain', href: '/projects/rbrain/' }, claims: ['CLM-064'] },
];

export const background = {
  text: 'Software engineering is my foundation. I have built software professionally since 2017: testing, automation, '
    + 'and systems work at TechnipFMC, then full-stack product work at Chargie, where my role grew into feature ownership, '
    + 'release delivery, and helping decide what should be built. Most recently that has included security and '
    + 'compliance, as a DevSecOps Engineer at Chargie.',
  claims: ['CLM-065'],
};

export const about = {
  opening: "I'm Raymond Sy. I make things. So far that has mostly meant software: professionally since 2017, and "
    + 'independently with rbrain.',
  path: 'Software engineering is my professional foundation. I started in testing, automation, scalability, and systems '
    + 'work at TechnipFMC. At Chargie, my role grew from implementing technical requirements to helping decide what '
    + 'should be built, how it should work, how it should be scoped, and how people should experience it. I also served '
    + 'as the primary release engineer. Since July 2026, my primary focus has been security and compliance.',
  themes: 'My work tends to return to a few problems: removing friction from real-world journeys, turning ambiguous '
    + 'system behavior into fair product rules, taking ownership of difficult delivery problems, and using AI to '
    + 'accelerate work without handing over judgment.',
  // Raymond's own wording, kept exactly as cleared (the only em dash permitted in page copy).
  stance: 'I build software for the messy part—where product decisions meet real-world systems and failure has consequences.',
  claims: ['CLM-066', 'CLM-067', 'CLM-068', 'CLM-030'],
};

// Formal titles as held, with exact dates (CLM-055, CLM-002, CLM-003).
export const record = {
  rows: [
    { org: 'Chargie', roles: [{ title: 'DevSecOps Engineer', when: 'July 2026 to present' }, { title: 'Software Engineer', when: 'March 2022 to April 2026' }] },
    { org: 'TechnipFMC', roles: [{ title: 'Software Engineer, intern then full-time', when: 'January 2017 to November 2021' }] },
    { org: 'UC Irvine', roles: [{ title: 'B.S. Computer Science', when: 'December 2018' }] },
  ],
  claims: ['CLM-055', 'CLM-002', 'CLM-003'],
};

export const projectsIntro = { text: 'What I make on my own, outside any employer.', claims: ['CLM-069'] };
