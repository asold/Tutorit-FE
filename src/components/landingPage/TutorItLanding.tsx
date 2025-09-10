"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Chip,
  Grid,
  Paper,
  Rating,
  CardMedia,
} from "@mui/material"
import { BookOpen, Video, Calendar, CreditCard, Users, CheckCircle } from "lucide-react"
import { SERVER_ADDRESS } from "../../common/constants.ts"
import LandingLayout from "./LandingLayout.tsx"

interface SignupData {
  user_email: string
  topics: string[]
  name: string
  age: string
  role: "tutor" | "student" | ""
}

interface Label {
  id: string
  name: string
}

const defaultTopics = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English Literature",
  "History",
  "Geography",
  "Economics",
  "Psychology",
  "Art & Design",
  "Music",
  "Foreign Languages",
  "Philosophy",
  "Statistics",
]

async function getTopicsAsync(): Promise<string[]> {
  try {
    const res = await fetch(SERVER_ADDRESS + "/tutorit/Label")

    if (!res.ok) {
      console.log("API not available, using default topics")
      return defaultTopics
    }

    const data: Label[] = await res.json()
    return data.map((label) => label.name)
  } catch (error) {
    console.log("Failed to fetch topics from API, using defaults:", error)
    return defaultTopics
  }
}

export default function TutorItLanding() {
  const [topics, setTopics] = useState<string[]>(defaultTopics)
  const [signupData, setSignupData] = useState<SignupData>({
    user_email: "",
    topics: [],
    name: "",
    age: "",
    role: "",
  })

  useEffect(() => {
    getTopicsAsync().then(setTopics)
  }, [])

  const handleTopicToggle = (topic: string) => {
    setSignupData((prev) => ({
      ...prev,
      topics: prev.topics.includes(topic) ? prev.topics.filter((t) => t !== topic) : [...prev.topics, topic],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Signup data:", signupData)

    try {
      await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      })
      alert("Sign up successful!")
    } catch (error) {
      console.error("Signup error:", error)
    }
  }

  return (
    <LandingLayout>  
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        sx={{
          py: 10,
          px: 2,
          textAlign: "center",
          background: `linear-gradient(135deg, rgba(25, 118, 210, 0.8) 0%, rgba(156, 39, 176, 0.8) 100%), url('/students-studying-with-laptops-and-books-in-modern.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h1"
            component="h1"
            sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" }, fontWeight: "bold", mb: 3, color: "white" }}
          >
            Connect. Learn. Excel.
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, maxWidth: "600px", mx: "auto", color: "rgba(255,255,255,0.9)" }}>
            TutorIt is the platform that connects passionate tutors with eager learners. Get personalized help on any
            topic, anytime, anywhere.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              bgcolor: "white",
              color: "primary.main",
              "&:hover": { bgcolor: "grey.100" },
            }}
          >
            Get Started Today
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" component="h2" fontWeight="bold" mb={2}>
            How TutorIt Works
          </Typography>
          <Typography variant="body1" color="text.secondary" maxWidth="600px" mx="auto">
            Students of any level can connect with available tutors fast to get any concept or topic explained. Build
            lasting learning relationships with ongoing lessons.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: "center", height: "100%" }}>
              <CardMedia
                component="img"
                height="200"
                image="/images/diverse-students-connecting-online-video-call.png"
                alt="Students connecting"
              />
              <CardContent sx={{ p: 3 }}>
                <Users size={48} color="#1976d2" style={{ marginBottom: "16px" }} />
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Quick Connections
                </Typography>
                <Typography color="text.secondary">
                  Find and connect with qualified tutors instantly. No waiting, no hassle.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: "center", height: "100%" }}>
              <CardMedia
                component="img"
                height="200"
                image="/images/open-books-mathematics-science-subjects-colorful.jpg"
                alt="Various subjects"
              />
              <CardContent sx={{ p: 3 }}>
                <BookOpen size={48} color="#1976d2" style={{ marginBottom: "16px" }} />
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Any Subject
                </Typography>
                <Typography color="text.secondary">
                  Get help with any concept or topic across all academic levels and subjects.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: "center", height: "100%" }}>
              <CardMedia
                component="img"
                height="200"
                image="/images/calendar-schedule-planning-ongoing-lessons-progres.jpg"
                alt="Ongoing lessons"
              />
              <CardContent sx={{ p: 3 }}>
                <Calendar size={48} color="#1976d2" style={{ marginBottom: "16px" }} />
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Ongoing Lessons
                </Typography>
                <Typography color="text.secondary">
                  Build lasting relationships with regular tutoring sessions and progress tracking.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Paper sx={{ bgcolor: "grey.50", py: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h2" fontWeight="bold" mb={2}>
              Everything You Need to Learn & Teach
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth="600px" mx="auto">
              Shared virtual notebooks, video calls, homework tracking, calendars and many more features to ensure
              seamless learning experiences.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              {
                icon: Video,
                title: "Video Calls",
                desc: "High-quality video sessions with screen sharing and interactive tools.",
                image: "/images/video-call-screen-sharing-online-tutoring-session.jpg",
              },
              {
                icon: BookOpen,
                title: "Virtual Notebooks",
                desc: "Shared digital notebooks for real-time collaboration and note-taking.",
                image: "/images/digital-notebook-collaborative-writing-notes.jpg",
              },
              {
                icon: CheckCircle,
                title: "Homework Tracking",
                desc: "Assign, track, and review homework with built-in progress monitoring.",
                image: "/images/homework-checklist-progress-tracking-assignments.jpg",
              },
              {
                icon: Calendar,
                title: "Smart Scheduling",
                desc: "Integrated calendars make booking and managing sessions effortless.",
                image: "/images/smart-calendar-scheduling-appointments-booking.jpg",
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Card sx={{ height: "100%" }}>
                  <CardMedia component="img" height="150" image={feature.image} alt={feature.title} />
                  <CardContent>
                    <feature.icon size={32} color="#9c27b0" style={{ marginBottom: "8px" }} />
                    <Typography variant="h6" fontWeight="bold" mb={1}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" component="h2" fontWeight="bold" mb={2}>
            Built for Tutors
          </Typography>
          <Typography variant="body1" color="text.secondary" maxWidth="600px" mx="auto">
            Save video lectures, create comprehensive courses, and earn with integrated payments based on your own
            rates.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            {
              icon: Video,
              title: "Video Lectures",
              desc: "Record and save your best explanations to help more students learn efficiently.",
              image: "/images/teacher-recording-video-lecture-presentation.jpg",
            },
            {
              icon: BookOpen,
              title: "Course Creation",
              desc: "Build structured courses with lessons, assignments, and progress tracking.",
              image: "/images/course-curriculum-structure-lessons-organized.jpg",
            },
            {
              icon: CreditCard,
              title: "Flexible Payments",
              desc: "Set your own rates and get paid securely with integrated payment processing.",
              image: "/images/secure-payment-processing-money-earnings-rates.jpg",
            },
          ].map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: "100%" }}>
                <CardMedia component="img" height="200" image={feature.image} alt={feature.title} />
                <CardContent>
                  <feature.icon size={40} color="#1976d2" style={{ marginBottom: "12px" }} />
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">{feature.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Paper sx={{ bgcolor: "grey.50", py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" fontWeight="bold" textAlign="center" mb={6}>
            What Our Community Says
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      component="img"
                      src="images/young-female-student-smiling-portrait.jpg"
                      alt="Sarah"
                      sx={{ width: 50, height: 50, borderRadius: "50%", mr: 2 }}
                    />
                    <Box>
                      <Typography fontWeight="bold">Sarah, Student</Typography>
                      <Rating value={5} readOnly size="small" />
                    </Box>
                  </Box>
                  <Typography color="text.secondary" mb={2}>
                    "TutorIt helped me find the perfect math tutor. The virtual notebook feature made our sessions so
                    much more interactive!"
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      component="img"
                      src="/images/middle-aged-male-professor-physics-teacher.jpg"
                      alt="Dr. Martinez"
                      sx={{ width: 50, height: 50, borderRadius: "50%", mr: 2 }}
                    />
                    <Box>
                      <Typography fontWeight="bold">Dr. Martinez, Physics Tutor</Typography>
                      <Rating value={5} readOnly size="small" />
                    </Box>
                  </Box>
                  <Typography color="text.secondary" mb={2}>
                    "As a tutor, I love how easy it is to create courses and manage payments. The platform handles
                    everything seamlessly."
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      <Box
        sx={{
          height: 300,
          backgroundImage: `url('/images/diverse-students-and-tutors-collaborating-learning.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(25, 118, 210, 0.7)",
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          Join Thousands of Learners & Educators
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" component="h2" fontWeight="bold" mb={2}>
            Join TutorIt Today
          </Typography>
          <Typography color="text.secondary">
            Sign up as a tutor or student and specify your interests to get started.
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold" mb={1}>
              Create Your Account
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Tell us about yourself and your learning interests
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={signupData.name}
                    onChange={(e) => setSignupData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Age"
                    type="number"
                    value={signupData.age}
                    onChange={(e) => setSignupData((prev) => ({ ...prev, age: e.target.value }))}
                    required
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={signupData.user_email}
                onChange={(e) => setSignupData((prev) => ({ ...prev, user_email: e.target.value }))}
                required
              />

              <FormControl fullWidth>
                <InputLabel>I want to join as a:</InputLabel>
                <Select
                  value={signupData.role}
                  label="I want to join as a:"
                  onChange={(e) => setSignupData((prev) => ({ ...prev, role: e.target.value as "tutor" | "student" }))}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="tutor">Tutor</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography variant="h6" mb={1}>
                  Topics of Interest
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Select the subjects you're interested in learning or teaching
                </Typography>
                <Grid container spacing={1}>
                  {topics.map((topic) => (
                    <Grid item xs={12} sm={6} key={topic}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={signupData.topics.includes(topic)}
                            onChange={() => handleTopicToggle(topic)}
                          />
                        }
                        label={topic}
                      />
                    </Grid>
                  ))}
                </Grid>
                {signupData.topics.length > 0 && (
                  <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {signupData.topics.map((topic) => (
                      <Chip key={topic} label={topic} variant="outlined" />
                    ))}
                  </Box>
                )}
              </Box>

              <Button type="submit" variant="contained" size="large" fullWidth>
                Create Account
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>

      <Paper sx={{ bgcolor: "grey.100", py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                TutorIt
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connecting passionate tutors with eager learners worldwide.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                Platform
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {["Find Tutors", "Become a Tutor", "Features", "Pricing"].map((item) => (
                  <Typography key={item} variant="body2" color="text.secondary">
                    {item}
                  </Typography>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                Support
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {["Help Center", "Contact Us", "FAQs", "Community"].map((item) => (
                  <Typography key={item} variant="body2" color="text.secondary">
                    {item}
                  </Typography>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                Company
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {["About Us", "Careers", "Privacy Policy", "Terms of Service"].map((item) => (
                  <Typography key={item} variant="body2" color="text.secondary">
                    {item}
                  </Typography>
                ))}
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: 1, borderColor: "divider", mt: 4, pt: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              © 2025 TutorIt. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Paper>
      </Box>
    </LandingLayout>
  )
}
