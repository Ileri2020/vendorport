"use client"
import { motion } from "framer-motion"
import { Stocks, GlobalSearch } from "@/components/myComponents/subs"
import CategoryNavigator from "@/components/myComponents/subs/categoryNavigator"


const Store = () => {
  return (
    <motion.section
      initial = {{ opacity: 0 }}
      animate = {{
        opacity : 1,
        transition : { delay: 0.5, duration: 0.6, ease: "easeIn"}
      }}
      className="w-full relative overflow-x-clip px-0 max-w-[435px] md:max-w-full md:p-4 justify-center items-center"
    >
      <div className="w-full overflow-x-clip justify-center items-center mx-auto max-w-7xl">
        <div className="mb-2 p-1 mx-auto w-screen max-w-sm overflow-clip justify-center items-center">
          <GlobalSearch placeholder="Search more products in our store..." />
        </div>
        <CategoryNavigator />
        
        <div className="relative h-full w-screen max-w-[400px] md:max-w-full overflow-clip flex flex-col mx-auto justify-center items-center">
          {/* <Filters /> */}
          <Stocks />
        </div>
      </div>
    </motion.section>
  )
}

export default Store
