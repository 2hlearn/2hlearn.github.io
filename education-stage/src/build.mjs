import {inventoryAssets} from './assets.mjs';
import {assertNoSourceDocuments} from './public-scope.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import {validate,select,resolveCover,validateSite} from './model.mjs';

const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'dist');
const read=async p=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
const list=async dir=>Promise.all((await fs.readdir(path.join(root,dir))).filter(x=>x.endsWith('.json')).sort().map(x=>read(`${dir}/${x}`)));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md=new MarkdownIt({html:false,linkify:false});
await assertNoSourceDocuments(root);
const site=await read('content/site.json');
const courses=validate(await list('content/courses'),'courses'),articles=validate(await list('content/articles'),'articles');
const selection=select(courses,validateSite(site,courses,articles).programCover,site.featured),home=resolveCover(site,courses,articles);
const assets=await inventoryAssets(root);
await fs.rm(out,{recursive:true,force:true});
await fs.mkdir(out,{recursive:true});
for(const x of [...courses,...articles])if(x.thumbnail)await fs.access(path.join(root,x.thumbnail.slice(1)));
try{await fs.cp(path.join(root,'assets'),path.join(out,'assets'),{recursive:true})}catch(e){if(e.code!=='ENOENT')throw e;}

const logo='/assets/brand/2hcube-original-logo.png';
const url=(x,kind='courses')=>`/${kind==='courses'?'programs':'articles'}/${x.slug}/`;
const profile=`<a class="profile-link" href="${esc(site.inflearnProfile)}">인프런 프로필 보기</a>`;
const nav=`<header><a class="brand" href="/" aria-label="2HCUBE 홈"><img src="${logo}" alt="" width="46" height="46"><span>2HCUBE</span></a><nav aria-label="주요 메뉴"><a href="/about/">회사소개</a><a href="/programs/">교육프로그램</a><a href="/teams/">강사진</a><a href="/articles/">아티클</a></nav></header>`;
const currentYear=new Date().getFullYear();
const frame=(title,body)=>`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(title)} · 투에이치큐브</title><link rel="stylesheet" href="/style.css"></head><body><div class="stage">STAGING · 검토용 · 실제 모집 및 수강 신청 서비스가 아닙니다</div><div class="wrap">${nav}<main>${body}</main><footer>© 2015–<span data-current-year>${currentYear}</span> 2HCUBE Co., Ltd. · <a href="/contact/">문의</a> · <a href="${esc(site.inflearnProfile)}">인프런 프로필 보기</a></footer></div><script>document.querySelectorAll('[data-current-year]').forEach(element=>{element.textContent=String(new Date().getFullYear())});</script></body></html>`;
const write=async(route,title,body)=>{const dir=path.join(out,route);await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,'index.html'),frame(title,body))};
const preparing=x=>x.availability==='preparing';
const badge=x=>preparing(x)?'<span class="availability">인프런 공개 준비 중</span>':'';
const cover=(x,kind='courses')=>`<section class="cover"><div class="cover-copy"><small>COVER STORY</small><h2>${esc(x.title)}</h2><p class="subtitle">${esc(x.summary)}</p>${badge(x)}<a class="cover-link" href="${url(x,kind)}">${preparing(x)?'강의 준비 안내':'소개 보기'} →</a>${preparing(x)?profile:''}</div><div class="art${x.thumbnail?' has-image':''}">${x.thumbnail?`<img class="content-image" src="${esc(x.thumbnail)}" alt="${esc(x.thumbnailAlt)}">`:`<img class="brand-logo" src="${logo}" alt="2HCUBE 원본 로고" width="716" height="716">`}</div></section>`;
await write('','투에이치큐브',`<h1>투에이치큐브</h1><p class="intro">${esc(site.tagline)}</p>${cover(home,home.collection)}<section class="tiles"><a href="/about/"><small>01</small><h3>회사소개 ↗</h3><p>${esc(site.companySummary)}</p></a><a href="/programs/"><small>02</small><h3>교육프로그램 ↗</h3><p>첨단 AI 기술을 이해하고 적용하는 강의.</p></a><a href="/teams/"><small>03</small><h3>강사진소개 ↗</h3><p>${esc(site.leadSummary)}</p></a><a href="/softwalk/"><small>04</small><h3>소프트워크 ↗</h3><p>중장년 일자리 플랫폼. 기존 사이트에서 살펴보세요.</p></a></section>`);
const categoryLabel=x=>preparing(x)&&!x.category?'입문·개념':site.categories.find(c=>c.id===x.category)?.label||x.category;
const card=(x,kind='courses')=>`<article><small>${esc(categoryLabel(x))}</small><h3><a href="${url(x,kind)}">${esc(x.title)}</a></h3><p>${esc(x.summary)}</p>${badge(x)}</article>`;
await write('programs','교육프로그램',`<h1>교육프로그램</h1><p>하석재 대표의 AI·소프트웨어 강의 소개</p><nav class="filters">${site.categories.map(x=>`<a href="/programs/category/${x.id}/">${esc(x.label)}</a>`).join('')}</nav>${selection.cover?cover(selection.cover):''}<h2>Featured</h2><section class="featured">${selection.featured.map(x=>card(x)).join('')}</section><h2>더 살펴볼 과정</h2><section class="list">${selection.remaining.map(x=>card(x)).join('')}</section><p class="note">강의별 공개용 요약입니다. 현재 개설·모집 여부를 뜻하지 않습니다.</p>`);
for(const cat of site.categories)await write(`programs/category/${cat.id}`,cat.label,`<h1>${esc(cat.label)}</h1><p><a href="/programs/">전체 프로그램</a></p><section class="list">${courses.filter(x=>x.category===cat.id).map(x=>card(x)).join('')}</section>`);
const publicList=(title,items)=>items?.length?`<section><h2>${title}</h2><ul>${items.map(v=>`<li>${esc(v)}</li>`).join('')}</ul></section>`:'';
for(const x of courses){
  const metadata=x.instructor?`<p>강사: ${esc(x.instructor)}</p>`:'';
  const audience=x.audience?.trim()?`<section><h2>학습 대상</h2><p>${esc(x.audience)}</p></section>`:'';
  const illustration=x.thumbnail?`<img class="course-art" src="${esc(x.thumbnail)}" alt="${esc(x.thumbnailAlt)}">`:'';
  const notice=preparing(x)?`${badge(x)}<p>강의 소개를 준비하고 있습니다.</p>${profile}`:'<p class="note">강의 소개 요약 · 개설·모집 여부 미확인</p>';
  await write(`programs/${x.slug}`,x.title,`<div class="course-intro"><p><a href="/programs/">← 교육프로그램</a></p><h1>${esc(x.title)}</h1><p class="subtitle">${esc(x.summary)}</p>${illustration}${notice}${metadata}${audience}${publicList('얻는 결과',x.outcomes)}${publicList('핵심 주제',x.publicTopics)}${x.enrollmentUrl?`<a href="${esc(x.enrollmentUrl)}">검증된 외부 강의 안내</a>`:''}</div>`);
}
await write('articles','아티클',`<h1>아티클</h1><p>AI 교육 동향, 기고와 제안</p>${articles.length?articles.map(x=>card(x,'articles')).join(''):'<p>공개된 글이 아직 없습니다.</p>'}`);
for(const x of articles)await write(`articles/${x.slug}`,x.title,`<h1>${esc(x.title)}</h1>${md.render(x.body||'')}${x.sourceUrl?`<p><a href="${esc(x.sourceUrl)}">원문 보기</a></p>`:''}`);
for(const name of ['about','teams','contact']){
  let text=await fs.readFile(path.join(root,'reference',name+'.md'),'utf8');
  text=text.replace(/^---[\s\S]*?---\s*/,'').replace(/<nav[\s\S]*?<\/nav>/,'').replace(/\]\((about|teams|programs|contact)\.md\)/g,'](/$1/)');
  await write(name,name==='about'?'회사소개':name==='teams'?'강사진':'문의',`<p class="note">기존 공개 사이트 소개를 보존한 검토본입니다. 최신 이력·회사 방향은 편집 검토 예정입니다.</p>${md.render(text)}`);
}
await write('softwalk','소프트워크',`<h1>소프트워크</h1><p>중장년 일자리 플랫폼은 별도 사이트로 확장할 예정입니다.</p><a href="https://www.2hcube.com/softwalk/">현재 소프트워크 사이트 보기 →</a><p class="note">운영 도메인 전환 전, 기존 /softwalk/ 하위 경로의 전체 매핑과 별도 배포가 필요합니다.</p>`);
await write('admin','CMS 준비',`<h1>CMS 연결 준비 중</h1><p>실제 인증·저장·발행은 연결하지 않았습니다.</p><p class="note">공개 가능한 소개 요약만 작성하세요. 상세 시간표·실습·과제·코드·교안·원본 파일과 다운로드 링크는 넣지 않습니다. draft는 비밀 보관 기능이 아닙니다.</p>`);
await fs.copyFile(path.join(root,'src/style.css'),path.join(out,'style.css'));
await fs.writeFile(path.join(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
await fs.writeFile(path.join(out,'_headers'),'/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
await fs.writeFile(path.join(out,'build-manifest.json'),JSON.stringify({assets,courses:courses.length,articles:articles.length,cms:'disabled',analytics:false,source:await read('PROVENANCE.json')},null,2));
console.log(`Built ${courses.length} courses, ${articles.length} articles; CMS disabled; no analytics`);
