"use client";

// prismic
import { Content, KeyTextField } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicNextLink } from "@prismicio/next";

// next
import Link from "next/link";

// npm
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// folders
import { renderLetters } from "@/app/utils/RenderLetters";

/**
 * Props for `Hero`.
 */
export type HeroProps = SliceComponentProps<Content.HeroSlice>;

/**
 * Component for "Hero" Slices.
 */
const Hero = ({ slice }: HeroProps): JSX.Element => {
  gsap.registerPlugin(useGSAP);

  const title = useRef<HTMLHeadingElement>(null);
  const tagline = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      ".name-animation",
      {
        x: -100,
        opacity: 0,
        rotate: -10,
      },
      {
        x: 0,
        opacity: 1,
        rotate: 0,
        ease: "elastic.out(1,0,3)",
        duration: 1,
        transformOrigin: "left top",
        stagger: {
          each: 0.1,
          from: "random",
        },
      }
    ),
      {
        scope: title,
      };
  });

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className="p-4 md:p-12 h-screen">
        <div className="h-full relative">
          <Link href="/" className="absolute top-0 left-0">
            <h1
              className="block font-bold font-honk text-[clamp(3rem,12vmin,20rem)] leading-none tracking-tighter"
              aria-label={`${slice.primary.first_name}${slice.primary.last_name}`}
              ref={title}
            >
              {renderLetters(slice.primary.first_name, "first")}
            </h1>
          </Link>
          <div className="absolute bottom-0 left-0 ">
            <h2
              className="block opacity-100 font-mono font-light py-2 text-[clamp(1.8rem,4vmin,6rem)] w-[70%] md:w-[50%] bg-gradient-to-tr from-zinc-400 via-zinc-600 to-zinc-200 bg-clip-text text-transparent "
              ref={tagline}
            >
              {slice.primary.tag_line}
            </h2>
            <span className="block prismic-links">
              {slice.primary.job_role}
            </span>
            <span className="block prismic-links">
              {slice.primary.location}
            </span>
            <div>
              <nav className="block md:hidden mt-2">
                <ul className="flex flex-row gap-3">
                  <PrismicNextLink field={slice.primary.github}>
                    <span className="prismic-link-icons">Gh</span>
                  </PrismicNextLink>
                  <PrismicNextLink field={slice.primary.linkedin}>
                    <span className="prismic-link-icons">Li</span>
                  </PrismicNextLink>
                  <PrismicNextLink field={slice.primary.email}>
                    <span className="prismic-link-icons">Email</span>
                  </PrismicNextLink>
                </ul>
              </nav>
            </div>
          </div>
          <nav className="absolute bottom-0 right-0">
            <ul className="hidden md:flex flex-col gap-2">
              <PrismicNextLink
                field={slice.primary.github}
                className="prismic-links"
              >
                Github
              </PrismicNextLink>
              <PrismicNextLink
                field={slice.primary.linkedin}
                className="prismic-links"
              >
                LinkedIn
              </PrismicNextLink>
              <PrismicNextLink
                field={slice.primary.email}
                className="prismic-links"
              >
                Email
              </PrismicNextLink>
            </ul>
          </nav>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            THREE JS
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
