"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/app/page/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/page/components/ui/card"
import { Input } from "@/app/page/components/ui/input"
import { Label } from "@/app/page/components/ui/label"
import { Textarea } from "@/app/page/components/ui/textarea"
import { CalendarIcon, MapPin, ArrowLeft } from "lucide-react"
import CreatePostForm from "@/app/page/components/Forum/create-post-form"

export default function CreatePostPage() {
   return (
      <div className="container mx-auto py-8">
      <CreatePostForm />      
      </div>
    );
}

// ... existing code ...  