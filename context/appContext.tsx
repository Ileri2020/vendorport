"use client";
import { UserProps } from "@/types/user";
import { VideoType } from "@/types/videoType";
import React, { createContext, useState, ReactNode } from "react";


interface Comment {
  id: number | string;
  contentId: string; // videoId
  userId: number | string;
  username: string;
  comment: string;
  createdAt: string | Date;
}

// Dialog Configuration Interface
export interface DialogConfig {
  isOpen: boolean;
  title: string;
  description: string;
  variant?: "default" | "destructive" | "success"; // Optional for styling
}

interface AppContextProps {
  // isDark: boolean;
  // setIsDark: (isDark: boolean) => void;
  isList: boolean;
  setIsList: (isList: boolean) => void;
  videos: VideoType[];
  setVideos: (videos: VideoType[]) => void;
  selectedVideo: VideoType | null;
  setSelectedVideo: (selVideo: VideoType) => void;
  // user: UserProps;
  // setUser: (user: UserProps) => void;
  user: any;
  setUser: (user: any) => void;
  cart: any[]//UserProps;
  setCart: (cart: any[]) => void;
  isModal: boolean;
  setIsModal: (isModal: boolean) => void;
  useMock: boolean;
  setUseMock: (useMock: boolean) => void;
  comments: any;
  setComments: (comments: any) => void;

  // Global Dialog Props
  dialogConfig: DialogConfig;
  setDialogConfig: (config: DialogConfig) => void;
  openDialog: (description: string, title?: string) => void;
  closeDialog: () => void;

  // Business Specific Settings
  currentBusiness: any;
  setCurrentBusiness: (business: any) => void;
}

export const AppContext = createContext<AppContextProps | null>(null);

export const AppContextProvider: React.FC<any> = ({ children }) => {
  // const [isDark, setIsDark] = useState(false);
  const [isList, setIsList] = useState(true);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [user, setUser] = useState<any>({ name: "visitor", id: "nil", email: "nil", image: "https://res.cloudinary.com/dc5khnuiu/image/upload/v1752627019/uxokaq0djttd7gsslwj9.png", role: "user", contact: "xxxx", addresses: [], shippingAddress: null });
  const [cart, setCart] = useState<any[]>([]);
  const [isModal, setIsModal] = useState(false);
  const [useMock, setUseMock] = useState(true);
  const [comments, setComments] = useState([])
  const [currentBusiness, setCurrentBusiness] = useState<any>(null);

  // Global Dialog State
  const [dialogConfig, setDialogConfig] = useState<DialogConfig>({
    isOpen: false,
    title: "",
    description: "",
  });

  const openDialog = (description: string, title: string = "Notification") => {
    setDialogConfig({
      isOpen: true,
      title,
      description,
    });
  };

  const closeDialog = () => {
    setDialogConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const appContextValues: AppContextProps = {
    // isDark,
    // setIsDark,
    isList,
    setIsList,
    videos,
    setVideos,
    comments,
    setComments,
    selectedVideo,
    setSelectedVideo,
    user,
    setUser,
    cart,
    setCart,
    isModal,
    setIsModal,
    useMock,
    setUseMock,

    // Global Dialog Values
    dialogConfig,
    setDialogConfig,
    openDialog,
    closeDialog,

    // Business Specific Settings
    currentBusiness,
    setCurrentBusiness,
  };

  return (
    <AppContext.Provider value={appContextValues}>
      {children}
    </AppContext.Provider>
  );
};
