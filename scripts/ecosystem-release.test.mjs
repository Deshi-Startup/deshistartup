import test from 'node:test'
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {storeDraftRelease} from './lib/ecosystem-release.mjs'
const require=createRequire(import.meta.resolve('wrangler'))
const {Miniflare,convertV4MiniflareOptions}=require('miniflare')
test('large bilingual release round-trips through bounded D1 statements; interrupted drafts stay unsealed',async t=>{
 const options={modules:true,script:'',d1Databases:{DB:'release-chunks'}}
 const mf=new Miniflare(convertV4MiniflareOptions?convertV4MiniflareOptions(options):options);t.after(()=>mf.dispose());const db=await mf.getD1Database('DB')
 await db.prepare('CREATE TABLE releases (id TEXT PRIMARY KEY,snapshot_json TEXT CHECK(json_valid(snapshot_json)),digest TEXT,created_at TEXT)').run()
 const query=async sql=>{assert.ok(Buffer.byteLength(sql)<100000);return (await db.prepare(sql).all()).results}
 const json=JSON.stringify({copy:"বাংলাদেশ's companies 😀 ".repeat(15000)})
 await storeDraftRelease(query,{id:'large',json,digest:'digest',createdAt:'2026-09-20'})
 assert.deepEqual(await db.prepare("SELECT snapshot_json,digest FROM releases WHERE id='large'").first(),{snapshot_json:json,digest:'digest'})
 let count=0
 await assert.rejects(storeDraftRelease(sql=>{if(++count===3)throw new Error('interrupted');return query(sql)},{id:'failed',json,digest:'must-not-seal',createdAt:'2026-09-20'}),/interrupted/)
 assert.equal((await db.prepare("SELECT digest FROM releases WHERE id='failed'").first()).digest,'')
})
