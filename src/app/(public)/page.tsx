import Link from 'next/link';
import { Briefcase, Users, Shield, BarChart3 } from 'lucide-react';

const features = [
  { icon: Briefcase, title: 'Job Discovery', description: 'Browse curated opportunities matched to your skills and interests.' },
  { icon: Users, title: 'Talent Matching', description: 'AI-powered matching connects students with the right employers.' },
  { icon: Shield, title: 'Privacy First', description: 'Control exactly what information employers can see about you.' },
  { icon: BarChart3, title: 'Analytics', description: 'Track placement outcomes and skill demand trends.' },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="text-xl font-bold text-primary">ZenCube</span>
          <Link
            href="/login"
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            ZenCube Talent Registry
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Connecting skilled students with industry opportunities through verified profiles,
            intelligent matching, and transparent placement workflows.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex h-12 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Get Started
            </Link>
            <Link
              href="/jobs"
              className="inline-flex h-12 items-center rounded-md border border-input bg-background px-6 text-sm font-medium hover:bg-accent"
            >
              Browse Jobs
            </Link>
          </div>
        </section>

        <section className="border-t border-border bg-muted/50 py-16">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-lg border border-border bg-card p-6">
                <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        ZenCube Talent Registry — Part of the ZenV Labs ecosystem
      </footer>
    </div>
  );
}
