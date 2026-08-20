"use client"
import React, { useState } from 'react'
import { useAppContext } from '@/hooks/useAppContext'
import { toast } from 'sonner'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { FcGoogle } from 'react-icons/fc'
import { googleSignIn } from './googlesignin'
import Login, { LoginForm } from './login'


interface SignupProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  onLoginClick?: () => void;
}

export const SignupForm = ({ onLoginClick }: { onLoginClick?: () => void }) => {
  const { setUser } = useAppContext();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    avatarUrl: '',
  });
  const [editId, setEditId] = useState(null);

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      avatarUrl: '',
    });
    setEditId(null);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      let response;
      if (editId) {
        response = await axios.put(`/api/dbhandler?model=user&id=${editId}`, formData);
      } else {
        response = await axios.post('/api/auth/register', formData);
      }

      if (response?.data?.id) {
        setUser(response.data);
        toast.success('Account created successfully');
      }

      resetForm();
    } catch (error: any) {
      console.error("Signup error", error);
      toast.error(error?.response?.data?.error || 'Failed to create account');
    }
  };

  return (
    <div className='flex flex-col justify-center items-center py-5 max-w-5xl mx-auto w-full'>
      <DrawerHeader>
        <DrawerTitle className='w-full text-center'>
          Create an account with <span className='text-primary'>HealthClique</span>
        </DrawerTitle>
        <DrawerDescription></DrawerDescription>
      </DrawerHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-secondary rounded-xl max-w-xl w-full">
        <Input
          type="text"
          placeholder="Full Name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          type="email"
          placeholder="Email address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <DrawerFooter className="flex flex-row w-full gap-2 mt-2 px-0">
          <Button type="submit" className="flex-1 w-full">
            {editId ? 'Update' : 'Sign up'} →
          </Button>
        </DrawerFooter>
      </form>

      <div className="w-full my-4 flex flex-col gap-2">
        <form action={googleSignIn}>
          <Button
            className="border-2 border-primary relative w-full max-w-[300px] mx-auto flex items-center justify-center rounded-md h-10 font-medium gap-2"
            type="submit"
            variant='outline'
          >
            <FcGoogle className="h-4 w-4" />
            <span className="text-sm">Continue with Google</span>
          </Button>
        </form>
        {onLoginClick ? (
            <div className="flex justify-center mt-2">
                <Button variant="link" onClick={onLoginClick} className="text-primary font-bold">
                    Already have an account? Login
                </Button>
            </div>
        ) : (
            <div className="max-w-[300px] mx-auto w-full my-2 rounded-md font-medium flex justify-center items-center">
              <Login />
            </div>
        )}
      </div>
    </div>
  );
};

const Signup = ({ open: controlledOpen, onOpenChange: setControlledOpen, hideTrigger }: SignupProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

  return (
    <div className='inline w-full'>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        {!hideTrigger && (
          <DrawerTrigger asChild className='w-full'>
            <Button variant="outline" className='w-full'>Sign up</Button>
          </DrawerTrigger>
        )}
        <DrawerContent className='overflow-y-auto max-h-[90vh] bg-background'>
           <div className='px-4 pb-8'>
             {mode === "signup" ? (
               <SignupForm onLoginClick={() => setMode("login")} />
             ) : (
               <LoginForm onSignupClick={() => setMode("signup")} />
             )}
           </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}


export default Signup
