import { validateSelection } from '../src/admin/home-curation.js';

export function selectHomeStories(posts, curation) {
  if (curation?.layout !== 'magazine') throw new Error('홈페이지 배치는 magazine만 지원합니다. 매거진 편성 파일을 확인하세요.');
  const errors = validateSelection(curation.selection, posts);
  if (errors.length) throw new Error(`매거진 편성: ${errors.join(' ')}`);
  const bySlug = new Map(posts.map(post => [post.slug, post]));
  const { coverStory: coverSlug, featured } = curation.selection;
  const selected = new Set([coverSlug, ...featured]);
  const remainingStories = posts.filter(post => !selected.has(post.slug));
  return {
    coverStory: bySlug.get(coverSlug),
    featuredStories: featured.map(slug => bySlug.get(slug)),
    remainingStories,
    latestStories: remainingStories.slice(0, 6)
  };
}
