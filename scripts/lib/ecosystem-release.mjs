const quote = value => "'" + String(value).replaceAll("'", "''") + "'"
/** Unpublished draft writes stay below D1's per-statement size limit. */
export async function storeDraftRelease(query, {id,json,digest,createdAt}) {
  // A JSON string keeps json_valid true while the draft is incomplete.
  await query(`INSERT INTO releases (id, snapshot_json, digest, created_at) VALUES (${quote(id)}, '\"\"', '', ${quote(createdAt)})`)
  const characters = Array.from(json)
  for(let offset=0;offset<characters.length;offset+=6000) {
    const chunk = characters.slice(offset,offset+6000).join('')
    await query(`UPDATE releases SET snapshot_json = json_quote(json_extract(snapshot_json, '$') || ${quote(chunk)}) WHERE id = ${quote(id)} AND digest = ''`)
  }
  const stored = (await query(`SELECT snapshot_json FROM releases WHERE id = ${quote(id)}`))[0]
  if(JSON.parse(stored?.snapshot_json || 'null') !== json) throw new Error('Incomplete draft release; no public artifact was changed.')
  // Final content and digest become publishable together; never touch publication.
  await query(`UPDATE releases SET snapshot_json = json_extract(snapshot_json, '$'), digest = ${quote(digest)} WHERE id = ${quote(id)} AND digest = ''`)
}
