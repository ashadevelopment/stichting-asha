import Link from 'next/link';

export default function Home() {
  return (
    <>
      <h1>Welcome Home</h1>
      <Link href="/agenda">Agenda</Link>
      <Link href="/projecten">Projecten</Link>
    </>
  )
}