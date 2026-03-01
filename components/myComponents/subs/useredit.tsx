"use client";
import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/hooks/useAppContext";
import axios from "axios";
import UserShippingAddressForm from "@/prisma/forms/userShippingAddressForm";

type ShippingAddress = {
  id?: string;
  country: string;
  state: string;
  city: string;
  address: string;
  zip?: string;
  phone?: string;
};

const EditUser = () => {
  const { user, setUser } = useAppContext();

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    contact: "",
    role: "user",
    image: "",
  });

  const [addressData, setAddressData] = useState<ShippingAddress>({
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        name: user.name || "",
        contact: user.contact || "",
        role: user.role || "user",
        image: user.image || "",
      });

      if (user.addresses?.[0]) {
        setAddressData(user.addresses[0]);
      }

      setEditId(user.id);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Update user
      const userRes = await axios.put(`/api/dbhandler?model=user&id=${editId}`, {
        ...formData,
        id: editId,
      });

      // Update or create shipping address
      let addressRes;
      if (addressData.id) {
        addressRes = await axios.put(
          `/api/dbhandler?model=shippingAddress&id=${addressData.id}`,
          { ...addressData, userId: user.id }
        );
      } else {
        addressRes = await axios.post(
          `/api/dbhandler?model=shippingAddress`,
          { ...addressData, userId: user.id }
        );
      }

      // Update local context
      setUser({
        ...userRes.data,
        addresses: [addressRes.data],
      });

      // Reset form and show success message
      setFormData({
        email: userRes.data.email || "",
        name: userRes.data.name || "",
        contact: userRes.data.contact || "",
        role: userRes.data.role || "user",
        image: userRes.data.image || "",
      });

      setAddressData(addressRes.data);

      setSuccessMessage("Profile updated successfully!");

      // Hide message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err: any) {
      console.error("Update failed:", err.response?.data || err);
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="bg-green-500 text-background w-full flex-1 hover:bg-green-500/30">Edit Profile</Button>
      </DrawerTrigger>

      <DrawerContent className="max-w-3xl mx-auto py-10">
        <DrawerHeader>
          <DrawerTitle className="text-center">Edit Profile</DrawerTitle>
        </DrawerHeader>

        {successMessage && (
          <div className="p-3 mb-4 text-green-800 bg-green-100 rounded">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-secondary rounded-xl">
          {/* User fields */}
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            type="text"
            placeholder="Contact"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          />

          {/* Shipping Address */}
          <UserShippingAddressForm
            userId={user.id}
            existing={addressData}
            onSaved={(addr) => setAddressData(addr)}
          />

          <DrawerFooter className="flex gap-2 mt-4">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1">Cancel</Button>
            </DrawerClose>
            <Button type="submit" className="flex-1">Update &rarr;</Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default EditUser;
