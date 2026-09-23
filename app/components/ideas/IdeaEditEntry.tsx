'use client'

import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'
import type { IdeaEditField } from '../../lib/idea-edit'
import type { Locale } from './types'

const IdeaEditForm = dynamic(() => import('./IdeaEditForm'), { ssr: false })

export interface IdeaEditEntryProps {
  locale: Locale; ideaId: string; title: string; releaseId: string;
  initial: Record<IdeaEditField, string>
}

export default function IdeaEditEntry(props: IdeaEditEntryProps) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const en = props.locale === 'en'
  return <section className="idea-edit-entry" aria-label={en ? 'Improve this idea' : 'আইডিয়াটি আরও ভালো করুন'}>
    {!open && <button ref={trigger} type="button" className="ideas-text-button" onClick={() => setOpen(true)}>{en ? 'Edit this idea' : 'আইডিয়াটি এডিট করুন'}</button>}
    {open && <IdeaEditForm {...props} onClose={() => { setOpen(false); requestAnimationFrame(() => trigger.current?.focus()) }} />}
  </section>
}
