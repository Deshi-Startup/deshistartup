'use client'

import type { Crepe } from '@milkdown/crepe'
import { editorViewCtx } from '@milkdown/kit/core'
import type { Node as ProseMirrorNode } from '@milkdown/kit/prose/model'
import type { NodeViewConstructor } from '@milkdown/kit/prose/view'
import { codeBlockSchema } from '@milkdown/kit/preset/commonmark'
import { $nodeSchema, $view } from '@milkdown/kit/utils'
import {
  ContributionVideo,
  fetchYouTubeMetadata,
  isVideoFenceNode,
  parseContributionVideoUrl,
  parseVideoFencePayload,
  videoFencePayload
} from './contribution-video'

function videoAttrs(video: ContributionVideo) {
  return {
    provider: video.provider,
    url: video.url,
    videoId: video.videoId || '',
    title: video.title,
    caption: video.caption || '',
    start: video.start || 0,
    date: video.date || '',
    locale: video.locale,
    thumbnail: video.thumbnail || '',
    uid: video.uid || '',
    loading: Boolean(video.loading)
  }
}

export const contributionVideoSchema = $nodeSchema('deshi_video', () => ({
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  isolating: true,
  marks: '',
  attrs: {
    provider: { default: 'youtube', validate: 'string' },
    url: { default: '', validate: 'string' },
    videoId: { default: '', validate: 'string' },
    title: { default: '', validate: 'string' },
    caption: { default: '', validate: 'string' },
    start: { default: 0, validate: 'number' },
    date: { default: '', validate: 'string' },
    locale: { default: 'bn', validate: 'string' },
    thumbnail: { default: '', validate: 'string' },
    uid: { default: '', validate: 'string' },
    loading: { default: false, validate: 'boolean' }
  },
  parseDOM: [
    {
      tag: 'div[data-type="deshi-video"]',
      getAttrs: (dom) => {
        if (!(dom instanceof HTMLElement)) return false
        const payload = dom.dataset.video
        const video = payload ? parseVideoFencePayload(payload) : null
        return video ? videoAttrs(video) : false
      }
    }
  ],
  toDOM: (node) => [
    'div',
    {
      'data-type': 'deshi-video',
      'data-video': videoFencePayload(node.attrs as ContributionVideo)
    }
  ],
  parseMarkdown: {
    match: isVideoFenceNode,
    runner: (state, node, type) => {
      const video = parseVideoFencePayload(String(node.value || ''))
      if (video) state.addNode(type, videoAttrs(video))
    }
  },
  toMarkdown: {
    match: (node) => node.type.name === 'deshi_video',
    runner: (state, node) => {
      state.addNode(
        'code',
        undefined,
        videoFencePayload(node.attrs as ContributionVideo),
        { lang: 'deshi-video' }
      )
    }
  }
}))

// CommonMark's code node otherwise claims every fenced block before the custom
// video node can inspect its language. Re-register the code schema after the
// video schema and explicitly leave deshi-video fences to the video block.
const contributionCodeBlockSchema = codeBlockSchema.extendSchema((previous) => (ctx) => {
  const schema = previous(ctx)
  return {
    ...schema,
    parseMarkdown: {
      ...schema.parseMarkdown,
      match: (node) =>
        schema.parseMarkdown.match(node) &&
        !(node.type === 'code' && node.lang === 'deshi-video')
    }
  }
})

function element<K extends keyof HTMLElementTagNameMap>(
  name: K,
  className?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(name)
  if (className) node.className = className
  return node
}

function playIcon(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 48 48')
  svg.setAttribute('aria-hidden', 'true')
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circle.setAttribute('cx', '24')
  circle.setAttribute('cy', '24')
  circle.setAttribute('r', '22')
  const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  triangle.setAttribute('d', 'M20 15.5 34 24 20 32.5Z')
  svg.append(circle, triangle)
  return svg
}

