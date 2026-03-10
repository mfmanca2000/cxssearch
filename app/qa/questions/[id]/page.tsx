import { QuestionDetail } from '@/components/qa/QuestionDetail'

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <QuestionDetail id={id} />
}
