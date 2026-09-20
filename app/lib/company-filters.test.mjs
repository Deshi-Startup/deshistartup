import test from 'node:test'
import assert from 'node:assert/strict'
import {readCompanyFilters,companyFilterQuery,matchesCompany} from './company-filters.ts'
const company={name:'Agroshift',search:'Agricultural supply chain কৃষি',website:'https://agroshift.com',roles:['startup'],sector:'agriculture',startup50:true,caseStudy:'/en/case-studies/agroshift'}
test('combined company filters round-trip through profile return query',()=>{
 const query='?q=Agro&type=startup&sector=agriculture&ds50=1&case=1'
 assert.equal(companyFilterQuery(readCompanyFilters(query)),query)
 assert.equal(matchesCompany(company,readCompanyFilters(query)),true)
 assert.equal(matchesCompany(company,readCompanyFilters('?type=investor')),false)
 assert.equal(matchesCompany(company,readCompanyFilters('?q=কৃষি')),true)
 assert.equal(matchesCompany({...company,caseStudy:null},readCompanyFilters('?case=1')),false)
})
test('return query permits only known filter fields and bounds search text',()=>{
 assert.equal(companyFilterQuery(readCompanyFilters('?return=https://evil.example&x=1')),'')
 assert.equal(readCompanyFilters('?q='+ 'a'.repeat(1000)).q.length,120)
})
