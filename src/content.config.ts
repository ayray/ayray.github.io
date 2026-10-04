import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Content model (PORTFOLIO DEC-009 as amended 2026-10-04). Projects hold Raymond's independent and personal work only;
// a project's medium is its `kind`, not a new collection. Employer work is not a collection. A new collection is added
// only when Raymond supplies content a project entry cannot hold.

const claimId = z.string().regex(/^CLM-\d{3}$/);

// One source definition per diagram. Horizontal diagrams lay out in a row only when their container fits the whole row.
const node = z.object({
  text: z.string(),
  note: z.string().optional(),        // mono qualifier
  kind: z.enum(['step', 'actor', 'gate']).default('step'),
  fail: z.string().optional(),        // a handled failure path (dashed accent)
  cond: z.string().optional(),        // a path that exists only with approval (dashed ink, gate edge)
});
const diagram = z.object({
  label: z.string(),                  // accessible name
  caption: z.string().optional(),
  orientation: z.enum(['horizontal', 'vertical']).default('horizontal'),
  nodes: z.array(node).min(2).max(7), // complexity limit from the design system
});

const note = z.object({ label: z.string(), text: z.string() });
const block = z.discriminatedUnion('type', [
  z.object({ type: z.literal('p'), text: z.string() }),
  z.object({ type: z.literal('diagram'), diagram }),
  z.object({
    type: z.literal('registers'),
    left: z.object({ title: z.string(), items: z.array(z.string()) }),
    right: z.object({ title: z.string(), items: z.array(z.string()) }),
  }),
  z.object({ type: z.literal('tradeoffs'), items: z.array(z.object({ term: z.string(), description: z.string() })) }),
]);
const section = z.object({
  label: z.string(),
  heading: z.string(),
  blocks: z.array(block),
  notes: z.array(note).default([]),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),                                  // one line, used everywhere the project is named
    excerpt: z.string(),                                  // two or three sentences for home and /projects/
    order: z.number(),
    kind: z.string(),
    status: z.string(),
    whatItIs: z.string().optional(),
    builtWith: z.string().optional(),                     // omitted while public tool naming is held in the claim register
    links: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]), // public links only
    homeFigure: diagram.optional(),                       // the figure beside the entry on the home page
    object: z.array(z.object({ lead: z.string().optional(), diagram })).min(1).max(2).optional(), // /projects/
    headerObject: diagram.optional(),                     // the project page header
    claims: z.array(claimId).default([]),                 // claims used on the project page
    cardClaims: z.array(claimId).default([]),             // claims used where the project is listed (home, /projects/)
    sections: z.array(section),
    pull: z.object({ text: z.string(), after: z.number() }).optional(),   // at most one per page
  }),
});

export const collections = { projects };
