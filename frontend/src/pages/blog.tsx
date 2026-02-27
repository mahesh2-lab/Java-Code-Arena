import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

const BlogPage = () => {
  return (
    <article className="prose prose-slate mx-auto p-6 prose-headings:mt-6 prose-headings:mb-2 prose-code:bg-slate-900 prose-code:text-slate-200 prose-code:p-1 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-200 prose-pre:p-4 prose-pre:rounded">
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
      />
    </article>
  );
// BlogPage component removed. Blog routing handled by backend.
export default null;
