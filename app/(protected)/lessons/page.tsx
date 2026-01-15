import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LessonCard } from "@/components/lesson"

export default async function LessonsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Lessons</h1>
            <p className="text-muted-foreground mt-1">
              Your guitar practice lessons
            </p>
          </div>
          <form action="/api/lessons" method="POST">
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              New Lesson
            </Button>
          </form>
        </div>

        {!lessons || lessons.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No lessons yet</h2>
            <p className="text-muted-foreground mb-4">
              Create your first lesson to start learning guitar with AI
            </p>
            <form action="/api/lessons" method="POST">
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Lesson
              </Button>
            </form>
          </Card>
        ) : (
          <div className="grid gap-4">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                id={lesson.id}
                title={lesson.title}
                updatedAt={lesson.updated_at}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
