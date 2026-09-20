'use client'
import { useEffect, useState } from 'react'
import { companyFilterQuery, readCompanyFilters } from '../../lib/company-filters'
import { companyPath } from '../../lib/ecosystem-model'
import type { Locale } from './types'
import IdeaIcon from './IdeaIcon'
export default function CompanyBack({locale}:{locale:Locale}) {
  const [query,setQuery] = useState('')
  useEffect(()=>{ const value = new URLSearchParams(window.location.search).get('return'); if(value?.startsWith('?')) setQuery(companyFilterQuery(readCompanyFilters(value))) },[])
  return <a className="ideas-back" href={`${companyPath(locale)}${query}`}><IdeaIcon name="back"/>{locale==='en'?'All companies':'সব কোম্পানি'}</a>
}
