import {AiOutlineSearch, AiOutlineHome, AiOutlineShop, AiOutlineMan, AiOutlineContacts, AiOutlineWoman, AiOutlineProfile, AiOutlineRead} from "react-icons/ai"
import { BiPhoneCall, BiSolidContact, BiPhone,} from "react-icons/bi"
import { CiShoppingCart, } from "react-icons/ci"
import { IoMdHelp } from "react-icons/io";
import { VscAccount } from "react-icons/vsc";
import { IoFastFoodOutline } from "react-icons/io5";
import { HiBriefcase, HiOutlineQuestionMarkCircle } from "react-icons/hi2";

export const platformSocialLinks = {
  facebook: "https://www.facebook.com/ileritech",
  twitter: "https://x.com/ileritech",
  instagram: "https://www.instagram.com/ileritech",
  linkedin: "https://www.linkedin.com/company/ileritech",
  email: "mailto:hello@ileritech.com",
};

export default {Links : [
    {
      name: <AiOutlineHome />,
      title: "Home",
      path: "/home",
    },
    {
      name: <AiOutlineShop />,
      title: "Store",
      path: "/store",
    },
    {
      name: <AiOutlineProfile />,
      title: "New Product",
      path: "/new-product",
    },
    {
      name: <AiOutlineRead />,
      title: "About",
      path: "/about",
    },
    {
      name: <HiOutlineQuestionMarkCircle />,
      title: "Help",
      path: "/help",
    },
    {
      name: <HiBriefcase />,
      title: "Jobs",
      path: "/jobs",
    },
    {
      name: <BiPhone />,
      title: "Contact",
      path: "/contact",
    },
    {
      name: <AiOutlineProfile />,
      title: "Blog",
      path: "/blog",
    },
    {
      name: <VscAccount />,
      title: "Account",
      path: "/account",
    },
  ]
}