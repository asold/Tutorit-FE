"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Button,
  MenuItem,
  Grid,
  Paper,
  Avatar,
} from "@mui/material"
import { MessageCircle, BookOpen, Users, Sparkles, Video, CheckCircle, DollarSign, TrendingUp } from "lucide-react"
import { SERVER_ADDRESS } from "../../common/constants.ts"


interface SignupData {
  user_email: string
  name: string
  age: string
  role: "tutor" | "student" | ""
}

const roleMap: Record<SignupData["role"], number> = {
  tutor: 0,
  student: 1,
  "": -1 // or whatever you want to represent "none"
}

function translateSignupData(data: SignupData) {
  return {
    email: data.user_email,
    fullname: data.name,
    age: parseInt(data.age, 10),
    type: roleMap[data.role]
  }
}


export default function TutorItLanding() {
  const [signupData, setSignupData] = useState<SignupData>({
    user_email: "",
    name: "",
    age: "",
    role: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Signup data:", signupData)

    try {
      await fetch(`${SERVER_ADDRESS}/tutorit/SignUp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(translateSignupData(signupData)),
      })
      alert("Sign up successful!")
    } catch (error) {
      console.error("Signup error:", error)
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          py: 10,
          px: 2,
          textAlign: "center",
          background: "linear-gradient(135deg, #2563eb 0%, #9333ea 100%)",
          color: "white",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('images/diverse-students-collaborating-learning.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.2,
          }}
        />
        <Container maxWidth="md" sx={{ position: "relative" }}>
          <Typography variant="h1" sx={{ fontSize: { xs: "3rem", md: "4rem" }, fontWeight: "bold", mb: 3 }}>
            Learn anything. Teach everything.
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, maxWidth: "800px", mx: "auto" }}>
            A community-driven platform where you can ask questions, discover answers, follow structured courses, and
            create AI-powered learning paths.
          </Typography>
          <Paper
            sx={{
              display: "inline-block",
              bgcolor: "#facc15",
              color: "#1f2937",
              px: 3,
              py: 2,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            ⚠️ TutorIt is currently under development. We are gauging interest from early users.
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h2" sx={{ fontWeight: "bold", mb: 2 }}>
            How TutorIt Works
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: "800px", mx: "auto", fontSize: "1.1rem" }}>
            Join a vibrant learning community where questions spark discoveries, courses guide your growth, and
            knowledge becomes your currency.
          </Typography>
        </Box>

        <Grid
          container
          spacing={4}
          sx={{
            flexDirection: "row",
            flexWrap: { xs: "nowrap", sm: "wrap" },
            overflowX: { xs: "auto", sm: "visible" },
          }}
        >
          <Grid item xs={12} sm={4} sx={{ minWidth: { xs: "280px", sm: "auto" } }}>
            <Card sx={{ textAlign: "center", height: "100%", boxShadow: 3 }}>
              <CardMedia
                component="img"
                sx={{
                  height: 240,
                  objectFit: "cover",
                }}
                src="images/community-followers-engagement-growth.jpg"
                alt="Ask and discover"
              />
              <CardContent sx={{ p: 3 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "rgba(37, 99, 235, 0.1)",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <MessageCircle size={32} color="#2563eb" />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                  Ask & Discover
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1rem", lineHeight: 1.6 }}>
                  Post questions about any topic and explore related answers from the community. Learn from real
                  discussions and diverse perspectives.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} sx={{ minWidth: { xs: "280px", sm: "auto" } }}>
            <Card sx={{ textAlign: "center", height: "100%", boxShadow: 3 }}>
              <CardMedia
                component="img"
                sx={{
                  height: 240,
                  objectFit: "cover",
                }}
                image="images/student-learning-online-course-progress.jpg"
                alt="Learn and grow"
              />
              <CardContent sx={{ p: 3 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "rgba(147, 51, 234, 0.1)",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <BookOpen size={32} color="#9333ea" />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                  Learn & Grow
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1rem", lineHeight: 1.6 }}>
                  Follow structured courses created by expert tutors or let AI generate personalized learning paths
                  based on your goals and interests.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} sx={{ minWidth: { xs: "280px", sm: "auto" } }}>
            <Card sx={{ textAlign: "center", height: "100%", boxShadow: 3 }}>
              <CardMedia
                component="img"
                sx={{
                  height: 240,
                  objectFit: "cover",
                }}
                image="images/teacher-creating-course-content-online.jpg"
                alt="Teach and earn"
              />
              <CardContent sx={{ p: 3 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "rgba(22, 163, 74, 0.1)",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <TrendingUp size={32} color="#16a34a" />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                  Teach & Earn
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1rem", lineHeight: 1.6 }}>
                  Create engaging courses, build a community of learners, and monetize your expertise through premium
                  content and 1-on-1 sessions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ py: 8, bgcolor: "action.hover" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h2" sx={{ fontWeight: "bold", mb: 2 }}>
              Platform Features
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: "800px", mx: "auto", fontSize: "1.1rem" }}
            >
              Everything you need to learn, teach, and grow in one powerful platform.
            </Typography>
          </Box>

          <Grid
            container
            spacing={4}
            sx={{
              flexDirection: "row",
              flexWrap: { xs: "nowrap", sm: "wrap" },
              overflowX: { xs: "auto", sm: "visible" },
            }}
          >
            <Grid item xs={12} sm={6} md={3} sx={{ minWidth: { xs: "240px", sm: "auto" } }}>
              <Card sx={{ height: "100%", boxShadow: 3 }}>
                <CardMedia
                  component="img"
                  sx={{
                    height: 200,
                    objectFit: "cover",
                  }}
                  image="images/discussion-forum-questions-feed.jpg"
                  alt="Q&A Feed"
                />
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <MessageCircle size={48} color="#2563eb" style={{ marginBottom: 12 }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                    Community Q&A Feed
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                    Browse questions, upvote answers, and contribute to a knowledge-sharing community.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3} sx={{ minWidth: { xs: "240px", sm: "auto" } }}>
              <Card sx={{ height: "100%", boxShadow: 3 }}>
                <CardMedia
                  component="img"
                  sx={{
                    height: 200,
                    objectFit: "cover",
                  }}
                  image="images/ai-artificial-intelligence-learning-path.jpg"
                  alt="AI Courses"
                />
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <Sparkles size={48} color="#9333ea" style={{ marginBottom: 12 }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                    AI Course Generation
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                    Let AI create personalized learning paths tailored to your goals and skill level.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3} sx={{ minWidth: { xs: "240px", sm: "auto" } }}>
              <Card sx={{ height: "100%", boxShadow: 3 }}>
                <CardMedia
                  component="img"
                  sx={{
                    height: 200,
                    objectFit: "cover",
                  }}
                  image="images/interactive-tasks-notes-progress-tracking.jpg"
                  alt="Interactive Tools"
                />
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <CheckCircle size={48} color="#16a34a" style={{ marginBottom: 12 }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                    Interactive Tools
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                    Tasks, shared notes, progress tracking, and more to enhance your learning experience.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3} sx={{ minWidth: { xs: "240px", sm: "auto" } }}>
              <Card sx={{ height: "100%", boxShadow: 3 }}>
                <CardMedia
                  component="img"
                  sx={{
                    height: 200,
                    objectFit: "cover",
                  }}
                  image="images/video-call-tutoring-session-online.jpg"
                  alt="1-on-1 Tutoring"
                />
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <Video size={48} color="#dc2626" style={{ marginBottom: 12 }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                    1-on-1 Tutoring
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                    Book personalized sessions with expert tutors for deep-dive learning and mentorship.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h2" sx={{ fontWeight: "bold", mb: 2 }}>
            Built for Tutors
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: "800px", mx: "auto", fontSize: "1.1rem" }}>
            Turn your expertise into impact and income with powerful tools designed for educators.
          </Typography>
        </Box>

        <Grid
          container
          spacing={4}
          sx={{
            flexDirection: "row",
            flexWrap: { xs: "nowrap", sm: "wrap" },
            overflowX: { xs: "auto", sm: "visible" },
          }}
        >
          <Grid item xs={12} sm={4} sx={{ minWidth: { xs: "280px", sm: "auto" } }}>
            <Card sx={{ height: "100%", boxShadow: 3 }}>
              <CardMedia
                component="img"
                sx={{
                  height: 240,
                  objectFit: "cover",
                }}
                image="images/course-creation-curriculum-lessons.jpg"
                alt="Create courses"
              />
              <CardContent sx={{ p: 3, textAlign: "center" }}>
                <BookOpen size={56} color="#2563eb" style={{ marginBottom: 12 }} />
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                  Create & Sell Courses
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1rem", lineHeight: 1.6 }}>
                  Build comprehensive courses with lessons, assignments, and multimedia content. Offer them for free or
                  set your own pricing.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} sx={{ minWidth: { xs: "280px", sm: "auto" } }}>
            <Card sx={{ height: "100%", boxShadow: 3 }}>
              <CardMedia
                component="img"
                sx={{
                  height: 240,
                  objectFit: "cover",
                }}
                image="images/community-followers-engagement-growth.jpg"
                alt="Build community"
              />
              <CardContent sx={{ p: 3, textAlign: "center" }}>
                <Users size={56} color="#9333ea" style={{ marginBottom: 12 }} />
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                  Build Your Community
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1rem", lineHeight: 1.6 }}>
                  Grow your following, engage with students, and establish yourself as an authority in your field.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} sx={{ minWidth: { xs: "280px", sm: "auto" } }}>
            <Card sx={{ height: "100%", boxShadow: 3 }}>
              <CardMedia
                component="img"
                sx={{
                  height: 240,
                  objectFit: "cover",
                }}
                image="images/payment-earnings-money-flexible-pricing.jpg"
                alt="Monetization"
              />
              <CardContent sx={{ p: 3, textAlign: "center" }}>
                <DollarSign size={56} color="#16a34a" style={{ marginBottom: 12 }} />
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                  Flexible Monetization
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1rem", lineHeight: 1.6 }}>
                  Earn through premium courses, exclusive content, or 1-on-1 sessions. Set your rates and get paid
                  securely.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Signup Section */}
      <Box sx={{ py: 8, bgcolor: "action.hover" }}>
        <Container maxWidth="sm">
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h2" sx={{ fontWeight: "bold", mb: 2 }}>
              Join TutorIt Today
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Sign up as a tutor or student to get started.
            </Typography>
          </Box>

          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                Create Your Account
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Tell us about yourself
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={signupData.name}
                      onChange={(e) => setSignupData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
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

                <TextField
                  fullWidth
                  select
                  label="I want to join as a:"
                  value={signupData.role}
                  onChange={(e) => setSignupData((prev) => ({ ...prev, role: e.target.value as "tutor" | "student" }))}
                  required
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="tutor">Tutor</MenuItem>
                </TextField>

                <Button type="submit" variant="contained" size="large" fullWidth>
                  Create Account
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  )
}
