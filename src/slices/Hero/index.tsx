// prismic
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicNextLink } from "@prismicio/next";

// next
import Link from "next/link";

/**
 * Props for `Hero`.
 */
export type HeroProps = SliceComponentProps<Content.HeroSlice>;

/**
 * Component for "Hero" Slices.
 */
const Hero = ({ slice }: HeroProps): JSX.Element => {
  const email = slice.primary.email;
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className="p-12 h-screen">
        <div className="bg-green-700 h-full relative">
          <div className="absolute top-0 left-0">
            <Link href="/" className="font-bold text-4xl">
              {slice.primary.first_name}
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 ">
            <span className="block">{slice.primary.tag_line}</span>
            <span className="block">{slice.primary.job_role}</span>
            <span className="block">{slice.primary.location}</span>
          </div>
          <nav className="absolute bottom-0 right-0">
            <ul className="flex flex-col">
              <PrismicNextLink field={slice.primary.github}>
                Github
              </PrismicNextLink>
              <PrismicNextLink field={slice.primary.linkedin}>
                LinkedIn
              </PrismicNextLink>
              <PrismicNextLink field={slice.primary.email}>
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
