export async function shareMeme(meme) {
  const shareData = { title: meme.title, url: `${window.location.origin}/meme/${meme.id}` }
  if (navigator.share) {
    await navigator.share(shareData)
    return 'shared'
  }
  await navigator.clipboard.writeText(shareData.url)
  return 'copied'
}
