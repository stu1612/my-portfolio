// prismic
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

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
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className="p-12 h-screen">
        <div className="bg-green-700 h-full relative">
          <div className="absolute top-0 left-0">
            <Link href="/" className="text-red-500">
              {slice.primary.first_name}
            </Link>
          </div>
          <div className="absolute bottom-0 left-0">
            <>{slice.primary.tag_line}</>
          </div>
          <nav className="absolute bottom-0 right-0">
            <ul className="flex flex-col">
              <Link href="/">Github</Link>
              <Link href="/">Linkedin</Link>
              <Link href="/">Email</Link>
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
