// Shared by the editor and build. Legacy post flags are never selection input.
import { isValidPostSlug } from './post-id.js';

export const MAX_FEATURED = 3;

export function validateSelection(selection, posts) {
  const errors = [];
  if (!selection || typeof selection !== 'object' || Array.isArray(selection)) {
    return ['바깥 Site → 매거진 편성에서 Cover Story와 Featured를 저장하세요.'];
  }
  const { coverStory, featured } = selection;
  if (!isValidPostSlug(coverStory)) {
    errors.push('Cover Story는 공개 글 한 편을 반드시 선택하세요.');
  }
  if (!Array.isArray(featured)) return [...errors, 'Featured는 순서 있는 글 목록이어야 합니다.'];
  if (featured.length > MAX_FEATURED) errors.push(`Featured는 최대 ${MAX_FEATURED}편입니다. 기존 항목을 교체하거나 제거하세요.`);
  const seen = new Set();
  for (const slug of featured) {
    if (!isValidPostSlug(slug)) errors.push('Featured에 유효한 글을 선택하세요.');
    if (seen.has(slug)) errors.push(`Featured에 ${slug} 글이 중복됐습니다. 중복 항목을 제거하세요.`);
    if (slug === coverStory) errors.push('Cover Story와 Featured에 같은 글을 선택할 수 없습니다.');
    seen.add(slug);
  }
  if (posts) {
    const publicSlugs = new Set(posts.filter(post => post.status === 'published').map(post => post.slug));
    for (const slug of new Set([coverStory, ...featured].filter(Boolean))) {
      if (!publicSlugs.has(slug)) errors.push(`${slug}: 공개 글을 찾을 수 없습니다. 글을 공개 상태로 복구하거나 바깥 Site → 매거진 편성에서 다른 공개 글로 교체하세요.`);
    }
  }
  return errors;
}

export function replaceCover(selection, coverStory) {
  return { ...selection, coverStory, featured: (Array.isArray(selection.featured) ? selection.featured : []).filter(slug => slug !== coverStory) };
}
