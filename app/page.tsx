import Link from 'next/link'

export default function HomePage() {
  return (
    <main>
      <h1>Mango — Range component exercise</h1>
      <ul>
        <li>
          <Link href="/exercise1">Exercise 1 — Normal range</Link>
        </li>
        <li>
          <Link href="/exercise2">Exercise 2 — Fixed values range</Link>
        </li>
      </ul>
    </main>
  )
}
