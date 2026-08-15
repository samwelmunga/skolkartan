import { siteName, siteTagline } from '@/app/site-metadata';

export default function Page() {
  return (
    <main>
      <h1>{siteName}</h1>
      <p>{siteTagline}</p>
      <p>Se README.md i repositoryts rot.</p>
    </main>
  );
}
