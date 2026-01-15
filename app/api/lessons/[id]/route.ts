import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/lessons/[id] - Get a single lesson
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("*, chats(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
  }

  return NextResponse.json(lesson)
}

// PUT /api/lessons/[id] - Update a lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const updates: Record<string, unknown> = {}

  if (body.title !== undefined) {
    updates.title = body.title
  }

  if (body.ui_schema !== undefined) {
    updates.ui_schema = body.ui_schema
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 })
  }

  const { data: lesson, error } = await supabase
    .from("lessons")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error || !lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
  }

  return NextResponse.json(lesson)
}

// DELETE /api/lessons/[id] - Delete a lesson
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await supabase
    .from("lessons")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
