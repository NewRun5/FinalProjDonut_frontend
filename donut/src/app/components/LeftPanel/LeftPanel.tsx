import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

export default function LeftContent({ markdownData }: { markdownData: string }) {
  return (
    <div className="left-content">
      <ReactMarkdown 
        children={markdownData} 
        rehypePlugins={[rehypeRaw]} 
        remarkPlugins={[remarkGfm]} 
      />
    </div>
  );
}
