import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const service = await createServiceClient()
    const db = (t: string) => (service.from(t) as AnyRecord)

    // Find auth user by email using service role
    const { data: users } = await service.auth.admin.listUsers()
    const authUser = users?.users?.find((u: AnyRecord) => u.email?.toLowerCase() === email.trim().toLowerCase())
    if (!authUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Get profile
    const { data: profile } = await db('profiles').select('id, username').eq('id', authUser.id).single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    return NextResponse.json({ id: profile.id, username: profile.username || email.split('@')[0] })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
