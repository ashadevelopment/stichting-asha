// app/api/projects/route.ts
import { NextResponse } from "next/server"
import connectDB from "../../lib/mongodb"
import Project from "../../lib/models/Project"

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()
    console.log("📦 Ontvangen project body:", body)
    const project = await Project.create(body)
    return NextResponse.json(project)
  } catch (err) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()
    const projects = await Project.find().sort({ createdAt: -1 })
    return NextResponse.json(projects)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}