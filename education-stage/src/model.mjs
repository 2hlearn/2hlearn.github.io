import { selectHomeStories } from '../vendor/bakkat/scripts/home-selections.mjs';
export function safeSlug(s){return typeof s==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)}
export function safeHttps(s){if(s===undefined||s==='')return true;if(typeof s!=='string'||/[\x00-\x20\\]/.test(s))return false;try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false}}
export function safeThumbnail(s){return typeof s==='string'&&/^\/assets\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp|avif)$/i.test(s)}
export function validate(items,kind){
  if(!Array.isArray(items)||!['courses','articles'].includes(kind))throw Error('Invalid collection');
  const seen=new Set();
  for(const x of items){
    if(!x||!safeSlug(x.slug)||seen.has(x.slug))throw Error('Invalid or duplicate slug');
    seen.add(x.slug);
    if(typeof x.title!=='string'||!x.title.trim()||typeof x.summary!=='string'||!x.summary.trim()||!['draft','published'].includes(x.status))throw Error('Missing required field');
    if(kind==='courses'){
      const allowed=new Set(['slug','title','summary','status','category','instructor','availability','enrollmentUrl','thumbnail','thumbnailAlt','audience','outcomes','publicTopics']);
      if(Object.keys(x).some(key=>!allowed.has(key)))throw Error('Only public course summary fields are allowed, including drafts');
      if(x.title.length>120||x.summary.length>180)throw Error('Public course introduction is too long');
      if(x.audience!==undefined&&(typeof x.audience!=='string'||x.audience.length>120))throw Error('Invalid public audience');
      if(x.outcomes!==undefined&&(!Array.isArray(x.outcomes)||x.outcomes.length>2||x.outcomes.some(v=>typeof v!=='string'||!v.trim()||v.length>100)))throw Error('Public outcomes must be short and at most two');
      if(x.publicTopics!==undefined&&(!Array.isArray(x.publicTopics)||x.publicTopics.length<2||x.publicTopics.length>3||x.publicTopics.some(v=>typeof v!=='string'||!v.trim()||v.length>60||/[\r\n]|https?:|```/.test(v))))throw Error('Use only two or three short public topics');
      if(x.availability!==undefined&&!['reference','preparing'].includes(x.availability))throw Error('Invalid course availability');
      const preparing=x.availability==='preparing';
      if((!preparing||x.category!==undefined)&&!['service','model'].includes(x.category))throw Error('Invalid course category');
      if(preparing&&x.enrollmentUrl)throw Error('Preparing course cannot have an enrollment URL');
    }
    if(!safeHttps(x.enrollmentUrl)||!safeHttps(x.sourceUrl))throw Error('Invalid external URL');
    for(const link of [x.enrollmentUrl,x.sourceUrl])if(link&&/\.(?:hwpx?|pdf|docx?|pptx?|zip|rar|7z)(?:[?#]|$)/i.test(link))throw Error('Source document download links are not allowed');
    if(x.thumbnail!==undefined&&x.thumbnail!==''&&(!safeThumbnail(x.thumbnail)||typeof x.thumbnailAlt!=='string'||!x.thumbnailAlt.trim()))throw Error('Invalid thumbnail');
  }
  return items.filter(x=>x.status==='published');
}
export function select(items,cover,featured=[]){if(!safeSlug(cover)||!Array.isArray(featured)||featured.some(x=>!safeSlug(x)))throw Error('Invalid selection types');const r=selectHomeStories(items,{layout:'magazine',selection:{coverStory:cover,featured}});return {cover:r.coverStory,featured:r.featuredStories,remaining:r.remainingStories}}
export function resolveCover(site,courses,articles){const r=site?.homeCover;if(!r||!['courses','articles'].includes(r.collection)||!safeSlug(r.slug))throw Error('Invalid home reference');const item=(r.collection==='courses'?courses:articles).find(x=>x.slug===r.slug&&x.status==='published');if(!item)throw Error('Missing or draft home cover');return {...item,collection:r.collection}}
export function validateSite(site,courses,articles){if(!site||!safeHttps(site.inflearnProfile)||!site.inflearnProfile)throw Error('Invalid site');if(!Array.isArray(site.categories)||site.categories.length!==2||new Set(site.categories.map(x=>x.id)).size!==2||site.categories.some(x=>!['service','model'].includes(x.id)||typeof x.label!=='string'||!x.label.trim()))throw Error('Invalid categories');resolveCover(site,courses,articles);select(courses,site.programCover,site.featured);return site}
