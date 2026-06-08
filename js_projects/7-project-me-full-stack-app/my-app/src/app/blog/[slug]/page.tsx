// app/blog/slug/page.tsx
import { PageProps } from "next/app";


export default function BlogPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = props.params;
  return <div>This is the blog post: {slug}</div>;
}
