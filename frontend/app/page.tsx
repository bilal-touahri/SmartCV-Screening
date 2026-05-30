'use client';

import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { WhyJoinUs } from '@/components/landing/WhyJoinUs';
import { JobCategories } from '@/components/landing/JobCategories';
import { FeaturedJobs } from '@/components/landing/FeaturedJobs';
import { LifeAtCompany } from '@/components/landing/LifeAtCompany';
import { HowToApply } from '@/components/landing/HowToApply';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-[#0D3349] via-white to-white">
      <LandingNavbar />
      <HeroSection />
      <WhyJoinUs />
      <JobCategories />
      <FeaturedJobs />
      <LifeAtCompany />
      <HowToApply />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
