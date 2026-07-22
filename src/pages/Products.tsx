import { products, type Product } from "@/loaders/product";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Products() {
  useGSAP(() => {
    gsap.from(".product", {
      scale: 0.5,
      opacity: 0,
      duration: 0.2,
      stagger: 0.05
    });
    gsap.from(".title,.subtitle", {
      yPercent: 100,
      opacity: 0,
      duration: 0.3
    });
  }, []);
  return (
    <div className="bg-neutral-900 py-12 sm:py-16" data-testid="productspage">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="title text-3xl font-bold tracking-tight text-neutral-200 sm:text-4xl">
            Our Products
          </h2>
          <p className="subtitle mt-6 text-lg leading-8 text-neutral-400">
            A showcase of our projects and experiments.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-8 sm:mt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {products.map((product: Product) => (
            <div
              key={product.name}
              className="product flex flex-col justify-between rounded-2xl bg-neutral-800 p-4 md:p-6 shadow-lg"
            >
              <div>
                <img
                  className="h-44 w-full object-cover rounded"
                  src={product.image}
                  alt={product.name}
                />
                <h3 className="mt-4 md:mt-6 text-2xl font-bold leading-9 tracking-tight text-neutral-200">
                  {product.name}
                </h3>
                <p className="mt-2 md:mt-4 text-base leading-7 text-neutral-400">
                  {product.description}
                </p>
                <div className="mt-4 md:mt-6 flex flex-wrap gap-2">
                  {product.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center rounded-md bg-neutral-700 px-2 py-1 text-xs font-medium text-neutral-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6 md:mt-8 flex items-center gap-x-4">
                {product.liveLink && (
                  <a
                    href={product.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Live Demo
                  </a>
                )}
                {product.githubLink && (
                  <a
                    href={product.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-neutral-600 px-3.5 py-2.5 text-sm font-semibold text-neutral-200 shadow-sm hover:bg-neutral-500"
                  >
                    GitHub
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
