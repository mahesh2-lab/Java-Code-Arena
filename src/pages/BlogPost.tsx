import React, { useEffect, useState } from "react";
import { useRoute } from "wouter";
import ReactMarkdown from "react-markdown";

export default function BlogPost() {
  const [match, params] = useRoute("/blog/:slug");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.slug) return;
    setLoading(true);
    setError("");
    fetch(`/blog/${params.slug}.md`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.text();
      })
      .then(setContent)
      .catch(() => setError("Blog post not found."))
      .finally(() => setLoading(false));
  }, [params?.slug]);

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ padding: 32, color: "red" }}>{error}</div>;
  return (
    <div
      style={{
        maxWidth: 800,
        margin: "40px auto",
        padding: 24,
        background: "#18181b",
        color: "#fff",
        borderRadius: 8,
      }}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
