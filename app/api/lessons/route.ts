import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"
import { createEmptyLessonUIState } from "@/lib/schemas"
import type { Json } from "@/lib/supabase/types"

// GET /api/lessons - List user's lessons
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("id, title, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(lessons)
}

// POST /api/lessons - Create new lesson
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const title = body.title || "Untitled Lesson"

  const lessonId = uuidv4()
  const initialUIState = createEmptyLessonUIState(lessonId)

  const { data: lesson, error } = await supabase
    .from("lessons")
    .insert({
      id: lessonId,
      user_id: user.id,
      title,
      ui_schema: initialUIState as Json
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Create empty chat for the lesson
  await supabase.from("chats").insert({
    lesson_id: lessonId,
    messages: []
  })

  return NextResponse.json(lesson, { status: 201 })
}
