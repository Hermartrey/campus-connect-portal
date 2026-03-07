import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, CreditCard, BookOpen, Award, Clock } from 'lucide-react';

const features = [
  {
    icon: GraduationCap,
    title: 'Quality Education',
    description: 'Excellence in academics with experienced educators dedicated to student success.',
  },
  {
    icon: Users,
    title: 'Student Community',
    description: 'Join a vibrant community of learners and participate in diverse activities.',
  },
  {
    icon: BookOpen,
    title: 'Modern Curriculum',
    description: 'Updated curriculum designed to prepare students for the future.',
  },
  {
    icon: Award,
    title: 'Recognized Excellence',
    description: 'Award-winning programs and nationally recognized achievements.',
  },
  {
    icon: CreditCard,
    title: 'Easy Payments',
    description: 'Convenient online tuition payment system for hassle-free transactions.',
  },
  {
    icon: Clock,
    title: 'Quick Enrollment',
    description: 'Streamlined online enrollment process to get started quickly.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div >
            <Link className="flex items-center gap-2" to="/">
              <img src="/ichs-logo.png" alt="ICHS Logo" className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold text-foreground">ICHS</span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/ichs-image.jpeg)' }}>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Shape Your Future with
            <span className="text-primary block mt-2">Immaculate Conception High School</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Empowering students with knowledge, skills, and values to succeed in an ever-changing world.
            Join our community of learners today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Apply Now
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/30">
                Student Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Card className="max-w-3xl mx-auto bg-primary text-primary-foreground">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Journey?</h2>
              <p className="text-lg opacity-90 mb-8">
                Enrollment is now open. Secure your spot for the upcoming academic year.
              </p>
              <Link to="/signup">
                <Button size="lg" variant="secondary">
                  Start Enrollment
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-card">
        <div className="container mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Link className="flex items-center gap-2" to="/">
              <img src="/ichs-logo.png" alt="ICHS Logo" className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold text-foreground">Immaculate Conception High School</span>
            </Link>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Immaculate Conception High School. All rights reserved.
          </p>
          {/* <p className="text-xs mt-2">Demo Version - Data stored in localStorage</p> */}
        </div>
      </footer>
    </div>
  );
}
