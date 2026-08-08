import { getDocsData } from './docs-data';
import { DocsClient } from './DocsClient';

// Statically rendered at build time — reads the markdown source under docs/.
export default function DocsPage() {
  const data = getDocsData();
  return <DocsClient data={data} />;
}
