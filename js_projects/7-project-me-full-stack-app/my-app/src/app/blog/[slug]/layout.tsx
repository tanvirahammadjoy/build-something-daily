// app/blog/slug/page.tsx
export default async function blogLayout({ children, params }: any) {
  const { slug } = await params;
  return (
    <div>
      <h1>Blog post: {slug}</h1>
      {children}
    </div>
  );
}
