import {
  defineCollections,
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import { z } from "zod";
import { transformerTwoslash } from "fumadocs-twoslash";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import {
  transformerRemoveNotationEscape,
  transformerNotationHighlight,
  transformerNotationFocus,
  transformerMetaHighlight,
} from "@shikijs/transformers";
import { remarkInstall } from "fumadocs-docgen";
import { remarkMermaid } from "@theguild/remark-mermaid";

import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";

// This file is used to configure the FumaDocs source.
export const { docs, meta } = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema,
  },
  meta: {
    schema: metaSchema,
  },
});

export const blog = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: frontmatterSchema.extend({
    author: z.string(),
    date: z
      .string()
      .or(z.date())
      .transform((value, context) => {
        try {
          return new Date(value);
        } catch {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid date",
          });
          return z.NEVER;
        }
      }),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    draft: z.boolean().optional().default(false),
    series: z.string().optional(),
    seriesPart: z.number().optional(),
  }),
});

export default defineConfig({
  lastModifiedTime: "git",
  mdxOptions: {
    providerImportSource: "@/mdx-components",
    rehypeCodeOptions: {
      inline: "tailing-curly-colon",
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerTwoslash(),
        transformerRemoveNotationEscape(),
        transformerNotationFocus(),
        transformerMetaHighlight(),
      ],
    },
    remarkPlugins: [remarkMath, remarkInstall, remarkMermaid],
    rehypePlugins: (v) => [rehypeKatex, ...v],
  },
});
