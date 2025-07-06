import React from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import CopyBtn from "@repo/ui/components/ui/copy-button";
import { cn } from "@repo/ui/lib/utils"

function PreWithCopyBtn({ className, ...props }: React.ComponentProps<"pre">) {
  const ref = React.useRef<HTMLPreElement>(null);
  return (
    <span className="group relative">
      <CopyBtn
        className="absolute right-1 top-1 m-1 hidden text-white group-hover:block"
        getStringToCopy={() => {
          return ref.current?.textContent ?? "";
        }}
      />
      <pre ref={ref} className={cn(className, "")} {...props} />
    </span>
  );
}

export function MarkdownReadonly({ children: markdown }: { children: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      rehypePlugins={[rehypeRaw]}
      components={{
        div({ className, ...props }) {
          return <div className={cn("prose prose-neutral dark:prose-invert max-w-none", className)} {...props} />;
        },
        pre({ ...props }) {
          return <PreWithCopyBtn {...props} />;
        },
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className ?? "");
          return match ? (
            // @ts-expect-error -- Refs are not compatible for some reason
            <SyntaxHighlighter
              PreTag="div"
              language={match[1]}
              {...props}
              style={dracula}
              className="rounded-md border bg-muted/50"
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={cn("rounded-md bg-muted/50 px-1.5 py-0.5", className)} {...props}>
              {children}
            </code>
          );
        },
        // 自定义链接样式
        a({ className, ...props }) {
          return <a className={cn("text-primary underline-offset-4 hover:underline", className)} {...props} />;
        },
        // 自定义标题样式
        h1({ className, ...props }) {
          return <h1 className={cn("mt-2 scroll-m-20 text-4xl font-bold", className)} {...props} />;
        },
        h2({ className, ...props }) {
          return <h2 className={cn("mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold first:mt-0", className)} {...props} />;
        },
        h3({ className, ...props }) {
          return <h3 className={cn("mt-8 scroll-m-20 text-2xl font-semibold", className)} {...props} />;
        },
        // 自定义列表样式
        ul({ className, ...props }) {
          return <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...props} />;
        },
        ol({ className, ...props }) {
          return <ol className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)} {...props} />;
        },
        // 自定义段落样式
        p({ className, ...props }) {
          return <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)} {...props} />;
        },
        // 自定义块引用样式
        blockquote({ className, ...props }) {
          return <blockquote className={cn("mt-6 border-l-2 border-primary pl-6 italic", className)} {...props} />;
        },
        // 自定义表格样式
        table({ className, ...props }) {
          return <table className={cn("w-full border-collapse border-spacing-0", className)} {...props} />;
        },
        thead({ className, ...props }) {
          return <thead className={cn("border-b", className)} {...props} />;
        },
        th({ className, ...props }) {
          return <th className={cn("border px-4 py-2 text-left font-bold", className)} {...props} />;
        },
        td({ className, ...props }) {
          return <td className={cn("border px-4 py-2", className)} {...props} />;
        },
      }}
    >
      {markdown}
    </Markdown>
  );
}
