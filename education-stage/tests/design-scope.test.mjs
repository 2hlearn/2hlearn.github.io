import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {validate} from '../src/model.mjs';
import {assertNoSourceDocuments} from '../src/public-scope.mjs';

const root=new URL('../',import.meta.url);
const read=async p=>fs.readFile(new URL(p,root),'utf8');
const preparing={slug:'llm-study-guide',title:'LLM 공부의 정석',summary:'LLM은 어떻게 동작하는가',status:'published',availability:'preparing'};

test('preparing course accepts only confirmed fields and no enrollment URL',()=>{
  assert.equal(validate([preparing],'courses').length,1);
  assert.throws(()=>validate([{...preparing,enrollmentUrl:'https://example.com/buy'}],'courses'),/Preparing/);
  assert.throws(()=>validate([{...preparing,availability:'open'}],'courses'),/availability/);
});
test('public course model rejects original detail fields even in draft',()=>{
  for(const status of ['draft','published'])for(const key of ['body','curriculum','referenceSchedule','duration','hours','difficulty','sourceFile','downloadUrl','assignments','code']){
    assert.throws(()=>validate([{...preparing,status,[key]:'private detail'}],'courses'),/public course summary/);
  }
  for(const patch of [{summary:'x'.repeat(181)},{publicTopics:['one']},{publicTopics:['a','b','c','d']},{publicTopics:['a','https://example.com/file.hwp']},{outcomes:['a','b','c']}])assert.throws(()=>validate([{...preparing,...patch}],'courses'));
});
test('source originals are rejected from any source directory',async()=>{
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'education-public-scope-'));
  try{await fs.mkdir(path.join(temp,'drafts'));await fs.writeFile(path.join(temp,'drafts','original.hwp'),'');await assert.rejects(assertNoSourceDocuments(temp),/source documents/)}finally{await fs.rm(temp,{recursive:true,force:true})}
});
test('home cover and preparation page use supplied titles without invented detail or purchase action',async()=>{
  const home=await read('dist/index.html');
  assert.match(home,/LLM 공부의 정석/);assert.match(home,/LLM은 어떻게 동작하는가/);assert.match(home,/인프런 공개 준비 중/);
  const detail=await read('dist/programs/llm-study-guide/index.html');
  assert.match(detail,/인프런 프로필 보기/);assert.match(detail,/https:\/\/www\.inflearn\.com\/users\/1695432\/@2hcube/);
  const main=detail.match(/<main>([\s\S]*?)<\/main>/)[1];
  assert.doesNotMatch(main,/강사:|참고 일정:|미정|21시간|난이도|수강 신청|구매|강의 신청|커리큘럼|학습 대상|얻는 결과|핵심 주제/);
  assert.doesNotMatch(detail,/<button|<form/);
});
test('all seven course records are summary-only; existing six expose at most three topics',async()=>{
  const names=await fs.readdir(new URL('content/courses/',root));assert.equal(names.length,7);
  for(const name of names){const course=JSON.parse(await read('content/courses/'+name));validate([course],'courses');assert.equal('body' in course,false);assert.equal('referenceSchedule' in course,false);if(course.availability!=='preparing')assert.ok(course.publicTopics.length>=2&&course.publicTopics.length<=3);const html=await read('dist/programs/'+course.slug+'/index.html');assert.doesNotMatch(html,/일차|시간표|실습 순서|과제|교안|\.hwpx?|\.docx?|\.pptx?|\.pdf|download=/i)}
});
test('CMS example exposes public summaries and warns that drafts are public source',async()=>{
  const config=JSON.parse(await read('cms-config.example.json'));
  for(const collection of config.collections.filter(x=>x.folder))assert.match(collection.description,/draft도 공개 저장소/);
  const fields=config.collections.find(x=>x.name==='courses').fields;
  assert.equal(fields.some(x=>['body','referenceSchedule','prerequisites'].includes(x.name)),false);
  assert.equal(fields.find(x=>x.name==='publicTopics').max,3);
  assert.match(fields.find(x=>x.name==='status').hint,/비밀 보관 기능이 아닙니다/);
});
test('original logo bytes are preserved in source and published assets',async()=>{
  for(const p of ['assets/brand/2hcube-original-logo.png','dist/assets/brand/2hcube-original-logo.png'])assert.equal(crypto.createHash('sha256').update(await fs.readFile(new URL(p,root))).digest('hex'),'04f81623c65f7e10e80921358e87d8dfffcb86bc150c6fbea6f2779e169e5b33');
});
const luminance=hex=>hex.match(/[a-f\d]{2}/ig).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>{const [low,high]=[luminance(a),luminance(b)].sort((a,b)=>a-b);return(high+.05)/(low+.05)};
test('text color pairs and every sampled accent gradient color exceed 4.5 to 1',async()=>{
  const css=await read('src/style.css');const colors=Object.fromEntries([...css.matchAll(/--([a-z]+):(#[A-Fa-f\d]{6})/g)].map(x=>[x[1],x[2]]));
  for(const [a,b] of [['ink','white'],['ink','paper'],['muted','white'],['muted','paper'],['navy','white'],['white','navy'],['ink','gold'],['ink','coral']])assert.ok(ratio(colors[a],colors[b])>=4.5,a+'/'+b);
  const rgb=h=>h.match(/[a-f\d]{2}/ig).map(v=>parseInt(v,16));const start=rgb(colors.gold),end=rgb(colors.coral);
  for(let n=0;n<=100;n++){const color='#'+start.map((v,i)=>Math.round(v+(end[i]-v)*n/100).toString(16).padStart(2,'0')).join('');assert.ok(ratio(colors.ink,color)>=4.5,'gradient '+n)}
  assert.ok(ratio(colors.white,colors.gold)<4.5);assert.ok(ratio(colors.white,colors.coral)<4.5);
});
