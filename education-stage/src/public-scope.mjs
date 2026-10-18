import fs from 'node:fs/promises';
import path from 'node:path';

// These originals must never enter this public source tree, even as drafts.
export async function assertNoSourceDocuments(root){
  async function walk(dir){
    for(const entry of await fs.readdir(dir,{withFileTypes:true})){
      if(['node_modules','dist','.git'].includes(entry.name))continue;
      const file=path.join(dir,entry.name);
      if(entry.isDirectory())await walk(file);
      else if(/\.(?:hwpx?|pdf|docx?|pptx?|zip|rar|7z)$/i.test(entry.name))throw Error('Private source documents are not allowed in public source: '+path.relative(root,file));
    }
  }
  await walk(root);
}
