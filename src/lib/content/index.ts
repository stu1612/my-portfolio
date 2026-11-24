// The only module that imports the generated content. Pages and components
// read content through these functions (lint-enforced), so swapping the
// source later (a CMS, say) changes this folder and nothing else.
import { allCaseStudies, allNows, allPosts } from "content-collections";
import type { CaseStudy, Now, Post } from "content-collections";
import {
  assertSingle,
  isPublished,
  sortCaseStudies,
  sortPosts,
} from "./derive";

export type { CaseStudy, Now, Post };

// Read per call so tests can switch the environment.
const isProduction = () => process.env.NODE_ENV === "production";

/** Case studies in index order. Drafts are left out of production. */
export function getCaseStudies(): CaseStudy[] {
  return sortCaseStudies(
    allCaseStudies.filter((entry) => isPublished(entry, isProduction())),
  );
}

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return getCaseStudies().find((entry) => entry.slug === slug);
}

/** Posts, newest first. Drafts are left out of production. */
export function getPosts(): Post[] {
  return sortPosts(
    allPosts.filter((entry) => isPublished(entry, isProduction())),
  );
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((entry) => entry.slug === slug);
}

/** The Now entry, or undefined while it is a draft in production. */
export function getNow(): Now | undefined {
  const entry = assertSingle(allNows, "now");
  return isPublished(entry, isProduction()) ? entry : undefined;
}
