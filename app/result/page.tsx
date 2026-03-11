import { ResultView } from "@/components/result/result-view";

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ style?: string }>;
}) {
  const params = await searchParams;
  return <ResultView styleId={params.style ?? ""} />;
}
