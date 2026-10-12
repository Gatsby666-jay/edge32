import Nav from "@/components/nav";
import Hero from "@/components/sections/hero";
import Marquee from "@/components/marquee";
import Problem from "@/components/sections/problem";
import Roadmap from "@/components/sections/roadmap";
import Courses from "@/components/sections/courses";
import Resources from "@/components/sections/resources";
import Notes from "@/components/sections/notes";
import Cta from "@/components/sections/cta";
import Footer from "@/components/footer";
import ToTop from "@/components/to-top";

export default function Page() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Marquee />
        <Problem />
        <Roadmap />
        <Courses />
        <Resources />
        <Notes />
        <Cta />
      </main>
      <Footer />
      <ToTop />
    </>
  );
}
