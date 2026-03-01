'use client'
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Stocks from '@/components/myComponents/subs/stocks';
import { SearchInput } from '@/components/myComponents/subs/searchcomponent';
import { FloatingAddButton } from '@/components/myComponents/subs/FloatingAddButton';

const Store = () => {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || undefined;
  const id = searchParams.get('id') || undefined;
  const search = searchParams.get('search') || undefined;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.6, ease: "easeIn" } }}
      className="w-[100vw] overflow-clip p-1"
    >
      <div className="relative w-full h-full flex flex-col justify-center items-center">
        <div className="flex z-20 md:hidden w-full justify-center items-center">
          {/* Search Input */}
          <SearchInput />
        </div>
        <Stocks categoryFilter={category} search={search} selectedId={id} />
      </div>
      <FloatingAddButton />
    </motion.section>
  );
};

export default Store;
