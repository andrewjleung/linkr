"use client";

import { Button } from '../../components/ui/button'
import { signIn, signOut } from 'next-auth/react'

export default function Home() {
  return (
    <main>
      <Button onClick={() => { signIn() }}>Sign In</Button>
    </main>
  )
}
