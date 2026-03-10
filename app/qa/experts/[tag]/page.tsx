import { ExpertsByTag } from '@/components/qa/ExpertsByTag'

export default async function ExpertsByTagPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  return <ExpertsByTag tag={decodeURIComponent(tag)} />
}
