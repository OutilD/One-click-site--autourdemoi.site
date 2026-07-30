import { businesses } from './businesses'
import { buildPosts } from './factories'
import type { Post } from '@/types'

/** Publications (Google Posts) de démonstration, dérivées des fiches. */
export const posts: Post[] = businesses.flatMap(buildPosts)

export const postsByBusinessId: ReadonlyMap<string, Post[]> = posts.reduce((map, post) => {
  const existing = map.get(post.businessId)
  if (existing) existing.push(post)
  else map.set(post.businessId, [post])
  return map
}, new Map<string, Post[]>())
