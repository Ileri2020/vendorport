import { FaEnvelope } from "react-icons/fa"
import { CiLocationOn } from "react-icons/ci";
import { MdOutlineMessage, MdOutlinePhone } from "react-icons/md";


 
export default {
    title : "contact",
    description : "Contact us today for product inquiries, order support, or business collaborations. Use the contact information below and our support team will get back to you promptly.",
    contact : [
        {
            icon: <FaEnvelope/>, // className="w-[40px] h-[40px] text-accent hover:bg-accent hover:text-slate-100 rounded-md bg-transparent border-accent border-2 p-1"
            text: "Email",
            value: "succostores@gmail.com"
        },
        {
            icon : <MdOutlineMessage />, //className="w-[40px] h-[40px] text-accent hover:bg-accent hover:text-slate-100 rounded-md bg-transparent border-accent border-2 p-1"
            text : "Chat to us",
            value : "https://www.succo.vercel.app/contact"
        },
        {
            icon : <MdOutlinePhone/>,
            text: "Phone",
            value: "(+234) 816 132 9136"
        },
        {
            icon : <CiLocationOn/>,
            text: "address",
            value: "26, Stadium Road, Adjacent to Olalomi Hospital, Taiwo, Ilorin, Kwara State, Nigeria."
        },
    ],
    team : [
        {
            position : "CEO",
            name : "Adepoju Aleburu Lois "
        },
        {
            position : "Director of STEM",
            name : "Joshua Ojerinde"
        },
        {
            position : "Public Relations",
            name : "Olamide Akinola"
        },
        {
            position : "Logistics Team Lead",
            name : "Kemi Falola"
        },
        {
            position : "Health and Safety Consultant",
            name : "Bolaji Ogunbunmi"
        },
        {
            position : "Quality Control",
            name : "Favour Akinsanya"
        },
        {
            position : "Information Technology",
            name : "Tolu Thomas"
        },
    ],
    partners : [
        {
            uri : "../assets/alstein.webp",
            name : "ALSTEIN",
        },
        {
            uri : "../assets/adels.webp",
            name : "Adels",
        },
        {
            uri : "../assets/alstein.webp",
            name : "SageIQ",
        },
        {
            uri : "../assets/adels.webp",
            name : "The Vemoye Foundation",
        },
    ],

}



