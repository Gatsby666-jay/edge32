import { Reveal } from "@/components/reveal";
import { LineReveal } from "@/components/reveal";
import { CtaButton } from "@/components/cta-button";

export default function Cta() {
  return (
    <section className="sec px-gutter text-center">
      <Reveal as="p" className="eyebrow" >
        (06) GET STARTED
      </Reveal>
      <LineReveal
        as="h2"
        className="h-section mt-[26px]"
        lines={[
          <>准备好点亮</>,
          <>
            第一颗 <em className="accent">LED</em> 了吗？
          </>,
        ]}
      />
      <Reveal as="p" className="lead mx-auto mt-[22px]" delay={0.2}>
        安装 CubeIDE，找一块 F103 开发板，从今天开始。每一步都算数。
      </Reveal>
      <Reveal className="mt-10" delay={0.3}>
        <CtaButton href="#roadmap" variant="solid" cursorLabel="GO">
          开始学习
        </CtaButton>
      </Reveal>
    </section>
  );
}