const contributionVideoView = $view(
  contributionVideoSchema.node,
  (): NodeViewConstructor => {
    return (initialNode, view, getPos) => {
      let currentNode: ProseMirrorNode = initialNode
      const dom = element('div', 'milkdown-video-block')
      dom.contentEditable = 'false'

      const frame = element('div', 'edit-video__frame')
      const poster = element('img', 'edit-video__poster')
      poster.alt = ''
      const emptyPoster = element('span', 'edit-video__empty-poster')
      const providerMark = element('span', 'edit-video__provider')
      const play = element('span', 'edit-video__play')
      play.append(playIcon())
      frame.append(poster, emptyPoster, providerMark, play)

      const fields = element('div', 'edit-video__fields')
      const titleLabel = element('label', 'edit-video__field')
      const titleName = element('span', 'edit-video__field-name')
      const titleInput = element('input', 'edit-video__title')
      titleInput.type = 'text'
      titleInput.maxLength = 300
      titleLabel.append(titleName, titleInput)

      const captionLabel = element('label', 'edit-video__field')
      const captionName = element('span', 'edit-video__field-name')
      const captionInput = element('input', 'edit-video__caption')
      captionInput.type = 'text'
      captionInput.maxLength = 500
      captionLabel.append(captionName, captionInput)

      const status = element('p', 'edit-video__status')
      status.setAttribute('aria-live', 'polite')

      const details = element('details', 'edit-video__details')
      const summary = element('summary')
      const detailsGrid = element('div', 'edit-video__details-grid')
      const startLabel = element('label')
      const startName = element('span')
      const startInput = element('input')
      startInput.type = 'number'
      startInput.min = '0'
      startInput.max = '86400'
      startInput.inputMode = 'numeric'
      startLabel.append(startName, startInput)
      const dateLabel = element('label')
      const dateName = element('span')
      const dateInput = element('input')
      dateInput.type = 'date'
      dateLabel.append(dateName, dateInput)
      detailsGrid.append(startLabel, dateLabel)
      details.append(summary, detailsGrid)

      const actions = element('div', 'edit-video__actions')
      const openLink = element('a', 'edit-video__action')
      openLink.target = '_blank'
      openLink.rel = 'noopener'
      const keepLink = element('button', 'edit-video__action')
      keepLink.type = 'button'
      const remove = element('button', 'edit-video__action is-remove')
      remove.type = 'button'
      actions.append(openLink, keepLink, remove)
      fields.append(titleLabel, captionLabel, status, details, actions)
      dom.append(frame, fields)

      const setAttr = (name: string, value: unknown) => {
        const pos = getPos()
        if (typeof pos !== 'number') return
        view.dispatch(
          view.state.tr
            .setNodeMarkup(pos, undefined, { ...currentNode.attrs, [name]: value })
            .scrollIntoView()
        )
      }

      titleInput.addEventListener('change', () => setAttr('title', titleInput.value.trim()))
      captionInput.addEventListener('change', () => setAttr('caption', captionInput.value.trim()))
      startInput.addEventListener('change', () => {
        const value = Math.max(0, Math.min(86_400, Number(startInput.value) || 0))
        setAttr('start', value)
      })
      dateInput.addEventListener('change', () => setAttr('date', dateInput.value))

      openLink.addEventListener('click', (event) => event.stopPropagation())
      keepLink.addEventListener('click', () => {
        const pos = getPos()
        if (typeof pos !== 'number') return
        const { schema } = view.state
        const link = schema.marks.link
        const marks = link ? [link.create({ href: currentNode.attrs.url })] : []
        const paragraph = schema.nodes.paragraph.create(
          undefined,
          schema.text(currentNode.attrs.url, marks)
        )
        view.dispatch(
          view.state.tr.replaceWith(pos, pos + currentNode.nodeSize, paragraph).scrollIntoView()
        )
        view.focus()
      })
      remove.addEventListener('click', () => {
        const pos = getPos()
        if (typeof pos !== 'number') return
        const { state } = view
        const transaction =
          state.doc.childCount === 1
            ? state.tr.replaceWith(
                pos,
                pos + currentNode.nodeSize,
                state.schema.nodes.paragraph.create()
              )
            : state.tr.delete(pos, pos + currentNode.nodeSize)
        view.dispatch(transaction.scrollIntoView())
        view.focus()
      })

      const render = (node: ProseMirrorNode) => {
        const isEn = node.attrs.locale === 'en'
        const isYouTube = node.attrs.provider === 'youtube'
        dom.dataset.provider = node.attrs.provider
        providerMark.textContent = isYouTube ? 'YouTube' : 'Facebook'
        emptyPoster.textContent = isYouTube ? 'YouTube' : 'f'
        poster.hidden = !node.attrs.thumbnail
        if (node.attrs.thumbnail) poster.src = node.attrs.thumbnail
        else poster.removeAttribute('src')

        titleName.textContent = isEn ? 'Video title' : 'ভিডিওর শিরোনাম'
        titleInput.value = node.attrs.title
        titleInput.placeholder = isEn ? 'Describe this video' : 'ভিডিওটি কী নিয়ে?'
        titleInput.setAttribute('aria-label', titleName.textContent)
        titleInput.toggleAttribute('aria-invalid', !node.attrs.title.trim())

        captionName.textContent = isEn ? 'Caption (optional)' : 'ক্যাপশন (ঐচ্ছিক)'
        captionInput.value = node.attrs.caption
        captionInput.placeholder = isEn
          ? 'Why is this useful here?'
          : 'এই ভিডিওটি এখানে কেন কাজে লাগবে?'
        captionInput.setAttribute('aria-label', captionName.textContent)

        status.textContent = node.attrs.loading
          ? isEn
            ? 'Getting the title from YouTube…'
            : 'YouTube থেকে শিরোনাম আনা হচ্ছে…'
          : isYouTube
            ? isEn
              ? 'You can change the title or add context before submitting.'
              : 'জমা দেওয়ার আগে শিরোনাম বদলাতে বা প্রসঙ্গ যোগ করতে পারেন।'
            : isEn
              ? 'Public Facebook videos can play here; private videos remain links.'
              : 'পাবলিক Facebook ভিডিও এখানে চলবে। প্রাইভেট ভিডিও লিংক হিসেবেই থাকবে।'

        summary.textContent = isEn ? 'More video details' : 'ভিডিওর আরও তথ্য'
        startLabel.hidden = !isYouTube
        startName.textContent = isEn ? 'Start at (seconds)' : 'কত সেকেন্ড থেকে শুরু হবে'
        startInput.value = node.attrs.start ? String(node.attrs.start) : ''
        dateName.textContent = isEn ? 'Upload date (if known)' : 'আপলোডের তারিখ (জানা থাকলে)'
        dateInput.value = node.attrs.date

        openLink.href = node.attrs.url
        openLink.textContent = isEn ? 'Open original' : 'আসল ভিডিও খুলুন'
        keepLink.textContent = isEn ? 'Keep as a link' : 'শুধু লিংক রাখুন'
        remove.textContent = isEn ? 'Remove video' : 'ভিডিওটি সরান'
      }

      render(initialNode)

      return {
        dom,
        update: (node) => {
          if (node.type !== currentNode.type) return false
          currentNode = node
          render(node)
          return true
        },
        selectNode: () => dom.setAttribute('data-selected', ''),
        deselectNode: () => dom.removeAttribute('data-selected'),
        stopEvent: (event) =>
          event.target instanceof Element &&
          Boolean(event.target.closest('input, button, a, summary, details')),
        ignoreMutation: () => true,
        destroy: () => dom.remove()
      }
    }
  }
)

