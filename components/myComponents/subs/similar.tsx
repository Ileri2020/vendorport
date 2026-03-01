"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CiShoppingCart } from "react-icons/ci";
import { useCart } from "@/hooks/use-cart";


export default function Similar({ similar }: { similar: any }) {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  const { addItem } = useCart();
  // const [editId, setEditId] = React.useState(null);

  console.log("similar products", similar);
  // IMPORTANT FIX — prevent slice() crash
  const list: any[] = Array.isArray(similar) ? similar : [];

  const shuffled = list.slice().sort(() => Math.random() - 0.5);

  const addToCart = (product: any) => {
    addItem(product, 1);
  };

  return (
    <>
      {similar.length == 0 && (
        <p className="text-center text-muted-foreground py-10">
          No similar products available.
        </p>
      )}

      {shuffled.length > 0 && (
        <Carousel
          plugins={[plugin.current]}
          className="w-screen overflow-clip lg:max-w-[850px] xl:max-w-[1000px] mx-auto mt-10"
          opts={{ loop: true }}
          orientation="horizontal"
        >
          <CarouselContent>
            {shuffled.map((product, index) => (
              <CarouselItem
                key={index}
                className="basis-1/3 md:basis-1/5 lg:basis-1/7 flex flex-col overflow-clip justify-center items-center w-full ml-2"
              >
                <Link href={`/store/${product.id}`}>
                  <div className="h-[100px] w-full mx-2 md:mx-0 flex justify-center items-center">
                    <img
                      src={product.images?.[0] ?? ""}
                      alt={product.name}
                      className="h-full rounded-sm"
                    />
                  </div>
                </Link>

                <div className="flex flex-1 flex-col text-center justify-center items-center w-full">
                  <Link href={`/store/${product.id}`}>
                    <div className="w-full text-center flex flex-col justify-center items-center">
                      <div className="font-semibold text-sm">
                        {product.name}
                      </div>
                      <div className="font-semibold text-foreground/80 text-sm">
                        ₦ {product.price?.toLocaleString()}
                      </div>
                    </div>
                  </Link>

                  <div className="flex flex-row w-full max-w-[100px] gap-1 mt-1">
                    <Button
                      onClick={() => addToCart(product)}
                      variant="outline"
                      className="rounded-lg flex-1 w-full h-6 font-semibold text-accent-secondary border-accent-secondary hover:bg-accent-secondary/60 hover:text-background border-2"
                    >
                      <CiShoppingCart />
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )}
    </>
  );
}