export const contributionVideoPlugins = [
  ...contributionVideoSchema,
  ...contributionCodeBlockSchema,
  contributionVideoView
]

function uid(): string {
  return globalThis.crypto?.randomUUID?.() ||
    `video-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function updateVideoByUid(crepe: Crepe, videoUid: string, patch: Partial<ContributionVideo>) {
  try {
    crepe.editor.action((ctx) => {
      const view = ctx.get(editorViewCtx)
      let position = -1
      let target: ProseMirrorNode | null = null
      view.state.doc.descendants((node, pos) => {
        if (node.type.name === 'deshi_video' && node.attrs.uid === videoUid) {
          position = pos
          target = node
          return false
        }
        return true
      })
      if (position < 0 || !target) return
      view.dispatch(
        view.state.tr.setNodeMarkup(position, undefined, {
          ...(target as ProseMirrorNode).attrs,
          ...patch
        })
      )
    })
  } catch {
    // The editor may have closed while a metadata request was in flight.
  }
}

export function installContributionVideoPaste(
  crepe: Crepe,
  root: HTMLElement,
  locale: 'bn' | 'en'
): () => void {
  const onPaste = (event: ClipboardEvent) => {
    if (
      event.target instanceof Element &&
      event.target.closest('.milkdown-video-block, input, textarea')
    ) {
      return
    }
    const text = event.clipboardData?.getData('text/plain').trim() || ''
    if (!text || /\s/.test(text)) return
    const parsed = parseContributionVideoUrl(text, locale)
    if (!parsed) return

    let inserted = false
    const videoUid = uid()
    const video: ContributionVideo = { ...parsed, uid: videoUid }
    crepe.editor.action((ctx) => {
      const view = ctx.get(editorViewCtx)
      const { selection } = view.state
      const parent = selection.$from.parent
      if (
        !selection.empty ||
        selection.$from.depth !== 1 ||
        parent.type.name !== 'paragraph' ||
        parent.content.size !== 0
      ) {
        return
      }
      const node = contributionVideoSchema.type(ctx).create(videoAttrs(video))
      const from = selection.$from.before(1)
      const to = selection.$from.after(1)
      view.dispatch(view.state.tr.replaceWith(from, to, node).scrollIntoView())
      inserted = true
    })
    if (!inserted) return

    event.preventDefault()
    event.stopImmediatePropagation()
    if (video.provider === 'youtube') {
      void fetchYouTubeMetadata(video).then((metadata) =>
        updateVideoByUid(crepe, videoUid, metadata)
      )
    }
  }

  root.addEventListener('paste', onPaste, true)
  return () => root.removeEventListener('paste', onPaste, true)
}
